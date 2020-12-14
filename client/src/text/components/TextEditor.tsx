import * as S from "./TextEditor.styles";

import * as _ from "lodash";
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

const convertDomToModel = (html: string | undefined) => {
  if (html == null) {
    return "";
  }
  return html;
};

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
  console.log("STATE", blocks);

  const onContentUpdate = React.useCallback(
    (e: React.KeyboardEvent) => {
      console.log("step 0");
      const selection = window.getSelection();
      if (selection != null) {
        console.log("step 1");
        let anchorElement: Element | null | undefined;
        let focusElement: Element | null | undefined;
        if (selection.anchorNode instanceof Element) {
          anchorElement = selection.anchorNode;
        } else {
          anchorElement = selection.anchorNode?.parentElement;
        }
        if (selection.focusNode instanceof Element) {
          focusElement = selection.focusNode;
        } else {
          focusElement = selection.focusNode?.parentElement;
        }
        if (anchorElement != null && focusElement != null) {
          console.log("step 2");

          const anchorBlockNode = anchorElement.closest(".editor-block");
          const focusBlockNode = focusElement.closest(".editor-block");
          if (
            anchorBlockNode != null &&
            focusBlockNode != null &&
            anchorBlockNode === focusBlockNode
          ) {
            console.log("step 3", anchorBlockNode, focusBlockNode);
            const blockID = anchorBlockNode.id;
            const blockIndex = _.findIndex(
              blocks,
              (block) => block.id === blockID
            );
            window.setTimeout(() => {
              const html = anchorBlockNode.innerHTML;
              setBlocks((old) => {
                return produce(old, (draft: BlockModel[]) => {
                  draft[blockIndex].content = convertDomToModel(html);
                });
              });
            });
            return;
          }
        }
      }
      e.preventDefault();
    },
    [blocks]
  );

  return (
    <S.Wrapper
      contentEditable
      onKeyDown={onContentUpdate}
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
    </S.Wrapper>
  );
};

export default TextEditor;
