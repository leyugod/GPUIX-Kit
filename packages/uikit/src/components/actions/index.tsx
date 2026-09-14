import { useRef, type ReactNode } from "react";
import { useGpuix, type PublicInstance } from "@gpuix/react";
import { Button, Row, Stack, Text, type ButtonVariant } from "../../base";
import { useTheme } from "../../core/theme";
import { focusElement } from "../../core/focus";
import { ActionMenu, type ActionMenuOptions } from "./menu";
import {
  actionEnabled,
  collectionError,
  nextActionId,
  partitionActions,
  partitionPath,
  visibleActions,
  type UIKitAction,
  type PathItem,
  type WorkspaceItem,
} from "./model";
export type { UIKitAction, PathItem, WorkspaceItem } from "./model";
export { collectionError, partitionActions, partitionPath } from "./model";
export interface ButtonGroupProps {
  items: readonly UIKitAction[];
  testId: string;
  disabled?: boolean;
  orientation?: "horizontal" | "vertical";
  variant?: ButtonVariant;
  itemWidth?: number;
}
function ErrorLabel({ error, testId }: { error: string; testId: string }) {
  const { colors: c } = useTheme();
  return (
    <Text testId={`${testId}-error`} color={c.danger} size={12}>
      {error}
    </Text>
  );
}
/** 动作按钮组不持有选择状态；互斥选择应使用 SegmentedControl。 */
export function ButtonGroup({
  items,
  testId,
  disabled,
  orientation = "horizontal",
  variant = "default",
  itemWidth = 120,
}: ButtonGroupProps) {
  const { renderer } = useGpuix();
  const refs = useRef(new Map<string, PublicInstance>());
  const error = collectionError(items, 12);
  if (error) return <ErrorLabel error={error} testId={testId} />;
  const visible = visibleActions(items);
  const width = Number.isFinite(itemWidth)
    ? Math.max(48, Math.min(320, itemWidth))
    : 120;
  return (
    <Row
      testId={testId}
      gap={0}
      style={{
        flexDirection: orientation === "vertical" ? "column" : "row",
        alignItems: "stretch",
      }}
    >
      {visible.map((item, index) => (
        <Button
          key={item.id}
          ref={(node) => {
            if (node) refs.current.set(item.id, node);
            else refs.current.delete(item.id);
          }}
          testId={`${testId}-${item.id}`}
          disabled={disabled || item.disabled}
          loading={item.loading}
          variant={item.destructive ? "destructive" : variant}
          labelLines={1}
          style={{
            width,
            borderTopLeftRadius: index === 0 ? 6 : 0,
            borderBottomLeftRadius:
              orientation === "vertical"
                ? index === visible.length - 1
                  ? 6
                  : 0
                : index === 0
                  ? 6
                  : 0,
            borderTopRightRadius:
              orientation === "vertical"
                ? index === 0
                  ? 6
                  : 0
                : index === visible.length - 1
                  ? 6
                  : 0,
            borderBottomRightRadius: index === visible.length - 1 ? 6 : 0,
          }}
          onPress={() => {
            if (!disabled && actionEnabled(item)) item.run();
          }}
          onKeyDown={(event) => {
            if (
              !(
                orientation === "vertical"
                  ? ["up", "down", "home", "end"]
                  : ["left", "right", "home", "end"]
              ).includes(event.key ?? "")
            )
              return false;
            const target = nextActionId(visible, item.id, event.key!);
            const node = target && refs.current.get(target);
            if (node) focusElement(renderer, node.id);
            return true;
          }}
        >
          {item.label}
        </Button>
      ))}
    </Row>
  );
}
export interface SplitButtonProps extends ActionMenuOptions {
  primary: UIKitAction;
  items: readonly UIKitAction[];
  testId: string;
  menuLabel?: string;
}
export function SplitButton({
  primary,
  items,
  testId,
  menuLabel = "▾",
  ...menu
}: SplitButtonProps) {
  const error = collectionError(items) ?? collectionError([primary], 1);
  if (error) return <ErrorLabel error={error} testId={testId} />;
  return (
    <Row testId={testId} gap={2}>
      {!primary.hidden ? (
        <Button
          testId={`${testId}-primary`}
          variant={primary.destructive ? "destructive" : "primary"}
          labelLines={1}
          style={{ maxWidth: 220 }}
          disabled={menu.disabled || primary.disabled}
          loading={menu.loading || primary.loading}
          onPress={() => {
            if (!menu.disabled && !menu.loading && actionEnabled(primary))
              primary.run();
          }}
        >
          {primary.label}
        </Button>
      ) : null}
      <ActionMenu
        {...menu}
        disabled={
          menu.disabled || !!primary.loading || !visibleActions(items).length
        }
        label={menuLabel}
        items={items}
        testId={`${testId}-menu`}
      />
    </Row>
  );
}
export interface ToolbarActionsProps extends ActionMenuOptions {
  items: readonly UIKitAction[];
  visibleCount: number;
  testId: string;
  overflowLabel?: string;
  itemWidth?: number;
}
export function ToolbarActions({
  items,
  visibleCount,
  testId,
  overflowLabel = "More ···",
  itemWidth,
  ...menu
}: ToolbarActionsProps) {
  const error = collectionError(items);
  if (error) return <ErrorLabel error={error} testId={testId} />;
  const parts = partitionActions(items, visibleCount);
  return (
    <Row testId={testId} gap={8}>
      <ButtonGroup
        items={parts.visible}
        testId={`${testId}-visible`}
        disabled={menu.disabled || menu.loading}
        variant="ghost"
        itemWidth={itemWidth}
      />
      {parts.overflow.length ? (
        <ActionMenu
          {...menu}
          label={overflowLabel}
          items={parts.overflow}
          testId={`${testId}-overflow`}
        />
      ) : null}
    </Row>
  );
}
export interface PathControlProps extends ActionMenuOptions {
  items: readonly PathItem[];
  onNavigate: (id: string) => void;
  testId: string;
  maxVisible?: number;
  segmentWidth?: number;
}
export function PathControl({
  items,
  onNavigate,
  testId,
  maxVisible = 4,
  segmentWidth = 120,
  ...menu
}: PathControlProps) {
  const error = collectionError(items, 64);
  const { colors: c } = useTheme();
  if (error) return <ErrorLabel error={error} testId={testId} />;
  const parts = partitionPath(items, maxVisible);
  const last = items.at(-1)?.id;
  const width = Number.isFinite(segmentWidth)
    ? Math.max(48, Math.min(240, segmentWidth))
    : 120;
  const segment = (item: PathItem) => (
    <Row key={item.id} gap={6}>
      {item.id === last ? (
        <Text
          testId={`${testId}-current`}
          lines={1}
          size={12}
          weight={600}
          style={{ width }}
        >
          {item.label}
        </Text>
      ) : (
        <Button
          testId={`${testId}-${item.id}`}
          disabled={menu.disabled || menu.loading || item.disabled}
          size="sm"
          variant="ghost"
          labelLines={1}
          style={{ width }}
          onPress={() => onNavigate(item.id)}
        >
          {item.label}
        </Button>
      )}
      {item.id !== last ? <Text color={c.faint}>›</Text> : null}
    </Row>
  );
  return (
    <Row testId={testId} gap={6}>
      {parts.leading.map(segment)}
      {parts.hidden.length ? (
        <Row gap={6}>
          <ActionMenu
            {...menu}
            label="···"
            testId={`${testId}-overflow`}
            items={parts.hidden.map((item) => ({
              ...item,
              run: () => onNavigate(item.id),
            }))}
          />
          <Text color={c.faint}>›</Text>
        </Row>
      ) : null}
      {parts.trailing.map(segment)}
    </Row>
  );
}
export interface WorkspaceSwitcherProps extends ActionMenuOptions {
  items: readonly WorkspaceItem[];
  value: string | null;
  onValueChange: (id: string) => void;
  testId: string;
  placeholder?: string;
  readOnly?: boolean;
}
export function WorkspaceSwitcher({
  items,
  value,
  onValueChange,
  testId,
  placeholder = "Select workspace",
  readOnly,
  ...menu
}: WorkspaceSwitcherProps) {
  const { colors: c } = useTheme();
  const error = collectionError(items);
  if (error) return <ErrorLabel error={error} testId={testId} />;
  const current = items.find((item) => item.id === value);
  return (
    <ActionMenu
      {...menu}
      disabled={menu.disabled || readOnly}
      testId={testId}
      label={`${current?.label ?? placeholder} ▾`}
      header={
        current?.description ? (
          <Text lines={2} size={11} color={c.muted}>
            {current.description}
          </Text>
        ) : undefined
      }
      emptyLabel="No available workspaces"
      items={items.map((item) => ({
        ...item,
        checked: item.id === value,
        run: () => {
          if (item.id !== value) onValueChange(item.id);
        },
      }))}
    />
  );
}
export interface AccountMenuProps extends ActionMenuOptions {
  account: { name: string; detail?: string; avatar?: ReactNode };
  items: readonly UIKitAction[];
  testId: string;
}
export function AccountMenu({
  account,
  items,
  testId,
  ...menu
}: AccountMenuProps) {
  const { colors: c } = useTheme();
  const error = collectionError(items);
  if (error) return <ErrorLabel error={error} testId={testId} />;
  return (
    <ActionMenu
      {...menu}
      label={`${account.name} ▾`}
      items={items}
      testId={testId}
      header={
        <Row style={{ padding: 6 }}>
          {account.avatar}
          <Stack gap={3} style={{ flexShrink: 1 }}>
            <Text weight={600} lines={1}>
              {account.name}
            </Text>
            {account.detail ? (
              <Text size={11} lines={1} color={c.muted}>
                {account.detail}
              </Text>
            ) : null}
          </Stack>
        </Row>
      }
    />
  );
}
