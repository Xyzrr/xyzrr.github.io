import React from "react";
import { ParagraphBlockModel } from "./TextEditor";

interface ParagraphBlockProps {
  index: number;
  block: ParagraphBlockModel;
}

const ParagraphBlock: React.FC<ParagraphBlockProps> = ({ index, block }) => {
  const nodeRef = React.useRef<HTMLParagraphElement>(null);
  return (
    <p className="editor-block" id={block.id} ref={nodeRef}>
      {block.content}
    </p>
  );
};

export default ParagraphBlock;
