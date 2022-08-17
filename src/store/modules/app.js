import Cookies from 'js-cookie'

const app = {
  state: {
    sidebar: {
      opened: Cookies.get('sidebarStatus') ? !!+Cookies.get('sidebarStatus') : true,
      withoutAnimation: false
    },
    device: 'desktop',
    language: Cookies.get('language') || 'en',
    size: Cookies.get('size') || 'medium',
    netWorkSpeed: '0KB/S',
    // 当前页面的路由对象
    currentPageRoute: ''
  },
  mutations: {
    TOGGLE_SIDEBAR: state => {
      state.sidebar.opened = !state.sidebar.opened
      state.sidebar.withoutAnimation = false
      if (state.sidebar.opened) {
        Cookies.set('sidebarStatus', 1)
      } else {
        Cookies.set('sidebarStatus', 0)
      }
    },
    CLOSE_SIDEBAR: (state, withoutAnimation) => {
      Cookies.set('sidebarStatus', 0)
      state.sidebar.opened = false
      state.sidebar.withoutAnimation = withoutAnimation
    },
    TOGGLE_DEVICE: (state, device) => {
      state.device = device
    },
    SET_LANGUAGE: (state, language) => {
      state.language = language
      Cookies.set('language', language)
    },
    SET_SIZE: (state, size) => {
      state.size = size
      Cookies.set('size', size)
    },
    // 设置 网络速度
    NET_WORK_SPEED: (state, speed) => {
      state['netWorkSpeed'] = speed
    },
    // 设置 当前页面的路由对象
    set_currentPageRoute: (state, currentPageRoute) => {
      state['currentPageRoute'] = currentPageRoute
    }
  },
  actions: {
    toggleSideBar({ commit }) {
      commit('TOGGLE_SIDEBAR')
    },
    closeSideBar({ commit }, { withoutAnimation }) {
      commit('CLOSE_SIDEBAR', withoutAnimation)
    },
    toggleDevice({ commit }, device) {
      commit('TOGGLE_DEVICE', device)
    },
    setLanguage({ commit }, language) {
      commit('SET_LANGUAGE', language)
    },
    setSize({ commit }, size) {
      commit('SET_SIZE', size)
    },
    // 借助img.onload测算网速
    // 好处：没有跨域问题
    // 坏处：要自己测文件大小并提供参数fileSize,且文件必须为图片，文件大小不能灵活控制
    setSpeed({ commit, state }, obj) {
      return new Promise((resolve, reject) => {
        let start = null
        let end = null
        const img = document.createElement('img')
        start = new Date().getTime()
        img.onload = function(e) {
          end = new Date().getTime()
          if ((end - start) === 0) {
            return
          }
          var speed = obj.fileSize / ((end - start) / 1000)
          speed = Number(parseFloat(speed).toFixed(2))
          commit('NET_WORK_SPEED', speed)
          // console.log(11111)
          // console.log(state.netWorkSpeed)
          resolve()
        }
        img.src = obj.imgUrl
        resolve()
      }).catch(err => { throw err })
    },
    updateCurrentPageRoute({ commit }, route) {
      commit('set_currentPageRoute', route)
    }
  }
}

export default app
