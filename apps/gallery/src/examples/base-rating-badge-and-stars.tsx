import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  const [value, setValue] = useState(3);
  return (
    <UI.Stack>
      <UI.RatingStars testId="example" value={value} onValueChange={setValue} />
      <UI.RatingBadge testId="example-ratingbadge" value={value} count={128} />
    </UI.Stack>
  );
}
