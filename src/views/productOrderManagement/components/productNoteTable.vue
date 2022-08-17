<template>
  <div class="product-note-table">
    <product-note-condition-query
      v-if="enableAdvancedSearch"
      ref="productNoteConditionQuery"
      :current-page="currentPage"
      :page-size="pageSize"
      :callback-after-condition-clear="callbackAfterConditionClear"
      :callback-after-condition-query="callbackAfterConditionQuery"
      :is-show-product-note-status="false"
      :multiple-production-single-state="productNoteModel==='onGoing'?['新生产单', '生产中']:['完成']"
    />
    <div class="module-b">
      <div :class="['header', productNoteModel==='onGoing'?'bg-a':'bg-b']">
        <el-switch
          v-if="whetherBatchOperationSwitchIsDisplayed"
          v-model.trim="productionBatchOperationOrNot"
          class="batch-operation-switching"
          active-color="#13ce66"
          inactive-color="#ccc"
          active-text="批量操作"
        />
        <el-button
          v-if="productionBatchOperationOrNot && whetherBatchOperationSwitchIsDisplayed"
          type="primary"
          size="small"
          style="margin-right:10px;"
          :disabled="!管理权限['生产单详情可写']"
          @click="onBatchPrintClickFormTheOnGoing"
        >批量打印</el-button>
        <el-button
          v-if="productionBatchOperationOrNot && whetherBatchOperationSwitchIsDisplayed"
          type="primary"
          size="small"
          :loading="btnLoading"
          style="margin-right:10px;"
          :disabled="!管理权限['生产单详情可写']"
          @click="onBatchRevisionOfProcessWagesBtnClickFormTheOnGoing"
        >批量修正工序工资</el-button>
        <el-button
          v-if="productionBatchOperationOrNot && productNoteModel==='onGoing' && whetherBatchOperationSwitchIsDisplayed"
          type="danger"
          size="small"
          :loading="btnLoading"
          style="margin-right:10px;"
          :disabled="!管理权限['生产单详情可写']"
          @click="onBatchDeleteOfProductNoteBtnClickFormTheOnGoing"
        >批量删除</el-button>
        <el-switch
          v-if="whetherToDisplayTheAdvancedSearchSwitch"
          v-model.trim="enableAdvancedSearch"
          class="batch-operation-switching"
          active-color="#13ce66"
          inactive-color="#ccc"
          active-text="高级搜索"
        />
        <span>{{ title }}</span>
        <el-button
          v-if="whetherToShowExportExcex"
          type="primary"
          size="small"
          :loading="btnLoading"
          :disabled="!管理权限['生产单列表可读']"
          @click="exportExcel"
        >导出EXCEL表格</el-button>
      </div>
      <el-table
        ref="multipleTable"
        :height="tableHeight"
        class="table"
        :data="productionNoteTableData"
        border
        @selection-change="onSelectChange"
      >
        <el-table-column
          v-if="productionBatchOperationOrNot"
          type="selection"
          width="40"
          align="center"
        />

        <el-table-column width="140" align="center" prop="生产单编号" label="生产单编号" />
        <el-table-column width="140" align="center" prop="对应订单号" label="对应订单号" />
        <el-table-column
          width="110"
          align="center"
          prop="生产单状态"
          label="生产单状态"
          :filters="[{ text: '生产中', value: '生产中' }, { text: '新生产单', value: '新生产单' },{ text: '完成', value: '完成' }]"
          :filter-method="filterProductNoteStatus"
        />
        <el-table-column width="95" align="center" prop="生产完成度" label="生产完成度">
          <template slot-scope="scope">
            <el-progress
              type="circle"
              :percentage="scope.row['生产完成度']"
              :width="60"
              :stroke-width="8"
            />
          </template>
        </el-table-column>
        <el-table-column width="120" align="center" prop="生产单时间" label="生产单时间" sortable />
        <el-table-column width="110" align="center" prop="总排产数" label="总排产数" sortable />
        <el-table-column width="140" align="center" prop="产品编号" label="产品编号" />
        <el-table-column align="center" label="产品信息">
          <template slot-scope="scope">
            <el-tag
              v-for="(value, name) in scope.row.产品信息"
              :key="name"
              class="tag"
            >{{ name }}:{{ value }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          v-if="whetherTheActionItemIsDisplayed"
          width="180"
          align="center"
          label="操作"
        >
          <template slot-scope="scope">
            <div class="btn-box">
              <el-button
                type="primary"
                size="mini"
                @click="handleProductionNoteDetail(scope.$index,'onGoing')"
              >查看</el-button>
              <el-button
                v-if="productNoteModel==='onGoing'"
                type="primary"
                size="mini"
                :disabled="!管理权限['生产单详情可写']"
                @click="handleEditOrder(scope.$index,'onGoing')"
              >编辑</el-button>
              <el-button
                type="primary"
                size="mini"
                :disabled="!管理权限['生产单详情可写']"
                @click="handlePrintProductionNote(scope.$index,'onGoing')"
              >打印</el-button>
              <el-button
                v-if="false"
                type="danger"
                size="mini"
                :disabled="!管理权限['生产单详情可写']"
                @click="handleFinishProductionNote(scope.row)"
              >完成</el-button>
              <el-button
                v-if="productNoteModel==='onGoing'"
                type="danger"
                size="mini"
                :loading="btnLoading"
                :disabled="!管理权限['生产单详情可写']"
                @click="handleDeleteProductionNode(scope.row)"
              >删除</el-button>
              <el-button
                v-if="productNoteModel==='finished'"
                type="danger"
                size="mini"
                :loading="btnLoading"
                :disabled="!管理权限['生产单详情可写']"
                @click="handleToReview(scope.row)"
              >重新评估</el-button>
              <el-button
                type="primary"
                size="mini"
                @click="toViewTheProduct(scope.row)"
              >查看产品</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        class="el-pagination"
        :current-page="currentPage"
        :page-sizes="pageSizes"
        :page-size="pageSize"
        :total="productionNote_total"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="productionNote_handlePageChange"
        @size-change="productionNote_handlePageSizeChange"
      />
    </div>
    <!--打印生产单对话框-->
    <print-production-note
      :dialog-visible="printProductionNoteDialogVisible"
      :on-close="colosePrintProductionNoteDialogCallback"
      :cur-operation-detail-info="printDetailInfoList"
      :print-contain-detail="isPrintContainDetailBool"
    />
    <!--批量修改工序工资对话框-->
    <batch-revision-of-process-wages
      :dialog-visible="batchRevisionOfProcessWagesDialogVisible"
      :cur-operation-detail-info="wageChangeDetailInfoList"
      :on-close="coloseBatchRevisionOfProcessWagesDialogCallback"
      :unique-ids="unique_ids"
    />
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
    <!-- 工厂端生产单打印可选择添加产品原材料清单 -->
    <el-dialog
      :title="printContainProductDetailDialogTitle"
      :visible.sync="printContainProductDetailDialog"
      width="30%"
      center
    >
      <div><el-checkbox v-model="isPrintContainDetailBool">打印时包含产品原料信息</el-checkbox></div>
      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="printContainProductDetailDialog = false">取 消</el-button>
        <el-button size="mini" type="primary" @click="surePrintContainProduct">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  filter_production_note,
  delete_production_note_by_id,
  finish_production_note_by_id,
  batch_edit_production_note_process_salary_by_ids,
  batch_delete_production_note_by_ids,
  review_production_note_by_id
} from '@/api/ordersForProductionScheduling'
import { deepClone, isEmpty } from '@/utils'
import productNoteConditionQuery from '@/views/components/productNoteConditionQuery' // 生产单条件查询组件
import printProductionNote from './printProductionNote' // 打印生产单对话框
import batchRevisionOfProcessWages from './batchRevisionOfProcessWages' // 批量修改工序工资对话框
import { mapGetters } from 'vuex'
import { showLoading, hideLoading } from '@/utils/loading'
export default {
  components: {
    printProductionNote,
    batchRevisionOfProcessWages,
    productNoteConditionQuery
  },
  props: {
    // 该生产单表的模式（正在进行，已完成）
    productNoteModel: {
      type: String,
      default: 'onGoing'
    },
    // 生产单查询之后回调父组件的方法
    callBackAfterTheQuery: {
      type: Function,
      default() {
        return
      }
    },
    // 进行了删除，强制完成 操作后调用该方法，让父组件把所有子组件的数据都刷一遍
    callBackAfterTheOperation: {
      type: Function,
      default() {
        return
      }
    },
    // 选择了行数据后回调父组件
    callBackSelectChange: {
      type: Function,
      default() {
        return
      }
    },
    // 是否显示导出excex
    whetherToShowExportExcex: {
      type: Boolean,
      default: true
    },
    // 是否显示操作项
    whetherTheActionItemIsDisplayed: {
      type: Boolean,
      default: true
    },
    // 是否显示批量操作开关
    whetherBatchOperationSwitchIsDisplayed: {
      type: Boolean,
      default: true
    },
    // 是否显示高级搜索开关
    whetherToDisplayTheAdvancedSearchSwitch: {
      type: Boolean,
      default: true
    },
    // 是否默认启用高级搜索
    whetherAdvancedSearchIsEnabledByDefault: {
      type: Boolean,
      default: false
    },
    // 默认的pageSize
    defaultPageSize: {
      type: Number,
      default: 30
    },
    // 默认的pageSizes
    defaultPageSizes: {
      type: Array,
      default() {
        return [30, 60, 100, 150]
      }
    },
    // 是否启用多行数据Checkbox
    whetherMultipleSelectionIsEnabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      // 导出excel的进度
      excleprogressValue: 0,
      centerDialogVisible: false,
      //  生产单表（表格展示,组合出来的数据）
      productionNoteTableData: [],
      // 生产单信息（api请求回来的生产单列表）
      productionNoteData: [],
      // 当前页数
      currentPage: 1,
      // 当前页数据量
      pageSize: 0,
      // 当前的页码数组
      pageSizes: [],
      // 是否启用 表格 多行数据选择
      productionBatchOperationOrNot: false,
      // 生产单总条目数
      productionNote_total: 0,
      // 是否启用按钮loading状态防止多次点击
      btnLoading: false,
      // 是否展示打印排产单对话框
      printProductionNoteDialogVisible: false,
      // 是否展示 批量修改工序工资对话框
      batchRevisionOfProcessWagesDialogVisible: false,
      // 点击进行排产，查看，编辑，删除操作时，需要传递的信息
      curOperationDetailInfo: {},
      // 传递给打印组件的信息列表（应为可能很多生产单一起打印所以是个数组）
      printDetailInfoList: [],
      // 传递给 批量修改工序工资对话框 对象
      wageChangeDetailInfoList: [],
      // 修改工序工资的生产单编号列表
      unique_ids: [],
      // 是否启用高级搜索功能
      enableAdvancedSearch: false,
      tableHeight: '',
      // 工厂端生产单打印可选择添加产品原材料清单
      // 是否显示【提示可选择添加产品原材料清单】弹窗
      printContainProductDetailDialog: false,
      // 是否勾选 打印时包含产品原料信息
      isPrintContainDetailBool: false,
      // 临时打印数据
      printContainObj: null,
      // 提示可选择添加产品原材料清单弹窗标题
      printContainProductDetailDialogTitle: ''
    }
  },
  computed: {
    ...mapGetters(['管理权限']),
    title() {
      if (this.productNoteModel === 'onGoing') return '正在进行的生产单'
      else return '最近完成的生产单'
    }
  },
  watch: {
    enableAdvancedSearch: function(newVal, oldVal) {
      // 开启高级搜索
      if (newVal) {
        this.callbackAfterConditionClear()
      }
      // 关闭高级搜索
      if (!newVal) {
        this.filterProductionNode()
      }
    },
    productionBatchOperationOrNot: function(newVal, oldVal) {
      // 关闭多行数据选择
      if (!newVal) {
        this.$refs.multipleTable.clearSelection()
        this.printDetailInfoList = []
        this.unique_ids = []
      }
    }
  },
  created() {
    this.tableHeight = window.innerHeight * 0.75
    this.pageSize = this.defaultPageSize
    this.pageSizes = this.defaultPageSizes
    this.productionBatchOperationOrNot = this.whetherMultipleSelectionIsEnabled
    // 如果默认启用高级搜索功能
    if (this.whetherAdvancedSearchIsEnabledByDefault) {
      this.enableAdvancedSearch = true
    }
    this.filterProductionNode()
  },
  mounted() {},
  methods: {
    // 子组件清空搜索条件之后回调
    callbackAfterConditionClear() {
      this.currentPage = 1
      this.pageSize = this.defaultPageSize
      this.$nextTick(() => {
        this.$refs.productNoteConditionQuery.filterProductNote()
      })
    },

    // 子组件条件查询之后回调
    callbackAfterConditionQuery(response) {
      this.productionNote_total = response.total_count
      this.productionNoteData = response.data
      this.productionNoteTableData = []

      // 组合让表格能展示的数据******************************start
      this.tableProductionNoteDisplaysCombinationsOfData(
        this.productionNoteData,
        this.productionNoteTableData
      )
      // 组合让表格能展示的数据******************************end
      this.callBackAfterTheQuery(this.productNoteModel)
    },

    // 获取所有进行中的生产单
    async filterProductionNode(preview_flag = true) {
      var post_data_a = {
        login_token: this.$store.getters.token,
        pagination: {
          page: parseInt(this.currentPage),
          limit: parseInt(this.pageSize)
        },
        sort: {
          更新时间: -1
        },
        preview_flag: preview_flag
      }
      if (this.productNoteModel === 'onGoing') {
        post_data_a['多个生产单状态'] = ['新生产单', '生产中']
      } else post_data_a['生产单状态'] = '完成'
      // 先处理所有的新订单
      var response = await filter_production_note(post_data_a)
      this.productionNote_total = response.total_count
      this.productionNoteData = response.data
      this.productionNoteTableData = []
      // 组合让表格能展示的数据******************************start
      this.tableProductionNoteDisplaysCombinationsOfData(
        this.productionNoteData,
        this.productionNoteTableData
      )
      // 组合让表格能展示的数据******************************end

      // 查询生产单后调用父组件的方法
      this.callBackAfterTheQuery(this.productNoteModel)
    },

    /**
     * 生产单表格数据的组合
     * ProductionNoteData 生产单数据列表(api传回来的完整列表)
     * ProductionNoteTableData (要以表格形式展示的生产单列表)
     */
    tableProductionNoteDisplaysCombinationsOfData(
      ProductionNoteData,
      ProductionNoteTableData
    ) {
      for (var i = 0; i < ProductionNoteData.length; i++) {
        var productionNoteDataItem = ProductionNoteData[i]
        var productionNoteTableDataItem = {
          生产单编号: '',
          生产单状态: '',
          对应订单号: '',
          生产完成度: 0,
          生产完成度百分比: '',
          生产单时间: '',
          产品编号: '',
          产品信息: {},
          总排产数: 0
        }
        productionNoteTableDataItem['生产单编号'] =
          productionNoteDataItem['生产单编号']
        productionNoteTableDataItem['生产单状态'] =
          productionNoteDataItem['生产单状态']
        productionNoteTableDataItem['对应订单号'] =
          productionNoteDataItem['对应订单']['订单编号']
        productionNoteTableDataItem['生产完成度'] = parseInt(
          (productionNoteDataItem['完成百分比'] * 100).toFixed(0)
        )
        productionNoteTableDataItem['生产完成度百分比'] =
          (productionNoteDataItem['完成百分比'] * 100).toFixed(0) + '%'
        productionNoteTableDataItem['生产单时间'] =
          productionNoteDataItem['生产单时间']
        productionNoteTableDataItem['产品编号'] =
          productionNoteDataItem['排产产品']['产品信息']['产品编号']
        for (const key in productionNoteDataItem['排产产品']['产品信息'].tags) {
          productionNoteTableDataItem['产品信息'][key] =
            productionNoteDataItem['排产产品']['产品信息'].tags[key]
          // 把产品标签信息，放外面 导出excel的时候要用
          productionNoteTableDataItem[key] =
            productionNoteDataItem['排产产品']['产品信息'].tags[key]
        }
        productionNoteTableDataItem['总排产数'] =
          productionNoteDataItem['排产产品']['排产配码数量']['总排产数']

        if (
          !isEmpty(productionNoteDataItem['排产产品']['排产配码数量']['配码'])
        ) {
          for (
            let j = 0;
            j <
            productionNoteDataItem['排产产品']['排产配码数量']['配码'].length;
            j++
          ) {
            const element =
              productionNoteDataItem['排产产品']['排产配码数量']['配码'][j]
            productionNoteTableDataItem[String(element['尺码'])] =
              element['目标数量']
          }
        }
        if (!isEmpty(productionNoteDataItem['生产单备注'])) {
          productionNoteTableDataItem['生产单备注'] =
            productionNoteDataItem['生产单备注']
        }

        ProductionNoteTableData.push(productionNoteTableDataItem)
      }
    },

    // page页数 发生改变的时候
    productionNote_handlePageChange(val) {
      this.currentPage = val
      // 如果启用了高级搜索，那么应该调用子组件的搜索方法，因为要带上条件
      // 没有启用高级搜索的，调用本组件的搜索方法即可
      if (this.enableAdvancedSearch) {
        this.$nextTick(() => {
          this.$refs.productNoteConditionQuery.filterProductNote()
        })
      } else {
        this.filterProductionNode()
      }
    },

    // pageSize每页数量 发生改变的时候
    productionNote_handlePageSizeChange(val) {
      this.pageSize = val
      // 如果启用了高级搜索，那么应该调用子组件的搜索方法，因为要带上条件
      // 没有启用高级搜索的，调用本组件的搜索方法即可
      if (this.enableAdvancedSearch) {
        this.$nextTick(() => {
          this.$refs.productNoteConditionQuery.filterProductNote()
        })
      } else this.filterProductionNode()
    },

    // 排产中的表 选择行后回调
    onSelectChange(val) {
      this.printDetailInfoList = val
      if (this.callBackSelectChange) {
        this.callBackSelectChange(val)
      }
    },

    // 操作排产中的表 批量打印
    onBatchPrintClickFormTheOnGoing() {
      if (isEmpty(this.printDetailInfoList)) {
        this.$message({ type: 'warning', message: '请至少选择一个生产单' })
        return
      }
      // 工厂端生产单打印可选择添加产品原材料清单
      this.printContainProductDetailDialogTitle = `即将打印${this.printDetailInfoList.length}张生产单`
      this.printContainProductDetailDialog = true
      this.isPrintContainDetailBool = false
      this.printContainObj = {
        'index': '',
        'mode': '',
        'type': 'batch'
      }
      // 工厂端生产单打印可选择添加产品原材料清单
      // this.printProductionNoteDialogVisible = true
    },

    // 操作排产中的表 批量修正工序工资
    async onBatchRevisionOfProcessWagesBtnClickFormTheOnGoing() {
      if (isEmpty(this.printDetailInfoList)) {
        this.$message({ type: 'warning', message: '请至少选择一个生产单' })
        return
      }
      if (
        this.productNoteModel === 'finished' &&
        !confirm(
          '修改已经完成的生产单会修改已经存在的工资计件记录，该行为将会被记录并通知系统管理员，确定要继续吗？'
        )
      ) {
        return
      }
      this.btnLoading = true
      var unique_ids = []
      for (let i = 0; i < this.printDetailInfoList.length; i++) {
        const element = this.printDetailInfoList[i]
        unique_ids.push(element['生产单编号'])
      }
      var parameter = {
        login_token: this.$store.getters.token,
        prepare_flag: true,
        unique_ids: unique_ids
      }
      batch_edit_production_note_process_salary_by_ids(parameter)
        .then(response => {
          this.btnLoading = false
          this.unique_ids = unique_ids
          this.wageChangeDetailInfoList = response.data
          this.batchRevisionOfProcessWagesDialogVisible = true
        })
        .catch(() => {
          this.btnLoading = false
        })
    },

    // 操作排产中的表 批量删除订单
    async onBatchDeleteOfProductNoteBtnClickFormTheOnGoing() {
      if (isEmpty(this.printDetailInfoList)) {
        this.$message({ type: 'warning', message: '请至少选择一个生产单' })
        return
      }
      if (confirm('确定要进行批量删除操作吗？')) {
        this.btnLoading = true
        var unique_ids = []
        for (let i = 0; i < this.printDetailInfoList.length; i++) {
          const element = this.printDetailInfoList[i]
          unique_ids.push(element['生产单编号'])
        }
        var parameter = {
          login_token: this.$store.getters.token,
          unique_ids: unique_ids
        }

        await batch_delete_production_note_by_ids(parameter)
        this.$message({ type: 'success', message: '生产单批量删除成功！' })
        this.callBackAfterTheOperation()
        this.btnLoading = false
      }
    },

    // 批量修正工序工资对话框关闭后回调
    coloseBatchRevisionOfProcessWagesDialogCallback(status) {
      if (this.batchRevisionOfProcessWagesDialogVisible && !status) {
        this.batchRevisionOfProcessWagesDialogVisible = status
      }
    },

    // 查看生产单按钮点击
    handleProductionNoteDetail(index, mode) {
      var curOperationDetailInfo =
        mode === 'onGoing'
          ? this.productionNoteData[index]
          : this.finishedProductionNoteData[index]
      var query = {
        mode: 'detail',
        from: 'productNoteTable',
        curOperationDetailInfo: JSON.stringify(curOperationDetailInfo)
      }
      // console.log(query)
      const { href } = this.$router.resolve({
        path: '/productOrderManagement/arrangeProductionNote',
        query: query
      })
      window.open(href, '_blank')
    },

    // 编辑生产单按钮点击
    handleEditOrder(index, mode) {
      var curOperationDetailInfo =
        mode === 'onGoing'
          ? this.productionNoteData[index]
          : this.finishedProductionNoteData[index]
      var query = {
        mode: 'edit',
        from: 'productNoteTable',
        curOperationDetailInfo: JSON.stringify(curOperationDetailInfo)
      }
      // console.log(query)
      const { href } = this.$router.resolve({
        path: '/productOrderManagement/arrangeProductionNote',
        query: query
      })
      window.open(href, '_blank')
    },

    // 删除生产单按钮点击
    async handleDeleteProductionNode(ProductionNode) {
      if (
        confirm(
          '确定要删除编号为' + ProductionNode.生产单编号 + '的生产单吗？'
        ) &&
        confirm(
          '请再次确认是否要删除编号为' +
            ProductionNode.生产单编号 +
            '的生产单？'
        )
      ) {
        this.btnLoading = true
        var post_data = {
          login_token: this.$store.getters.token,
          unique_id: ProductionNode.生产单编号
        }
        await delete_production_note_by_id(post_data)
        this.$message({ type: 'success', message: '生产单删除成功' })
        this.callBackAfterTheOperation()
        this.btnLoading = false
      }
    },

    // 强行完成当前选择的订单
    async handleFinishProductionNote(ProductionNode) {
      if (
        confirm(
          '确定要完成编号为' +
            ProductionNode.生产单编号 +
            '的生产单吗？完成后，所有该生产单的工序都将改为完成。'
        ) &&
        confirm(
          '请再次确认是否要完成编号为' +
            ProductionNode.生产单编号 +
            '的生产单？'
        )
      ) {
        var post_data = {
          login_token: this.$store.getters.token,
          生产单unique_id: ProductionNode.生产单编号
        }
        await finish_production_note_by_id(post_data)
        this.$message({ type: 'success', message: '生产单被标记为完成' })
        this.callBackAfterTheOperation()
      }
    },

    // 重新评估
    async handleToReview(ProductionNode) {
      if (
        confirm('确定要重新评估' + ProductionNode.生产单编号 + '的生产单吗？')
      ) {
        var post_data = {
          login_token: this.$store.getters.token,
          unique_id: ProductionNode.生产单编号
        }
        var res = await review_production_note_by_id(post_data)
        this.$message({ type: 'success', message: res.msg })
        this.callBackAfterTheOperation()
      }
    },
    // 查看产品
    toViewTheProduct(ProductionNode) {
      const { href } = this.$router.resolve({
        path: '/briefProductInformation/index',
        query: { mode: 'detail', unique_id: ProductionNode['产品编号'] } // 模式为添加产品模式
      })
      window.open(href, '_blank')
    },

    // 确认打印 【工厂端生产单打印可选择添加产品原材料清单】
    surePrintContainProduct() {
      this.printContainProductDetailDialog = false
      if (this.printContainObj.type === 'batch') {
        this.printProductionNoteDialogVisible = true
      } else if (this.printContainObj.type === 'single') {
        var array = []
        if (this.printContainObj.mode === 'onGoing') {
          array.push(this.productionNoteData[this.printContainObj.index])
        } else {
          array.push(this.finishedProductionNoteData[this.printContainObj.index])
        }
        this.printDetailInfoList = array
        this.printProductionNoteDialogVisible = true
      }
    },
    // 打印按钮点击
    handlePrintProductionNote(index, mode) {
      // 工厂端生产单打印可选择添加产品原材料清单
      this.printContainProductDetailDialogTitle = `即将打印1张生产单`
      this.printContainProductDetailDialog = true
      this.isPrintContainDetailBool = false
      this.printContainObj = {
        'index': index,
        'mode': mode,
        'type': 'single'
      }
      // 工厂端生产单打印可选择添加产品原材料清单
      // var array = []
      // if (mode === 'onGoing') {
      //   array.push(this.productionNoteData[index])
      // } else {
      //   array.push(this.finishedProductionNoteData[index])
      // }
      // this.printDetailInfoList = array
      // this.printProductionNoteDialogVisible = true
    },

    // 打印对话框关闭后回调
    colosePrintProductionNoteDialogCallback(status) {
      if (this.printProductionNoteDialogVisible && !status) {
        this.printProductionNoteDialogVisible = status
      }
    },

    filterProductNoteStatus(value, row) {
      return row.生产单状态 === value
    },
    // 选中状态全部的取消
    toggleSelection() {
      this.printDetailInfoList = []
      this.$refs.multipleTable.clearSelection()
    },

    // 获取未打开高级搜索时所有数据（不分页，导出excel用）
    async filterProductionNodeAllItem() {
      this.excleprogressValue = 0
      this.centerDialogVisible = true
      // pagenum为循环次数
      console.log(this.productionNote_total)
      var pagenum = Math.ceil(this.productionNote_total / 100)
      // allitem为所有数据
      var allitem = []
      for (let i = 0; i < pagenum; i++) {
        var post_data_a = {
          login_token: this.$store.getters.token,
          pagination: {
            page: i + 1,
            limit: 100
          },
          sort: {
            更新时间: -1
          },
          preview_flag: false
        }
        if (this.productNoteModel === 'onGoing') {
          post_data_a['多个生产单状态'] = ['新生产单', '生产中']
        } else post_data_a['生产单状态'] = '完成'
        // 先处理所有的新订单
        var response = await filter_production_note(post_data_a)
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
    // 导出excel当前页的数据（导的是当前table展示的数据）
    // async exportExcel() {
    //   this.btnLoading = true
    //   setTimeout(() => {
    //     this.btnLoading = false
    //   }, 3000)
    //   await this.filterProductionNode(false)

    //   var 配码数组 = deepClone(this.$store.getters['配码数组'])
    //   var 配码 = []
    //   for (let i = 0; i < 配码数组.length; i++) {
    //     var element = 配码数组[i]
    //     配码.push(String(element.size))
    //   }
    //   var tHeader = [
    //     '生产单编号',
    //     '对应订单号',
    //     '生产单状态',
    //     '生产完成度',
    //     '生产单时间',
    //     '总排产数',
    //     '产品编号',
    //     ...this.$store.getters.产品的标签,
    //     '生产单备注',
    //     ...配码
    //   ]
    //   var filterVal = [
    //     '生产单编号',
    //     '对应订单号',
    //     '生产单状态',
    //     '生产完成度百分比',
    //     '生产单时间',
    //     '总排产数',
    //     '产品编号',
    //     ...this.$store.getters.产品的标签,
    //     '生产单备注',
    //     ...配码
    //   ]
    //   var tableData = deepClone([...this.productionNoteTableData])
    //   const data = this.formatJson(filterVal, tableData)
    //   import('@/vendor/Export2Excel').then(excel => {
    //     excel.export_json_to_excel({
    //       header: tHeader, // 表头 必填
    //       data, // 具体数据 必填
    //       filename: '生产单列表', // 非必填
    //       autoWidth: true, // 非必填
    //       bookType: 'xlsx' // 非必填
    //     })
    //   })
    // },
    // 导出excel不分页，所有符合条件的数据
    async exportExcel() {
      const that = this
      this.btnLoading = true
      setTimeout(() => {
        this.btnLoading = false
      }, 3000)

      var 配码数组 = deepClone(this.$store.getters['配码数组'])
      var 配码 = []
      for (let i = 0; i < 配码数组.length; i++) {
        var element = 配码数组[i]
        配码.push(String(element.size))
      }
      var tHeader = [
        '生产单编号',
        '对应订单号',
        '生产单状态',
        '生产完成度',
        '生产单时间',
        '总排产数',
        '产品编号',
        ...this.$store.getters.产品的标签,
        '生产单备注',
        ...配码
      ]
      var filterVal = [
        '生产单编号',
        '对应订单号',
        '生产单状态',
        '生产完成度百分比',
        '生产单时间',
        '总排产数',
        '产品编号',
        ...this.$store.getters.产品的标签,
        '生产单备注',
        ...配码
      ]
      // 此处判断高级搜索是否打开了
      if (this.enableAdvancedSearch) {
        console.log('===========走的是高级搜索的导出excel===========')
        try {
          showLoading()
          var response = await that.$refs.productNoteConditionQuery.productNoteTableFilterAllItems()
          hideLoading()
          // 表数据
          var productionNoteData = response
          var productionNoteTableData = []

          // 组合让表格能展示的数据******************************start
          this.tableProductionNoteDisplaysCombinationsOfData(
            productionNoteData,
            productionNoteTableData
          )
          // 组合让表格能展示的数据******************************end
          const data = this.formatJson(filterVal, productionNoteTableData)
        // debugger
        import('@/vendor/Export2Excel').then(excel => {
          excel.export_json_to_excel({
            header: tHeader, // 表头 必填
            data, // 具体数据 必填
            filename: '生产单列表', // 非必填
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
          var res = await this.filterProductionNodeAllItem()
          hideLoading()
          // 表数据
          var productionNoteDataNotAdvancedSearch = res
          var productionNoteTableDataNotAdvancedSearch = []

          // 组合让表格能展示的数据******************************start
          this.tableProductionNoteDisplaysCombinationsOfData(
            productionNoteDataNotAdvancedSearch,
            productionNoteTableDataNotAdvancedSearch
          )
          // 组合让表格能展示的数据******************************end
          const data = this.formatJson(filterVal, productionNoteTableDataNotAdvancedSearch)
        // debugger
        import('@/vendor/Export2Excel').then(excel => {
          excel.export_json_to_excel({
            header: tHeader, // 表头 必填
            data, // 具体数据 必填
            filename: '生产单列表', // 非必填
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
.product-note-table {
  .module-b {
    margin-bottom: 20px;
    .header {
      display: flex;
      justify-content: space-between;
      height: 40;
      align-items: center;
      span {
        width: 100%;
        text-align: center;
      }
    }
  }
  .bg-a {
    background-color: #fff3bf;
  }
  .bg-b {
    background-color: #91d8b7;
  }
  .el-pagination {
    float: right;
  }
}
</style>

<style lang="scss">
.product-note-table .batch-operation-switching {
  .el-switch__label {
    width: 60px;
    margin-right: 10px;
  }
}

.btn-box {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  .el-button {
    margin: 3px;
  }
}

.product-note-table {
  .table {
    margin-bottom: 5px;
    .tag {
      margin: 2px;
    }
  }
}
</style>

