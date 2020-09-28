import * as S from "./TextEditor.styles";

import React from "react";
import ParagraphBlock from "./ParagraphBlock";
import HeaderBlock from "./HeaderBlock";
import randomID from "../../common/util/randomID";
import { produce } from "immer";

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

export const EditorContext = React.createContext<{
  updateBlockContent: (i: number, newContent: string) => void;
} | null>(null);

const TextEditor: React.FC = () => {
  const [blocks, setBlocks] = React.useState<BlockModel[]>([
    { type: "header", id: randomID(), level: 1, content: "A good day" },
    {
      type: "paragraph",
      id: randomID(),
      content: "hello",
    },
    {
      type: "paragraph",
      id: randomID(),
      content: "another paragraph",
    },
  ]);
  return (
    <S.Wrapper
      contentEditable
      suppressContentEditableWarning
      onMouseUp={() => {
        console.log("Selection:", window.getSelection());
      }}
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
      <EditorContext.Provider
        value={{
          updateBlockContent: (i: number, newContent: string) => {
            setBlocks((old) => {
              return produce(old, (draft: BlockModel[]) => {
                draft[i].content = newContent;
              });
            });
          },
        }}
      >
        {blocks.map((block, blockIndex) => {
          let Component: React.FC<any>;
          switch (block.type) {
            case "header":
              Component = HeaderBlock;
              break;
            case "paragraph":
              Component = ParagraphBlock;
              break;
          }
          return (
            <Component
              index={blockIndex}
              block={block}
              key={block.id}
            ></Component>
          );
        })}
      </EditorContext.Provider>
    </S.Wrapper>
  );
};

export default TextEditor;
