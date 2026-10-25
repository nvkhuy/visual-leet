import { ParsedProblemInput, PhaseId, PhaseProgress } from "./types";

const ROMAN_NUMERALS = new Set(["i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x"]);
const UPPERCASE_WORDS = new Set(["lru", "lfu", "bst", "bfs", "dfs", "dp", "kth", "ip", "dna", "sql", "api", "url", "id", "2d", "3d", "1d"]);

/**
 * Converts a kebab-case slug like "word-search-ii" or "lru-cache" into
 * a human-readable title like "Word Search II" or "LRU Cache".
 */
export function slugToTitle(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => {
      const lower = word.toLowerCase();
      if (ROMAN_NUMERALS.has(lower) || UPPERCASE_WORDS.has(lower)) {
        return lower.toUpperCase();
      }
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}

/**
 * Parses a single user input string (LeetCode URL, numbered problem, or slug/title)
 * into a structured problem descriptor.
 */
export function parseProblemInput(rawLine: string): ParsedProblemInput | null {
  const trimmed = rawLine.trim();
  if (!trimmed) return null;

  // Strip leading bullet points or markdown list markers like "- " or "* "
  const cleaned = trimmed.replace(/^[-*•]\s+/, "").trim();
  if (!cleaned) return null;

  // Case 1: LeetCode URL (e.g., https://leetcode.com/problems/word-search-ii/description/?envType=...)
  const urlMatch = cleaned.match(/leetcode\.com\/problems\/([a-zA-Z0-9-]+)/i);
  if (urlMatch) {
    const slug = urlMatch[1].toLowerCase().replace(/^-+|-+$/g, "");
    const title = slugToTitle(slug);
    return {
      rawInput: cleaned,
      slug,
      title,
      leetcodeUrl: `https://leetcode.com/problems/${slug}/description/`,
    };
  }

  // Case 2: Numbered problem (e.g., "212. Word Search II" or "#127 Word Ladder" or "146 - LRU Cache")
  const numberedMatch = cleaned.match(/^#?(\d+)\s*[.:\-)\s]\s*(.+)$/);
  if (numberedMatch) {
    const problemNumber = numberedMatch[1];
    const restTitle = numberedMatch[2].trim();
    const subUrlMatch = restTitle.match(/leetcode\.com\/problems\/([a-zA-Z0-9-]+)/i);
    const slug = subUrlMatch
      ? subUrlMatch[1].toLowerCase()
      : restTitle
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");
    if (!slug) return null;
    const title = subUrlMatch ? slugToTitle(slug) : restTitle;
    return {
      rawInput: cleaned,
      slug,
      title,
      problemNumber,
      leetcodeUrl: `https://leetcode.com/problems/${slug}/description/`,
    };
  }

  // Case 3: Plain slug or English title (e.g., "maximal-square" or "Trapping Rain Water")
  const slug = cleaned
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!slug) return null;

  const isAlreadyKebab = /^[a-z0-9-]+$/.test(cleaned);
  const title = isAlreadyKebab ? slugToTitle(slug) : cleaned;

  return {
    rawInput: cleaned,
    slug,
    title,
    leetcodeUrl: `https://leetcode.com/problems/${slug}/description/`,
  };
}

/**
 * Parses a multi-line batch string (4-5+ problems separated by newlines or semicolons)
 * and deduplicates by slug within the batch.
 */
export function parseBatchInput(batchText: string): ParsedProblemInput[] {
  const lines = batchText
    .split(/[\r\n;]+/)
    .map((line) => line.trim())
    .filter(Boolean);

  const seen = new Set<string>();
  const results: ParsedProblemInput[] = [];

  for (const line of lines) {
    const parsed = parseProblemInput(line);
    if (parsed && !seen.has(parsed.slug)) {
      seen.add(parsed.slug);
      results.push(parsed);
    }
  }

  return results;
}

/**
 * Creates the initial 5-Phase progress record for a new job.
 */
export function createInitialPhases(): Record<PhaseId, PhaseProgress> {
  return {
    phase1_solution: {
      id: "phase1_solution",
      index: 1,
      label: "Phase 1: Thuật Toán Tối Ưu (Python)",
      shortLabel: "1. Solution (Py)",
      status: "pending",
      progress: 0,
      detail: "Chờ viết solution.py",
    },
    phase2_tests: {
      id: "phase2_tests",
      index: 2,
      label: "Phase 2: Unit Tests & Stress Test (Python)",
      shortLabel: "2. Unit Tests",
      status: "pending",
      progress: 0,
      detail: "Chờ kiểm thử solution.py",
    },
    phase3_audio: {
      id: "phase3_audio",
      index: 3,
      label: "Phase 3: Voiceover & Whisper Captions",
      shortLabel: "3. Audio & Whisper",
      status: "pending",
      progress: 0,
      detail: "Chờ tạo 5 file giọng đọc & căn chỉnh từ",
    },
    phase4_scenes: {
      id: "phase4_scenes",
      index: 4,
      label: "Phase 4: 5-Scene Remotion & Sketch UI",
      shortLabel: "4. 5 Scenes UI",
      status: "pending",
      progress: 0,
      detail: "Chờ dựng 5 cảnh 1080×1350 & Sketch",
    },
    phase5_render: {
      id: "phase5_render",
      index: 5,
      label: "Phase 5: Render MP4 & Kiểm Tra",
      shortLabel: "5. Render MP4",
      status: "pending",
      progress: 0,
      detail: "Chờ kết xuất out/<slug>.mp4",
    },
  };
}
