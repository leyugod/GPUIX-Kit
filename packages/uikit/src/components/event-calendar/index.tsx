import { useEffect, useState } from "react";
import { Button, Row, Stack, Text } from "../../base";
import { useTheme } from "../../core/theme";
import { addDays, addMonths } from "../calendar/model";
import { isISODate } from "../value-input/rules";
import { bounded } from "../catalog-model";
import {
  eventCalendarError,
  eventsOnDate,
  eventCalendarDays,
  type CalendarEvent,
  type EventCalendarView,
} from "./model";
export type { CalendarEvent, EventCalendarView } from "./model";
export { eventCalendarError, eventsOnDate, eventCalendarDays } from "./model";
export interface EventCalendarProps {
  events: readonly CalendarEvent[];
  date: string;
  onDateChange: (date: string) => void;
  view: EventCalendarView;
  onViewChange: (view: EventCalendarView) => void;
  onEventPress?: (id: string) => void;
  onCreate?: (date: string) => void;
  width?: number;
  height?: number;
  disabled?: boolean;
  testId: string;
}
export function EventCalendar(props: EventCalendarProps) {
  return <CalendarBody {...props} />;
}
function CalendarBody({
  events,
  date,
  onDateChange,
  view,
  onViewChange,
  onEventPress,
  onCreate,
  width = 840,
  height = 640,
  disabled,
  testId,
}: EventCalendarProps) {
  const { colors: c } = useTheme(),
    [page, setPage] = useState(0),
    error = eventCalendarError(events),
    w = bounded(width, 560, 1600),
    days = eventCalendarDays(date, view);
  useEffect(() => setPage(0), [date, view]);
  const dayEvents = eventsOnDate(events, date),
    currentPage = Math.min(
      page,
      Math.max(0, Math.ceil(dayEvents.length / 10) - 1),
    );
  if (error || !isISODate(date) || !["month", "week", "day"].includes(view))
    return (
      <Text testId={testId + "-error"} color={c.danger}>
        {error ?? "Invalid calendar date or view"}
      </Text>
    );
  const move = (delta: number) =>
    view === "month"
      ? addMonths(date, delta)
      : addDays(date, delta * (view === "week" ? 7 : 1));
  const eventButton = (e: CalendarEvent, day: string) => (
    <Button
      key={e.id}
      testId={testId + "-event-" + day + "-" + e.id}
      size="sm"
      labelLines={1}
      disabled={disabled || e.disabled || !onEventPress}
      variant="ghost"
      onPress={() => onEventPress?.(e.id)}
    >
      {e.startTime ? e.startTime + " " : ""}
      {e.title}
    </Button>
  );
  return (
    <Stack testId={testId} style={{ width: w }} gap={8}>
      <Row>
        <Button
          testId={testId + "-previous"}
          disabled={disabled || !move(-1)}
          onPress={() => onDateChange(move(-1)!)}
        >
          Previous
        </Button>
        <Text weight={600} style={{ flexGrow: 1 }}>
          {date}
        </Text>
        <Button
          testId={testId + "-next"}
          disabled={disabled || !move(1)}
          onPress={() => onDateChange(move(1)!)}
        >
          Next
        </Button>
        {(["month", "week", "day"] as const).map((v) => (
          <Button
            key={v}
            testId={testId + "-view-" + v}
            disabled={disabled}
            variant={view === v ? "secondary" : "ghost"}
            onPress={() => onViewChange(v)}
          >
            {v}
          </Button>
        ))}
      </Row>
      {view === "day" ? (
        <Stack>
          {dayEvents
            .slice(currentPage * 10, currentPage * 10 + 10)
            .map((e) => eventButton(e, date))}
          {!dayEvents.length ? <Text color={c.muted}>No events</Text> : null}
          <Row>
            <Button
              testId={testId + "-page-previous"}
              disabled={disabled || !currentPage}
              onPress={() => setPage(currentPage - 1)}
            >
              Previous page
            </Button>
            <Button
              testId={testId + "-page-next"}
              disabled={disabled || (currentPage + 1) * 10 >= dayEvents.length}
              onPress={() => setPage(currentPage + 1)}
            >
              Next page
            </Button>
          </Row>
        </Stack>
      ) : (
        <div
          style={{ height: Math.max(160, height - 96), overflowY: "scroll" }}
        >
          <Stack gap={4}>
            {Array.from({ length: view === "month" ? 6 : 1 }, (_, row) => (
              <Row key={row} gap={4} style={{ alignItems: "stretch" }}>
                {days.slice(row * 7, row * 7 + 7).map((day, index) => {
                  const list = day ? eventsOnDate(events, day) : [];
                  return (
                    <Stack
                      key={day ?? index}
                      gap={1}
                      style={{
                        width: (w - 24) / 7,
                        height: view === "week" ? 240 : 104,
                        padding: 3,
                        borderWidth: 1,
                        borderColor: day === date ? c.accent : c.border,
                        borderRadius: 6,
                        backgroundColor:
                          day?.slice(0, 7) === date.slice(0, 7)
                            ? c.surface
                            : c.subtle,
                      }}
                    >
                      <Button
                        testId={testId + "-day-" + (day ?? index)}
                        size="sm"
                        disabled={disabled || !day}
                        variant="ghost"
                        onPress={() => {
                          if (day) onDateChange(day);
                        }}
                      >
                        {day?.slice(5) ?? ""}
                      </Button>
                      {list
                        .slice(0, view === "week" ? 5 : 2)
                        .map((e) => eventButton(e, day!))}
                      {list.length > (view === "week" ? 5 : 2) ? (
                        <Button
                          size="sm"
                          testId={testId + "-more-" + day}
                          disabled={disabled}
                          onPress={() => {
                            onDateChange(day!);
                            onViewChange("day");
                          }}
                        >
                          +{list.length - (view === "week" ? 5 : 2)} more
                        </Button>
                      ) : null}
                    </Stack>
                  );
                })}
              </Row>
            ))}
          </Stack>
        </div>
      )}
      {onCreate ? (
        <Button
          testId={testId + "-create"}
          disabled={disabled}
          onPress={() => onCreate(date)}
        >
          Add event
        </Button>
      ) : null}
    </Stack>
  );
}
