import axios from 'axios'
import { Message, MessageBox } from 'element-ui'
import store from '../store'
import { findRoute } from '@/router'

// 创建axios实例
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // api 的 base_url
  timeout: 20000 // 请求超时时间
  // headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
})

function requestConfig(config) {
  // if (store.getters.版本号) {
  config.headers['X-PC-MES-Client-Version'] = store.getters.版本号 // 让每个请求携带自定义token 请根据实际情况自行修改
  // }
  return config
}

function requestError(error) {
  // Do something with request error
  Promise.reject(error)
}

// Any status code that lie within the range of 2xx cause this function to trigger
// Do something with response data
function responseSuccess(response) {
  if (response.status === 200) {
    const res = response.data
    if (res.status === 'OK') {
      return res
    } else if (res.status === 'TOKEN_FAIL') {
      // token失效
      MessageBox.confirm(
        '你已被登出，可以取消继续留在该页面，或者重新登录',
        '确定登出',
        {
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        store.dispatch('LogOut').then(() => {
          location.reload() // 为了重新实例化vue-router对象 避免bug
        })
      })
      return Promise.reject()
    } else if (res.status === 'CLIENT_VERSION_EXPIRED') {
      // 版本更新
      Message({
        message: res.msg,
        type: 'warning',
        duration: 3 * 1000
      })
      return Promise.reject()
    } else if (res.status === 'AUTHORITY_FAIL') {
      // 权限错误
      setTimeout(() => {
        var data = res.data
        var pagePath = ''
        var currentPageRoute = store.getters.currentPageRoute
        // 1.先找出当前的页面绑定的所有权限
        var permission = []
        if (currentPageRoute.meta.permission) {
          //   该用户没有 数据看板>数据看板>查看收益柱状图，相关权限
          pagePath =
            currentPageRoute.meta.parentLabel === currentPageRoute.meta.title
              ? currentPageRoute.meta.parentLabel
              : currentPageRoute.meta.parentLabel +
                '>' +
                currentPageRoute.meta.title
          permission = currentPageRoute.meta.permission
        } else {
          var boundTitle = currentPageRoute.meta.boundTitle
          var title = currentPageRoute.meta.title

          // console.log(1111)
          // console.log(boundTitle)
          var start_data = new Date()
          console.log('findRoute递归开始时间：', start_data.getTime())
          var new_currentPageRoute = null
          new_currentPageRoute = findRoute(boundTitle, new_currentPageRoute)
          var end_data = new Date()
          console.log('findRoute递归结束时间：', end_data.getTime())
          console.log('耗时：', end_data.getTime() - start_data.getTime())
          // console.log(2222)
          // console.log(new_currentPageRoute)

          pagePath = new_currentPageRoute.meta.parentLabel + '>' + title
          permission = new_currentPageRoute.meta.permission
        }
        // 2.找出data和permission的权限交集
        const intersection = permission.filter(function(val) {
          return data.indexOf(val) > -1
        })
        var permissionDes = []
        for (let i = 0; i < intersection.length; i++) {
          const element = intersection[i]
          var index = store.getters['全部的细分权限'].findIndex(item => {
            return item === element
          })
          if (index !== -1) {
            permissionDes.push(store.getters['全部的细分权限描述'][index])
          }
        }
        // console.log(pagePath)
        // console.log(permissionDes)
        var str = ''
        for (let i = 0; i < permissionDes.length; i++) {
          str = str + permissionDes[i] + '，'
        }
        Message({
          message: '该用户没有 ' + pagePath + '>' + str + '相关权限',
          type: 'error',
          duration: 5000
        })
      }, 100)

      return Promise.reject()
    } else if (res.status === 'LOGIN_QRCODE_EXPIRED') {
      // 登录二维码过期请刷新重试
      return res
    } else if (res.status === 'LOGGING_IN') {
      // 等待小程序登录确认
      console.warn(res.msg)
      // return Promise.reject()
    } else {
      // 其他错误
      Message({
        message: res.msg,
        type: 'error',
        duration: 5000
      })
      return Promise.reject()
    }
  }
}

// Any status codes that falls outside the range of 2xx cause this function to trigger
// Do something with response error
function responseError(error) {
  console.error('响应失败：', error)
  console.error(error.message)
  if (error.message.includes('timeout')) {
    Message({
      message: '请求超时，请刷新页面重新尝试！',
      type: 'error',
      duration: 5000
    })
  } else {
    Message({
      message: '系统正在升级维护中，代码：502',
      type: 'error',
      duration: 5000
    })
  }
  return Promise.reject(error.message)
}

// request拦截器
service.interceptors.request.use(requestConfig, requestError)

// response 拦截器
service.interceptors.response.use(responseSuccess, responseError)

export default service
