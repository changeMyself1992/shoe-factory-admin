<template>
  <div class="order-condition-query">
    <el-form ref="form" class="module-b" :model="form" label-position="left">
      <el-card class="box-card">
        <div slot="header" class="clearfix header">
          <b>{{ title }}</b>
        </div>

        <div class="info-box">
          <!-- 订单的动态标签(自动补全) -->
          <div class="row-1">
            <div class="item-0">
              <b>订单信息：</b>
            </div>
            <div v-if="order_tag_names.length>0" class="item-1">
              <el-form-item
                v-for="tag_name in order_tag_names"
                :key="tag_name"
                class="item"
                :label="tag_name"
              >
                <el-autocomplete
                  v-model.trim="order_tag_filter[tag_name]"
                  :fetch-suggestions="((queryString, callback)=>tagQueryAutoCompleteSearch(queryString,callback,tag_name))"
                  placeholder="自动补全"
                  @input="mode==='orderQuery'?debouncedHandleOrderSearch():debouncedHandleOrderSettleSearch()"
                  @select="(obj)=> handleSelectTag(obj, tag_name,order_tag_filter)"
                />
                <div class="tag-box">
                  <el-tag
                    v-for="(item_a,index_a) in order_tag_filter[tag_name+'数组']"
                    :key="index_a"
                    class="tag"
                    closable
                    @close="handleCloseTag(item_a,order_tag_filter[tag_name+'数组'])"
                  >{{ item_a }}</el-tag>
                </div>
              </el-form-item>
            </div>
          </div>

          <div class="row-2">
            <el-form-item class="item-1" prop="订单编号" label="订单编号:" label-width="80px">
              <el-input v-model.trim="form['订单编号']" placeholder="单行输入" />
            </el-form-item>

            <el-form-item
              v-if="isShowSettlementStatus"
              class="item-2"
              prop="结算状态"
              label="结算状态:"
              label-width="90px"
            >
              <el-select v-model="form.结算状态" multiple placeholder="请选择">
                <el-option
                  v-for="payment_status in 全部的结算状态"
                  :key="payment_status.状态名称"
                  :label="payment_status.状态名称"
                  :value="payment_status.状态名称"
                />
              </el-select>
            </el-form-item>

            <el-form-item
              v-if="isShowOrderStatus"
              class="item-3"
              prop="订单状态"
              label="订单状态:"
              label-width="80px"
            >
              <el-select v-model.trim="form['订单状态']" placeholder="请选择">
                <el-option
                  v-for="statusValue in orderStatus"
                  :key="statusValue"
                  :label="statusValue"
                  :value="statusValue"
                />
              </el-select>
            </el-form-item>

            <el-form-item
              class="item-5"
              prop="deliveryTimeQuantum"
              label="交货时间段:"
              label-width="100px"
            >

              <el-date-picker
                v-model.trim="form.deliveryTimeQuantum"
                class="picker"
                type="daterange"
                unlink-panels
                range-separator="-"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
              />
            </el-form-item>

            <el-form-item class="item-4" prop="orderTimeQuantum" label="订单时间段:" label-width="100px">
              <template>
                <el-radio v-model.trim="radio" label="1">本月</el-radio>
                <el-radio v-model.trim="radio" label="2">过去三个月</el-radio>
                <el-radio v-model.trim="radio" label="3">过去半年</el-radio>
                <el-radio v-model.trim="radio" label="4">自定义</el-radio>
              </template>
              <el-date-picker
                v-model.trim="form.orderTimeQuantum"
                class="picker"
                type="daterange"
                unlink-panels
                range-separator="-"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                :disabled="radio!=='4'"
              />
            </el-form-item>
          </div>

          <div class="row-3">
            <div class="item-0">
              <b>包含的产品信息：</b>
            </div>
            <!-- 产品的动态标签(自动补全) -->
            <div v-if="product_tag_names.length>0" class="item-1">
              <el-form-item
                v-for="tag_name in product_tag_names"
                :key="tag_name"
                class="item"
                :label="tag_name"
              >
                <template v-if="mode==='orderQuery'">
                  <el-checkbox v-model="tagcheckbox[tag_name]" @change="changeTagCheck">精确匹配</el-checkbox>
                </template>
                <el-autocomplete
                  v-model.trim="product_tag_filter[tag_name]"
                  :fetch-suggestions="((queryString, callback)=>productTagQueryAutoCompleteSearch(queryString,callback,tag_name))"
                  placeholder="自动补全"
                  @input="mode==='orderQuery'?debouncedHandleOrderSearch():debouncedHandleOrderSettleSearch()"
                  @select="(obj)=> handleSelectTag(obj, tag_name,product_tag_filter)"
                />
                <div class="tag-box">
                  <el-tag
                    v-for="(item_a,index_a) in product_tag_filter[tag_name+'数组']"
                    :key="index_a"
                    class="tag"
                    closable
                    @close="handleCloseTag(item_a,product_tag_filter[tag_name+'数组'])"
                  >{{ item_a }}</el-tag>
                </div>
              </el-form-item>
            </div>
          </div>

          <el-form-item class="row-4">
            <el-button class="btn" type="primary" @click="search()">搜索</el-button>
            <el-button class="btn" type="primary" @click="clearFilterCondition()">清空条件</el-button>
          </el-form-item>
        </div>
      </el-card>
    </el-form>
    <el-dialog
      title="导出Excel中"
      :visible.sync="centerDialogVisible"
      width="30%"
      center
    >
      <el-progress
        class="excleprogress"
        :text-inside="true"
        :stroke-width="16"
        :percentage="excleprogressValue"
      />
    </el-dialog>
  </div>
</template>

<script>
import { order_tags_auto_complete } from '@/api/ordersForProductionScheduling'
import { product_tags_auto_complete } from '@/api/maintenanceOfProcessPartsOfProductLibrary'
import { parseTime, deepClone } from '@/utils'
import { showLoading, hideLoading } from '@/utils/loading'
import {
  filter_order,
  order_settle_stats,
  order_settle_filter_items
} from '@/api/ordersForProductionScheduling'
import { isArray } from 'util'
var date = new Date()
var y = date.getFullYear()
var m = date.getMonth()
var d = date.getDate()
export default {
  props: {
    currentPage: {
      type: Number,
      default: 1
    },
    pageSize: {
      type: Number,
      default: 50
    },
    // 搜索按钮点击回调
    initPagination: {
      type: Function,
      default() {
        return
      }
    },
    // 查询前回调父组件
    callBackTheParentComponentBeforeTheQuery: {
      type: Function,
      default() {
        return
      }
    },
    // 查询后回调父组件
    callbackAfterConditionQuery: {
      type: Function,
      default() {
        return
      }
    },
    // 是否展示订单状态选择框
    isShowOrderStatus: {
      type: Boolean,
      default: true
    },
    // 多个订单状态
    multipleOrderStatus: {
      type: Array,
      default: function() {
        return ['新订单', '排产中']
      }
    },
    // 是否展示结算状态选择框
    isShowSettlementStatus: {
      type: Boolean,
      default: false
    },
    // 清空条件之后回调父组件
    callbackAfterConditionClear: {
      type: Function,
      default() {
        return
      }
    },
    title: {
      type: String,
      default: '订单条件查询'
    },
    // orderQuery(订单查询)， orderSettlementEnquiry(订单结算查询)
    mode: {
      type: String,
      default: 'orderQuery'
    }
  },
  data() {
    return {
      // 导出excel的进度
      excleprogressValue: 0,
      centerDialogVisible: false,
      form: {
        订单编号: null,
        订单状态: null,
        orderTimeQuantum: [new Date(y, m - 6, d), new Date(y, m, d)],
        deliveryTimeQuantum: [],
        结算状态: []
      },
      全部的结算状态: [
        {
          状态名称: '未发货'
        },
        {
          状态名称: '发货中'
        },
        {
          状态名称: '已发货'
        },
        {
          状态名称: '结算中'
        },
        {
          状态名称: '已结算'
        },
        {
          状态名称: '订单取消'
        },
        {
          状态名称: '订单无法收款'
        }
      ],
      order_tag_names: [],
      order_tag_filter: {},
      product_tag_names: [],
      product_tag_filter: {},
      // 订单列表的表头列表
      tableHeader: [],
      // 订单列表的表头列表对应属性
      tableProps: [],
      // 订单列表的内容信息
      tableData: [],
      // 订单结算统计
      settlementOfStatistical: {},
      // 总条目数
      total: 0,
      // 条件搜索的订单状态
      orderStatus: ['新订单', '排产中', '完成'],
      // 记录订单查询的条件
      order_filter_parameter: {},
      // 交货时间默认选择过去半年
      radio: '3',
      // 是否精确匹配
      tagcheckbox: []
    }
  },
  computed: {},
  watch: {
    radio: function(newVal, oldVal) {
      this.form.orderTimeQuantum = []
      var firstDay = null
      var lastDay = null
      switch (newVal) {
        case '1':
          // 本月
          firstDay = new Date(y, m, 1)
          lastDay = new Date(y, m + 1, 0, 23, 59, 59)
          this.form.orderTimeQuantum[0] = firstDay
          this.form.orderTimeQuantum[1] = lastDay
          break
        case '2':
          // 过去三个月
          firstDay = new Date(y, m - 3, d)
          lastDay = new Date(y, m, d)
          this.form.orderTimeQuantum[0] = firstDay
          this.form.orderTimeQuantum[1] = lastDay
          break
        case '3':
          // 过去半年
          firstDay = new Date(y, m - 6, d)
          lastDay = new Date(y, m, d)
          this.form.orderTimeQuantum[0] = firstDay
          this.form.orderTimeQuantum[1] = lastDay
          break
      }
    },
    'form.orderTimeQuantum': function(newVal, oldVal) {
      if (newVal.length > 1) {
        if (this.mode === 'orderSettlementEnquiry') {
          this.orderSettleFilterItems()
        } else {
          this.filterOrder()
        }
      }
    }
  },
  created() {
    this.debouncedHandleOrderSearch = this.$_.debounce(this.filterOrder, 1000)
    this.debouncedHandleOrderSettleSearch = this.$_.debounce(
      this.orderSettleFilterItems,
      1000
    )

    this.getOrderTagName()
    this.getProductTagNames()
    if (this.mode === 'orderSettlementEnquiry') {
      this.orderSettleFilterItems()
    }
  },
  mounted() {},
  methods: {
    // 搜索按钮点击要把父组件的 pageSize 和 currentPage 设置为默认
    search() {
      showLoading()
      this.$emit('initPagination')
      hideLoading()
    },
    // 精确匹配是否开启
    changeTagCheck() {
      this.filterOrder()
    },
    // 按条件查询订单
    async filterOrder() {
      var data1 = new Date()
      var parameter = {
        login_token: this.$store.getters.token,
        pagination: {
          page: parseInt(this.currentPage),
          limit: parseInt(this.pageSize)
        },
        订单编号: this.form['订单编号'] || null,
        订单日期_上限: this.form.orderTimeQuantum[1]
          ? parseTime(new Date(this.form.orderTimeQuantum[1]))
          : null,
        订单日期_下限: this.form.orderTimeQuantum[0]
          ? parseTime(new Date(this.form.orderTimeQuantum[0]))
          : null,
        交货日期_上限: this.form.deliveryTimeQuantum[1]
          ? parseTime(new Date(this.form.deliveryTimeQuantum[1]))
          : null,
        交货日期_下限: this.form.deliveryTimeQuantum[0]
          ? parseTime(new Date(this.form.deliveryTimeQuantum[0]))
          : null,
        sort: { 更新时间: -1 }
      }

      var new_order_tag_filter = deepClone(this.order_tag_filter)
      for (const key in new_order_tag_filter) {
        var element = new_order_tag_filter[key]
        // 如果element是一个数组的话，判断长度
        if (isArray(element) && element.length === 0) {
          delete new_order_tag_filter[key]
        }
        if (isArray(element) && element.length > 0) {
          var element_temp = deepClone(element)
          delete new_order_tag_filter[key]
          var new_key = key.replace('数组', '')
          new_order_tag_filter[new_key] = element_temp
        }
      }
      parameter.tags = new_order_tag_filter

      var new_product_tag_filter = deepClone(this.product_tag_filter)
      for (const key in new_product_tag_filter) {
        element = new_product_tag_filter[key]
        // 如果element是一个数组的话，判断长度
        if (isArray(element) && element.length === 0) {
          delete new_product_tag_filter[key]
        }
        if (isArray(element) && element.length > 0) {
          element_temp = deepClone(element)
          delete new_product_tag_filter[key]
          new_key = key.replace('数组', '')
          new_product_tag_filter[new_key] = element_temp
        }
      }

      // 精确匹配  ^{搜索内容}$
      console.log(new_product_tag_filter)
      if (Object.values(new_product_tag_filter).some(v => v !== '')) {
        var tagcheckbox = this.tagcheckbox
        Object.keys(new_product_tag_filter).forEach(function(key) {
        // console.log(key, new_product_tag_filter[key])
          if (isArray(new_product_tag_filter[key]) && tagcheckbox[key]) {
            for (let i = 0; i < new_product_tag_filter[key].length; i++) {
              if ((new_product_tag_filter[key][i]).indexOf('$') === -1) {
                new_product_tag_filter[key][i] = '^' + new_product_tag_filter[key][i] + '$'
              }
            }
          }
          if (!isArray(new_product_tag_filter[key]) && new_product_tag_filter[key] !== '' && tagcheckbox[key]) {
            if ((new_product_tag_filter[key]).indexOf('$') === -1) {
              new_product_tag_filter[key] = '^' + new_product_tag_filter[key] + '$'
            }
          }
        })
      }
      console.log(new_product_tag_filter)
      parameter['产品tags'] = new_product_tag_filter

      if (this.isShowOrderStatus) {
        parameter['订单状态'] = this.form['订单状态'] || null
      } else {
        parameter['多个订单状态'] = this.multipleOrderStatus
      }

      // 去除对象内多余的空值key
      for (const key in parameter) {
        if (!parameter[key]) {
          delete parameter[key]
        }
      }
      this.order_filter_parameter = parameter
      var res = await filter_order(parameter)
      this.total = res.total_count
      this.tableData = res.data
      for (var i = 0; i < this.tableData.length; i++) {
        this.tableData[i]['订单完成百分比%'] =
          parseFloat(this.tableData[i]['订单完成百分比'] * 100).toFixed(2) +
          '%'
        this.tableData[i]['订单完成百分比%数字'] = Number(
          parseFloat(this.tableData[i]['订单完成百分比'] * 100).toFixed(2)
        )
        if (this.tableData[i]['订单完成百分比%数字'] > 100) {
          this.tableData[i]['订单完成百分比%数字'] = 100
        }
        // console.log('索引:', i)
        // console.log(this.tableData[i]['订单完成百分比数字'])
        // 将动态 tags 的信息展开到外层
        for (var tag_index in this.order_tag_names) {
          this.tableData[i][this.order_tag_names[tag_index]] = this.tableData[
            i
          ]['tags'][this.order_tag_names[tag_index]]
        }
      }

      // 配置表头信息、表头对应属性信息和表单信息
      this.tableHeader = ['订单编号', '订单状态']
      this.tableProps = ['订单编号', '订单状态']
      for (var index in this.order_tag_names) {
        this.tableHeader.push(this.order_tag_names[index])
        this.tableProps.push(this.order_tag_names[index])
      }
      this.tableHeader.push('订单日期')
      this.tableHeader.push('交货日期')
      this.tableProps.push('订单日期')
      this.tableProps.push('交货日期')

      var data2 = new Date()
      console.log('请求耗时：', data2.getTime() - data1.getTime())
      this.$nextTick(() => {
        // 执行父组件的回调
        this.callbackAfterConditionQuery(res)
      })
    },
    // 条件查询用于结算的条目
    async orderSettleFilterItems() {
      var data1 = new Date()
      // 执行父组件的回调
      this.callBackTheParentComponentBeforeTheQuery()
      var parameter_a = {
        login_token: this.$store.getters.token
      }

      var parameter_b = {
        login_token: this.$store.getters.token,
        pagination: {
          page: parseInt(this.currentPage),
          limit: parseInt(this.pageSize)
        },
        sort: { 更新时间: -1 }
      }
      if (this.form['订单编号']) {
        parameter_a['订单编号'] = this.form['订单编号']
        parameter_b['订单编号'] = this.form['订单编号']
      }
      if (this.form['订单状态']) {
        parameter_a['订单状态'] = this.form['订单状态']
        parameter_b['订单状态'] = this.form['订单状态']
      }
      if (this.form.orderTimeQuantum[1] && this.form.orderTimeQuantum[0]) {
        parameter_a['订单日期_上限'] = parseTime(this.form.orderTimeQuantum[1])
        parameter_a['订单日期_下限'] = parseTime(this.form.orderTimeQuantum[0])

        parameter_b['订单日期_上限'] = parseTime(this.form.orderTimeQuantum[1])
        parameter_b['订单日期_下限'] = parseTime(this.form.orderTimeQuantum[0])
      }
      if (
        this.form.deliveryTimeQuantum[1] &&
        this.form.deliveryTimeQuantum[0]
      ) {
        parameter_a['交货日期_上限'] = parseTime(
          this.form.deliveryTimeQuantum[1]
        )
        parameter_a['交货日期_下限'] = parseTime(
          this.form.deliveryTimeQuantum[0]
        )

        parameter_b['交货日期_上限'] = parseTime(
          this.form.deliveryTimeQuantum[1]
        )
        parameter_b['交货日期_下限'] = parseTime(
          this.form.deliveryTimeQuantum[0]
        )
      }
      if (this.form['结算状态'].length > 0) {
        parameter_a['结算状态'] = this.form['结算状态']
        parameter_b['结算状态'] = this.form['结算状态']
      }

      var new_order_tag_filter = deepClone(this.order_tag_filter)
      for (const key in new_order_tag_filter) {
        var element = new_order_tag_filter[key]
        // 如果element是一个数组的话，判断长度
        if (isArray(element) && element.length === 0) {
          delete new_order_tag_filter[key]
        }
        if (isArray(element) && element.length > 0) {
          var element_temp = deepClone(element)
          delete new_order_tag_filter[key]
          var new_key = key.replace('数组', '')
          new_order_tag_filter[new_key] = element_temp
        }
      }
      parameter_a.tags = new_order_tag_filter
      parameter_b.tags = new_order_tag_filter

      var new_product_tag_filter = deepClone(this.product_tag_filter)
      for (const key in new_product_tag_filter) {
        element = new_product_tag_filter[key]
        // 如果element是一个数组的话，判断长度
        if (isArray(element) && element.length === 0) {
          delete new_product_tag_filter[key]
        }
        if (isArray(element) && element.length > 0) {
          element_temp = deepClone(element)
          delete new_product_tag_filter[key]
          new_key = key.replace('数组', '')
          new_product_tag_filter[new_key] = element_temp
        }
      }
      parameter_a['产品tags'] = new_product_tag_filter
      parameter_b['产品tags'] = new_product_tag_filter

      const res_a = await order_settle_stats(parameter_a)
      this.settlementOfStatistical = res_a.data

      const res_b = await order_settle_filter_items(parameter_b)
      this.total = res_b.data.pagination.total
      this.tableData = res_b.data

      var data2 = new Date()
      console.log('请求耗时：', data2.getTime() - data1.getTime())
      // 执行父组件的回调
      this.callbackAfterConditionQuery()
    },

    // 条件查询全部的结算条目
    async orderSettleFilterAllItems() {
      this.excleprogressValue = 0
      this.centerDialogVisible = true
      // pagenum为循环次数
      var pagenum = Math.ceil(this.total / 100)
      // allitem为所有数据
      var allitem = {
        settlementOfStatistical: [],
        结算记录列表: []
      }
      for (let i = 0; i < pagenum; i++) {
        var parameter_a = {
          login_token: this.$store.getters.token
        }

        var parameter_b = {
          login_token: this.$store.getters.token,
          pagination: {
            page: i + 1,
            limit: 100
          },
          sort: { 更新时间: -1 }
        }
        if (this.form['订单编号']) {
          parameter_a['订单编号'] = this.form['订单编号']
          parameter_b['订单编号'] = this.form['订单编号']
        }
        if (this.form['订单状态']) {
          parameter_a['订单状态'] = this.form['订单状态']
          parameter_b['订单状态'] = this.form['订单状态']
        }
        if (this.form.orderTimeQuantum[1] && this.form.orderTimeQuantum[0]) {
          parameter_a['订单日期_上限'] = parseTime(this.form.orderTimeQuantum[1])
          parameter_a['订单日期_下限'] = parseTime(this.form.orderTimeQuantum[0])

          parameter_b['订单日期_上限'] = parseTime(this.form.orderTimeQuantum[1])
          parameter_b['订单日期_下限'] = parseTime(this.form.orderTimeQuantum[0])
        }
        if (
          this.form.deliveryTimeQuantum[1] &&
          this.form.deliveryTimeQuantum[0]
        ) {
          parameter_a['交货日期_上限'] = parseTime(this.form.deliveryTimeQuantum[1])
          parameter_a['交货日期_下限'] = parseTime(this.form.deliveryTimeQuantum[0])

          parameter_b['交货日期_上限'] = parseTime(this.form.deliveryTimeQuantum[1])
          parameter_b['交货日期_下限'] = parseTime(this.form.deliveryTimeQuantum[0])
        }
        if (this.form['结算状态'].length > 0) {
          parameter_b['结算状态'] = this.form['结算状态']
        }

        var new_order_tag_filter = deepClone(this.order_tag_filter)
        for (const key in new_order_tag_filter) {
          var element = new_order_tag_filter[key]
          // 如果element是一个数组的话，判断长度
          if (isArray(element) && element.length === 0) {
            delete new_order_tag_filter[key]
          }
          if (isArray(element) && element.length > 0) {
            var element_temp = deepClone(element)
            delete new_order_tag_filter[key]
            var new_key = key.replace('数组', '')
            new_order_tag_filter[new_key] = element_temp
          }
        }
        parameter_a.tags = new_order_tag_filter
        parameter_b.tags = new_order_tag_filter

        var new_product_tag_filter = deepClone(this.product_tag_filter)
        for (const key in new_product_tag_filter) {
          element = new_product_tag_filter[key]
          // 如果element是一个数组的话，判断长度
          if (isArray(element) && element.length === 0) {
            delete new_product_tag_filter[key]
          }
          if (isArray(element) && element.length > 0) {
            element_temp = deepClone(element)
            delete new_product_tag_filter[key]
            new_key = key.replace('数组', '')
            new_product_tag_filter[new_key] = element_temp
          }
        }
        parameter_a['产品tags'] = new_product_tag_filter
        parameter_b['产品tags'] = new_product_tag_filter

        const res_a = await order_settle_stats(parameter_a)
        const res_b = await order_settle_filter_items(parameter_b)
        allitem.settlementOfStatistical = res_a.data
        allitem.结算记录列表.push(...res_b.data['结算记录列表'])
        this.excleprogressValue = Number(
          parseFloat(
            (i / pagenum) * 98
          ).toFixed(1)
        )
        // console.log(excleprogressValue)
        // this.$emit('getprogress', excleprogressValue)
      }
      this.centerDialogVisible = false
      console.log(allitem.结算记录列表)
      return {
        settlementOfStatistical: allitem.settlementOfStatistical,
        结算记录列表: allitem.结算记录列表
      }
    },

    // 获取配置中对订单的tags数组，确保先载入
    getOrderTagName(callback) {
      this.order_tag_names = this.$store.getters.订单的标签
      this.order_tag_filter = {}
      for (var index in this.order_tag_names) {
        this.$set(this.order_tag_filter, this.order_tag_names[index], '')
        this.$set(
          this.order_tag_filter,
          this.order_tag_names[index] + '数组',
          []
        )
      }
      if (typeof callback === 'function') {
        callback()
      }
    },
    // 获取配置中对产品的tags数组，确保先载入
    getProductTagNames(callback) {
      // 是否精确匹配tags数组
      var tagobj = {}
      for (let index = 0; index < this.$store.getters.产品的标签.length; index++) {
        const element = this.$store.getters.产品的标签[index]
        tagobj[element] = false
      }
      this.tagcheckbox = tagobj
      console.log(this.tagcheckbox)

      this.product_tag_names = this.$store.getters.产品的标签
      this.product_tag_filter = {}
      for (var index in this.product_tag_names) {
        this.$set(this.product_tag_filter, this.product_tag_names[index], '')
        this.$set(
          this.product_tag_filter,
          this.product_tag_names[index] + '数组',
          []
        )
      }
      if (typeof callback === 'function') {
        callback()
      }
    },

    // 对订单标签进行自动补全操作
    async tagQueryAutoCompleteSearch(queryString, callback, tag_name) {
      if (queryString === undefined || queryString === null) {
        queryString = ''
      }
      var login_token = this.$store.getters.token
      var order_tag_filter = deepClone(this.order_tag_filter)
      for (const key in order_tag_filter) {
        if (key.includes('数组')) {
          delete order_tag_filter[key]
        }
      }
      var post_data = {
        login_token: login_token,
        base_tags: order_tag_filter,
        target_tag_name: tag_name
      }
      const response = await order_tags_auto_complete(post_data)
      var suggest_value_list = []
      for (var index in response.data) {
        suggest_value_list.push({
          value: response.data[index]
        })
      }
      callback(suggest_value_list)
    },

    // 对产品标签进行自动补全操作
    async productTagQueryAutoCompleteSearch(queryString, callback, tag_name) {
      if (queryString === undefined || queryString === null) {
        queryString = ''
      }
      var login_token = this.$store.getters.token
      var product_tag_filter = deepClone(this.product_tag_filter)
      for (const key in product_tag_filter) {
        if (key.includes('数组')) {
          delete product_tag_filter[key]
        }
      }
      var post_data = {
        login_token: login_token,
        base_tags: product_tag_filter,
        target_tag_name: tag_name
      }
      const response = await product_tags_auto_complete(post_data)
      var suggest_value_list = []
      for (var index in response.data) {
        suggest_value_list.push({
          value: response.data[index]
        })
      }
      callback(suggest_value_list)
    },
    // 清空查询条件
    clearFilterCondition() {
      this.form = {
        订单编号: null,
        订单状态: null,
        orderTimeQuantum: [],
        // deliveryTimeQuantum: [new Date(y, m - 6, d), new Date(y, m, d)],
        deliveryTimeQuantum: [],
        结算状态: []
      }
      this.radio = '3'
      this.order_tag_filter = {}
      for (var index in this.order_tag_names) {
        this.$set(this.order_tag_filter, this.order_tag_names[index], '')
        this.$set(
          this.order_tag_filter,
          this.order_tag_names[index] + '数组',
          []
        )
      }

      this.product_tag_names = this.$store.getters.产品的标签
      this.product_tag_filter = {}
      for (var index_b in this.product_tag_names) {
        this.$set(this.product_tag_filter, this.product_tag_names[index_b], '')
        this.$set(
          this.product_tag_filter,
          this.product_tag_names[index_b] + '数组',
          []
        )
      }

      this.callbackAfterConditionClear()
    },

    // 标签进行选中的时候
    handleSelectTag(obj, tag_name, tag_filter) {
      var value = obj.value
      var key_a = tag_name + '数组'
      for (const key in tag_filter) {
        if (key === key_a) {
          var array = tag_filter[key]
          // 判断该数组中是否有这个value值，没有的话push
          if (!array.includes(value)) {
            array.push(value)
          }
        }
      }
    },
    // 当标签删除的时候
    handleCloseTag(value, array) {
      array.splice(array.indexOf(value), 1)
      if (this.mode === 'orderQuery') {
        this.filterOrder()
      }
      if (this.mode === 'orderSettlementEnquiry') {
        this.orderSettleFilterItems()
      }
    },
    // 查询所有符合条件的订单（导出excel用）
    async orderTableFilterAllItems() {
      this.excleprogressValue = 0
      this.centerDialogVisible = true
      // pagenum为循环次数
      console.log(this.total)
      var pagenum = Math.ceil(this.total / 100)
      // allitem为所有数据
      var allitem = []
      for (let k = 0; k < pagenum; k++) {
        var parameter = {
          login_token: this.$store.getters.token,
          pagination: {
            page: k + 1,
            limit: 100
          },
          订单编号: this.form['订单编号'] || null,
          订单日期_上限: this.form.orderTimeQuantum[1]
            ? parseTime(new Date(this.form.orderTimeQuantum[1]))
            : null,
          订单日期_下限: this.form.orderTimeQuantum[0]
            ? parseTime(new Date(this.form.orderTimeQuantum[0]))
            : null,
          交货日期_上限: this.form.deliveryTimeQuantum[1]
            ? parseTime(new Date(this.form.deliveryTimeQuantum[1]))
            : null,
          交货日期_下限: this.form.deliveryTimeQuantum[0]
            ? parseTime(new Date(this.form.deliveryTimeQuantum[0]))
            : null,
          sort: { 更新时间: -1 }
        }

        var new_order_tag_filter = deepClone(this.order_tag_filter)
        for (const key in new_order_tag_filter) {
          var element = new_order_tag_filter[key]
          // 如果element是一个数组的话，判断长度
          if (isArray(element) && element.length === 0) {
            delete new_order_tag_filter[key]
          }
          if (isArray(element) && element.length > 0) {
            var element_temp = deepClone(element)
            delete new_order_tag_filter[key]
            var new_key = key.replace('数组', '')
            new_order_tag_filter[new_key] = element_temp
          }
        }
        parameter.tags = new_order_tag_filter

        var new_product_tag_filter = deepClone(this.product_tag_filter)
        for (const key in new_product_tag_filter) {
          element = new_product_tag_filter[key]
          // 如果element是一个数组的话，判断长度
          if (isArray(element) && element.length === 0) {
            delete new_product_tag_filter[key]
          }
          if (isArray(element) && element.length > 0) {
            element_temp = deepClone(element)
            delete new_product_tag_filter[key]
            new_key = key.replace('数组', '')
            new_product_tag_filter[new_key] = element_temp
          }
        }

        // 精确匹配  ^{搜索内容}$
        console.log(new_product_tag_filter)
        if (Object.values(new_product_tag_filter).some(v => v !== '')) {
          var tagcheckbox = this.tagcheckbox
          Object.keys(new_product_tag_filter).forEach(function(key) {
          // console.log(key, new_product_tag_filter[key])
            if (isArray(new_product_tag_filter[key]) && tagcheckbox[key]) {
              for (let i = 0; i < new_product_tag_filter[key].length; i++) {
                if ((new_product_tag_filter[key][i]).indexOf('$') === -1) {
                  new_product_tag_filter[key][i] = '^' + new_product_tag_filter[key][i] + '$'
                }
              }
            }
            if (!isArray(new_product_tag_filter[key]) && new_product_tag_filter[key] !== '' && tagcheckbox[key]) {
              if ((new_product_tag_filter[key]).indexOf('$') === -1) {
                new_product_tag_filter[key] = '^' + new_product_tag_filter[key] + '$'
              }
            }
          })
        }
        console.log(new_product_tag_filter)
        parameter['产品tags'] = new_product_tag_filter

        if (this.isShowOrderStatus) {
          parameter['订单状态'] = this.form['订单状态'] || null
        } else {
          parameter['多个订单状态'] = this.multipleOrderStatus
        }

        // 去除对象内多余的空值key
        for (const key in parameter) {
          if (!parameter[key]) {
            delete parameter[key]
          }
        }
        this.order_filter_parameter = parameter
        var res = await filter_order(parameter)
        this.total = res.total_count
        this.tableData = res.data
        for (var i = 0; i < this.tableData.length; i++) {
          this.tableData[i]['订单完成百分比%'] =
            parseFloat(this.tableData[i]['订单完成百分比'] * 100).toFixed(2) +
            '%'
          this.tableData[i]['订单完成百分比%数字'] = Number(
            parseFloat(this.tableData[i]['订单完成百分比'] * 100).toFixed(2)
          )
          if (this.tableData[i]['订单完成百分比%数字'] > 100) {
            this.tableData[i]['订单完成百分比%数字'] = 100
          }
          // console.log('索引:', i)
          // console.log(this.tableData[i]['订单完成百分比数字'])
          // 将动态 tags 的信息展开到外层
          for (var tag_index in this.order_tag_names) {
            this.tableData[i][this.order_tag_names[tag_index]] = this.tableData[
              i
            ]['tags'][this.order_tag_names[tag_index]]
          }
        }

        // 配置表头信息、表头对应属性信息和表单信息
        this.tableHeader = ['订单编号', '订单状态']
        this.tableProps = ['订单编号', '订单状态']
        for (var index in this.order_tag_names) {
          this.tableHeader.push(this.order_tag_names[index])
          this.tableProps.push(this.order_tag_names[index])
        }
        this.tableHeader.push('订单日期')
        this.tableHeader.push('交货日期')
        this.tableProps.push('订单日期')
        this.tableProps.push('交货日期')

        allitem.push(...res.data)
        this.excleprogressValue = Number(
          parseFloat(
            (k / pagenum) * 98
          ).toFixed(1)
        )
      }
      console.log(allitem)
      this.centerDialogVisible = false
      return allitem
    }
  }
}
</script>

<style lang="scss" >
.order-condition-query {
  .module-b {
    margin-bottom: 30px;
    .header {
      text-align: center;
    }
    .info-box {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      .row-1 {
        width: 100%;
        display: flex;
        .item-0 {
          width: 100px;
          padding-top: 10px;
        }
        .item-1 {
          width: 100%;
          display: flex;
          justify-content: space-between;
          .item {
            .tag-box {
              display: flex;
              flex-wrap: wrap;
              max-width: 400px;
              .tag {
                margin-right: 5px;
                margin-top: 5px;
              }
            }
          }
        }
      }
      .row-2 {
        padding-left: 92px;
        width: 100%;
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        border-bottom: 1px solid #ebeef5;
        .item-1 {
          width: 220px;
        }
        .item-4 {
          width: 600px;
        }
        .item-5 {
          width: 350px;
        }
      }
      .row-3 {
        width: 100%;
        display: flex;
        padding-top: 10px;
        .item-0 {
          width: 150px;
          padding-top: 10px;
        }
        .item-1 {
          width: 100%;
          display: flex;
          justify-content: space-between;
          .item {
            .tag-box {
              display: flex;
              flex-wrap: wrap;
              max-width: 400px;
              .tag {
                margin-right: 5px;
                margin-top: 5px;
              }
            }
          }
        }
      }
      .row-4 {
        width: 100%;
        display: flex;
        justify-content: center;
        .btn {
          width: 98px;
          margin: 0 20px;
        }
      }
    }
  }
  .el-card__body {
    padding: 10px;
  }
  .el-form-item {
    margin-bottom: 10px;
  }
}
.excleprogress{
  width: 100%;
}
</style>

