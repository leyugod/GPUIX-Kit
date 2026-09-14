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
  ColorSwatch,
  ColorWell,
  ColorField,
  ColorPalette,
  ColorPanel,
  ColorPicker,
  defaultPalette,
  type ThemeMode,
} from "@mirai/gpuix-kit";
export function ColorsGallery() {
  const [mode, setMode] = useState<ThemeMode>("dark"),
    [name, setName] = useState("Color studio");
  const [draft, setDraft] = useState("#2563eb"),
    [commit, setCommit] = useState("—");
  const [color, setColor] = useState("#2563EB80"),
    [palette, setPalette] = useState<string | null>("#2563EB");
  const [chosen, setChosen] = useState<string | null>("#8B5CF6"),
    [open, setOpen] = useState(false),
    [well, setWell] = useState(0);
  return (
    <UIKitProvider mode={mode}>
      <AppShell>
        <Toolbar>
          <Input
            testId="colors-name"
            value={name}
            onValueChange={setName}
            style={{ width: 300 }}
          />
          <Row style={{ flexGrow: 1, justifyContent: "flex-end" }}>
            <SegmentedControl
              testId="colors-theme"
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
          testId="colors-scroll"
          gap={16}
          style={{
            padding: 24,
            flexGrow: 1,
            flexShrink: 1,
            minHeight: 0,
            overflowY: "scroll",
          }}
        >
          <Text size={26} weight={600}>
            Color, down to the channel.
          </Text>
          <Text size={12}>
            Hexadecimal input · transparent previews · reusable native controls
          </Text>
          <Row gap={18} style={{ alignItems: "stretch", flexWrap: "wrap" }}>
            <Card style={{ width: 440 }}>
              <CardHeader
                title="Live color panel"
                description="Adjust R, G, B and alpha, or choose from the palette."
              />
              <CardContent>
                <ColorPanel
                  testId="panel"
                  value={color}
                  onValueChange={setColor}
                />
                <Text testId="panel-value" size={12}>
                  {color}
                </Text>
              </CardContent>
            </Card>
            <Card style={{ width: 440 }}>
              <CardHeader
                title="Hex input & preview"
                description="Keep the raw draft while editing. Enter commits a valid color."
              />
              <CardContent>
                <ColorField
                  testId="hex"
                  label="Accent color"
                  value={draft}
                  onValueChange={setDraft}
                  onValueCommit={setCommit}
                />
                <Row>
                  <Text size={11}>Committed</Text>
                  <Text testId="hex-commit" size={11}>
                    {commit}
                  </Text>
                </Row>
                <Row gap={12}>
                  <ColorSwatch
                    testId="opaque-swatch"
                    value="#2563EB"
                    size={42}
                  />
                  <ColorSwatch
                    testId="alpha-swatch"
                    value="#2563EB80"
                    size={42}
                  />
                  <ColorSwatch
                    testId="transparent-swatch"
                    value="#0000"
                    size={42}
                  />
                  <ColorSwatch testId="empty-swatch" value={null} size={42} />
                </Row>
                <ColorWell
                  testId="well"
                  value="#14B8A6"
                  label="Inspect color"
                  onPress={() => setWell((n) => n + 1)}
                />
                <Text testId="well-count" size={11}>
                  Open intents: {well}
                </Text>
              </CardContent>
            </Card>
            <Card style={{ width: 440 }}>
              <CardHeader
                title="Saved palette"
                description="Arrow keys browse. Enter selects. Additional colors are paged."
              />
              <CardContent>
                <ColorPalette
                  testId="saved"
                  items={defaultPalette}
                  value={palette}
                  onValueChange={setPalette}
                />
                <Text testId="saved-value" size={11}>
                  {palette ?? "None"}
                </Text>
              </CardContent>
            </Card>
            <Card style={{ width: 440 }}>
              <CardHeader
                title="Choose, review, apply"
                description="A local draft stays inside the picker until you apply it."
              />
              <CardContent>
                <ColorPicker
                  testId="picker"
                  label="Document accent"
                  value={chosen}
                  onValueChange={setChosen}
                  open={open}
                  onOpenChange={setOpen}
                  clearable
                />
                <Text testId="picker-value" size={12}>
                  {chosen ?? "None"}
                </Text>
                <ColorWell
                  testId="readonly-well"
                  value="#F97316"
                  label="Read only"
                  readOnly
                  onPress={() => {}}
                />
              </CardContent>
            </Card>
          </Row>
        </Stack>
      </AppShell>
    </UIKitProvider>
  );
}
