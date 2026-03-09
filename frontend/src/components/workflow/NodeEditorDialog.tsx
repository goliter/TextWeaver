import React from "react";
import {
  AINodeEditor,
  FileReaderNodeEditor,
  FileWriterNodeEditor,
  FolderWriterNodeEditor,
  StartNodeEditor,
  EndNodeEditor,
} from "../nodes";

interface NodeEditorDialogProps {
  isOpen: boolean;
  node: any;
  edges?: any[];
  onSave: (data: any) => void;
  onCancel: () => void;
  flowId: number;
}

const NodeEditorDialog: React.FC<NodeEditorDialogProps> = ({
  isOpen,
  node,
  edges = [],
  onSave,
  onCancel,
  flowId,
}) => {
  if (!isOpen || !node) return null;

  const getNodeEditor = () => {
    switch (node.type) {
      case "ai":
        return (
          <AINodeEditor
            isOpen={isOpen}
            node={node}
            edges={edges}
            onSave={onSave}
            onCancel={onCancel}
          />
        );
      case "fileReader":
      case "file_reader":
        return (
          <FileReaderNodeEditor
            isOpen={isOpen}
            node={node}
            onSave={onSave}
            onCancel={onCancel}
            flowId={flowId}
          />
        );
      case "fileWriter":
      case "file_writer":
        return (
          <FileWriterNodeEditor
            isOpen={isOpen}
            node={node}
            edges={edges}
            onSave={onSave}
            onCancel={onCancel}
            flowId={flowId}
          />
        );
      case "folderWriter":
      case "folder_writer":
        return (
          <FolderWriterNodeEditor
            isOpen={isOpen}
            node={node}
            onSave={onSave}
            onCancel={onCancel}
            flowId={flowId}
          />
        );
      case "start":
        return (
          <StartNodeEditor
            isOpen={isOpen}
            node={node}
            onSave={onSave}
            onCancel={onCancel}
          />
        );
      case "end":
        return (
          <EndNodeEditor
            isOpen={isOpen}
            node={node}
            onSave={onSave}
            onCancel={onCancel}
          />
        );
      default:
        return null;
    }
  };

  return getNodeEditor();
};

export default NodeEditorDialog;
