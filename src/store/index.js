import Vue from 'vue'
import Vuex from 'vuex'
import state from './state'
import getters from './getters'
import mutations from './mutations'
import * as actions from './actions'
import layout from './modules/layout'

Vue.use(Vuex)

// const debug = process.env.NODE_ENV === 'development'

export default new Vuex.Store({
  actions,
  mutations,
  state,
  getters,
  modules: {
    layout
  }
})
