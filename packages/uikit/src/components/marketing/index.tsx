import { useState, type ReactNode } from "react";
import { Button, Input, Textarea, Row, Stack, Text } from "../../base";
import { Avatar } from "../../data";
import { useTheme } from "../../core/theme";
import { SectionHeader, ContentDivider, HeaderNavigation } from "../sections";
import { useRequestActions } from "../resource-state/requests";
import { catalogError } from "../catalog-model";
export interface SectionItem {
  id: string;
  title: string;
  description?: string;
  image?: string;
  meta?: string;
  price?: string;
  features?: readonly string[];
  actionLabel?: string;
  disabled?: boolean;
}
export interface ContentSectionProps {
  title: string;
  description?: string;
  items?: readonly SectionItem[];
  actions?: ReactNode;
  onAction?: (id: string) => void;
  testId: string;
}
function ContentSection({
  title,
  description,
  items = [],
  actions,
  onAction,
  testId,
  kind,
}: {
  kind:
    | "blog"
    | "careers"
    | "features"
    | "metrics"
    | "pricing"
    | "proof"
    | "team"
    | "testimonials";
} & ContentSectionProps) {
  const { colors: c } = useTheme();
  if (catalogError(items, 30))
    return (
      <Text testId={testId + "-error"} color={c.danger}>
        Invalid section items
      </Text>
    );
  return (
    <Stack testId={testId} gap={18}>
      <SectionHeader
        title={title}
        description={description}
        actions={actions}
        testId={testId + "-heading"}
      />
      <div
        style={{
          display: "flex",
          flexDirection: kind === "careers" ? "column" : "row",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        {items.map((item) => (
          <Stack
            key={item.id}
            testId={testId + "-" + item.id}
            style={{
              width: kind === "careers" ? "100%" : 240,
              padding: 16,
              borderWidth: 1,
              borderColor: c.border,
              borderRadius: 12,
              backgroundColor: c.surface,
            }}
          >
            {kind === "team" ? (
              <Avatar name={item.title} src={item.image} size={48} />
            ) : item.image ? (
              <img
                src={item.image}
                alt={item.title}
                objectFit="cover"
                style={{ width: 200, height: 100 }}
              />
            ) : null}
            {item.meta ? (
              <Text size={12} color={c.accent}>
                {item.meta}
              </Text>
            ) : null}
            <Text size={kind === "metrics" ? 30 : 17} weight={600}>
              {item.title}
            </Text>
            {item.price ? (
              <Text size={28} weight={600}>
                {item.price}
              </Text>
            ) : null}
            {item.description ? (
              <Text color={c.muted}>
                {kind === "testimonials"
                  ? "“" + item.description + "”"
                  : item.description}
              </Text>
            ) : null}
            {item.features?.slice(0, 12).map((feature, i) => (
              <Text key={i} size={12}>
                ✓ {feature}
              </Text>
            ))}
            {item.actionLabel ? (
              <Button
                testId={testId + "-action-" + item.id}
                disabled={item.disabled || !onAction}
                variant={kind === "pricing" ? "primary" : "default"}
                onPress={() => onAction?.(item.id)}
              >
                {item.actionLabel}
              </Button>
            ) : null}
          </Stack>
        ))}
      </div>
    </Stack>
  );
}
export function BlogSection(p: ContentSectionProps) {
  return <ContentSection {...p} kind="blog" />;
}
export function CareersSection(p: ContentSectionProps) {
  return <ContentSection {...p} kind="careers" />;
}
export function FeaturesSection(p: ContentSectionProps) {
  return <ContentSection {...p} kind="features" />;
}
export function MetricsSection(p: ContentSectionProps) {
  return <ContentSection {...p} kind="metrics" />;
}
export function PricingSection(p: ContentSectionProps) {
  return <ContentSection {...p} kind="pricing" />;
}
export function SocialProofSection(p: ContentSectionProps) {
  return <ContentSection {...p} kind="proof" />;
}
export function TeamSection(p: ContentSectionProps) {
  return <ContentSection {...p} kind="team" />;
}
export function TestimonialSection(p: ContentSectionProps) {
  return <ContentSection {...p} kind="testimonials" />;
}
export function Banner({
  children,
  onDismiss,
  actions,
  testId,
}: {
  children: ReactNode;
  onDismiss?: () => void;
  actions?: ReactNode;
  testId: string;
}) {
  const { colors: c } = useTheme();
  return (
    <Row
      testId={testId}
      style={{ padding: 12, backgroundColor: c.accentSoft, flexWrap: "wrap" }}
    >
      <div style={{ flexGrow: 1 }}>
        <Text>{children}</Text>
      </div>
      {actions}
      {onDismiss ? (
        <Button
          testId={testId + "-dismiss"}
          variant="ghost"
          onPress={onDismiss}
        >
          Dismiss
        </Button>
      ) : null}
    </Row>
  );
}
export interface HeroSectionProps {
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: ReactNode;
  media?: ReactNode;
  testId: string;
}
export function HeroHeaderSection({
  title,
  description,
  eyebrow,
  actions,
  media,
  testId,
}: HeroSectionProps) {
  return (
    <Stack testId={testId} gap={20} style={{ padding: 24 }}>
      <SectionHeader
        title={title}
        description={description}
        eyebrow={eyebrow}
        testId={testId + "-heading"}
      />
      {actions}
      {media}
    </Stack>
  );
}
export function HeaderSection(p: HeroSectionProps) {
  return <HeroHeaderSection {...p} />;
}
export function CTASection(p: HeroSectionProps) {
  const { colors: c } = useTheme();
  return (
    <div style={{ backgroundColor: c.accentSoft, borderRadius: 16 }}>
      <HeroHeaderSection {...p} />
    </div>
  );
}
export function RichContentSection({
  title,
  children,
  testId,
}: {
  title: string;
  children: ReactNode;
  testId: string;
}) {
  return (
    <Stack testId={testId}>
      <SectionHeader title={title} testId={testId + "-heading"} />
      <ContentDivider testId={testId + "-divider"} />
      {children}
    </Stack>
  );
}
export interface FooterLink {
  id: string;
  label: string;
  disabled?: boolean;
}
export function FooterSection({
  brand,
  links,
  copyright,
  onNavigate,
  testId,
}: {
  brand: string;
  links: readonly FooterLink[];
  copyright?: string;
  onNavigate: (id: string) => void;
  testId: string;
}) {
  const { colors: c } = useTheme();
  if (catalogError(links, 30))
    return <Text color={c.danger}>Invalid footer links</Text>;
  return (
    <Stack testId={testId}>
      <ContentDivider testId={testId + "-divider"} />
      <Text weight={600}>{brand}</Text>
      <Row style={{ flexWrap: "wrap" }}>
        {links.map((l) => (
          <Button
            key={l.id}
            testId={testId + "-" + l.id}
            variant="ghost"
            disabled={l.disabled}
            onPress={() => onNavigate(l.id)}
          >
            {l.label}
          </Button>
        ))}
      </Row>
      {copyright ? (
        <Text size={12} color={c.muted}>
          {copyright}
        </Text>
      ) : null}
    </Stack>
  );
}
export const MarketingHeaderNavigation = HeaderNavigation;
export function FAQSection({
  title,
  items,
  expandedIds,
  onExpandedChange,
  testId,
}: {
  title: string;
  items: readonly { id: string; question: string; answer: string }[];
  expandedIds: readonly string[];
  onExpandedChange: (ids: string[]) => void;
  testId: string;
}) {
  const { colors: c } = useTheme();
  if (catalogError(items, 30))
    return <Text color={c.danger}>Invalid questions</Text>;
  return (
    <Stack testId={testId}>
      <SectionHeader title={title} testId={testId + "-heading"} />
      {items.map((i) => (
        <Stack key={i.id} gap={8}>
          <Button
            testId={testId + "-" + i.id}
            variant="ghost"
            onPress={() =>
              onExpandedChange(
                expandedIds.includes(i.id)
                  ? expandedIds.filter((id) => id !== i.id)
                  : [...expandedIds, i.id],
              )
            }
          >
            {expandedIds.includes(i.id) ? "− " : "+ "}
            {i.question}
          </Button>
          {expandedIds.includes(i.id) ? (
            <Text testId={testId + "-answer-" + i.id} color={c.muted}>
              {i.answer}
            </Text>
          ) : null}
          <ContentDivider testId={testId + "-divider-" + i.id} />
        </Stack>
      ))}
    </Stack>
  );
}
export interface ContactValues {
  name: string;
  email: string;
  message: string;
}
export function ContactSection({
  value,
  onValueChange,
  onSubmit,
  disabled,
  testId,
}: {
  value: ContactValues;
  onValueChange: (value: ContactValues) => void;
  onSubmit?: (value: ContactValues) => void | Promise<void>;
  disabled?: boolean;
  testId: string;
}) {
  const { colors: c } = useTheme(),
    requests = useRequestActions("contact", ["submit"]),
    pending = requests.pending("submit"),
    valid =
      !!value.name.trim() &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email) &&
      !!value.message.trim();
  return (
    <Stack testId={testId}>
      <SectionHeader title="Contact us" testId={testId + "-heading"} />
      <Text size={12}>Name</Text>
      <Input
        testId={testId + "-name"}
        value={value.name}
        onValueChange={(name) => onValueChange({ ...value, name })}
        disabled={disabled || pending}
      />
      <Text size={12}>Email</Text>
      <Input
        testId={testId + "-email"}
        value={value.email}
        onValueChange={(email) => onValueChange({ ...value, email })}
        disabled={disabled || pending}
      />
      <Text size={12}>Message</Text>
      <Textarea
        testId={testId + "-message"}
        value={value.message}
        onValueChange={(message) => onValueChange({ ...value, message })}
        disabled={disabled || pending}
      />
      <Button
        testId={testId + "-submit"}
        disabled={disabled || !valid || !onSubmit}
        loading={pending}
        onPress={() => {
          if (onSubmit)
            void requests.run("submit", () => onSubmit({ ...value }));
        }}
      >
        Send message
      </Button>
      {requests.failed("submit") ? (
        <Text testId={testId + "-error"} color={c.danger}>
          Unable to send. Retry.
        </Text>
      ) : null}
    </Stack>
  );
}
export function NewsletterCTA({
  value,
  onValueChange,
  onSubscribe,
  disabled,
  testId,
}: {
  value: string;
  onValueChange: (value: string) => void;
  onSubscribe?: (email: string) => void | Promise<void>;
  disabled?: boolean;
  testId: string;
}) {
  const { colors: c } = useTheme(),
    requests = useRequestActions("newsletter", ["submit"]);
  return (
    <Stack testId={testId}>
      <SectionHeader title="Stay up to date" testId={testId + "-heading"} />
      <Input
        testId={testId + "-email"}
        value={value}
        onValueChange={onValueChange}
        disabled={disabled || requests.pending("submit")}
        placeholder="Email address"
      />
      <Button
        testId={testId + "-subscribe"}
        disabled={
          disabled || !onSubscribe || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
        }
        loading={requests.pending("submit")}
        onPress={() => {
          if (onSubscribe)
            void requests.run("submit", () => onSubscribe(value));
        }}
      >
        Subscribe
      </Button>
      {requests.failed("submit") ? (
        <Text testId={testId + "-error"} color={c.danger}>
          Unable to subscribe. Retry.
        </Text>
      ) : null}
    </Stack>
  );
}

export type BlogSectionProps = Parameters<typeof BlogSection>[0];

export type CareersSectionProps = Parameters<typeof CareersSection>[0];

export type FeaturesSectionProps = Parameters<typeof FeaturesSection>[0];

export type MetricsSectionProps = Parameters<typeof MetricsSection>[0];

export type PricingSectionProps = Parameters<typeof PricingSection>[0];

export type SocialProofSectionProps = Parameters<typeof SocialProofSection>[0];

export type TeamSectionProps = Parameters<typeof TeamSection>[0];

export type TestimonialSectionProps = Parameters<typeof TestimonialSection>[0];

export type BannerProps = Parameters<typeof Banner>[0];

export type HeroHeaderSectionProps = Parameters<typeof HeroHeaderSection>[0];

export type HeaderSectionProps = Parameters<typeof HeaderSection>[0];

export type CTASectionProps = Parameters<typeof CTASection>[0];

export type RichContentSectionProps = Parameters<typeof RichContentSection>[0];

export type FooterSectionProps = Parameters<typeof FooterSection>[0];

export type FAQSectionProps = Parameters<typeof FAQSection>[0];

export type ContactSectionProps = Parameters<typeof ContactSection>[0];

export type NewsletterCTAProps = Parameters<typeof NewsletterCTA>[0];

export type MarketingHeaderNavigationProps = Parameters<
  typeof MarketingHeaderNavigation
>[0];
