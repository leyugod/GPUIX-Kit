# Choices：三态选择与标签

运行 `bun run dev:choices`。具体公开 API 和宿主边界见[包内文档](../../packages/uikit/docs/choices.md)。

| 页面            | 内容                                         | 主要验证                                            |
| --------------- | -------------------------------------------- | --------------------------------------------------- |
| Checkboxes      | 三态 Checkbox、CheckboxGroup、只读/禁用/空态 | 中间态激活、范围全选、保留禁用与范围外 ID、主键限定 |
| Tags and tokens | Tag、TokenField、锁定/禁用标签               | 整批校验、去重、键盘导航和移除、草稿保留、深浅主题  |

测试命令：`test:choices`、`test:choices:narrow`、`test:choices:states`、`test:live:choices`。截图位于 artifacts/choices-\*.png。

编辑器使用 Shift+Tab 进入标签；原生 Backspace/左右键消费和 Tab 插入兼容处理均已记录。组件仍缺建议、内联改名、拖放、多选范围、虚拟化与 AX，不作为完整组件族验收。
