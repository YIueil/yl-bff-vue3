# AGENTS.md

本文件用于帮助在本仓库中工作的 AI Agent 快速建立准确上下文。修改代码前应先阅读本文件，并以实际代码和 `package.json` 为最终依据。

## 交互规范
角色：高级软件工程助手，协助代码开发，严格遵守以下Git规范。
Git工作流：
    计划先行
    凡涉及运行时代码、公共 API、依赖或构建行为的开发任务，正式实现前必须先在 `docs/` 目录新增计划任务文档。文档至少说明目标与范围、现状问题、推荐方案、接口兼容性、风险、验收与验证方式，以及相关 TODO 的处理方式。计划阶段只允许编写文档和更新对应 TODO 链接，不得修改运行时代码。
    计划文档允许直接在 main、master 或当前活跃主分支的工作区中创建，无需为计划阶段单独创建 Worktree 或分支。AI 完成计划文档后必须停止并汇报 Diff，禁止在主分支执行 `git add` 或 `git commit`；主分支中的任何修改都必须由开发者自行确认并亲自提交。
    只有在开发者确认并提交计划文档后，AI 才能从最新目标分支创建实现 Worktree 和 `codex/` 前缀分支，并开始修改运行时代码。
    环境隔离
    除上述计划文档阶段外，禁止直接修改main、master或活跃分支。实现阶段必须先创建Worktree隔离开发。路径为 .worktree/分支名，前缀为 codex/。示例：git worktree add .worktree/feat-login -b codex/feat-login。所有后续实现操作均在此目录内执行。
    身份配置
    进入Worktree后设置独立Git身份。执行：git config user.name "Codex" 及 git config user.email "codex@openai.com"。
    提交规范
    遵循Conventional Commits规范（如feat:、fix:等）。
    完成与汇报
    完成后禁止自动合并。需生成报告，包含：修改文件、核心逻辑、风险点、Diff摘要。收到用户明确批准指令后，再执行合并并清理Worktree和分支。
异常处理：
若提示分支已存在，询问用户是否覆盖或删除。若遇Git冲突，必须请求人工协助，严禁擅自解决。

## 项目定位

- 项目名为 `yl-bff-vue3`，目前是一个 Vue 3 前端框架原型和功能演示集合，不是已经完成的业务系统。
- 已演示的能力包括：Iconify 在线/离线/自定义图标、列表拖拽、元素拖拽缩放、可编程 Modal、基础按钮样式和按需引入的 ECharts。
- OAuth2、路由权限、动态菜单/按钮权限仍只是 README 中的待办，仓库内没有对应实现。
- 页面以演示和验证集成方式为主，部分代码带有实验性质。不要默认现有实现已经达到生产质量。

## 技术栈与环境

- Node.js：README 指定 `20.14.5`。
- 包管理器：使用 pnpm；`package.json` 固定为 `pnpm@10.13.1`。不要生成 npm 或 yarn 锁文件。
- Vue `3.4.x`、TypeScript `5.4.x`、Vite `6.3.x`。
- 路由和状态：Vue Router 4、Pinia 2。
- 工具库：VueUse、Iconify、ECharts、`vue-draggable-plus`、`vue3-draggable-resizable`。
- 代码风格：2 空格、无分号、单引号、最大行宽 100、ES5 尾逗号关闭，详见 `.prettierrc.json`。
- 路径别名：`@/*` 指向 `src/*`，Vite 和 TypeScript 中均已配置。

## 常用命令

```bash
pnpm install
pnpm run dev
pnpm run build
pnpm run build-only
pnpm run type-check
pnpm run lint
pnpm run lint:fix
pnpm run format
pnpm run preview
```

- `pnpm run dev` 在固定端口 `3000` 启动；端口被占用时会直接失败。
- `pnpm run prod` 是以 production mode 启动 Vite 开发服务器，不是生产构建。
- `pnpm run build` 并行执行 `vue-tsc --build --force` 和 `vite build`。
- `pnpm run build-only` 只验证打包，不能替代类型检查。
- `pnpm run format` 只格式化 `src/`，不会处理仓库根目录文档和配置。
- 仓库目前没有 Vitest、Cypress 或 Playwright 测试，也没有 `test` 脚本。

### 当前校验基线

以下是 2026-07-05 基于当前代码确认的校验基线：

- `pnpm run type-check` 可以成功完成。
- `pnpm run lint` 使用 ESLint 9 flat config，可以成功完成且默认不修改文件；需要自动修复时显式运行 `pnpm run lint:fix`。
- `pnpm run build-only` 可以成功完成，但 ECharts 页面产物约 562 kB，会触发 Vite 的 500 kB chunk size 警告。
- 修改相关区域时应尽量修复对应问题；若任务范围不包含工具链修复，最终报告中要明确区分既有失败和新失败。

## 目录职责

```text
src/
├── assets/                 # 全局 CSS、SVG 源文件和生成后的 Iconify JSON
├── components/Modal/       # YlModal 展示组件
├── core/                   # ECharts 按需注册、自定义 SVG 注册等应用级集成
├── router/                 # 路由表
├── scripts/                # SVG 转 Iconify JSON 的源码脚本
├── stores/                 # Pinia stores；当前只有脚手架 counter 示例
├── types/                  # Modal 等跨文件类型和 Vue 类型扩展
├── utils/                  # ModalManager 等非 UI 管理逻辑
├── views/                  # 各能力的演示页面
├── App.vue                 # 顶层演示导航和 RouterView
└── main.ts                 # 应用创建、插件注册和全局样式入口
```

- `auto-imports.d.ts` 和 `components.d.ts` 由 unplugin 自动生成，不要手工维护；运行 Vite 后应检查是否产生预期变更。
- `env.d.ts` 目前还手工声明了全局 `Vue3DraggableResizable` 组件类型。
- `dist/`、`node_modules/` 和 `*.tsbuildinfo` 是生成物，不应提交。

## 应用启动与路由

`src/main.ts` 的装配顺序是：

1. 引入 `src/assets/main.css`。
2. 创建 Vue app 和 Pinia。
3. 安装 Router。
4. 全局安装 `vue3-draggable-resizable`。
5. 安装自定义 `ModalPlugin`。
6. 挂载到 `#app`。

应用入口还通过 `@/core/svg-import` 的副作用注册两套自定义 Iconify JSON。删除这条导入会导致 `custom:*` 图标不可用。

路由位于 `src/router/index.ts`：

- `/` 首页是同步导入。
- `/about`、`/icon`、`/drag`、`/drag-resize`、`/modal`、`/button`、`/echarts` 均为懒加载。
- 新增演示页时，同时更新路由和 `App.vue` 中的导航。
- history 使用 `createWebHistory(import.meta.env.BASE_URL)`；部署到子路径时由 Vite 的 `base` 决定。

## 自动导入

`vite.config.ts` 配置了两个不同的自动导入机制：

- `unplugin-auto-import` 自动提供 Vue 和 Vue Router API，例如 `ref`、`computed`、`onMounted`、`inject`、`h`。在 Vue SFC 和 TS 文件中可沿用现有风格，不必为了这些 API 重复添加 import。
- `unplugin-vue-components` 自动发现本地组件，并配合 `IconsResolver` 按需生成 Iconify 图标组件。

显式导入也被允许；同一文件内保持一致即可。第三方普通组件不会自动可用，除非它被全局安装或显式导入。

## Modal 架构

Modal 分为两层：

- `src/components/Modal/YlModal.vue` 负责遮罩、Teleport、Transition、插槽、拖拽缩放、最小化和最大化。
- `src/utils/modal-manager.ts` 是单例管理器，负责动态创建独立 Vue app，并用 Map 按 `key` 管理实例。

### 使用方式

- 声明式：直接使用自动注册的 `<YlModal>`，通过 `header`、`body`、`footer` 插槽传内容。
- 组合式：导入 `Modal`，或使用 `inject<ModalManagerInterface>('modal')`。
- 选项式：通过 `this.$modal` 调用；`ModalViewOptions.vue` 已使用 `component` 和
  `componentProps` 传递内容及其 props。

`Modal.open()` 的有效字段以 `src/types/components/modal.d.ts` 中的 `ModalOptions` 为准：

- `title`：按文本渲染的字符串、VNode，或 `Modal.trustedHtml()` 返回的可信 HTML。
- `component`：按文本渲染的字符串、组件、VNode、返回 VNode 的函数，或 `Modal.trustedHtml()` 返回的可信 HTML。
- `componentProps`：传给内容组件的 props。
- `footer`：组件、VNode，或按钮数组。
- `on`：以 footer 按钮的 `eventName` 为键的回调 Map；自定义事件统一通过
  `eventName` 和 `on` 配对处理。
- 窗口选项包括 `showMask`、`showHeader`、`showFooter`、`clickMaskClose`、`isTeleport`、`parent`、`resizable`、`draggable`。

`body` 和 `onClose` 不属于 `ModalOptions`，当前管理器不会消费它们。默认关闭事件应使用
footer 的 `eventName: 'close'`，或在 `on` 回调中调用 `ModalInstance.close()`。

### 实现约束

- 相同 `key` 再次调用 `open()` 不会重建内容，只会将已有窗口设为显示。需要刷新 props 时先关闭再打开，或扩展管理器的更新能力。
- 未提供 `key` 时使用 `Math.random()`，需要稳定引用、去重或恢复窗口时必须显式提供 key。
- 动态 Modal 是通过 `createApp()` 创建的独立应用，不会自动继承主应用的 Router、Pinia、provide 或全局插件。内容组件依赖这些能力时，需要在 Modal app 中显式安装/传递，或重构为主应用内渲染。
- 管理器只显式给动态 app 安装了 `Vue3DraggableResizable`。
- `hide()` 只切换 `v-show`，保留组件状态；`close()` 会 unmount 并从 Map 删除。
- `YlModal` 中的部分本地状态只在初始化时读取 props，运行时修改对应 prop 不一定同步。现有声明式示例通过修改 `key` 强制重建。
- 默认尺寸为 `900 x 560`，移动端和窗口尺寸变化尚未完善。
- 字符串标题和字符串内容默认按文本渲染。仅可信静态内容可使用 `Modal.trustedHtml()` 显式按 HTML 渲染；该方法不执行清洗，不得传入未经可靠清洗的用户输入。

修改 Modal 时至少手工覆盖：声明式打开/关闭、API 打开、重复 key、隐藏后重显、关闭全部、遮罩点击、footer 自定义事件、最小化/恢复、最大化/恢复和内容组件 expose 调用。

## 图标流程

项目包含三种图标方式：

- 在线 Iconify：显式导入 `Icon`，例如 `<Icon icon="mdi:home" />`；缺少本地数据时可能发起网络请求。
- 离线按需组件：例如 `<i-mdi-home />`，由 `unplugin-icons` 和 `IconsResolver` 在构建期处理。
- 自定义图标：例如 `<Icon icon="custom:box" />`，来自 `src/assets/json/*.json`。

自定义 SVG 的数据流：

1. 单色源文件放入 `src/assets/images/svg/single/`；生成时颜色会转换为 `currentColor`。
2. 多色源文件放入 `src/assets/images/svg/multi/`；生成时保留颜色。
3. `src/scripts/svg-json-generate.ts` 使用 `@iconify/tools` 清理并导出 JSON。
4. `src/core/svg-import.ts` 在应用启动时调用 `addCollection()`。

注意：当前生成脚本没有对应的 package script，且输入输出路径相对于进程工作目录，TypeScript 运行器也未在依赖中声明。不要假定 `node src/scripts/svg-json-generate.ts` 在 Node 20 下可用。调整该流程时，应先增加明确、可复现的 pnpm 脚本，并让路径基于脚本文件位置解析；生成后同时检查两个 JSON 文件和图标页面。

## ECharts

- 所有按需模块集中在 `src/core/echarts-import.ts` 注册，不要在页面中改为导入完整 `echarts` 包。
- 当前只组合了 Bar、Line、Title、Tooltip、Grid、Dataset 等类型和 Canvas renderer。
- 添加新的图表或组件时，必须同时导入实现、加入 `echarts.use()`，并将对应 Option 类型加入 `ECOption`。
- `EchartsView.vue` 只是最小示例。新增生产代码应在 DOM mounted 后初始化，在卸载时 `dispose()`，并处理容器 resize；不要继续依赖无延时参数的 `setTimeout()`。

## 拖拽与样式

- 列表排序使用 `vue-draggable-plus`，参见 `DraggableView.vue`。
- 单元素拖拽缩放使用全局 `Vue3DraggableResizable`，参见 `DragResizeView.vue`。
- Modal 只开启右下角 `br` resize handle，并通过 scoped CSS 的 `:deep()` 定制第三方组件内部样式。
- 全局 CSS 入口是 `src/assets/main.css`，目前引入按钮样式并定义 WebKit 滚动条。
- 通用按钮类采用 `button` 基类加 `button-primary`、`button-danger`、`button-outline`、`button-ghost`、`button-large`、`button-small` 修饰类。
- 页面或组件样式默认使用 `<style scoped>`；真正跨页面复用的规则才放入 `assets/css/` 并从 `main.css` 引入。

## 环境变量

- `.env.development` 和 `.env.production` 均定义 `VITE_API_BASE_URL`。
- 只有 `VITE_` 前缀变量会暴露给客户端，客户端变量不能存放密钥。
- 当前 `App.vue` 直接展示该变量，主要用于验证 mode 切换。
- 新增环境变量时，在 `env.d.ts` 为 `ImportMetaEnv` 补充类型，避免散落的类型断言。

## 修改原则

- 优先保持 Vue 3 Composition API 和 `<script setup lang="ts">`；只有在维护选项式 API 示例时继续使用 `defineComponent`。
- 新增公共 API 时先补完整类型，避免扩大 `any`。Modal 内容组件需要从外部调用方法时，用 `defineExpose()` 并为 `ModalInstance<T>` 提供明确接口。
- 不要手改自动生成声明、锁文件内容或构建产物；依赖变更应通过 pnpm 完成。
- 不要无关地重写演示页。修改集成能力时，应保留或扩展示例，使功能能从导航中直接验证。
- 执行格式化或带 `--fix` 的 lint 前先检查工作区，避免覆盖用户尚未提交的改动。
- 完成代码任务后至少运行受影响范围的类型检查和 `pnpm run build-only`。若全量命令仍受基线问题阻塞，要报告具体文件和错误，不要只写“构建失败”。
