import * as S from "./ClipboardPage.styles";

import React from "react";

const ClipboardPage: React.FC = () => {
  return (
    <S.Input
      placeholder="Paste anything here!"
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
    ></S.Input>
  );
};

export default ClipboardPage;
