/**
 * Returns the complete self-contained HTML/CSS/JS single-page application
 * for the Visual-Leet Batch Video Studio UI in Neo-Brutal Sketch style.
 * Strictly fitted to 100vw x 100vh with zero horizontal overflow.
 */
export function renderStudioHtml(): string {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Visual-Leet Batch Studio — Sketch Edition</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700;800;900&family=JetBrains+Mono:wght@500;600;700&family=Montserrat:wght@800;900&family=Playfair+Display:ital,wght@1,600;1,700&display=swap" rel="stylesheet">
  <style>
    :root {
      --ink: #0f172a;
      --ink-soft: #334155;
      --ink-muted: #64748b;
      --paper: #ffffff;
      --paper-warm: #f8fafc;
      --paper-tint: #f1f5f9;
      --blue: #0284c7;
      --blue-strong: #2563eb;
      --blue-bg: #eff6ff;
      --green: #16a34a;
      --green-bg: #f0fdf4;
      --amber: #d97706;
      --amber-bg: #fffbeb;
      --red: #dc2626;
      --red-bg: #fef2f2;
      --purple: #7c3aed;
      --yellow: #ffe600;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    html, body {
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      font-family: "Chalkboard SE", "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
      color: var(--ink);
      background-color: #ffffff;
      background-image: radial-gradient(#cbd5e1 1.35px, transparent 1.35px);
      background-size: 24px 24px;
      -webkit-font-smoothing: antialiased;
    }

    /* Top Royal Blue Progress Strip (matching video top bar) */
    .top-accent-bar {
      width: 100%;
      height: 6px;
      background: linear-gradient(90deg, #2563eb, #0284c7, #16a34a);
      flex-shrink: 0;
    }

    /* Viewport-Locked App Shell */
    .app-shell {
      width: 100%;
      height: calc(100vh - 6px);
      max-width: 1680px;
      margin: 0 auto;
      padding: 12px 18px 14px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      overflow: hidden;
    }

    /* Sketch Header Bar */
    .header-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      background: var(--paper);
      border: 2.5px solid var(--ink);
      border-radius: 18px 6px 18px 6px;
      box-shadow: 4px 4px 0px var(--ink);
      padding: 10px 16px;
      flex-shrink: 0;
      min-width: 0;
    }

    .brand-group {
      display: flex;
      align-items: center;
      gap: 14px;
      min-width: 0;
      flex-wrap: wrap;
    }

    .channel-badge {
      background-color: var(--ink);
      color: #ffffff;
      padding: 4px 12px;
      border-radius: 6px 12px 6px 12px;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.05em;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      white-space: nowrap;
      font-family: "Inter", sans-serif;
    }

    .channel-badge .tri {
      color: #38bdf8;
      font-size: 13px;
    }

    .brand-heading {
      display: flex;
      align-items: baseline;
      gap: 8px;
      white-space: nowrap;
    }

    .brand-main {
      font-family: "Montserrat", "Inter", sans-serif;
      font-size: 22px;
      font-weight: 900;
      color: var(--ink);
      letter-spacing: -0.03em;
      text-transform: uppercase;
    }

    .brand-sub {
      font-family: "Playfair Display", Georgia, serif;
      font-size: 23px;
      font-style: italic;
      font-weight: 700;
      color: var(--blue);
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      justify-content: flex-end;
    }

    .stat-pill {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 4px 10px;
      border: 2px solid var(--ink);
      border-radius: 999px;
      font-size: 12px;
      font-weight: 800;
      background: var(--paper);
      box-shadow: 2px 2px 0px var(--ink);
      white-space: nowrap;
      font-family: "Inter", sans-serif;
    }

    .stat-pill.running { background: var(--blue-bg); border-color: var(--blue-strong); color: var(--blue-strong); box-shadow: 2px 2px 0px var(--blue-strong); }
    .stat-pill.paused { background: var(--amber-bg); border-color: var(--amber); color: var(--amber); box-shadow: 2px 2px 0px var(--amber); }
    .stat-pill.completed { background: var(--green-bg); border-color: var(--green); color: var(--green); box-shadow: 2px 2px 0px var(--green); }

    .sse-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 11px;
      border: 2px solid var(--ink);
      border-radius: 12px 4px 12px 4px;
      background: #f0fdf4;
      font-size: 11.5px;
      font-weight: 800;
      white-space: nowrap;
      box-shadow: 2px 2px 0px var(--ink);
    }

    .sse-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--green);
      border: 1.5px solid var(--ink);
    }

    /* Main 2-Column Workspace (strictly fitted to remaining height) */
    .workspace-grid {
      flex: 1;
      min-height: 0;
      min-width: 0;
      display: grid;
      grid-template-columns: 350px minmax(0, 1fr);
      gap: 14px;
      overflow: hidden;
    }

    @media (max-width: 980px) {
      html, body {
        height: auto;
        overflow-y: auto;
      }
      .app-shell {
        height: auto;
        overflow: visible;
      }
      .workspace-grid {
        grid-template-columns: minmax(0, 1fr);
        overflow: visible;
      }
    }

    /* Left Panel: Sketch Batch Composer */
    .composer-card {
      background: var(--paper);
      border: 2.5px solid var(--ink);
      border-radius: 20px 8px 20px 8px;
      box-shadow: 5px 5px 0px var(--ink);
      padding: 14px 15px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      height: 100%;
      min-height: 0;
      min-width: 0;
      overflow-y: auto;
    }

    .card-header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      flex-shrink: 0;
    }

    .card-title {
      font-size: 15px;
      font-weight: 800;
      color: var(--ink);
      display: flex;
      align-items: center;
      gap: 6px;
      white-space: nowrap;
    }

    .helper-text {
      font-size: 12px;
      color: var(--ink-soft);
      line-height: 1.4;
      flex-shrink: 0;
    }

    .helper-text code {
      font-family: "JetBrains Mono", monospace;
      background: var(--paper-tint);
      padding: 1px 5px;
      border-radius: 4px;
      border: 1px solid #cbd5e1;
      font-size: 11px;
    }

    .field-label {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--ink-soft);
      display: block;
      margin-bottom: 4px;
      font-family: "Inter", sans-serif;
    }

    .textarea-wrap {
      flex: 1;
      min-height: 105px;
      display: flex;
      flex-direction: column;
    }

    textarea.sketch-textarea {
      width: 100%;
      flex: 1;
      min-height: 95px;
      background: var(--paper-warm);
      border: 2px solid var(--ink);
      border-radius: 12px 4px 12px 4px;
      box-shadow: inset 2px 2px 0px rgba(15, 23, 42, 0.06);
      padding: 9px 11px;
      color: var(--ink);
      font-family: "JetBrains Mono", monospace;
      font-size: 12px;
      line-height: 1.5;
      resize: none;
      outline: none;
    }

    textarea.sketch-textarea:focus {
      background: #ffffff;
      border-color: var(--blue-strong);
      box-shadow: 3px 3px 0px var(--blue-strong);
    }

    .parsed-chips-box {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
      max-height: 54px;
      overflow-y: auto;
      padding: 2px 0;
      flex-shrink: 0;
    }

    .sketch-chip {
      font-family: "JetBrains Mono", monospace;
      font-size: 11px;
      font-weight: 700;
      background: var(--blue-bg);
      color: var(--blue-strong);
      border: 1.5px solid var(--blue-strong);
      border-radius: 8px 3px 8px 3px;
      padding: 2px 7px;
      white-space: nowrap;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .select-grid {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      gap: 8px;
      flex-shrink: 0;
    }

    select.sketch-select {
      width: 100%;
      background: var(--paper);
      border: 2px solid var(--ink);
      border-radius: 8px 3px 8px 3px;
      box-shadow: 2px 2px 0px var(--ink);
      padding: 6px 8px;
      font-size: 12px;
      font-weight: 700;
      color: var(--ink);
      outline: none;
      cursor: pointer;
    }

    .composer-buttons {
      display: flex;
      flex-direction: column;
      gap: 7px;
      flex-shrink: 0;
    }

    /* Neo-Brutal Sketch Buttons */
    button.sketch-btn, a.sketch-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 8px 12px;
      font-family: "Inter", sans-serif;
      font-size: 12.5px;
      font-weight: 800;
      color: var(--ink);
      background: var(--paper);
      border: 2px solid var(--ink);
      border-radius: 10px 4px 10px 4px;
      box-shadow: 3px 3px 0px var(--ink);
      cursor: pointer;
      text-decoration: none;
      white-space: nowrap;
      transition: transform 0.08s ease, box-shadow 0.08s ease;
      user-select: none;
    }

    button.sketch-btn:hover:not(:disabled), a.sketch-btn:hover {
      transform: translate(-1px, -1px);
      box-shadow: 4px 4px 0px var(--ink);
    }

    button.sketch-btn:active:not(:disabled), a.sketch-btn:active {
      transform: translate(2px, 2px);
      box-shadow: 1px 1px 0px var(--ink);
    }

    button.sketch-btn:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }

    .btn-blue {
      background: var(--blue-strong) !important;
      color: #ffffff !important;
    }

    .btn-yellow {
      background: var(--yellow) !important;
      color: var(--ink) !important;
    }

    .btn-green {
      background: #4ade80 !important;
      color: var(--ink) !important;
    }

    .btn-amber {
      background: #fde047 !important;
      color: var(--ink) !important;
    }

    .btn-red {
      background: #fecaca !important;
      color: #991b1b !important;
    }

    .btn-sm {
      padding: 5px 9px !important;
      font-size: 11.5px !important;
      border-radius: 8px 3px 8px 3px !important;
      box-shadow: 2px 2px 0px var(--ink) !important;
    }

    .sketch-note {
      background: #fefce8;
      border: 2px dashed var(--amber);
      border-radius: 12px 4px 12px 4px;
      padding: 8px 10px;
      font-size: 11.5px;
      color: var(--ink-soft);
      line-height: 1.4;
      flex-shrink: 0;
    }

    .sketch-note strong {
      color: var(--ink);
      display: block;
      margin-bottom: 2px;
    }

    /* Right Column: Queue Master Bar + Scrollable Jobs List */
    .right-column {
      display: flex;
      flex-direction: column;
      gap: 12px;
      height: 100%;
      min-height: 0;
      min-width: 0;
      overflow: hidden;
    }

    /* Master Queue Control Card */
    .master-card {
      background: var(--paper);
      border: 2.5px solid var(--ink);
      border-radius: 8px 20px 8px 20px;
      box-shadow: 4px 4px 0px var(--ink);
      padding: 11px 15px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      flex-shrink: 0;
      min-width: 0;
    }

    .master-row-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      flex-wrap: wrap;
      min-width: 0;
    }

    .master-status-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
      flex: 1;
    }

    .master-tag {
      background: var(--ink);
      color: var(--yellow);
      font-family: "JetBrains Mono", monospace;
      font-size: 11px;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 6px;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .master-status-text {
      font-size: 13px;
      font-weight: 800;
      color: var(--ink);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      min-width: 0;
    }

    .master-controls {
      display: flex;
      align-items: center;
      gap: 7px;
      flex-wrap: wrap;
      flex-shrink: 0;
    }

    .master-progress-row {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
    }

    .sketch-progress-track {
      flex: 1;
      height: 12px;
      background: var(--paper-tint);
      border: 2px solid var(--ink);
      border-radius: 999px;
      overflow: hidden;
      min-width: 0;
    }

    .sketch-progress-fill {
      height: 100%;
      background: repeating-linear-gradient(
        -45deg,
        #2563eb,
        #2563eb 10px,
        #0284c7 10px,
        #0284c7 20px
      );
      border-right: 2px solid var(--ink);
      transition: width 0.3s ease;
    }

    .sketch-progress-fill.done {
      background: #22c55e;
    }

    .pct-badge {
      font-family: "JetBrains Mono", monospace;
      font-size: 12px;
      font-weight: 800;
      color: var(--ink);
      background: var(--yellow);
      border: 2px solid var(--ink);
      border-radius: 6px;
      padding: 1px 7px;
      white-space: nowrap;
      flex-shrink: 0;
    }

    /* Scrollable Jobs Container */
    .jobs-scroll-area {
      flex: 1;
      min-height: 0;
      min-width: 0;
      overflow-y: auto;
      overflow-x: hidden;
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding-right: 4px;
      padding-bottom: 8px;
    }

    .jobs-scroll-area::-webkit-scrollbar {
      width: 7px;
    }
    .jobs-scroll-area::-webkit-scrollbar-track {
      background: transparent;
    }
    .jobs-scroll-area::-webkit-scrollbar-thumb {
      background: #94a3b8;
      border-radius: 99px;
    }

    /* Individual Problem Sketch Card */
    .job-sketch-card {
      background: var(--paper);
      border: 2.5px solid var(--ink);
      border-radius: 18px 6px 18px 6px;
      box-shadow: 4px 4px 0px var(--ink);
      padding: 12px 14px;
      display: flex;
      flex-direction: column;
      gap: 9px;
      min-width: 0;
      width: 100%;
      flex-shrink: 0;
    }

    .job-sketch-card.status-running {
      border-color: var(--blue-strong);
      box-shadow: 5px 5px 0px var(--blue-strong);
      background: #f8fbff;
    }

    .job-sketch-card.status-paused {
      border-color: var(--amber);
      box-shadow: 4px 4px 0px var(--amber);
      background: #fffdf5;
    }

    .job-sketch-card.status-completed {
      border-color: var(--ink);
      box-shadow: 4px 4px 0px #16a34a;
    }

    .job-sketch-card.status-failed {
      border-color: var(--red);
      box-shadow: 4px 4px 0px var(--red);
    }

    .job-top-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      flex-wrap: wrap;
      min-width: 0;
    }

    .job-identity {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
      flex: 1;
      flex-wrap: wrap;
    }

    .status-tag {
      font-family: "Inter", sans-serif;
      font-size: 11px;
      font-weight: 900;
      padding: 3px 9px;
      border: 2px solid var(--ink);
      border-radius: 8px 3px 8px 3px;
      box-shadow: 2px 2px 0px var(--ink);
      text-transform: uppercase;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .status-tag.running { background: #38bdf8; color: var(--ink); }
    .status-tag.paused { background: #fde047; color: var(--ink); }
    .status-tag.queued { background: var(--paper-tint); color: var(--ink-soft); }
    .status-tag.completed { background: #4ade80; color: var(--ink); }
    .status-tag.failed, .status-tag.cancelled { background: #fca5a5; color: var(--ink); }

    .job-title-link {
      font-family: "Montserrat", "Inter", sans-serif;
      font-size: 16px;
      font-weight: 900;
      color: var(--ink);
      text-decoration: none;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
    }
    .job-title-link:hover {
      color: var(--blue-strong);
      text-decoration: underline;
    }

    .meta-tag {
      font-family: "JetBrains Mono", monospace;
      font-size: 11px;
      font-weight: 700;
      color: var(--ink-soft);
      background: var(--paper-tint);
      border: 1.5px solid #cbd5e1;
      border-radius: 6px;
      padding: 1px 6px;
      white-space: nowrap;
    }

    .meta-tag.green {
      background: var(--green-bg);
      color: var(--green);
      border-color: #86efac;
    }

    .job-btn-Cluster {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
      flex-shrink: 0;
    }

    /* Action & Progress Strip */
    .job-action-strip {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      background: var(--paper-warm);
      border: 1.5px solid #cbd5e1;
      border-radius: 8px;
      padding: 5px 10px;
      min-width: 0;
    }

    .job-action-msg {
      font-size: 12px;
      font-weight: 700;
      color: var(--ink-soft);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      min-width: 0;
      flex: 1;
    }

    /* 5-Phase Grid: strictly minmax(0, 1fr) so it NEVER overflows */
    .phases-5-grid {
      display: grid;
      grid-template-columns: repeat(5, minmax(0, 1fr));
      gap: 7px;
      width: 100%;
      min-width: 0;
    }

    @media (max-width: 680px) {
      .phases-5-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    .phase-card {
      background: var(--paper-warm);
      border: 2px solid #cbd5e1;
      border-radius: 10px 4px 10px 4px;
      padding: 6px 8px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 0;
      overflow: hidden;
    }

    .phase-card.active {
      background: var(--blue-bg);
      border-color: var(--blue-strong);
      box-shadow: 2px 2px 0px var(--blue-strong);
    }

    .phase-card.done {
      background: var(--green-bg);
      border-color: var(--green);
      box-shadow: 2px 2px 0px var(--green);
    }

    .phase-card-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 4px;
      font-family: "Inter", sans-serif;
      font-size: 11px;
      font-weight: 800;
      color: var(--ink);
      min-width: 0;
    }

    .phase-name {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      min-width: 0;
    }

    .phase-pct {
      font-family: "JetBrains Mono", monospace;
      font-size: 10.5px;
      flex-shrink: 0;
    }

    .phase-bar-bg {
      width: 100%;
      height: 5px;
      background: #e2e8f0;
      border-radius: 99px;
      overflow: hidden;
      border: 1px solid rgba(15, 23, 42, 0.2);
    }

    .phase-bar-fill {
      height: 100%;
      background: var(--blue-strong);
      transition: width 0.3s ease;
    }

    .phase-card.done .phase-bar-fill {
      background: var(--green);
    }

    .phase-sub {
      font-size: 10.5px;
      color: var(--ink-muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      min-width: 0;
    }

    /* Live Terminal Logs Box */
    .sketch-logs-drawer {
      background: #0f172a;
      color: #f8fafc;
      border: 2px solid var(--ink);
      border-radius: 10px 4px 10px 4px;
      padding: 8px 10px;
      max-height: 155px;
      overflow-y: auto;
      font-family: "JetBrains Mono", monospace;
      font-size: 11px;
      display: none;
    }

    .sketch-logs-drawer.open {
      display: block;
    }

    .log-row {
      padding: 2px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      word-break: break-word;
    }
    .log-ts { color: #94a3b8; margin-right: 6px; }
    .log-tool { color: #38bdf8; }
    .log-thought { color: #c084fc; }
    .log-success { color: #4ade80; font-weight: 700; }
    .log-error { color: #f87171; font-weight: 700; }

    /* Empty State Sketch Box */
    .empty-sketch {
      background: var(--paper);
      border: 2.5px dashed var(--ink);
      border-radius: 20px 8px 20px 8px;
      padding: 36px 24px;
      text-align: center;
      color: var(--ink-soft);
      font-size: 14px;
      font-weight: 700;
    }

    /* Video Preview Modal */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.65);
      backdrop-filter: blur(4px);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      padding: 16px;
    }
    .modal-backdrop.open {
      display: flex;
    }
    .modal-sketch-card {
      background: var(--paper);
      border: 3px solid var(--ink);
      border-radius: 22px 8px 22px 8px;
      box-shadow: 8px 8px 0px var(--ink);
      padding: 14px 16px;
      max-width: 460px;
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .modal-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .modal-video {
      width: 100%;
      max-height: 75vh;
      border: 2.5px solid var(--ink);
      border-radius: 12px;
      background: #000;
    }

    /* Subtle Bottom-Right Watermark */
    .corner-watermark {
      position: fixed;
      bottom: 8px;
      right: 16px;
      display: flex;
      align-items: center;
      gap: 5px;
      opacity: 0.25;
      pointer-events: none;
      user-select: none;
      font-family: "Inter", sans-serif;
      font-size: 12px;
      font-weight: 800;
      z-index: 1;
    }
  </style>
</head>
<body>
  <div class="top-accent-bar"></div>

  <div class="app-shell">
    <!-- Top Header Bar -->
    <header class="header-bar">
      <div class="brand-group">
        <div class="channel-badge">
          <span class="tri">▲</span>
          <span>Leetcode Mô Phỏng · Batch Studio</span>
        </div>
        <div class="brand-heading">
          <span class="brand-main">VISUAL-LEET</span>
          <span class="brand-sub">Studio</span>
        </div>
      </div>

      <div class="header-right">
        <div class="stat-pill">Tổng: <strong id="statTotal">0</strong></div>
        <div class="stat-pill running">Đang chạy: <strong id="statRunning">0</strong></div>
        <div class="stat-pill paused">Tạm dừng: <strong id="statPaused">0</strong></div>
        <div class="stat-pill">Chờ: <strong id="statQueued">0</strong></div>
        <div class="stat-pill completed">Hoàn tất: <strong id="statCompleted">0</strong></div>
        <div class="sse-pill">
          <span class="sse-dot" id="sseDot"></span>
          <span id="sseStatusText">Live SSE</span>
        </div>
      </div>
    </header>

    <!-- 2-Column Fitted Workspace -->
    <div class="workspace-grid">
      <!-- Left Column: Batch Input Composer -->
      <aside class="composer-card">
        <div class="card-header-row">
          <div class="card-title">✏️ Thêm Batch Bài Toán</div>
          <button class="sketch-btn btn-yellow btn-sm" id="fillSampleBtn" type="button">
            ✨ Mẫu 5 bài
          </button>
        </div>

        <p class="helper-text">
          Dán 4–5+ link LeetCode, số bài (<code>146. LRU Cache</code>) hoặc tên bài (mỗi dòng 1 bài).
        </p>

        <div class="textarea-wrap">
          <label class="field-label" for="batchTextarea">Danh sách bài toán (1 bài / dòng)</label>
          <textarea
            id="batchTextarea"
            class="sketch-textarea"
            placeholder="https://leetcode.com/problems/trapping-rain-water/&#10;https://leetcode.com/problems/lru-cache/&#10;https://leetcode.com/problems/coin-change/&#10;https://leetcode.com/problems/number-of-islands/&#10;https://leetcode.com/problems/course-schedule/"
          ></textarea>
        </div>

        <div class="parsed-chips-box" id="parsedPreview"></div>

        <div class="select-grid">
          <div>
            <label class="field-label" for="agentSelect">Agent CLI</label>
            <select id="agentSelect" class="sketch-select">
              <option value="agy">Antigravity (agy)</option>
              <option value="claude">Claude Code</option>
              <option value="codex">Codex CLI</option>
            </select>
          </div>
          <div>
            <label class="field-label" for="modelSelect">Model</label>
            <select id="modelSelect" class="sketch-select">
              <option value="default">Mặc định</option>
              <option value="gemini-3.8-flash-high">Gemini 3.8 Flash (High)</option>
              <option value="gemini-4-argon-high">Gemini 4 Argon (High)</option>
              <option value="gemini-3.8-flash-medium">Gemini 3.8 Flash (Medium)</option>
              <option value="claude-opus-4-6-thinking">Claude Opus 4.6</option>
              <option value="claude-sonnet-4-6">Claude Sonnet 4.6</option>
            </select>
          </div>
        </div>

        <div class="composer-buttons">
          <button class="sketch-btn btn-blue" id="addAndStartBtn" type="button">
            🚀 Thêm & Chạy Liên Tục Ngay
          </button>
          <button class="sketch-btn" id="addOnlyBtn" type="button">
            ➕ Chỉ Thêm Hàng Đợi (Chưa Chạy)
          </button>
        </div>

        <div class="sketch-note">
          <strong>🛡️ Chất lượng đồng đều 100% (Python):</strong>
          Mỗi bài chạy trong một phiên Agent mới độc lập & tự động kiểm tra đủ 5 Phase (Solution Python, Unit Tests, Whisper, 5 Scenes, MP4) trước khi qua bài kế tiếp.
        </div>
      </aside>

      <!-- Right Column: Master Queue Bar + Scrollable Job Cards -->
      <section class="right-column">
        <div class="master-card">
          <div class="master-row-top">
            <div class="master-status-wrap">
              <span class="master-tag">QUEUE</span>
              <span class="master-status-text" id="masterStatusText">Hàng đợi đang sẵn sàng</span>
            </div>

            <div class="master-controls">
              <button class="sketch-btn btn-green btn-sm" id="masterPlayBtn" type="button">
                ▶ Play / Resume
              </button>
              <button class="sketch-btn btn-amber btn-sm" id="masterPauseBtn" type="button">
                ⏸ Tạm Dừng Ngay
              </button>
              <button class="sketch-btn btn-sm" id="masterPauseAfterBtn" type="button">
                ⏯ Dừng Sau Bài Này
              </button>
            </div>
          </div>

          <div class="master-progress-row">
            <div class="sketch-progress-track">
              <div class="sketch-progress-fill" id="masterProgressFill" style="width: 0%"></div>
            </div>
            <span class="pct-badge" id="masterProgressPct">0%</span>
          </div>
        </div>

        <div class="jobs-scroll-area" id="jobsList"></div>
      </section>
    </div>
  </div>

  <div class="corner-watermark">
    <span style="color:#0284c7">▲</span>
    <span>Leetcode mô phỏng</span>
  </div>

  <!-- Video Preview Modal -->
  <div class="modal-backdrop" id="videoModal">
    <div class="modal-sketch-card">
      <div class="modal-head">
        <strong id="modalTitle" style="font-size:14px">🎬 Xem trước Video</strong>
        <button class="sketch-btn btn-sm" id="closeModalBtn" type="button">✕ Đóng</button>
      </div>
      <video id="modalVideoPlayer" class="modal-video" controls playsinline></video>
    </div>
  </div>

  <script>
    let latestState = null;
    const openLogJobIds = new Set();

    const batchTextarea = document.getElementById('batchTextarea');
    const parsedPreview = document.getElementById('parsedPreview');
    const agentSelect = document.getElementById('agentSelect');
    const modelSelect = document.getElementById('modelSelect');

    function parseLinesClient(text) {
      return text
        .split(/[\\r\\n;]+/)
        .map(s => s.replace(/^[-*•]\\s+/, '').trim())
        .filter(Boolean);
    }

    function escapeHtml(str) {
      return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    function updateParsedPreview() {
      const lines = parseLinesClient(batchTextarea.value);
      if (lines.length === 0) {
        parsedPreview.innerHTML = '<span style="font-size:11px;color:#64748b;font-weight:600">Chưa nhập bài toán nào</span>';
        return;
      }
      parsedPreview.innerHTML = lines
        .map((l, idx) => {
          const m = l.match(/leetcode\\.com\\/problems\\/([a-zA-Z0-9-]+)/i);
          const label = m ? m[1].toLowerCase() : l.slice(0, 26);
          return '<span class="sketch-chip">#' + (idx + 1) + ' ' + escapeHtml(label) + '</span>';
        })
        .join('');
    }

    batchTextarea.addEventListener('input', updateParsedPreview);
    updateParsedPreview();

    document.getElementById('fillSampleBtn').addEventListener('click', () => {
      batchTextarea.value = [
        'https://leetcode.com/problems/trapping-rain-water/description/',
        'https://leetcode.com/problems/lru-cache/description/',
        'https://leetcode.com/problems/coin-change/description/',
        'https://leetcode.com/problems/number-of-islands/description/',
        'https://leetcode.com/problems/course-schedule/description/'
      ].join('\\n');
      updateParsedPreview();
    });

    async function apiPost(url, body = {}) {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      return res.json();
    }

    async function submitBatch(autoStart) {
      const text = batchTextarea.value.trim();
      if (!text) {
        batchTextarea.focus();
        return;
      }
      await apiPost('/api/jobs/batch', {
        batchText: text,
        agent: agentSelect.value,
        model: modelSelect.value,
        autoStart,
      });
      batchTextarea.value = '';
      updateParsedPreview();
    }

    document.getElementById('addAndStartBtn').addEventListener('click', () => submitBatch(true));
    document.getElementById('addOnlyBtn').addEventListener('click', () => submitBatch(false));

    document.getElementById('masterPlayBtn').addEventListener('click', () => apiPost('/api/queue/start'));
    document.getElementById('masterPauseBtn').addEventListener('click', () => apiPost('/api/queue/pause', { afterCurrent: false }));
    document.getElementById('masterPauseAfterBtn').addEventListener('click', () => apiPost('/api/queue/pause', { afterCurrent: true }));

    window.jobAction = async function(jobId, action, extra) {
      if (action === 'toggleLogs') {
        if (openLogJobIds.has(jobId)) openLogJobIds.delete(jobId);
        else openLogJobIds.add(jobId);
        if (latestState) renderState(latestState);
        return;
      }
      if (action === 'previewVideo') {
        const modal = document.getElementById('videoModal');
        const player = document.getElementById('modalVideoPlayer');
        document.getElementById('modalTitle').textContent = '🎬 ' + extra.title + ' (' + extra.slug + '.mp4)';
        player.src = '/' + extra.videoFile + '?t=' + Date.now();
        modal.classList.add('open');
        player.play().catch(() => {});
        return;
      }
      if (action === 'remove') {
        const job = (latestState && latestState.jobs) ? latestState.jobs.find(function(j) { return j.id === jobId; }) : null;
        const name = job ? (job.title || job.slug) : 'bài toán này';
        const slug = job ? job.slug : '';
        const msg =
          'Bạn có chắc chắn muốn xoá "' + name + '"?\\n\\n' +
          'Hệ thống sẽ xoá vĩnh viễn:\\n' +
          '• Thư mục mã nguồn: src/problems/' + slug + '/\\n' +
          '• Các file âm thanh tạo riêng trong public/audio/\\n' +
          '• File video kết xuất out/' + slug + '.mp4\\n' +
          '• Khai báo <Composition> trong src/Root.tsx\\n\\n' +
          'Thao tác này dọn sạch 100% context để lần sau tạo lại không bị dính file cũ.';
        if (!window.confirm(msg)) {
          return;
        }

        const modal = document.getElementById('videoModal');
        if (modal && modal.classList.contains('open')) {
          const player = document.getElementById('modalVideoPlayer');
          if (player) {
            player.pause();
            player.src = '';
          }
          modal.classList.remove('open');
        }
      }
      await apiPost('/api/jobs/' + encodeURIComponent(jobId) + '/' + action, extra || {});
    };

    document.getElementById('closeModalBtn').addEventListener('click', () => {
      const modal = document.getElementById('videoModal');
      const player = document.getElementById('modalVideoPlayer');
      player.pause();
      player.src = '';
      modal.classList.remove('open');
    });

    function formatDuration(ms) {
      const totalSec = Math.max(0, Math.floor(ms / 1000));
      const m = Math.floor(totalSec / 60);
      const s = totalSec % 60;
      return m + 'm ' + (s < 10 ? '0' + s : s) + 's';
    }

    function getStatusLabel(status) {
      switch (status) {
        case 'running': return '⚡ ĐANG CHẠY';
        case 'paused': return '⏸ TẠM DỪNG';
        case 'queued': return '⏳ HÀNG ĐỢI';
        case 'completed': return '✓ HOÀN TẤT';
        case 'failed': return '⚠ CẦN CHẠY TIẾP';
        case 'cancelled': return '✕ ĐÃ HỦY';
        default: return status;
      }
    }

    function renderState(state) {
      latestState = state;
      const jobs = state.jobs || [];

      const runningCount = jobs.filter(j => j.status === 'running').length;
      const pausedCount = jobs.filter(j => j.status === 'paused').length;
      const queuedCount = jobs.filter(j => j.status === 'queued').length;
      const completedCount = jobs.filter(j => j.status === 'completed').length;

      document.getElementById('statTotal').textContent = jobs.length;
      document.getElementById('statRunning').textContent = runningCount;
      document.getElementById('statPaused').textContent = pausedCount;
      document.getElementById('statQueued').textContent = queuedCount;
      document.getElementById('statCompleted').textContent = completedCount;

      const avgPct = jobs.length > 0
        ? Math.round(jobs.reduce((acc, j) => acc + (j.overallProgress || 0), 0) / jobs.length)
        : 0;

      document.getElementById('masterProgressPct').textContent = avgPct + '%';
      const masterFill = document.getElementById('masterProgressFill');
      masterFill.style.width = avgPct + '%';
      if (avgPct === 100) masterFill.classList.add('done');
      else masterFill.classList.remove('done');

      const activeJob = jobs.find(j => j.id === state.activeJobId) || jobs.find(j => j.status === 'running');
      const masterStatusEl = document.getElementById('masterStatusText');
      if (activeJob) {
        masterStatusEl.textContent =
          'Đang chạy: ' + activeJob.title + ' (' + activeJob.overallProgress + '%) — ' + activeJob.currentAction;
      } else if (pausedCount > 0) {
        masterStatusEl.textContent = '⏸ Đang tạm dừng — bấm "Play / Resume" để chạy tiếp';
      } else if (queuedCount > 0 && !state.queueRunning) {
        masterStatusEl.textContent = 'Có ' + queuedCount + ' bài trong hàng đợi — bấm Play để bắt đầu';
      } else {
        masterStatusEl.textContent = 'Tất cả bài toán trong danh sách đã hoàn tất ✓';
      }

      const pauseAfterBtn = document.getElementById('masterPauseAfterBtn');
      if (state.pauseAfterCurrent) {
        pauseAfterBtn.textContent = '⏹ Sẽ dừng sau bài này (Bật)';
        pauseAfterBtn.classList.add('btn-amber');
      } else {
        pauseAfterBtn.textContent = '⏯ Dừng Sau Bài Này';
        pauseAfterBtn.classList.remove('btn-amber');
      }

      const container = document.getElementById('jobsList');
      if (jobs.length === 0) {
        container.innerHTML = '<div class="empty-sketch">Chưa có bài toán nào trong danh sách. Hãy dán 4–5 link LeetCode ở khung bên trái để bắt đầu!</div>';
        return;
      }

      const now = Date.now();
      container.innerHTML = jobs.map((job, idx) => {
        const elapsedMs = (job.accumulatedRunMs || 0) + (job.status === 'running' && job.startedAt ? (now - job.startedAt) : 0);
        const showElapsed = elapsedMs > 0 ? '⏱ ' + formatDuration(elapsedMs) : '';
        const durBadge = job.videoDurationSec ? '🎬 ' + job.videoDurationSec.toFixed(1) + 's' : '';
        const phaseOrder = ['phase1_solution', 'phase2_tests', 'phase3_audio', 'phase4_scenes', 'phase5_render'];
        const logsOpen = openLogJobIds.has(job.id) || job.status === 'running';

        const phasesHtml = phaseOrder.map(pid => {
          const p = job.phases[pid];
          if (!p) return '';
          const icon = p.status === 'done' ? '✓' : p.status === 'active' ? '⚡' : '•';
          return \`
            <div class="phase-card \${p.status}" title="\${escapeHtml(p.detail)}">
              <div class="phase-card-head">
                <span class="phase-name">\${icon} \${escapeHtml(p.shortLabel)}</span>
                <span class="phase-pct">\${p.progress}%</span>
              </div>
              <div class="phase-bar-bg">
                <div class="phase-bar-fill" style="width:\${p.progress}%"></div>
              </div>
              <div class="phase-sub">\${escapeHtml(p.detail)}</div>
            </div>
          \`;
        }).join('');

        const logsHtml = (job.logs || []).slice(-50).map(l => \`
          <div class="log-row">
            <span class="log-ts">[\${escapeHtml(l.timestamp)}]</span>
            <span class="log-\${escapeHtml(l.type)}">\${escapeHtml(l.text)}</span>
          </div>
        \`).join('');

        return \`
          <article class="job-sketch-card status-\${job.status}">
            <div class="job-top-bar">
              <div class="job-identity">
                <span class="status-tag \${job.status}">\${getStatusLabel(job.status)}</span>
                <a class="job-title-link" href="\${escapeHtml(job.leetcodeUrl)}" target="_blank" rel="noopener">
                  \${job.problemNumber ? '#' + escapeHtml(job.problemNumber) + '. ' : ''}\${escapeHtml(job.title)}
                </a>
                <span class="meta-tag">\${escapeHtml(job.slug)}</span>
                <span class="meta-tag">\${escapeHtml(job.agent)}</span>
                \${job.model && job.model !== 'default' ? '<span class="meta-tag">' + escapeHtml(job.model) + '</span>' : ''}
                \${showElapsed ? '<span class="meta-tag">' + showElapsed + '</span>' : ''}
                \${durBadge ? '<span class="meta-tag green">' + durBadge + '</span>' : ''}
              </div>

              <div class="job-btn-Cluster">
                \${job.status === 'running' ? \`
                  <button class="sketch-btn btn-amber btn-sm" onclick="jobAction('\${job.id}', 'pause')">⏸ Pause</button>
                \` : ''}
                \${job.status === 'paused' ? \`
                  <button class="sketch-btn btn-green btn-sm" onclick="jobAction('\${job.id}', 'resume')">▶ Resume</button>
                \` : ''}
                \${(job.status === 'failed' || job.status === 'cancelled' || job.status === 'completed') ? \`
                  <button class="sketch-btn btn-sm" onclick="jobAction('\${job.id}', 'retry')">🔄 Chạy lại</button>
                \` : ''}
                \${(job.status === 'running' || job.status === 'queued' || job.status === 'paused') ? \`
                  <button class="sketch-btn btn-red btn-sm" onclick="jobAction('\${job.id}', 'cancel')">✕ Hủy</button>
                \` : ''}
                \${job.videoFile ? \`
                  <button class="sketch-btn btn-blue btn-sm" onclick='jobAction("\${job.id}", "previewVideo", \${JSON.stringify({ title: job.title, slug: job.slug, videoFile: job.videoFile })})'>
                    🎬 Xem Video
                  </button>
                  <a class="sketch-btn btn-sm" href="/\${escapeHtml(job.videoFile)}" download="\${escapeHtml(job.slug)}.mp4">
                    ⬇ MP4
                  </a>
                \` : ''}
                \${job.status === 'queued' && idx > 0 ? \`
                  <button class="sketch-btn btn-sm" onclick="jobAction('\${job.id}', 'move', { direction: 'up' })" title="Đẩy lên trên">↑</button>
                \` : ''}
                <button class="sketch-btn btn-sm" onclick="jobAction('\${job.id}', 'toggleLogs')">
                  📜 Logs (\${(job.logs || []).length})
                </button>
                \${job.status !== 'running' ? \`
                  <button class="sketch-btn btn-sm" onclick="jobAction('\${job.id}', 'remove')" title="Xóa vĩnh viễn bài toán & dọn sạch toàn bộ file liên quan (clean context)">🗑</button>
                \` : ''}
              </div>
            </div>

            <div class="job-action-strip">
              <span class="job-action-msg">\${escapeHtml(job.currentAction)}</span>
              <div style="display:flex;align-items:center;gap:8px;width:190px;flex-shrink:0">
                <div class="sketch-progress-track" style="height:9px">
                  <div class="sketch-progress-fill \${job.overallProgress === 100 ? 'done' : ''}" style="width: \${job.overallProgress}%"></div>
                </div>
                <span class="pct-badge" style="font-size:11px;padding:0 5px">\${job.overallProgress}%</span>
              </div>
            </div>

            <div class="phases-5-grid">
              \${phasesHtml}
            </div>

            <div class="sketch-logs-drawer \${logsOpen ? 'open' : ''}">
              \${logsHtml || '<div style="color:#94a3b8">Chưa có log...</div>'}
            </div>
          </article>
        \`;
      }).join('');
    }

    function connectSSE() {
      const evtSource = new EventSource('/api/events');
      const dot = document.getElementById('sseDot');
      const txt = document.getElementById('sseStatusText');

      evtSource.onopen = () => {
        dot.style.background = '#16a34a';
        txt.textContent = 'Live SSE';
      };

      evtSource.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          renderState(data);
        } catch (err) {
          console.error(err);
        }
      };

      evtSource.onerror = () => {
        dot.style.background = '#d97706';
        txt.textContent = 'Reconnecting...';
      };
    }

    setInterval(() => {
      if (latestState && latestState.jobs && latestState.jobs.some(j => j.status === 'running')) {
        renderState(latestState);
      }
    }, 1000);

    connectSSE();
  </script>
</body>
</html>`;
}
