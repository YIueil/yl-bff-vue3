# 组件文档布局职责拆分计划

> 状态：计划中
>
> 本文档遵循 `AGENTS.md` 的“计划先行”约束。计划阶段只新增本文并更新
> `TODO.md` 链接，不修改运行时代码。

## 1. 目标与范围

重构当前 `src/layouts/DocLayout.vue` 的职责边界，使它从“组件文档功能页容器”收敛为真正的文档型
布局壳，同时为 `views/` 建立更清晰的功能区目录结构。

本次目标：

- `src/layouts/DocLayout.vue` 只负责顶栏、左侧导航区、内容滚动区、右侧辅助区这类布局结构。
- 新增 `/components` 路由容器视图，承载组件文档站的导航数据、当前标题、移动端导航状态和目录
  收集逻辑。
- 将现有组件文档页面从扁平的 `src/views/components/` 迁移到明确的功能区目录。
- 尽量不增加组件数量，不拆 `DocHeader.vue`、`DocSiderNav.vue`、`DocToc.vue` 等小组件。

本次范围：

- 调整 `src/layouts/DocLayout.vue` 为 slot 型布局壳。
- 新增 `src/views/components-doc/ComponentsDocView.vue`。
- 移动当前 `src/views/components/*.vue` 到 `src/views/components-doc/pages/`。
- 将组件文档站专用配置和类型放到 `src/views/components-doc/` 下。
- 更新 `src/router/index.ts` 的导入路径。
- 更新受移动路径影响的局部导入。

非目标：

- 不重写页面视觉风格。
- 不改变 `/components/*` 路由路径、路由名称或页面文案。
- 不新增独立 Header、Sider、Toc 子组件。
- 不引入新的布局配置系统。
- 不修改 Modal、ECharts、Iconify 等功能实现。

## 2. 现状问题

当前 `src/layouts/DocLayout.vue` 同时承担三类职责：

- **布局结构**：Ant Design Vue `a-layout`、Header、Sider、Content、右侧目录、滚动边界和响应式样式。
- **组件文档业务**：写死 `navItems`，其中包含 `/components/icon`、`/components/modal` 等具体文档路由。
- **页面行为**：根据 `route.meta.title` 显示当前标题，收集页面内 `data-anchor`，处理移动端导航打开、
  关闭、Esc 关闭和 Anchor 点击。

这会导致：

- `layouts/` 目录里出现具体功能页逻辑，命名和职责不匹配。
- 后续新增其他布局或其他文档功能区时，很容易继续在 `DocLayout.vue` 里堆业务逻辑。
- `src/views/components/` 目前扁平存放所有文档页，目录名也容易与全局 `src/components/` 混淆。
- 如果过早拆出 Header/Sider/Toc 小组件，又会让当前规模下的组件数量膨胀，收益有限。

## 3. 推荐方案

采用“两层拆分”：

```text
src/layouts/
  DocLayout.vue

src/views/
  components-doc/
    ComponentsDocView.vue
    constants.ts
    types.ts
    pages/
      AboutDoc.vue
      ButtonDoc.vue
      DragResizeDoc.vue
      DraggableDoc.vue
      EchartsDoc.vue
      IconDoc.vue
      ModalDoc.vue
```

### 3.1 DocLayout 职责

`DocLayout.vue` 保留当前整体布局和大部分 scoped 样式，但删除组件文档专属数据与行为：

- 不再 import `useRoute`。
- 不再定义 `navItems`、`currentTitle`、`anchorItems`。
- 不再收集页面 `data-anchor`。
- 通过 props 接收布局必要状态，例如：
  - `navigationOpen`
  - `siderCollapsed`
  - `isMobile`
- 通过事件暴露布局交互，例如：
  - `toggle-navigation`
  - `close-mobile-navigation`
- 通过 slots 接收各区域内容：
  - `header`
  - `sider`
  - default content
  - `aside`

`DocLayout.vue` 仍负责：

- 顶层 `a-layout` 结构。
- Header、Sider、Content、Aside 的外层容器。
- 内容区滚动容器。
- 移动端遮罩的展示和关闭事件。
- 桌面/移动端响应式布局样式。
- `scrollbar-gutter` 等滚动边界样式。

为支持 Anchor 获取真实滚动容器，`DocLayout.vue` 应通过 `defineExpose()` 暴露内容滚动容器引用或
更明确的方法，例如：

```ts
defineExpose({
  getScrollContainer: () => scrollContainer.value
})
```

### 3.2 ComponentsDocView 职责

`ComponentsDocView.vue` 是 `/components` 路由的功能页面容器，负责组件文档站自己的逻辑：

- 持有 `navItems` 或从 `constants.ts` 导入。
- 根据 `route.meta.title` 计算当前标题。
- 持有 `anchorItems`。
- 监听路由变化后收集当前文档页的 `data-anchor`。
- 管理 `isMobile`、`desktopNavOpen`、`mobileNavOpen`、Esc 关闭等交互状态。
- 组合 `DocLayout` 的 `header`、`sider`、default、`aside` slots。
- 在 default slot 中渲染子路由 `RouterView`。

Header、Sider、Toc 的模板可以直接写在 `ComponentsDocView.vue` 中，不再拆组件。

### 3.3 components-doc 目录

建议将现有文档页迁移为：

```text
src/views/components-doc/pages/IconDoc.vue
src/views/components-doc/pages/ModalDoc.vue
src/views/components-doc/pages/ButtonDoc.vue
src/views/components-doc/pages/EchartsDoc.vue
src/views/components-doc/pages/DraggableDoc.vue
src/views/components-doc/pages/DragResizeDoc.vue
src/views/components-doc/pages/AboutDoc.vue
```

并新增：

```text
src/views/components-doc/constants.ts
src/views/components-doc/types.ts
```

`constants.ts` 存放 `navItems`，避免视图文件顶部塞入较长静态配置。

`types.ts` 存放 `NavItem`、`AnchorItem` 等组件文档站局部类型，避免把只属于文档站的类型放进全局
`src/types/`。

暂不移动 `src/components/IconUsageGuide.vue`。虽然它目前主要服务图标文档，但已有独立计划
`docs/icon-usage-guide-component.md`，本次结构重组避免扩大范围。若后续确认它只属于组件文档站，
可单独迁移到 `src/views/components-doc/components/`。

### 3.4 路由更新

`src/router/index.ts` 从：

```ts
import DocLayout from '@/layouts/DocLayout.vue'
```

调整为懒加载组件文档容器：

```ts
component: () => import('@/views/components-doc/ComponentsDocView.vue')
```

子页面路径同步更新到 `@/views/components-doc/pages/*.vue`。

保持不变：

- `/components`
- `/components/icon`
- `/components/modal`
- `/components/button`
- `/components/echarts`
- `/components/draggable`
- `/components/drag-resize`
- `/components/about`
- `name: 'doc-*'`
- `meta.title`

## 4. 接口兼容性

- URL 路径不变，已有页面链接继续可用。
- 路由名称不变。
- 文档页面中的 `data-anchor` 约定不变。
- 文档页面内部的相互跳转路径不变。
- `src/layouts/DocLayout.vue` 的内部实现和 props/slots 会变化，但它目前只被路由直接使用，没有
  对外公共 API；重构后由 `ComponentsDocView.vue` 使用。
- `src/views/components/*.vue` 文件移动会改变源码路径，但不改变最终路由访问方式。

## 5. 风险与控制

- **Anchor 收集失效**：`DocLayout` 转为布局壳后，滚动容器引用需要从布局暴露给
  `ComponentsDocView`。实现时重点验证目录生成、目录点击、高亮和 hash 更新。
- **响应式状态回归**：移动端导航状态从布局内逻辑移到页面容器后，需要保持菜单按钮、遮罩、Esc
  和路由切换关闭行为一致。
- **样式作用域变化**：Header/Sider/Toc 模板移到 `ComponentsDocView.vue` 后，相关 class 的
  scoped CSS 归属需要谨慎处理。优先让布局容器样式留在 `DocLayout.vue`，内容区域样式随模板移动。
- **路径移动遗漏**：路由、文档页内部导入、测试或说明文字可能引用旧路径。使用 `rg` 全量检查。
- **过度抽象**：本次只抽 slot 型布局，不做配置驱动布局系统，避免把简单需求复杂化。

## 6. 验收与验证

自动校验：

- `pnpm run type-check`
- `pnpm run lint`
- `pnpm run build-only`

手工验收：

- `/components` 仍重定向到 `/components/icon`。
- `/components/icon`、`/components/modal`、`/components/echarts` 能正常访问。
- 左侧组件导航路径、选中态、hover 和移动端点击关闭行为正常。
- Header 当前标题随子路由变化。
- 右侧目录能根据当前页面的 `data-anchor` 正确生成。
- 点击右侧目录能在内容滚动容器中定位章节，并更新 hash。
- 切换子路由后目录内容刷新，移动端导航关闭。
- 1440px、1024px、768px、375px 下布局无明显遮挡或横向溢出。

## 7. 预计修改文件

- 修改：`src/layouts/DocLayout.vue`
- 修改：`src/router/index.ts`
- 新增：`src/views/components-doc/ComponentsDocView.vue`
- 新增：`src/views/components-doc/constants.ts`
- 新增：`src/views/components-doc/types.ts`
- 移动：
  - `src/views/components/AboutDoc.vue` -> `src/views/components-doc/pages/AboutDoc.vue`
  - `src/views/components/ButtonDoc.vue` -> `src/views/components-doc/pages/ButtonDoc.vue`
  - `src/views/components/DragResizeDoc.vue` -> `src/views/components-doc/pages/DragResizeDoc.vue`
  - `src/views/components/DraggableDoc.vue` -> `src/views/components-doc/pages/DraggableDoc.vue`
  - `src/views/components/EchartsDoc.vue` -> `src/views/components-doc/pages/EchartsDoc.vue`
  - `src/views/components/IconDoc.vue` -> `src/views/components-doc/pages/IconDoc.vue`
  - `src/views/components/ModalDoc.vue` -> `src/views/components-doc/pages/ModalDoc.vue`
- 实现完成后修改：`TODO.md`（验收全部通过后勾选对应条目）

若实现过程中发现必须移动 `src/components/IconUsageGuide.vue`、新增多个小组件或调整页面视觉，应先
停止扩大范围并向开发者说明。

## 8. 实施步骤

1. 开发者审核本文并在当前主分支提交本文及 `TODO.md` 链接。
2. 从最新目标分支创建 `.worktree/codex/component-doc-layout-refactor`，分支名为
   `codex/component-doc-layout-refactor`。
3. 创建 `src/views/components-doc/` 目录结构并移动文档页。
4. 新增 `constants.ts` 和 `types.ts`，迁移 `navItems` 和局部类型。
5. 将 `DocLayout.vue` 改为 slot 型布局壳。
6. 新增 `ComponentsDocView.vue`，承接当前组件文档页逻辑和区域模板。
7. 更新路由引用和所有旧路径引用。
8. 运行自动校验并完成手工验收。
9. 验收通过后更新 `TODO.md` 状态，使用临时 Codex 身份创建 Conventional Commit。
10. 输出修改文件、核心逻辑、风险点和 Diff 摘要；不自动合并。

## 9. TODO 处理方式

本任务新增 `TODO.md` 低优先级“拆分组件文档页和文档布局职责”条目。计划阶段只添加本文链接并保持
未完成；实现、自动校验和手工验收全部通过后，才将其标记为完成。
