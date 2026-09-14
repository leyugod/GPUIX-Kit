import { useState, type ReactNode } from "react";
import { Button, Input, Textarea, Row, Stack, Text } from "../../base";
import { Markdown } from "../../data";
import { useTheme } from "../../core/theme";
import {
  richDocumentError,
  updateRichBlock,
  richMarkdown,
  validLink,
  type RichDocument,
  type RichBlock,
} from "../catalog-model";
export type { RichDocument, RichBlock } from "../catalog-model";
export {
  richDocumentError,
  richMarkdown,
  updateRichBlock,
} from "../catalog-model";
export interface RichTextEditorProps {
  value: RichDocument;
  onValueChange: (value: RichBlock[]) => void;
  readOnly?: boolean;
  disabled?: boolean;
  revision?: string | number;
  testId: string;
  renderEditor?: (props: {
    value: RichDocument;
    onValueChange: (value: RichBlock[]) => void;
    disabled: boolean;
    readOnly: boolean;
  }) => ReactNode;
}
/** 默认提供原生分块富文本编辑；自定义宿主编辑器通过 renderEditor 接入同一文档契约。 */
export function RichTextEditor(props: RichTextEditorProps) {
  return <Editor key={JSON.stringify([props.revision])} {...props} />;
}
function Editor({
  value,
  onValueChange,
  readOnly = false,
  disabled = false,
  testId,
  renderEditor,
}: RichTextEditorProps) {
  const { colors: c } = useTheme(),
    [activeId, setActiveId] = useState(value[0]?.id ?? ""),
    [link, setLink] = useState(""),
    [past, setPast] = useState<RichBlock[][]>([]),
    [future, setFuture] = useState<RichBlock[][]>([]),
    [expected, setExpected] = useState(JSON.stringify(value));
  const current = JSON.stringify(value);
  if (current !== expected) {
    setExpected(current);
    setPast([]);
    setFuture([]);
  }
  const active = value.find((b) => b.id === activeId) ?? value[0],
    error = richDocumentError(value),
    blocked = disabled || readOnly;
  if (error || !active)
    return (
      <Text testId={testId + "-error"} color={c.danger}>
        {error ?? "No content"}
      </Text>
    );
  const clone = (doc: RichDocument) => doc.map((b) => ({ ...b }));
  const emit = (next: RichBlock[]) => {
    if (blocked || richDocumentError(next)) return;
    setPast([...past.slice(-49), clone(value)]);
    setFuture([]);
    setExpected(JSON.stringify(next));
    onValueChange(next);
  };
  const update = (patch: Partial<Omit<RichBlock, "id">>) =>
    emit(updateRichBlock(value, active.id, patch));
  const activeIndex = value.indexOf(active);
  return (
    <Stack testId={testId}>
      <Row style={{ flexWrap: "wrap" }}>
        {(["paragraph", "heading", "bullet", "quote"] as const).map((kind) => (
          <Button
            key={kind}
            testId={testId + "-" + kind}
            disabled={blocked}
            variant={active.kind === kind ? "secondary" : "ghost"}
            onPress={() => update({ kind })}
          >
            {kind}
          </Button>
        ))}
        <Button
          testId={testId + "-bold"}
          disabled={blocked}
          variant={active.bold ? "secondary" : "ghost"}
          onPress={() => update({ bold: !active.bold })}
        >
          Bold
        </Button>
        <Button
          testId={testId + "-italic"}
          disabled={blocked}
          variant={active.italic ? "secondary" : "ghost"}
          onPress={() => update({ italic: !active.italic })}
        >
          Italic
        </Button>
      </Row>
      <Row>
        <Button
          testId={testId + "-previous"}
          disabled={activeIndex === 0}
          onPress={() => setActiveId(value[activeIndex - 1]!.id)}
        >
          Previous block
        </Button>
        <Text>
          {activeIndex + 1} / {value.length}
        </Text>
        <Button
          testId={testId + "-next"}
          disabled={activeIndex === value.length - 1}
          onPress={() => setActiveId(value[activeIndex + 1]!.id)}
        >
          Next block
        </Button>
      </Row>
      {renderEditor ? (
        renderEditor({ value, onValueChange: emit, disabled, readOnly })
      ) : (
        <Textarea
          testId={testId + "-input"}
          value={active.text}
          resetKey={active.id}
          disabled={disabled}
          readOnly={readOnly}
          onValueChange={(text) => {
            if (text.length <= 10000) update({ text });
          }}
          minRows={3}
          maxRows={5}
        />
      )}
      <Row>
        <Input
          testId={testId + "-link-input"}
          value={link}
          onValueChange={setLink}
          disabled={blocked}
          placeholder="https://…"
          invalid={!!link && !validLink(link)}
          style={{ width: 220 }}
        />
        <Button
          testId={testId + "-link"}
          disabled={blocked || !validLink(link)}
          onPress={() => update({ link })}
        >
          Set link
        </Button>
        <Button
          testId={testId + "-unlink"}
          disabled={blocked || !active.link}
          onPress={() => update({ link: undefined })}
        >
          Unlink
        </Button>
      </Row>
      <Row style={{ flexWrap: "wrap" }}>
        <Button
          testId={testId + "-add"}
          disabled={blocked || value.length >= 100}
          onPress={() => {
            let n = 1;
            while (value.some((b) => b.id === "block-" + n)) n++;
            const id = "block-" + n;
            emit([...clone(value), { id, kind: "paragraph", text: "" }]);
            setActiveId(id);
          }}
        >
          Add block
        </Button>
        <Button
          testId={testId + "-remove"}
          disabled={blocked || value.length === 1}
          onPress={() => {
            const next = value.filter((b) => b.id !== active.id);
            emit(clone(next));
            setActiveId(next[Math.min(activeIndex, next.length - 1)]!.id);
          }}
        >
          Remove block
        </Button>
        <Button
          testId={testId + "-undo"}
          disabled={blocked || !past.length}
          onPress={() => {
            const previous = past[past.length - 1]!;
            setPast(past.slice(0, -1));
            setFuture([clone(value), ...future]);
            setExpected(JSON.stringify(previous));
            onValueChange(clone(previous));
          }}
        >
          Undo
        </Button>
        <Button
          testId={testId + "-redo"}
          disabled={blocked || !future.length}
          onPress={() => {
            const next = future[0]!;
            setFuture(future.slice(1));
            setPast([...past, clone(value)]);
            setExpected(JSON.stringify(next));
            onValueChange(clone(next));
          }}
        >
          Redo
        </Button>
      </Row>
      <Text size={12} color={c.muted}>
        Formatted preview
      </Text>
      <div style={{ maxHeight: 200, overflowY: "scroll" }}>
        <Markdown testId={testId + "-preview"} source={richMarkdown(value)} />
      </div>
    </Stack>
  );
}
