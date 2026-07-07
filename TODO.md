# TODO

本清单基于当前代码状态整理。优先处理构建阻塞、运行时缺陷和安全风险，再补齐工程能力，最后推进体验与规划性功能。

## 高优先级

- [X] 修复 Vue 全局属性 `$modal` 的类型扩展，使 `ModalViewOptions.vue` 能正确识别 `this.$modal`，并确保 `pnpm run type-check` 和 `pnpm run build` 通过。
- [X] 迁移 ESLint 9 配置或锁定兼容版本，移除失效的 `--ignore-path` 参数，确保 `pnpm run lint` 可以执行且不会产生非预期批量修改。
- [X] 修复 API Modal 的关闭链路：遮罩点击关闭。
- [X] 消除 Modal 字符串标题和内容直接使用 `innerHTML` 的 XSS 风险；默认按文本渲染，仅为可信内容提供显式 HTML API 或可靠的清洗流程。
- [X] 修正 `ModalViewOptions.vue` 与 `ModalOptions` 的接口偏差；选项式示例已使用 `component` 和 `componentProps`，不再使用未声明的 `body`、`onClose`。
- [X] 完善动态 Modal 的挂载机制，保证多个窗口拥有独立、明确的挂载节点，并在关闭和 `closeAll()` 后完整卸载 app、DOM 与事件资源。参见[动态 Modal 挂载机制优化](docs/modal-mounting-optimization.md)。
- [X] 修复 ECharts 生命周期管理：在 mounted 后初始化，在 unmounted 前 `dispose()`，响应容器尺寸变化，移除当前不可靠的 `setTimeout()` 初始化。参见 [ECharts 生命周期管理修复计划](docs/echarts-lifecycle-management.md)。

## 中优先级

- [X] 引入单元/组件测试框架，优先覆盖 Modal 的打开、重复 key、隐藏恢复、关闭全部、遮罩关闭、自定义事件和内容组件 expose 调用。参见 [引入单元/组件测试框架计划](docs/unit-test-framework.md)。
- [X] 为 Router、Pinia、provide 和全局插件设计动态 Modal 上下文继承方案，避免 Modal 内容组件在独立 `createApp()` 中丢失主应用能力。参见 [动态 Modal 主应用上下文继承方案](docs/dynamic-modal-context-inheritance.md)。
- [ ] 收紧 Modal 类型：减少 `any`，补全 `ModalManagerInterface` 返回类型，统一 footer 按钮必填字段，并为内容组件暴露能力提供泛型约束。
- [ ] 让 Modal props 与内部状态保持同步，并补充窗口 resize、超小视口、最小化排列及移动端触控适配。
- [X] 将 SVG 转 Iconify JSON 的流程改为可复现的 pnpm 脚本，增加明确的 TypeScript runner，并基于脚本文件位置解析输入输出路径。
- [X] 优化 ECharts 打包体积；当前页面 chunk 约 562 kB，应评估进一步拆分、异步加载或调整模块边界。参见 [ECharts 打包体积优化计划](docs/echarts-bundle-size-optimization.md)。
- [ ] 封装可复用的 ECharts 组件或 composable，统一初始化、更新 option、resize 和 dispose 行为。
- [ ] 为 `VITE_API_BASE_URL` 等客户端环境变量补充 `ImportMetaEnv` 类型，并增加缺失值校验。
- [X] 修复 Vitest TypeScript 项目引用，使测试文件正确解析 `@/*` alias 和自动导入声明。参见 [Vitest TypeScript 项目引用修复计划](docs/vitest-typescript-project-reference.md)。
- [ ] 更新 README 中失效或不准确的内容，包括 Modal 组件路径、SVG 生成方式、pnpm 版本和 production 命令含义。
- [ ] 建立 CI，至少执行依赖安装、类型检查、lint、测试和生产构建。

## 低优先级

- [X] 改进演示站布局和响应式导航，使各功能页面在桌面端和移动端均可直接验证。参见 [Ant Design Vue 风格文档布局优化计划](docs/antdv-style-document-layout.md)。
- [X] 优化原生滚动条交互，使默认状态更轻量，并增强 hover 和拖拽反馈。参见 [原生滚动条交互优化计划](docs/native-scrollbar-interaction.md)。
- [X] 拆分组件文档页和文档布局职责，使 `DocLayout` 收敛为布局壳，并整理 `views/` 功能区目录。参见 [组件文档布局职责拆分计划](docs/component-doc-layout-refactor.md)。
- [X] 新增左侧 sider、content、右侧 sider 组成的三栏应用布局，并补充 Layout 文档页说明当前两种 layout。参见 [三栏应用布局与 Layout 文档计划](docs/three-column-app-layout.md)。
- [ ] 完善按钮样式的 disabled、loading、键盘焦点和无障碍状态，并避免依赖 WebKit 的单一浏览器样式。
- [ ] 清理或扩展脚手架遗留的 `counter` Pinia store，避免保留没有实际入口的示例代码。
- [ ] 评估通过 UnoCSS 使用 Iconify；确认收益后再替换当前 `unplugin-icons` 方案，避免同时维护两套约定。
- [ ] 增加路由级错误页、404 页面和异步页面加载失败处理。
- [ ] 在基础设施稳定后实现 GitHub OAuth2 登录流程，并避免在纯前端保存客户端密钥。
- [ ] 基于路由 meta 和后端授权数据实现路由守卫、动态菜单及按钮权限控制。
- [ ] 增加可访问性检查，包括 Modal 焦点锁定、Esc 关闭、ARIA 属性和关闭后的焦点恢复。
