import React from "react";
import { ParagraphBlockModel, EditorContext } from "./TextEditor";

interface ParagraphBlockProps {
  index: number;
  block: ParagraphBlockModel;
}

const convertDomToModel = (html: string | undefined) => {
  if (html == null) {
    return "";
  }
  return html;
};

const ParagraphBlock: React.FC<ParagraphBlockProps> = ({ index, block }) => {
  const nodeRef = React.useRef<HTMLParagraphElement>(null);
  const context = React.useContext(EditorContext);
  return (
    <p
      ref={nodeRef}
      onKeyUp={() => {
        if (nodeRef.current) {
          context?.updateBlockContent(
            index,
            convertDomToModel(nodeRef.current.innerHTML)
          );
        }
      }}
    >
      {block.content}
    </p>
  );
};

export default ParagraphBlock;
