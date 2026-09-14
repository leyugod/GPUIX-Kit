import { useRef, useState } from "react";
import { Input, type InputProps } from "../../base";
/** 仅修复固定宿主 Tab 插入；重建内部编辑器会重置光标与原生撤销。 */
export function TokenInput(props: InputProps) {
  const [revision, setRevision] = useState(0),
    tab = useRef<object | null>(null);
  return (
    <Input
      {...props}
      resetKey={revision}
      onValueChange={(value) => {
        if (tab.current) {
          tab.current = null;
          setRevision((v) => v + 1);
          return;
        }
        props.onValueChange(value);
      }}
      onKeyDown={(event) => {
        if (event.key === "tab") {
          const mark = {};
          tab.current = mark;
          void Promise.resolve().then(() => {
            if (tab.current === mark) tab.current = null;
          });
        }
        return props.onKeyDown?.(event);
      }}
    />
  );
}
