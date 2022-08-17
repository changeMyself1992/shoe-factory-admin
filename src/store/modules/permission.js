import { asyncRoutes, constantRouterMap } from '@/router'

// 根据路由来组合权限结构表
export function getsThePermissionStructureTable(routes, 权限结构表 = []) {
  for (let a = 0; a < routes.length; a++) {
    const route = routes[a]
    const tmp = { ...route }
    if (!tmp.hasOwnProperty('hidden')) {
      if (tmp.children) {
        // 判断是否是 多层次页面
        var count = 0
        for (let i = 0; i < tmp.children.length; i++) {
          const element = tmp.children[i]
          if (!element.hasOwnProperty('hidden')) {
            count += 1
          }
        }
        var isMultilayer = count > 1
        // 代表多层次页面 可能需要继续递归下遍历
        if (isMultilayer) {
          // 是否需要继续递归
          var isContinueRecursing = false
          for (let i = 0; i < tmp.children.length; i++) {
            const element = tmp.children[i]
            if (element.meta.permission && element.meta.permission.length > 0) {
              isContinueRecursing = true
              break
            }
          }

          if (isContinueRecursing) {
            var item = {
              id: 1,
              label: tmp.meta.title,
              children: []
            }
            if (tmp.meta.parentLabel) {
              item.parentLabel = tmp.meta.parentLabel
            }
            权限结构表.push(item)
            getsThePermissionStructureTable(tmp.children, 权限结构表)
          }
        } else {
          // 代表只有一层页面
          item = {
            id: 1,
            label: tmp.meta.title,
            children: (function() {
              var children = []
              for (let i = 0; i < tmp.children[0].meta.permission.length; i++) {
                children.push({
                  id: 1,
                  label: tmp.children[0].meta.describe[i],
                  permission: tmp.children[0].meta.permission[i],
                  parentLabel: tmp.children[0].meta.parentLabel
                })
              }
              return children
            })()
          }
          if (item.children.length > 0) {
            权限结构表.push(item)
          }
        }
      } else {
        // 代表已递归到最大深度
        // （父节点的children）
        var children_note1 = 权限结构表[权限结构表.length - 1].children
        item = {
          id: 1,
          label: tmp.meta.title,
          parentLabel: tmp.meta.parentLabel,
          children: (function() {
            var children = []
            for (let i = 0; i < tmp.meta.permission.length; i++) {
              children.push({
                id: 1,
                label: tmp.meta.describe[i],
                permission: tmp.meta.permission[i],
                parentLabel: tmp.meta.title
              })
            }
            return children
          })()
        }
        if (item.children.length > 0) {
          children_note1.push(item)
        }
      }
    }
  }
}
// 给权限结构表的每个元素id 赋值（供权限管理页面的 tree树形控件使用）
export function assignIdWithLevelOrder(arr, permissionMap) {
  var curr_id = 1 // 初始化当前对象的序列号
  var queue = [] // 创建队列
  queue.push(arr)
  while (queue.length > 0) {
    // 层级遍历队列
    var curr_layer = queue.shift(0)
    if (curr_layer.length > 0) {
      // 处理每一层的节点
      for (let i = 0; i < curr_layer.length; i++) {
        const curr_node = curr_layer[i]
        curr_node['id'] = curr_id // 处理当前节点
        if (curr_node.permission) {
          permissionMap[String(curr_id)] = curr_node.permission
        }

        curr_id += 1
        if (curr_node.hasOwnProperty('children')) {
          // 如果当前节点有子数列，压入队列，等待进入下一层处理即可
          queue.push(curr_node['children'])
        }
      }
    }
  }
}

// 把权限结构表中最深的 permission 和label都返回出来
export function returnsTheDeepestLabel(
  权限结构表,
  permissionsBools = [],
  permissionsBoolDes = []
) {
  for (let i = 0; i < 权限结构表.length; i++) {
    var element = 权限结构表[i]
    if (element.children) {
      returnsTheDeepestLabel(
        element.children,
        permissionsBools,
        permissionsBoolDes
      )
    } else {
      permissionsBools.push(element.permission)
      permissionsBoolDes.push(element.label)
    }
  }
}

// data:json nodeName:节点，arrRes：[] 返回的数据
export function getParentNode(data, nodeName, arrRes, that) {
  if (!data) {
    return arrRes
  }
  for (var i = 0, length = data.length; i < length; i++) {
    const node = data[i]
    if (
      node.label === nodeName &&
      node.parentLabel &&
      !arrRes.includes(node.parentLabel)
    ) {
      arrRes.push(node.parentLabel)
      getParentNode(that.getters['权限结构表'], node.parentLabel, arrRes, that)
      break
    } else {
      if (node.children) {
        getParentNode(node.children, nodeName, arrRes, that)
      }
    }
  }
  return arrRes
}

// 是否有此权限
function hasPermission(titles, route) {
  if (route.meta && route.meta.title) {
    return titles.some(
      title => route.meta.title === title || title === route.meta.boundTitle
    )
  } else {
    return true
  }
}

/**
 * 递归过滤异步路由表，返回符合用户角色权限的路由表
 * @param routes 路由文件中定义的全部动态路由
 * @param 页面权限   {人员管理,财务管理,员工工资}  角色的管理权限对象
 */
export function filterAsyncRoutes(routes, 页面权限) {
  const accessedRoutes = []
  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(页面权限, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, 页面权限)
      }
      accessedRoutes.push(tmp)
    }
  })
  return accessedRoutes
}

// 去除数组重复数据
export function unique(arr) {
  const hash = []
  for (let i = 0; i < arr.length; i++) {
    if (hash.indexOf(arr[i]) === -1) {
      hash.push(arr[i])
    }
  }
  return hash
}

const permission = {
  state: {
    routes: [],
    addRoutes: [],
    权限结构表: [
      {
        id: 1,
        label: '数据看板',
        children: [
          {
            id: 15,
            label: '查看收益柱状图',
            permission: '收益统计可读',
            parentLabel: '数据看板'
          },
          {
            id: 15,
            label: '查看生产订单模块',
            permission: '生产订单统计可读',
            parentLabel: '数据看板'
          },
          {
            id: 15,
            label: '查看销售订单模块',
            permission: '销售订单统计可读',
            parentLabel: '数据看板'
          },
          {
            id: 15,
            label: '查看本月热销产品',
            permission: '本月热销产品统计可读',
            parentLabel: '数据看板'
          },
          {
            id: 15,
            label: '查看客户统计模块',
            permission: '客户统计可读',
            parentLabel: '数据看板'
          },
          {
            id: 15,
            label: '查看采购统计模块',
            permission: '采购供应统计可读',
            parentLabel: '数据看板'
          },
          {
            id: 15,
            label: '查看供应商结算模块',
            permission: '供应商结算统计可读',
            parentLabel: '数据看板'
          }
        ]
      },
      {
        id: 1,
        label: '人员管理',
        children: [
          {
            id: 15,
            label: '查看人员列表',
            permission: '人员管理列表可读',
            parentLabel: '人员管理'
          },
          {
            id: 16,
            label: '添加人员信息/编辑/删除/拒绝',
            permission: '人员管理可写',
            parentLabel: '人员管理'
          }
        ]
      },
      {
        id: 2,
        label: '权限管理',
        children: [
          {
            id: 17,
            label: '查看角色列表',
            permission: '权限管理列表可读',
            parentLabel: '权限管理'
          },
          {
            id: 18,
            label: '新增角色/编辑/删除',
            permission: '权限管理可写',
            parentLabel: '权限管理'
          }
        ]
      },
      {
        id: 3,
        label: '财务功能',
        children: [
          {
            id: 19,
            label: '员工工资',
            parentLabel: '财务功能',
            children: [
              {
                id: 53,
                label: '查看员工个人工资列表',
                permission: '员工工资列表可读',
                parentLabel: '员工工资'
              },
              {
                id: 54,
                label: '查看员工个人工资详情',
                permission: '员工工资详情可读',
                parentLabel: '员工工资'
              },
              {
                id: 56,
                label: '查看部门工资统计列表',
                permission: '部门工资列表可读',
                parentLabel: '员工工资'
              },
              {
                id: 57,
                label: '查看部门工资统计详情',
                permission: '部门工资详情可读',
                parentLabel: '员工工资'
              },
              {
                id: 55,
                label: '点击确认计件记录',
                permission: '员工工资详情可写',
                parentLabel: '员工工资'
              },
              {
                id: 54,
                label: '添加工资抵扣费用',
                permission: '工资抵扣',
                parentLabel: '员工工资'
              },
              {
                id: 58,
                label: '导出Excel工资表',
                permission: '工资列表详情可导出',
                parentLabel: '员工工资'
              }
            ]
          },
          {
            id: 20,
            label: '订单结算',
            parentLabel: '财务功能',
            children: [
              {
                id: 59,
                label: '查看订单结算列表',
                permission: '订单结算列表可读',
                parentLabel: '订单结算'
              },
              {
                id: 60,
                label: '编辑/提交',
                permission: '订单结算管理可写',
                parentLabel: '订单结算'
              }
            ]
          },
          {
            id: 21,
            label: '供应商流水单',
            parentLabel: '财务功能',
            children: [
              {
                id: 61,
                label: '查看供应商流水单列表',
                permission: '供应商流水单列表可读',
                parentLabel: '供应商流水单'
              },
              {
                id: 62,
                label: '查看供应商结算统计列表',
                permission: '供应商结算列表可读',
                parentLabel: '供应商流水单'
              },
              {
                id: 72,
                label: '编辑提交备注',
                permission: '编辑流水单',
                parentLabel: '供应商流水单'
              },
              {
                id: 70,
                label: '添加退货单',
                permission: '添加退货单',
                parentLabel: '供应商流水单'
              },
              {
                id: 71,
                label: '添加送货单',
                permission: '添加送货单',
                parentLabel: '供应商流水单'
              },
              {
                id: 63,
                label: '确认送货单',
                permission: '确认送货单',
                parentLabel: '供应商流水单'
              },
              {
                id: 64,
                label: '结算送货单',
                permission: '结算送货单',
                parentLabel: '供应商流水单'
              },
              {
                id: 65,
                label: '作废送货单',
                permission: '作废送货单',
                parentLabel: '供应商流水单'
              },
              {
                id: 66,
                label: '确认作废送货单',
                permission: '确认作废送货单',
                parentLabel: '供应商流水单'
              },
              {
                id: 67,
                label: '确认退货单',
                permission: '确认退货单',
                parentLabel: '供应商流水单'
              },
              {
                id: 68,
                label: '作废退货单',
                permission: '退货作废退货单',
                parentLabel: '供应商流水单'
              },
              {
                id: 69,
                label: '确认作废退货单',
                permission: '确认退货作废退货单',
                parentLabel: '供应商流水单'
              },
              {
                id: 69,
                label: '添加现结单',
                permission: '添加现结单',
                parentLabel: '供应商流水单'
              },
              {
                id: 69,
                label: '结算现结单',
                permission: '结算现结单',
                parentLabel: '供应商流水单'
              },
              {
                id: 69,
                label: '作废现结单',
                permission: '作废现结单',
                parentLabel: '供应商流水单'
              }
            ]
          }
        ]
      },
      {
        id: 4,
        label: '客户/订单管理',
        children: [
          {
            id: 22,
            label: '客户列表',
            parentLabel: '客户/订单管理',
            children: [
              {
                id: 73,
                label: '查看客户列表',
                permission: '客户列表可读',
                parentLabel: '客户列表'
              },
              {
                id: 74,
                label: '添加客户/编辑/删除',
                permission: '客户管理可写',
                parentLabel: '客户列表'
              }
            ]
          },
          {
            id: 23,
            label: '订单列表',
            parentLabel: '客户/订单管理',
            children: [
              {
                id: 75,
                label: '查看订单列表及详情',
                permission: '订单列表可读',
                parentLabel: '订单列表'
              },
              {
                id: 76,
                label: '添加订单/编辑/删除',
                permission: '订单管理可写',
                parentLabel: '订单列表'
              }
            ]
          }
        ]
      },
      {
        id: 5,
        label: '生产排产',
        children: [
          {
            id: 25,
            label: '查看需要排产的订单/进行中,已完成的生产单及详情',
            permission: '生产单列表可读',
            parentLabel: '生产排产'
          },
          {
            id: 26,
            label: '点击进行排产/编辑/删除/打印',
            permission: '生产单详情可写',
            parentLabel: '生产排产'
          }
        ]
      },
      {
        id: 6,
        label: '生产进度管理',
        children: [
          {
            id: 27,
            label: '查看生产单进度列表及详情',
            permission: '生产单进度管理可读',
            parentLabel: '生产进度管理'
          },
          {
            id: 28,
            label: '操作工序计件',
            permission: '生产单进度管理可写',
            parentLabel: '生产进度管理'
          },
          {
            id: 29,
            label: '点击完成整个生产任务',
            permission: '强制完成生产单可写',
            parentLabel: '生产进度管理'
          }
        ]
      },
      {
        id: 7,
        label: '产品资料库',
        children: [
          {
            id: 30,
            label: '查看产品资料列表及详情',
            permission: '产品资料可读',
            parentLabel: '产品资料库'
          },
          {
            id: 31,
            label: '添加新产品/编辑/删除/复制添加',
            permission: '产品资料可写',
            parentLabel: '产品资料库'
          }
        ]
      },
      {
        id: 8,
        label: '工序管理',
        children: [
          {
            id: 32,
            label: '查看工序列表',
            permission: '工序信息可读',
            parentLabel: '工序管理'
          },
          {
            id: 33,
            label: '添加新的工序/编辑/上升/下降/删除',
            permission: '工序信息可写',
            parentLabel: '工序管理'
          }
        ]
      },
      {
        id: 9,
        label: '部位管理',
        children: [
          {
            id: 34,
            label: '查看部位列表',
            permission: '部位列表可读',
            parentLabel: '部位管理'
          },
          {
            id: 35,
            label: '添加新的部位/编辑/上升/下降/删除',
            permission: '部位列表可写',
            parentLabel: '部位管理'
          }
        ]
      },
      {
        id: 10,
        label: '仓库物料管理',
        children: [
          {
            id: 36,
            label: '仓库报表',
            parentLabel: '仓库物料管理',
            children: [
              {
                id: 78,
                label: '查看仓库报表及详情',
                permission: '仓库物料信息可读',
                parentLabel: '仓库报表'
              },
              {
                id: 79,
                label: '添加物料/复制添加/编辑/删除',
                permission: '仓库物料信息可写',
                parentLabel: '仓库报表'
              }
            ]
          },
          {
            id: 37,
            label: '仓库入库',
            parentLabel: '仓库物料管理',
            children: [
              {
                id: 80,
                label: '查看入库记录及详情',
                permission: '仓库入库可读',
                parentLabel: '仓库入库'
              },
              {
                id: 81,
                label: '手动入库/采购单入库/编辑',
                permission: '仓库入库可写',
                parentLabel: '仓库入库'
              }
            ]
          },
          {
            id: 38,
            label: '仓库出库',
            parentLabel: '仓库物料管理',
            children: [
              {
                id: 82,
                label: '查看出库记录及详情',
                permission: '仓库出库可读',
                parentLabel: '仓库出库'
              },
              {
                id: 83,
                label: '手动出库/生产单出库/编辑',
                permission: '仓库出库可写',
                parentLabel: '仓库出库'
              }
            ]
          }
        ]
      },
      {
        id: 11,
        label: '采购管理',
        children: [
          {
            id: 39,
            label: '采购单列表',
            parentLabel: '采购管理',
            children: [
              {
                id: 84,
                label: '查看采购单列表及详情',
                permission: '采购单列表可读',
                parentLabel: '采购单列表'
              },
              {
                id: 85,
                label: '添加采购单/删除',
                permission: '采购单详情可写',
                parentLabel: '采购单列表'
              }
            ]
          }
        ]
      },
      {
        id: 12,
        label: '供应商管理',
        children: [
          {
            id: 41,
            label: '查看供应商列表及报价单',
            permission: '供应商信息可读',
            parentLabel: '供应商管理'
          },
          {
            id: 42,
            label: '添加供应商/删除',
            permission: '供应商信息可写',
            parentLabel: '供应商管理'
          }
        ]
      },
      {
        id: 13,
        label: '操作日志列表',
        children: [
          {
            id: 43,
            label: '查看操作日志列表',
            permission: '操作日志可读',
            parentLabel: '操作日志列表'
          }
        ]
      },
      {
        label: '小程序数据看板特有的功能',
        id: 14,
        children: [
          { id: 44, label: '查看员工自身工资', permission: '员工自身工资可读' },
          { id: 45, label: '查看部门统计', permission: '部门统计可读' }
        ]
      }
    ],
    permissionMap: {},
    全部的细分权限: [],
    全部的细分权限描述: [],
    页面权限: []
  },
  mutations: {
    SET_ROUTES: (state, routes) => {
      state.addRoutes = routes
      state.routes = constantRouterMap.concat(routes)
      console.log('permission_routes')
      console.log(state.routes)
    },
    // 设置 权限结构表
    setting_Permission_Structure_table: (state, 权限结构表) => {
      state['权限结构表'] = 权限结构表
    },
    // 设置 权限字典
    setting_Permission_map: (state, permissionMap) => {
      state['permissionMap'] = permissionMap
    },
    // 设置 全部的细分权限
    setting_all_subdivide_permission: (state, 全部的细分权限) => {
      state['全部的细分权限'] = 全部的细分权限
    },
    // 设置 全部的细分权限描述
    setting_all_subdivide_permission_des: (state, 全部的细分权限描述) => {
      state['全部的细分权限描述'] = 全部的细分权限描述
    },
    // 设置 全部的页面权限
    setting_all_page_permission: (state, 页面权限) => {
      state['页面权限'] = 页面权限
    }
  },
  actions: {
    /**
     * 设置 权限结构表
     * @param {*} param0
     */
    settingPermissionStructureTable({ commit, state }) {
      // var start_data = new Date()
      // console.log('递归开始时间：', start_data.getTime())

      // // 1.组合PC的权限结构表
      // var 权限结构表 = []
      // getsThePermissionStructureTable(asyncRoutes, 权限结构表)

      // var end_data = new Date()
      // console.log('递归结束时间：', end_data.getTime())
      // console.log('耗时：', end_data.getTime() - start_data.getTime())

      // 使用手写的权限结构表
      var 权限结构表 = state['权限结构表']

      var permissionMap = {}
      assignIdWithLevelOrder(权限结构表, permissionMap)
      // console.log('组合出来的权限结构表：', 权限结构表)
      // console.log('权限的map：', permissionMap)

      var permissionsBools = []
      var permissionsBoolDes = []
      returnsTheDeepestLabel(权限结构表, permissionsBools, permissionsBoolDes)

      commit('setting_Permission_Structure_table', 权限结构表)
      commit('setting_all_subdivide_permission', permissionsBools)
      commit('setting_all_subdivide_permission_des', permissionsBoolDes)
      commit('setting_Permission_map', permissionMap)
    },

    GenerateRoutes({ commit }, data, state) {
      return new Promise(resolve => {
        const { permissions } = data
        console.log('计算动态路由权限******start*****')

        console.log('全部的动态路由：', asyncRoutes)
        var list = []
        for (var key in permissions) {
          if (permissions[key]) list.push(key)
        }
        console.log('当前角色的所有权限bool值：', list)
        // 接下来我们要算出当前角色的页面权限
        var 页面权限 = []
        var start_data = new Date()
        console.log('计算页面权限递归开始时间：', start_data.getTime())
        // console.log('全部的细分权限', this.getters['全部的细分权限'])
        // console.log('全部的细分权限描述', this.getters['全部的细分权限描述'])
        for (let i = 0; i < list.length; i++) {
          const key = list[i]
          var indexs = []
          for (let j = 0; j < this.getters['全部的细分权限'].length; j++) {
            const item = this.getters['全部的细分权限'][j]
            if (item === key) {
              indexs.push(j)
            }
          }

          for (let b = 0; b < indexs.length; b++) {
            const index = indexs[b]
            var array = getParentNode(this.getters['权限结构表'], this.getters['全部的细分权限描述'][index], [], this)
            页面权限 = 页面权限.concat(array)
          }
        }
        // 特殊要求 采购单列表和添加采购单就只想显示一个采购单列表
        // 特殊要求 订单列表和添加订单就只想在权限页面显示一个订单列表
        // ....
        // 所以 添加订单和添加采购单 页面不会配置到权限结构表里面
        // 所以在这纯手动判断添加吧 呵呵呵呵呵呵
        if (list.includes('订单管理可写')) 页面权限.push('添加订单')
        if (list.includes('采购单详情可写')) 页面权限.push('添加采购单')
        if (list.includes('生产单详情可写')) 页面权限.push('待确认计件')
        if (list.includes('订单列表可读')) 页面权限.push('产品简略信息')
        if (list.includes('生产单列表可读')) 页面权限.push('产品简略信息')

        页面权限 = unique(页面权限)
        var end_data = new Date()
        console.log('计算页面权限递归结束时间：', end_data.getTime())
        console.log('耗时：', end_data.getTime() - start_data.getTime())
        console.log('当前角色的页面权限：', 页面权限)
        commit('setting_all_page_permission', 页面权限)
        var accessedRoutes = filterAsyncRoutes(asyncRoutes, 页面权限)

        console.log('最后计算出来要添加的路由：', accessedRoutes)
        commit('SET_ROUTES', accessedRoutes)
        console.log('计算动态路由权限******end*****')
        resolve(accessedRoutes)
      })
    }
  }
}

export default permission
