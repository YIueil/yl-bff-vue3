# 动态 Modal 挂载机制优化

## 背景

`ModalManager` 通过 `createApp()` 为每个 API Modal 创建独立 Vue 应用，并使用
`modalEntryMap` 按 `key` 管理窗口。当前实现可以完成基本的打开和关闭，但挂载节点没有被当作
Modal 生命周期资源管理，导致 app、DOM 和 Map 条目之间缺少明确的一一对应关系。

本文只定义挂载与清理机制的后续实现方案，不修改现有运行时代码或公共 API。

## 当前问题

当前 `open()` 和 `close()` 存在以下问题：

1. `open()` 查询 `.modal-div`，但创建新节点时没有设置该类名。查询条件与实际创建结果不一致，
   后续调用通常无法找到之前创建的节点。
2. 挂载节点没有存入 `ModalObject`。Map 只持有 `app`、`modalContext` 和
   `modalInstance`，管理器无法通过自己的数据结构准确定位其创建的 DOM。
3. `close()` 依赖 Vue 私有字段 `app._container` 删除节点。私有字段不属于稳定公共 API，
   Vue 升级后可能变化，也不能表达该 DOM 由 Modal 管理器负责清理的所有权关系。
4. 创建 host 后，如果 `app.mount()` 抛出异常，当前流程不会进入 Map 写入，也没有回收已创建的
   app 和 host，可能在 `document.body` 中留下孤立节点或部分初始化的资源。
5. `closeAll()` 直接遍历正在被 `close()` 修改的 Map。虽然当前 Map 删除行为通常可以工作，
   但批量关闭的边界不明确，关闭回调中的重入或新增窗口可能影响本次批量清理的范围。

## 目标

- 每个 Modal app 拥有唯一、明确且由管理器持有的挂载节点。
- Map 条目只代表已经挂载成功、可以被正常管理的 Modal。
- 单个关闭和批量关闭都完整清理 Vue app、Teleport 内容、事件和管理器创建的 DOM。
- 关闭操作可重复调用，并允许卸载期间发生重入，不重复处理同一条目。
- 挂载失败不留下 Map 条目或 DOM。
- 不再读取 Vue 的私有字段。

## 非目标

本方案不处理以下能力：

- Router、Pinia、`provide` 或全局插件的主应用上下文继承。
- 多窗口层级和激活顺序。
- 已打开窗口的响应式 props 更新。
- 焦点锁定、Esc 关闭、ARIA 属性和关闭后的焦点恢复。
- 引入 Vitest、Cypress、Playwright 或其他测试框架。

这些问题应分别设计，避免扩大挂载资源管理改动的范围。

## 推荐设计

### 独立 host

每次创建新 Modal 时都创建独立元素：

```html
<div class="yl-modal-host" data-modal-key="example-key"></div>
```

- `.yl-modal-host` 用于调试、手工检查和必要的统一样式，不作为查找或复用节点的依据。
- `data-modal-key` 使用 `String(key)` 写入，仅作为调试标识；实际身份仍由 Map 的原始
  `string | number` key 决定。
- host 默认追加到 `document.body`。现有 `parent` 和 `isTeleport` 选项仍只控制
  `YlModal` 内部渲染行为，不改变 host 的所有权。
- 不再查询或复用 `.modal-div`、`.yl-modal-host`。节点引用由对应 Map 条目直接持有。

每个窗口使用独立 host，可以避免一个 app 的 `mount()` 覆盖另一个 app 的根容器，也使清理边界
与 Map 条目保持一致。

### ModalObject 内部资源

为 `ModalObject` 增加 `mountNode`：

```ts
export type ModalObject = {
  app: App
  mountNode: HTMLElement
  modalContext: ComponentPublicInstance & ModalAppExport
  modalInstance: ModalInstance
}
```

这是管理器内部资源字段，不增加或改变 `ModalOptions`、`ModalInstance` 以及
`open()`、`close()`、`closeAll()`、`hide()`、`show()` 的调用方式。

### 创建与挂载

`open()` 应按以下顺序执行：

1. 解析 key 并查询 `modalEntryMap`。
2. 如果 key 已存在，仅调用 `show(key)` 并返回现有行为兼容的控制实例；不创建 host 或 app。
3. 创建 `.yl-modal-host`，设置 `data-modal-key`，追加到 `document.body`。
4. 创建和配置 Modal app。
5. 在 `try` 块中调用 `app.mount(mountNode)`。
6. 挂载成功后创建 `modalInstance`，将 `app`、`mountNode`、`modalContext` 和
   `modalInstance` 一次性写入 Map，然后返回实例。
7. 如果挂载失败，尝试卸载已经创建的 app，并在 `finally` 中执行 `mountNode.remove()`，
   然后继续抛出原始挂载异常。失败条目不得写入 Map。

Map 写入必须发生在挂载成功之后。这样 `getModal()`、`listModal()` 和 `closeAll()` 不会观察到
尚未可用或挂载失败的窗口。

清理挂载失败时，卸载阶段自身的错误不应覆盖原始挂载错误；可以记录清理错误，但最终应向调用方
保留造成 `open()` 失败的原始异常。

### 单个关闭

`close(key)` 应使用如下顺序：

1. 从 Map 获取条目；不存在时直接返回。
2. 在执行任何用户组件卸载钩子前先从 Map 删除该 key。
3. 调用 `app.unmount()`。
4. 无论卸载是否抛出异常，都在 `finally` 中调用公开 DOM API `mountNode.remove()`。

先删除 Map 条目使关闭具备幂等和可重入语义。组件的卸载钩子或事件处理器如果再次关闭同一个 key，
第二次调用会直接返回，不会重复卸载 app。`mountNode.remove()` 本身也可以安全处理节点已经脱离
DOM 的情况。

如果 `app.unmount()` 抛出异常，host 仍会被删除，但异常应继续向调用方传播，避免静默隐藏组件
清理失败。

### 批量关闭

`closeAll()` 在调用开始时创建 key 快照，再逐个关闭：

```ts
const keys = [...this.modalEntryMap.keys()]
const closeErrors: unknown[] = []
for (const key of keys) {
  try {
    this.close(key)
  } catch (error) {
    closeErrors.push(error)
  }
}
if (closeErrors.length > 0) {
  throw closeErrors[0]
}
```

快照定义了明确语义：本次调用只关闭调用时已经存在的窗口。卸载过程中新增的 Modal 不属于本次
批量操作；已被重入逻辑提前关闭的 key 会由 `close()` 幂等跳过。单个窗口卸载失败时继续清理
快照中的其余窗口，全部处理后再抛出第一个错误，避免一个异常导致剩余 app 和 DOM 滞留。

## 资源所有权与清理责任

`app.unmount()` 和 `mountNode.remove()` 负责不同层级，二者都必须执行：

- `app.unmount()` 负责触发 Vue 组件卸载生命周期，清理响应式 effect、声明式事件监听、
  `YlModal`、第三方拖拽缩放组件，以及 Vue 管理的 Teleport 内容。
- `mountNode.remove()` 负责删除由 `ModalManager` 创建并追加到 DOM 的 host。

Teleport 开启时，Modal 的主要内容可能渲染到 host 之外；Vue app 仍然拥有这些 Teleport 节点，
应由 `app.unmount()` 清理。Teleport 关闭时，内容位于 host 内，仍应先 unmount 以执行完整组件
生命周期，再删除 host。

### 不采用共享挂载节点

共享 host 会让多个独立 app 竞争同一根容器。Vue app 的 mount 和 unmount 边界无法再与单个
Modal 对齐，关闭一个窗口时也难以证明不会影响其他窗口。独立 host 的少量 DOM 成本换取了明确
的所有权和可验证的清理行为。

### 不采用 `app._container`

`_container` 是 Vue 的私有实现字段，不在 `App` 的公开类型和兼容性承诺内。管理器本身创建了
host，应直接保存 `HTMLElement` 引用并通过标准 DOM API 清理，而不是在关闭时从框架内部状态
反向推断节点。

## 生命周期流程

### 打开新 key

```text
解析 key
  -> Map 未命中
  -> 创建并追加独立 host
  -> 创建 app
  -> mount 成功
  -> 写入 Map
  -> 返回 ModalInstance
```

### 打开重复 key

```text
解析 key
  -> Map 命中
  -> show(key)
  -> 返回控制实例
  -> 不创建 host，不创建 app，不更新内容
```

这保持当前重复 key 的行为不变。

### 关闭单个窗口

```text
读取 Map 条目
  -> 删除 Map 条目
  -> app.unmount()
  -> finally: mountNode.remove()
```

### 批量关闭

```text
快照当前 keys
  -> 对快照逐个 close(key)
  -> 调用时存在的条目全部离开 Map 并完成资源清理
```

### 挂载失败

```text
创建并追加 host
  -> 创建 app
  -> mount 抛出异常
  -> 尝试 app.unmount()
  -> finally: mountNode.remove()
  -> Map 保持无该 key
  -> 抛出原始异常
```

## 兼容性

- `ModalOptions` 和 `ModalInstance` 不变。
- `open()`、`close()`、`closeAll()`、`hide()`、`show()` 的调用方式不变。
- 相同 key 再次 `open()` 时仍只显示已有窗口，不重建内容或更新 props。
- `ModalObject` 仅增加内部 `mountNode: HTMLElement` 字段。
- 同时支持 `isTeleport` 开启和关闭，不依赖内容最终渲染在哪个 DOM 父节点。
- 移除对 Vue 私有 `app._container` 的依赖。

## 验收方案

### 自动化测试建议

仓库当前没有测试框架。未来引入组件测试后，至少覆盖：

1. 连续打开不同 key，断言生成不同 host，且每个 Map 条目的 `mountNode` 指向对应 host。
2. 重复打开相同 key，断言 host 数量、app 实例和 Map 大小均不增加。
3. 关闭单个窗口，断言调用对应 app 的 `unmount()`、删除 host、删除 Map 条目，并且之前绑定的
   声明式事件不再触发。
4. 分别在 `isTeleport: true` 和 `isTeleport: false` 下关闭，断言 Modal 内容和 host 均无残留。
5. `closeAll()` 后断言调用开始时存在的 app 均已卸载、host 均已删除且 Map 为空。
6. 对同一 key 重复 `close()`，断言不会重复 unmount，也不会抛出异常。
7. 模拟 `mount()` 抛错，断言没有 Map 条目和 host 残留，并保留原始异常。
8. 在卸载钩子中重入 `close(key)`，断言同一 app 只卸载一次。

### 手工验证

实现运行时代码后，在浏览器开发者工具中执行以下检查：

1. 打开两个不同 key 的 API Modal，确认 `document.querySelectorAll('.yl-modal-host')` 长度
   增加 2，两个节点不同，`data-modal-key` 与 key 对应。
2. 再次打开其中一个 key，确认窗口重新显示，但 host 数量不变。
3. 分别验证 `isTeleport` 开启和关闭的窗口，关闭后确认对应 host、Modal 内容和遮罩全部消失。
4. 对已关闭实例再次调用 `close()`，确认没有报错且 DOM 数量不变。
5. 打开多个窗口后调用 `closeAll()`，确认调用前存在的 host 全部移除，管理器 Map 为空。
6. 临时让挂载过程抛出异常，确认该 key 不在 Map 中，且页面没有空的 `.yl-modal-host`。
7. 在关闭后操作原按钮或检查监听器，确认声明式事件不再触发。

手工回归还应覆盖现有 Modal 能力：声明式打开/关闭、API 打开、隐藏后重显、遮罩点击、
footer 自定义事件、最小化/恢复、最大化/恢复和内容组件 expose 调用。

### 仓库校验

文档和后续实现都应执行：

```bash
git diff --check
pnpm run lint
pnpm run type-check
pnpm run build-only
```

同时检查 `TODO.md` 中的相对链接可以定位到本文。只有运行时代码完成并通过上述生命周期验收后，
才能将对应 TODO 标记为已完成。
