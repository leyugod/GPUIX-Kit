import { useState } from "react";
import {
  UIKitProvider,
  AppShell,
  Toolbar,
  Input,
  SegmentedControl,
  Row,
  Stack,
  Text,
  Card,
  CardHeader,
  CardContent,
  TimeField,
  TimePicker,
  TimeList,
  type ThemeMode,
} from "@mirai/gpuix-kit";
const unavailable = (value: string) => value >= "12:00" && value < "13:00";
export function TimeGallery() {
  const [mode, setMode] = useState<ThemeMode>("dark"),
    [name, setName] = useState("Time controls");
  const [draft, setDraft] = useState("09:00"),
    [commit, setCommit] = useState("—");
  const [time, setTime] = useState<string | null>("10:30"),
    [minute, setMinute] = useState<string | null>("09:00");
  return (
    <UIKitProvider mode={mode}>
      <AppShell>
        <Toolbar>
          <Input
            testId="time-name"
            value={name}
            onValueChange={setName}
            style={{ width: 300 }}
          />
          <Row style={{ flexGrow: 1, justifyContent: "flex-end" }}>
            <SegmentedControl
              testId="time-theme"
              value={mode}
              onValueChange={(v) => setMode(v as ThemeMode)}
              options={[
                { value: "light", label: "Light" },
                { value: "dark", label: "Dark" },
              ]}
            />
          </Row>
        </Toolbar>
        <Stack
          gap={18}
          testId="time-scroll"
          style={{
            padding: 24,
            flexGrow: 1,
            flexShrink: 1,
            minHeight: 0,
            overflowY: "scroll",
          }}
        >
          <Text size={26} weight={600}>
            Time, with room for precision.
          </Text>
          <Text>Local time, explicit boundaries, and keyboard selection.</Text>
          <Row gap={18} style={{ alignItems: "stretch", flexWrap: "wrap" }}>
            <Card style={{ width: 440 }}>
              <CardHeader
                title="Time input"
                description="15-minute steps, 09:00–17:00. The lunch hour is unavailable."
              />
              <CardContent>
                <TimeField
                  testId="meeting"
                  label="Meeting time"
                  value={draft}
                  onValueChange={setDraft}
                  onValueCommit={setCommit}
                  min="09:00"
                  max="17:00"
                  stepMinutes={15}
                  isTimeDisabled={unavailable}
                />
                <Text size={11} testId="meeting-value">
                  {draft}
                </Text>
                <Text size={11} testId="meeting-commit">
                  {commit}
                </Text>
                <Text size={11}>
                  Enter commits an available time. ↑ / ↓ moves by one available
                  step.
                </Text>
                <TimePicker
                  testId="appointment"
                  label="Appointment"
                  value={time}
                  onValueChange={setTime}
                  min="09:00"
                  max="17:00"
                  stepMinutes={15}
                  isTimeDisabled={unavailable}
                />
                <Text testId="appointment-value" size={11}>
                  {time ?? "No selection"}
                </Text>
                <TimeField
                  testId="readonly-time"
                  label="Read-only"
                  value="10:00"
                  readOnly
                  onValueChange={() => {}}
                />
                <TimePicker
                  testId="disabled-time"
                  label="Disabled"
                  value="09:00"
                  disabled
                  onValueChange={() => {}}
                />
              </CardContent>
            </Card>
            <Card style={{ width: 360 }}>
              <CardHeader
                title="Every minute is reachable"
                description="A full day is paged eight options at a time. Home / End jumps to either end."
              />
              <CardContent>
                <TimeList
                  testId="minutes"
                  value={minute}
                  onValueChange={setMinute}
                />
                <Text testId="minutes-value" size={11}>
                  {minute ?? "No selection"}
                </Text>
                <Text size={11}>
                  ↑ / ↓ selects a row to review. Enter confirms. Page Up / Down
                  changes the visible page.
                </Text>
              </CardContent>
            </Card>
          </Row>
        </Stack>
      </AppShell>
    </UIKitProvider>
  );
}
