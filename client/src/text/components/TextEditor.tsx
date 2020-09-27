import * as S from "./TextEditor.styles";

import React from "react";

const TextEditor: React.FC = () => {
  return (
    <S.Wrapper
      contentEditable
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
      Type stuff!
    </S.Wrapper>
  );
};

export default TextEditor;
