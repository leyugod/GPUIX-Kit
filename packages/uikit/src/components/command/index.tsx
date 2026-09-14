import { useEffect, useRef, useState } from "react";
import { type PublicInstance } from "@gpuix/react";
import { Button, Input, Row, Stack, Text } from "../../base";
import { Dialog, type DialogProps } from "../../overlays";
import { useTheme } from "../../core/theme";
import { filterCommands, type Command } from "../../interaction/commands";
export interface CommandPaletteProps
  extends Pick<
    DialogProps,
    "open" | "onOpenChange" | "restoreFocusRef" | "testId"
  > {
  commands: readonly Command[];
  title?: string;
  placeholder?: string;
  emptyLabel?: string;
}
export function CommandPalette({
  commands,
  title = "Commands",
  placeholder = "Search commands…",
  emptyLabel = "No matching commands",
  ...props
}: CommandPaletteProps) {
  const input = useRef<PublicInstance>(null);
  const [offset, setOffset] = useState(0);
  return (
    <Dialog
      bodyScrollOffset={offset}
      initialFocusRef={input}
      {...props}
      title={title}
      width={560}
    >
      <CommandSearch
        onScrollOffset={setOffset}
        inputRef={input}
        key={String(props.open)}
        commands={commands}
        placeholder={placeholder}
        emptyLabel={emptyLabel}
        testId={props.testId}
        onClose={() => props.onOpenChange(false)}
      />
    </Dialog>
  );
}
function CommandSearch({
  onScrollOffset,
  inputRef,
  commands,
  placeholder,
  emptyLabel,
  testId,
  onClose,
}: {
  onScrollOffset: (offset: number) => void;
  inputRef: React.RefObject<PublicInstance | null>;
  commands: readonly Command[];
  placeholder: string;
  emptyLabel: string;
  testId: string;
  onClose: () => void;
}) {
  const { colors: c } = useTheme();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<string | null>(null);
  const results = filterCommands(commands, query);
  const enabled = results.slice(0, 50).filter((c) => !c.disabled);
  const selected = enabled.find((c) => c.id === active) ?? enabled[0];
  const index = results.findIndex((c) => c.id === selected?.id);
  useEffect(
    () => onScrollOffset(Math.max(0, index - 4) * 40),
    [index, onScrollOffset],
  );
  const run = (c: Command) => {
    if (!c.disabled) {
      onClose();
      c.run();
    }
  };
  return (
    <Stack>
      <Input
        ref={inputRef}
        testId={`${testId}-search`}
        value={query}
        placeholder={placeholder}
        onValueChange={(v) => {
          setQuery(v);
          setActive(null);
        }}
        onSubmit={() => {
          if (selected) run(selected);
        }}
        onKeyDown={(event) => {
          if (event.key === "up" || event.key === "down") {
            const index = enabled.findIndex((c) => c.id === selected?.id);
            setActive(
              enabled[
                (index + (event.key === "down" ? 1 : -1) + enabled.length) %
                  enabled.length
              ]?.id ?? null,
            );
            return true;
          }
          return false;
        }}
      />
      <Stack gap={4}>
        {results.slice(0, 50).map((command) => (
          <Button
            key={command.id}
            testId={`${testId}-${command.id}`}
            disabled={command.disabled}
            variant="ghost"
            fullWidth
            style={{
              justifyContent: "space-between",
              backgroundColor:
                selected?.id === command.id ? c.accentSoft : "transparent",
            }}
            onPress={() => run(command)}
            trailing={
              <Row>
                <Text size={11} color={c.muted}>
                  {command.group ?? ""}
                </Text>
                <Text size={11} color={c.muted}>
                  {command.shortcut ?? ""}
                </Text>
              </Row>
            }
          >
            {command.label}
          </Button>
        ))}
      </Stack>
      {!results.length ? <Text color={c.muted}>{emptyLabel}</Text> : null}
      {results.length > 50 ? (
        <Text size={11} color={c.muted}>
          Refine your search to see more commands.
        </Text>
      ) : null}
    </Stack>
  );
}
