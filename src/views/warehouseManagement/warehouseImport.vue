<template>
  <div class="app-container">
    <div class="useintro">
      <el-dropdown :show-timeout="0" @command="handleCommand">
        <img src="@/assets/images/help.png" class="help">
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="a">如何进行手动入库操作？</el-dropdown-item>
          <el-dropdown-item command="b">如何使用采购单进行入库？</el-dropdown-item>
          <el-dropdown-item command="c" class="blue">更多问题，请访问帮助中心</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <el-card style="margin-bottom:35px;">
      <el-form ref="form" class="module-b" :model="form" label-position="left">
        <el-form-item class="item-1" label="条件搜索入库时间段:" label-width="150px">
          <el-date-picker
            v-model.trim="form.materialImportTime"
            class="picker"
            type="daterange"
            unlink-panels
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>
        <el-form-item class="item-2">
          <el-button type="primary" @click="handleSearch()">查看记录</el-button>
          <el-button type="primary" @click="clearCondition()">清空条件</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <div class="module-c">
      <div class="title">
        <strong>入库事件历史记录</strong>
      </div>
      <div style="margin-bottom: 20px;">
        <el-button
          type="primary"
          size="small"
          :loading="btnLoading"
          :disabled="!管理权限['仓库入库可读']"
          @click="exportExcel"
        >导出EXCEL表格</el-button>
        <el-button
          type="primary"
          size="small"
          :disabled="!管理权限['仓库入库可写']"
          @click="importMaterial()"
        >手动入库</el-button>
        <el-button
          type="primary"
          size="small"
          :disabled="!管理权限['仓库入库可写']"
          @click="importMaterialByPurchaseNote()"
        >采购单入库</el-button>
      </div>

      <el-table :height="tableHeight" class="table" :data="materialTableData" border>
        <el-table-column align="center" prop="materialId" label="物料编号" width="100" />
        <el-table-column
          v-for="(item, index) in materialTags"
          :key="index"
          align="center"
          prop="materialTags"
          :label="item"
          width="100"
        >
          <template slot-scope="scope_a">
            <span v-if="scope_a.row.materialTags">{{ scope_a.row.materialTags[item] }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="供应商名称" label="供应商名称" />
        <el-table-column align="center" prop="供应商物料名称" label="供应商物料名称" />
        <el-table-column align="center" prop="materialAmountImport" label="入库数量" />
        <el-table-column align="center" prop="materialUnit" label="单位" width="50" />
        <el-table-column align="center" prop="materialImportTime" label="入库时间" width="160" />
        <el-table-column align="center" prop="operator" label="登记员" />
        <el-table-column align="center" label="操作" width="120">
          <template slot-scope="scope">
            <el-button
              style="margin-bottom:5px;"
              type="primary"
              size="mini"
              :disabled="!管理权限['仓库入库可写']"
              @click="editImportMaterialEvent(scope.row)"
            >查看</el-button>
            <!-- <el-button
              type="danger"
              size="mini"
              disabled
              @click="deleteImportEvent(scope.row)"
            >删除</el-button> -->
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        class="el-pagination"
        :current-page="currentPage"
        :page-sizes="[50, 100, 150, 200]"
        :page-size="pageSize"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!--物料登记入库对话框-->
    <check-in-and-out-dialog-box
      :dialog-visible="importMaterialEventDialogVisible"
      :on-close="closeImportMaterialEventDialogCallback"
      :open-mode="openMode"
    />
    <!--仓库入库和出库事件对话框-->
    <put-in-storage-and-outbound-events-dialog-box
      :dialog-visible="editImportMaterialEventDialogVisible"
      :on-close="closeEditImportMaterialEventDialogCallback"
      :cur-operation-detail-info="curOperationDetailInfo"
      :open-mode="openMode"
    />
    <!--根据采购单登记入库对话框-->
    <import-material-event-by-purchase-note-dialog-box
      :dialog-visible="importMaterialEventByPurchaseNoteDialogVisible"
      :on-close="closeImportMaterialEventByPurchaseNoteDialogCallback"
      :cur-operation-detail-info="curOperationDetailInfo"
    />
  </div>
</template>

<script>
import { deepClone, parseTime, isEmpty } from '@/utils'
import checkInAndOutDialogBox from './components/checkInAndOutDialogBox' // 物料登记入库和出库对话框
import putInStorageAndOutboundEventsDialogBox from './components/putInStorageAndOutboundEventsDialogBox' // 仓库入库和出库事件对话框
import importMaterialEventByPurchaseNoteDialogBox from './components/importMaterialEventByPurchaseNoteDialogBox' // 根据采购单登记入库
import {
  filter_warehouse_material_event,
  delete_warehouse_material_event_by_id
} from '@/api/warehouseProcurement'
import { mapGetters } from 'vuex'
export default {
  components: {
    checkInAndOutDialogBox,
    putInStorageAndOutboundEventsDialogBox,
    importMaterialEventByPurchaseNoteDialogBox
  },
  data() {
    return {
      // 是否启用按钮loading状态防止多次点击
      btnLoading: false,
      form: {
        materialImportTime: null
      },
      // 当前页数
      currentPage: 1,
      // 总条目数
      total: 0,
      // 当前页数据量
      pageSize: 50,
      // 订单信息
      materialTableData: [],
      // 打开对话框的类型
      openMode: '',
      // 是否展示仓库入库对话框
      importMaterialEventDialogVisible: false,
      // 是否展示仓库入库对话框
      importMaterialEventByPurchaseNoteDialogVisible: false,
      // 是否展示编辑入库事件对话框
      editImportMaterialEventDialogVisible: false,
      curOperationDetailInfo: null,
      materialTags: [],
      tableHeight: ''
    }
  },
  computed: {
    ...mapGetters(['管理权限'])
  },
  created() {
    this.tableHeight = window.innerHeight * 0.75
    this.initializeData()
    this.filterImportEvent()
  },
  mounted() {},
  methods: {
    // 查看指引
    handleCommand(command) {
      console.log(command)
      var x = null
      var y = null
      if (command === 'c') {
        const { href } = this.$router.resolve({
          path: '/instructionsForuse/index'
        })
        window.open(href, '_blank')
      } else {
        if (command === 'a') {
          x = 10
          y = 1
        } else if (command === 'b') {
          x = 10
          y = 2
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

    initializeData() {
      // 获取物料的标签
      this.materialTags = this.$store.getters.物料的标签
    },
    // 页码控制时，每页数量改变的处理函数
    handleSizeChange(val) {
      this.pageSize = val
      this.filterImportEvent()
    },
    // 页码控制时，每页码改变改变的处理函数
    handleCurrentChange(val) {
      this.currentPage = val
      this.filterImportEvent()
    },
    // 查询入库事件
    async filterImportEvent() {
      var login_token = this.$store.getters.token
      var post_data = {
        login_token: login_token,
        pagination: {
          page: parseInt(this.currentPage),
          limit: parseInt(this.pageSize)
        },
        sort: { 事件时间: -1 },
        事件类型: '入库',
        是否返回物料详细信息: true
      }

      if (this.form.materialImportTime != null) {
        var start = parseTime(this.form.materialImportTime[0])
        var end = parseTime(this.form.materialImportTime[1])
        post_data['事件时间_下限'] = start
        post_data['事件时间_上限'] = end
      }
      // 调用api
      const response = await filter_warehouse_material_event(post_data)
      var material_event_items = []
      for (var i = 0; i < response.data.length; i++) {
        var data_item = response.data[i]
        var process_item = {
          unique_id: data_item['unique_id'],
          materialImportTime: data_item['事件时间'],
          operator: data_item['提交人']['姓名'],
          materialUniqueId: data_item['物料变更']['unique_id'],
          materialId: data_item['物料变更']['物料编号'],
          供应商名称: data_item['物料变更']['供应商信息']['名称'],
          供应商物料名称: data_item['物料变更']['供应商信息']['供应商物料名称'],
          materialUnit: data_item['物料变更']['单位'],
          materialTags: data_item['物料变更']['tags'],
          otherNote: isEmpty(data_item['备注']) ? '' : data_item['备注']
        }
        // 如果入库数量0 跳转下一次循环
        // if (Math.abs(data_item['物料变更']['该物料变更数量']) === 0) {
        //   continue
        // }
        process_item['materialAmountImport'] = Math.abs(
          data_item['物料变更']['该物料变更数量']
        )
        process_item['materialAmountBeforeImport'] = Math.abs(
          data_item['物料变更']['变更前仓库数量']
        )
        material_event_items.push(process_item)
      }
      this.materialTableData = material_event_items
      this.total = response.total_count
    },
    clearCondition() {
      this.form = { materialImportTime: null }
    },
    // 删除按钮点击
    async deleteImportEvent(importEvent) {
      var eventUniqueId = importEvent.materialImportTime
      // alert(eventUniqueId);
      var post_data = {
        login_token: this.$store.getters.token,
        unique_id: eventUniqueId
      }
      await delete_warehouse_material_event_by_id(post_data)
      this.$message({
        type: 'success',
        message: '该物料操作事件记录已成功删除'
      })
      this.filterImportEvent()
    },

    // 添加物料信息按钮
    importMaterial() {
      this.openMode = 'putInStorage'
      this.importMaterialEventDialogVisible = true
    },
    // 添加物料信息按钮
    importMaterialByPurchaseNote() {
      this.importMaterialEventByPurchaseNoteDialogVisible = true
    },
    // 查看按钮点击
    editImportMaterialEvent(importMaterialEvent) {
      this.curOperationDetailInfo = importMaterialEvent
      this.editImportMaterialEventDialogVisible = true
      this.openMode = 'putInStorage'
    },
    // 处理物料的搜索
    handleSearch() {
      this.filterImportEvent() // 重新载入数据
    },
    // 删除按钮点击
    deleteImportMaterialEvent(materialInfo) {},

    // 物料入库事件关闭后回调
    closeImportMaterialEventDialogCallback(status, refresh_flag) {
      this.importMaterialEventDialogVisible = status
      if (refresh_flag === true) {
        this.filterImportEvent()
      }
    },
    // 根据采购单入库对话框关闭后回调
    closeImportMaterialEventByPurchaseNoteDialogCallback(status, refresh_flag) {
      this.importMaterialEventByPurchaseNoteDialogVisible = status
      if (refresh_flag === true) {
        this.filterImportEvent()
      }
    },
    // 编辑订单对话框关闭后回调
    closeEditImportMaterialEventDialogCallback(status, refresh_flag) {
      this.editImportMaterialEventDialogVisible = status
      if (refresh_flag === true) {
        this.filterImportEvent()
      }
    },
    // 导出excel
    exportExcel() {
      this.btnLoading = true
      setTimeout(() => {
        this.btnLoading = false
      }, 3000)
      const tHeader = [
        '物料编号',
        ...this.materialTags,
        '入库前仓库数量',
        '入库后仓库数量',
        '入库数量',
        '单位',
        '入库时间',
        '登记员'
      ]
      var materialTableData_temp = deepClone(this.materialTableData)
      var materialTags = materialTableData_temp[0].materialTags
      materialTableData_temp.forEach(element => {
        for (const key in materialTags) {
          element[key] = element.materialTags[key]
        }
      })

      const filterVal = [
        'materialId',
        ...this.materialTags,
        '供应商名称',
        '供应商物料名称',
        'materialAmountImport',
        'materialUnit',
        'materialImportTime',
        'operator'
      ]
      const materialTableData = deepClone([...materialTableData_temp])
      const data = this.formatJson(filterVal, materialTableData)
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
.app-container {
  .module-b {
    padding: 20px 10px 0 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 60px;
    border: 1px solid #d8dce5;
  }
  .module-c {
    overflow: auto;
    .title {
      height: 40px;
      line-height: 40px;
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;
    }
  }
}
</style>

