import { Button, Input, Row, Select } from "../../base";
export interface FilterDefinition {
  id: string;
  label: string;
  options: readonly { value: string; label: string; disabled?: boolean }[];
}
export interface FilterState {
  query: string;
  values: Readonly<Record<string, string>>;
}
/** 仅发出筛选意图；查询、分页重置和保存视图归应用所有。 */
export function FilterBar({
  value,
  onValueChange,
  filters = [],
  testId,
  placeholder = "Search records…",
  disabled = false,
}: {
  value: FilterState;
  onValueChange: (value: FilterState) => void;
  filters?: readonly FilterDefinition[];
  testId: string;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <Row testId={testId} style={{ flexWrap: "wrap", alignItems: "center" }}>
      <Input
        testId={`${testId}-search`}
        value={value.query}
        disabled={disabled}
        placeholder={placeholder}
        style={{ width: 220, flexGrow: 1 }}
        onValueChange={(query) => onValueChange({ ...value, query })}
      />
      {filters.map((filter) => (
        <div key={filter.id} style={{ width: 170, flexShrink: 0 }}>
          <Select
            testId={`${testId}-${filter.id}`}
            disabled={disabled}
            value={value.values[filter.id] ?? ""}
            options={[{ value: "", label: filter.label }, ...filter.options]}
            onValueChange={(next) =>
              onValueChange({
                ...value,
                values: { ...value.values, [filter.id]: next },
              })
            }
          />
        </div>
      ))}
      <Button
        testId={`${testId}-clear`}
        disabled={
          disabled ||
          (!value.query && !Object.values(value.values).some(Boolean))
        }
        size="sm"
        variant="ghost"
        onPress={() => onValueChange({ query: "", values: {} })}
      >
        Clear
      </Button>
    </Row>
  );
}
