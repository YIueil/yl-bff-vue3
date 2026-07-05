# SVG 转 Iconify JSON 可复现流程计划

## 目标与范围

将现有 `src/scripts/svg-json-generate.ts` 纳入明确、可复现的 pnpm 工作流，使开发者可以从仓库任意工作目录执行固定命令，将两类 SVG 源文件稳定生成为对应的 Iconify JSON：

- `src/assets/images/svg/single/` 生成 `src/assets/json/singleJsonFile.json`，并将有效颜色统一转换为 `currentColor`。
- `src/assets/images/svg/multi/` 生成 `src/assets/json/multiJsonFile.json`，保留原始颜色。

本任务包括：

- 增加明确的 TypeScript runner 开发依赖。
- 在 `package.json` 中增加语义清晰的 pnpm script。
- 基于脚本文件自身位置解析输入、输出路径，消除对当前工作目录的依赖。
- 更新 README 中的生成说明。
- 重新生成并核对两份 Iconify JSON。

本任务不调整应用启动时的图标注册方式、不改变图标命名规则，也不重构 Iconify 展示页面。

## 现状问题

- `package.json` 没有 SVG 生成命令，README 仅说明“通过 node 执行”脚本。
- 项目使用 Node.js 20，而脚本是 TypeScript 文件；当前依赖中没有声明可直接执行 TypeScript 的 runner，因此文档中的方式不可复现。
- 脚本路径使用 `../assets/...` 相对路径，实际解析基于进程当前工作目录。从仓库根目录执行时会指向错误位置。
- 输出直接覆盖 JSON 文件，但没有通过固定命令验证连续执行的结果是否稳定。

## 推荐方案

1. 将 `tsx` 作为开发依赖，通过 pnpm 锁定 runner 版本，并避免为单个构建脚本引入额外编译产物。
2. 在 `package.json` 增加 `icons:generate` 脚本，由 pnpm 调用 `tsx src/scripts/svg-json-generate.ts`。
3. 在生成脚本中使用 `import.meta.url`、`fileURLToPath()` 和 `node:path`，以脚本文件所在目录为基准计算 SVG 输入目录及 JSON 输出文件。
4. 保留现有单色、多色处理语义；提取重复处理逻辑时保持错误处理行为清晰，遇到无效图标时输出错误并从集合移除。
5. 使用 UTF-8 明确写入两份 JSON，并避免输出完整图标集合到终端，只保留必要的生成结果摘要。
6. 更新 README，记录唯一推荐命令 `pnpm run icons:generate`、输入输出位置及单色/多色差异。

依赖与锁文件通过 `pnpm add -D tsx` 更新，不手工编辑 `pnpm-lock.yaml`。

## 接口兼容性

- 新增的 `icons:generate` 是构建辅助命令，不影响现有应用公共 API。
- 两份 JSON 的文件名、Iconify prefix `custom` 和应用侧 `addCollection()` 调用保持不变。
- 现有 `custom:*` 图标名称应保持兼容；若 Iconify 工具在重新生成时规范化数据排列，只接受不改变图标集合和渲染语义的差异。
- Node.js 与 pnpm 版本继续以仓库约定为准。

## 风险

- 新 runner 会改变开发依赖及锁文件，需要确认其 Node.js 20 兼容性。
- `@iconify/tools` 的导出顺序或优化结果可能导致较大的 JSON diff，需要核对图标数量、名称和连续两次生成的稳定性。
- SVG 文件名包含空格和大写字母，路径与图标名称规范化行为必须保持现状。
- 若无效 SVG 当前被静默移除，生成成功可能掩盖资源缺失；实现时应保留明确错误输出并让无法完成整体生成的异常导致命令失败。

## 验收与验证

- 在仓库根目录执行 `pnpm run icons:generate` 成功生成两份 JSON。
- 从仓库之外使用 `pnpm --dir <仓库路径> run icons:generate` 仍能成功，证明路径不依赖调用方当前工作目录。
- 连续执行两次生成命令后，两份 JSON 内容无新增差异。
- 核对单色、多色集合的 prefix、图标数量和图标名称，确认没有意外丢失。
- 执行 `pnpm run type-check`。
- 执行 `pnpm run lint`。
- 执行 `pnpm run build-only`，并区分既有 chunk size 警告与本任务引入的问题。

## TODO 处理方式

- 计划阶段在 README 的自定义 SVG 说明下新增本计划链接，并保持任务未完成状态。
- 实现完成且上述验收通过后，将对应 TODO 标记为完成。
- 若验证发现图标集合存在非预期变化，不标记完成，并在实施报告中记录阻塞项和差异。

