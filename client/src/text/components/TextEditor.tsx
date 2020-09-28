import * as S from "./TextEditor.styles";

import React from "react";
import ParagraphBlock from "./ParagraphBlock";
import HeaderBlock from "./HeaderBlock";
import randomID from "../../common/util/randomID";

export interface HeaderBlockModel {
  type: "header";
  id: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  content: string;
}

export interface ParagraphBlockModel {
  type: "paragraph";
  id: string;
  content: string;
}

export type BlockModel = ParagraphBlockModel | HeaderBlockModel;

const TextEditor: React.FC = () => {
  const blocks: BlockModel[] = [
    { type: "header", id: randomID(), level: 1, content: "A good day" },
    {
      type: "paragraph",
      id: randomID(),
      content: "hello",
    },
  ];
  return (
    <S.Wrapper
      contentEditable
      suppressContentEditableWarning
      onPaste={(e) => {
        console.group("Pasted:");
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const loggedObject = {
            data: e.clipboardData.getData(item.type),
            asFile: item.getAsFile(),
            asEntry: item.webkitGetAsEntry(),
          };
          item.getAsString((s) => {
            (loggedObject as any).asString = s;
          });
          console.group(`${item.type} (${item.kind})`);
          console.log(loggedObject);
          console.groupEnd();
        }
        console.groupEnd();
      }}
    >
      {blocks.map((block) => {
        let Component: React.FC<any>;
        switch (block.type) {
          case "header":
            Component = HeaderBlock;
            break;
          case "paragraph":
            Component = ParagraphBlock;
            break;
        }
        return <Component block={block} key={block.id}></Component>;
      })}
      Type stuff!
    </S.Wrapper>
  );
};

export default TextEditor;
