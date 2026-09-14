import { useState } from "react";
import {
  Slider,
  RangeSlider,
  Row,
  Text,
  Card,
  CardHeader,
  CardContent,
} from "@mirai/gpuix-kit";
const marks = [
  { value: 0, label: "0%" },
  { value: 25, label: "25%" },
  { value: 50, label: "50%" },
  { value: 75, label: "75%" },
  { value: 100, label: "100%" },
];
export function TrackExamples() {
  const [value, setValue] = useState(25),
    [range, setRange] = useState<[number, number]>([20, 80]),
    [level, setLevel] = useState(30),
    [interval, setInterval] = useState<[number, number]>([20, 60]),
    [commits, setCommits] = useState(0);
  return (
    <Row gap={18} style={{ alignItems: "stretch", flexWrap: "wrap" }}>
      <Card style={{ width: 420 }}>
        <CardHeader
          title="Click a position. Keep precision."
          description="Track clicks choose the closest step. Range clicks move the nearest thumb."
        />
        <CardContent>
          <Slider
            testId="track-volume"
            label="Volume"
            value={value}
            onValueChange={setValue}
            onValueCommit={() => setCommits((n) => n + 1)}
            step={5}
            trackPress
            marks={marks}
          />
          <RangeSlider
            testId="track-range"
            label="Working range"
            value={range}
            onValueChange={setRange}
            step={10}
            trackPress
            marks={marks}
          />
          <Slider
            testId="track-readonly"
            label="Read-only reference"
            value={60}
            onValueChange={() => {}}
            readOnly
            trackPress
            marks={[
              { value: 0, label: "Minimum" },
              { value: 100, label: "Maximum" },
            ]}
          />
          <Text testId="track-commits" size={11}>{`Commits: ${commits}`}</Text>
        </CardContent>
      </Card>
      <Card style={{ width: 400 }}>
        <CardHeader
          title="Vertical controls"
          description="Marks follow the value scale. Higher values are at the top."
        />
        <CardContent>
          <Row gap={48} style={{ alignItems: "flex-start" }}>
            <Slider
              testId="track-level"
              label="Level"
              value={level}
              onValueChange={setLevel}
              step={10}
              trackPress
              marks={[
                { value: 0, label: "Quiet" },
                { value: 50, label: "Medium" },
                { value: 100, label: "Full" },
              ]}
              orientation="vertical"
              length={180}
            />
            <RangeSlider
              testId="track-interval"
              label="Interval"
              value={interval}
              onValueChange={setInterval}
              step={10}
              trackPress
              marks={[
                { value: 0, label: "0" },
                { value: 100, label: "100" },
              ]}
              orientation="vertical"
              length={180}
            />
          </Row>
          <Slider
            testId="track-disabled"
            label="Disabled"
            value={30}
            onValueChange={() => {}}
            disabled
            trackPress
            step={10}
            marks={marks}
          />
        </CardContent>
      </Card>
    </Row>
  );
}
