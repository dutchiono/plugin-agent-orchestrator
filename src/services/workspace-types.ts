/**
 * Type definitions for the Coding Workspace Service.
 *
 * Extracted from workspace-service.ts to reduce module size.
 *
 * @module services/workspace-types
 */

import type { WorkspaceStatus } from "git-workspace-service";

export interface CodingWorkspaceConfig {
  /** Base directory for workspaces (default: ~/.milady/workspaces) */
  baseDir?: string;
  /** Branch prefix (default: "milady") */
  branchPrefix?: string;
  /** Enable debug logging */
  debug?: boolean;
  /** Max age for orphaned workspace directories in ms (default: 24 hours). Set to 0 to disable GC. */
  workspaceTtlMs?: number;
}

export interface ProvisionWorkspaceOptions {
  /** Git repository URL */
  repo: string;
  /** Base branch to create from (default: "main") */
  baseBranch?: string;
  /** Exact branch name to use (overrides auto-generated name) */
  branchName?: string;
  /** Use worktree instead of clone */
  useWorktree?: boolean;
  /** Parent workspace ID for worktree */
  parentWorkspaceId?: string;
  /** Execution context */
  execution?: { id: string; patternName: string };
  /** Task context */
  task?: { id: string; role: string; slug?: string };
  /** User-provided credentials */
  userCredentials?: { type: "pat" | "oauth" | "ssh"; token?: string };
  /**
   * Absolute path to an existing local git checkout. When set, the workspace
   * is provisioned as a `git worktree add` off that checkout instead of a
   * fresh clone. Use for "patch this repo" flows where the agent should work
   * against the user's current checkout (e.g. the running Milady source tree).
   */
  localRepoPath?: string;
}

export interface WorkspaceResult {
  id: string;
  path: string;
  branch: string;
  baseBranch: string;
  isWorktree: boolean;
  repo: string;
  status: WorkspaceStatus;
  /** Semantic label for referencing this workspace (e.g. "auth-bugfix", "api-tests") */
  label?: string;
}

export interface CommitOptions {
  message: string;
  all?: boolean;
}

export interface PushOptions {
  setUpstream?: boolean;
  force?: boolean;
}

export interface PROptions {
  title: string;
  body: string;
  base?: string;
  draft?: boolean;
  labels?: string[];
  reviewers?: string[];
}

export interface WorkspaceStatusResult {
  branch: string;
  clean: boolean;
  modified: string[];
  staged: string[];
  untracked: string[];
}
