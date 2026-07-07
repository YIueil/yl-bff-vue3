# 原生滚动条交互优化计划

> 状态：计划中
>
> 本文档遵循 `AGENTS.md` 的“计划先行”约束。计划阶段只新增本文并更新
> `TODO.md` 链接，不修改运行时代码。

## 1. 目标与范围

优化项目当前全局原生滚动条样式，使默认状态更轻量，交互状态更清晰，并继续保持无额外运行时依赖。

本次范围：

- 调整 `src/assets/main.css` 中的全局 `::-webkit-scrollbar` 样式。
- 将默认滚动条宽度和高度从当前 `12px` 缩窄。
- 优化滚动条滑块、轨道和 hover 视觉反馈。
- 保持现有文档布局、Modal 内容区、代码块等滚动容器的滚动能力不变。

非目标：

- 不引入 `overlayscrollbars` 等自定义滚动条库。
- 不封装新的滚动容器组件。
- 不修改路由、布局结构、Modal 逻辑或文档内容。
- 不追求“滑动中真实改变滚动条占位宽度”，因为原生 CSS 对滚动状态和滚动条尺寸动画支持有限。

## 2. 现状问题

当前 `src/assets/main.css` 使用全局 WebKit 滚动条伪元素：

- `::-webkit-scrollbar` 统一设置为 `12px` 宽高。
- 轨道为 `#f1f1f1`，滑块为 `#c1c1c1`，hover 后为 `#a8a8a8`。
- 样式主要影响 Chrome、Edge、Safari 等 WebKit/Blink 浏览器。
- Firefox 没有对应的 `scrollbar-width` 和 `scrollbar-color` 设置，基本使用浏览器默认样式。

存在的问题：

- 默认 `12px` 在文档侧栏、正文和 Modal 内容区中视觉存在感较强。
- hover 只改变颜色，没有明显的交互层级。
- 滑块边框和 `background-clip` 已具备“内缩”效果，但默认宽度仍偏厚。
- 全局规则没有兼顾 Firefox 的细滚动条能力。

## 3. 推荐方案

采用原生 CSS 方案，不增加依赖：

- 默认滚动条宽高调整为 `8px`。
- 滑块使用更轻的半透明深色，例如 `rgba(15, 23, 42, 0.28)`。
- 轨道默认保持透明或极浅色，减少页面中的灰色带状视觉。
- `::-webkit-scrollbar-thumb:hover` 提高滑块不透明度，并减小透明边框宽度，让滑块视觉上接近当前
  `12px` 风格的可点击面积。
- `::-webkit-scrollbar-thumb:active` 进一步加深，用于拖拽滑块时的反馈。
- 为 Firefox 增加 `scrollbar-width: thin` 和 `scrollbar-color`，保证基本方向一致。

示意规则：

```css
* {
  scrollbar-width: thin;
  scrollbar-color: rgba(15, 23, 42, 0.32) transparent;
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-thumb {
  background: rgba(15, 23, 42, 0.28);
  border: 2px solid transparent;
  border-radius: 999px;
  background-clip: content-box;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(15, 23, 42, 0.42);
  border-width: 1px;
}

::-webkit-scrollbar-thumb:active {
  background: rgba(15, 23, 42, 0.56);
}
```

说明：

- 原生 WebKit 滚动条的整体宽度通常由 `::-webkit-scrollbar` 决定，不适合依赖 hover 动态改变
  `width` 和 `height`。
- 通过默认 `8px`、hover 缩小透明边框的方式，可以在不改变布局占位的情况下让滑块视觉上变粗。
- `:active` 能覆盖拖拽滑块时的视觉反馈，但不能覆盖所有滚轮滚动状态。

## 4. 接口兼容性

- 不改变任何 TypeScript 类型、组件 props、事件、路由或公共 API。
- 不改变现有滚动容器的 `overflow`、`scrollbar-gutter` 和布局结构。
- WebKit/Blink 浏览器的滚动条视觉会变化。
- Firefox 将从默认滚动条变为 `thin` 风格，属于视觉兼容变化。
- 不影响无滚动内容区域。

## 5. 风险与控制

- **浏览器差异**：Firefox 不支持 WebKit 伪元素。通过标准 `scrollbar-width` 和 `scrollbar-color`
  提供基础一致性。
- **可点击面积变小**：默认宽度缩窄可能降低鼠标拖动滑块的易用性。保留 `8px` 而不是更极端的
  `4px` 或 `6px`，hover/active 提高视觉强度。
- **全局影响面较大**：规则位于全局样式，会影响文档站、Modal、代码块和所有后续页面。实现后需
  检查主要滚动场景。
- **对比度不足**：半透明滑块在浅色背景上必须仍清晰可见。验收时检查文档正文、侧栏和 Modal。
- **旧浏览器支持**：不为旧版 IE 或非现代浏览器提供额外兼容。

## 6. 验收与验证

自动校验：

- `pnpm run type-check`
- `pnpm run build-only`

手工验收：

- Chrome/Edge 中默认滚动条比当前更细，hover 后滑块视觉更明显。
- 拖动滚动条滑块时 `:active` 状态可见。
- `/components/icon`、`/components/modal`、`/components/echarts` 的长内容滚动正常。
- 文档左侧导航、正文滚动容器和右侧目录滚动不出现布局抖动。
- Modal 内容区滚动正常，滚动条不遮挡 footer 或 header。
- Firefox 中滚动条使用 thin 风格且颜色与整体风格接近。

## 7. 预计修改文件

- 修改：`src/assets/main.css`
- 实现完成后修改：`TODO.md`（验收全部通过后勾选对应条目）

若实现中发现需要修改布局容器、Modal 结构或引入依赖，应停止扩大范围并先向开发者说明。

## 8. 实施步骤

1. 开发者确认并在当前主分支提交本文及 `TODO.md` 链接。
2. 从最新目标分支创建 `.worktree/codex/native-scrollbar`，分支名为 `codex/native-scrollbar`。
3. 在 Worktree 中调整 `src/assets/main.css` 的滚动条全局规则。
4. 运行自动校验并完成主要滚动场景手工检查。
5. 验收通过后更新 `TODO.md` 状态，使用临时 Codex 身份创建 Conventional Commit。
6. 输出修改文件、核心逻辑、风险点和 Diff 摘要；不自动合并。

## 9. TODO 处理方式

本任务新增 `TODO.md` 低优先级“优化原生滚动条交互”条目。计划阶段只添加本文链接并保持未完成；
实现、自动校验和手工验收全部通过后，才将其标记为完成。
