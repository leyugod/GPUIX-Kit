import { Button, Row, Stack, Text } from "../../base";
import { Avatar } from "../../data";
import { useTheme } from "../../core/theme";
import { toneColors, type Tone } from "../../core/tokens";
export interface ActivityItem {
  id: string;
  title: string;
  description?: string;
  actor?: string;
  timeLabel: string;
  group?: string;
  tone?: Tone;
  actions?: readonly {
    id: string;
    label: string;
    onPress: () => void;
    disabled?: boolean;
  }[];
}
export interface TimelineProps {
  items: readonly ActivityItem[];
  testId: string;
  loading?: boolean;
  emptyLabel?: string;
  hasMore?: boolean;
  onLoadMore?: () => void;
}
/** 时间标签、时区、分组和当前页事件由应用提供，不启动时间轮询。 */
export function Timeline({
  items,
  testId,
  loading = false,
  emptyLabel = "No activity yet",
  hasMore = false,
  onLoadMore,
}: TimelineProps) {
  const { colors: c } = useTheme();
  return (
    <Stack testId={testId} gap={0}>
      {!items.length ? (
        <Text
          testId={`${testId}-${loading ? "loading" : "empty"}`}
          size={12}
          color={c.muted}
        >
          {loading ? "Loading activity…" : emptyLabel}
        </Text>
      ) : (
        items.map((item, index) => {
          const tone = toneColors(c, item.tone ?? "neutral");
          return (
            <Stack key={item.id} testId={`${testId}-${item.id}`} gap={0}>
              {item.group && item.group !== items[index - 1]?.group ? (
                <Text
                  size={11}
                  weight={600}
                  color={c.muted}
                  style={{ paddingTop: 12, paddingBottom: 12 }}
                >
                  {item.group}
                </Text>
              ) : null}
              <Row gap={12} style={{ alignItems: "stretch" }}>
                <Stack gap={6} style={{ width: 28, alignItems: "center" }}>
                  {item.actor ? (
                    <Avatar name={item.actor} size={28} />
                  ) : (
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        marginTop: 5,
                        borderRadius: 5,
                        backgroundColor: tone.text,
                      }}
                    />
                  )}
                  <div
                    style={{
                      width: 1,
                      flexGrow: 1,
                      minHeight: 16,
                      backgroundColor:
                        index < items.length - 1 ? c.border : "transparent",
                    }}
                  />
                </Stack>
                <Stack
                  gap={6}
                  style={{ flexGrow: 1, flexShrink: 1, paddingBottom: 18 }}
                >
                  <Row
                    style={{
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                    }}
                  >
                    <Text size={13} weight={500}>
                      {item.title}
                    </Text>
                    <Text size={11} color={c.muted}>
                      {item.timeLabel}
                    </Text>
                  </Row>
                  {item.description ? (
                    <Text size={12} color={c.muted}>
                      {item.description}
                    </Text>
                  ) : null}
                  {item.actions?.length ? (
                    <Row style={{ flexWrap: "wrap" }}>
                      {item.actions.map((action) => (
                        <Button
                          key={action.id}
                          testId={`${testId}-${item.id}-${action.id}`}
                          size="sm"
                          variant="ghost"
                          disabled={action.disabled}
                          onPress={action.onPress}
                        >
                          {action.label}
                        </Button>
                      ))}
                    </Row>
                  ) : null}
                </Stack>
              </Row>
            </Stack>
          );
        })
      )}
      {hasMore && onLoadMore ? (
        <Button
          testId={`${testId}-more`}
          loading={loading}
          loadingText="Loading…"
          onPress={onLoadMore}
        >
          Load more activity
        </Button>
      ) : null}
    </Stack>
  );
}
export const ActivityFeed = Timeline;
