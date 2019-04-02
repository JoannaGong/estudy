import Vue from 'vue'
import Vuex from 'vuex'

import createPersistedState from "vuex-persistedstate"
import pathify from './pathify'

import user from './modules/user'
import consts from './modules/consts'
import layout from './modules/layout'

Vue.use(Vuex)

const DEBUG = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
  strict: DEBUG,
  plugins: [
    // 同步持久化到 localStorage
    createPersistedState({
      key: 'estudy',
      paths: ['user', 'consts'],
      subscriber(store) {
        // init hook
        store.dispatch('user/checkLogin');
        console.log(111)
        return function(handler) {
          console.log(handler)
          return store.subscribe(handler);
        };
      }
    }),
    pathify.plugin
  ],
  modules: {
    user,
    consts,
    layout,
  },
})
