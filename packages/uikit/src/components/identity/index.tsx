import { type ReactNode } from "react";
import {
  RadioGroup,
  Button,
  Row,
  Stack,
  Text,
  type ButtonProps,
} from "../../base";
import { Avatar, Badge } from "../../data";
import { useTheme } from "../../core/theme";
import { type Tone } from "../../core/tokens";
import { catalogError, bounded } from "../catalog-model";
export interface AvatarMember {
  id: string;
  name: string;
  src?: string;
  status?: "online" | "offline" | "busy";
}
export function AvatarGroup({
  items,
  max = 5,
  onOverflow,
  testId,
}: {
  items: readonly AvatarMember[];
  max?: number;
  onOverflow?: () => void;
  testId: string;
}) {
  const { colors: c } = useTheme(),
    limit = Math.floor(bounded(max, 1, 10)),
    error = catalogError(items);
  if (error)
    return (
      <Text testId={testId + "-error"} color={c.danger}>
        {error}
      </Text>
    );
  return (
    <Row testId={testId} gap={4}>
      {items.slice(0, limit).map((i) => (
        <Stack gap={3} key={i.id}>
          <Avatar name={i.name} src={i.src} testId={testId + "-" + i.id} />
          {i.status ? (
            <Text
              size={10}
              color={
                i.status === "online"
                  ? c.success
                  : i.status === "busy"
                    ? c.danger
                    : c.muted
              }
            >
              {i.status}
            </Text>
          ) : null}
        </Stack>
      ))}
      {items.length > limit ? (
        <Button
          testId={testId + "-overflow"}
          onPress={() => onOverflow?.()}
          disabled={!onOverflow}
        >
          +{items.length - limit}
        </Button>
      ) : null}
      {!items.length ? <Text color={c.muted}>No people</Text> : null}
    </Row>
  );
}
export function BadgeGroup({
  label,
  children,
  tone = "neutral",
  onPress,
  testId,
}: {
  label: string;
  children: string;
  tone?: Tone;
  onPress?: () => void;
  testId: string;
}) {
  return (
    <Row testId={testId}>
      <Badge tone={tone}>{label}</Badge>
      {onPress ? (
        <Button testId={testId + "-action"} variant="ghost" onPress={onPress}>
          {children} →
        </Button>
      ) : (
        <Text>{children}</Text>
      )}
    </Row>
  );
}
export function FeaturedIcon({
  children = "◇",
  tone = "neutral",
  size = 40,
  testId,
}: {
  children?: ReactNode;
  tone?: Tone;
  size?: number;
  testId?: string;
}) {
  const { colors: c } = useTheme(),
    n = bounded(size, 24, 80);
  return (
    <div
      testId={testId}
      style={{
        width: n,
        height: n,
        borderRadius: n / 4,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor:
          tone === "success"
            ? c.successSoft
            : tone === "danger"
              ? c.dangerSoft
              : c.accentSoft,
      }}
    >
      {typeof children === "string" || typeof children === "number" ? (
        <Text
          size={n / 2}
          color={
            tone === "danger"
              ? c.danger
              : tone === "success"
                ? c.success
                : c.accent
          }
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </div>
  );
}
export function Illustration({
  kind = "documents",
  size = 100,
  testId,
}: {
  kind?: "documents" | "search" | "success";
  size?: number;
  testId?: string;
}) {
  const { colors: c } = useTheme(),
    n = bounded(size, 48, 240);
  const body =
    kind === "search"
      ? '<circle cx="43" cy="42" r="22"/><path d="M59 59 L82 82"/>'
      : kind === "success"
        ? '<circle cx="50" cy="50" r="34"/><path d="M30 50 L44 65 L72 34"/>'
        : '<rect x="24" y="14" width="52" height="72" rx="8"/><path d="M34 34 H66 M34 48 H66 M34 62 H54"/>';
  return (
    <svg
      testId={testId}
      source={
        '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><g fill="none" stroke="currentColor" stroke-width="5">' +
        body +
        "</g></svg>"
      }
      style={{ width: n, height: n, color: c.accent }}
    />
  );
}
export function CreditCard({
  holder,
  last4,
  brand = "Card",
  expiry,
  testId,
}: {
  holder: string;
  last4: string;
  brand?: string;
  expiry?: string;
  testId: string;
}) {
  const { colors: c } = useTheme();
  return (
    <Stack
      testId={testId}
      style={{
        width: 280,
        padding: 20,
        borderRadius: 16,
        backgroundColor: c.accentSoft,
        borderColor: c.border,
        borderWidth: 1,
      }}
    >
      <Text weight={600}>{brand}</Text>
      <Text size={20}>
        •••• •••• •••• {/^[0-9]{4}$/.test(last4) ? last4 : "••••"}
      </Text>
      <Row>
        <Text lines={1} style={{ flexGrow: 1, flexShrink: 1 }}>
          {holder}
        </Text>
        <Text>{expiry ?? ""}</Text>
      </Row>
    </Stack>
  );
}
export function SocialButton({
  provider,
  ...props
}: Omit<ButtonProps, "children"> & { provider: string }) {
  return <Button {...props}>Continue with {provider}</Button>;
}
export function AppStoreButton({
  store,
  ...props
}: Omit<ButtonProps, "children"> & { store: "apple" | "google" }) {
  return (
    <Button {...props}>
      {store === "apple"
        ? "Download on the App Store"
        : "Get it on Google Play"}
    </Button>
  );
}
export function UtilityButton({
  label,
  ...props
}: Omit<ButtonProps, "children"> & { label: string }) {
  return (
    <Button {...props} variant={props.variant ?? "ghost"}>
      {label}
    </Button>
  );
}
export interface RadioCardOption {
  id: string;
  label: string;
  description?: string;
  disabled?: boolean;
  leading?: ReactNode;
}
export function RadioCardGroup({
  items,
  value,
  onValueChange,
  disabled,
  testId,
}: {
  items: readonly RadioCardOption[];
  value: string | null;
  onValueChange: (id: string) => void;
  disabled?: boolean;
  testId: string;
}) {
  const { colors: c } = useTheme();
  if (catalogError(items, 20))
    return (
      <Text color={c.danger} testId={testId + "-error"}>
        Invalid options
      </Text>
    );
  return (
    <Stack testId={testId}>
      {items.map((i) => (
        <Stack
          key={i.id}
          gap={4}
          style={{
            padding: 10,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: value === i.id ? c.accent : c.border,
          }}
        >
          <Button
            testId={testId + "-" + i.id}
            leading={i.leading}
            disabled={disabled || i.disabled}
            variant={value === i.id ? "secondary" : "ghost"}
            onPress={() => onValueChange(i.id)}
          >
            {value === i.id ? "● " : "○ "}
            {i.label}
          </Button>
          {i.description ? (
            <Text size={12} color={c.muted}>
              {i.description}
            </Text>
          ) : null}
        </Stack>
      ))}
    </Stack>
  );
}

export function AvatarLabelGroup({
  name,
  src,
  description,
  actions,
  testId,
}: {
  name: string;
  src?: string;
  description?: string;
  actions?: ReactNode;
  testId: string;
}) {
  const { colors: c } = useTheme();
  return (
    <Row testId={testId}>
      <Avatar name={name} src={src} />
      <Stack gap={3} style={{ flexGrow: 1, flexShrink: 1 }}>
        <Text weight={500} lines={1}>
          {name}
        </Text>
        {description ? (
          <Text size={12} color={c.muted} lines={2}>
            {description}
          </Text>
        ) : null}
      </Stack>
      {actions}
    </Row>
  );
}
export function RadioButton({
  checked,
  onCheckedChange,
  label,
  disabled,
  readOnly,
  testId,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
  readOnly?: boolean;
  testId: string;
}) {
  return (
    <RadioGroup
      testId={testId}
      value={checked ? "selected" : ""}
      options={[{ value: "selected", label }]}
      onValueChange={() => onCheckedChange(true)}
      disabled={disabled || readOnly}
    />
  );
}

export type AvatarGroupProps = Parameters<typeof AvatarGroup>[0];

export type BadgeGroupProps = Parameters<typeof BadgeGroup>[0];

export type FeaturedIconProps = Parameters<typeof FeaturedIcon>[0];

export type IllustrationProps = Parameters<typeof Illustration>[0];

export type CreditCardProps = Parameters<typeof CreditCard>[0];

export type SocialButtonProps = Parameters<typeof SocialButton>[0];

export type AppStoreButtonProps = Parameters<typeof AppStoreButton>[0];

export type UtilityButtonProps = Parameters<typeof UtilityButton>[0];

export type RadioCardGroupProps = Parameters<typeof RadioCardGroup>[0];

export type AvatarLabelGroupProps = Parameters<typeof AvatarLabelGroup>[0];

export type RadioButtonProps = Parameters<typeof RadioButton>[0];
