import Vue from 'vue'

import 'normalize.css/normalize.css' // A modern alternative to CSS resets

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale/lang/zh-CN' // 默认中文

import '@/styles/index.scss' // global css

import App from './App'
import store from './store'
import router from './router'

import '@/icons' // icon
import '@/permission' // permission control

require('@/utils/jQueryPrint')// 这是个jquery的打印插件
import _ from 'lodash'// 这是个js的工具库 封装了各种方法 具体去查API
import * as filters from './filters' // global filters

Vue.use(ElementUI, { locale })
Object.defineProperty(Vue.prototype, '$_', { value: _ })

// register global utility filters
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})
Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})

