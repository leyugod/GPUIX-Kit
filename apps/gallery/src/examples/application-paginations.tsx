import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  const [page, setPage] = useState(1);
  return (
    <UI.Pagination
      testId="example"
      page={page}
      pageSize={10}
      total={100}
      onPageChange={setPage}
    />
  );
}
