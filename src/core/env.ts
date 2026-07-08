// 应用级客户端环境变量配置与校验。
// 集中声明必需变量、在应用启动阶段做缺失/格式校验（fail-fast），
// 并导出强类型 clientEnv，供后续 API 请求统一读取，避免散用 import.meta.env。

type EnvRule = {
  required: boolean
  validate?: (value: string) => boolean
  message?: string
}

const ENV_SCHEMA = {
  VITE_API_BASE_URL: {
    required: true,
    validate: (value: string): boolean => {
      try {
        new URL(value)
        return true
      } catch {
        return false
      }
    },
    message: '必须是合法的 URL'
  }
} as const satisfies Record<string, EnvRule>

type EnvKey = keyof typeof ENV_SCHEMA

function readEnv(key: EnvKey): string {
  const raw = import.meta.env[key]
  const value = typeof raw === 'string' ? raw.trim() : ''
  const rule = ENV_SCHEMA[key]

  if (!value) {
    if (rule.required) {
      throw new Error(`[env] 缺少或为空的环境变量: ${key}`)
    }
    return value
  }

  if (rule.validate && !rule.validate(value)) {
    throw new Error(`[env] 环境变量 ${key} 校验失败: ${rule.message ?? ''}`.trim())
  }

  return value
}

export const clientEnv = {
  apiBaseUrl: readEnv('VITE_API_BASE_URL')
}

export type ClientEnv = typeof clientEnv
