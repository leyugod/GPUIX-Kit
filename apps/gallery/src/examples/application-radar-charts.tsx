import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  const [hidden, setHidden] = useState<string[]>([]);
  return (
    <UI.RadarChart
      testId="example"
      axes={[
        { id: "quality", label: "Quality", max: 100 },
        { id: "speed", label: "Speed", max: 100 },
        { id: "coverage", label: "Coverage", max: 100 },
      ]}
      series={[{ id: "current", label: "Current", values: [80, 60, 90] }]}
      hiddenIds={hidden}
      onHiddenChange={setHidden}
    />
  );
}
