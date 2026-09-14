import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  return (
    <UI.CreditCard
      testId="example"
      holder="Alex Chen"
      last4="4242"
      expiry="12/29"
      brand="Card"
    />
  );
}
