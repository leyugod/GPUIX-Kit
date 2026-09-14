# v0.14 对话框与面板

新增 AlertDialog、ConfirmDialog、PromptDialog、Sheet、Drawer、ProgressDialog。Dialog 与 Popover 共享 renderer 内的层注册，处理顶层键盘、嵌套恢复和分支卸载；拖动捕获层跟随所属面板。

运行 `bun run dev:modals`，查看六种组合、深浅主题、颜色选择器和父 Sheet/子 Drawer。完整属性、异步身份、受控任务及宿主边界见[包内 API](../../packages/uikit/docs/modals.md)。

验收命令：check、test:modals、test:modals:narrow、test:modals:states、test:live:modals、test:package。相关旧组件额外进行日期/颜色/标签弹层、滑块、分栏和数据表格原生回归。截图在 artifacts/modals-\*.png。

窗口内 Sheet/Drawer 不等于系统窗口；托管弹层栈不覆盖任意宿主控件。后续 [v0.15 Apple 风格侧栏](../plans/apple-sidebar.md) 仍为规划。
