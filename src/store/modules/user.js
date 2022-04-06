import { login, logout, getInfo } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter } from '@/router'

const getDefaultState = () => {
  return {
    token: getToken(),
    name: '',
    avatar: ''
  }
}

const state = getDefaultState()

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  }
}

const actions = {
  // 登录
  async login({ commit }, userInfo) {
    const { username, password } = userInfo
    const result = await login({ username: username.trim(), password: password })
    if(result.code == 20000){
      commit('SET_TOKEN', result.data.token)
      setToken(result.data.token)
      return 'ok'
    }else{
      return Promise.reject(new Error('faile'))
    }
  },
  // 获取用户信息
  async getInfo({ commit, state }) {
    const result = await getInfo(state.token)
    if(result.code == 20000){
      commit('SET_NAME', result.data.name)
      commit('SET_AVATAR', result.data.avatar)
    }else{
      return Promise.reject(new Error('faile'))
    }
    // return new Promise((resolve, reject) => {
    //   getInfo(state.token).then(response => {
    //     const { data } = response
    //     if (!data) {
    //       return reject('Verification failed, please Login again.')
    //     }
    //     const { name, avatar } = data
    //     commit('SET_NAME', name)
    //     commit('SET_AVATAR', avatar)
    //     resolve(data)
    //   }).catch(error => {
    //     reject(error)
    //   })
    // })
  },
  // 退出登录
  async logout({ commit, state }) {
    const result = await logout(state.token)
    if (result.code === 20000) {
      removeToken()
      resetRouter()
      commit('RESET_STATE')
    }else{
      return Promise.reject(new Error('faile'))
    }
    // return new Promise((resolve, reject) => {
    //   logout(state.token).then(() => {
    //     removeToken()
    //     resetRouter()
    //     commit('RESET_STATE')
    //     resolve()
    //   }).catch(error => {
    //     reject(error)
    //   })
    // })
  },
  // 移除token
  resetToken({ commit }) {
    return new Promise(resolve => {
      removeToken() // must remove  token  first
      commit('RESET_STATE')
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

