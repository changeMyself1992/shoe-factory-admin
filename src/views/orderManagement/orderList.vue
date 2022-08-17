<template>
  <div class="order-list">
    <div class="useintro">
      <el-dropdown :show-timeout="0" @command="handleCommand">
        <img src="@/assets/images/help.png" class="help">
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="a">如何使用Excel批量导入多个订单？</el-dropdown-item>
          <el-dropdown-item command="b">如何根据订单信息或者产品信息查询订单？</el-dropdown-item>
          <el-dropdown-item command="c">怎样将订单列表导出成Excel表格形式？</el-dropdown-item>
          <el-dropdown-item command="d">手机端如何保存分享订单页面？</el-dropdown-item>
          <el-dropdown-item command="e" class="blue">更多问题，请访问帮助中心</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <div class="module-a">
      <el-button type="primary" size="small" :disabled="!管理权限['订单管理可写']" @click="handleAdd()">添加新的订单</el-button>
    </div>

    <!-- 条件查询 -->
    <order-condition-query
      ref="orderConditionQuery"
      :current-page="currentPage"
      :page-size="pageSize"
      :callback-after-condition-query="callbackAfterConditionQuery"
      :callback-after-condition-clear="callbackAfterConditionClear"
      @initPagination="initPagination"
    />

    <!-- 查询结果列表 -->
    <div class="module-c">
      <div class="title">
        <span>订单记录：</span>
        <el-button
          type="primary"
          :loading="btnLoading"
          size="small"
          :disabled="!管理权限['订单列表可读']"
          @click="exportExcel()"
        >导出EXCEL表格</el-button>
        <el-button
          :loading="btnLoading"
          class="downloadExcel"
          type="primary"
          size="small"
          :disabled="!管理权限['订单列表可读']"
          @click="downloadExcelTemplate()"
        >下载订单excel模板</el-button>
        <div v-if="管理权限['订单管理可写']" class="uploadExcel">
          <upload-excel-component
            :loading="btnLoading"
            :on-success="handleSuccess"
            :before-upload="beforeUpload"
            :btn-name="'上传订单excel'"
          />
          <el-progress
            class="progress"
            :text-inside="true"
            :stroke-width="16"
            :percentage="excelUploadSchedule"
          />

        </div>
      </div>
      <el-table v-if="tableData.length>0" ref="table" :height="tableHeight" class="table" :data="tableData" border>
        <!-- 根据订单动态标签和属性自动生成表格 -->
        <el-table-column
          v-for="(item,index) in tableHeader"
          :key="index"
          :prop="tableProps[index]"
          :label="item"
          :width="calculateTheWidthOfThe(tableProps[index])"
          align="center"
        />

        <!-- 订单的其他属性 -->
        <el-table-column align="center" label="完成度" width="90">
          <template slot-scope="scope">
            <el-progress
              type="circle"
              :percentage="scope.row['订单完成百分比%数字']"
              :width="60"
              :stroke-width="8"
            />
          </template>
        </el-table-column>

        <el-table-column type="expand" align="center" label="更多信息展开" width="90">
          <template slot-scope="scope_a">
            <div>
              <product-list-a
                :operation-des="'产品详情'"
                :product-list-info="scope_a.row.包含的产品"
                :whether-the-tag-is-editable="false"
                :whether-the-brand-is-editable="false"
                :is-the-customer-product-number-editable="false"
                :is-show-product-detail="true"
                :is-pei-ma-editable="false"
                :is-show-add-product="false"
              />
              <div class="product-note-box">
                <el-card v-for="(item,index) in scope_a.row.已排产生产单列表" :key="index" class="box-card">
                  <div class="item">
                    <div>生产单时间：{{ item['生产单时间'] }}</div>
                    <div>生产单编号：{{ item['生产单编号'] }}</div>
                    <div class="btn">
                      <el-button
                        style="margin-botton:20px;"
                        type="primary"
                        size="mini"
                        @click="productionElementOperation(item)"
                      >查看生产单</el-button>
                    </div>

                  </div>
                </el-card>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column align="center" label="目标总件数" width="70">
          <template slot-scope="scope">{{ productCount(scope.row) }}</template>
        </el-table-column>

        <el-table-column align="center" label="排产度" width="80">
          <template slot-scope="scope">{{ arrangeCount(scope.row) }}/{{ productCount(scope.row) }}</template>
        </el-table-column>

        <el-table-column align="center" label="发货状态" width="80">
          <template slot-scope="scope">{{ yifahuoCount(scope.row) }}/{{ productCount(scope.row) }}</template>
        </el-table-column>

        <el-table-column align="center" label="操作" width="175">
          <template slot-scope="scope">
            <el-button
              style="margin-bottom:10px;"
              type="primary"
              size="mini"
              @click="handleLookOver(scope.row)"
            >查看</el-button>
            <el-button
              style="margin-bottom:10px;"
              type="primary"
              size="mini"
              :disabled="!管理权限['订单管理可写']"
              @click="handleEdit(scope.row)"
            >编辑</el-button>
            <el-button
              style="margin-left: 0px"
              type="primary"
              size="mini"
              @click="handlePrintProductionNote(scope.$index,'onGoing')"
            >打印</el-button>
            <el-button
              type="danger"
              size="mini"
              :disabled="!管理权限['订单管理可写']"
              @click="handleDelete(scope.row)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="paging">
        <el-pagination
          class="paging-a"
          :current-page="currentPage"
          :page-sizes="[50, 100, 150, 200]"
          :page-size="pageSize"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!--订单操作对话框-->
    <order-dialog-box
      :dialog-visible="orderDialogVisible"
      :on-close="closeEditOrderDialogCallback"
      :cur-operation-detail-info="curOperationDetailInfo"
      :open-mode="openMode"
    />
    <!--订单打印对话框-->
    <print-order
      :dialog-visible="printOrderDialogVisible"
      :on-close="colosePrintOrderDialogCallback"
      :print-detail-info-list="printDetailInfoList"
    />
  </div>
</template>

<script>
import {
  add_order,
  delete_order_by_id,
  generate_order_list_for_excel
} from '@/api/ordersForProductionScheduling'
import {
  filter_product
} from '@/api/maintenanceOfProcessPartsOfProductLibrary'
import { filter_client } from '@/api/customer'
import { generate_year_month_sequence_number } from '@/api/otherUtilityClasses'
import productListA from '@/views/components/productListA'
import orderConditionQuery from '@/views/components/orderConditionQuery' // 订单条件查询组件
import orderDialogBox from './components/orderDialogBox' // 订单对话框
import printOrder from './components/printOrder' // 订单打印对话框
import UploadExcelComponent from '@/views/components/UploadExcel'
import { deepClone, parseTime, isEmpty, beforeUploadExcel, excelTimeformatDate, isObjectValueEqual } from '@/utils'
import { mapGetters } from 'vuex'
export default {
  components: { orderDialogBox, productListA, orderConditionQuery, UploadExcelComponent, printOrder },
  data() {
    return {
      // 是否展示编辑订单对话框
      orderDialogVisible: false,
      // 是否展示打印订单对话框
      printOrderDialogVisible: false,
      // 要打印的订单数据
      printDetailInfoList: [],
      // 当前操作的订单信息（查看，编辑，删除）
      curOperationDetailInfo: {
        客户信息: {}
      },

      // 当前页数
      currentPage: 1,
      // 当前页数据量
      pageSize: 50,
      // 订单列表的表头列表
      tableHeader: [],
      // 订单列表的表头列表对应属性
      tableProps: [],
      // 订单列表的内容信息
      tableData: [],
      // 总条目数
      total: 0,
      openMode: '',
      // 是否启用按钮loading状态防止多次点击
      btnLoading: false,
      tableHeight: '',
      excelUploadSchedule: 0,
      excelHeader: []
    }
  },
  computed: {
    ...mapGetters([
      '管理权限'
    ])
  },
  watch: {},
  created() {
    this.tableHeight = window.innerHeight * 0.75
    this.initExcelHeader()
  },
  mounted() {
    this.callbackAfterConditionClear()
  },
  methods: {
    // 查看指引
    handleCommand(command) {
      console.log(command)
      var x = null
      var y = null
      if (command === 'e') {
        const { href } = this.$router.resolve({
          path: '/instructionsForuse/index'
        })
        window.open(href, '_blank')
      } else {
        if (command === 'a') {
          x = 4
          y = 1
        } else if (command === 'b') {
          x = 4
          y = 2
        } else if (command === 'c') {
          x = 4
          y = 3
        } else if (command === 'd') {
          x = 4
          y = 4
        }
        var routeUrl = this.$router.resolve({
          path: '/instructionsForuse/index',
          query: {
            x: x,
            y: y
          }
        })
        window.open(routeUrl.href, '_blank')
      }
    },
    // 初始化excelHeader
    initExcelHeader() {
      var 订单的标签 = []
      var tags_a = deepClone(this.$store.getters['订单的标签'])
      for (let i = 0; i < tags_a.length; i++) {
        订单的标签.push(tags_a[i] + '(订单信息)')
      }

      var 产品的标签 = []
      var tags_b = deepClone(this.$store.getters['产品的标签'])
      for (let i = 0; i < tags_b.length; i++) {
        订单的标签.push(tags_b[i] + '(产品信息)')
      }
      // 这是在给下载excel模板组合excelHeader数据所以我们用后端传过来的最新的配码数组
      var 配码数组 = deepClone(this.$store.getters['配码数组'])
      var 配码 = []
      for (let i = 0; i < 配码数组.length; i++) {
        var element = 配码数组[i]
        配码.push(String(element.size))
      }

      this.excelHeader = [
        '订单日期(订单信息)',
        '交货日期(订单信息)',
        '客户名称(订单信息)',
        ...订单的标签,
        ...产品的标签,
        '客户产品编号',
        '客户产品品牌',
        ...配码,
        '件数(产品信息)'
      ]
    },
    initPagination() {
      this.currentPage = 1
      this.pageSize = 50
      this.$nextTick(() => {
        this.$refs.orderConditionQuery.filterOrder()
      })
    },
    // 子组件清空搜索条件之后回调
    callbackAfterConditionClear() {
      this.excelUploadSchedule = 0
      this.currentPage = 1
      this.pageSize = 50
      this.$nextTick(() => {
        this.$refs.orderConditionQuery.filterOrder()
      })
    },
    // 子组件条件查询之后回调
    callbackAfterConditionQuery() {
      this.excelUploadSchedule = 0
      if (this.$refs.orderConditionQuery) {
        if (this.$refs.orderConditionQuery.tableData) {
          this.tableData = this.$refs.orderConditionQuery.tableData
        }
        this.tableProps = this.$refs.orderConditionQuery.tableProps
        this.tableHeader = this.$refs.orderConditionQuery.tableHeader
        this.total = this.$refs.orderConditionQuery.total
      }
    },
    // 添加新订单
    handleAdd() {
      this.$router.push('/orderManagement/addOrder')
    },
    // 查看按钮点击
    handleLookOver(orderInfo) {
      this.curOperationDetailInfo = orderInfo
      this.orderDialogVisible = true
      this.openMode = 'lookOver'
    },
    // 编辑按钮点击
    handleEdit(orderInfo) {
      this.curOperationDetailInfo = orderInfo
      this.orderDialogVisible = true
      this.openMode = 'edit'
    },
    // 打印按钮点击
    handlePrintProductionNote(index, mode) {
      var array = []
      if (mode === 'onGoing') {
        array.push(this.tableData[index])
      } else {
        array.push(this.tableData[index])
      }
      this.printDetailInfoList = array
      this.printOrderDialogVisible = true
    },
    // 订单对话框关闭后回调
    closeEditOrderDialogCallback(status) {
      this.orderDialogVisible = status
      this.$nextTick(() => {
        this.$refs.orderConditionQuery.filterOrder()
      })
    },
    // 打印对话框关闭后回调
    colosePrintOrderDialogCallback(status) {
      this.printOrderDialogVisible = false
    },
    // 删除按钮点击
    handleDelete(orderInfo) {
      this.$confirm('确认删除订单?', 'Warning', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          const parameter = {
            login_token: this.$store.getters.token,
            unique_id: orderInfo.unique_id
          }
          const res = await delete_order_by_id(parameter)
          this.$message({
            type: 'success',
            message: res.msg
          })
          this.$refs.orderConditionQuery.filterOrder()
        })
        .catch(err => {
          console.error(err)
        })
    },
    // 返回产品总数
    productCount(scope) {
      var count = 0
      scope['包含的产品'].forEach(item => {
        count += item['配码数量']['总数']
      })
      return count
    },
    // 已发货数量
    yifahuoCount(scope) {
      var count = 0
      scope['包含的产品'].forEach(item => {
        count += item['结算情况']['发货数量']
      })
      return count
    },
    // 已经排产总数
    arrangeCount(scope) {
      var count = 0
      scope['包含的产品'].forEach(item => {
        count += item['配码数量']['已经排产数量']
      })
      return count
    },
    // 页码控制时，每页数量改变的处理函数
    handleSizeChange(val) {
      this.pageSize = val
      this.$nextTick(() => {
        this.$refs.orderConditionQuery.filterOrder()
      })
    },
    // 页码控制时，每页码改变改变的处理函数
    handleCurrentChange(val) {
      this.currentPage = val
      this.$nextTick(() => {
        this.$refs.orderConditionQuery.filterOrder()
      })
    },
    // 生产单操作响应
    async productionElementOperation(productionElement) {
      const { href } = this.$router.resolve({
        path: '/productOrderManagement/arrangeProductionNote',
        query: {
          mode: 'detail',
          from: 'orderList',
          login_token: this.$store.getters.token,
          unique_id: productionElement.unique_id
        }
      })
      window.open(href, '_blank')
    },
    // 计算宽度
    calculateTheWidthOfThe(name) {
      switch (name) {
        case '订单编号':
          return '140'
        case '订单日期':
          return '100'
        case '交货日期':
          return '100'
        default:
          return ''
      }
    },

    // 导出excel
    async exportExcel() {
      this.btnLoading = true
      var parameter = this.$refs.orderConditionQuery.order_filter_parameter
      const res = await generate_order_list_for_excel(parameter)
      setTimeout(() => {
        this.btnLoading = false
      }, 1000)

      const tHeader = res.data.header
      const filterVal = res.data.header
      var tableData = res.data.data
      tableData = tableData.map(item => {
        item['订单完成百分比'] = Number(parseFloat(item['订单完成百分比'] * 100).toFixed(2))
        return item
      })
      const data = this.formatJson(filterVal, tableData)
      import('@/vendor/Export2Excel').then(excel => {
        excel.export_json_to_excel({
          header: tHeader, // 表头 必填
          data, // 具体数据 必填
          filename: 'excel-list', // 非必填
          autoWidth: true, // 非必填
          bookType: 'xlsx' // 非必填
        })
      })
    },

    // 下载excel模板
    downloadExcelTemplate() {
      this.btnLoading = true
      setTimeout(() => {
        this.btnLoading = false
      }, 1000)
      var 订单的标签 = deepClone(this.$store.getters['订单的标签'])
      var 产品的标签 = deepClone(this.$store.getters['产品的标签'])
      // 下载excel模板用后端给的配码数组
      var 配码数组 = deepClone(this.$store.getters['配码数组'])
      var 配码 = []
      for (let i = 0; i < 配码数组.length; i++) {
        var element = 配码数组[i]
        配码.push(String(element.size))
      }

      var tHeader = this.excelHeader
      var filterVal = this.excelHeader
      var tableData = []

      var tableItem = {}

      tableItem['订单日期(订单信息)'] = new Date(parseTime(new Date()))
      var date = new Date(parseTime(new Date()))
      date.setTime(date.getTime() + 24 * 60 * 60 * 1000)
      tableItem['交货日期(订单信息)'] = date
      tableItem['客户名称(订单信息)'] = ''
      for (let i = 0; i < 订单的标签.length; i++) {
        var key = 订单的标签[i]
        tableItem[key + '(订单信息)'] = ''
      }
      for (let i = 0; i < 产品的标签.length; i++) {
        key = 产品的标签[i]
        tableItem[key + '(产品信息)'] = ''
      }
      tableItem['客户产品编号'] = ''
      tableItem['客户产品品牌'] = ''
      for (let i = 0; i < 配码.length; i++) {
        key = 配码[i]
        tableItem[key] = 0
      }
      tableItem['件数' + '(产品信息)'] = 1
      tableData.push(tableItem)

      console.log(tHeader)
      console.log(filterVal)
      console.log(tableData)

      var data = this.formatJson(filterVal, tableData)
      console.log(2222)
      console.log(data)
      import('@/vendor/Export2Excel').then(excel => {
        excel.export_json_to_excel({
          header: tHeader, // 表头 必填
          data, // 具体数据 必填
          filename: '订单列表模板', // 非必填
          autoWidth: true, // 非必填
          bookType: 'xlsx' // 非必填
        })
      })
    },

    // 上传excel之前检查
    beforeUpload(file) {
      this.excelUploadSchedule = 0
      if (beforeUploadExcel(file)) {
        this.btnLoading = true
        return true
      } else {
        return false
      }
    },

    // 上传成功后处理
    async handleSuccess({ results, header }) {
      console.log('解析订单列表excel_header：', header)
      if (!this.$_.isEqual(header, this.excelHeader)) {
        this.$message({
          type: 'warning',
          message: '必须按照指定的订单excel模板进行提交！！！'
        })
        this.btnLoading = false
        return
      }
      console.log('解析订单列表excel_json：', results)

      // 查询客户列表
      const response_a = await filter_client({ login_token: this.$store.getters.token })
      var clientList = response_a.data
      var orderTags = []
      var tags_a = deepClone(this.$store.getters['订单的标签'])
      for (let i = 0; i < tags_a.length; i++) {
        orderTags.push(tags_a[i])
      }
      // 是否允许产品重复
      var whetherOrNotDuplicationIsAllowed = false

      // 1.遍历results每一行的数据，通过判断 客户名称，订单标签，订单日期，交货日期，来分订单
      var orderList = []
      for (let a = 0; a < results.length; a++) {
        var element_a = results[a]
        // 判断 订单日期，交货日期 是必填项
        if (isEmpty(element_a['订单日期(订单信息)']) || isEmpty(element_a['交货日期(订单信息)'])) {
          this.$message({
            type: 'warning',
            message: `excel表第${a + 2}行，订单日期，交货日期是必填项！`
          })
          this.btnLoading = false
          return
        }
        if (isEmpty(excelTimeformatDate(element_a['交货日期(订单信息)'])) ||
        isEmpty(excelTimeformatDate(element_a['订单日期(订单信息)']))) {
          this.$message({
            type: 'warning',
            message: `请填写正确的时间格式！！！`
          })
          this.btnLoading = false
          return
        }
        // 判断 交货日期如果小于 订单日期 那么也不允许提交
        if (excelTimeformatDate(element_a['交货日期(订单信息)']) <= excelTimeformatDate(element_a['订单日期(订单信息)'])) {
          this.$message({
            type: 'warning',
            message: `excel表第${a + 2}行，交货日期不能小于等于订单日期！`
          })
          this.btnLoading = false
          return
        }
        element_a['交货日期(订单信息)'] = parseTime(excelTimeformatDate(element_a['交货日期(订单信息)']))
        element_a['订单日期(订单信息)'] = parseTime(excelTimeformatDate(element_a['订单日期(订单信息)']))
        element_a['客户名称(订单信息)'] = String(element_a['客户名称(订单信息)']).trim()
        // 判断当前行 是否需要组合为一个新订单，还是需要在orderList中找到订单来并入产品
        var index_a = -1
        for (let j = 0; j < orderList.length; j++) {
          var order_a = orderList[j]

          if (order_a['交货日期'] !== element_a['交货日期(订单信息)']) continue
          if (order_a['订单日期'] !== element_a['订单日期(订单信息)']) continue

          // 如果客户信息不为空 那么判断他俩名称是否相同
          if (!isEmpty(order_a['客户信息'])) {
            if (order_a['客户信息']['名称'] !== element_a['客户名称(订单信息)']) continue
          } else {
            // 如果客户信息为空 ,element_a['客户名称']不为空字符串 那么也不能合并
            if (element_a['客户名称(订单信息)'] !== '') continue
          }

          var tag_isEqual = true
          for (const key in order_a.tags) {
            element_a[key + '(订单信息)'] = String(element_a[key + '(订单信息)']).trim()
            if (order_a.tags[key] !== element_a[key + '(订单信息)']) {
              tag_isEqual = false
              break
            }
          }
          if (!tag_isEqual) continue

          index_a = j
        }

        // 2.1等于-1 代表要组合一个新订单
        if (index_a === -1) {
          var order = deepClone(this.$store.getters['空的订单结构'])
          order['交货日期'] = element_a['交货日期' + '(订单信息)']
          order['订单日期'] = element_a['订单日期' + '(订单信息)']

          // 判断 客户名称 （不是必填，但是只要用户填写了那就必须是组合一个客户结构）
          var clientName = element_a['客户名称' + '(订单信息)'].trim()
          if (!isEmpty(clientName)) {
            var index_b = clientList.findIndex(item => {
              return item['名称'] === clientName
            })
            if (index_b === -1) {
            // 如果没找到那代表客户瞎写了一个客户名称，给他组合一个客户结构
              var 空的客户结构 = deepClone(this.$store.getters['空的客户结构'])
              空的客户结构['名称'] = clientName

              var tag_names = deepClone(this.$store.getters['客户的标签'])
              for (let f = 0; f < tag_names.length; f++) {
                空的客户结构.tags[tag_names[f]] = ''
              }
              order['客户信息'] = 空的客户结构
            } else {
              // 如果找到了
              order['客户信息'] = clientList[index_b]
            }
          }

          // 组合标签
          var tags = {}
          for (let c = 0; c < orderTags.length; c++) {
            const tag = orderTags[c]
            tags[tag] = String(element_a[tag + '(订单信息)']).trim()
          }
          order.tags = tags

          // 生成订单编号
          const res_a = await generate_year_month_sequence_number({
            login_token: this.$store.getters.token,
            流水单分组: 'DD'
          })
          var code = res_a.data['流水号']
          order['订单编号'] = code

          // 组合包含的产品
          var product_a = await this.theProductStructureContainedInTheCompositeOrder(element_a)
          product_a.excelRowIndex = a + 2 // 把它在excel表中的行索引记下来
          // 判断如果产品总数为0，那么也不允许提交
          if (isEmpty(product_a.配码数量.总数)) {
            this.$message({
              message: `excel表第${a + 2}行，没有产品配码信息！`,
              type: 'warning'
            })
            this.btnLoading = false
            return
          }
          order['包含的产品'] = []
          order['包含的产品'].push(product_a)
          orderList.push(order)
        } else {
          // 2.2要执行并入订单的操作
          var product_b = await this.theProductStructureContainedInTheCompositeOrder(element_a)
          product_b.excelRowIndex = a + 2 // 把它在excel表中的行索引记下来
          // 判断如果产品总数为0，那么也不允许提交
          if (isEmpty(product_b.配码数量.总数)) {
            this.$message({
              message: `excel表第${a + 2}行，没有产品配码信息！`,
              type: 'warning'
            })
            this.btnLoading = false
            return
          }
          // 判断如果产品的标签是完全一致的，那么也不允许提交
          for (let d = 0; d < orderList[index_a]['包含的产品'].length; d++) {
            if (whetherOrNotDuplicationIsAllowed) continue
            const element_d = orderList[index_a]['包含的产品'][d]
            if (isObjectValueEqual(element_d.产品信息.tags, product_b.产品信息.tags)) {
              try {
                await this.$confirm(
                  `excel表第${element_d.excelRowIndex}行，和第${a + 2}行，出现了重复的产品，是否要添加重复的产品？`,
                  {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                  }
                )
                whetherOrNotDuplicationIsAllowed = true
              } catch (error) {
                this.btnLoading = false
                return
              }
            }
          }

          orderList[index_a]['包含的产品'].push(product_b)
        }
      }

      // 2.遍历 orderList 发请求添加订单
      console.log('组合orderList完成：', orderList)
      for (let i = 0; i < orderList.length; i++) {
        const element = orderList[i]
        var parameter = {
          login_token: this.$store.getters.token,
          data: element
        }
        await add_order(parameter)
        this.excelUploadSchedule = Number(parseFloat(((i + 1) / orderList.length) * 100).toFixed(1))
      }
      this.$message({
        type: 'success',
        message: `订单上传成功,添加了${orderList.length}张订单`
      })
      this.btnLoading = false
      this.callbackAfterConditionClear()
    },

    // 组合 订单包含的产品结构
    async theProductStructureContainedInTheCompositeOrder(row) {
      var productTags = deepClone(this.$store.getters['产品的标签'])
      // 1.先拿到该元素的产品标签
      var tags = {}
      for (var key in row) {
        if (key.includes('(')) {
          var new_key = key.split('(')[0]
          if (productTags.includes(new_key)) {
            tags[new_key] = String(row[key]).trim()
          }
        }
      }
      var product = deepClone(this.$store.getters['订单包含的产品空元素'])

      // product.产品信息 ****组合*********************************************************************start
      var post_data = {
        login_token: this.$store.getters.token,
        tags: tags
      }
      // 3.去跟数据库比对。查找是否有完全一模一样的标签产品
      var res = await this.filterProducts(post_data)
      var res_a = {}
      var code = ''
      // 判断 如果查询结果为0，或者查询结果为空 那我们就要生成一个新产品，
      if (isEmpty(res) || res.length === 0) {
        res_a = await generate_year_month_sequence_number({
          login_token: this.$store.getters.token,
          流水单分组: 'CPD'
        })
        code = res_a.data['流水号']
        product.产品信息.产品编号 = code
        product.产品信息.unique_id = code
        product.产品信息.tags = tags
      } else {
        // 如果查询结果长度 大于0,那么遍历所有的产品 查找是否有和我输入的标签完全一致的产品 如果有那么选中它
        var index = res.findIndex(element_b => {
          return isObjectValueEqual(element_b.tags, tags)
        })
        // 如果有 那么给product.产品信息赋值
        if (index !== -1) {
          product.产品信息 = res[index]
        } else {
          res_a = await generate_year_month_sequence_number({
            login_token: this.$store.getters.token,
            流水单分组: 'CPD'
          })
          code = res_a.data['流水号']
          // 如果没有找到完全相等的那么 使用新的编号
          product.产品信息.产品编号 = code
          product.产品信息.unique_id = code
          product.产品信息.tags = tags
        }
      }
      // product.产品信息 ****组合*********************************************************************end

      // product.品牌 和 product.客户产品编号 ****组合******************************************************start
      product['品牌'] = String(row['客户产品品牌'])
      product['客户产品编号'] = String(row['客户产品编号'])
      // product.品牌 和 product.客户产品编号 ****组合******************************************************end

      // product.配码数量 ****组合******************************************************start
      product.配码数量['件数'] = isEmpty(Number(parseInt(row['件数(产品信息)']))) ? 1 : Number(parseInt(row['件数(产品信息)']))
      // 解析excel模板用后端给的配码数组
      for (let c = 0; c < this.$store.getters['配码数组'].length; c++) {
        const element_c = this.$store.getters['配码数组'][c]
        product.配码数量['配码'].push({
          国标码: element_c.gjm,
          尺码: element_c.size,
          已排产数量: 0,
          目标数量: isEmpty(Number(row[String(element_c.size)])) ? 0 : Number(parseInt(row[String(element_c.size)]) * product.配码数量['件数'])
        })
      }

      // 计算总数
      var count = 0
      for (let b = 0; b < product['配码数量']['配码'].length; b++) {
        var element = product['配码数量']['配码'][b]
        count = count + Number(element.目标数量)
      }
      product['配码数量']['总数'] = count
      product.配码数量['件数'] = 1
      // product.配码数量 ****组合******************************************************end
      return product
    },

    // 根据条件对产品进行搜索
    async filterProducts(post_data) {
      var response = await filter_product(post_data)
      return response.data
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

<style lang="scss">
.order-list {
  padding: 20px;
  .module-a {
    margin-bottom: 20px;
  }
  .module-c {
    width: 100%;
    .title {
      height: 40px;
      display: flex;
      align-items: center;
      .uploadExcel{
        margin-left: 10px;
        display: flex;
        align-items: center;
        .progress{
          margin-left: 10px;
          width: 150px;
        }
      }
    }
    .table {
      width: 100%;
      margin-bottom: 20px;
    }
    .product-note-box {
      width: 100%;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      .box-card {
        width: 220px;
        margin: 5px;
        .btn{
          margin-bottom: 20px;
        }
      }
    }
    .paging {
      overflow: hidden;
      .paging-a {
        float: right;
      }
    }
  }

  .el-card__body {
    padding-bottom: 0px;
  }
}
</style>

