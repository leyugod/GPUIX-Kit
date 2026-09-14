import { useState } from "react";
import { useGpuix, useWindowSize } from "@gpuix/react";
import {
  AppShell,
  UIKitProvider,
  useTheme,
  Sidebar,
  Toolbar,
  Input,
  SegmentedControl,
  Button,
  Row,
  Stack,
  Text,
  Card,
  CardHeader,
  CardContent,
  MetricCard,
  DashboardLayout,
  ConversationLayout,
  CartesianChart,
  PieChart,
  Timeline,
  MessageList,
  MessageComposer,
  Badge,
  createWindowAdapter,
  type ThemeMode,
  type Message,
  type MessageAttachment,
  type ChartSeries,
  type CartesianChartProps,
} from "@mirai/gpuix-kit";
const categories = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
  (label, index) => ({ id: `day-${index}`, label }),
);
const series: ChartSeries[] = [
  { id: "design", label: "Design", values: [18, 30, 24, 42, 36, 56] },
  { id: "engineering", label: "Engineering", values: [10, 18, 28, 20, 45, 40] },
];
const slices = [
  { id: "desktop", label: "Desktop", value: 58 },
  { id: "mobile", label: "Mobile", value: 27 },
  { id: "web", label: "Web", value: 15 },
];
const initialMessages: Message[] = [
  {
    id: "notice",
    author: "System",
    direction: "system",
    text: "A local conversation preview. Nothing is sent externally.",
  },
  {
    id: "hello",
    author: "Morgan",
    direction: "incoming",
    text: "The workspace components are ready to review. Could you check the charts and keyboard flow?",
    timeLabel: "09:41",
    attachments: [{ id: "brief", name: "review-brief.txt", state: "ready" }],
  },
  {
    id: "failed",
    author: "You",
    direction: "outgoing",
    text: "This message illustrates a failed state.",
    status: "failed",
    error: "Demo failure state",
    timeLabel: "09:42",
  },
  {
    id: "stream",
    author: "Assistant",
    direction: "incoming",
    text: "Review notes: ",
    status: "streaming",
    timeLabel: "09:43",
  },
];
export function StudioGallery({
  initialMode = "dark",
}: {
  initialMode?: ThemeMode;
}) {
  const [mode, setMode] = useState<ThemeMode>(initialMode);
  return (
    <UIKitProvider mode={mode}>
      <Studio mode={mode} setMode={setMode} />
    </UIKitProvider>
  );
}
function Studio({
  mode,
  setMode,
}: {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}) {
  const { colors: c } = useTheme();
  const window = useWindowSize();
  const { renderer } = useGpuix();
  const adapter = createWindowAdapter(renderer);
  const [page, setPage] = useState("dashboard"),
    [name, setName] = useState("Studio workspace");
  const [variant, setVariant] =
    useState<CartesianChartProps["variant"]>("line");
  const [hidden, setHidden] = useState<string[]>([]);
  const [chartActions, setChartActions] = useState(0);
  const [donut, setDonut] = useState(true);
  const [activities, setActivities] = useState(3);
  const [review, setReview] = useState(0);
  const [messages, setMessages] = useState(initialMessages),
    [draft, setDraft] = useState(""),
    [attachments, setAttachments] = useState<MessageAttachment[]>([]),
    [reply, setReply] = useState<string | null>(null),
    [streaming, setStreaming] = useState(false),
    [following, setFollowing] = useState(true),
    [earlier, setEarlier] = useState(false),
    [hostResult, setHostResult] = useState("No operation requested");
  const [attachmentRequest, setAttachmentRequest] = useState("");
  const chartWidth = Math.max(260, window.width - 294);
  const selectedMessage = messages.find((m) => m.id === reply);
  const chart = (
    <CartesianChart
      testId="studio-chart"
      categories={categories}
      series={
        variant === "stacked-bar"
          ? [series[0]!, { ...series[1]!, values: [-8, 12, -5, 18, 20, -10] }]
          : series
      }
      variant={variant}
      width={chartWidth}
      height={210}
      hiddenSeriesIds={hidden}
      onHiddenSeriesChange={setHidden}
      onActivate={() => setChartActions((n) => n + 1)}
    />
  );
  return (
    <AppShell
      sidebar={
        <Sidebar
          testId="studio-nav"
          title="◈ Mirai UIKit"
          items={[
            { id: "dashboard", label: "Dashboard" },
            { id: "charts", label: "Charts" },
            { id: "conversation", label: "Conversation" },
            { id: "platform", label: "Host capabilities" },
          ]}
          value={page}
          onValueChange={setPage}
          footer={
            <Text size={11} color={c.muted}>
              Studio · v0.4 preview
            </Text>
          }
        />
      }
    >
      <Toolbar
        style={{ height: 62, padding: 12, justifyContent: "space-between" }}
      >
        <Input
          testId="studio-name"
          value={name}
          onValueChange={setName}
          style={{ width: 230 }}
        />
        <SegmentedControl
          testId="studio-theme"
          value={mode}
          onValueChange={(v) => setMode(v as ThemeMode)}
          options={[
            { value: "light", label: "Light" },
            { value: "dark", label: "Dark" },
          ]}
        />
      </Toolbar>
      {page === "dashboard" ? (
        <DashboardLayout
          testId="studio-dashboard"
          title="A clear view of your workspace."
          description="Sample metrics, native charts and a shared activity feed."
          metrics={[
            <MetricCard
              testId="metric-projects"
              label="Active projects"
              value="24"
              change="+4 this week"
              trend="positive"
            />,
            <MetricCard
              testId="metric-progress"
              label="Reviews completed"
              value="86%"
              change="+12%"
              trend="positive"
            />,
            <MetricCard
              testId="metric-response"
              label="Average response"
              value="2.4 h"
              change="−0.6 h"
              trend="positive"
            />,
          ]}
        >
          <Card>
            <CardHeader
              title="Weekly activity"
              description="Compare categories with the keyboard or pointer."
            />
            <CardContent>{chart}</CardContent>
          </Card>
          <Card>
            <CardHeader title="Activity timeline" />
            <CardContent>
              <Timeline
                testId="studio-timeline"
                items={Array.from({ length: activities }, (_, index) => ({
                  id: `event-${index}`,
                  title: [
                    "Design library updated",
                    "Review requested",
                    "New workspace created",
                    "Release notes added",
                  ][index % 4]!,
                  description:
                    "An in-memory sample event with an application-owned action.",
                  actor: index % 2 ? "Morgan" : "Alex",
                  timeLabel: `09:${40 + index}`,
                  group: index < 2 ? "Today" : "Yesterday",
                  actions: [
                    {
                      id: "review",
                      label: "Review",
                      onPress: () => setReview((n) => n + 1),
                    },
                  ],
                }))}
                hasMore={activities < 5}
                onLoadMore={() => setActivities(5)}
              />
              <Text testId="studio-review-count" size={11} color={c.muted}>
                Review actions: {review}
              </Text>
            </CardContent>
          </Card>
        </DashboardLayout>
      ) : null}
      {page === "charts" ? (
        <Stack
          testId="studio-charts-scroll"
          gap={16}
          style={{
            padding: 20,
            overflowY: "scroll",
            flexGrow: 1,
            flexShrink: 1,
            minHeight: 0,
          }}
        >
          <Text size={25} weight={600}>
            Native data visualization
          </Text>
          <SegmentedControl
            testId="studio-chart-kind"
            value={variant ?? "line"}
            onValueChange={(value) =>
              setVariant(value as CartesianChartProps["variant"])
            }
            options={[
              { value: "line", label: "Line" },
              { value: "area", label: "Area" },
              { value: "bar", label: "Grouped bars" },
              { value: "stacked-bar", label: "Stacked bars" },
            ]}
          />
          <Card>
            <CardContent>
              {chart}
              <Text testId="studio-chart-actions" size={11} color={c.muted}>
                Category actions: {chartActions}
              </Text>
            </CardContent>
          </Card>
          <Card>
            <CardHeader
              title="Workspace distribution"
              trailing={
                <Button
                  testId="studio-pie-toggle"
                  size="sm"
                  onPress={() => setDonut((v) => !v)}
                >
                  {donut ? "Show pie" : "Show donut"}
                </Button>
              }
            />
            <CardContent>
              <PieChart
                testId="studio-pie"
                data={slices}
                size={180}
                donut={donut}
              />
            </CardContent>
          </Card>
        </Stack>
      ) : null}
      {page === "conversation" ? (
        <ConversationLayout
          testId="studio-conversation"
          header={
            <Row style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
              <Stack gap={3}>
                <Text weight={600} size={15}>
                  Design review
                </Text>
                <Text size={11} color={c.muted}>
                  Local message and streaming states
                </Text>
              </Stack>
              <Row>
                <Button
                  testId="studio-stream"
                  size="sm"
                  variant="ghost"
                  onPress={() => {
                    setStreaming(true);
                    setMessages((current) =>
                      current.map((m) =>
                        m.id === "stream"
                          ? {
                              ...m,
                              text: m.text + "Native rendering is responsive. ",
                              status: "streaming",
                            }
                          : m,
                      ),
                    );
                  }}
                >
                  Append sample token
                </Button>
                <Button
                  testId="studio-follow"
                  size="sm"
                  variant="ghost"
                  onPress={() => setFollowing((v) => !v)}
                >
                  {following ? "Read history" : "Follow latest"}
                </Button>
              </Row>
            </Row>
          }
          messages={
            <MessageList
              testId="studio-messages"
              messages={messages}
              height={Math.max(
                100,
                window.height -
                  455 -
                  (selectedMessage ? 50 : 0) -
                  (attachments.length ? 38 : 0),
              )}
              followTail={following}
              onFollowTailChange={setFollowing}
              hasEarlier={!earlier}
              onLoadEarlier={() => {
                setFollowing(false);
                setEarlier(true);
                setMessages((current) => [
                  {
                    id: "earlier",
                    author: "Alex",
                    direction: "incoming",
                    text: "An earlier sample message.",
                    timeLabel: "09:30",
                  },
                  ...current,
                ]);
              }}
              onRetry={(id) =>
                setMessages((current) =>
                  current.map((m) =>
                    m.id === id
                      ? { ...m, status: "sending", error: undefined }
                      : m,
                  ),
                )
              }
              onReply={setReply}
              onOpenAttachment={(_id, attachmentId) =>
                setAttachmentRequest(`Attachment requested: ${attachmentId}`)
              }
            />
          }
          composer={
            <Stack gap={4}>
              {attachmentRequest ? (
                <Text
                  testId="studio-attachment-request"
                  size={11}
                  color={c.muted}
                >
                  {attachmentRequest}
                </Text>
              ) : null}
              <MessageComposer
                testId="studio-composer"
                value={draft}
                onValueChange={setDraft}
                state={streaming ? "streaming" : "idle"}
                onStop={() => {
                  setStreaming(false);
                  setMessages((current) =>
                    current.map((m) =>
                      m.id === "stream" ? { ...m, status: "stopped" } : m,
                    ),
                  );
                }}
                attachments={attachments}
                onAttach={() =>
                  setAttachments((current) => [
                    ...current,
                    {
                      id: `attachment-${current.length}`,
                      name: "sample.txt",
                      state: "ready",
                    },
                  ])
                }
                onRemoveAttachment={(id) =>
                  setAttachments((current) =>
                    current.filter((a) => a.id !== id),
                  )
                }
                replyTo={
                  selectedMessage
                    ? {
                        id: selectedMessage.id,
                        author: selectedMessage.author,
                        text: selectedMessage.text,
                      }
                    : undefined
                }
                onCancelReply={() => setReply(null)}
                sendLabel="Add demo message"
                onSend={(snapshot) => {
                  setMessages((current) => [
                    ...current,
                    {
                      id: `local-${current.length}`,
                      author: "You",
                      direction: "outgoing",
                      text: snapshot.text,
                      attachments: [...attachments],
                      reply: selectedMessage
                        ? {
                            author: selectedMessage.author,
                            text: selectedMessage.text,
                          }
                        : undefined,
                      status: "sent",
                      timeLabel: "Now",
                    },
                  ]);
                  setDraft("");
                  setAttachments([]);
                  setReply(null);
                  setFollowing(true);
                }}
              />
            </Stack>
          }
        />
      ) : null}
      {page === "platform" ? (
        <Stack gap={18} style={{ padding: 20 }}>
          <Text size={24} weight={600}>
            Mapped host capabilities
          </Text>
          <Text size={12} color={c.muted}>
            Availability is checked on the renderer used by this window.
          </Text>
          {Object.entries(adapter.capabilities).map(([key, enabled]) => (
            <Row key={key} style={{ justifyContent: "space-between" }}>
              <Text size={13}>{key}</Text>
              <Badge tone={enabled ? "success" : "neutral"}>
                {enabled ? "Available" : "Not mapped"}
              </Badge>
            </Row>
          ))}
          <Row>
            <Button
              testId="studio-host-metrics"
              onPress={() => {
                const result = adapter.getSize();
                setHostResult(
                  result.ok
                    ? `Window: ${result.value.width} × ${result.value.height}`
                    : result.message,
                );
              }}
            >
              Read window size
            </Button>
            <Button
              testId="studio-host-title"
              disabled={!adapter.capabilities.windowTitle}
              onPress={() => {
                const result = adapter.setTitle("Mirai UIKit — Studio");
                setHostResult(
                  result.ok ? "Window title updated" : result.message,
                );
              }}
            >
              Set this window title
            </Button>
          </Row>
          <Text testId="studio-host-result" size={12} color={c.muted}>
            {hostResult}
          </Text>
        </Stack>
      ) : null}
    </AppShell>
  );
}
