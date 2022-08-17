import Vue from 'vue'
import Router from 'vue-router'

// in development-env not use lazy-loading, because lazy-loading too many pages will cause webpack hot update too slow. so only in production use lazy-loading;
// detail: https://panjiachen.github.io/vue-element-admin-site/#/lazy-loading

Vue.use(Router)

/* Layout */
import Layout from '@/components/layout/Layout'

/**
* hidden: true                   if `hidden:true` will not show in the sidebar(default is false)
* alwaysShow: true               if set true, will always show the root menu, whatever its child routes length
*                                if not set alwaysShow, only more than one route under the children
*                                it will becomes nested mode, otherwise not show the root menu
* redirect: noredirect           if `redirect:noredirect` will no redirect in the breadcrumb
* name:'router-name'             the name is used by <keep-alive> (must set!!!)
* meta : {
    title: 'title'               the name show in subMenu and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar
    breadcrumb: false            if false, the item will hidden in breadcrumb(default is true)
  }
**/
// 这种写法叫做路由懒加载，只有在使用这个component的时候才会加载这个相应的组件，这样写大大减少了初始页面 js 的大小并且能更好的利用游览器的缓存。
export const constantRouterMap = [
  // 首页
  {
    path: '',
    component: Layout,
    redirect: 'dashboard',
    meta: { title: '首页' },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        meta: {
          title: '矩阵未来云MES系统',
          icon: 'dashboard',
          noCache: true,
          affix: true
        },
        component: () => import('@/views/dashBoard/index')
      }
    ]
  },
  // // 帮助中心
  {
    path: '/instructionsForuse',
    name: 'instructionsForuse',
    component: Layout,
    redirect: 'index',
    meta: { title: '帮助中心' },
    children: [
      {
        path: 'index',
        name: 'Guide',
        component: () => import('@/views/instructionsForuse/index'),
        meta: { title: '帮助中心', icon: 'people' }
      }
    ]
  },

  // 登陆页面
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index'),
    hidden: true
  },

  // 找不到页面
  {
    path: '/404',
    component: () => import('@/views/errorPage/404'),
    hidden: true
  },

  // 请重新登陆页面
  {
    path: '/401',
    component: () => import('@/views/errorPage/401'),
    hidden: true
  }
]

export default new Router({
  // mode: 'history', // 后端支持可开
  mode: 'hash',
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRouterMap
})

export const asyncRoutes = [
  // 看板系统
  // {
  //   path: '/kanbanSystem',
  //   name: 'kanbanSystem',
  //   component: Layout,
  //   redirect: 'realTimePlate',
  //   meta: { title: '看板系统' },
  //   children: [
  //     {
  //       path: 'realTimePlate',
  //       name: 'realTimePlate',
  //       component: () => import('@/views/kanbanSystem/realTimePlate'),
  //       meta: { title: '生产单实时看板', icon: 'dashboard' }
  //     }
  //   ]
  // },

  // 数据看板
  {
    path: '/dataBoard',
    name: 'dataBoard',
    component: Layout,
    redirect: 'index',
    meta: { title: '数据看板', parentLabel: null },
    children: [
      {
        path: 'index',
        name: 'board',
        component: () => import('@/views/dataBoard/index'),
        meta: {
          title: '数据看板',
          icon: 'dashboard',
          parentLabel: '数据看板',
          permission: ['收益统计可读', '生产订单统计可读', '销售订单统计可读', '本月热销产品统计可读', '客户统计可读', '采购供应统计可读', '供应商结算统计可读'],
          describe: ['查看收益柱状图', '查看生产订单模块', '查看销售订单模块', '查看本月热销产品', '查看客户统计模块', '查看采购统计模块', '查看供应商结算模块']
        }
      }
    ]
  },

  // 人员管理
  {
    path: '/userManagement',
    name: 'userManagement',
    component: Layout,
    redirect: 'index',
    meta: { title: '人员管理', parentLabel: null },
    children: [
      {
        path: 'index',
        name: 'user',
        component: () => import('@/views/userManagement/index'),
        meta: {
          title: '人员管理',
          icon: 'user',
          parentLabel: '人员管理',
          permission: ['人员管理列表可读', '人员管理可写'],
          describe: ['查看人员列表', '添加人员信息/编辑/删除/拒绝']
        }
      }
    ]
  },

  // 权限管理
  {
    path: '/rightsManagement',
    name: 'rightsManagement',
    component: Layout,
    redirect: 'index',
    meta: { title: '权限管理', parentLabel: null },
    children: [
      {
        path: 'index',
        name: 'rights',
        component: () => import('@/views/rightsManagement/index'),
        meta: {
          title: '权限管理',
          icon: 'quanxian1',
          parentLabel: '权限管理',
          permission: ['权限管理列表可读', '权限管理可写'],
          describe: ['角色权限列表', '新增角色/编辑权限/删除']
        }
      }
    ]
  },

  // 财务功能
  {
    path: '/financialFunctions',
    name: 'financialFunctions',
    component: Layout,
    redirect: 'salarySettle',
    meta: { title: '财务功能', icon: 'caiwu', parentLabel: null },
    children: [
      {
        path: 'salarySettle',
        name: 'salarySettle',
        component: () => import('@/views/financialFunctions/salarySettle'),
        meta: {
          title: '员工工资',
          parentLabel: '财务功能',
          permission: [
            '员工工资列表可读',
            '员工工资详情可读',
            '员工工资详情可写',
            '部门工资列表可读',
            '部门工资详情可读',
            '工资抵扣',
            '工资列表详情可导出'
          ],
          describe: [
            '查看员工个人工资列表',
            '查看员工个人工资详情',
            '点击确认计件记录',
            '查看部门工资统计',
            '查看部门工资统计详情',
            '添加工资抵扣费用',
            '工资导出Excel数据'
          ]
        }
      },
      {
        path: 'salaryDetail',
        name: 'salaryDetail',
        component: () => import('@/views/financialFunctions/salaryDetail'),
        meta: { title: '工资详情', boundTitle: '员工工资' },
        hidden: true
      },
      {
        path: 'departmentalSalaryDetails',
        name: 'departmentalSalaryDetails',
        component: () =>
          import('@/views/financialFunctions/departmentalSalaryDetails'),
        meta: { title: '部门工资详情', boundTitle: '员工工资' },
        hidden: true
      },
      {
        path: 'orderSettle',
        name: 'orderSettle',
        component: () => import('@/views/financialFunctions/orderSettle'),
        meta: {
          title: '订单结算',
          parentLabel: '财务功能',
          permission: ['订单结算列表可读', '订单结算管理可写'],
          describe: ['查看订单结算列表', '编辑/提交/全部提交']
        }
      },
      {
        path: 'supplierDeliveryNote',
        name: 'supplierDeliveryNote',
        component: () =>
          import('@/views/financialFunctions/supplierDeliveryNote'),
        meta: {
          title: '供应商流水单',
          parentLabel: '财务功能',
          permission: [
            '供应商流水单列表可读',
            '供应商结算列表可读',
            '确认送货单',
            '结算送货单',
            '作废送货单',
            '确认作废送货单',
            '确认退货单',
            '退货作废退货单',
            '确认退货作废退货单',
            '添加退货单',
            '添加送货单',
            '结算现结单',
            '添加现结单',
            '作废现结单',
            '编辑流水单'
          ],
          describe: [
            '查看供应商流水单列表',
            '查看供应商结算统计列表',
            '确认送货单',
            '结算送货单',
            '作废送货单',
            '确认作废送货单',
            '确认退货单',
            '作废退货单',
            '确认作废退货单',
            '添加退货单',
            '添加送货单',
            '结算现结单',
            '添加现结单',
            '作废现结单',
            '流水单提交备注(包括 送货单，退货单)'
          ]
        }
      },
      {
        path: 'supplierDeliveryNoteB',
        name: 'supplierDeliveryNoteB',
        component: () =>
          import('@/views/financialFunctions/supplierDeliveryNoteB'),
        meta: { title: '指定的供应商流水单', boundTitle: '供应商流水单' },
        hidden: true
      },
      {
        path: 'supplierAddReturnNote',
        name: 'supplierAddReturnNote',
        component: () =>
          import('@/views/financialFunctions/supplierAddReturnNote'),
        meta: { title: '添加退货单', boundTitle: '供应商流水单' },
        hidden: true
      },
      {
        path: 'supplierAddDeliverNote',
        name: 'supplierAddDeliverNote',
        component: () =>
          import('@/views/financialFunctions/supplierAddDeliverNote'),
        meta: { title: '添加送货单', boundTitle: '供应商流水单' },
        hidden: true
      },
      {
        path: 'supplierAddNowTheStatement',
        name: 'supplierAddNowTheStatement',
        component: () =>
          import('@/views/financialFunctions/supplierAddNowTheStatement'),
        meta: { title: '添加现结单', boundTitle: '供应商流水单' },
        hidden: true
      }
    ]
  },

  // 订单管理
  {
    path: '/orderManagement',
    name: 'orderManagement',
    redirect: 'orderList',
    component: Layout,
    meta: { title: '客户/订单管理', icon: 'dingdan1', parentLabel: null },
    children: [
      {
        path: 'clientList',
        name: 'clientList',
        component: () => import('@/views/orderManagement/clientList'),
        meta: {
          title: '客户列表',
          parentLabel: '客户/订单管理',
          permission: ['客户列表可读', '客户管理可写'],
          describe: ['查看客户列表', '添加客户/查看/修改/删除']
        }
      },
      {
        path: 'orderList',
        name: 'orderList',
        component: () => import('@/views/orderManagement/orderList'),
        meta: {
          title: '订单列表',
          parentLabel: '客户/订单管理',
          permission: ['订单列表可读', '订单管理可写'],
          describe: ['查看订单列表', '编辑/删除']
        }
      },
      {
        path: 'addOrder',
        name: 'addOrder',
        component: () => import('@/views/orderManagement/addOrder'),
        meta: {
          title: '添加订单',
          parentLabel: '客户/订单管理',
          permission: ['订单管理可写'],
          describe: ['确认添加订单']
        }
      }
    ]
  },

  // 生产排产
  {
    path: '/productOrderManagement',
    name: 'productOrderManagement',
    component: Layout,
    redirect: 'productOrderList',
    meta: { title: '生产排产', icon: 'shengchan1', parentLabel: null },
    children: [
      {
        path: 'productOrderList',
        name: 'productOrderList',
        component: () =>
          import('@/views/productOrderManagement/productOrderList'),
        meta: {
          title: '生产排产',
          parentLabel: '生产排产',
          permission: ['生产单列表可读', '生产单详情可写'],
          describe: [
            '查看需要排产的订单/进行中的生产单/已完成的生产单/导出excel表',
            '点击进行排产/编辑/打印/删除/批量修正工序工资'
          ]
        }
      },
      {
        path: 'productOrderQuickOperation',
        name: 'productOrderQuickOperation',
        component: () =>
          import('@/views/productOrderManagement/productOrderQuickOperation'),
        meta: {
          title: '待确认计件',
          parentLabel: '生产排产',
          permission: ['生产单详情可写'],
          describe: ['生产单详情可写']
        }
      },
      {
        path: 'arrangeProductionNote',
        name: 'arrangeProductionNote',
        component: () =>
          import('@/views/productOrderManagement/arrangeProductionNote'),
        meta: { title: '生产单操作', boundTitle: '生产排产' },
        hidden: true
      }
    ]
  },

  // 特殊要求只要有查看生产单和查看订单相关权限 就能查看产品简略信息页面
  {
    path: '/briefProductInformation/index',
    name: 'briefProductInformation',
    component: () => import('@/views/briefProductInformation/index'),
    meta: {
      title: '产品简略信息',
      parentLabel: null,
      permission: [
        '订单列表可读',
        '生产单列表可读'
      ]
    },
    hidden: true
  },

  // 生产进度管理
  {
    path: '/productionScheduleManagement',
    name: 'productionScheduleManagement',
    component: Layout,
    redirect: 'productionSchedule',
    meta: { title: '生产进度管理', parentLabel: null },
    children: [
      {
        path: 'productionSchedule',
        name: 'productionSchedule',
        component: () =>
          import('@/views/productionScheduleManagement/productionSchedule'),
        meta: {
          title: '生产进度管理',
          parentLabel: '生产进度管理',
          icon: 'jindu1',
          permission: [
            '生产单进度管理可读',
            '生产单进度管理可写',
            '强制完成生产单可写'
          ],
          describe: ['查看生产单进度表', '操作工序计件', '点击完成整个生产任务']
        }
      }
    ]
  },

  // 产品管理
  {
    path: '/productManagement',
    name: 'productManagement',
    redirect: '/productManagement/ProductDatabase',
    component: Layout,
    meta: { title: '产品资料库', icon: 'ziliaoku1', parentLabel: null },
    children: [
      {
        path: 'ProductDatabase',
        name: 'ProductDatabase',
        component: () => import('@/views/productManagement/ProductDatabase'),
        meta: {
          title: '产品资料库',
          parentLabel: '产品资料库',
          permission: ['产品资料可读', '产品资料可写'],
          describe: ['查看产品资料库', '添加新产品/编辑/删除/复制添加']
        }
      },
      {
        path: 'product0peration',
        name: 'product0peration',
        component: () => import('@/views/productManagement/product0peration'),
        meta: { title: '产品操作', boundTitle: '产品资料库' },
        hidden: true
      }
    ]
  },

  // 工艺/工序管理
  {
    path: '/craftManagement',
    name: 'craftManagement',
    component: Layout,
    redirect: 'craftDatabase',
    meta: { title: '工序管理', parentLabel: null },
    children: [
      {
        path: 'craftDatabase',
        name: 'craftDatabase',
        component: () => import('@/views/craftManagement/craftDatabase'),
        meta: {
          title: '工序管理',
          icon: 'gongxu1',
          parentLabel: '工序管理',
          permission: ['工序信息可读', '工序信息可写'],
          describe: ['查看工序信息', '添加新的工序/上升/下降/删除']
        }
      }
    ]
  },

  // 部位管理
  {
    path: '/componentManagement',
    name: 'componentManagement',
    component: Layout,
    redirect: 'componentDatabase',
    meta: { title: '部位管理', parentLabel: null },
    children: [
      {
        path: 'componentDatabase',
        name: 'componentDatabase',
        component: () =>
          import('@/views/componentManagement/componentDatabase'),
        meta: {
          title: '部位管理',
          icon: 'buwei1',
          parentLabel: '部位管理',
          permission: ['部位列表可读', '部位列表可写'],
          describe: ['查看部位信息', '添加新的部位/上升/下降/删除']
        }
      }
    ]
  },

  // 仓库管理
  {
    path: '/warehouseManagement',
    name: 'warehouseManagement',
    redirect: 'warehouseList',
    component: Layout,
    meta: { title: '仓库物料管理', icon: 'cangku1', parentLabel: null },
    children: [
      {
        path: 'warehouseList',
        name: 'warehouseList',
        component: () => import('@/views/warehouseManagement/warehouseList'),
        meta: {
          title: '仓库报表',
          parentLabel: '仓库物料管理',
          permission: ['仓库物料信息可读', '仓库物料信息可写'],
          describe: ['查看仓库报表', '添加物料/复制添加/查看/修改/删除']
        }
      },
      {
        path: 'warehouseImport',
        name: 'warehouseImport',
        component: () => import('@/views/warehouseManagement/warehouseImport'),
        meta: {
          title: '仓库入库',
          parentLabel: '仓库物料管理',
          permission: ['仓库入库可读', '仓库入库可写'],
          describe: ['查看入库记录', '手动入库/采购单入库/查看/修改']
        }
      },
      {
        path: 'warehouseExport',
        name: 'warehouseExport',
        component: () => import('@/views/warehouseManagement/warehouseExport'),
        meta: {
          title: '仓库出库',
          parentLabel: '仓库物料管理',
          permission: ['仓库出库可读', '仓库出库可写'],
          describe: ['查看出库记录', '手动出库/生产单出库/查看/修改']
        }
      }
    ]
  },

  // 采购管理
  {
    path: '/purchasingManagement',
    name: 'purchasingManagement',
    redirect: 'purchaseNoteList',
    component: Layout,
    meta: { title: '采购管理', icon: 'caigou1', parentLabel: null },
    children: [
      {
        path: 'purchaseNoteList',
        name: 'purchaseNoteList',
        component: () =>
          import('@/views/purchasingManagement/purchaseNoteList'),
        meta: {
          title: '采购单列表',
          parentLabel: '采购管理',
          permission: ['采购单列表可读', '采购单详情可写'],
          describe: ['查看/打印(采购单)', '删除(采购单)']
        }
      },
      {
        path: 'addPurchaseNote',
        name: 'addPurchaseNote',
        component: () => import('@/views/purchasingManagement/addPurchaseNote'),
        meta: {
          title: '添加采购单',
          parentLabel: '采购管理',
          permission: ['采购单详情可写'],
          describe: ['通过未排产的订单生成采购单/生成采购单']
        }
      }
    ]
  },

  // 供应商管理
  {
    path: '/supplierManagement',
    name: 'supplierManagement',
    redirect: 'supplierList',
    component: Layout,
    meta: { title: '供应商管理', icon: 'gongyinshang1', parentLabel: null },
    children: [
      {
        path: 'supplierList',
        name: 'supplierList',
        component: () => import('@/views/supplierManagement/supplierList'),
        meta: {
          title: '供应商管理',
          parentLabel: '供应商管理',
          permission: ['供应商信息可读', '供应商信息可写'],
          describe: ['查看供应商/查看报价单', '添加供应商/删除']
        }
      },
      {
        path: 'supplierDetail',
        name: 'supplierDetail',
        component: () => import('@/views/supplierManagement/supplierDetail'),
        meta: { title: '供应商详情', boundTitle: '供应商管理' },
        hidden: true
      },
      {
        path: 'supplierPriceDetail',
        name: 'supplierPriceDetail',
        component: () =>
          import('@/views/supplierManagement/supplierPriceDetail'),
        meta: { title: '供应商报价单详情', boundTitle: '供应商管理' },
        hidden: true
      }
    ]
  },

  // 日志管理
  {
    path: '/operationLogManagement',
    name: 'operationLogManagement',
    redirect: 'operationLogList',
    component: Layout,
    meta: { title: '操作日志列表', icon: 'caozuorizhi1', parentLabel: null },
    children: [
      {
        path: 'operationLogList',
        name: 'operationLogList',
        component: () =>
          import('@/views/operationLogManagement/operationLogList'),
        meta: {
          title: '操作日志列表',
          parentLabel: '操作日志列表',
          permission: ['操作日志可读'],
          describe: ['查看操作日志列表']
        }
      }
    ]
  },

  { path: '*', redirect: '/404', hidden: true }
]

// 获取所有父路由名称
export function findRoute(
  title,
  res = null,
  allRoutes = [...constantRouterMap, ...asyncRoutes]
) {
  if (res) {
    return res
  }
  for (let i = 0; i < allRoutes.length; i++) {
    var route = allRoutes[i]
    if (route.meta && route.meta.title && route.meta.title === title) {
      res = route
      return route
    } else {
      if (route.children) {
        res = findRoute(title, res, route.children)
        if (res) {
          return res
        }
      }
    }
  }
  return res
}
