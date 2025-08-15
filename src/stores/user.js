import config from '@/config'
import storage from '@/utils/storage'
import constant from '@/utils/constant'
import { login, logout, getInfo } from '@/api/login'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { defineStore } from 'pinia'
const baseUrl = config.baseUrl

export const useUserStore = defineStore('user', {
  state: () => ({
    token: getToken(),
    name: storage.get(constant.name),
    avatar: storage.get(constant.avatar),
    roles: storage.get(constant.roles),
    permissions: storage.get(constant.permissions),
  }),

  actions: {
    // Set token
    SET_TOKEN(token) {
      this.token = token
    },
    // Set name
    SET_NAME(name) {
      this.name = name
      storage.set(constant.name, name)
    },
    // Set avatar
    SET_AVATAR(avatar) {
      this.avatar = avatar
      storage.set(constant.avatar, avatar)
    },
    // Set roles
    SET_ROLES(roles) {
      this.roles = roles
      storage.set(constant.roles, roles)
    },
    // Set permissions
    SET_PERMISSIONS(permissions) {
      this.permissions = permissions
      storage.set(constant.permissions, permissions)
    },

    // Login
    Login(userInfo) {
      const username = userInfo.username
      const password = userInfo.password
      const code = userInfo.code
      const uuid = userInfo.uuid
      return new Promise((resolve, reject) => {
        login(username, password, code, uuid)
          .then((res) => {
            setToken(res.data.access_token)
            this.SET_TOKEN(res.data.access_token)
            resolve()
          })
          .catch((error) => {
            reject(error)
          })
      })
    },

    // Get user info
    GetInfo() {
      return new Promise((resolve, reject) => {
        getInfo()
          .then((res) => {
            const user = res.user
            // const avatar = (user == null || user.avatar == "" || user.avatar == null) ? "@/static/images/profile.jpg" : baseUrl + user.avatar
            /* cloud */
            const avatar = user == null || user.avatar == '' || user.avatar == null ? '/static/images/profile.jpg' : user.avatar
            const username = user == null || user.userName == '' || user.userName == null ? '' : user.userName
            if (res.roles && res.roles.length > 0) {
              this.SET_ROLES(res.roles)
              this.SET_PERMISSIONS(res.permissions)
            } else {
              this.SET_ROLES(['ROLE_DEFAULT'])
            }
            this.SET_NAME(username)
            this.SET_AVATAR(avatar)
            resolve(res)
          })
          .catch((error) => {
            reject(error)
          })
      })
    },

    // Logout
    LogOut() {
      return new Promise((resolve, reject) => {
        logout(this.token)
          .then(() => {
            this.SET_TOKEN('')
            this.SET_ROLES([])
            this.SET_PERMISSIONS([])
            removeToken()
            storage.clean()
            resolve()
          })
          .catch((error) => {
            reject(error)
          })
      })
    },
  },

  getters: {
    // Renamed getters to avoid naming conflicts with state properties
    getToken: (state) => state.token,
    getAvatar: (state) => state.avatar,
    getName: (state) => state.name,
    getRoles: (state) => state.roles,
    getPermissions: (state) => state.permissions,
  },

  // Update persistence configuration
  persist: {
    // H5 and App platforms can use localStorage
    // H5 will automatically switch to sessionStorage when set to true
    // App will use storage space directly
    enabled: true,

    // Configure storage options
    strategies: [
      {
        key: 'user-store', // storage key
        storage: 'local', // storage type: local = localStorage, session = sessionStorage
      },
    ],
  },
})
