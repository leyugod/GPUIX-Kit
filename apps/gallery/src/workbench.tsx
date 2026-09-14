import { useState } from "react";
import { useWindowSize } from "@gpuix/react";
import {
  AppShell,
  UIKitProvider,
  useTheme,
  Stack,
  Row,
  Text,
  Button,
  Input,
  Field,
  Toolbar,
  SegmentedControl,
  TreeView,
  DataGrid,
  FilterBar,
  DocumentTabs,
  closeDocument,
  Pagination,
  sortRows,
  FormSection,
  FormErrorSummary,
  FormActions,
  useForm,
  required,
  composeRules,
  minLength,
  CodeBlock,
  DiffView,
  FileList,
  FilePickerArea,
  ContentPreview,
  ListView,
  Badge,
  type ThemeMode,
  type SortDescriptor,
  type FilterState,
  type DocumentTab,
  type FileItem,
} from "@mirai/gpuix-kit";
const initialRecords = Array.from({ length: 23 }, (_, i) => ({
  id: `record-${i}`,
  name:
    [
      "Design system",
      "Release checklist",
      "Native keyboard",
      "Workspace layout",
      "Accessibility audit",
    ][i % 5] + ` ${i + 1}`,
  owner: i % 2 ? "Morgan" : "Alex",
  status: i % 3 ? "Active" : "Draft",
}));
const patch =
  'diff --git a/theme.ts b/theme.ts\n--- a/theme.ts\n+++ b/theme.ts\n@@ -1,2 +1,2 @@\n-export const appearance = "dark";\n+export const appearance = "light";\n export const density = "comfortable";\n';
export function WorkbenchGallery({
  initialMode = "dark",
}: {
  initialMode?: ThemeMode;
}) {
  const [mode, setMode] = useState<ThemeMode>(initialMode);
  return (
    <UIKitProvider mode={mode}>
      <Workbench mode={mode} setMode={setMode} />
    </UIKitProvider>
  );
}
function Workbench({
  mode,
  setMode,
}: {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}) {
  const { colors: c } = useTheme();
  const window = useWindowSize();
  const [title, setTitle] = useState("Component workspace");
  const [active, setActive] = useState<string | null>("records");
  const [tabs, setTabs] = useState<DocumentTab[]>([
    { id: "records", label: "Records", closable: false },
    { id: "settings", label: "Settings", dirty: true },
    { id: "source", label: "Source" },
    { id: "files", label: "Files" },
    { id: "activity", label: "Activity" },
  ]);
  const [expanded, setExpanded] = useState<string[]>(["workspace"]);
  const [treeSelection, setTreeSelection] = useState<string[]>(["records"]);
  const [records, setRecords] = useState(initialRecords);
  const [selected, setSelected] = useState<string[]>([]);
  const [sort, setSort] = useState<SortDescriptor | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    query: "",
    values: {},
  });
  const [page, setPage] = useState(1);
  const [widths, setWidths] = useState<Record<string, number>>({
    name: Math.max(310, Math.min(390, window.width - 720)),
    owner: 210,
    status: 190,
  });
  const [values, setValues] = useState({ name: "", description: "" });
  const [saved, setSaved] = useState(0);
  const [preview, setPreview] = useState("theme.ts");
  const [collapsed, setCollapsed] = useState<string[]>([]);
  const [files, setFiles] = useState<FileItem[]>([
    {
      id: "theme",
      name: "theme.ts",
      detail: "TypeScript · sample file",
      status: "ready",
    },
    {
      id: "archive",
      name: "assets.zip",
      status: "failed",
      error: "Demo failure state",
    },
    { id: "media", name: "preview.png", status: "uploading", progress: 64 },
  ]);
  const [chosen, setChosen] = useState<string[]>([]);
  const form = useForm({
    values,
    onValuesChange: setValues,
    rules: {
      name: composeRules(required("Enter a workspace name"), minLength(3)),
      description: required("Add a description"),
    },
    onSubmit: () => {
      setSaved((n) => n + 1);
      setTabs((current) =>
        current.map((t) => (t.id === "settings" ? { ...t, dirty: false } : t)),
      );
    },
  });
  const filtered = records.filter(
    (r) =>
      r.name.toLowerCase().includes(filters.query.toLowerCase()) &&
      (!filters.values.status || r.status === filters.values.status),
  );
  const sorted = sortRows(
    filtered,
    sort,
    (row, id) => row[id as keyof typeof row],
  );
  const open = (id: string) => {
    if (!tabs.some((t) => t.id === id)) setTabs([...tabs, { id, label: id }]);
    setActive(id);
  };
  return (
    <AppShell
      sidebar={
        <Stack
          style={{
            width: 228,
            height: "100%",
            padding: 14,
            backgroundColor: c.surface,
            borderRightWidth: 1,
            borderColor: c.border,
          }}
        >
          <Text size={18} weight={600}>
            ◈ Mirai UIKit
          </Text>
          <Text size={11} color={c.muted}>
            WORKBENCH · v0.3
          </Text>
          <TreeView
            testId="workbench-tree"
            height={Math.max(200, window.height - 155)}
            nodes={[
              {
                id: "workspace",
                label: "Workspace",
                children: [
                  { id: "records", label: "Records" },
                  { id: "settings", label: "Settings" },
                  { id: "source", label: "Source previews" },
                  { id: "files", label: "Files" },
                  { id: "activity", label: "Activity" },
                  { id: "locked", label: "Archived", disabled: true },
                ],
              },
              {
                id: "remote",
                label: "Lazy collection",
                hasChildren: true,
                children: expanded.includes("remote")
                  ? [{ id: "remote-item", label: "Loaded sample" }]
                  : undefined,
              },
            ]}
            expandedIds={expanded}
            onExpandedChange={setExpanded}
            selectedIds={treeSelection}
            onSelectionChange={setTreeSelection}
            onActivate={(node) => {
              if (
                ["records", "settings", "source", "files", "activity"].includes(
                  node.id,
                )
              )
                open(node.id);
            }}
          />
          <Text size={11} color={c.muted}>
            Select with arrows. Enter to open.
          </Text>
        </Stack>
      }
    >
      <Toolbar
        style={{ height: 62, padding: 12, justifyContent: "space-between" }}
      >
        <Input
          testId="workbench-name"
          value={title}
          onValueChange={setTitle}
          style={{ width: 230 }}
        />
        <SegmentedControl
          testId="workbench-theme"
          value={mode}
          onValueChange={(v) => setMode(v as ThemeMode)}
          options={[
            { value: "light", label: "Light" },
            { value: "dark", label: "Dark" },
          ]}
        />
      </Toolbar>
      <DocumentTabs
        testId="workbench-tabs"
        tabs={tabs}
        value={active}
        onValueChange={setActive}
        onClose={(id) => {
          const next = closeDocument(tabs, active ?? "", id);
          setTabs(next.tabs);
          setActive(next.value);
        }}
        onAdd={() => open("notes")}
        onReorder={(ids) =>
          setTabs(ids.map((id) => tabs.find((t) => t.id === id)!))
        }
      />
      <Stack
        testId="workbench-content"
        gap={16}
        style={{ padding: 20, minHeight: 0, flexGrow: 1, flexShrink: 1 }}
      >
        {active === "records" ? (
          <>
            <Row>
              <Stack gap={5} style={{ flexGrow: 1, flexShrink: 1 }}>
                <Text size={24} weight={600}>
                  Records, ready for work.
                </Text>
                <Text size={12} color={c.muted}>
                  Sort the full dataset, select a page, and edit a cell.
                </Text>
              </Stack>
              <Badge tone="accent">23 sample records</Badge>
            </Row>
            <FilterBar
              testId="workbench-filter"
              value={filters}
              onValueChange={(next) => {
                setFilters(next);
                setPage(1);
              }}
              filters={[
                {
                  id: "status",
                  label: "All statuses",
                  options: [
                    { value: "Active", label: "Active" },
                    { value: "Draft", label: "Draft" },
                  ],
                },
              ]}
            />
            <DataGrid
              testId="workbench-grid"
              rows={sorted.slice((page - 1) * 6, page * 6)}
              rowKey={(r) => r.id}
              rowDisabled={(r) => r.id === "record-2"}
              columns={[
                {
                  id: "name",
                  header: "Name",
                  value: (r) => r.name,
                  sortable: true,
                  editable: true,
                  minWidth: 180,
                  maxWidth: 460,
                  validate: (v) => (v.trim() ? undefined : "Name is required"),
                },
                {
                  id: "owner",
                  header: "Owner",
                  value: (r) => r.owner,
                  sortable: true,
                },
                {
                  id: "status",
                  header: "Status",
                  value: (r) => r.status,
                  sortable: true,
                  render: (r) => (
                    <Badge tone={r.status === "Active" ? "success" : "neutral"}>
                      {r.status}
                    </Badge>
                  ),
                },
              ]}
              sort={sort}
              onSortChange={(next) => {
                setSort(next);
                setPage(1);
              }}
              selectedIds={selected}
              onSelectionChange={setSelected}
              columnWidths={widths}
              onColumnWidthsChange={setWidths}
              onCellEdit={(row, key, value) =>
                setRecords((current) =>
                  current.map((r) =>
                    r.id === row.id ? { ...r, [key]: value } : r,
                  ),
                )
              }
              height={Math.max(180, Math.min(360, window.height - 430))}
            />
            <Pagination
              testId="workbench-pages"
              page={page}
              pageSize={6}
              total={filtered.length}
              onPageChange={setPage}
            />
          </>
        ) : null}
        {active === "settings" ? (
          <Stack style={{ overflowY: "scroll", minHeight: 0, flexShrink: 1 }}>
            <FormSection
              title="Workspace settings"
              description="Validation and focus are shared. Values stay in the application."
            >
              <FormErrorSummary
                testId="workbench-errors"
                errors={form.errors}
                onFocus={(name) => form.focusField(name as keyof typeof values)}
              />
              <Field label="Name" error={form.errors.name}>
                <Input testId="workbench-form-name" {...form.field("name")} />
              </Field>
              <Field label="Description" error={form.errors.description}>
                <Input
                  testId="workbench-form-description"
                  {...form.field("description")}
                />
              </Field>
            </FormSection>
            <FormActions
              testId="workbench-form"
              submitting={form.submitting}
              submitLabel="Save demo"
              onSubmit={() => {
                void form.submit();
              }}
            />
            <Text testId="workbench-saved" color={c.muted} size={12}>
              Saved in memory: {saved}
            </Text>
          </Stack>
        ) : null}
        {active === "source" ? (
          <Stack gap={14} style={{ minHeight: 0, flexShrink: 1 }}>
            <ContentPreview testId="workbench-preview" title={preview}>
              <CodeBlock
                testId="workbench-code"
                language="ts"
                path="theme.ts"
                height={160}
                code={
                  'export const appearance = "light";\nexport const density = "comfortable";\n\n// Every view shares semantic tokens.\nexport const radius = 8;'
                }
              />
            </ContentPreview>
            <DiffView
              testId="workbench-diff"
              patch={patch}
              height={Math.max(120, window.height - 450)}
              collapsedPaths={collapsed}
              onCollapsedPathsChange={setCollapsed}
            />
          </Stack>
        ) : null}
        {active === "files" ? (
          <Stack style={{ overflowY: "scroll", flexShrink: 1, minHeight: 0 }}>
            <Text size={23} weight={600}>
              Files & transfer states
            </Text>
            <FilePickerArea
              chooseLabel="Add sample file"
              testId="workbench-picker"
              description="Add an in-memory sample; no system file picker is connected."
              onChoose={() =>
                setFiles((current) => [
                  ...current,
                  {
                    id: `sample-${current.length}`,
                    name: "sample.txt",
                    status: "ready",
                    detail: "In-memory sample",
                  },
                ])
              }
            />
            <FileList
              testId="workbench-files"
              files={files}
              onOpen={(id) => {
                setPreview(files.find((f) => f.id === id)?.name ?? "Preview");
                open("source");
              }}
              onRetry={(id) =>
                setFiles((current) =>
                  current.map((f) =>
                    f.id === id
                      ? { ...f, status: "queued", error: undefined }
                      : f,
                  ),
                )
              }
              onRemove={(id) =>
                setFiles((current) => current.filter((f) => f.id !== id))
              }
            />
          </Stack>
        ) : null}
        {active === "activity" ? (
          <>
            <Text size={23} weight={600}>
              Selectable activity list
            </Text>
            <ListView
              testId="workbench-list"
              items={Array.from({ length: 12 }, (_, i) => ({
                id: `item-${i}`,
                label: `Review task ${i + 1}`,
                disabled: i === 2,
              }))}
              selectedIds={chosen}
              onSelectionChange={setChosen}
              selectionMode="multiple"
              height={360}
              renderItem={(item, { selected }) => (
                <Row>
                  <Text color={selected ? c.accent : c.text} size={13}>
                    {item.label}
                  </Text>
                  {selected ? <Badge>Selected</Badge> : null}
                </Row>
              )}
            />
            <Text testId="workbench-list-value" size={12} color={c.muted}>
              {chosen.join(",") || "No selection"}
            </Text>
          </>
        ) : null}
        {active === "notes" ? (
          <Text size={16}>New document — application-owned content.</Text>
        ) : null}
      </Stack>
    </AppShell>
  );
}
