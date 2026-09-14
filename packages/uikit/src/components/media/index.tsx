import { useState, type ReactNode } from "react";
import { Button, Row, Stack, Text } from "../../base";
import { useTheme } from "../../core/theme";
import { Slider } from "../slider";
import { FileList, type FileItem } from "../content";
import { useRequestActions } from "../resource-state/requests";
import { catalogError, bounded } from "../catalog-model";
export interface CarouselItem {
  id: string;
  label: string;
  content: ReactNode;
}
export function Carousel({
  items,
  value,
  onValueChange,
  loop = false,
  disabled = false,
  height = 180,
  testId,
}: {
  items: readonly CarouselItem[];
  value: string | null;
  onValueChange: (id: string) => void;
  loop?: boolean;
  disabled?: boolean;
  height?: number;
  testId: string;
}) {
  const { colors: c } = useTheme(),
    error = catalogError(items, 30),
    index = items.findIndex((i) => i.id === value),
    current = index < 0 ? 0 : index,
    item = items[current];
  if (error)
    return (
      <Text testId={testId + "-error"} color={c.danger}>
        {error}
      </Text>
    );
  const go = (delta: number) => {
    if (!items.length) return;
    const next = loop
      ? (current + delta + items.length) % items.length
      : bounded(current + delta, 0, items.length - 1);
    onValueChange(items[next]!.id);
  };
  return (
    <Stack testId={testId}>
      <div
        testId={testId + "-surface"}
        style={{ height: bounded(height, 80, 800), overflow: "hidden" }}
      >
        {item?.content ?? <Text color={c.muted}>No slides</Text>}
      </div>
      <Row>
        <Button
          testId={testId + "-previous"}
          disabled={disabled || items.length < 2 || (!loop && current === 0)}
          onPress={() => go(-1)}
          onKeyDown={(e) => {
            if (e.key === "left") {
              go(-1);
              return true;
            }
            return false;
          }}
        >
          Previous
        </Button>
        <Text testId={testId + "-position"} style={{ flexGrow: 1 }}>
          {item ? current + 1 : 0} / {items.length} · {item?.label ?? ""}
        </Text>
        <Button
          testId={testId + "-next"}
          disabled={
            disabled ||
            items.length < 2 ||
            (!loop && current === items.length - 1)
          }
          onPress={() => go(1)}
        >
          Next
        </Button>
      </Row>
    </Stack>
  );
}
export interface ImageValue {
  id: string;
  src: string;
  label: string;
}
export function ImageViewer({
  image,
  zoom = 1,
  onZoomChange,
  height = 240,
  testId,
}: {
  image: ImageValue | null;
  zoom?: number;
  onZoomChange?: (zoom: number) => void;
  height?: number;
  testId: string;
}) {
  const { colors: c } = useTheme(),
    h = bounded(height, 80, 800),
    scale = bounded(zoom, 1, 4);
  return (
    <Stack testId={testId}>
      <div
        style={{
          height: h,
          overflowX: "scroll",
          overflowY: "scroll",
          backgroundColor: c.subtle,
        }}
      >
        {image ? (
          <img
            testId={testId + "-image"}
            src={image.src}
            alt={image.label}
            objectFit="contain"
            style={{ width: 280 * scale, height: h * scale }}
          />
        ) : (
          <Text color={c.muted}>No image</Text>
        )}
      </div>
      <Row>
        <Text lines={1} style={{ flexGrow: 1, flexShrink: 1 }}>
          {image?.label ?? "Image preview"}
        </Text>
        <Button
          testId={testId + "-zoom-out"}
          disabled={!image || !onZoomChange || scale <= 1}
          onPress={() => onZoomChange?.(bounded(scale - 0.25, 1, 4))}
        >
          −
        </Button>
        <Text>{Math.round(scale * 100)}%</Text>
        <Button
          testId={testId + "-zoom-in"}
          disabled={!image || !onZoomChange || scale >= 4}
          onPress={() => onZoomChange?.(bounded(scale + 0.25, 1, 4))}
        >
          +
        </Button>
      </Row>
    </Stack>
  );
}
export function ImagePicker({
  value,
  onChoose,
  onRemove,
  disabled,
  error,
  revision = 0,
  testId,
}: {
  value: ImageValue | null;
  onChoose?: () => void | Promise<void>;
  onRemove?: () => void | Promise<void>;
  disabled?: boolean;
  error?: string;
  revision?: string | number;
  testId: string;
}) {
  const { colors: c } = useTheme(),
    requests = useRequestActions(JSON.stringify([value?.id, revision]), [
      "action",
    ]),
    pending = requests.pending("action");
  return (
    <Stack testId={testId}>
      {value ? (
        <img
          testId={testId + "-image"}
          src={value.src}
          alt={value.label}
          objectFit="contain"
          style={{ width: 240, height: 140 }}
        />
      ) : (
        <Text color={c.muted}>No image selected</Text>
      )}
      <Row>
        <Button
          testId={testId + "-choose"}
          disabled={disabled || !onChoose}
          loading={pending}
          onPress={() => {
            if (onChoose) void requests.run("action", onChoose);
          }}
        >
          Choose image
        </Button>
        <Button
          testId={testId + "-remove"}
          disabled={disabled || pending || !value || !onRemove}
          onPress={() => {
            if (onRemove) void requests.run("action", onRemove);
          }}
        >
          Remove
        </Button>
      </Row>
      {!onChoose ? (
        <Text size={12} color={c.muted}>
          Image selection unavailable
        </Text>
      ) : null}
      {error || requests.failed("action") ? (
        <Text testId={testId + "-error"} color={c.danger}>
          {error ?? "Image operation failed. Retry."}
        </Text>
      ) : null}
    </Stack>
  );
}
export interface VideoState {
  status: "idle" | "loading" | "paused" | "playing" | "ended" | "error";
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  error?: string;
}
export interface VideoPlayerAdapter {
  play?: () => void | Promise<void>;
  pause?: () => void | Promise<void>;
  seek?: (seconds: number) => void | Promise<void>;
  setVolume?: (value: number) => void | Promise<void>;
  setMuted?: (value: boolean) => void | Promise<void>;
  enterFullscreen?: () => void | Promise<void>;
}
export function VideoPlayer({
  sourceId,
  state,
  adapter,
  surface,
  poster,
  height = 180,
  disabled,
  testId,
}: {
  sourceId: string;
  state: VideoState;
  adapter?: VideoPlayerAdapter;
  surface?: ReactNode;
  poster?: string;
  height?: number;
  disabled?: boolean;
  testId: string;
}) {
  const { colors: c } = useTheme(),
    requests = useRequestActions(sourceId, ["command"]),
    pending = requests.pending("command"),
    blocked = disabled || pending || state.status === "loading",
    duration = bounded(state.duration, 0, 864000),
    position = bounded(state.currentTime, 0, duration);
  const run = (action: (() => void | Promise<void>) | undefined) => {
    if (action) void requests.run("command", action);
  };
  const time = (s: number) =>
    Math.floor(s / 60) + ":" + String(Math.floor(s % 60)).padStart(2, "0");
  return (
    <Stack testId={testId}>
      <div
        testId={testId + "-surface"}
        style={{
          height: bounded(height, 80, 800),
          overflow: "hidden",
          backgroundColor: c.subtle,
        }}
      >
        {surface ??
          (poster ? (
            <img
              src={poster}
              alt="Video poster"
              objectFit="contain"
              style={{ width: 280, height: bounded(height, 80, 800) }}
            />
          ) : (
            <Text color={c.muted}>Video surface unavailable</Text>
          ))}
      </div>
      <Row>
        <Button
          testId={testId + "-play"}
          loading={pending}
          disabled={
            blocked ||
            !(state.status === "playing" ? adapter?.pause : adapter?.play)
          }
          onPress={() =>
            run(state.status === "playing" ? adapter?.pause : adapter?.play)
          }
        >
          {state.status === "playing" ? "Pause" : "Play"}
        </Button>
        <Text testId={testId + "-time"}>
          {time(position)} / {time(duration)}
        </Text>
        <Button
          testId={testId + "-mute"}
          disabled={blocked || !adapter?.setMuted}
          onPress={() => run(() => adapter!.setMuted!(!state.muted))}
        >
          {state.muted ? "Unmute" : "Mute"}
        </Button>
      </Row>
      <Slider
        testId={testId + "-seek"}
        value={position}
        min={0}
        max={Math.max(1, duration)}
        disabled={blocked || !duration || !adapter?.seek}
        onValueChange={(seconds) => run(() => adapter!.seek!(seconds))}
      />
      <Slider
        testId={testId + "-volume"}
        value={bounded(state.volume, 0, 1) * 100}
        min={0}
        max={100}
        disabled={blocked || !adapter?.setVolume}
        onValueChange={(n) => run(() => adapter!.setVolume!(n / 100))}
      />
      <Button
        testId={testId + "-fullscreen"}
        disabled={blocked || !adapter?.enterFullscreen}
        onPress={() => run(adapter?.enterFullscreen)}
      >
        Fullscreen
      </Button>
      {!adapter ? (
        <Text testId={testId + "-unsupported"} color={c.muted}>
          Playback adapter not provided
        </Text>
      ) : null}
      {state.status === "error" || requests.failed("command") ? (
        <Text testId={testId + "-error"} color={c.danger}>
          {state.error ?? "Playback operation failed. Retry."}
        </Text>
      ) : null}
    </Stack>
  );
}
export function FileUploader({
  files,
  onChoose,
  onRetry,
  onRemove,
  onOpen,
  disabled,
  revision = 0,
  testId,
}: {
  files: readonly FileItem[];
  onChoose?: () => void | Promise<void>;
  onRetry?: (id: string) => void | Promise<void>;
  onRemove?: (id: string) => void | Promise<void>;
  onOpen?: (id: string) => void | Promise<void>;
  disabled?: boolean;
  revision?: string | number;
  testId: string;
}) {
  const { colors: c } = useTheme(),
    [page, setPage] = useState(0),
    pages = Math.max(1, Math.ceil(files.length / 5)),
    current = Math.min(page, pages - 1),
    requests = useRequestActions(String(revision), ["action"]),
    pending = requests.pending("action"),
    error = catalogError(files);
  const run = (action: () => void | Promise<void>) =>
    void requests.run("action", action);
  if (error)
    return (
      <Text testId={testId + "-error"} color={c.danger}>
        {error}
      </Text>
    );
  return (
    <Stack testId={testId}>
      <Button
        testId={testId + "-choose"}
        disabled={disabled || !onChoose}
        loading={pending}
        onPress={() => {
          if (onChoose) run(onChoose);
        }}
      >
        Choose files
      </Button>
      {!onChoose ? (
        <Text color={c.muted}>File selection unavailable</Text>
      ) : null}
      <FileList
        testId={testId + "-files"}
        files={files
          .slice(current * 5, current * 5 + 5)
          .map((f) => ({ ...f, disabled: disabled || pending || f.disabled }))}
        onRetry={onRetry ? (id) => run(() => onRetry(id)) : undefined}
        onRemove={onRemove ? (id) => run(() => onRemove(id)) : undefined}
        onOpen={onOpen ? (id) => run(() => onOpen(id)) : undefined}
      />
      <Row>
        <Button
          testId={testId + "-previous"}
          disabled={current === 0}
          onPress={() => setPage(current - 1)}
        >
          Previous
        </Button>
        <Text>
          {current + 1} / {pages}
        </Text>
        <Button
          testId={testId + "-next"}
          disabled={current === pages - 1}
          onPress={() => setPage(current + 1)}
        >
          Next
        </Button>
      </Row>
      {requests.failed("action") ? (
        <Text testId={testId + "-error"} color={c.danger}>
          File operation failed. Retry.
        </Text>
      ) : null}
    </Stack>
  );
}

export type CarouselProps = Parameters<typeof Carousel>[0];

export type ImageViewerProps = Parameters<typeof ImageViewer>[0];

export type ImagePickerProps = Parameters<typeof ImagePicker>[0];

export type VideoPlayerProps = Parameters<typeof VideoPlayer>[0];

export type FileUploaderProps = Parameters<typeof FileUploader>[0];
