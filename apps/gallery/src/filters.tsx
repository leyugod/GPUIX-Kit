import { useState } from "react";
import { useWindowSize } from "@gpuix/react";
import {
  UIKitProvider,
  AppShell,
  Input,
  Text,
  Row,
  Stack,
  SegmentedControl,
  FilterPanel,
  FilterSummary,
  SavedViewPicker,
  type FilterExpression,
  type FilterField,
  type SavedFilterView,
  type ThemeMode,
  useTheme,
} from "@mirai/gpuix-kit";
import { cloneFilter } from "@mirai/gpuix-kit/filter-model";
export const filterFields: FilterField[] = [
  { id: "title", label: "Title", kind: "text" },
  { id: "amount", label: "Amount", kind: "number" },
  { id: "date", label: "Created", kind: "date" },
  {
    id: "status",
    label: "Status",
    kind: "enum",
    options: [
      { value: "draft", label: "Draft" },
      { value: "ready", label: "Ready" },
      { value: "closed", label: "Closed", disabled: true },
    ],
  },
  { id: "active", label: "Active", kind: "boolean" },
  { id: "private", label: "Unavailable", kind: "text", disabled: true },
];
export const initialFilter: FilterExpression = {
  match: "all",
  conditions: [
    {
      id: "title-rule",
      fieldId: "title",
      operator: "contains",
      value: "Design",
    },
  ],
};
const records = [
  {
    title: "Design direction",
    amount: 120,
    date: "2026-09-01",
    status: "ready",
    active: true,
  },
  {
    title: "Design notes",
    amount: 80,
    date: "2026-09-02",
    status: "draft",
    active: false,
  },
  {
    title: "Research",
    amount: 210,
    date: "2026-08-10",
    status: "ready",
    active: true,
  },
];
/** 本地样例查询留在应用层；UIKit 不执行查询或拼接 SQL。 */
function accepts(record: (typeof records)[number], filter: FilterExpression) {
  const checks = filter.conditions.map((c) => {
    const source = record[c.fieldId as keyof typeof record],
      actual = String(source ?? ""),
      op = c.operator;
    if (op === "isEmpty") return actual === "";
    if (op === "isNotEmpty") return actual !== "";
    if (op === "contains")
      return actual.toLowerCase().includes(c.value.toLowerCase());
    if (op === "equals") return actual === c.value;
    if (op === "notEquals") return actual !== c.value;
    if (op === "gt") return Number(source) > Number(c.value);
    if (op === "lt") return Number(source) < Number(c.value);
    return op === "before" ? actual < c.value : actual > c.value;
  });
  return (
    !checks.length ||
    (filter.match === "all" ? checks.every(Boolean) : checks.some(Boolean))
  );
}
export function FiltersGallery() {
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
    [name, setName] = useState("Saved filters"),
    [filter, setFilter] = useState(initialFilter),
    [revision, setRevision] = useState(0),
    [selected, setSelected] = useState<string | null>("design"),
    [event, setEvent] = useState("Edit a draft, then Apply");
  const [views, setViews] = useState<SavedFilterView[]>([
      {
        id: "design",
        label: "Design documents",
        filter: cloneFilter(initialFilter),
      },
      {
        id: "all",
        label: "All records",
        filter: { match: "all", conditions: [] },
        readOnly: true,
      },
      ...Array.from({ length: 7 }, (_, i) => ({
        id: "view-" + i,
        label: "Sample " + (i + 1),
        filter: { match: "all" as const, conditions: [] },
        disabled: i === 2,
      })),
    ]),
    [attempt, setAttempt] = useState(0);
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
          Filters
        </Text>
        <Input
          testId="filters-name"
          value={name}
          onValueChange={setName}
          style={{ width: 200 }}
        />
        <div style={{ flexGrow: 1 }} />
        <Text size={11}>Local sample views</Text>
        <SegmentedControl
          testId="filters-theme"
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
        style={{
          padding: 16,
          height: Math.max(400, height - 100),
          alignItems: "stretch",
        }}
      >
        <Stack
          gap={16}
          style={{
            width: Math.max(400, width - 368),
            minHeight: 0,
            overflowY: "scroll",
          }}
        >
          <Text size={16} weight={600}>
            {name}
          </Text>
          <FilterPanel
            testId="filters-panel"
            fields={filterFields}
            value={filter}
            revision={revision}
            onApply={(next) => {
              setFilter(next);
              setEvent("Applied " + next.conditions.length + " conditions");
            }}
            onCancel={() => {
              setRevision(revision + 1);
              setEvent("Draft cancelled");
            }}
          />
          <FilterSummary
            testId="filters-summary"
            fields={filterFields}
            value={filter}
            onRemove={(id) =>
              setFilter({
                ...filter,
                conditions: filter.conditions.filter((c) => c.id !== id),
              })
            }
            onClear={() => setFilter({ match: "all", conditions: [] })}
          />
        </Stack>
        <Stack
          gap={16}
          style={{
            width: 320,
            padding: 12,
            minHeight: 0,
            overflowY: "scroll",
            borderWidth: 1,
            borderColor: c.border,
            borderRadius: 10,
            backgroundColor: c.surface,
          }}
        >
          <Text size={15} weight={600}>
            Saved views
          </Text>
          <SavedViewPicker
            testId="filters-views"
            fields={filterFields}
            views={views}
            value={selected}
            filter={filter}
            onValueChange={(id) => {
              setSelected(id);
              setFilter(cloneFilter(views.find((v) => v.id === id)!.filter));
              setEvent("Selected " + id);
            }}
            onCreate={async (label, snapshot) => {
              const next = attempt + 1;
              setAttempt(next);
              await Promise.resolve();
              if (next === 1) throw Error("Sample persistence failure");
              const id = "created-" + next;
              setViews((current) => [
                ...current,
                { id, label, filter: snapshot },
              ]);
              setSelected(id);
              setEvent("Created " + label);
            }}
            onUpdate={async (id, snapshot) => {
              await Promise.resolve();
              setViews((current) =>
                current.map((v) =>
                  v.id === id ? { ...v, filter: snapshot } : v,
                ),
              );
              setEvent("Updated " + id);
            }}
            onRename={async (id, label) => {
              await Promise.resolve();
              setViews((current) =>
                current.map((v) => (v.id === id ? { ...v, label } : v)),
              );
              setEvent("Renamed " + label);
            }}
            onRemove={async (id) => {
              await Promise.resolve();
              setViews((current) => current.filter((v) => v.id !== id));
              setSelected(null);
              setEvent("Deleted " + id);
            }}
          />
          <Text testId="filters-count" size={14} weight={600}>
            {records.filter((r) => accepts(r, filter)).length +
              " matching records"}
          </Text>
          {records
            .filter((r) => accepts(r, filter))
            .map((r) => (
              <Stack
                key={r.title}
                gap={4}
                style={{
                  padding: 8,
                  borderWidth: 1,
                  borderColor: c.border,
                  borderRadius: 6,
                }}
              >
                <Text size={12}>{r.title}</Text>
                <Text size={11} color={c.muted}>
                  {r.status + " · " + r.amount}
                </Text>
              </Stack>
            ))}
        </Stack>
      </Row>
      <Text
        testId="filters-event"
        size={12}
        style={{ height: 40, padding: 12 }}
      >
        {event}
      </Text>
    </AppShell>
  );
}
