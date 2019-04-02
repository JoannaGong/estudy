import { make } from 'vuex-pathify'
import { api } from '@/utils/api'

const setToken = token => {
  api.defaults.headers.common['token'] = token;
}

const state = {
  loggedIn: false,
  info: {
    name: '',
    full_name: '',
    email: '',
    avatar: '',
    is_admin: false,
  }
}

const getters = {
  ...make.getters(state),
}

const mutations = {
  ...make.mutations(state),
  login (state, data) {
    if (data) {
      state.loggedIn = true;
      state.info = data;
      setToken(data.token);
    }
  },
  logout (state) {
    state.loggedIn = false;
    state.info = {};
    setToken('');
  },
  updateToken (state, token) {
    state.info.token = token;
    setToken(token);
  },
}

const actions = {
  checkLogin ({ state, commit, dispatch }) {
    if (state.loggedIn) {
      // 必须提前设置，否则 Dashboard 组件自动加载时会没有 token
      setToken(state.info.token);
      // 鉴于验证速度比较快，保留登录状态，否则之后还要恢复 router
      // commit('loggedIn', false);
      api.post('/auth/refreshToken', {}, { _silent: true })
        .then(token => {
          commit('updateToken', token);
          // commit('loggedIn', true);
        }).catch(() => {
          dispatch('logout');
        })
    }
  },
  login ({ commit }, form) {
    return api.post('/auth/login', form)
      .then(resp => {
        commit('login', resp);
      });
  },
  logout ({ commit }) {
    commit('logout');
  },
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}