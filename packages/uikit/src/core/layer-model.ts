export type OverlayKind = "modal" | "popover";
export interface OverlayLayer {
  readonly id: number;
  readonly parent: number | null;
  readonly kind: OverlayKind;
  readonly priority: number;
}
/** 只管理当前渲染器中的 UIKit 层身份和先后关系，不调用系统窗口 API。 */
export function createOverlayStack() {
  let sequence = 0,
    snapshot: readonly OverlayLayer[] = Object.freeze([]);
  const listeners = new Set<() => void>();
  const publish = (value: readonly OverlayLayer[]) => {
    snapshot = Object.freeze([...value].sort((a, b) => a.id - b.id));
    for (const fn of [...listeners]) fn();
  };
  return {
    allocate(kind: OverlayKind, parent: number | null = null): OverlayLayer {
      const id = ++sequence;
      return Object.freeze({ id, parent, kind, priority: 20 + id * 4 });
    },
    mount(layer: OverlayLayer) {
      if (!snapshot.some((x) => x.id === layer.id))
        publish([...snapshot, layer]);
    },
    unmount(id: number) {
      if (snapshot.some((x) => x.id === id))
        publish(snapshot.filter((x) => x.id !== id));
    },
    getSnapshot: () => snapshot,
    subscribe(fn: () => void) {
      listeners.add(fn);
      return () => {
        listeners.delete(fn);
      };
    },
    isTop: (id: number) => snapshot.at(-1)?.id === id,
    has: (id: number) => snapshot.some((x) => x.id === id),
  };
}
export type OverlayStack = ReturnType<typeof createOverlayStack>;
