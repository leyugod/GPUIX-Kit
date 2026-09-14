import { useState } from "react";
import {
  UIKitProvider,
  AppShell,
  Stack,
  Text,
  Input,
  Button,
  SegmentedControl,
  type ThemeMode,
} from "@mirai/gpuix-kit";
// 示例只持有界面状态；存储与业务服务由应用接入。
export function App() {
  const [mode, setMode] = useState<ThemeMode>("light"),
    [name, setName] = useState("World"),
    [count, setCount] = useState(0);
  return (
    <UIKitProvider mode={mode}>
      <AppShell>
        <Stack gap={20} style={{ padding: 32 }}>
          <Text size={28} weight={700}>
            Hello, GPUIX Kit
          </Text>
          <SegmentedControl
            testId="starter-theme"
            value={mode}
            onValueChange={(v) => setMode(v as ThemeMode)}
            options={[
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
            ]}
          />
          <Input
            testId="starter-name"
            value={name}
            onValueChange={setName}
            placeholder="Your name"
          />
          <Text testId="starter-greeting">Hello, {name}</Text>
          <Button
            testId="starter-action"
            variant="primary"
            onPress={() => setCount((c) => c + 1)}
          >
            Clicked {count} times
          </Button>
        </Stack>
      </AppShell>
    </UIKitProvider>
  );
}
