import { defineAsyncComponent } from 'vue'
import AsyncLoading from '@/components/Error/AsyncLoading.vue'
import AsyncError from '@/components/Error/AsyncError.vue'

type ViewModule = { default: unknown }

/**
 * 包裹路由懒加载，统一提供加载占位与加载失败重试能力。
 *
 * - `delay` 内完成加载时不展示占位，避免闪烁。
 * - `timeout` 超时或 `loader` 抛错时进入失败分支。
 * - 偶发失败（如 chunk fetch 失败）自动重试，最多 `MAX_RETRY` 次；
 *   重试耗尽后渲染 `AsyncError`，由用户手动点击“重试”重新触发 `loader`。
 */
const LOAD_DELAY = 200
const LOAD_TIMEOUT = 10000
const MAX_RETRY = 2

export function loadView(loader: () => Promise<ViewModule>) {
  return defineAsyncComponent({
    loader,
    loadingComponent: AsyncLoading,
    errorComponent: AsyncError,
    delay: LOAD_DELAY,
    timeout: LOAD_TIMEOUT,
    onError(_error, retry, fail, attempts) {
      if (attempts <= MAX_RETRY) {
        retry()
      } else {
        fail()
      }
    }
  })
}
