
import { bind_company_after_login, get_user_info_by_login_token, generate_login_token } from '@/api/loginAndLogoutTool'
import { get_role_authority_by_id } from '@/api/personnelAndAuthorityManagement'
import { getToken, setToken, removeToken } from '@/utils/auth'

const user = {
  state: {
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    token: getToken(),
    对应企业unique_id: localStorage.getItem('对应企业unique_id'), // 用户当前选中的企业
    对应企业名称: localStorage.getItem('对应企业名称'),
    对应企业unique_id列表: JSON.parse(localStorage.getItem('对应企业unique_id列表')),
    对应企业名称列表: JSON.parse(localStorage.getItem('对应企业名称列表')),
    unique_id: JSON.parse(localStorage.getItem('unique_id')), // 用户的unique_id
    个人信息: JSON.parse(localStorage.getItem('个人信息')),
    更新时间: JSON.parse(localStorage.getItem('更新时间')),
    管理角色: [], // 这里必须是空数组才行，刷新页面的时候 vue的路由会清空，所以这里必须是空数组让他重新的去动态加载路由
    绑定手机号: JSON.parse(localStorage.getItem('绑定手机号')),
    银行卡信息: JSON.parse(localStorage.getItem('银行卡信息')),
    管理权限: JSON.parse(localStorage.getItem('管理权限')),
    phoneNumberMemory: JSON.parse(localStorage.getItem('phoneNumberMemory'))// 手机号记忆
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    // 设置该用户当前选中的企业
    SET_UNIQUE_ID: (state, enterprise) => {
      state['对应企业unique_id'] = enterprise
    },
    // 设置选中企业的名称
    SET_ENTERPRISE_NAME: (state, name) => {
      state['对应企业名称'] = name
    },
    // 设置该用户绑定的所有企业id列表
    SET_ENTERPRISE_List: (state, enterpriseList) => {
      state['对应企业unique_id列表'] = enterpriseList
    },
    // 设置该用户绑定的所有企业名称列表
    SET_ENTERPRISE_NAME_List: (state, enterpriseList) => {
      state['对应企业名称列表'] = enterpriseList
    },
    // 用户的唯一id
    UNIQUE_ID: (state, unique_id) => {
      state['unique_id'] = unique_id
    },
    // 设置 个人信息
    PERSONAL_INFORMATION: (state, personal_information) => {
      state['个人信息'] = personal_information
    },
    // 设置 更新时间
    UPDATE_TIME: (state, update_time) => {
      state['更新时间'] = update_time
    },
    // 设置 管理角色
    MANAGEMENT_ROLE: (state, management_role) => {
      state['管理角色'] = management_role
    },
    // 设置 绑定手机号
    BIND_PHONE_NUMBER: (state, bind_phone_number) => {
      state['绑定手机号'] = bind_phone_number
    },
    // 设置 银行卡信息
    BANK_CARD_INFORMATION: (state, bank_card_information) => {
      state['银行卡信息'] = bank_card_information
    },
    // 设置 管理权限
    MANAGEMENT_PERMISSIONS: (state, management_permissions) => {
      state['管理权限'] = management_permissions
    },
    // 设置手机号记忆
    PHONE_NUMBER_MEMORY: (state, phoneNumberMemory) => {
      state['phoneNumberMemory'] = phoneNumberMemory
    }
  },

  actions: {

    setToken({ commit }, login_token) {
      setToken(login_token)
      commit('SET_TOKEN', login_token)
    },

    /**
     * 生成token
     * @param {*} param0
     * @param {*} obj
     */
    GenerateToken({ commit }, obj) {
      return new Promise((resolve, reject) => {
        generate_login_token(obj).then(res => {
          res = res.data
          console.log('生成token:')
          console.log(res.login_token)
          console.log('生成对应企业unique_id列表:')
          console.log(res['对应企业unique_id列表'])
          console.log('生成对应企业名称列表:')
          console.log(res['对应企业名称列表'])

          setToken(res.login_token)
          commit('SET_TOKEN', res.login_token)

          localStorage.setItem('对应企业unique_id列表', JSON.stringify(res['对应企业unique_id列表']))
          commit('SET_ENTERPRISE_List', res['对应企业unique_id列表'])

          localStorage.setItem('对应企业名称列表', JSON.stringify(res['对应企业名称列表']))
          commit('SET_ENTERPRISE_NAME_List', res['对应企业名称列表'])

          resolve(res)
        }).catch(err => {
          reject(err)
        })
      })
    },

    /**
     * 登录后绑定企业
     * @param {*} param0
     * @param {*} selectEnterprise
     */
    BindEnterpriseInfo({ commit, state }, enterprise) {
      return new Promise((resolve, reject) => {
        var obj = {
          login_token: state.token,
          对应企业unique_id: enterprise.value
        }
        return bind_company_after_login(obj).then(res => {
          localStorage.setItem('对应企业unique_id', enterprise.value)
          commit('SET_UNIQUE_ID', enterprise.value)

          localStorage.setItem('对应企业名称', enterprise.label)
          commit('SET_ENTERPRISE_NAME', enterprise.label)
          resolve(res)
        }).catch(error => {
          reject(error)
        })
      })
    },

    setEnterpriseUniqueId({ commit, state }, enterprise) {
      commit('SET_UNIQUE_ID', '')
    },

    /**
     *  获取用户信息
     * @param {*} param0
     */
    GetUserInfo({ commit, state }) {
      return new Promise((resolve, reject) => {
        var obj = { login_token: state.token }
        get_user_info_by_login_token(obj).then(res => {
          const data = res.data
          commit('UNIQUE_ID', data.unique_id)
          localStorage.setItem('unique_id', JSON.stringify(data.unique_id))

          commit('PERSONAL_INFORMATION', data['个人信息'])
          localStorage.setItem('个人信息', JSON.stringify(data['个人信息']))

          commit('UPDATE_TIME', data['更新时间'])
          localStorage.setItem('UPDATE_TIME', JSON.stringify(data['更新时间']))

          var roles = []
          roles.push(data['管理角色'])
          commit('MANAGEMENT_ROLE', roles)
          localStorage.setItem('管理角色', JSON.stringify(roles))

          commit('BIND_PHONE_NUMBER', data['绑定手机号'])
          localStorage.setItem('绑定手机号', JSON.stringify(data['绑定手机号']))

          commit('BANK_CARD_INFORMATION', data['银行卡信息'])
          localStorage.setItem('银行卡信息', JSON.stringify(data['银行卡信息']))

          resolve(res)
        }).catch(error => {
          reject(error)
        })
      })
    },

    /**
     * 获取管理角色详细信息
     * @param {*} param0
     */
    GetUserJurisdiction({ commit, state }) {
      return new Promise((resolve, reject) => {
        var obj = {
          unique_id: state.unique_id,
          login_token: state.token
        }
        get_role_authority_by_id(obj).then(res => {
          const data = res.data
          commit('MANAGEMENT_PERMISSIONS', data['管理权限'])
          localStorage.setItem('管理权限', JSON.stringify(data['管理权限']))
          resolve(res)
        }).catch(error => {
          reject(error)
        })
      })
    },

    /**
     * 获取管理角色详细信息
     * @param {*} param0
     */
    cacheThePhoneNumber({ commit, state }, loginForm) {
      return new Promise((resolve, reject) => {
        commit('PHONE_NUMBER_MEMORY', loginForm['手机号'])
        localStorage.setItem('phoneNumberMemory', JSON.stringify(loginForm['手机号']))
        resolve()
      })
    },

    /**
     * 退出登录
     * @param {*} param0
     */
    LogOut({ commit, state }) {
      return new Promise((resolve, reject) => {
        removeToken()
        // 1.判断有没有手机号缓存
        if (JSON.parse(localStorage.getItem('phoneNumberMemory'))) {
          var phoneNumberMemory = JSON.parse(localStorage.getItem('phoneNumberMemory'))
          localStorage.clear()
          commit('PHONE_NUMBER_MEMORY', phoneNumberMemory)
          localStorage.setItem('phoneNumberMemory', phoneNumberMemory)
        } else {
          localStorage.clear()
        }
        resolve()
      })
    }
  }
}

export default user
