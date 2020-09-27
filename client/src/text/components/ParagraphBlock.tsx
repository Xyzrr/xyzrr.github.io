import React from "react";
import { ParagraphBlockModel } from "./TextEditor";

interface ParagraphBlockProps {
  block: ParagraphBlockModel;
}

const ParagraphBlock: React.FC<ParagraphBlockProps> = ({ block }) => {
  return <p>{block.content}</p>;
};

export default ParagraphBlock;
