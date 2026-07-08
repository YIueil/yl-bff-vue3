# 客户端环境变量类型补充与缺失值校验

## 目标与范围

为当前唯一的客户端环境变量 `VITE_API_BASE_URL` 补齐类型与运行时校验能力：

1. **类型补充**：在 `env.d.ts` 中 augmentation `ImportMetaEnv`，显式声明
   `VITE_API_BASE_URL: string`，避免后续代码对该变量使用散落的类型断言。
2. **缺失值校验**：新增应用级环境配置模块，在应用启动时对必需变量做存在性与
   格式校验（fail-fast），并在变量缺失或非法时抛出清晰错误；同时导出强类型的
   `clientEnv` 对象，供后续 API 请求统一读取，避免直接散用 `import.meta.env`。

本任务只涉及环境变量类型与校验，不改动现有任何业务演示页、路由、Modal、ECharts 等实现，
不新增第三方依赖，不修改 `.env.*` 的实际取值。

## 现状问题

- `.env.development` 与 `.env.production` 均定义 `VITE_API_BASE_URL`，但 `src/env.d.ts`
  仅声明了 `vue` 的 `GlobalComponents` 与 `ComponentCustomProperties`，**没有** `ImportMetaEnv`
  的 augmentation。`vite/client` 默认只提供 `BASE_URL`、`MODE`、`DEV`、`PROD`、`SSR` 等，
  `VITE_API_BASE_URL` 不在其中。
- 当前代码未实际消费 `VITE_API_BASE_URL`（仅 `import.meta.env.BASE_URL`、`DEV` 被使用），
  因此缺乏类型与“该变量是否存在”的保证；一旦后续接入 API 且忘记配置，错误会延迟到
  请求失败时暴露。
- 缺少集中、可扩展的客户端环境变量校验入口，新增变量时容易遗漏校验与类型。

## 推荐方案

### 1. 类型补充（`src/env.d.ts`）

在文件末尾（现有 `declare module 'vue'` 之外、全局作用域）追加 `ImportMetaEnv` 的接口合并：

```ts
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
}
```

`ImportMetaEnv` 由 `vite/client` 在全局声明，`interface` 合并即可扩展；
`ImportMeta.env` 已由 `vite/client` 提供，无需重复声明。

### 2. 校验与配置模块（`src/core/env.ts`）

新增应用级环境配置模块，采用可扩展的 schema 描述：

- 每个变量项含 `required`、`validate?`、`message?` 字段。
- 读取时统一 `trim()`，为空或 `undefined` 且 `required` 为真时抛出
  `[env] 缺少或为空的环境变量: <KEY>`。
- 提供 `validate` 时校验格式，失败抛出 `[env] 环境变量 <KEY> 校验失败: <message>`。
- 导出强类型 `clientEnv`（如 `{ apiBaseUrl: string }`），后续业务统一从这里读取，
  不再直接访问 `import.meta.env`。

当前 schema 仅含 `VITE_API_BASE_URL`，并约定其为合法 URL（用 `new URL()` 校验），
为“等”后续变量预留统一的扩展点。

### 3. 启动装配（`src/main.ts`）

在 `main.ts` 顶部以副作用方式引入环境校验模块：

```ts
import '@/core/env'
```

该模块在导入即执行校验，变量缺失/非法时于应用启动阶段立即抛出清晰错误，
实现 fail-fast；不引入额外运行时开销。若后续需要消费该值，再从 `clientEnv` 读取。

## 接口兼容性

- 不修改任何已有 `import.meta.env` 消费点（`BASE_URL`、`DEV`）的行为。
- 不新增公共组件 props、路由、环境变量或依赖。
- `env.d.ts` 仅追加 `ImportMetaEnv` augmentation，不改变既有 `vue` 模块声明。
- 不改变 `.env.*` 的取值与文件名。

## 新增 / 修改文件清单

新增：

- `src/core/env.ts` —— 环境变量 schema、校验与 `clientEnv` 导出。

修改：

- `src/env.d.ts` —— 追加 `ImportMetaEnv` augmentation。
- `src/main.ts` —— 以副作用引入 `@/core/env` 触发启动校验。
- `TODO.md` —— 将该 TODO 项链接至本计划文档。

## 风险

- **启动失败风险**：校验在 `main.ts` 导入阶段执行，若 `.env` 缺失 `VITE_API_BASE_URL`
  或值非法，应用将无法启动并抛出错误。这正是 fail-fast 的预期行为，且当前两个
  `.env` 均已正确配置，不会在现有环境下触发。
- **类型合并范围**：`ImportMetaEnv` 为全局接口，`interface` 合并影响全项目；
  仅追加单个只读字段，范围可控。
- **非密钥约束**：客户端环境变量对构建后用户可见，本任务不涉及任何密钥，
  符合 AGENTS.md“客户端变量不能存放密钥”的约束。

## 验收与验证方式

1. `pnpm run type-check` 通过（`ImportMetaEnv` 与 `clientEnv` 类型正确，无 `any`）。
2. `pnpm run lint` 通过且默认不修改文件。
3. `pnpm run build-only` 成功（仅可能沿用既有 ECharts ~562 kB 基线告警，
   若构建因该告警失败，报告中明确区分既有失败与新失败）。
4. 手工验证：
   - 临时将 `.env.development` 中的 `VITE_API_BASE_URL` 置空或删除，`pnpm run dev`
     启动时应立即报错且信息清晰；恢复后正常启动。
   - 将 `VITE_API_BASE_URL` 改为非法字符串（如 `not-a-url`），启动应报格式校验错误；
     恢复为合法 URL 后正常。
   - （上述临时改动仅用于验证，验证后还原，不提交。）

## 相关 TODO 处理

- 对应 `TODO.md` 中优先级项“为 `VITE_API_BASE_URL` 等客户端环境变量补充 `ImportMetaEnv`
  类型，并增加缺失值校验”，实现完成后将该项标记为 `[X]` 并保留本计划文档链接。
