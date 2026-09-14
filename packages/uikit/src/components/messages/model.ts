export interface MessageAttachment {
  id: string;
  name: string;
  state: "ready" | "loading" | "failed";
}
export interface MessageDraft {
  text: string;
  attachmentIds: readonly string[];
  replyToId?: string;
}
export function canSendMessage(
  text: string,
  attachments: readonly MessageAttachment[],
  maxLength = 10000,
) {
  return (
    text.length <= maxLength &&
    attachments.every((a) => a.state === "ready") &&
    (text.trim().length > 0 || attachments.length > 0)
  );
}
