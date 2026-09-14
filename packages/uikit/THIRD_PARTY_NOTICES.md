# 来源与许可证

- Darwin UI: https://github.com/surajmandalcell/darwin-ui
  固定快照 `17777097f271f779cca380da851ee8f45f559665`，读取于 2026-09-13。
  参考 `src/styles/darwin-ui.css` 的深浅语义色、半径和阴影层次，以及 `src/components/button.tsx` 的变体与尺寸组织。
  UIKit 将这些设计适配为 GPUIX TypeScript tokens 和原生控件；未包含网页 CSS、Framer Motion 或 DOM 实现。
  原 MIT 许可证保存在 `licenses/Darwin-UI.txt`。部分文字色与主按钮蓝色调整以提升对比度。
- Untitled UI: https://www.untitledui.com/react/docs/introduction
  参考 foundations / base / application UI 的分类与可组合接口原则，以及公开 sidebar-navigations 页面中的 simple/slim/dual-tier 结构。未复制 PRO 组件或私有资源，也未引入 React Aria 的 DOM 实现。
- GPUIX: https://gpuix.dev/ ，https://github.com/remorses/gpuix
  依赖官方发布的 `@gpuix/react` 和 `@gpuix/native` 0.7.0；使用其公开 JSX、Select、Tooltip 和原生渲染/焦点能力。
  GPUIX 本身采用 Apache-2.0，其许可证随上游依赖分发。

本项目与上述项目没有官方隶属或背书关系。

- qrcode-generator 2.0.4: https://github.com/kazuhikoarase/qrcode-generator
  MIT; pure QR encoding dependency. The upstream license is copied to licenses/qrcode-generator.txt. No browser renderer is used.
