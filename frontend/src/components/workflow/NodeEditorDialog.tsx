import React from "react";
import {
  AINodeEditor,
  FileReaderNodeEditor,
  FileWriterNodeEditor,
  StartNodeEditor,
  EndNodeEditor
} from "../nodes";

interface NodeEditorDialogProps {
  isOpen: boolean;
  node: any;
  edges?: any[];
  onSave: (data: any) => void;
  onCancel: () => void;
}

const NodeEditorDialog: React.FC<NodeEditorDialogProps> = ({
  isOpen,
  node,
  edges = [],
  onSave,
  onCancel,
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
          />
        );
      case "fileWriter":
      case "file_writer":
        return (
          <FileWriterNodeEditor
            isOpen={isOpen}
            node={node}
            onSave={onSave}
            onCancel={onCancel}
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
