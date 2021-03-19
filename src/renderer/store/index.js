import Vue from 'vue'
import Vuex from 'vuex'

import { createPersistedState, createSharedMutations } from 'vuex-electron'

import modules from './modules'

Vue.use(Vuex)

export default new Vuex.Store({
  modules,
  plugins: [
    // vuex可以进行全局的状态管理，但刷新后刷新后数据会消失
    // 我们可以结合本地存储做到数据持久化，也可以通过插件-vuex-persistedstate。
    // createPersistedState(),

    // createSharedMutations()
  ],
  strict: process.env.NODE_ENV !== 'production'
})
