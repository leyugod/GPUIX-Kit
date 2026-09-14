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
  TokenCombobox,
  TokenSuggestionList,
  EditableTag,
  TokenEditor,
  TokenPickerPanel,
  TokenPicker,
  type Token,
  type EditableToken,
  type TokenSuggestion,
  type ThemeMode,
} from "@mirai/gpuix-kit";
const options: TokenSuggestion[] = [
  {
    id: "design",
    label: "Design",
    description: "Design systems and visual craft",
    keywords: ["ui", "设计"],
  },
  {
    id: "engineering",
    label: "Engineering",
    description: "Native application development",
    keywords: ["code", "开发"],
  },
  {
    id: "finance",
    label: "Finance",
    description: "Unavailable in this sample",
    disabled: true,
  },
  {
    id: "research",
    label: "Research",
    description: "Interviews and discovery",
  },
  { id: "urgent", label: "Urgent", description: "Requires attention" },
  ...Array.from({ length: 15 }, (_, i) => ({
    id: "team-" + i,
    label: "Team " + String(i + 1).padStart(2, "0"),
    description: "Sample directory label",
  })),
];
const managed: EditableToken[] = [
  { id: "system", label: "System", removable: false, editable: false },
  { id: "design", label: "Design" },
  { id: "engineering", label: "Engineering" },
  { id: "locked", label: "Managed", disabled: true },
  ...Array.from({ length: 5 }, (_, i) => ({
    id: "custom-" + i,
    label: "Custom " + (i + 1),
  })),
];
export function TokensGallery() {
  const [mode, setMode] = useState<ThemeMode>("dark"),
    [name, setName] = useState("Label studio"),
    [event, setEvent] = useState("Ready");
  const [value, setValue] = useState<Token[]>([
      { id: "system", label: "System", removable: false },
      { id: "design", label: "Design" },
    ]),
    [query, setQuery] = useState(""),
    [open, setOpen] = useState(false);
  const [tags, setTags] = useState(managed),
    [page, setPage] = useState(0),
    [single, setSingle] = useState<EditableToken>({
      id: "personal",
      label: "Personal",
    });
  const [selected, setSelected] = useState<Token[]>([
      { id: "research", label: "Research" },
    ]),
    [pickerOpen, setPickerOpen] = useState(false),
    [panel, setPanel] = useState<Token[]>([]);
  return (
    <UIKitProvider mode={mode}>
      <AppShell>
        <Toolbar>
          <Input
            testId="tokens-name"
            value={name}
            onValueChange={setName}
            style={{ width: 300 }}
          />
          <Row style={{ flexGrow: 1, justifyContent: "flex-end" }}>
            <SegmentedControl
              testId="tokens-theme"
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
          testId="tokens-scroll"
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
            Organize with labels.
          </Text>
          <Text size={12}>
            Search existing labels, edit names and review a selection before
            applying it.
          </Text>
          <Row gap={16} style={{ flexWrap: "wrap", alignItems: "flex-start" }}>
            <Card style={{ width: 400 }}>
              <CardHeader
                title="Find and create"
                description="Existing suggestions keep their identity."
              />
              <CardContent>
                <TokenCombobox
                  testId="combo"
                  label="Workspace labels"
                  options={options}
                  value={value}
                  onValueChange={setValue}
                  inputValue={query}
                  onInputValueChange={setQuery}
                  open={open}
                  onOpenChange={setOpen}
                  allowCreate
                  width={368}
                />
                <Text testId="combo-value" size={11}>
                  {value.map((t) => t.label).join(", ")}
                </Text>
                <Text size={12} weight={600}>
                  Suggestion directory
                </Text>
                <TokenSuggestionList
                  testId="suggestions"
                  options={options}
                  pageSize={4}
                  onSelect={(t) => setEvent("suggestion:" + t.id)}
                />
              </CardContent>
            </Card>
            <Card style={{ width: 400 }}>
              <CardHeader
                title="Edit a collection"
                description="Names can change while IDs stay stable."
              />
              <CardContent>
                <TokenEditor
                  testId="editor"
                  value={tags}
                  onValueChange={setTags}
                  page={page}
                  onPageChange={setPage}
                  pageSize={3}
                />
                <Text testId="editor-value" size={10} lines={2}>
                  {tags.map((t) => t.id + ":" + t.label).join(" · ")}
                </Text>
                <Text size={12} weight={600}>
                  Independent editable tag
                </Text>
                <EditableTag
                  testId="single"
                  token={single}
                  onTokenChange={setSingle}
                />
              </CardContent>
            </Card>
            <Card style={{ width: 400 }}>
              <CardHeader
                title="Review a selection"
                description="Cancel keeps the application's saved value."
              />
              <CardContent>
                <TokenPicker
                  testId="picker"
                  options={options}
                  value={selected}
                  onValueChange={setSelected}
                  open={pickerOpen}
                  onOpenChange={setPickerOpen}
                />
                <Text testId="picker-value" size={11}>
                  {selected.map((t) => t.label).join(", ") || "None"}
                </Text>
                <TokenPickerPanel
                  testId="panel"
                  title="Inline selection draft"
                  options={options}
                  value={panel}
                  onApply={(v) => {
                    setPanel(v);
                    setEvent("panel:applied");
                  }}
                  onCancel={() => setEvent("panel:cancelled")}
                />
                <Text testId="panel-value" size={11}>
                  {panel.map((t) => t.label).join(", ") || "None"}
                </Text>
              </CardContent>
            </Card>
          </Row>
          <Text testId="tokens-event" size={12}>
            {event}
          </Text>
        </Stack>
      </AppShell>
    </UIKitProvider>
  );
}
