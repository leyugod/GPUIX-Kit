import { useState } from "react";
import { useWindowSize } from "@gpuix/react";
import {
  UIKitProvider,
  AppShell,
  Row,
  Stack,
  Input,
  Text,
  SegmentedControl,
  TablePreferencesPanel,
  ConfigurableDataGrid,
  type TablePreferences,
  type TableColumnOption,
  type ThemeMode,
  useTheme,
} from "@mirai/gpuix-kit";
import {
  defaultTablePreferences,
  sortByRules,
} from "@mirai/gpuix-kit/table-preferences-model";
const columns = [
  {
    id: "name",
    header: "Name",
    label: "Name",
    sortable: true,
    hideable: false,
    reorderable: false,
    width: 210,
    value: (r: RecordRow) => r.name,
  },
  {
    id: "status",
    header: "Status",
    label: "Status",
    sortable: true,
    width: 140,
    value: (r: RecordRow) => r.status,
  },
  {
    id: "amount",
    header: "Amount",
    label: "Amount",
    sortable: true,
    width: 140,
    value: (r: RecordRow) => r.amount,
  },
  {
    id: "owner",
    header: "Owner",
    label: "Owner",
    sortable: true,
    width: 130,
    value: (r: RecordRow) => r.owner,
  },
  {
    id: "region",
    header: "Region",
    label: "Region",
    width: 130,
    value: (r: RecordRow) => r.region,
  },
  {
    id: "code",
    header: "Code",
    label: "Code",
    width: 100,
    value: (r: RecordRow) => r.code,
  },
];
interface RecordRow {
  id: string;
  name: string;
  status: string;
  amount: number;
  owner: string;
  region: string;
  code: string;
}
const records: RecordRow[] = Array.from({ length: 18 }, (_, i) => ({
  id: "row-" + i,
  name: ["Design", "Research", "Library"][i % 3] + " " + (i + 1),
  status: i % 2 ? "Draft" : "Ready",
  amount: (i * 37) % 400,
  owner: i % 2 ? "Alex" : "Sam",
  region: i % 3 ? "East" : "West",
  code: "D" + i,
}));
export function TablePreferencesGallery() {
  const [mode, setMode] = useState<ThemeMode>("dark");
  return (
    <UIKitProvider mode={mode}>
      <Browser mode={mode} onMode={setMode} />
    </UIKitProvider>
  );
}
function Browser({
  mode,
  onMode,
}: {
  mode: ThemeMode;
  onMode: (mode: ThemeMode) => void;
}) {
  const { width, height } = useWindowSize(),
    { colors: c } = useTheme(),
    [name, setName] = useState("Table preferences"),
    [preferences, setPreferences] = useState<TablePreferences>(() =>
      defaultTablePreferences(columns),
    ),
    [revision, setRevision] = useState(0),
    [selected, setSelected] = useState<string[]>([]),
    [event, setEvent] = useState("Edit preferences, then Apply");
  const rows = sortByRules(records, preferences.sorts, (row, id) =>
    columns.find((c) => c.id === id)?.value(row),
  );
  return (
    <AppShell>
      <Row
        style={{
          height: 60,
          padding: 12,
          backgroundColor: c.surface,
          borderBottomWidth: 1,
          borderColor: c.border,
        }}
      >
        <Text size={18} weight={600}>
          Table
        </Text>
        <Input
          testId="table-prefs-name"
          value={name}
          onValueChange={setName}
          style={{ width: 220 }}
        />
        <div style={{ flexGrow: 1 }} />
        <SegmentedControl
          testId="table-prefs-theme"
          value={mode}
          onValueChange={(v) => onMode(v as ThemeMode)}
          options={[
            { value: "light", label: "Light" },
            { value: "dark", label: "Dark" },
          ]}
        />
      </Row>
      <Row
        gap={16}
        style={{ height: height - 100, padding: 16, alignItems: "stretch" }}
      >
        <Stack
          gap={12}
          style={{
            width: 480,
            padding: 12,
            overflowY: "scroll",
            backgroundColor: c.surface,
            borderWidth: 1,
            borderColor: c.border,
            borderRadius: 10,
          }}
        >
          <Text size={16} weight={600}>
            View settings
          </Text>
          <TablePreferencesPanel
            testId="table-prefs-panel"
            columns={columns}
            value={preferences}
            revision={revision}
            onApply={(next) => {
              setPreferences(next);
              setEvent("Applied " + next.density);
            }}
            onCancel={() => {
              setRevision(revision + 1);
              setEvent("Draft cancelled");
            }}
          />
        </Stack>
        <Stack
          gap={12}
          style={{ width: Math.max(300, width - 528), minWidth: 0 }}
        >
          <Text size={16} weight={600}>
            {name}
          </Text>
          <Text testId="table-prefs-state" size={11}>
            {preferences.density +
              " · " +
              preferences.order
                .filter((id) => !preferences.hiddenIds.includes(id))
                .join(", ")}
          </Text>
          <ConfigurableDataGrid
            testId="table-prefs-grid"
            rows={rows}
            columns={columns}
            preferences={preferences}
            onPreferencesChange={setPreferences}
            rowKey={(r) => r.id}
            rowDisabled={(r) => r.id === "row-2"}
            selectedIds={selected}
            onSelectionChange={setSelected}
            height={Math.max(160, height - 312)}
            onActivate={(r) => setEvent("Opened " + r.name)}
          />
          <Text testId="table-prefs-first" size={11}>
            {"First: " + rows[0]!.id}
          </Text>
        </Stack>
      </Row>
      <Text
        testId="table-prefs-event"
        size={12}
        style={{ height: 40, padding: 12 }}
      >
        {event}
      </Text>
    </AppShell>
  );
}
