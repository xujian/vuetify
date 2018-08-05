export default {
  state: {
    navState: true,
    asideState: false
  },
  getters: {
    navState (state) {
      return state.navState
    },
    asideState (state) {
      return state.asideState
    }
  },
  mutations: {
    setNav (state, val) {
      state.navState = val
    },
    toggleNav (state) {
      state.navState = !state.navState
    },
    setAside (state, val) {
      state.asideState = val
    },
    toggleAside (state) {
      state.asideState = !state.asideState
    },
  }
}
