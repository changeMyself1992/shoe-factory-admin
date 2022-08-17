<template>
  <!--流水单条件查询组件-->
  <div class="delivery-note-condition-query">
    <div class="base-info">
      <div class="header">
        <b>条件查询流水单记录</b>
      </div>

      <el-form
        ref="searchDeliveryNoteForm"
        class="info-box"
        :model="form"
        :rules="formRules"
        label-position="left"
      >
        <el-collapse v-model="activeNames">
          <el-collapse-item title="高级搜索" name="1">
            <div class="advanced-search-box">
              <el-form-item label="货号:">
                <el-input v-model.trim="form['货号']" placeholder="输入" />
              </el-form-item>

              <el-form-item label="名称及规格:">
                <el-input v-model.trim="form['名称及规格']" placeholder="输入" />
              </el-form-item>

              <el-form-item prop="送货单位经手人手机" label="送货单位经手人手机:">
                <el-input v-model.trim="form['送货单位经手人手机']" type="number" placeholder="输入" />
              </el-form-item>

              <el-form-item prop="收货单位经手人手机" label="收货单位经手人手机:">
                <el-input v-model.trim="form['收货单位经手人手机']" type="number" placeholder="输入" />
              </el-form-item>
            </div>
          </el-collapse-item>
        </el-collapse>

        <div class="row-1">
          <el-form-item label="交易状态:" label-width="85px">
            <el-checkbox
              v-for="status in opetion"
              :key="status"
              v-model.trim="form['交易状态']"
              :label="status"
            >{{ status }}</el-checkbox>
          </el-form-item>

          <el-form-item label="流水单类型:" label-width="100px">
            <el-checkbox
              v-for="status in deliveryNoteTypeOpetion"
              :key="status"
              v-model.trim="form['流水单类型']"
              :label="status"
            >{{ status }}</el-checkbox>
          </el-form-item>
        </div>

        <div class="row-2">
          <el-form-item class="item-1" label="记录时间段:" label-width="100px">
            <template>
              <el-radio v-model.trim="radioB" label="0">今日</el-radio>
              <el-radio v-model.trim="radioB" label="1">昨日</el-radio>
              <el-radio v-model.trim="radioB" label="2">本月</el-radio>
              <el-radio v-model.trim="radioB" label="3">自定义</el-radio>
            </template>
            <el-date-picker
              v-model.trim="form.记录时间段"
              class="picker"
              type="daterange"
              unlink-panels
              range-separator="-"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :disabled="radioB!=='3'"
            />
          </el-form-item>

          <el-form-item class="item-2">
            <el-button type="primary" @click="searchBtnClick()">搜索流水单</el-button>
            <el-button type="primary" @click="clearCondition()">清空条件</el-button>
          </el-form-item>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script>
var date = new Date()
var y = date.getFullYear()
var m = date.getMonth()
var d = date.getDate()
var firstDay = new Date(y, m, 1)
var lastDay = new Date(y, m + 1, 0, 23, 59, 59)
import { isEmpty, parseTime, deepClone } from '@/utils'
import { 验证非必选手机号 } from '@/utils/validate'
import { filter_supplier_transactions } from '@/api/supplier'
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
    // 查询后回调父组件
    callbackAfterConditionQuery: {
      type: Function,
      default() {
        return
      }
    },
    // 清空父组件的 page 和pageSize
    initPagination: {
      type: Function,
      default() {
        return
      }
    },
    // 查询指定的供应商
    uniqueId: {
      type: String,
      default: ''
    },
    // 赋值指定的时间段
    specifiedTimePeriod: {
      type: Array,
      default: function() {
        return []
      }
    },
    // 时间段选择
    radio: {
      type: String,
      default: ''
    },
    // 是否要查询待确认的送货单
    isCheckTheDeliveryNoteToBeConfirmed: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      // 流水单搜索条件
      form: {
        货号: '',
        名称及规格: '',
        交易状态: [
          '未确认',
          '已确认',
          '未结算',
          '已结算',
          '待作废',
          '已作废',
          '待退货',
          '已退货'
        ],
        流水单类型: ['送货单', '退货单', '现结单'],
        送货单位经手人手机: '',
        收货单位经手人手机: '',
        记录时间段: [firstDay, lastDay]
      },
      formRules: {
        送货单位经手人手机: [{ trigger: 'blur', validator: 验证非必选手机号 }],
        收货单位经手人手机: [{ trigger: 'blur', validator: 验证非必选手机号 }]
      },
      // 高级搜索展开的选项
      activeNames: [],
      // 交易状态opetion
      opetion: [
        '未确认',
        '已确认',
        '未结算',
        '已结算',
        '待作废',
        '已作废',
        '待退货',
        '已退货'
      ],
      // 流水单类型opetion
      deliveryNoteTypeOpetion: ['送货单', '退货单', '现结单'],
      // 流水单记录 时间段快捷选项
      radioB: '2'
    }
  },
  computed: {},
  watch: {
    radioB: function(newVal, oldVal) {
      this.form['记录时间段'] = []
      switch (newVal) {
        case '0':
          // 今日
          this.form['记录时间段'][0] = new Date(Date.parse(new Date(y, m, d)))
          this.form['记录时间段'][1] = new Date(
            Date.parse(new Date(y, m, d + 1)) - 1000
          )
          break
        case '1':
          // 昨日
          this.form['记录时间段'][0] = new Date(
            Date.parse(new Date(y, m, d - 1))
          )
          this.form['记录时间段'][1] = new Date(
            Date.parse(new Date(y, m, d)) - 1000
          )
          break
        case '2':
          // 本月
          this.form['记录时间段'][0] = firstDay
          this.form['记录时间段'][1] = lastDay
      }
    },
    'form.交易状态': function(newVal, oldVal) {
      if (newVal.length > 0) {
        this.initPagination()
      }
    },
    currentPage: function(newVal, oldVal) {
      this.filterSupplierTransactions()
    },
    pageSize: function(newVal, oldVal) {
      this.filterSupplierTransactions()
    }
  },
  created() {
    if (!isEmpty(this.radio)) {
      this.radioB = this.radio
    }
    setTimeout(() => {
      if (!isEmpty(this.specifiedTimePeriod)) {
        this.form['记录时间段'] = deepClone(this.specifiedTimePeriod)
      }
      if (this.isCheckTheDeliveryNoteToBeConfirmed) {
        this.form['记录时间段'] = []
        this.radioB = '3'
        this.form['流水单类型'] = ['送货单']
        this.form['交易状态'] = ['未确认']
      }
    }, 500)
  },
  mounted() {},
  methods: {
    // 条件查询流水单列表
    // tableData 表格请求数据
    // excelExportData  excel导出数据
    filterSupplierTransactions(mode = 'tableData') {
      var that = this
      if (!that.$refs.searchDeliveryNoteForm) return
      return new Promise(function(resolve, reject) {
        that.$refs.searchDeliveryNoteForm.validate(async valid => {
          if (valid) {
            var login_token = that.$store.getters.token
            var post_data = {
              login_token: login_token,
              sort: { 更新时间: -1 }
            }
            if (mode === 'tableData') {
              post_data['pagination'] = {
                page: parseInt(that.currentPage),
                limit: parseInt(that.pageSize)
              }
            }
            if (!isEmpty(that.form['货号'])) {
              post_data['货号'] = that.form['货号']
            }
            if (!isEmpty(that.form['名称及规格'])) {
              post_data['名称及规格'] = that.form['名称及规格']
            }
            if (!isEmpty(that.form['交易状态'])) {
              post_data['交易状态'] = that.form['交易状态']
            }
            if (!isEmpty(that.form['流水单类型'])) {
              post_data['流水单类型'] = that.form['流水单类型']
            }
            if (!isEmpty(that.form['送货单位经手人手机'])) {
              post_data['送货单位经手人手机'] = that.form['送货单位经手人手机']
            }
            if (!isEmpty(that.form['收货单位经手人手机'])) {
              post_data['收货单位经手人手机'] = that.form['收货单位经手人手机']
            }
            if (that.form.记录时间段.length === 2) {
              post_data['记录时间_上限'] = parseTime(
                new Date(that.form.记录时间段[1])
              )
              post_data['记录时间_下限'] = parseTime(
                new Date(that.form.记录时间段[0])
              )
            }
            if (!isEmpty(that.uniqueId)) {
              post_data['供应商unique_id'] = that.uniqueId
            }
            var response = await filter_supplier_transactions(post_data)
            for (let i = 0; i < response.data.length; i++) {
              var element = response.data[i]
              // 如果流水单类型为送货单并且状态为未确认并且没有’添加送货发起方‘这个字段，那么我们默认发起方是供应商
              if (
                element['流水单类型'] === '送货单' &&
                element['交易状态'] === '未确认' &&
                !element.hasOwnProperty('添加送货发起方')
              ) {
                element['添加送货发起方'] = '供应商'
              }
              // 如果流水单类型为送货单并且状态为待作废并且没有’作废送货发起方‘这个字段，那么我们默认发起方是供应商
              if (
                element['流水单类型'] === '送货单' &&
                element['交易状态'] === '待作废' &&
                !element.hasOwnProperty('作废送货发起方')
              ) {
                element['作废送货发起方'] = '供应商'
              }
              // 如果流水单类型为退货单并且状态为待退货并且没有’添加退货发起方‘这个字段，那么我们默认发起方是工厂
              if (
                element['流水单类型'] === '退货单' &&
                element['交易状态'] === '待退货' &&
                !element.hasOwnProperty('添加退货发起方')
              ) {
                element['添加退货发起方'] = '工厂'
              }
              // 如果流水单类型为退货单并且状态为待作废并且没有’作废退货发起方‘这个字段，那么我们默认发起方是工厂
              if (
                element['流水单类型'] === '退货单' &&
                element['交易状态'] === '待作废' &&
                !element.hasOwnProperty('作废退货发起方')
              ) {
                element['作废退货发起方'] = '工厂'
              }
            }

            // 执行父组件的回调
            if (mode === 'tableData') {
              that.$nextTick(() => {
                that.callbackAfterConditionQuery(response)
              })
              resolve()
            } else {
              resolve(response)
            }
          } else {
            that.$message({
              type: 'warning',
              message: '请正确填写表单信息！'
            })
            reject()
          }
        })
      })
    },
    // 搜索按钮点击
    searchBtnClick() {
      this.$nextTick(() => {
        this.initPagination()
      })
    },
    // 清空条件按钮点击
    clearCondition() {
      this.radioB = '3'
      this.form = {
        货号: '',
        名称及规格: '',
        交易状态: [],
        流水单类型: [],
        送货单位经手人手机: '',
        收货单位经手人手机: '',
        记录时间段: []
      }
      this.$nextTick(() => {
        this.initPagination()
      })
    }
  }
}
</script>

<style lang="scss" >
.delivery-note-condition-query {
  .base-info {
    margin-bottom: 30px;
    border: 1px solid #bbbbbb;
    .header {
      padding: 0 10px;
      height: 40px;
      line-height: 40px;
      border-bottom: 1px solid #bbbbbb;
    }
    .info-box {
      padding: 10px 10px 0px 10px;
      .advanced-search-box {
        display: flex;
        justify-content: space-between;
      }
      .row-1 {
        display: flex;
        justify-content: space-between;
      }
      .row-2 {
        display: flex;
        justify-content: space-between;
        .item-1 {
          width: 500px;
        }
        .item-2 {
          padding-top: 40px;
        }
      }
    }
  }
}
</style>

