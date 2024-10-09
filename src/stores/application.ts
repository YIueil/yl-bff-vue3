import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useApplicationStore = defineStore('application', () => {
  const darkMode = ref(false)

  return { darkMode }
})
