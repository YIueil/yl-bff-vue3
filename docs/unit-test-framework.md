# 引入单元/组件测试框架（Vitest）实现计划

> 状态：计划中（开发者确认本方案后，文档由开发者提交到 main，再进入实现阶段）
>
> 本文档遵循 `AGENTS.md`「计划先行」约束：**只描述方案，不修改运行时代码**。

## 1. 目标与范围

引入 Vitest + @vue/test-utils 测试框架，优先覆盖 Modal 的 7 个场景：打开、重复 key、隐藏恢复、关闭全部、遮罩关闭、自定义事件、内容组件 expose 调用。

- **DOM 环境**：happy-dom
- **文件位置**：就近 `__tests__/` 目录
- **stub 策略**：混合（Vue3DraggableResizable + unplugin 图标 stub，Antd 真实注册）
- **覆盖率**：引入 `@vitest/coverage-v8`，先不设阈值

**非目标**：ECharts / Draggable / DragResize / IconUsageGuide 的测试（属后续任务）。

## 2. 现状与约束

- `package.json` 无任何测试依赖，无 `test` 脚本。
- `vite.config.ts` 用 `defineConfig` from `vite`，plugins 已配 `vue()` / `Icons()` / `AutoImport` / `Components`，alias `@ -> ./src`。
- `tsconfig.app.json` 已 `exclude: ["src/**/__tests__/*"]`，`composite: true`；`tsconfig.node.json` include 已列 `vitest.config.*`。
- `eslint.config.js` ignores 已含 `coverage/**`。
- `ModalManager` 是单例（`private static instance`），无 reset 静态实例的方法；有 `closeAll()` 清条目，`unregisterHost` 在 hostIds 空时 `modalEntryMap.clear()`。
- `YlModal.vue` 用 `<Teleport to="body" :disabled="!isTeleport">`、`useWindowSize`、全局 `Vue3DraggableResizable`、`a-button`、unplugin 图标（`<IMdiClose>` 等）。
- `YlModalHost.vue` 用 `resolveComponent('a-button')` / `resolveComponent('a-space')`，必须全局注册 Antd 或 stub。

## 3. 推荐方案

### 3.1 依赖新增（devDependencies）

```json
{
  "vitest": "^2.1.0",
  "@vue/test-utils": "^2.4.0",
  "happy-dom": "^15.0.0",
  "@vitest/coverage-v8": "^2.1.0"
}
```

> 版本以 pnpm 安装时实际解析为准；vitest 2.x 兼容 vite 6.x。

### 3.2 配置文件

**新建 `vitest.config.ts`**（独立于 `vite.config.ts`，用 `mergeConfig` 复用 alias + vue plugin）：

```ts
import { mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(viteConfig, {
  test: {
    environment: 'happy-dom',
    globals: false,           // 显式 import { describe, it, expect } from 'vitest'
    include: ['src/**/__tests__/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      reportsDirectory: './coverage'
    }
  }
})
```

**新建 `tsconfig.vitest.json`**（独立 tsconfig，避免污染 app 类型检查）：

```json
{
  "extends": "./tsconfig.app.json",
  "compilerOptions": {
    "composite": false,
    "types": ["vitest/globals", "node", "vite/client"],
    "lib": ["ESNext", "DOM", "DOM.Iterable"]
  },
  "include": ["src/**/__tests__/**/*.test.ts", "vitest.config.ts"]
}
```

**修改 `tsconfig.app.json`**：保持现有 `exclude: ["src/**/__tests__/*"]` 不变（已隔离）。

### 3.3 package.json scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

### 3.4 测试文件结构

```text
src/
├── utils/
│   └── __tests__/
│       └── modal-manager.test.ts        # ModalManager 单例 API 测试
└── components/Modal/
    └── __tests__/
        ├── YlModalHost.test.ts           # Host 渲染 + 集成测试
        └── helpers.ts                    # 共享 mount 工厂（注册 Antd/stub）
```

### 3.5 共享 mount 工厂 `helpers.ts`

```ts
import { mount, type ComponentMountingOptions } from '@vue/test-utils'
import { defineComponent, type Component } from 'vue'
import Antd from 'ant-design-vue'
import { createPinia } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import YlModalHost from '@/components/Modal/YlModalHost.vue'

// stub Vue3DraggableResizable，避免 DOM 测量报错
const Vue3DraggableResizableStub = defineComponent({
  name: 'Vue3DraggableResizable',
  props: ['x', 'y', 'w', 'h', 'active', 'draggable', 'resizable', 'parent', 'handles', 'initW', 'initH'],
  emits: ['update:x', 'update:y', 'update:w', 'update:h', 'update:active', 'activated', 'deactivated', 'drag-start', 'drag-end', 'dragging', 'resize-start', 'resize-end', 'resizing'],
  template: '<div class="vdr-stub"><slot /></div>'
})

// stub unplugin 图标
const IconStub = defineComponent({
  name: 'IconStub',
  template: '<span class="icon-stub" />'
})

export interface MountOptions extends ComponentMountingOptions<any> {
  withHost?: boolean
}

export function mountWithApp(component: Component, options: MountOptions = {}) {
  const { withHost = true, ...rest } = options
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', component: { render: () => null } }]
  })
  const pinia = createPinia()

  const global = {
    plugins: [pinia, router, Antd],
    stubs: {
      Vue3DraggableResizable: Vue3DraggableResizableStub,
      'i-mdi-minus': IconStub,
      'i-mdi-resize': IconStub,
      'i-mdi-window-maximize': IconStub,
      'i-mdi-window-restore': IconStub,
      'i-mdi-close': IconStub
    },
    ...rest.global
  }

  const wrapper = mount(component, { ...rest, global, attachTo: document.body })

  if (withHost) {
    // 挂载 Host 以注册 hostId
    const hostWrapper = mount(YlModalHost, { global, attachTo: document.body })
    return { wrapper, hostWrapper, pinia, router }
  }
  return { wrapper, pinia, router }
}

export function cleanupBody() {
  document.body.innerHTML = ''
}
```

### 3.6 测试用例清单（对应 TODO 7 个场景）

**`src/utils/__tests__/modal-manager.test.ts`** —— 纯逻辑测试，无需 mount：

```ts
import { describe, it, expect, afterEach, vi } from 'vitest'
import { Modal, isModalTrustedHtml } from '@/utils/modal-manager'

describe('ModalManager', () => {
  afterEach(() => Modal.closeAll())

  // 1. 打开
  it('open() 创建条目并返回 ModalInstance', () => {
    const inst = Modal.open({ key: 'k1', title: 't' })
    expect(inst).toBeDefined()
    expect(inst.getKey()).toBe('k1')
    expect(Modal.getModal('k1')).toBeDefined()
  })

  // 2. 重复 key
  it('同 key 第二次 open() 不重建，仅 show，返回同一 instance', () => {
    const inst1 = Modal.open({ key: 'k1', title: 't' })
    const inst2 = Modal.open({ key: 'k1', title: 't' })
    expect(inst1).toBe(inst2)
    expect([...Modal.listModal()].length).toBe(1)
  })

  // 3. 隐藏恢复
  it('hide() 后 showModal=false，show() 后 showModal=true', () => {
    const inst = Modal.open({ key: 'k1' })
    expect(inst.showModal).toBe(true)
    inst.hide()
    expect(Modal.getModal('k1')?.showModal).toBe(false)
    Modal.show('k1')
    expect(Modal.getModal('k1')?.showModal).toBe(true)
  })

  // 4. 关闭全部
  it('closeAll() 清空所有条目', () => {
    Modal.open({ key: 'k1' })
    Modal.open({ key: 'k2' })
    Modal.closeAll()
    expect([...Modal.listModal()].length).toBe(0)
  })

  // 6. 自定义事件
  it('onEvent 派发对应 on 回调', () => {
    const cb = vi.fn()
    Modal.open({ key: 'k1', on: { send: cb } })
    Modal.onEvent('k1', 'send')
    expect(cb).toHaveBeenCalledWith(expect.objectContaining({ getKey: expect.any(Function) }))
  })

  it('onEvent 未实现的 eventName 走 console.Error', () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {})
    Modal.open({ key: 'k1' })
    Modal.onEvent('k1', 'unknownEvent')
    expect(err).toHaveBeenCalled()
    err.mockRestore()
  })

  it('onEvent eventName=close 触发 close', () => {
    Modal.open({ key: 'k1' })
    Modal.onEvent('k1', 'close')
    expect(Modal.getModal('k1')).toBeUndefined()
  })

  // trustedHtml
  it('trustedHtml() 返回带品牌的对象，isModalTrustedHtml 识别', () => {
    const html = Modal.trustedHtml('<b>x</b>')
    expect(html.html).toBe('<b>x</b>')
    expect(isModalTrustedHtml(html)).toBe(true)
    expect(isModalTrustedHtml('<b>x</b>')).toBe(false)
  })
})
```

**`src/components/Modal/__tests__/YlModalHost.test.ts`** —— 集成测试：

```ts
import { describe, it, expect, afterEach, vi } from 'vitest'
import { nextTick } from 'vue'
import { Modal } from '@/utils/modal-manager'
import YlModalHost from '@/components/Modal/YlModalHost.vue'
import AboutContent from '@/components/AboutContent.vue'
import { mountWithApp, cleanupBody } from './helpers'

describe('YlModalHost 集成', () => {
  afterEach(() => {
    Modal.closeAll()
    cleanupBody()
  })

  // 1. 打开（集成：mount Host 后 open() 渲染到 DOM）
  it('open() 后 DOM 出现 modal-wrapper', async () => {
    mountWithApp(YlModalHost)
    Modal.open({ key: 'k1', title: '测试标题' })
    await nextTick()
    await nextTick()
    expect(document.body.querySelector('.modal-wrapper')).toBeTruthy()
    expect(document.body.textContent).toContain('测试标题')
  })

  // 5. 遮罩关闭
  it('clickMaskClose=true 点击遮罩触发 close', async () => {
    mountWithApp(YlModalHost)
    Modal.open({ key: 'k1', clickMaskClose: true })
    await nextTick(); await nextTick()
    const mask = document.body.querySelector('.modal-mask') as HTMLElement
    expect(mask).toBeTruthy()
    mask.click()
    await nextTick()
    expect(Modal.getModal('k1')).toBeUndefined()
  })

  it('clickMaskClose=false 点击遮罩不关闭', async () => {
    mountWithApp(YlModalHost)
    Modal.open({ key: 'k1', clickMaskClose: false })
    await nextTick(); await nextTick()
    const mask = document.body.querySelector('.modal-mask') as HTMLElement
    mask.click()
    await nextTick()
    expect(Modal.getModal('k1')).toBeDefined()
  })

  // 6. 自定义事件（集成：footer 按钮点击）
  it('footer 按钮 click 触发 on 回调', async () => {
    const cb = vi.fn()
    mountWithApp(YlModalHost)
    Modal.open({
      key: 'k1',
      footer: [{ name: '发送', eventName: 'send', icon: '', type: 'primary' }],
      on: { send: cb }
    })
    await nextTick(); await nextTick()
    const btn = document.body.querySelector('.ant-btn-primary') as HTMLButtonElement
    expect(btn).toBeTruthy()
    btn.click()
    expect(cb).toHaveBeenCalled()
  })

  // 7. 内容组件 expose 调用
  it('contentComponent 暴露 increment/getCount', async () => {
    const inst = Modal.open({
      key: 'k1',
      component: AboutContent,
      componentProps: { userName: 'tester' }
    })
    await nextTick(); await nextTick()
    expect(inst.contentComponent).toBeTruthy()
    expect(inst.contentComponent?.getCount()).toBe(1)
    inst.contentComponent?.increment()
    expect(inst.contentComponent?.getCount()).toBe(2)
    expect(inst.contentComponent?.count).toBe(2)
  })
})
```

### 3.7 eslint 配置

无需改动。测试文件用显式 `import { describe, it, expect } from 'vitest'`，不依赖 globals。`eslint.config.js` 的 `files-to-lint` 已含 `**/*.ts`，会自动覆盖测试文件。

### 3.8 tsconfig.json 修改

`tsconfig.json`（根 references）添加对新 tsconfig 的引用：

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.node.json" },
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.vitest.json" }
  ]
}
```

## 4. 关键修改文件

- 新增：`vitest.config.ts`
- 新增：`tsconfig.vitest.json`
- 新增：`src/utils/__tests__/modal-manager.test.ts`
- 新增：`src/components/Modal/__tests__/YlModalHost.test.ts`
- 新增：`src/components/Modal/__tests__/helpers.ts`
- 改：`package.json`（依赖 + scripts）
- 改：`tsconfig.json`（references 加 vitest）
- 改：`TODO.md`（勾选对应项）

## 5. 风险点

- **Teleport**：`YlModal` 默认 `isTeleport=true`，内容传送到 `document.body`。测试必须 `attachTo: document.body` 并用 `document.body.querySelector` 断言，不能用 `wrapper.find`。
- **`useWindowSize`**：happy-dom 默认窗口尺寸 1024×768，足够 `onMounted` 居中计算。若 happy-dom 不支持 resize 事件，跳过 resize 相关断言。
- **`nextTick` 时机**：`Modal.open()` 内部用 `void nextTick(() => { modalEntry.visible = true })`，测试需 `await nextTick()` 两次（一次等 nextTick 回调，一次等 Host 渲染）。
- **`unregisterHost`** 在 hostIds 空时 `modalEntryMap.clear()`：每个测试 `afterEach` 必须 `cleanupBody()` 卸载 Host，否则 hostIds 残留影响下个测试。
- **Vue3DraggableResizable stub**：必须保留 `<slot/>` 让 YlModal 内容渲染；props/emits 声明齐全避免 Vue 警告。
- **`ModalManager` 单例不可重置**：静态 instance 跨测试共享，但 `closeAll()` 可清条目，足够隔离。
- **resolveComponent('a-button')**：必须真实注册 Antd（`app.use(Antd)`），不能 stub，否则 `resolveComponent` 返回原名组件字符串导致渲染失败。
- **`import.meta.env.DEV`**：测试环境 `DEV` 为 true，`Modal.open()` 在 hostIds 空时会 `console.warn`。测试需挂 Host 或 `vi.spyOn(console, 'warn').mockImplementation(() => {})` 抑制。

## 6. 验收与验证

- `pnpm run test:run` 通过全部测试用例。
- `pnpm run test:coverage` 输出覆盖率报告（`coverage/` 目录）。
- `pnpm run type-check` 仍通过（tsconfig.vitest.json 独立，不影响 app 类型检查）。
- `pnpm run lint` 仍通过。
- `pnpm run build-only` 仍通过（基线 ECharts 562 kB 警告不变）。

## 7. 实施步骤

1. **写计划文档**：在 `docs/unit-test-framework.md` 新增本计划。开发者亲自提交到 main。
2. **创建 worktree**：`git worktree add .worktree/codex-test -b codex/test`。
3. **安装依赖**：`pnpm add -D vitest @vue/test-utils happy-dom @vitest/coverage-v8`。
4. **新增配置**：`vitest.config.ts`、`tsconfig.vitest.json`；修改 `tsconfig.json`、`package.json` scripts。
5. **写测试**：`helpers.ts`、`modal-manager.test.ts`、`YlModalHost.test.ts`。
6. **跑测试**：`pnpm run test:run` 调试通过。
7. **校验三件套**：type-check / lint / build-only 不退化。
8. **更新 TODO.md**：勾选对应项。
9. **报告与等待批准**：输出修改文件清单、核心逻辑、风险点、Diff 摘要，**不自动合并**。

## 8. 相关 TODO

对应 `TODO.md` 中优先级"中"的条目：

> - [ ] 引入单元/组件测试框架，优先覆盖 Modal 的打开、重复 key、隐藏恢复、关闭全部、遮罩关闭、自定义事件和内容组件 expose 调用。

完成后改为 `[X]`。
