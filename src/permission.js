import router from './router'
import store from './store'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { getToken } from '@/utils/auth' // getToken from cookie

NProgress.configure({ showSpinner: false })// NProgress configuration

router.beforeEach(async(to, from, next) => {
  NProgress.start()
  // 如果有token并且已经绑定了企业
  if (getToken() && store.getters.对应企业unique_id) {
    // 如果已经是登陆状态，他还要去登陆界面，那么把他定位都首页
    if (to.path === '/login') {
      next({ path: '/' })
      NProgress.done()
    } else {
      // 判断是否进行了工厂初始化
      if (!store.getters['whetherFactoryInitializationHasTakenPlace']) {
        try {
          var start_data = new Date()
          console.log('登录开始时间：***********************************', start_data.getTime())
          // 生成权限结构表
          await store.dispatch('settingPermissionStructureTable')
          // 1.获取用户信息
          await store.dispatch('GetUserInfo')
          // 2.获取用户的权限
          await store.dispatch('GetUserJurisdiction')
          // 3.动态生成路由，并做添加
          const permissions = store.getters['管理权限']
          const role = store.getters['管理角色']
          const accessRoutes = await store.dispatch('GenerateRoutes', { permissions, role })
          await router.addRoutes(accessRoutes)

          // 从这往下 是在做初始化工厂配置相关工作
          var request = []
          // 1.获取配码配置信息
          request.push(store.dispatch('getSizeConfigInfo'))
          // 2.获取生产单打印配置信息
          request.push(store.dispatch('getProductionNotePrintConfigInfo'))
          // 3.获取物料的标签
          request.push(store.dispatch('getMaterialTagName'))
          // 4. 获取产品的标签
          request.push(store.dispatch('getProductTagName'))
          // 5. 获取订单的标签
          request.push(store.dispatch('getOrderTagName'))
          // 6. 获取供应商的标签
          request.push(store.dispatch('getSupplierTagName'))
          // 7. 获取客户的标签
          request.push(store.dispatch('getClientTagName'))
          await Promise.all(request)

          // 8. 获取订单标签的标签名对应的所有标签值
          store.dispatch('getsAllLabelValuesCorrespondingToTheLabelNameOfTheOrderLabel')
          // 9. 获取产品标签的标签名对应的所有标签值
          store.dispatch('getsAllLabelValuesCorrespondingToTheLabelNameOfTheProductLabel')
          // 最后把工厂初始化状态设置为true
          store.dispatch('setFactoryInitStatus')
          var end_data = new Date()
          console.log('登录结束时间：***********************************', end_data.getTime())
          console.log('耗时：', end_data.getTime() - start_data.getTime())
          next({ ...to, replace: true })
        } catch (error) {
          console.error(error)
          // remove token and go to login page to re-login
          await store.dispatch('LogOut')
          next(`/login?redirect=${to.path}`)
          NProgress.done()
        }
      } else {
        // 保存当前页面路由对象
        store.dispatch('updateCurrentPageRoute', to)
        // // 默认延迟两秒把侧边栏关闭
        // setTimeout(() => {
        //   store.dispatch('closeSideBar', false)
        // }, 2000)
        store.dispatch('setSpeed', { imgUrl: 'https://mes.westmatrix.cn/mPJ2iq.jpg', fileSize: 9 })
        if (store.getters['管理权限']['人员管理可写'] && store.getters['管理权限']['人员管理列表可读']) {
          store.dispatch('filterApplyUser')
        }
        if (store.getters['管理权限']['供应商流水单列表可读'] && store.getters['管理权限']['供应商流水单列表可读']) {
          store.dispatch('filterToBeConfirmedSupplierTransactions')
        }
        if (store.getters['管理权限']['生产单列表可读'] && store.getters['管理权限']['生产单详情可写']) {
          store.dispatch('filterUnconfirmedStaffRecord')
        }

        document.title = to.meta.title
        next()
      }
    }
  } else {
    await store.dispatch('LogOut')
    // 如果没有token,或者没有绑定了企业,那就让他去登录页面
    if (to.path === '/login') next()
    else {
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  NProgress.done() // finish progress bar
})
