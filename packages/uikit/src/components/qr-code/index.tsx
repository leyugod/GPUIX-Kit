import { useMemo } from "react";
import { Text, Stack } from "../../base";
import { useTheme } from "../../core/theme";
import { bounded } from "../catalog-model";
import { qrMatrix, qrSvg } from "./model";
export { qrMatrix, qrSvg } from "./model";
export function QRCode({
  value,
  size = 180,
  level = "M",
  label,
  testId,
}: {
  value: string;
  size?: number;
  level?: "L" | "M" | "Q" | "H";
  label?: string;
  testId: string;
}) {
  const { colors: c } = useTheme(),
    result = useMemo(() => {
      try {
        const matrix = qrMatrix(value, level);
        return { source: qrSvg(matrix), modules: matrix.length + 8 };
      } catch {
        return { error: "QR content is empty or too large" };
      }
    }, [value, level]),
    n = Math.max(bounded(size, 96, 512), (result.modules ?? 0) * 2);
  return (
    <Stack testId={testId}>
      {result.error ? (
        <Text color={c.danger} testId={testId + "-error"}>
          {result.error}
        </Text>
      ) : (
        <div style={{ width: n, height: n, backgroundColor: "#FFFFFF" }}>
          <svg
            testId={testId + "-code"}
            source={result.source!}
            style={{
              width: n,
              height: n,
              color: "#000000",
              backgroundColor: "#FFFFFF",
            }}
          />
        </div>
      )}
      {label ? <Text size={12}>{label}</Text> : null}
    </Stack>
  );
}

export type QRCodeProps = Parameters<typeof QRCode>[0];
