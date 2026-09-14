import type { ReactNode } from "react";
import { Row, Stack, Text } from "../base";
import { useTheme } from "../core/theme";
export function DashboardLayout({
  title,
  description,
  actions,
  metrics,
  children,
  testId,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  metrics: readonly ReactNode[];
  children: ReactNode;
  testId: string;
}) {
  const { colors: c } = useTheme();
  return (
    <Stack
      testId={testId}
      gap={18}
      style={{
        padding: 20,
        minHeight: 0,
        flexGrow: 1,
        flexShrink: 1,
        overflowY: "scroll",
      }}
    >
      <Row
        style={{ justifyContent: "space-between", alignItems: "flex-start" }}
      >
        <Stack gap={6} style={{ flexGrow: 1, flexShrink: 1 }}>
          <Text size={25} weight={600}>
            {title}
          </Text>
          {description ? (
            <Text size={12} color={c.muted}>
              {description}
            </Text>
          ) : null}
        </Stack>
        {actions}
      </Row>
      <Row gap={12} style={{ alignItems: "stretch", flexWrap: "wrap" }}>
        {metrics.map((metric, index) => (
          <Stack
            key={index}
            style={{ minWidth: 180, flexBasis: 0, flexGrow: 1 }}
          >
            {metric}
          </Stack>
        ))}
      </Row>
      {children}
    </Stack>
  );
}
/** 每个栏位自主管理滚动；布局本身不额外包裹同轴滚动容器。 */
export function ConversationLayout({
  sidebar,
  header,
  messages,
  composer,
  inspector,
  testId,
}: {
  sidebar?: ReactNode;
  header: ReactNode;
  messages: ReactNode;
  composer: ReactNode;
  inspector?: ReactNode;
  testId: string;
}) {
  const { colors: c } = useTheme();
  return (
    <Row
      testId={testId}
      gap={0}
      style={{
        height: "100%",
        minHeight: 0,
        alignItems: "stretch",
        flexGrow: 1,
        flexShrink: 1,
      }}
    >
      {sidebar}
      <Stack gap={0} style={{ flexGrow: 1, flexShrink: 1, minHeight: 0 }}>
        <div
          style={{ padding: 12, borderBottomWidth: 1, borderColor: c.border }}
        >
          {header}
        </div>
        <Stack style={{ flexGrow: 1, flexShrink: 1, minHeight: 0 }}>
          {messages}
        </Stack>
        <div style={{ padding: 12 }}>{composer}</div>
      </Stack>
      {inspector}
    </Row>
  );
}
export function SettingsLayout({
  navigation,
  children,
  testId,
}: {
  navigation: ReactNode;
  children: ReactNode;
  testId: string;
}) {
  return (
    <Row
      testId={testId}
      gap={20}
      style={{
        padding: 20,
        alignItems: "stretch",
        flexGrow: 1,
        flexShrink: 1,
        minHeight: 0,
      }}
    >
      <Stack style={{ width: 200 }}>{navigation}</Stack>
      <Stack
        style={{
          flexGrow: 1,
          flexShrink: 1,
          minHeight: 0,
          overflowY: "scroll",
        }}
      >
        {children}
      </Stack>
    </Row>
  );
}
