# Studio：第三批组件目录

API 和接入约定见[可分发包内文档](../../packages/uikit/docs/studio.md)。运行 `bun run dev:studio`，在侧栏切换页面；所有动作只操作示例内存。

| 页面         | 组合                                            | 原生验证                                                     |
| ------------ | ----------------------------------------------- | ------------------------------------------------------------ |
| Dashboard    | DashboardLayout、MetricCard、分类图表、Timeline | 深浅切换、类别键盘、隐藏系列、活动动作与加载更多             |
| Charts       | 折线、面积、分组柱、正负堆叠柱、饼/环形         | 选择与图例、负值、扇区比例、各类型截图                       |
| Conversation | ConversationLayout、MessageList/Bubble/Composer | 引用、附件、流式停止、重试意图、历史加载、最新跟随、草稿保留 |
| Platform     | createWindowAdapter                             | 窗口尺寸与未映射能力显示；标题/激活真实效果未验证            |

测试命令：`test:studio`、`test:studio:narrow`、`test:studio:states`、`test:live:studio`。状态夹具额外覆盖空/加载/无效图表、空白与超限草稿、附件未就绪、重复提交、Promise 失败、卸载后完成。

SettingsLayout 已导出基础布局，但不把它计为经过完整应用验证的设置模板。饼图交互入口是图例/键盘，没有直接扇区命中；消息只渲染传入窗口，没有历史锚定/虚拟化。其余缺口持续记录在[覆盖矩阵](../component-coverage.md)。
