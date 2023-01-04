import { defineStore } from 'pinia'

export const useGlobalStore = defineStore({
  id: 'global',
  state: () => ({
    loading: false,
    drawer_right: false
  }),
  getters: {
    isLoading: (state) => state.loading
  },
  actions: {
    openLoading() {
      this.loading = true
    },
    closeLoading() {
      this.loading = false
    },
    openDrawerRight() {
      this.drawer_right = true
    },
    closeDrawerRight() {
      this.drawer_right = false
    },
  }
})
