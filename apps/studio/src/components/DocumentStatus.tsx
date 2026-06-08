import {
  documentStatusLabel,
  shouldShowDocumentStatus,
  type DocumentStatus,
} from "../lib/autosave.js";

type DocumentStatusProps = {
  status: DocumentStatus;
};

function statusClassName(kind: DocumentStatus["kind"]): string {
  switch (kind) {
    case "unsaved":
      return "document-status document-status--unsaved";
    case "saved-locally":
      return "document-status document-status--local";
    case "published":
      return "document-status document-status--published";
    case "publishing":
      return "document-status document-status--publishing";
    case "restore-available":
      return "document-status document-status--restore";
    case "idle":
      return "document-status";
  }
}

export function DocumentStatusIndicator({ status }: DocumentStatusProps) {
  if (!shouldShowDocumentStatus(status)) {
    return null;
  }

  return (
    <span className={statusClassName(status.kind)} role="status">
      {documentStatusLabel(status)}
    </span>
  );
}
