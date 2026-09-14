import { useEffect, useRef, useState } from "react";
import { useGpuix, type PublicInstance } from "@gpuix/react";
import { Button, Row, Stack, Text, Textarea } from "../../base";
import { Avatar, Badge } from "../../data";
import { useTheme } from "../../core/theme";
import {
  canSendMessage,
  type MessageAttachment,
  type MessageDraft,
} from "./model";
export interface Message {
  id: string;
  author: string;
  text: string;
  timeLabel?: string;
  direction: "incoming" | "outgoing" | "system";
  status?: "sent" | "sending" | "streaming" | "failed" | "stopped";
  error?: string;
  attachments?: readonly MessageAttachment[];
  reply?: { author: string; text: string };
}
export interface MessageBubbleProps {
  message: Message;
  testId: string;
  onRetry?: (id: string) => void;
  onReply?: (id: string) => void;
  onOpenAttachment?: (messageId: string, attachmentId: string) => void;
}
export function MessageBubble({
  message,
  testId,
  onRetry,
  onReply,
  onOpenAttachment,
}: MessageBubbleProps) {
  const { colors: c } = useTheme();
  if (message.direction === "system")
    return (
      <Text testId={testId} size={11} color={c.muted} style={{ padding: 10 }}>
        {message.text}
      </Text>
    );
  return (
    <Row
      testId={testId}
      gap={10}
      style={{
        alignItems: "flex-start",
        justifyContent:
          message.direction === "outgoing" ? "flex-end" : "flex-start",
      }}
    >
      {message.direction === "incoming" ? (
        <Avatar name={message.author} size={28} />
      ) : null}
      <Stack
        gap={7}
        style={{
          maxWidth: "85%",
          minWidth: 0,
          flexShrink: 1,
          padding: 12,
          borderWidth: 1,
          borderColor: message.status === "failed" ? c.danger : c.border,
          borderRadius: 12,
          backgroundColor:
            message.direction === "outgoing" ? c.accentSoft : c.surface,
        }}
      >
        <Row gap={12} style={{ flexWrap: "wrap" }}>
          <Text size={11} weight={600}>
            {message.author}
          </Text>
          {message.timeLabel ? (
            <Text size={10} color={c.muted}>
              {message.timeLabel}
            </Text>
          ) : null}
        </Row>
        {message.reply ? (
          <Stack
            gap={3}
            style={{
              paddingLeft: 8,
              borderLeftWidth: 2,
              borderColor: c.accent,
            }}
          >
            <Text size={11} color={c.accent}>
              {message.reply.author}
            </Text>
            <Text size={11} color={c.muted} lines={2}>
              {message.reply.text}
            </Text>
          </Stack>
        ) : null}
        <Text
          testId={`${testId}-text`}
          size={13}
          style={{ userSelect: "text" }}
        >
          {message.text || (message.status === "streaming" ? "…" : "")}
        </Text>
        {message.attachments?.map((attachment) => (
          <Button
            key={attachment.id}
            testId={`${testId}-attachment-${attachment.id}`}
            size="sm"
            variant="secondary"
            disabled={attachment.state !== "ready" || !onOpenAttachment}
            onPress={() => onOpenAttachment?.(message.id, attachment.id)}
          >
            {attachment.name}
            {attachment.state === "ready" ? "" : ` · ${attachment.state}`}
          </Button>
        ))}
        <Row gap={6} style={{ flexWrap: "wrap" }}>
          {message.status && message.status !== "sent" ? (
            <Badge tone={message.status === "failed" ? "danger" : "neutral"}>
              {message.status}
            </Badge>
          ) : null}
          {message.status === "failed" && onRetry ? (
            <Button
              testId={`${testId}-retry`}
              size="sm"
              variant="ghost"
              onPress={() => onRetry(message.id)}
            >
              Retry
            </Button>
          ) : null}
          {onReply ? (
            <Button
              testId={`${testId}-reply`}
              size="sm"
              variant="ghost"
              onPress={() => onReply(message.id)}
            >
              Reply
            </Button>
          ) : null}
        </Row>
        {message.status === "failed" && message.error ? (
          <Text size={11} color={c.danger}>
            {message.error}
          </Text>
        ) : null}
      </Stack>
    </Row>
  );
}
export interface MessageListProps extends Omit<MessageBubbleProps, "message"> {
  messages: readonly Message[];
  height?: number;
  loading?: boolean;
  hasEarlier?: boolean;
  onLoadEarlier?: () => void;
  followTail?: boolean;
  onFollowTailChange?: (follow: boolean) => void;
  emptyLabel?: string;
}
/** 接收当前消息窗口；自动跟随由应用控制，读取历史时可关闭 followTail。 */
export function MessageList({
  messages,
  height = 340,
  testId,
  loading = false,
  hasEarlier = false,
  onLoadEarlier,
  followTail = false,
  onFollowTailChange,
  emptyLabel = "No messages yet",
  ...actions
}: MessageListProps) {
  const { colors: c } = useTheme();
  const { renderer } = useGpuix();
  const scroll = useRef<PublicInstance>(null);
  const bottom = () => {
    if (scroll.current) renderer?.scrollTo?.(scroll.current.id, 0, -1e9);
  };
  useEffect(() => {
    if (followTail) bottom();
  }, [renderer, followTail, messages]);
  return (
    <Stack gap={8}>
      {hasEarlier && onLoadEarlier ? (
        <Button
          testId={`${testId}-earlier`}
          loading={loading}
          loadingText="Loading…"
          onPress={onLoadEarlier}
        >
          Load earlier messages
        </Button>
      ) : null}
      <div
        ref={scroll}
        testId={testId}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          height,
          minHeight: 0,
          overflowY: "scroll",
          padding: 12,
        }}
      >
        {!messages.length ? (
          <Text
            testId={`${testId}-${loading ? "loading" : "empty"}`}
            size={12}
            color={c.muted}
          >
            {loading ? "Loading messages…" : emptyLabel}
          </Text>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              testId={`${testId}-${message.id}`}
              message={message}
              {...actions}
            />
          ))
        )}
      </div>
      {!followTail && messages.length ? (
        <Button
          testId={`${testId}-latest`}
          size="sm"
          variant="ghost"
          onPress={() => {
            bottom();
            onFollowTailChange?.(true);
          }}
        >
          Jump to latest
        </Button>
      ) : null}
    </Stack>
  );
}
export interface MessageComposerProps {
  value: string;
  onValueChange: (value: string) => void;
  onSend: (draft: MessageDraft) => void | Promise<void>;
  attachments?: readonly MessageAttachment[];
  onRemoveAttachment?: (id: string) => void;
  onAttach?: () => void;
  replyTo?: { id: string; author: string; text: string };
  onCancelReply?: () => void;
  state?: "idle" | "sending" | "streaming";
  onStop?: () => void;
  disabled?: boolean;
  maxLength?: number;
  testId: string;
  placeholder?: string;
  sendLabel?: string;
  errorLabel?: string;
}
export function MessageComposer({
  value,
  onValueChange,
  onSend,
  attachments = [],
  onRemoveAttachment,
  onAttach,
  replyTo,
  onCancelReply,
  state = "idle",
  onStop,
  disabled = false,
  maxLength = 10000,
  testId,
  placeholder = "Write a message…",
  sendLabel = "Send",
  errorLabel = "Unable to send. Your draft is unchanged.",
}: MessageComposerProps) {
  const { colors: c } = useTheme();
  const [pending, setPending] = useState(false),
    [error, setError] = useState<string | null>(null);
  const lock = useRef(false),
    mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const blocked = disabled || pending || state !== "idle";
  const valid = canSendMessage(value, attachments, maxLength);
  const send = async () => {
    if (blocked || lock.current || !valid) return;
    lock.current = true;
    setPending(true);
    setError(null);
    const snapshot: MessageDraft = {
      text: value,
      attachmentIds: attachments.map((a) => a.id),
      ...(replyTo ? { replyToId: replyTo.id } : {}),
    };
    try {
      await onSend(snapshot);
    } catch {
      if (mounted.current) setError(errorLabel);
    } finally {
      lock.current = false;
      if (mounted.current) setPending(false);
    }
  };
  return (
    <Stack
      testId={testId}
      gap={8}
      style={{
        padding: 12,
        borderWidth: 1,
        borderColor: error || value.length > maxLength ? c.danger : c.border,
        borderRadius: 12,
        backgroundColor: c.surface,
      }}
    >
      {replyTo ? (
        <Row style={{ justifyContent: "space-between" }}>
          <Stack gap={3} style={{ flexGrow: 1, flexShrink: 1 }}>
            <Text size={11} color={c.accent}>
              Replying to {replyTo.author}
            </Text>
            <Text size={11} color={c.muted} lines={1}>
              {replyTo.text}
            </Text>
          </Stack>
          {onCancelReply ? (
            <Button
              testId={`${testId}-cancel-reply`}
              size="sm"
              variant="ghost"
              disabled={blocked}
              onPress={onCancelReply}
            >
              Cancel reply
            </Button>
          ) : null}
        </Row>
      ) : null}
      {attachments.length ? (
        <Row style={{ flexWrap: "wrap" }}>
          {attachments.map((a) => (
            <Button
              key={a.id}
              testId={`${testId}-remove-${a.id}`}
              size="sm"
              variant="secondary"
              disabled={blocked || !onRemoveAttachment}
              onPress={() => onRemoveAttachment?.(a.id)}
            >{`${a.name}${a.state === "ready" ? "" : ` · ${a.state}`} ×`}</Button>
          ))}
        </Row>
      ) : null}
      <Textarea
        testId={`${testId}-input`}
        value={value}
        onValueChange={(next) => {
          if (!lock.current) {
            onValueChange(next);
            setError(null);
          }
        }}
        disabled={blocked}
        invalid={value.length > maxLength}
        placeholder={placeholder}
        minRows={2}
        maxRows={4}
        onSubmit={() => {
          void send();
        }}
      />
      <Row style={{ justifyContent: "space-between" }}>
        <Row>
          {onAttach ? (
            <Button
              testId={`${testId}-attach`}
              size="sm"
              variant="ghost"
              disabled={blocked}
              onPress={onAttach}
            >
              Attach
            </Button>
          ) : null}
          <Text
            testId={`${testId}-count`}
            size={10}
            color={value.length > maxLength ? c.danger : c.muted}
          >
            {value.length}/{maxLength}
          </Text>
        </Row>
        {state === "streaming" && onStop ? (
          <Button
            testId={`${testId}-stop`}
            size="sm"
            disabled={disabled || pending}
            onPress={onStop}
          >
            Stop
          </Button>
        ) : (
          <Button
            testId={`${testId}-send`}
            size="sm"
            variant="primary"
            disabled={disabled || state !== "idle" || !valid}
            loading={pending || state === "sending"}
            loadingText="Sending…"
            onPress={() => {
              void send();
            }}
          >
            {sendLabel}
          </Button>
        )}
      </Row>
      {error ? (
        <Text testId={`${testId}-error`} size={11} color={c.danger}>
          {error}
        </Text>
      ) : attachments.some((a) => a.state !== "ready") ? (
        <Text
          testId={`${testId}-pending-attachments`}
          size={11}
          color={c.warning}
        >
          Attachments must be ready before sending.
        </Text>
      ) : null}
    </Stack>
  );
}
export {
  canSendMessage,
  type MessageDraft,
  type MessageAttachment,
} from "./model";
