<script setup lang="ts">
import { computed } from 'vue'
import { useClipboard } from '@vueuse/core'
import hljs from '@/core/hljs'
import 'highlight.js/styles/github-dark.css'

const props = withDefaults(
  defineProps<{
    code: string
    language?: string
    showCopy?: boolean
    title?: string
  }>(),
  {
    language: 'xml',
    showCopy: true,
    title: ''
  }
)

const resolvedLanguage = computed(() =>
  hljs.getLanguage(props.language) ? props.language : 'plaintext'
)

const highlighted = computed(() =>
  hljs.highlight(props.code, { language: resolvedLanguage.value }).value
)

const { copy, copied } = useClipboard()
</script>

<template>
  <div class="code-block">
    <div v-if="showCopy || title || language" class="code-block__bar">
      <span class="code-block__title">{{ title || resolvedLanguage }}</span>
      <button
        v-if="showCopy"
        type="button"
        class="code-block__copy"
        @click="copy(code)"
      >
        {{ copied ? '已复制' : '复制' }}
      </button>
    </div>
    <pre class="code-block__pre"><code class="hljs" v-html="highlighted"></code></pre>
  </div>
</template>

<style scoped>
.code-block {
  border: 1px solid #26324a;
  border-radius: 8px;
  overflow: hidden;
  background: #172033;
}

.code-block__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  background: #1f2c44;
  border-bottom: 1px solid #26324a;
}

.code-block__title {
  font-size: 12px;
  color: #8ea2c6;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', monospace;
}

.code-block__copy {
  padding: 2px 10px;
  font-size: 12px;
  color: #cdd9f0;
  background: transparent;
  border: 1px solid #3a4a6b;
  border-radius: 6px;
  cursor: pointer;
}

.code-block__copy:hover {
  background: #2a3a59;
}

.code-block__pre {
  margin: 0;
  padding: 16px;
  overflow-x: auto;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', monospace;
  font-size: 13px;
  line-height: 1.6;
}

.code-block__pre code.hljs {
  padding: 0;
  color: #dbe6ff;
  background: transparent;
}
</style>
