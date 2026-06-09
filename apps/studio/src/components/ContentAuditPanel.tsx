import { useEffect, useState } from "react";
import {
  fetchContentAudit,
  type ContentAuditReport,
} from "../lib/contentAudit.js";

export function ContentAuditPanel() {
  const [report, setReport] = useState<ContentAuditReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContentAudit().then((response) => {
      if (response === null) {
        setError("Could not reach the content audit API.");
      } else if (!response.ok) {
        setError(response.error);
      } else {
        setReport(response.report);
      }

      setLoading(false);
    });
  }, []);

  return (
    <section className="panel content-audit" aria-labelledby="content-audit-title">
      <div className="panel__header">
        <h2 className="panel__title" id="content-audit-title">
          Content audit
        </h2>
        <p className="panel__meta">
          Read-only scan of existing posts — files are never modified
        </p>
      </div>

      {loading && (
        <p className="content-audit__loading" role="status">
          Auditing content…
        </p>
      )}

      {!loading && error && (
        <p className="content-audit__error" role="alert">
          {error}
        </p>
      )}

      {report && (
        <>
          <dl className="content-audit__summary">
            <div>
              <dt>Adapter</dt>
              <dd>
                <code>{report.adapter}</code>
              </dd>
            </div>
            <div>
              <dt>Content directory</dt>
              <dd>
                <code>{report.contentDir}</code>
              </dd>
            </div>
            <div>
              <dt>Valid posts</dt>
              <dd>{report.summary.validCount}</dd>
            </div>
            <div>
              <dt>Invalid posts</dt>
              <dd>{report.summary.invalidCount}</dd>
            </div>
            <div>
              <dt>Source-only (complex MDX)</dt>
              <dd>{report.summary.sourceOnlyCount}</dd>
            </div>
            <div>
              <dt>Ignored files</dt>
              <dd>{report.summary.ignoredCount}</dd>
            </div>
          </dl>

          {report.warnings.length > 0 && (
            <ul className="content-audit__warnings">
              {report.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          )}

          {report.duplicateSlugs.length > 0 && (
            <div className="content-audit__section">
              <h3>Duplicate slugs</h3>
              <ul>
                {report.duplicateSlugs.map((group) => (
                  <li key={group.slug}>
                    <code>{group.slug}</code> — {group.paths.join(", ")}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {report.invalidPosts.length > 0 && (
            <div className="content-audit__section">
              <h3>Posts with issues</h3>
              <ul className="content-audit__posts">
                {report.invalidPosts.map((post) => (
                  <li key={post.path}>
                    <strong>{post.title}</strong> (<code>{post.path}</code>)
                    <ul>
                      {post.issues.map((issue) => (
                        <li key={`${post.path}-${issue.kind}-${issue.message}`}>
                          {issue.message}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {report.sourceOnlyPosts.length > 0 && (
            <div className="content-audit__section">
              <h3>Source-only posts</h3>
              <ul className="content-audit__posts">
                {report.sourceOnlyPosts.map((post) => (
                  <li key={post.path}>
                    <code>{post.path}</code> — complex MDX detected
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </section>
  );
}
