<template>
  <div class="order-sheet-for-production-scheduling">
    <!-- 需要排产的订单 -->
    <order-condition-query
      v-if="enableAdvancedSearch"
      ref="orderConditionQuery"
      :current-page="notArrangedOrder_currentPage"
      :page-size="notArrangedOrder_pageSize"
      :callback-after-condition-query="callbackAfterConditionQuery"
      :callback-after-condition-clear="callbackAfterConditionClear"
      :is-show-order-status="false"
      :multiple-order-status="['新订单', '排产中']"
      @initPagination="callbackAfterConditionClear"
    />
    <div class="module-a">
      <div class="header">
        <el-switch
          v-model.trim="enableAdvancedSearch"
          class="batch-operation-switching"
          active-color="#13ce66"
          inactive-color="#ccc"
          active-text="高级搜索"
        />
        <span>需要排产的订单</span>
        <el-button
          type="primary"
          size="small"
          :loading="btnLoading"
          :disabled="!管理权限['生产单列表可读']"
          @click="exportExcel"
        >导出EXCEL表格</el-button>
      </div>
      <el-table
        v-if="notArrangedOrderTableData.length>0"
        ref="table"
        :height="tableHeight"
        class="table"
        :data="notArrangedOrderTableData"
        border
      >
        <el-table-column prop="订单编号" label="订单编号" align="center" width="150" />
        <el-table-column
          prop="订单状态"
          label="订单状态"
          align="center"
          :filters="[{ text: '新订单', value: '新订单' }, { text: '排产中', value: '排产中' }]"
          :filter-method="filterOrderStatus"
        />

        <el-table-column
          v-for="(tag,index) in 订单的标签"
          :key="index"
          :prop="tag"
          :label="tag"
          align="center"
          :filters="notArrangedOrderTableData[0][tag+'-Valus']"
          :filter-method="filterOrderTags"
        />
        <el-table-column prop="订单日期" label="订单日期" align="center" sortable />
        <el-table-column prop="交货日期" label="交货日期" align="center" sortable />
        <el-table-column width="160" align="center" prop="已排产数/目标总件数" label="已排产数/目标总件数" />
        <el-table-column width="150" align="center" label="操作">
          <template slot-scope="scope">
            <el-button
              type="primary"
              size="mini"
              :disabled="!管理权限['生产单详情可写']"
              @click="arrangeProductionNote(scope.$index)"
            >点击进行排产</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        class="el-pagination"
        :current-page="notArrangedOrder_currentPage"
        :page-sizes="[30, 60, 100, 150]"
        :page-size="notArrangedOrder_pageSize"
        :total="notArrangedOrder_total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="notArrangedOrder_handleSizeChange"
        @current-change="notArrangedOrder_handleCurrentChange"
      />
    </div>
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
// import { deepClone } from '@/utils'
import { filter_need_schedule_order } from '@/api/ordersForProductionScheduling'
import { mapGetters } from 'vuex'
import { order_tags_auto_complete } from '@/api/ordersForProductionScheduling'
import orderConditionQuery from '@/views/components/orderConditionQuery' // 订单条件查询组件
import { showLoading, hideLoading } from '@/utils/loading'
export default {
  components: { orderConditionQuery },
  props: {
    // 订单查询之后回调父组件的方法
    callBackAfterTheQuery: {
      type: Function,
      default() {
        return
      }
    }
  },
  data() {
    return {
      // 导出excel的进度
      excleprogressValue: 0,
      centerDialogVisible: false,
      // 需要排产的订单表（表格展示组合出来的数据）
      notArrangedOrderTableData: [],
      // 需要排产的订单（api请求回来的订单列表）
      notArrangedOrderData: [],
      // 当前页数
      notArrangedOrder_currentPage: 1,
      // 总条目数
      notArrangedOrder_total: 0,
      // 当前页数据量
      notArrangedOrder_pageSize: 30,
      // 是否启用按钮loading状态防止多次点击
      btnLoading: false,
      // 是否启用高级搜索功能
      enableAdvancedSearch: false,
      tableHeight: ''
    }
  },
  computed: {
    ...mapGetters(['订单的标签', '管理权限'])
  },
  watch: {
    enableAdvancedSearch: function(newVal, oldVal) {
      // 开启高级搜索
      if (newVal) {
        this.callbackAfterConditionClear()
      }
      // 关闭高级搜搜
      if (!newVal) {
        this.filterNotFinishedOrder()
      }
    }
  },
  created() {
    this.tableHeight = window.innerHeight * 0.5
    this.filterNotFinishedOrder()
  },
  mounted() {},
  methods: {
    // 子组件清空搜索条件之后回调
    callbackAfterConditionClear() {
      this.notArrangedOrder_currentPage = 1
      this.notArrangedOrder_pageSize = 30
      this.$nextTick(() => {
        this.$refs.orderConditionQuery.filterOrder()
      })
    },
    // 子组件条件查询之后回调
    callbackAfterConditionQuery(response) {
      this.notArrangedOrderData = response.data
      this.notArrangedOrder_total = response.total_count // 计入总数
      // 组合让表格显示订单表数据
      this.combinationLetsTheTableDisplayOrderTableData()
      this.callBackAfterTheQuery()
    },
    // 页码控制时，每页数量改变的处理函数
    notArrangedOrder_handleSizeChange(val) {
      this.notArrangedOrder_pageSize = val
      // 如果启用了高级搜索，那么应该调用子组件的搜索方法，因为要带上条件
      // 没有启用高级搜索的，调用本组件的搜索方法即可
      if (this.enableAdvancedSearch) {
        this.$nextTick(() => {
          this.$refs.orderConditionQuery.filterOrder()
        })
      } else {
        this.filterNotFinishedOrder()
      }
    },
    // 页码控制时，每页码改变改变的处理函数
    notArrangedOrder_handleCurrentChange(val) {
      this.notArrangedOrder_currentPage = val
      // 如果启用了高级搜索，那么应该调用子组件的搜索方法，因为要带上条件
      // 没有启用高级搜索的，调用本组件的搜索方法即可
      if (this.enableAdvancedSearch) {
        this.$nextTick(() => {
          this.$refs.orderConditionQuery.filterOrder()
        })
      } else {
        this.filterNotFinishedOrder()
      }
    },
    // 获取所有未完全排产完成的订单
    async filterNotFinishedOrder() {
      // 先处理所有的新订单
      var post_data_a = {
        login_token: this.$store.getters.token,
        多个订单状态: ['新订单', '排产中'],
        pagination: {
          page: parseInt(this.notArrangedOrder_currentPage),
          limit: parseInt(this.notArrangedOrder_pageSize)
        },
        sort: {
          更新时间: -1
        }
      }
      var response = await filter_need_schedule_order(post_data_a)
      this.notArrangedOrderData = response.data
      this.notArrangedOrder_total = response.total_count // 计入总数
      this.notArrangedOrderTableData = []
      // 组合让表格显示订单表数据
      this.combinationLetsTheTableDisplayOrderTableData()
      this.callBackAfterTheQuery()
    },

    // 组合让表格显示订单表数据
    async combinationLetsTheTableDisplayOrderTableData() {
      this.notArrangedOrderTableData = []
      // 组合orderTableData******************************start
      for (var i = 0; i < this.notArrangedOrderData.length; i++) {
        var notArrangedOrderItem = this.notArrangedOrderData[i]
        var orderItem = {
          订单编号: '',
          订单状态: '',
          订单日期: '',
          交货日期: '',
          '已排产数/目标总件数': ''
        }
        orderItem['订单编号'] = notArrangedOrderItem.unique_id
        orderItem['订单状态'] = notArrangedOrderItem.订单状态
        orderItem['订单日期'] = notArrangedOrderItem.订单日期
        orderItem['交货日期'] = notArrangedOrderItem.交货日期

        // 添加 动态tags信息
        for (let j = 0; j < this.$store.getters.订单的标签.length; j++) {
          const tagName = this.$store.getters.订单的标签[j]
          orderItem[tagName] = notArrangedOrderItem.tags[tagName]
          if (i === 0) {
            // 获取订单标签的标签名对应的所有标签值
            for (const key in this.$store.getters.theFullValueOfTheOrderLabel) {
              orderItem[key] = this.$store.getters.theFullValueOfTheOrderLabel[
                key
              ]
            }
          }
        }

        // 添加 '已排产数/目标总件数' '是否已经排产完成'
        var arranged_count = 0
        var target_count = 0
        for (var k = 0; k < notArrangedOrderItem['包含的产品'].length; k++) {
          arranged_count =
            arranged_count +
            notArrangedOrderItem['包含的产品'][k]['配码数量']['已经排产数量']
          target_count =
            target_count +
            notArrangedOrderItem['包含的产品'][k]['配码数量']['总数']
        }
        orderItem['已排产数/目标总件数'] =
          String(arranged_count) + '/' + String(target_count)

        this.notArrangedOrderTableData.push(orderItem)
      }
      // 组合orderTableData*************************************end
    },

    // 获取订单标签的标签名对应的所有标签值
    async getOrderTagValus(tag_name) {
      var order_tag_filter = {}
      for (let i = 0; i < this.$store.getters.订单的标签.length; i++) {
        const tagName = this.$store.getters.订单的标签[i]
        order_tag_filter[tagName] = ''
      }
      var login_token = this.$store.getters.token
      var post_data = {
        login_token: login_token,
        base_tags: order_tag_filter,
        target_tag_name: tag_name
      }
      const response = await order_tags_auto_complete(post_data)
      var suggest_value_list = []
      for (var index in response.data) {
        suggest_value_list.push({
          text: response.data[index],
          value: response.data[index]
        })
      }
      return suggest_value_list
    },
    filterOrderStatus(value, row) {
      return row.订单状态 === value
    },
    filterOrderTags(value, row, column) {
      return row[column.label] === value
    },
    // 进行排产按钮点击
    arrangeProductionNote(index) {
      this.$router.push({
        path: '/productOrderManagement/arrangeProductionNote',
        query: {
          mode: 'add',
          from: 'orderSheetForProductionScheduling',
          curOperationDetailInfo: this.notArrangedOrderData[index]
        }
      })
    },
    // 获取未打开高级搜索的所有数据（导出excel用）
    async filterOrderNodeAllItem() {
      this.excleprogressValue = 0
      this.centerDialogVisible = true
      // pagenum为循环次数
      console.log(this.notArrangedOrder_total)
      var pagenum = Math.ceil(this.notArrangedOrder_total / 100)
      // allitem为所有数据
      var allitem = []
      for (let i = 0; i < pagenum; i++) {
        // 先处理所有的新订单
        var post_data_a = {
          login_token: this.$store.getters.token,
          多个订单状态: ['新订单', '排产中'],
          pagination: {
            page: i + 1,
            limit: 100
          },
          sort: {
            更新时间: -1
          }
        }
        var response = await filter_need_schedule_order(post_data_a)
        allitem.push(...response.data)
        this.excleprogressValue = Number(
          parseFloat(
            (i / pagenum) * 98
          ).toFixed(1)
        )
      }
      console.log(allitem)
      this.centerDialogVisible = false
      return allitem
    },
    // 组合让表格显示订单表数据
    async combinationLetsTheTableDisplayOrderTableDataExcle(notArrangedOrderData, notArrangedOrderTableData) {
      // 组合orderTableData******************************start
      for (var i = 0; i < notArrangedOrderData.length; i++) {
        var notArrangedOrderItem = notArrangedOrderData[i]
        var orderItem = {
          订单编号: '',
          订单状态: '',
          订单日期: '',
          交货日期: '',
          '已排产数/目标总件数': ''
        }
        orderItem['订单编号'] = notArrangedOrderItem.unique_id
        orderItem['订单状态'] = notArrangedOrderItem.订单状态
        orderItem['订单日期'] = notArrangedOrderItem.订单日期
        orderItem['交货日期'] = notArrangedOrderItem.交货日期

        // 添加 动态tags信息
        for (let j = 0; j < this.$store.getters.订单的标签.length; j++) {
          const tagName = this.$store.getters.订单的标签[j]
          orderItem[tagName] = notArrangedOrderItem.tags[tagName]
          if (i === 0) {
            // 获取订单标签的标签名对应的所有标签值
            for (const key in this.$store.getters.theFullValueOfTheOrderLabel) {
              orderItem[key] = this.$store.getters.theFullValueOfTheOrderLabel[
                key
              ]
            }
          }
        }

        // 添加 '已排产数/目标总件数' '是否已经排产完成'
        var arranged_count = 0
        var target_count = 0
        for (var k = 0; k < notArrangedOrderItem['包含的产品'].length; k++) {
          arranged_count =
            arranged_count +
            notArrangedOrderItem['包含的产品'][k]['配码数量']['已经排产数量']
          target_count =
            target_count +
            notArrangedOrderItem['包含的产品'][k]['配码数量']['总数']
        }
        orderItem['已排产数/目标总件数'] =
          String(arranged_count) + '/' + String(target_count)

        notArrangedOrderTableData.push(orderItem)
      }
      // 组合orderTableData*************************************end
    },
    // 导出excel(当前页的仅仅是表格展示的数据)
    // exportExcel() {
    //   this.btnLoading = true
    //   setTimeout(() => {
    //     this.btnLoading = false
    //   }, 3000)
    //   var tHeader = [
    //     '订单编号',
    //     '订单状态',
    //     ...this.$store.getters.订单的标签,
    //     '订单日期',
    //     '交货日期',
    //     '已排产数/目标总件数'
    //   ]
    //   var filterVal = [
    //     '订单编号',
    //     '订单状态',
    //     ...this.$store.getters.订单的标签,
    //     '订单日期',
    //     '交货日期',
    //     '已排产数/目标总件数'
    //   ]
    //   var tableData = deepClone([...this.notArrangedOrderTableData])

    //   const data = this.formatJson(filterVal, tableData)
    //   import('@/vendor/Export2Excel').then(excel => {
    //     excel.export_json_to_excel({
    //       header: tHeader, // 表头 必填
    //       data, // 具体数据 必填
    //       filename: 'excel-list', // 非必填
    //       autoWidth: true, // 非必填
    //       bookType: 'xlsx' // 非必填
    //     })
    //   })
    // },
    // 导出符合条件的所有页数据
    async exportExcel() {
      const that = this
      this.btnLoading = true
      setTimeout(() => {
        this.btnLoading = false
      }, 3000)
      var tHeader = [
        '订单编号',
        '订单状态',
        ...this.$store.getters.订单的标签,
        '订单日期',
        '交货日期',
        '已排产数/目标总件数'
      ]
      var filterVal = [
        '订单编号',
        '订单状态',
        ...this.$store.getters.订单的标签,
        '订单日期',
        '交货日期',
        '已排产数/目标总件数'
      ]
      // 此处判断高级搜索是否打开了
      if (this.enableAdvancedSearch) {
        console.log('===========走的是高级搜索的导出excel===========')
        try {
          showLoading()
          var response = await that.$refs.orderConditionQuery.orderTableFilterAllItems()
          hideLoading()
          // 表数据
          var notArrangedOrderDataAdvancedSearch = response
          var notArrangedOrderTableDataAdvancedSearch = []
          // 组合让表格显示订单表数据
          this.combinationLetsTheTableDisplayOrderTableDataExcle(notArrangedOrderDataAdvancedSearch, notArrangedOrderTableDataAdvancedSearch)
          const data = this.formatJson(filterVal, notArrangedOrderTableDataAdvancedSearch)
        // debugger
        import('@/vendor/Export2Excel').then(excel => {
          excel.export_json_to_excel({
            header: tHeader, // 表头 必填
            data, // 具体数据 必填
            filename: '需要排产的订单', // 非必填
            autoWidth: true, // 非必填
            bookType: 'xlsx' // 非必填
          })
          this.btnLoading = false
        })
        } catch (error) {
          console.error(error)
          that.btnLoading = false
        }
      } else {
        console.log('===========走的是未打开高级搜索的导出excel===========')
        try {
          showLoading()
          var res = await this.filterOrderNodeAllItem()
          hideLoading()
          // 表数据
          var notArrangedOrderData = res
          var notArrangedOrderTableData = []
          // 组合让表格显示订单表数据
          this.combinationLetsTheTableDisplayOrderTableDataExcle(notArrangedOrderData, notArrangedOrderTableData)
          const data = this.formatJson(filterVal, notArrangedOrderTableData)
          // debugger
          import('@/vendor/Export2Excel').then(excel => {
            excel.export_json_to_excel({
              header: tHeader, // 表头 必填
              data, // 具体数据 必填
              filename: '需要排产的订单', // 非必填
              autoWidth: true, // 非必填
              bookType: 'xlsx' // 非必填
            })
            this.btnLoading = false
          })
        } catch (error) {
          console.error(error)
          that.btnLoading = false
        }
      }
    },
    // 把json数据格式化，以便导出excel
    formatJson(filterVal, jsonData) {
      return jsonData.map(v =>
        filterVal.map(j => {
          return v[j]
        })
      )
    }
  }
}
</script>

<style lang="scss" scoped>
.order-sheet-for-production-scheduling {
  .module-a {
    margin-bottom: 20px;
    .header {
      display: flex;
      justify-content: space-between;
      height: 40;
      align-items: center;
      background-color: #adbae7;
      span {
        width: 100%;
        text-align: center;
      }
    }
    .table {
      margin-bottom: 5px;
    }
    .el-pagination {
      float: right;
    }
  }
}
</style>

<style lang="scss">
.order-sheet-for-production-scheduling .batch-operation-switching {
  .el-switch__label {
    width: 60px;
    margin-right: 10px;
  }
}
</style>

