# Vitest TypeScript 项目引用修复计划

> 状态：计划中（待开发者确认并提交）
>
> 本文档遵循 `AGENTS.md` 的“计划先行”约束。计划阶段只新增本文并更新
> `TODO.md` 链接，不修改测试代码或 TypeScript 配置。

## 1. 目标与范围

修复 `src/**/__tests__/**/*.ts` 在 IDE 中无法解析 `@/*` alias、出现 `TS2307` 的问题，并确保测试
文件及其导入的 Vue 源码可以由仓库的 TypeScript 项目稳定检查。

本次范围：

- 将 `tsconfig.vitest.json` 正确接入根 TypeScript project references。
- 让测试项目继承应用项目的 alias、Vue 编译选项和自动导入声明。
- 保持 Vitest 运行、应用类型检查和生产构建行为不退化。

非目标：

- 不修改 `YlModalHost.test.ts` 中正确的 `@/*` import。
- 不改为相对路径规避配置问题。
- 不新增依赖，不调整测试场景或运行时 Modal 实现。

## 2. 现状与根因

- `@/utils/modal-manager`、`@/components/Modal/YlModalHost.vue` 和
  `@/components/AboutContent.vue` 对应文件均实际存在。
- `tsconfig.app.json` 配置了 `@/* -> ./src/*`，但同时通过
  `exclude: ["src/**/__tests__/*"]` 排除测试文件。
- 根 `tsconfig.json` 只引用 `tsconfig.node.json` 和 `tsconfig.app.json`，没有引用已经存在的
  `tsconfig.vitest.json`。IDE 因而可能把测试文件放进不含 alias 的推断项目，三个 `@/*` import
  同时报 `TS2307`。
- `tsconfig.vitest.json` 当前独立重复 alias，`composite` 为 `false`，无法直接作为根 project
  reference。
- 独立运行 `vue-tsc --project tsconfig.vitest.json --noEmit` 时，alias 已能解析，但导入的 Vue
  文件会报 `ref`、`onMounted` 未定义，说明测试项目没有包含 `auto-imports.d.ts`。
- 既有 `docs/unit-test-framework.md` 第 3.8 节已经要求根配置引用测试项目，但实现提交遗漏了该项；
  本计划用于补齐并验证完整配置，而不是改变原测试架构。

## 3. 推荐方案

### 3.1 调整 `tsconfig.vitest.json`

- 改为继承 `./tsconfig.app.json`，复用 Vue、DOM、`baseUrl` 和 `paths` 配置，避免两份 alias 漂移。
- 覆盖应用项目对测试目录的排除规则。
- 保持 project reference 所需的 `composite: true`，并使用独立的
  `node_modules/.tmp/tsconfig.vitest.tsbuildinfo`。
- `include` 至少覆盖：
  - `env.d.ts`
  - `components.d.ts`
  - `auto-imports.d.ts`
  - `src/**/__tests__/**/*.ts`
- 保留 `vitest/globals`、`node` 和 `vite/client` 类型。
- `vitest.config.ts` 已由 `tsconfig.node.json` 覆盖，不重复归入 DOM 测试项目。

### 3.2 调整根 `tsconfig.json`

在 `references` 中加入：

```json
{ "path": "./tsconfig.vitest.json" }
```

这样 IDE 和 `vue-tsc --build` 都能识别测试文件所属项目，并使用一致的 alias 与声明文件。

### 3.3 保持测试 import 不变

`YlModalHost.test.ts` 第 3–5 行使用仓库统一的 `@/*` alias，语义正确。将其改成多层相对路径只能
掩盖 project reference 缺失，并会让测试代码与应用代码采用两套导入约定，因此不采用。

## 4. 接口兼容性

- 不改变运行时模块、公共 API、路由、依赖或构建产物。
- `@/*` 的含义保持不变，只让测试 TypeScript 项目正确继承该映射。
- `pnpm run type-check` 将开始覆盖测试项目；这属于预期的检查范围增强，可能暴露此前被根项目
  忽略的真实测试类型错误。
- Vitest 仍通过 Vite alias 解析模块，运行机制不变。

## 5. 风险

- **重复项目覆盖**：测试项目若错误包含全部应用源码，会造成重复检查或 tsbuildinfo 冲突。通过
  独立 `tsBuildInfoFile` 和精确 `include` 控制。
- **继承排除规则**：若未显式覆盖 `exclude`，测试文件仍可能被应用配置排除。
- **自动导入类型缺失**：若遗漏 `auto-imports.d.ts`，TS2307 消失后会转为 Vue API 全局名称错误。
- **IDE 缓存**：配置修复后 JetBrains/VS Code 可能需要重新加载 TypeScript 项目；这不是代码
  回归，验收时需区分。

## 6. 验收与验证

- `vue-tsc --project tsconfig.vitest.json --noEmit` 通过。
- `pnpm run type-check` 通过，并确认根 build 实际包含测试项目。
- `pnpm run test:run` 通过全部测试。
- `pnpm run lint` 通过。
- `pnpm run build-only` 通过；既有 chunk size 警告单独记录。
- IDE 重新加载 TypeScript 项目后，`YlModalHost.test.ts` 第 3–5 行不再出现 `TS2307`。
- 不修改三个 import 的路径，证明修复发生在项目配置层。

## 7. 预计修改文件

- 修改：`tsconfig.json`
- 修改：`tsconfig.vitest.json`
- 修改：`TODO.md`（验证通过后勾选本任务）
- 修改：`docs/vitest-typescript-project-reference.md`（实现完成后更新状态）

## 8. 实施步骤

1. 开发者确认并在当前主分支提交本文及 `TODO.md` 链接。
2. 从最新目标分支创建 `codex/` 前缀分支和隔离 Worktree。
3. 调整测试 tsconfig 的继承、声明文件、composite 与 tsbuildinfo。
4. 将测试项目加入根 project references。
5. 运行测试项目类型检查、根类型检查、测试、lint 和构建。
6. 验证 IDE 报错消失；通过后更新计划与 TODO 状态。
7. 使用临时 Codex 身份创建 Conventional Commit，输出报告，不自动合并。

## 9. TODO 处理方式

计划阶段在 `TODO.md` 中新增未完成条目并链接本文。只有配置实现、命令验证及 IDE 验收完成后，才将
其标记为完成。
