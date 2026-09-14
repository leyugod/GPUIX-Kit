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
  Checkbox,
  CheckboxGroup,
  Tag,
  TokenField,
  type ThemeMode,
  type Token,
  type CheckboxState,
} from "@mirai/gpuix-kit";
const options = [
  { value: "settings", label: "Project settings" },
  { value: "reports", label: "Reports and dashboards" },
  { value: "exports", label: "Export tools" },
  { value: "locked", label: "Managed by administrator", disabled: true },
];
const initial: Token[] = [
  { id: "design", label: "Design" },
  { id: "system", label: "System", removable: false },
  { id: "offline", label: "Unavailable", disabled: true },
];
export function ChoicesGallery() {
  const [mode, setMode] = useState<ThemeMode>("dark"),
    [name, setName] = useState("Selections and tokens"),
    [page, setPage] = useState("selection");
  const [checked, setChecked] = useState<CheckboxState>("indeterminate"),
    [permissions, setPermissions] = useState([
      "settings",
      "locked",
      "other-page",
    ]);
  const [tokens, setTokens] = useState(initial),
    [draft, setDraft] = useState(""),
    [selected, setSelected] = useState(false);
  return (
    <UIKitProvider mode={mode}>
      <AppShell>
        <Toolbar>
          <Input
            testId="choices-name"
            value={name}
            onValueChange={setName}
            style={{ width: 300 }}
          />
          <Row style={{ flexGrow: 1, justifyContent: "flex-end" }}>
            <SegmentedControl
              testId="choices-theme"
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
          testId="choices-scroll"
          gap={18}
          style={{
            padding: 24,
            flexGrow: 1,
            flexShrink: 1,
            minHeight: 0,
            overflowY: "scroll",
          }}
        >
          <Text size={26} weight={600}>
            Selection with clear boundaries.
          </Text>
          <Text>
            Partial selection, protected choices and editable collections.
          </Text>
          <SegmentedControl
            testId="choices-page"
            value={page}
            onValueChange={setPage}
            options={[
              { value: "selection", label: "Checkboxes" },
              { value: "tokens", label: "Tags and tokens" },
            ]}
          />
          {page === "selection" ? (
            <Row gap={18} style={{ alignItems: "stretch", flexWrap: "wrap" }}>
              <Card style={{ width: 420 }}>
                <CardHeader
                  title="Selection scope"
                  description="Select all updates editable options on this page. Other selections remain."
                />
                <CardContent>
                  <CheckboxGroup
                    testId="permissions"
                    options={options}
                    value={permissions}
                    onValueChange={setPermissions}
                    label="Workspace access"
                    selectAllLabel="All editable permissions"
                  />
                  <Text testId="permissions-value" size={11}>
                    {permissions.join(", ")}
                  </Text>
                </CardContent>
              </Card>
              <Card style={{ width: 380 }}>
                <CardHeader title="Checkbox states" />
                <CardContent>
                  <Checkbox
                    testId="mixed"
                    label="Partial selection"
                    checked={checked}
                    onCheckedChange={setChecked}
                  />
                  <Text testId="mixed-value">{String(checked)}</Text>
                  <Checkbox
                    testId="readonly-check"
                    label="Read-only, focusable"
                    checked="indeterminate"
                    readOnly
                    onCheckedChange={() => {}}
                  />
                  <Checkbox
                    testId="disabled-check"
                    label="Disabled partial selection"
                    checked="indeterminate"
                    disabled
                    onCheckedChange={() => {}}
                  />
                  <CheckboxGroup
                    testId="empty-group"
                    options={[]}
                    value={[]}
                    onValueChange={() => {}}
                  />
                  <CheckboxGroup
                    testId="readonly-group"
                    label="Read-only scope"
                    readOnly
                    options={options.slice(0, 2)}
                    value={["settings"]}
                    onValueChange={() => {}}
                  />
                </CardContent>
              </Card>
            </Row>
          ) : (
            <Row gap={18} style={{ alignItems: "stretch", flexWrap: "wrap" }}>
              <Card style={{ width: 520 }}>
                <CardHeader
                  title="Editable tokens"
                  description="A complete batch is validated before any label is added."
                />
                <CardContent>
                  <TokenField
                    testId="tokens"
                    label="Workspace labels"
                    value={tokens}
                    onValueChange={setTokens}
                    inputValue={draft}
                    onInputValueChange={setDraft}
                    maxTokens={8}
                    maxTokenLength={24}
                    validateToken={(label) =>
                      label.toLowerCase() === "reserved"
                        ? "This label is reserved."
                        : null
                    }
                  />
                  <Text testId="token-values" size={11}>
                    {tokens.map((t) => t.id).join(", ")}
                  </Text>
                  <Text testId="token-draft" size={11}>
                    {draft}
                  </Text>
                </CardContent>
              </Card>
              <Card style={{ width: 380 }}>
                <CardHeader title="Display and protection" />
                <CardContent>
                  <Row style={{ flexWrap: "wrap" }}>
                    <Tag testId="tag-neutral" label="Native UIKit" />
                    <Tag testId="tag-success" label="Verified" tone="success" />
                    <Tag
                      testId="tag-toggle"
                      label="Selectable"
                      selected={selected}
                      onPress={() => setSelected((v) => !v)}
                    />
                    <Tag
                      testId="tag-long"
                      label="A long label remains inside its container"
                      maxWidth={160}
                    />
                  </Row>
                  <TokenField
                    testId="readonly-tokens"
                    label="Read-only collection"
                    readOnly
                    value={[
                      { id: "protected", label: "Protected" },
                      { id: "shared", label: "Shared workspace" },
                    ]}
                    onValueChange={() => {}}
                    inputValue="Read-only draft"
                    onInputValueChange={() => {}}
                    hint="Labels remain selectable; editing and removal are disabled."
                  />
                  <TokenField
                    testId="disabled-tokens"
                    label="Disabled collection"
                    disabled
                    value={[{ id: "disabled", label: "Not editable" }]}
                    onValueChange={() => {}}
                    inputValue=""
                    onInputValueChange={() => {}}
                    hint="Disabled controls do not receive keyboard focus."
                  />
                </CardContent>
              </Card>
            </Row>
          )}
        </Stack>
      </AppShell>
    </UIKitProvider>
  );
}
