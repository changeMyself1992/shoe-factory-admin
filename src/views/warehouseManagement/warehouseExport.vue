<template>
  <div class="app-container">
    <div class="useintro">
      <el-dropdown :show-timeout="0" @command="handleCommand">
        <img src="@/assets/images/help.png" class="help">
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="a">如何进行手动出库操作？</el-dropdown-item>
          <el-dropdown-item command="b">如何使用生产单进行出库？</el-dropdown-item>
          <el-dropdown-item command="c" class="blue">更多问题，请访问帮助中心</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <el-card style="margin-bottom:35px;">
      <el-form ref="form" class="module-b" :model="form" label-position="left">
        <el-form-item class="item-1" label="条件搜索出库时间段:" label-width="150px">
          <el-date-picker
            v-model.trim="form.materialExportTime"
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
        <strong>出库事件历史记录</strong>
      </div>
      <div class="module-a">
        <el-button
          type="primary"
          size="small"
          :loading="btnLoading"
          :disabled="!管理权限['仓库出库可读']"
          @click="exportExcel"
        >导出EXCEL表格</el-button>
        <el-button
          type="primary"
          size="small"
          :disabled="!管理权限['仓库出库可写']"
          @click="exportMaterial()"
        >手动出库</el-button>
        <el-button
          type="primary"
          size="small"
          :disabled="!管理权限['仓库出库可写']"
          @click="exportMaterialByProductionNote()"
        >生产单出库</el-button>
      </div>

      <el-table :height="tableHeight" :data="materialTableData" border>
        <el-table-column align="center" prop="materialId" label="物料编号" width="100" />
        <el-table-column
          v-for="(item, index) in materialTags"
          :key="index"
          align="center"
          prop="materialTags"
          :label="item"
        >
          <template slot-scope="scope_a">
            <span v-if="scope_a.row.materialTags">{{ scope_a.row.materialTags[item] }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="供应商名称" label="供应商名称" />
        <el-table-column align="center" prop="供应商物料名称" label="供应商物料名称" />
        <el-table-column align="center" prop="materialAmountExport" label="出库数量" />
        <el-table-column align="center" prop="materialUnit" label="单位" width="50" />
        <el-table-column align="center" prop="materialExportTime" label="出库时间" width="160" />
        <el-table-column align="center" prop="operator" label="登记员" />
        <el-table-column align="center" label="操作" width="120">
          <template slot-scope="scope">
            <el-button
              style="margin-bottom:5px;"
              type="primary"
              size="mini"
              :disabled="!管理权限['仓库出库可写']"
              @click="editExportMaterialEvent(scope.row)"
            >查看</el-button>
            <!-- <el-button
              type="danger"
              size="mini"
              disabled
              @click="deleteExportEvent(scope.row)"
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
      />
    </div>

    <!--仓库出库对话框-->
    <check-in-and-out-dialog-box
      :dialog-visible="exportMaterialEventDialogVisible"
      :on-close="closeExportMaterialEventDialogCallback"
      :open-mode="openMode"
    />
    <!--查看修改出库事件对话框-->
    <put-in-storage-and-outbound-events-dialogBox
      :dialog-visible="editExportMaterialEventDialogVisible"
      :on-close="closeEditExportMaterialEventDialogCallback"
      :cur-operation-detail-info="curOperationDetailInfo"
      :open-mode="openMode"
    />
    <!--根据生产单出库的对话框-->
    <export-material-event-by-production-note-dialog-box
      :dialog-visible="exportMaterialEventByProductionNoteDialogVisible"
      :on-close="closeExportMaterialEventByProductionNoteDialogCallback"
      :cur-operation-detail-info="curOperationDetailInfo"
    />
  </div>
</template>

<script>
import { deepClone, parseTime, isEmpty } from '@/utils'
import {
  filter_warehouse_material_event,
  delete_warehouse_material_event_by_id
} from '@/api/warehouseProcurement'
import checkInAndOutDialogBox from './components/checkInAndOutDialogBox' // 仓库出库对话框
import putInStorageAndOutboundEventsDialogBox from './components/putInStorageAndOutboundEventsDialogBox' // 查看修改出库事件对话框
import exportMaterialEventByProductionNoteDialogBox from './components/exportMaterialEventByProductionNoteDialogBox' // 生产单出库对话框
import { mapGetters } from 'vuex'
export default {
  components: {
    checkInAndOutDialogBox,
    putInStorageAndOutboundEventsDialogBox,
    exportMaterialEventByProductionNoteDialogBox
  },
  data() {
    return {
      // 是否启用按钮loading状态防止多次点击
      btnLoading: false,
      form: {
        materialExportTime: null
      },
      // 当前页数
      currentPage: 1,
      // 总条目数
      total: 0,
      // 当前页数据量
      pageSize: 50,
      materialTableData: [],
      // 是否展示仓库出库对话框
      exportMaterialEventDialogVisible: false,
      // 是否展示仓库出库对话框
      exportMaterialEventByProductionNoteDialogVisible: false,
      // 是否展示编辑出库事件对话框
      editExportMaterialEventDialogVisible: false,
      // 当前操作的订单信息（查看，删除）
      curOperationDetailInfo: {},
      // 打开对话框的类型
      openMode: '',

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
    this.filterExportEvent()
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
          y = 3
        } else if (command === 'b') {
          x = 10
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

    initializeData() {
      // 获取物料的标签
      this.materialTags = this.$store.getters.物料的标签
    },
    // 查询出库事件
    async filterExportEvent() {
      var login_token = this.$store.getters.token
      var post_data = {
        login_token: login_token,
        pagination: {
          page: parseInt(this.currentPage),
          limit: parseInt(this.pageSize)
        },
        sort: { 事件时间: -1 },
        事件类型: '出库',
        是否返回物料详细信息: true
      }

      if (this.form.materialExportTime !== null) {
        var start = parseTime(this.form.materialExportTime[0])
        var end = parseTime(this.form.materialExportTime[1])
        post_data['事件时间_下限'] = start
        post_data['事件时间_上限'] = end
      }
      const response = await filter_warehouse_material_event(post_data)
      var material_event_items = []
      for (var i = 0; i < response.data.length; i++) {
        var data_item = response.data[i]
        var process_item = {
          unique_id: data_item['unique_id'],
          materialExportTime: data_item['事件时间'],
          operator: data_item['提交人']['姓名'],
          materialUniqueId: data_item['物料变更']['unique_id'],
          materialId: data_item['物料变更']['物料编号'],
          供应商名称: data_item['物料变更']['供应商信息']['名称'],
          供应商物料名称:
            data_item['物料变更']['供应商信息']['供应商物料名称'],
          materialUnit: data_item['物料变更']['单位'],
          materialTags: data_item['物料变更']['tags'],
          otherNote: isEmpty(data_item['备注']) ? '' : data_item['备注']
        }
        // 如果出库数量0 跳转下一次循环
        // if (Math.abs(data_item['物料变更']['该物料变更数量']) === 0) { continue }
        process_item['materialAmountExport'] = Math.abs(
          data_item['物料变更']['该物料变更数量']
        )
        process_item['materialAmountBeforeExport'] = Math.abs(
          data_item['物料变更']['变更前仓库数量']
        )
        material_event_items.push(process_item)
      }

      this.materialTableData = material_event_items
      this.total = response.total_count
    },

    // 删除按钮点击
    async deleteExportEvent(importEvent) {
      var eventUniqueId = importEvent.materialExportTime
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
      this.filterExportEvent()
    },
    clearCondition() {
      this.form = { materialExportTime: null }
    },
    // 处理物料的搜索
    handleSearch() {
      this.filterExportEvent(this.form) // 重新载入数据
    },

    // 添加物料信息按钮
    exportMaterial() {
      this.openMode = 'outbound'
      this.exportMaterialEventDialogVisible = true
    },
    // 添加物料信息按钮
    exportMaterialByProductionNote() {
      this.exportMaterialEventByProductionNoteDialogVisible = true
    },
    // 查看按钮点击
    editExportMaterialEvent(exportMaterialEvent) {
      this.openMode = 'outbound'
      this.curOperationDetailInfo = exportMaterialEvent
      this.editExportMaterialEventDialogVisible = true
    },

    // 删除按钮点击
    deleteExportMaterialEvent(materialInfo) {},

    // 物料入库事件关闭后回调
    closeExportMaterialEventDialogCallback(status, refresh_flag) {
      this.exportMaterialEventDialogVisible = status
      if (refresh_flag === true) {
        this.filterExportEvent()
      }
    },
    // 物料入库事件关闭后回调
    closeExportMaterialEventByProductionNoteDialogCallback(
      status,
      refresh_flag
    ) {
      this.exportMaterialEventByProductionNoteDialogVisible = status
      if (refresh_flag === true) {
        this.filterExportEvent()
      }
    },
    // 编辑订单对话框关闭后回调
    closeEditExportMaterialEventDialogCallback(status, refresh_flag) {
      this.editExportMaterialEventDialogVisible = status
      if (refresh_flag === true) {
        this.filterExportEvent()
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
        '出库前仓库数量',
        '出库后仓库数量',
        '出库数量',
        '单位',
        '出库时间',
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
        'materialAmountExport',
        'materialUnit',
        'materialExportTime',
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
  .module-a {
    margin-bottom: 20px;
  }
  .module-b {
    padding: 20px 10px 0 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 60px;
    border: 1px solid #d8dce5;
  }
  .module-c {
    .title {
      margin-bottom: 20px;
    }
  }
}
</style>
