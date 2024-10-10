import { ref, watch } from 'vue'
import { defineStore } from 'pinia'

export const useApplicationStore = defineStore('application', () => {
  const darkMode = ref(false)

  //region 主题样式变更
  const setDarkMode = (mode: boolean) => {
    darkMode.value = mode
  }
  const classList = document.documentElement.classList
  const setClass = (dark: boolean) => classList[dark ? 'add' : 'remove']('dark')
  watch(darkMode, newValue => {
    setClass(newValue)
  })
  //endregion
  return { darkMode, setDarkMode }
})
