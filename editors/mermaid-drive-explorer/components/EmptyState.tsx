import { useNodesInSelectedDriveOrFolder } from "@powerhousedao/reactor-browser";

/** Shows a message when the selected drive or folder is empty */
export function EmptyState() {
  const nodes = useNodesInSelectedDriveOrFolder();
  const hasNodes = nodes.length > 0;
  if (hasNodes) return null;

  return (
    <div className="py-12 text-center text-gray-500">
      <p className="text-lg">No mermaid diagrams yet</p>
      <p className="mt-2 text-sm">
        Create your first diagram below to get started.
      </p>
    </div>
  );
}
