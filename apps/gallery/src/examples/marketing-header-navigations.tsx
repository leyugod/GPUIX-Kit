import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  const [value, setValue] = useState("product");
  return (
    <UI.MarketingHeaderNavigation
      testId="example"
      brand={<UI.Text weight={600}>Your product</UI.Text>}
      items={[
        { id: "product", label: "Product" },
        { id: "pricing", label: "Pricing" },
      ]}
      value={value}
      onValueChange={setValue}
    />
  );
}
