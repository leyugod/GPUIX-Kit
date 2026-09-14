import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  const [open, setOpen] = useState(false);
  return (
    <UI.Stack>
      <UI.Button testId="example-open" onPress={() => setOpen(true)}>
        Open dialog
      </UI.Button>
      <UI.Dialog
        testId="example"
        open={open}
        onOpenChange={setOpen}
        title="Project details"
        footer={
          <UI.Button testId="example-close" onPress={() => setOpen(false)}>
            Done
          </UI.Button>
        }
      >
        <UI.Text>Reusable native modal content.</UI.Text>
      </UI.Dialog>
    </UI.Stack>
  );
}
