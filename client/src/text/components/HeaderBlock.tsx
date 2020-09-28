import React from "react";
import { HeaderBlockModel } from "./TextEditor";

interface HeaderBlockProps {
  index: number;
  block: HeaderBlockModel;
}

const HeaderBlock: React.FC<HeaderBlockProps> = ({ block }) => {
  let Tag = `h${block.level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  return <Tag>{block.content}</Tag>;
};

export default HeaderBlock;
