import { Icon } from "@powerhousedao/design-system";
import {
  setSelectedNode,
  useNodesInSelectedDrive,
  useSelectedDrive,
  useSelectedNode,
} from "@powerhousedao/reactor-browser";
import { getAncestors } from "@powerhousedao/shared/document-drive";
import type { EditorProps } from "document-model";
import { Fragment, useMemo } from "react";
import { DriveContents } from "./DriveContents.js";
import { FolderTree } from "./FolderTree.js";

/**
 * Main drive explorer component with sidebar navigation and content area.
 * Layout: Left sidebar (folder tree) + Right content area (files/folders + document editor)
 * When a document is opened, the sidebar is hidden and a breadcrumb path is shown
 * to give the editor more horizontal space.
 */
export function DriveExplorer({ children }: EditorProps) {
  // if a document is selected then it's editor will be passed as children
  const showDocumentEditor = !!children;
  const [selectedDrive] = useSelectedDrive();
  const selectedNode = useSelectedNode();
  const nodes = useNodesInSelectedDrive();
  const driveName = selectedDrive.header.name;

  // Build path from drive root → selected document: ancestor folders (root first)
  const pathFolders = useMemo(() => {
    if (!selectedNode || !nodes) return [];
    return getAncestors(selectedNode, nodes).reverse();
  }, [selectedNode, nodes]);

  if (showDocumentEditor) {
    return (
      <div className="flex h-full min-h-0 flex-col">
        <div className="flex shrink-0 items-center gap-3 border-b border-gray-200 bg-white px-2 py-1">
          <button
            type="button"
            onClick={() => setSelectedNode(undefined)}
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100"
            title={`Back to ${driveName}`}
          >
            <Icon name="ArrowLeft" size={16} />
            Back
          </button>
          <nav
            aria-label="Document path"
            className="flex min-w-0 items-center gap-1.5 text-sm text-gray-600"
          >
            <button
              type="button"
              onClick={() => setSelectedNode(undefined)}
              className="flex shrink-0 items-center gap-1.5 rounded-md px-1.5 py-0.5 text-gray-700 hover:bg-gray-100"
              title={`Go to ${driveName}`}
            >
              <Icon name="Drive" size={14} />
              <span className="max-w-[12rem] truncate font-medium">
                {driveName}
              </span>
            </button>
            {pathFolders.map((folder) => (
              <Fragment key={folder.id}>
                <span className="text-gray-400">/</span>
                <button
                  type="button"
                  onClick={() => setSelectedNode(folder.id)}
                  className="max-w-[12rem] truncate rounded-md px-1.5 py-0.5 text-gray-700 hover:bg-gray-100"
                  title={folder.name}
                >
                  {folder.name}
                </button>
              </Fragment>
            ))}
            {selectedNode ? (
              <>
                <span className="text-gray-400">/</span>
                <span
                  className="max-w-[24rem] truncate font-medium text-gray-900"
                  title={selectedNode.name}
                >
                  {selectedNode.name}
                </span>
              </>
            ) : null}
          </nav>
        </div>
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0">
      <FolderTree />
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <DriveContents />
      </div>
    </div>
  );
}
