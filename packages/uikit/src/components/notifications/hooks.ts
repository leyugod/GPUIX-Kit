import { useEffect, useRef, useState } from "react";
import {
  createNotificationQueue,
  type NotificationQueueOptions,
} from "./queue";
export function useNotificationQueue(options: NotificationQueueOptions = {}) {
  const [queue] = useState(() => createNotificationQueue(options));
  useEffect(() => {
    queue.resume();
    return () => queue.suspend();
  }, [queue]);
  return queue;
}
/** 异步回调只更新仍挂载且身份相同的视图；业务请求本身由应用取消。 */
export function useFeedbackAction(identity: string) {
  const alive = useRef(false),
    current = useRef(identity),
    locked = useRef<string | null>(null);
  current.current = identity;
  const [pending, setPending] = useState(false),
    [failed, setFailed] = useState(false);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  useEffect(() => {
    locked.current = null;
    setPending(false);
    setFailed(false);
  }, [identity]);
  const run = async (
    action: () => void | Promise<void>,
    callbacks: {
      busy?: (busy: boolean) => void;
      success?: () => void;
      failure?: () => void;
    } = {},
  ) => {
    if (locked.current === identity) return;
    locked.current = identity;
    setPending(true);
    setFailed(false);
    callbacks.busy?.(true);
    try {
      await action();
      if (alive.current && current.current === identity) {
        callbacks.success?.();
      }
    } catch {
      if (alive.current && current.current === identity) {
        setFailed(true);
        callbacks.failure?.();
      }
    } finally {
      // 视图卸载也要释放队列暂停；调用方以 revision 隔离旧通知。
      callbacks.busy?.(false);
      if (alive.current && current.current === identity) {
        locked.current = null;
        setPending(false);
      }
    }
  };
  return { pending, failed, run };
}
