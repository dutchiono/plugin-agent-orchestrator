/**
 * Windows PATH fallback merge for the sanitized PTY env.
 *
 * Salvaged logic from https://github.com/elizaos-plugins/plugin-agent-orchestrator/pull/33
 * with the `.cmd` hardcode stripped (PR #41 / shell:true supersedes that)
 * and coverage for scoop + chocolatey added.
 */

import { describe, expect, it } from "vitest";
import {
  appendWindowsPathFallbacks,
  getWindowsPathFallbacks,
  mergePathEntries,
} from "../services/pty-spawn.js";

describe("mergePathEntries", () => {
  it("appends new entries while preserving order", () => {
    const result = mergePathEntries("/a:/b", ["/c", "/d"], {
      delimiter: ":",
      caseInsensitive: false,
    });
    expect(result).toBe("/a:/b:/c:/d");
  });

  it("deduplicates exact matches (case-sensitive)", () => {
    const result = mergePathEntries("/a:/b", ["/b", "/c"], {
      delimiter: ":",
      caseInsensitive: false,
    });
    expect(result).toBe("/a:/b:/c");
  });

  it("deduplicates case-insensitively for Windows-style matching", () => {
    const result = mergePathEntries(
      "C:\\Users\\X\\AppData\\Roaming\\npm",
      ["c:\\users\\x\\appdata\\roaming\\npm", "C:\\Users\\X\\.bun\\bin"],
      { delimiter: ";", caseInsensitive: true },
    );
    // The duplicate (differently-cased) is dropped; the new path is kept.
    expect(result).toBe(
      "C:\\Users\\X\\AppData\\Roaming\\npm;C:\\Users\\X\\.bun\\bin",
    );
  });

  it("trims empty entries from the input PATH", () => {
    const result = mergePathEntries("/a::/b", ["/c"], {
      delimiter: ":",
      caseInsensitive: false,
    });
    expect(result).toBe("/a:/b:/c");
  });

  it("returns undefined for totally empty input", () => {
    const result = mergePathEntries(undefined, [], {
      delimiter: ":",
      caseInsensitive: false,
    });
    expect(result).toBeUndefined();
  });

  it("handles undefined currentPath with only extras", () => {
    const result = mergePathEntries(undefined, ["/a", "/b"], {
      delimiter: ":",
      caseInsensitive: false,
    });
    expect(result).toBe("/a:/b");
  });
});

describe("getWindowsPathFallbacks", () => {
  it("returns an empty array on non-Windows platforms", () => {
    expect(getWindowsPathFallbacks({}, "linux")).toEqual([]);
  });

  it("derives roaming/local app data from USERPROFILE when APPDATA vars are absent", () => {
    expect(
      getWindowsPathFallbacks(
        {
          USERPROFILE: "C:\\Users\\epj33",
          PROGRAMDATA: "C:\\ProgramData",
        },
        "win32",
      ),
    ).toEqual([
      "C:\\Users\\epj33\\AppData\\Roaming\\npm",
      "C:\\Users\\epj33\\AppData\\Local\\OpenAI\\Codex\\bin",
      "C:\\Users\\epj33\\scoop\\shims",
      "C:\\ProgramData\\chocolatey\\bin",
      "C:\\Users\\epj33\\.bun\\bin",
    ]);
  });
});

describe("appendWindowsPathFallbacks (non-Windows passthrough)", () => {
  it("returns the input PATH unchanged on non-Windows", () => {
    if (process.platform === "win32") return;
    expect(appendWindowsPathFallbacks("/usr/bin:/bin")).toBe("/usr/bin:/bin");
    expect(appendWindowsPathFallbacks(undefined)).toBeUndefined();
  });
});
