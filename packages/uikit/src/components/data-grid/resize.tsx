import { OverlayCapture } from "../../core/layers";
import { useRef, useState } from "react";
import { useWindowSize } from "@gpuix/react";
import { useTheme } from "../../core/theme";
import { useFocusTarget } from "../../core/focus";
export function ColumnResize({
  width,
  min,
  max,
  onChange,
  testId,
}: {
  width: number;
  min: number;
  max: number;
  onChange: (width: number) => void;
  testId: string;
}) {
  const { colors: c } = useTheme();
  const window = useWindowSize();
  const focus = useFocusTarget();
  const [drag, setDrag] = useState(false);
  const origin = useRef({ x: 0, width: 0 });
  const change = (n: number) => onChange(Math.min(max, Math.max(min, n)));
  return (
    <div
      ref={focus.ref}
      testId={testId}
      tabIndex={0}
      onMouseDown={(event) => {
        if (event.button !== undefined && event.button !== 0) return;
        focus.onMouseDown();
        origin.current = { x: event.x ?? 0, width };
        setDrag(true);
      }}
      onKeyDown={(event) => {
        if (event.key === "escape" && drag) {
          change(origin.current.width);
          setDrag(false);
          return;
        }
        focus.onKeyDown(event);
        if (event.key === "left") change(width - 10);
        if (event.key === "right") change(width + 10);
        if (event.key === "home") change(min);
        if (event.key === "end") change(max);
      }}
      style={{
        width: 5,
        height: 30,
        flexShrink: 0,
        cursor: "col-resize",
        backgroundColor: focus.focused || drag ? c.accent : c.border,
      }}
    >
      {drag ? (
        <OverlayCapture position={{ x: 0, y: 0 }} deferred occlude>
          <div
            testId={`${testId}-drag`}
            onMouseMove={(event) =>
              change(origin.current.width + (event.x ?? 0) - origin.current.x)
            }
            onMouseUp={(event) => {
              change(origin.current.width + (event.x ?? 0) - origin.current.x);
              setDrag(false);
            }}
            onMouseDownOutside={() => setDrag(false)}
            style={{
              width: window.width,
              height: window.height,
              cursor: "col-resize",
              pointerEvents: "auto",
            }}
          />
        </OverlayCapture>
      ) : null}
    </div>
  );
}
