import fs from "fs";
import http from "http";
import path from "path";
import { BatchQueueManager } from "./queueManager";
import { AgentProvider } from "./types";
import { renderStudioHtml } from "./ui";

const PORT = Number(process.env.STUDIO_PORT || process.env.PORT || 4455);
const WORKSPACE_ROOT = path.resolve(__dirname, "../..");

function parseJsonBody(req: http.IncomingMessage): Promise<Record<string, any>> {
  return new Promise((resolve) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk.toString("utf-8");
      if (raw.length > 1_000_000) {
        req.destroy();
      }
    });
    req.on("end", () => {
      if (!raw.trim()) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve({});
      }
    });
    req.on("error", () => resolve({}));
  });
}

function sendJson(
  res: http.ServerResponse,
  statusCode: number,
  data: unknown
): void {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(data));
}

function serveVideoFile(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  filePath: string
): void {
  if (!fs.existsSync(filePath)) {
    sendJson(res, 404, { error: "Video file not found" });
    return;
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    if (start >= fileSize || end >= fileSize) {
      res.writeHead(416, { "Content-Range": `bytes */${fileSize}` });
      res.end();
      return;
    }
    const chunkSize = end - start + 1;
    const file = fs.createReadStream(filePath, { start, end });
    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize,
      "Content-Type": "video/mp4",
    });
    file.pipe(res);
  } else {
    res.writeHead(200, {
      "Content-Length": fileSize,
      "Content-Type": "video/mp4",
      "Accept-Ranges": "bytes",
    });
    fs.createReadStream(filePath).pipe(res);
  }
}

export function createStudioServer(workspaceRoot = WORKSPACE_ROOT) {
  const queueManager = new BatchQueueManager(workspaceRoot);
  const sseClients = new Set<http.ServerResponse>();

  queueManager.on("state", (snapshot) => {
    const payload = `data: ${JSON.stringify(snapshot)}\n\n`;
    for (const client of sseClients) {
      try {
        client.write(payload);
      } catch {
        sseClients.delete(client);
      }
    }
  });

  const server = http.createServer(async (req, res) => {
    const urlObj = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
    const pathname = urlObj.pathname;
    const method = req.method || "GET";

    // 1. Main Studio UI
    if (method === "GET" && pathname === "/") {
      res.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      });
      res.end(renderStudioHtml());
      return;
    }

    // 2. SSE Real-time Event Stream
    if (method === "GET" && pathname === "/api/events") {
      res.writeHead(200, {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      });
      res.write(`data: ${JSON.stringify(queueManager.getSnapshot())}\n\n`);
      sseClients.add(res);
      req.on("close", () => {
        sseClients.delete(res);
      });
      return;
    }

    // 3. Snapshot JSON API
    if (method === "GET" && pathname === "/api/state") {
      sendJson(res, 200, queueManager.getSnapshot());
      return;
    }

    // 4. Stream Rendered MP4 Videos from out/
    if (method === "GET" && pathname.startsWith("/out/")) {
      const safeName = path.basename(decodeURIComponent(pathname.slice(5)));
      if (!safeName.endsWith(".mp4")) {
        sendJson(res, 400, { error: "Only .mp4 files are served" });
        return;
      }
      const mp4Path = path.join(workspaceRoot, "out", safeName);
      serveVideoFile(req, res, mp4Path);
      return;
    }

    // 5. Add Batch Problems
    if (method === "POST" && pathname === "/api/jobs/batch") {
      const body = await parseJsonBody(req);
      const batchText = String(body.batchText || "");
      const agent = (body.agent as AgentProvider) || undefined;
      const model = body.model ? String(body.model) : undefined;
      const autoStart = body.autoStart !== false;

      if (agent || model) {
        queueManager.setDefaults(agent, model);
      }

      const added = queueManager.addBatchProblems(batchText, {
        agent,
        model,
        autoStart,
      });

      sendJson(res, 200, {
        ok: true,
        addedCount: added.length,
        added,
        state: queueManager.getSnapshot(),
      });
      return;
    }

    // 6. Queue Controls (Start / Pause)
    if (method === "POST" && pathname === "/api/queue/start") {
      queueManager.startQueue();
      sendJson(res, 200, { ok: true, state: queueManager.getSnapshot() });
      return;
    }

    if (method === "POST" && pathname === "/api/queue/pause") {
      const body = await parseJsonBody(req);
      queueManager.pauseQueue(Boolean(body.afterCurrent));
      sendJson(res, 200, { ok: true, state: queueManager.getSnapshot() });
      return;
    }

    // 7. Per-Job Actions: /api/jobs/:id/:action
    const jobActionMatch = pathname.match(/^\/api\/jobs\/([^/]+)\/([a-z]+)$/i);
    if (method === "POST" && jobActionMatch) {
      const jobId = decodeURIComponent(jobActionMatch[1]);
      const action = jobActionMatch[2].toLowerCase();
      const body = await parseJsonBody(req);

      let ok = false;
      let extraData: Record<string, any> = {};
      switch (action) {
        case "pause":
          ok = queueManager.pauseJob(jobId);
          break;
        case "resume":
          ok = queueManager.resumeJob(jobId);
          break;
        case "cancel":
          ok = queueManager.cancelJob(jobId);
          break;
        case "retry":
          ok = queueManager.retryJob(jobId);
          break;
        case "remove": {
          const resRemove = queueManager.removeJob(jobId);
          ok = resRemove.ok;
          if (resRemove.deleted) {
            extraData.deleted = resRemove.deleted;
          }
          break;
        }
        case "move":
          ok = queueManager.moveJob(
            jobId,
            body.direction === "down" ? "down" : "up"
          );
          break;
        default:
          sendJson(res, 400, { error: `Unknown job action: ${action}` });
          return;
      }

      sendJson(res, 200, {
        ok,
        ...extraData,
        state: queueManager.getSnapshot(),
      });
      return;
    }

    sendJson(res, 404, { error: "Not found" });
  });

  return { server, queueManager };
}

if (require.main === module) {
  const { server } = createStudioServer(WORKSPACE_ROOT);
  server.listen(PORT, () => {
    console.log(
      `\n🚀 Visual-Leet Batch Studio đang chạy tại: http://localhost:${PORT}\n`
    );
  });
}
