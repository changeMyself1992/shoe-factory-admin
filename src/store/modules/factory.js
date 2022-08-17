import {
  get_size_config_info,
  get_production_note_print_config_info,
  get_order_tag_names,
  order_tags_auto_complete,
  filter_unconfirmed_staff_record
} from '@/api/ordersForProductionScheduling'
import { get_material_tag_names } from '@/api/warehouseProcurement'
import {
  get_product_tag_names,
  product_tags_auto_complete
} from '@/api/maintenanceOfProcessPartsOfProductLibrary'
import {
  get_supplier_tag_names,
  filter_supplier_transactions
} from '@/api/supplier'
import { get_client_tag_names } from '@/api/customer'
import { filter_user } from '@/api/personnelAndAuthorityManagement.js'
import { getToken } from '@/utils/auth'

const user = {
  state: {
    版本号: 'v-0.4.0', // 目前版本号1.0.0
    fileUploadUrl: process.env.VUE_APP_BASE_API + 'utils/upload_file',
    whetherFactoryInitializationHasTakenPlace: false, // 是否已进行过工厂初始化
    配码数组: JSON.parse(localStorage.getItem('配码数组')),
    生产单打印配置信息: JSON.parse(localStorage.getItem('生产单打印配置信息')),
    物料的标签: JSON.parse(localStorage.getItem('物料的标签')),
    产品的标签: JSON.parse(localStorage.getItem('产品的标签')),
    订单的标签: JSON.parse(localStorage.getItem('订单的标签')),
    供应商的标签: JSON.parse(localStorage.getItem('供应商的标签')),
    客户的标签: JSON.parse(localStorage.getItem('客户的标签')),
    待审核员工数: 0,
    待确认送货数: 0,
    待确认员工计件数: 0,

    空的供应商送货单: {
      工厂unique_id: '',
      供应商unique_id: '',
      收货单位经手人手机: '',
      供应商名称: '',
      送货单: []
    },
    空的供应商送货单元素: {
      货号: '',
      名称及规格: '',
      单位: '',
      数量: 0,
      单价: 0,
      总价格: 0,
      备注: ''
    },

    空的供应商退货单: {
      工厂unique_id: '',
      供应商unique_id: '',
      收货单位经手人手机: '',
      供应商名称: '',
      退货单: []
    },
    空的供应商退货单元素: {
      货号: '',
      名称及规格: '',
      单位: '',
      最大可退货数量: 0,
      数量: 0,
      单价: 0,
      总价格: 0,
      备注: ''
    },

    产品的空部位元素: {
      unique_id: '',
      部位名称: '',
      物料数量: 0,
      使用物料: {
        unique_id: '',
        物料编号: '',
        tags: {},
        单位: '',
        参考市场单价: 0,
        备注: '',
        供应商列表: [],
        所选供应商信息: {}
      }
    },
    空的产品结构: {
      tags: {
        // '楦型',
        // '款号',
        // .....
      },
      unique_id: '',
      产品图片列表: [],
      备注: '',
      产品编号: '',
      成本估算: '暂无',
      更新时间: '',
      部位详情: []
    },
    订单包含的产品空元素: {
      产品信息: {
        tags: {
          // '楦型',
          // '款号',
          // .....
        },
        unique_id: '',
        产品图片列表: [],
        备注: '',
        产品编号: '',
        成本估算: '',
        更新时间: '',
        部位详情: []
      },
      品牌: '',
      客户产品编号: '',
      结算情况: {
        产品订单实收: 0,
        产品订单应收: 0,
        发货数量: 0,
        发货时间: '',
        备注: '',
        结算状态: '未发货'
      },
      配码数量: {
        已经排产数量: 0,
        总数: 0,
        配码: [
          // {
          //   国标码: 220,
          //   尺码: 34,
          //   已排产数量: 0,
          //   目标数量: 0
          // }
        ]
      }
    },
    空的物料结构: {
      unique_id: '',
      tags: {},
      物料编号: '',
      单位: '',
      对应产品列表: [],
      备注: '',
      供应商列表: [],
      供应商历史信息: [],
      仓库剩余数量: 0,
      更新时间: ''
    },
    空的生产单结构: {
      unique_id: '',
      完成百分比: 0,
      对应订单: {
        // tags: {},
        // unique_id: '',
        // 订单编号: '',
        // 客户信息: '',
        // 上传图片列表: [],
        // 订单日期: '',
        // 交货日期: '',
        // 订单备注: ''
      },
      排产产品: {
        产品信息: {},
        排产配码数量: {
          总排产数: 0,
          配码: [
            // {国标码: 220,尺码: 34,目标数量: 20}
          ]
        }
      },
      更新时间: '',
      生产单二维码: '',
      生产单备注: '',
      生产单工序信息: [
        // {
        //   员工计件: [],
        //   员工计件配码总计数:{
        //     总完成数: 0,
        //   },
        //   配码:[
        //     {尺码: 34, 国标码: 220, 目标数量: 20, 完成数量: 0}
        //     ......
        //   ],
        //   工序信息:{unique_id: "开料", 工序名称: "开料"},
        //   工序工资: 0,
        //   配码完成总计数:{
        //     总完成数: 0,
        //     配码:[
        //       {尺码: 34, 国标码: 220, 目标数量: 20, 完成数量: 0}
        //       ......
        //     ]
        //   }
        // }
      ],
      生产单时间: '',
      生产单状态: '', // 新生产单,生产中,完成,
      生产单编号: ''
    },
    空员工结构: {
      绑定手机号: '',
      管理角色: '',
      工作状态: '',
      负责工序: [],
      个人信息: {
        姓名: '',
        性别: '',
        出生日期: null,
        身份证号: '',
        地址: '',
        身份证正面照片: '',
        身份证反面照片: ''
      },
      银行卡信息: {
        账户开户姓名: '',
        开户行: '',
        银行账号: '',
        银行卡照片: ''
      }
    },
    物料的空的供应商信息: {
      供应商物料名称: '',
      供应商价格: 0,
      仓库剩余数量: 0,
      说明: '',
      unique_id: '',
      名称: '',
      更新时间: ''
    },
    空的订单结构: {
      tags: {},
      订单编号: '',
      上传图片列表: ['', ''],
      交货日期: '',
      包含的产品: [],
      客户信息: {},
      订单备注: '暂时无备注',
      订单日期: '',
      订单状态: '新订单',
      已排产生产单列表: []
    },
    空的客户结构: {
      tags: {},
      名称: '',
      电话: '',
      地址: '',
      备注: ''
    },
    // 订单的每一个标签所对应的所有可选项
    theFullValueOfTheOrderLabel: JSON.parse(
      localStorage.getItem('theFullValueOfTheOrderLabel')
    ),
    // 产品的每一个标签所对应的所有可选项
    allOptionsForEachLabelOfTheProduct: JSON.parse(
      localStorage.getItem('allOptionsForEachLabelOfTheProduct')
    )
  },

  mutations: {
    // 设置 工厂初始化装填
    FACTOR_INIT_STATUS: (state, status) => {
      state['whetherFactoryInitializationHasTakenPlace'] = status
    },
    // 设置 配码数组
    PEIMA_ARRAY: (state, 配码_数组) => {
      state['配码数组'] = 配码_数组
    },
    // 设置 生产单打印配置信息
    PRODUCT_NOTE_PRINT_CONFIG_INFO: (state, 生产单打印配置信息) => {
      state['生产单打印配置信息'] = 生产单打印配置信息
    },
    // 设置 物料的标签
    MATERIAL_INFO: (state, 物料的标签) => {
      state['物料的标签'] = 物料的标签
    },
    // 设置 产品的标签
    PRODUCT_INFO: (state, 产品的标签) => {
      state['产品的标签'] = 产品的标签
    },
    // 设置 订单的标签
    ORDER_INFO: (state, 订单的标签) => {
      state['订单的标签'] = 订单的标签
    },
    // 设置 供应商的标签
    SUPPLIER_INFO: (state, 供应商的标签) => {
      state['供应商的标签'] = 供应商的标签
    },
    // 设置客户的标签
    CLIENT_TAGS: (state, 客户的标签) => {
      state['客户的标签'] = 客户的标签
    },
    // 设置待审核员工数
    number_of_employees_to_be_audited: (state, 待审核员工数) => {
      state['待审核员工数'] = 待审核员工数
    },
    // 设置待确认送货数
    to_confirm_the_delivery_number: (state, 待确认送货数) => {
      state['待确认送货数'] = 待确认送货数
    },
    // 设置待确认员工计件数
    number_of_employees_to_be_confirmed: (state, 待确认员工计件数) => {
      state['待确认员工计件数'] = 待确认员工计件数
    },
    // 设置 订单的每一个标签所对应的所有可选项
    the_Full_Value_Of_The_Order_Label: (state, theFullValueOfTheOrderLabel) => {
      state['theFullValueOfTheOrderLabel'] = theFullValueOfTheOrderLabel
    },
    // 设置 产品的每一个标签所对应的所有可选项
    all_Options_For_Each_Label_Of_The_Product: (
      state,
      allOptionsForEachLabelOfTheProduct
    ) => {
      state[
        'allOptionsForEachLabelOfTheProduct'
      ] = allOptionsForEachLabelOfTheProduct
    }
  },

  actions: {
    /**
     * 设置工厂初始化状态
     * @param {*} param0
     */
    setFactoryInitStatus({ commit, state }) {
      commit('FACTOR_INIT_STATUS', true)
    },

    /**
     * 获取配码配置信息
     * @param {*} param0
     */
    getSizeConfigInfo({ commit, state }) {
      return new Promise((resolve, reject) => {
        var obj = {
          login_token: getToken()
        }
        get_size_config_info(obj)
          .then(res => {
            var data = res.data
            data = data.map(item => {
              for (const key in item) {
                item[key] = String(item[key])
              }
              return item
            })
            commit('PEIMA_ARRAY', data)
            localStorage.setItem('配码数组', JSON.stringify(data))
            resolve(res)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    /**
     * 更新配码配置信息
     * @param {*} param0
     */
    updateSizeConfigInfo({ commit, state }) {
      commit('PEIMA_ARRAY', JSON.parse(localStorage.getItem('配码数组')))
    },

    /**
     * 获取生产单打印配置信息
     * @param {*} param0
     */
    getProductionNotePrintConfigInfo({ commit, state }) {
      return new Promise((resolve, reject) => {
        var obj = {
          login_token: getToken()
        }
        get_production_note_print_config_info(obj)
          .then(res => {
            const data = res.data
            commit('PRODUCT_NOTE_PRINT_CONFIG_INFO', data)
            localStorage.setItem('生产单打印配置信息', JSON.stringify(data))
            resolve(res)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    /**
     * 更新生产单打印配置信息
     * @param {*} param0
     */
    updateProductionNotePrintConfigInfo({ commit, state }) {
      commit(
        'PRODUCT_NOTE_PRINT_CONFIG_INFO',
        JSON.parse(localStorage.getItem('生产单打印配置信息'))
      )
    },

    /**
     * 获取物料标签信息
     * @param {*} param0
     */
    getMaterialTagName({ commit, state }) {
      return new Promise((resolve, reject) => {
        var obj = {
          login_token: getToken()
        }
        get_material_tag_names(obj)
          .then(res => {
            const data = res.data
            commit('MATERIAL_INFO', data)
            localStorage.setItem('物料的标签', JSON.stringify(data))
            resolve(res)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    /**
     * 更新物料标签信息
     * @param {*} param0
     */
    updateMaterialTagName({ commit, state }) {
      commit('MATERIAL_INFO', JSON.parse(localStorage.getItem('物料的标签')))
    },

    /**
     * 获取产品标签信息
     * @param {*} param0
     */
    getProductTagName({ commit, state }) {
      return new Promise((resolve, reject) => {
        var obj = {
          login_token: getToken()
        }
        get_product_tag_names(obj)
          .then(res => {
            const data = res.data
            commit('PRODUCT_INFO', data)
            localStorage.setItem('产品的标签', JSON.stringify(data))
            resolve(res)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    /**
     * 更新产品标签信息
     * @param {*} param0
     */
    updateProductTagName({ commit, state }) {
      commit('PRODUCT_INFO', JSON.parse(localStorage.getItem('产品的标签')))
    },

    /**
     * 获取订单标签信息
     * @param {*} param0
     */
    getOrderTagName({ commit, state }) {
      return new Promise((resolve, reject) => {
        var obj = {
          login_token: getToken()
        }
        get_order_tag_names(obj)
          .then(res => {
            const data = res.data
            commit('ORDER_INFO', data)
            localStorage.setItem('订单的标签', JSON.stringify(data))
            resolve(res)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    /**
     * 更新订单标签信息
     * @param {*} param0
     */
    updateOrderTagName({ commit, state }) {
      commit('ORDER_INFO', JSON.parse(localStorage.getItem('订单的标签')))
    },

    /**
     * 获取供应商标签信息
     * @param {*} param0
     */
    getSupplierTagName({ commit, state }) {
      return new Promise((resolve, reject) => {
        var obj = {
          login_token: getToken()
        }
        get_supplier_tag_names(obj)
          .then(res => {
            const data = res.data
            commit('SUPPLIER_INFO', data)
            localStorage.setItem('供应商的标签', JSON.stringify(data))
            resolve(res)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    /**
     * 获取供应商标签信息
     * @param {*} param0
     */
    updateSupplierTagName({ commit, state }) {
      commit('SUPPLIER_INFO', JSON.parse(localStorage.getItem('供应商的标签')))
    },

    /**
     * 获取客户标签信息
     * @param {*} param0
     */
    getClientTagName({ commit, state }) {
      return new Promise((resolve, reject) => {
        var obj = {
          login_token: getToken()
        }
        get_client_tag_names(obj)
          .then(res => {
            const data = res.data
            commit('CLIENT_TAGS', data)
            localStorage.setItem('客户的标签', JSON.stringify(data))
            resolve(res)
          })
          .catch(error => {
            reject(error)
          })
      })
    },

    /**
     * 获取订单标签的标签名对应的所有标签值
     * @param {*} param0
     */
    async getsAllLabelValuesCorrespondingToTheLabelNameOfTheOrderLabel({
      commit,
      state
    }) {
      var login_token = getToken()
      var base_tags = {}
      for (let i = 0; i < state.订单的标签.length; i++) {
        var tagName = state.订单的标签[i]
        base_tags[tagName] = ''
      }

      var request = []
      for (let j = 0; j < state.订单的标签.length; j++) {
        tagName = state.订单的标签[j]
        var post_data = {
          login_token: login_token,
          base_tags: base_tags,
          target_tag_name: tagName
        }
        request.push(order_tags_auto_complete(post_data))
      }

      var responses = await Promise.all(request)
      var theFullValueOfTheOrderLabel = {}
      for (let i = 0; i < responses.length; i++) {
        var response = responses[i]
        var suggest_value_list = []
        for (var index in response.data) {
          suggest_value_list.push({
            text: response.data[index],
            value: response.data[index]
          })
        }
        // 获取订单标签的标签名对应的所有标签值
        theFullValueOfTheOrderLabel[
          state.订单的标签[i] + '-Valus'
        ] = suggest_value_list
      }
      commit('the_Full_Value_Of_The_Order_Label', theFullValueOfTheOrderLabel)
      localStorage.setItem(
        'theFullValueOfTheOrderLabel',
        JSON.stringify(theFullValueOfTheOrderLabel)
      )
    },
    /**
     * 更新订单标签的标签名对应的所有标签值
     * @param {*} param0
     */
    updateAllLabelValuesCorrespondingToTheLabelNameOfTheOrderLabel({
      commit,
      state
    }) {
      commit(
        'the_Full_Value_Of_The_Order_Label',
        JSON.parse(localStorage.getItem('theFullValueOfTheOrderLabel'))
      )
    },

    /**
     * 获取产品标签的标签名对应的所有标签值
     * @param {*} param0
     */
    async getsAllLabelValuesCorrespondingToTheLabelNameOfTheProductLabel({
      commit,
      state
    }) {
      var login_token = getToken()
      var base_tags = {}
      for (let i = 0; i < state.产品的标签.length; i++) {
        var tagName = state.产品的标签[i]
        base_tags[tagName] = ''
      }

      var request = []
      for (let j = 0; j < state.产品的标签.length; j++) {
        tagName = state.产品的标签[j]
        var post_data = {
          login_token: login_token,
          base_tags: base_tags,
          target_tag_name: tagName
        }
        request.push(product_tags_auto_complete(post_data))
      }

      var responses = await Promise.all(request)
      var allOptionsForEachLabelOfTheProduct = {}
      for (let i = 0; i < responses.length; i++) {
        var response = responses[i]
        var suggest_value_list = []
        for (var index in response.data) {
          suggest_value_list.push({
            text: response.data[index],
            value: response.data[index]
          })
        }
        // 获取产品标签的标签名对应的所有标签值
        allOptionsForEachLabelOfTheProduct[
          state.产品的标签[i] + '-Valus'
        ] = suggest_value_list
      }
      commit(
        'all_Options_For_Each_Label_Of_The_Product',
        allOptionsForEachLabelOfTheProduct
      )
      localStorage.setItem(
        'allOptionsForEachLabelOfTheProduct',
        JSON.stringify(allOptionsForEachLabelOfTheProduct)
      )
    },
    /**
     * 获取产品标签的标签名对应的所有标签值
     * @param {*} param0
     */
    updateAllLabelValuesCorrespondingToTheLabelNameOfTheProductLabel({
      commit,
      state
    }) {
      commit(
        'all_Options_For_Each_Label_Of_The_Product',
        JSON.parse(localStorage.getItem('allOptionsForEachLabelOfTheProduct'))
      )
    },

    /**
     * 获取待审核员工数
     * @param {*} param0
     */
    filterApplyUser({ commit, state }) {
      return new Promise((resolve, reject) => {
        var parameter = {
          login_token: getToken(),
          pagination: {
            page: 1,
            limit: 1
          },
          工作状态: ['待确认']
        }
        filter_user(parameter)
          .then(res => {
            commit('number_of_employees_to_be_audited', res.total_count)
            localStorage.setItem('待审核员工数', res.total_count)
            resolve(res)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    updateApplyUser({ commit, state }) {
      commit(
        'number_of_employees_to_be_audited',
        localStorage.getItem('待审核员工数')
      )
    },

    /**
     * 获取待确认送货数
     * @param {*} param0
     */
    filterToBeConfirmedSupplierTransactions({ commit, state }) {
      return new Promise((resolve, reject) => {
        var parameter = {
          login_token: getToken(),
          交易状态: ['未确认'],
          pagination: {
            page: 1,
            limit: 1
          },
          sort: {
            更新时间: -1
          }
        }
        filter_supplier_transactions(parameter)
          .then(res => {
            commit('to_confirm_the_delivery_number', res.total_count)
            localStorage.setItem('待确认送货数', res.total_count)
            resolve(res)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    updateToBeConfirmedSupplierTransactions({ commit, state }) {
      commit(
        'to_confirm_the_delivery_number',
        localStorage.getItem('待确认送货数')
      )
    },

    /**
     * 待确认员工计件数
     * @param {*} param0
     */
    filterUnconfirmedStaffRecord({ commit, state }) {
      return new Promise((resolve, reject) => {
        var parameter = {
          login_token: getToken(),
          pagination: {
            page: 1,
            limit: 1
          }
        }
        filter_unconfirmed_staff_record(parameter)
          .then(res => {
            commit('number_of_employees_to_be_confirmed', res.data.pagination.total)
            localStorage.setItem('待确认员工计件数', res.data.pagination.total)
            resolve(res)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    updateUnconfirmedStaffRecord({ commit, state }) {
      commit(
        'number_of_employees_to_be_confirmed',
        localStorage.getItem('待确认员工计件数')
      )
    }

  }
}

export default user
