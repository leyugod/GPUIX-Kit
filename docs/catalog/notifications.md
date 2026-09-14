# v0.12 通知与任务反馈

新增 NoticeCard、UndoToast、ToastViewport、ProgressRing、TaskProgress、TaskList、TaskSummary，另提供 useNotificationQueue/createNotificationQueue 和纯规则入口。沿用主题 tokens，深浅主题实时切换。

完整 API、计时契约和应用边界见 [包内文档](../../packages/uikit/docs/notifications.md)。

运行 bun run dev:notifications。通知示例提供候补队列、限时/持久通知、全局暂停、清空与受控撤销；任务示例用本地状态演示暂停/恢复/取消/重试和分页。没有真实网络任务或数据库撤销。

验收命令：bun run check、test:notifications、test:notifications:narrow、test:notifications:states、test:live:notifications、test:ui、test:package。截图在 artifacts/notifications-*.png。本批仅扩展反馈家族，系统通知、动画和完整桌面 framework 仍未完成。
