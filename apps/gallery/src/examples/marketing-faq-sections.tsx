import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  const [expanded, setExpanded] = useState<string[]>(["native"]);
  return (
    <UI.FAQSection
      testId="example"
      title="Frequently asked questions"
      items={[
        {
          id: "native",
          question: "Is this native?",
          answer: "Yes. Components use GPUIX native elements.",
        },
        {
          id: "theme",
          question: "Does it support dark mode?",
          answer: "Use UIKitProvider with mode set to dark.",
        },
      ]}
      expandedIds={expanded}
      onExpandedChange={setExpanded}
    />
  );
}
