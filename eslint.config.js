import pluginVue from 'eslint-plugin-vue'
import { withVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

export default withVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{js,mjs,cjs,jsx,ts,mts,cts,tsx,vue}']
  },
  {
    name: 'app/files-to-ignore',
    ignores: [
      '**/.worktree/**',
      '**/coverage/**',
      '**/dist/**',
      '**/dist-ssr/**',
      '**/node_modules/**'
    ]
  },
  pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,
  {
    name: 'app/project-rules',
    rules: {
      '@typescript-eslint/no-explicit-any': 'off'
    }
  },
  skipFormatting
)
