import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type RefObject,
} from "react";
import {
  useGpuix,
  type NativeRenderer,
  type PublicInstance,
} from "@gpuix/react";
import { focusElement } from "./focus";
import {
  createOverlayStack,
  type OverlayLayer,
  type OverlayKind,
  type OverlayStack,
} from "./layer-model";
const stores = new WeakMap<NativeRenderer, OverlayStack>();
export const OverlayLayerContext = createContext<OverlayLayer | null>(null);
function stackFor(renderer: NativeRenderer) {
  let stack = stores.get(renderer);
  if (!stack) {
    stack = createOverlayStack();
    stores.set(renderer, stack);
  }
  return stack;
}
export function useOverlayPriority(offset = 3) {
  return (useContext(OverlayLayerContext)?.priority ?? 7) + offset;
}
export function useOverlayLayer(
  kind: OverlayKind,
  options: {
    focus: () => void;
    restoreFocusRef?: RefObject<PublicInstance | null>;
    restoreAllowed?: () => boolean;
  },
) {
  const { renderer } = useGpuix(),
    parent = useContext(OverlayLayerContext);
  const stack = useMemo(
    () => (renderer ? stackFor(renderer) : createOverlayStack()),
    [renderer],
  );
  const layer = useMemo(
    () => stack.allocate(kind, parent?.id ?? null),
    [stack],
  );
  const current = useRef(options);
  current.current = options;
  useEffect(() => {
    stack.mount(layer);
    // 子节点 effect 先执行；等本次提交注册完再决定唯一的初始焦点。
    void Promise.resolve().then(() => {
      if (stack.isTop(layer.id)) current.current.focus();
    });
    return () => {
      const wasTop = stack.isTop(layer.id);
      stack.unmount(layer.id);
      // 整个父子分支一起卸载时，仅根层恢复应用焦点，避免聚焦已销毁触发器。
      void Promise.resolve().then(() => {
        if (stack.has(layer.id) || current.current.restoreAllowed?.() === false)
          return;
        const remaining = stack.getSnapshot(),
          top = remaining.at(-1);
        const canRestore = top
          ? wasTop && layer.parent === top.id
          : layer.parent === null;
        if (canRestore && current.current.restoreFocusRef?.current)
          focusElement(renderer, current.current.restoreFocusRef.current.id);
      });
    };
  }, [stack, layer, renderer]);
  return { layer, isTop: () => stack.isTop(layer.id) };
}

/** 捕获层跟随所属模态/弹层；原窗口根仍使用优先级 10。 */
export function OverlayCapture(props: {
  children?: import("react").ReactNode;
  position: { x: number; y: number };
  deferred?: boolean;
  occlude?: boolean;
  style?: import("@gpuix/react").StyleDesc;
}) {
  const priority = useOverlayPriority();
  return <anchored {...props} priority={priority} />;
}
