import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  const [value, setValue] = useState("");
  return (
    <UI.Stack>
      <UI.FileUploader
        testId="example"
        files={[
          { id: "brief", name: "Brief.pdf", status: "ready", detail: "24 KB" },
        ]}
        onChoose={() => {
          setValue("File selection requested");
        }}
      />
      <UI.Text>{value}</UI.Text>
    </UI.Stack>
  );
}
