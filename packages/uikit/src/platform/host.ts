export type HostResult<T> =
  | { ok: true; value: T }
  | {
      ok: false;
      reason: "unsupported" | "invalid" | "cancelled" | "failed";
      message: string;
    };
type MaybePromise<T> = T | Promise<T>;
export interface FileDialogFilter {
  label: string;
  extensions: readonly string[];
}
export interface OpenFileRequest {
  multiple?: boolean;
  filters?: readonly FileDialogFilter[];
}
export interface SaveFileRequest {
  suggestedName: string;
  filters?: readonly FileDialogFilter[];
}
/** 实现由消费应用注入；这里没有系统授权、存储或网络服务。 */
export interface HostPorts {
  readClipboardText?: () => MaybePromise<string>;
  writeClipboardText?: (text: string) => MaybePromise<void>;
  openFiles?: (
    request: OpenFileRequest,
  ) => MaybePromise<readonly string[] | null>;
  saveFile?: (request: SaveFileRequest) => MaybePromise<string | null>;
  readPreference?: (key: string) => MaybePromise<string | null>;
  writePreference?: (key: string, value: string) => MaybePromise<void>;
}
const failure = (
  reason: "unsupported" | "invalid" | "cancelled" | "failed",
): HostResult<never> => ({
  ok: false,
  reason,
  message:
    reason === "unsupported"
      ? "No host implementation was provided."
      : reason === "invalid"
        ? "Invalid host request."
        : reason === "cancelled"
          ? "The operation was cancelled."
          : "The host operation failed.",
});
const boundedText = (value: unknown): value is string =>
  typeof value === "string" && value.length <= 1048576;
const validFilters = (filters: readonly FileDialogFilter[] | undefined) =>
  filters === undefined ||
  (filters.length <= 12 &&
    filters.every(
      (f) =>
        typeof f.label === "string" &&
        f.label.trim().length > 0 &&
        f.label.length <= 100 &&
        f.extensions.length > 0 &&
        f.extensions.length <= 20 &&
        f.extensions.every((e) => /^[a-zA-Z0-9]{1,16}$/.test(e)),
    ));
const copyFilters = (filters: readonly FileDialogFilter[] | undefined) =>
  filters?.map((f) => ({ label: f.label, extensions: [...f.extensions] }));
const preferenceKey = (key: string) =>
  typeof key === "string" && !!key.trim() && key.length <= 128;
const fileReference = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0 && value.length <= 8192;
/** 能力与函数在创建时一起捕获，避免后续修改 ports 产生能力声明与行为不一致。 */
export function createHostAdapter(ports: HostPorts = {}) {
  const read = ports.readClipboardText?.bind(ports),
    write = ports.writeClipboardText?.bind(ports),
    open = ports.openFiles?.bind(ports),
    save = ports.saveFile?.bind(ports),
    readPreference = ports.readPreference?.bind(ports),
    writePreference = ports.writePreference?.bind(ports);
  const call = async <T>(
    operation: (() => MaybePromise<T>) | undefined,
    valid: (value: unknown) => boolean,
  ): Promise<HostResult<T>> => {
    if (!operation) return failure("unsupported");
    try {
      const value = await operation();
      return valid(value) ? { ok: true, value } : failure("failed");
    } catch {
      return failure("failed");
    }
  };
  return {
    capabilities: Object.freeze({
      readClipboardText: !!read,
      writeClipboardText: !!write,
      openFiles: !!open,
      saveFile: !!save,
      readPreference: !!readPreference,
      writePreference: !!writePreference,
    }),
    readClipboardText: () => call(read, boundedText),
    writeClipboardText: (text: string) =>
      boundedText(text)
        ? call(write ? () => write(text) : undefined, (v) => v === undefined)
        : Promise.resolve(failure("invalid")),
    openFiles: async (
      request: OpenFileRequest = {},
    ): Promise<HostResult<readonly string[]>> => {
      if (
        (request.multiple !== undefined &&
          typeof request.multiple !== "boolean") ||
        !validFilters(request.filters)
      )
        return failure("invalid");
      const maxSelections = request.multiple ? 100 : 1;
      const snapshot = {
        multiple: request.multiple,
        filters: copyFilters(request.filters),
      };
      const result = await call(
        open ? () => open(snapshot) : undefined,
        (v) =>
          v === null ||
          (Array.isArray(v) &&
            v.length > 0 &&
            v.length <= maxSelections &&
            v.every(fileReference)),
      );
      if (!result.ok) return result;
      if (result.value === null) return failure("cancelled");
      return { ok: true, value: [...result.value] };
    },
    saveFile: async (request: SaveFileRequest): Promise<HostResult<string>> => {
      if (
        typeof request.suggestedName !== "string" ||
        !request.suggestedName.trim() ||
        request.suggestedName.length > 255 ||
        /[\/\\\x00-\x1f]/.test(request.suggestedName) ||
        !validFilters(request.filters)
      )
        return failure("invalid");
      const result = await call(
        save
          ? () =>
              save({
                suggestedName: request.suggestedName,
                filters: copyFilters(request.filters),
              })
          : undefined,
        (v) => v === null || fileReference(v),
      );
      if (!result.ok) return result;
      if (result.value === null) return failure("cancelled");
      return { ok: true, value: result.value };
    },
    readPreference: (key: string) =>
      preferenceKey(key)
        ? call(
            readPreference ? () => readPreference(key) : undefined,
            (v) => v === null || boundedText(v),
          )
        : Promise.resolve(failure("invalid")),
    writePreference: (key: string, value: string) =>
      preferenceKey(key) && boundedText(value)
        ? call(
            writePreference ? () => writePreference(key, value) : undefined,
            (v) => v === undefined,
          )
        : Promise.resolve(failure("invalid")),
  };
}
