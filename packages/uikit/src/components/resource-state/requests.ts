import { useEffect, useRef, useState } from "react";
/** 锁只管理 UI 请求意图；响应数据的版本判断和实际取消由应用负责。 */
export function useRequestActions(identity: string, keys: readonly string[]) {
  const state = useRef({
    identity,
    pending: new Map<string, symbol>(),
    failed: new Set<string>(),
    alive: false,
  });
  const [, update] = useState(0);
  const valid = new Set(keys);
  if (state.current.identity !== identity) {
    state.current.identity = identity;
    state.current.pending.clear();
    state.current.failed.clear();
  }
  for (const key of state.current.pending.keys())
    if (!valid.has(key)) state.current.pending.delete(key);
  for (const key of state.current.failed)
    if (!valid.has(key)) state.current.failed.delete(key);
  useEffect(() => {
    state.current.alive = true;
    return () => {
      state.current.alive = false;
      state.current.pending.clear();
    };
  }, []);
  const run = async (key: string, action: () => void | Promise<void>) => {
    const s = state.current;
    if (!valid.has(key) || s.pending.has(key)) return;
    const token = Symbol(key);
    s.pending.set(key, token);
    s.failed.delete(key);
    update((n) => n + 1);
    try {
      await action();
    } catch {
      if (s.alive && s.identity === identity && s.pending.get(key) === token)
        s.failed.add(key);
    } finally {
      if (s.alive && s.identity === identity && s.pending.get(key) === token) {
        s.pending.delete(key);
        update((n) => n + 1);
      }
    }
  };
  return {
    pending: (key: string) => state.current.pending.has(key),
    failed: (key: string) => state.current.failed.has(key),
    run,
  };
}
