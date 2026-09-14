# 应用注入的宿主适配接口（0.18.0）

入口：`@mirai/gpuix-kit/host-adapter`，也由 `/platform` 和包根导出。createHostAdapter 接受 HostPorts，捕获绑定函数和只读 capabilities；不接入 DOM、原生私有 API、文件系统或数据库。实现由消费应用在基础设施/组合入口提供。

## 端口

| HostPorts 属性 | 参数 | 实现返回值 |
| --- | --- | --- |
| readClipboardText | 无 | string |
| writeClipboardText | text: string | void |
| openFiles | OpenFileRequest { multiple?, filters? } | readonly string[] 或 null 取消 |
| saveFile | SaveFileRequest { suggestedName, filters? } | string 文件引用或 null 取消 |
| readPreference | key: string | string 或 null 不存在 |
| writePreference | key: string、value: string | void |

以上返回值均可为 Promise。文件引用是应用定义的字符串，例如其有权访问的路径或 URI；UIKit 不打开、读写或证明文件存在。saveFile 表示选择保存位置，不负责写入内容。preferences 是普通 UI 偏好字符串接口，不是凭据存储。

```ts
import { createHostAdapter } from "@mirai/gpuix-kit/host-adapter";

// 演示内存端口；生产应用换成自己的偏好实现。
const values = new Map<string, string>();
const host = createHostAdapter({
  readPreference: key => values.get(key) ?? null,
  writePreference: (key, value) => { values.set(key, value); },
});
const saved = await host.writePreference("table.density", "compact");
if (!saved.ok) console.error(saved.reason);
const files = await host.openFiles();
// 未注入 openFiles：files 是 { ok: false, reason: "unsupported", ... }。
```

组件/VM 接收所需端口或应用命令，不自行获取系统单例。能力声明仅表示函数已注入，不能证明 OS 授权或服务健康。ports 创建后再改方法不会改变现有适配器；需要替换能力时创建新适配器。

## 结果和边界

所有适配器方法返回 Promise<HostResult<T>>：

- ok: true / value：实现返回合法结果；写入的 value 为 undefined。
- unsupported：未注入该端口。
- invalid：请求不符合约束，未调用实现。
- cancelled：文件对话框返回 null；读取不存在的偏好则是成功的 null。
- failed：实现抛出、拒绝或返回不合法结果。返回通用文本，不泄漏异常正文。

文本和偏好值最多 1,048,576 个 UTF-16 code units；偏好 key 非空且 ≤128。文件名非空 ≤255，不含路径分隔符或控制字符。过滤器最多 12 组，label 非空 ≤100，每组 1–20 个扩展名，每个为 1–16 位字母或数字（例如 txt，不是 *.txt）。单选最多一个文件，多选最多 100；引用长度 1–8192。请求过滤器与返回数组复制隔离；原请求的单/多选约束不会被端口修改请求所放宽。

输入为公开 TypeScript 契约，不是通用反序列化器。应用负责校验未知 JSON、偏好 schema、权限、实际取消、并发与陈旧响应、文件内容和生命周期；不要把 secret 注入示例内存偏好。

## 与现有窗口适配器的关系

createWindowAdapter(renderer) 是单独的同步窗口接口，映射可用的 getWindowSize、setWindowTitle、activateWindow。其 filePanels、clipboard、systemMenus、screenReaderSemantics 仍为 false；新增可注入端口不会把这些原生映射改成已实现。HostResult 与 PlatformResult 各自保留既有失败类型。

验证覆盖注入/未注入、绑定快照、同步/异步失败、输入范围、取消与缺值、克隆、错误输出和单选约束。独立 .tgz 消费者另验证端口导出、内存读写及 unsupported。没有真实剪贴板、文件对话框或偏好持久化的成功声明。
