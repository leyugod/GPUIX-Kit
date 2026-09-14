import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type Ref,
} from "react";
import {
  useGpuix,
  type EventPayload,
  type PublicInstance,
  type NativeRenderer,
} from "@gpuix/react";
export interface FocusScope {
  register: (node: PublicInstance, order?: number) => void;
  unregister: (id: number) => void;
  escape: () => void;
  move: (id: number, backward: boolean) => void;
}
/** 只登记 UIKit 原生控件所属区域，用于区域卸载时的显式恢复。 */
export const FocusRegionContext = createContext<{
  register: (id: number) => void;
  unregister: (id: number) => void;
} | null>(null);
export const FocusScopeContext = createContext<FocusScope | null>(null);
const windows = new WeakMap<
  NativeRenderer,
  { id: number | null; listeners: Set<() => void> }
>();
function state(renderer: NativeRenderer) {
  let value = windows.get(renderer);
  if (!value) {
    value = { id: null, listeners: new Set() };
    windows.set(renderer, value);
  }
  return value;
}
function record(renderer: NativeRenderer | null, id: number) {
  if (!renderer) return;
  const value = state(renderer);
  value.id = id;
  for (const listener of value.listeners) listener();
}
export function focusElement(renderer: NativeRenderer | null, id: number) {
  renderer?.focusElement?.(id);
  record(renderer, id);
}
/** 0.7.0 的 TestRenderer 不派发 focus/blur；通过实际键盘/鼠标意图管理焦点。 */
export function useFocusTarget(
  disabled = false,
  external?: Ref<PublicInstance>,
) {
  const { renderer } = useGpuix();
  const scope = useContext(FocusScopeContext);
  const region = useContext(FocusRegionContext);
  const current = useRef<PublicInstance | null>(null);
  // 原生编辑器可重建，焦点顺序依照组件首次注册而非变化后的宿主 ID。
  const order = useRef<number | null>(null);
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    if (!renderer) return;
    const value = state(renderer);
    const update = () => setFocused(value.id === current.current?.id);
    value.listeners.add(update);
    return () => {
      value.listeners.delete(update);
    };
  }, [renderer]);
  const ref = useCallback(
    (node: PublicInstance | null) => {
      if (current.current) {
        scope?.unregister(current.current.id);
        region?.unregister(current.current.id);
      }
      current.current = node;
      if (node) region?.register(node.id);
      if (node && !disabled) {
        order.current ??= node.id;
        scope?.register(node, order.current);
      }
      if (typeof external === "function") external(node);
      else if (external) external.current = node;
    },
    [scope, region, disabled, external],
  );
  const onMouseDown = () => {
    if (!disabled && current.current)
      focusElement(renderer, current.current.id);
  };
  const onKeyDown = (event: EventPayload) => {
    if (disabled) return;
    record(renderer, event.elementId);
    if (event.key === "escape") scope?.escape();
    if (event.key === "tab") {
      if (scope) scope.move(event.elementId, Boolean(event.modifiers?.shift));
      else if (event.modifiers?.shift) renderer?.focusPrevious?.();
      else renderer?.focusNext?.();
    }
  };
  return { ref, onKeyDown, onMouseDown, focused };
}

/** 读取 UIKit 记录的焦点；不把它当成系统 AX 或任意原生控件焦点查询。 */
export function getManagedFocus(renderer: NativeRenderer | null) {
  return renderer ? state(renderer).id : null;
}

/** 订阅 UIKit 已记录的焦点，不查询 OS 或 AX。 */
export function subscribeManagedFocus(
  renderer: NativeRenderer,
  listener: () => void,
) {
  const value = state(renderer);
  value.listeners.add(listener);
  return () => {
    value.listeners.delete(listener);
  };
}
