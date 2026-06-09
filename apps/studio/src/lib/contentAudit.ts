export type ContentAuditIssue = {
  kind: string;
  field?: string;
  message: string;
};

export type ContentAuditPost = {
  path: string;
  slug: string;
  title: string;
  status: "valid" | "invalid" | "source-only";
  issues: ContentAuditIssue[];
};

export type ContentAuditReport = {
  adapter: string;
  contentDir: string;
  summary: {
    totalFiles: number;
    validCount: number;
    invalidCount: number;
    sourceOnlyCount: number;
    ignoredCount: number;
  };
  validPosts: ContentAuditPost[];
  invalidPosts: ContentAuditPost[];
  sourceOnlyPosts: ContentAuditPost[];
  duplicateSlugs: { slug: string; paths: string[] }[];
  ignoredFiles: { path: string; reason: string }[];
  warnings: string[];
};

export type ContentAuditResponse =
  | { ok: true; report: ContentAuditReport }
  | { ok: false; error: string };

export async function fetchContentAudit(): Promise<ContentAuditResponse | null> {
  try {
    const response = await fetch("/api/content/audit", { credentials: "include" });
    if (!response.ok) {
      return { ok: false, error: `Audit request failed (${response.status}).` };
    }

    return (await response.json()) as ContentAuditResponse;
  } catch {
    return null;
  }
}
