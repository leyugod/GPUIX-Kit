# 快速开始 · v0.20.0

本库用于 Bun + GPUIX 原生 JSX。已验证环境为 macOS ARM64、Bun 1.4.2、GPUIX 0.7.0 和 React 19.2.4。无需 CSS、Tailwind 或浏览器运行时。

## 新建应用：下载模板

[最小窗口模板](https://github.com/leyugod/GPUIX-Kit/releases/download/v0.20.0/gpuix-kit-minimal-0.20.0.tar.gz) 适合从一个表单开始；
[Apple 风格侧栏模板](https://github.com/leyugod/GPUIX-Kit/releases/download/v0.20.0/gpuix-kit-sidebar-0.20.0.tar.gz) 提供来源侧栏、可调分栏、导航切换、设置页和深浅主题。

```sh
curl -fL https://github.com/leyugod/GPUIX-Kit/releases/download/v0.20.0/gpuix-kit-sidebar-0.20.0.tar.gz -o gpuix-kit-sidebar.tar.gz
tar -xzf gpuix-kit-sidebar.tar.gz
cd gpuix-kit-sidebar
bun install --frozen-lockfile
bun run dev
```

模板包含固定依赖的 lockfile 和 `vendor/gpuix-kit.tgz`，可放在任意目录使用。安装仍需获取 GPUIX、React 等依赖。将上面的 `sidebar` 改为 `minimal` 即可使用最小窗口模板。

修改 `src/app.tsx` 开始开发，`src/main.tsx` 是原生窗口入口。`bun run typecheck` 检查类型。模板源码也位于仓库 [templates/minimal](../templates/minimal/README.md) 和 [templates/sidebar](../templates/sidebar/README.md)。

## 已有 GPUIX 项目：安装一个包

```sh
bun add https://github.com/leyugod/GPUIX-Kit/releases/download/v0.20.0/mirai-gpuix-kit-0.20.0.tgz
bun add @gpuix/react@0.7.0 react@19.2.4
```

在应用的 `tsconfig.json` 中配置：

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "jsxImportSource": "@gpuix/react",
    "strict": true,
    "skipLibCheck": true,
    "noEmit": true
  }
}
```

从统一入口导入组件：

```tsx
import { useState } from "react";
import { render } from "@gpuix/react";
import { UIKitProvider, AppShell, Stack, Input, Button } from "@mirai/gpuix-kit";

function App() {
  const [name, setName] = useState("");
  return (
    <UIKitProvider mode="light">
      <AppShell>
        <Stack style={{ padding: 24 }}>
          <Input testId="name" value={name} onValueChange={setName} />
          <Button testId="clear" onPress={() => setName("")}>Clear</Button>
        </Stack>
      </AppShell>
    </UIKitProvider>
  );
}

render(<App />, { title: "My app", width: 1000, height: 720 });
```

包内的子目录用于维护代码；使用者只需从 `@mirai/gpuix-kit` 导入。`UIKitProvider` 提供主题，`AppShell` 提供应用布局和弹层宿主。输入值、导航和弹窗开关由应用持有；文件、存储、网络和系统能力通过回调或 [HostPorts](../packages/uikit/docs/host-adapter.md) 接入。

## 查找组件与复制示例

打开 [组件手册](components/index.md)：按基础、应用、营销三组查找；每页提供深浅截图、可直接使用的示例、真实 Props 和行为边界。

也可以下载或克隆仓库启动统一原生 Gallery：

```sh
git clone https://github.com/leyugod/GPUIX-Kit.git
cd GPUIX-Kit
bun install --frozen-lockfile
bun run dev
```

搜索组件分类或 API 名称，在 Preview / Code / Props 之间切换；macOS 下 Copy JSX 会复制当前完整示例。复制的 Example 放在应用的 `UIKitProvider` 和 `AppShell` 内。其他宿主可注入剪贴板适配；未提供时复制按钮禁用。

这是 85 个参考分类的使用手册。布局原语、模型、适配器和辅助导出见 [完整 API 索引](api-index.md)，深入的 Apple 侧栏组合见 [侧栏指南](../packages/uikit/docs/sidebars.md)。

## 版本与升级

安装来自固定 GitHub Release，npm 尚未发布。升级时显式安装新版本 URL；模板使用 vendor 依赖，升级时用 `bun add <新版本安装包 URL>` 更新并提交新的 lockfile。发布附件的 SHA-256 清单位于 [v0.20.0 Release](https://github.com/leyugod/GPUIX-Kit/releases/tag/v0.20.0)。

Windows/Linux、真实 IME 组合输入、屏幕阅读器和完整毛玻璃效果尚未验证或实现。视频解码、真实上传、登录与数据库服务由消费应用提供；组件演示只修改内存状态。
