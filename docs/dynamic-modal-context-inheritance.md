# 动态 Modal 主应用上下文继承方案

## 背景

`ModalManager.open()` 当前为每个 API Modal 调用一次 `createApp()`。这些 Modal app 与
`src/main.ts` 创建的主 app 是彼此独立的 Vue 应用，因此内容组件无法直接使用主应用已经安装的
Vue Router、Pinia、应用级 `provide`、全局组件、全局指令和 `globalProperties`。

管理器目前只为每个 Modal app 重新安装了 `Vue3DraggableResizable`。继续按此方式逐个补装
Router、Pinia 或其他插件，只能覆盖已知依赖，无法形成可维护的通用上下文继承机制。

本文只定义后续实现方案。计划阶段不修改运行时代码、公共类型或构建配置。

## 目标与范围

- API Modal 的内容组件与主应用处于同一个 Vue app context。
- 内容组件可以直接使用主应用的 `useRouter()`、`useRoute()` 和 Pinia store。
- 内容组件可以注入 `app.provide()` 或插件通过 `app.provide()` 注册的值。
- 内容组件可以使用主应用注册的全局组件、全局指令和
  `app.config.globalProperties`。
- Router、Pinia 和其他插件只在主应用安装一次，不为每个 Modal 重复执行插件安装逻辑。
- 保持 `Modal.open()`、`close()`、`closeAll()`、`hide()`、`show()`、重复 key 和 footer
  事件的现有调用方式。
- 保持声明式 `<YlModal>` 的使用方式不变。
- 关闭 Modal 时由 Vue 正常卸载内容组件、响应式 effect、事件和 Teleport 节点。

## 非目标

- 本方案不让 Modal 自动继承调用 `Modal.open()` 的任意组件局部 `provide`。
- 不在本任务中增加测试框架。
- 不处理 Modal props 同步、窗口层级、移动端、焦点锁定或无障碍能力。
- 不扩展重复 key 时的 props 更新语义。
- 不把 Router、Pinia 或任意业务插件加入 `ModalOptions`。
- 不通过公开 API 暴露 Vue 内部 `AppContext`。

## 当前问题

### 每个窗口拥有独立 app context

主应用按以下顺序安装能力：

```ts
app.use(createPinia())
app.use(router)
app.use(Vue3DraggableResizable)
app.use(ModalPlugin)
```

动态 Modal 则重新 `createApp()`，并且只执行：

```ts
modalApp.use(Vue3DraggableResizable)
```

因此 Modal 内容中的 `useRouter()` 和 `useStore()` 无法找到对应注入，`inject('modal')` 等
应用级 provide 也不可见。主应用的全局组件、指令和 `$modal` 同样不会自动复制到新 app。

### 不能可靠地枚举和重放插件

Vue 的公开插件 API 只有 `app.use()`，没有读取“主应用已安装插件及其原始参数”的公开接口。
即使由项目手工维护插件列表，重复安装仍可能产生以下问题：

- Router 和 Pinia 的实例可能与主应用不是同一实例，造成路由状态或 store 状态分裂。
- 插件的 install 逻辑可能注册监听器或执行其他副作用，不适合每打开一个窗口就执行一次。
- 新增全局插件时必须同步修改 Modal 管理器，容易再次出现能力缺失。
- `app.provide()` 和运行时修改的 `globalProperties` 不属于简单的插件列表，仍需额外同步。

### 复制 Vue 私有上下文不可作为长期方案

直接读取或赋值 `app._context`，或者手工复制其 `provides`、`components`、`directives` 和
`config`，依赖 Vue 私有实现。该方案没有公共兼容性承诺，还会模糊 app 所有权和卸载边界，
不应作为正式实现。

## 推荐方案：主应用内的单一 Modal Host

不再为每个 API Modal 创建独立 app。`ModalManager` 只管理响应式窗口描述，由一个位于主应用
组件树中的 `YlModalHost` 统一渲染所有 API Modal。

```text
主 app
├── Router / Pinia / app.provide / 全局插件
└── App.vue
    ├── RouterView
    └── YlModalHost
        ├── YlModal(key A)
        │   └── 内容组件 A
        └── YlModal(key B)
            └── 内容组件 B
```

由于 Host 和内容组件都由主 app 的 renderer 创建，它们自然共享同一 app context，不需要复制
或重新安装插件。

### Host 的装配

新增 `src/components/Modal/YlModalHost.vue`，并在 `App.vue` 中显式渲染一次。Host 应放在
应用根组件中，避免路由切换时被卸载：

```vue
<RouterView />
<YlModalHost />
```

Host 从 `ModalPlugin` 提供的管理器读取响应式条目并按稳定 key 渲染 `YlModal`。`YlModal`
现有 Teleport 行为继续决定窗口内容是否移动到 `document.body`；Teleport 只改变 DOM 位置，
不会切断组件的 app context。

项目应把“全局只存在一个 Host”作为使用约束。开发模式下若检测到重复 Host，可以输出明确警告，
防止同一窗口被重复渲染；生产环境不引入额外扫描。

### 管理器状态

`ModalManager` 不再持有每个窗口的 `App`，而是维护 `shallowReactive` 的 Map 或等价的浅响应式
集合。每个条目至少包含：

- 原始 `key` 和 `ModalOptions`。
- `visible` 与 `showModal` 状态。
- 内容组件模板 ref。
- 稳定的 `ModalInstance` 控制对象。
- Host 渲染和事件分发所需的内部状态。

组件定义、VNode 和外部传入对象不应被深度响应式代理。实现时使用浅响应式容器，并按需要使用
`markRaw()` 或 `shallowRef()` 保存组件/VNode。

`open()` 仍同步创建条目并返回 `ModalInstance`。实际 DOM 更新遵循 Vue 的正常渲染调度，在下一
次刷新完成。当前调用方不依赖 `open()` 返回时 DOM 已同步存在；若未来需要等待挂载，应另行设计
明确的 `afterOpen` 或 Promise API，不在本任务中隐式改变返回类型。

### 渲染职责

当前 `modal-manager.ts` 中的标题、内容和 footer VNode 构造逻辑迁移到 Host 或无状态渲染辅助
函数中：

- 普通字符串继续按文本渲染。
- `Modal.trustedHtml()` 继续按显式可信 HTML 渲染，不改变其安全约束。
- 组件继续接收 `componentProps`，并通过模板 ref 暴露内容实例。
- VNode 和返回 VNode 的函数继续保持现有行为。
- footer 按钮继续通过 `eventName` 进入管理器事件分发。

渲染逻辑必须在主 app 的组件渲染过程中执行，避免在 `Modal.open()` 调用现场预渲染组件。

### 生命周期与资源清理

新结构下，Vue renderer 负责 Modal 子树的创建与卸载：

```text
open(key)
  -> 向响应式集合加入条目
  -> Host 渲染 YlModal 和内容组件

close(key)
  -> 先从管理器集合删除条目
  -> Host 移除对应子树
  -> Vue 卸载组件并清理 Teleport 内容
```

`close()` 继续先删除管理器条目，以保持幂等和可重入语义。`closeAll()` 继续基于调用开始时的
key 快照处理。原有每窗口 `.yl-modal-host` 调试标识可以由 Host 渲染为普通包装节点或 ref，
但不再由管理器通过 `document.createElement()` 创建，也不再作为 app 挂载容器。

实现后应删除每窗口 `createApp()`、`modalApp.use()`、`app.unmount()` 和手工
`mountNode.remove()` 路径。主 app 的卸载责任只属于主入口，关闭单个 Modal 绝不能接触主 app。

### ModalInstance 与事件兼容

管理器应为每个条目创建一个稳定的 `ModalInstance`，并同时用于：

- `open()` 的返回值。
- footer `on` 回调的控制参数。
- `ModalObject` 中对外可见的控制实例。

`contentComponent` 应通过 getter 或 Host 写入的浅 ref 指向实际内容组件实例，使现有
`ctl.contentComponent?.method()` 用法继续有效。内容尚未挂载或已经关闭时返回
`undefined`。不再把独立 app 的根组件代理当作事件控制对象。

这会修正当前“`open()` 返回精简控制对象、footer 回调收到 app 根代理”形成的两套对象语义，
但不改变已声明的 `ModalInstance` 方法。

## provide 的继承边界

### 本方案覆盖

- `app.provide()` 注册的值。
- Router、Pinia 和其他插件在 app 级别注册的 provide。
- `ModalPlugin` 当前注册的 `'modal'` provide。
- `App.vue` 之上的祖先组件 provide；当前项目中通常等同于应用级 provide。

### 本方案不自动覆盖

如果路由页面内部执行 `provide(localKey, value)`，而 `YlModalHost` 是该页面在 `App.vue` 中的
兄弟节点，则 Host 下的内容组件不会成为该页面的后代，因此无法注入 `localKey`。这是 Vue
组件树的正常作用域规则。

不建议读取 `getCurrentInstance().provides` 并复制调用组件的局部上下文，因为：

- `Modal.open()` 也可以在组件外、异步回调或普通模块中调用，调用者并不总有组件实例。
- 实例内部 provides 不是面向应用架构的稳定公共契约。
- 复制值会破坏祖先层级、覆盖规则和后续响应关系的可解释性。

若未来出现明确的局部 provide 场景，应单独评估以下显式方案之一：

1. 在对应 provider 子树内放置一个局部 Modal Host，并给管理器增加明确的 host/channel 标识。
2. 为有限的 InjectionKey 增加显式 `providers` 选项，由包装组件逐项 `provide()`。

在没有实际需求前不提前加入这两类公共 API。

## 不采用的方案

### 为每个 Modal 重装已知插件

该方案无法覆盖任意新插件、应用级 provide 和运行时全局配置，还会重复插件副作用。它只能作为
临时补丁，不是上下文继承。

### 复制 `app._context`

该方案依赖 Vue 私有字段，升级风险高；不同 app 共享内部可变对象时，卸载和配置所有权也不清晰。

### 将 Router、Pinia 作为 `ModalOptions`

这会把应用装配细节泄漏到每次窗口调用，调用方容易传入错误实例，也无法覆盖任意全局插件。

### 全局事件总线创建组件

事件总线只能传递数据，不会建立 Vue 组件父子关系，仍然不能解决 inject、全局组件和卸载边界。

## 接口兼容性

### 保持不变

- `Modal.open(options)` 及其同步返回形式。
- `Modal.close(key)`、`closeAll()`、`hide(key)`、`show(key)`。
- 重复 key 只恢复已有窗口，不重建内容或更新 props。
- `ModalOptions` 的标题、内容、footer、事件和窗口配置字段。
- `ModalInstance` 的 `getKey()`、`close()`、`closeAll()`、`hide()` 以及内容组件 expose 用法。
- `ModalPlugin`、`Modal` 单例、`inject('modal')` 和 `this.$modal` 的入口。
- 声明式 `<YlModal>`。

### 需要调整的内部/诊断接口

`ModalObject` 当前公开了独立 app 的 `app`、手工挂载节点 `mountNode` 和 app 根代理
`modalContext`。切换为同 app Host 后，这些字段不再具有原语义，不能用主 app 或伪造对象填充：

- 删除 `app` 字段，避免调用方误卸载主应用。
- 将 `mountNode` 改为可选的 Host 元素引用，或者从公共结构中移除。
- 用稳定的 `modalInstance` 替代 `modalContext`。
- 为 `getModal()`、`listModal()` 和 `getModalEntryMap()` 补全准确的只读返回类型。

仓库内这些接口只用于 Modal 演示页打印诊断信息，没有业务调用。实现阶段应同步更新类型和演示，
并在 Diff 报告中明确列为诊断结构变更。若实现前发现仓库外消费者依赖这些字段，则需先重新确认
兼容策略。

## 实施步骤

1. 新增 `YlModalHost.vue`，使其在主 app 中读取并渲染管理器条目。
2. 在 `App.vue` 根级装配唯一 Host，确认它不会随 RouterView 切换而销毁。
3. 将 `ModalManager` 改为响应式条目管理，移除每窗口 `createApp()` 和插件重复安装。
4. 将标题、内容、footer 和可信 HTML 渲染迁移到 Host，并保持现有输出语义。
5. 统一 `open()` 返回值和 footer 回调使用的 `ModalInstance`，接通内容组件 ref。
6. 调整 `ModalObject` 与管理器查询接口类型，更新演示页的诊断输出。
7. 增加一个只用于演示验证的 Modal 内容组件，覆盖 Router、Pinia、`inject('modal')`、
   `$modal` 和全局拖拽组件能力；不引入新的生产依赖。
8. 更新 `AGENTS.md` 中“动态 Modal 不继承主应用能力”的现状说明。
9. 完成自动校验和手工回归后，将 `TODO.md` 对应项标记为完成。

## 风险与控制

### Host 遗漏或重复

未装配 Host 时 `open()` 会产生条目但没有 UI；装配多个 Host 会重复渲染。实现时提供开发环境
诊断，并在 `App.vue` 固定装配一次。管理器在 Host 卸载时应清理注册状态，但不应误关闭由新 Host
接管的条目。

### 响应式代理组件定义

深度代理组件对象会产生 Vue 警告并增加开销。状态集合必须采用浅响应式策略，组件和 VNode
保持 raw。

### 打开与挂载时序变化

当前 `createApp().mount()` 是同步的；Host 方案的 DOM 更新经过 Vue 调度。现有公开类型没有承诺
同步 DOM 可用，但实现前后应检查仓库内调用方。内容实例在挂载前为 `undefined`，footer 事件只会
在挂载后触发，不受影响。

### 诊断结构兼容

`ModalObject` 暴露了本应属于内部实现的 app 与 DOM 字段。本次不能保留具有误导性的占位值，
必须在类型和报告中明确变更，并保持高层控制 API 稳定。

### Teleport 与清理回归

Host 方案必须分别验证 `isTeleport: true` 和 `false`。条目删除后，窗口、遮罩、内容组件和
Teleport 节点都不得残留。

### 主应用卸载

Host 随主 app 卸载时，所有 Modal 子树会由 Vue 清理。管理器是模块级单例，Host 卸载后还需清空
或失效化条目，避免开发热更新或应用重新挂载时恢复陈旧实例。

## 验收与验证

### 上下文能力

在 Modal 演示页打开验证内容组件，至少确认：

1. `useRoute()` 能读取当前 `/modal` 路由，`useRouter()` 返回主 Router 并可执行一次可逆导航
   验证。
2. Modal 内外读取同一个 Pinia store；任一侧修改状态，另一侧同步看到变化。
3. 内容组件 `inject('modal')` 得到与导出的 `Modal` 相同的管理器实例。
4. 选项式内容组件可以通过 `this.$modal` 调用管理器。
5. `YlModal` 中由主应用全局注册的 `Vue3DraggableResizable` 正常解析，且管理器不再重复
   `use()` 该插件。
6. Router 或 Pinia 缺失时不出现 `injection not found`、`getActivePinia()` 等错误。

### 生命周期和现有行为回归

至少手工覆盖：

1. 声明式 Modal 打开和关闭。
2. API Modal 打开和关闭。
3. 相同 key 重复打开只恢复窗口，条目和 DOM 不重复。
4. `hide()` 后重新 `show()`，内容组件与 Pinia 状态保留。
5. `closeAll()` 清理调用时已有的全部窗口。
6. 遮罩点击关闭。
7. footer 自定义事件和默认 close 事件。
8. 最小化/恢复与最大化/恢复。
9. 内容组件 `defineExpose()` 方法调用。
10. `isTeleport` 开启和关闭时，关闭后均无 DOM 残留。
11. 路由切换后 Host 仍存在，已打开窗口的预期行为保持一致。
12. 主 app 卸载或 Vite 热更新后没有陈旧 Modal 条目和重复 Host。

### 仓库校验

实现阶段至少执行：

```bash
git diff --check
pnpm run lint
pnpm run type-check
pnpm run build-only
```

`pnpm run build-only` 现有 ECharts chunk size 警告应与本任务新增问题区分。运行 Vite 后检查
`auto-imports.d.ts` 和 `components.d.ts` 是否只有预期的自动生成变更。

## 实施结果

本方案已按主应用内单一 Host 的设计实现：

- `App.vue` 在 `RouterView` 外固定装配一个 `YlModalHost`。
- `ModalManager` 改为管理浅响应式窗口条目，不再调用每窗口 `createApp()`、`use()`、
  `unmount()` 或手工 DOM 挂载。
- 标题、内容、footer 和可信 HTML 渲染由 Host 在主应用渲染上下文中完成。
- `open()` 返回值与 footer 回调统一使用稳定的 `ModalInstance`，关闭后不继续持有内容组件
  引用。
- `ModalObject` 改为 Host 条目结构，不再暴露独立 app；`mountNode` 仅作为可选诊断引用。
- 新增 `ModalContextProbe` 演示内容，并在 Modal 页面同时展示共享 Pinia 状态。
- Host 缺失或重复时在开发环境输出诊断；最后一个 Host 卸载时清空单例中的陈旧条目。

实现后已通过类型检查、ESLint、生产构建和无头浏览器回归。浏览器回归覆盖 Router、共享 Pinia、
应用级 provide、`$modal`、全局拖拽组件、重复 key、内容组件 expose、隐藏恢复、路由切换、
Teleport 开关和关闭后的 DOM 清理。

## TODO 处理

`TODO.md` 对应项已在运行时代码、类型、演示和回归完成后标记为 `[X]`。局部组件 provide 的
跨子树继承不属于本项完成条件，其边界保留在本文中；只有出现明确业务需求时再新增独立 TODO。
