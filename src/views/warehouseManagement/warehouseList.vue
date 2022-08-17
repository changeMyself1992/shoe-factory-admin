<template>
  <div class="warehouse-list">
    <div class="useintro">
      <el-dropdown :show-timeout="0" @command="handleCommand">
        <img src="@/assets/images/help.png" class="help">
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="a">如何查看仓库的库存信息并导出Excel表格？</el-dropdown-item>
          <el-dropdown-item command="b">如何添加物料？</el-dropdown-item>
          <el-dropdown-item command="c">如何使用【复制添加】功能添加新的物料？</el-dropdown-item>
          <el-dropdown-item command="d" class="blue">更多问题，请访问帮助中心</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <div class="base-info">
      <div class="header">
        <b>条件查询</b>
      </div>

      <el-form ref="form" class="info-box" :model="form" label-position="left">
        <!-- 物料的定位标签(自动补全) -->
        <div v-if="material_tag_names.length>0" class="item-0">
          <el-form-item v-for="tag_name in material_tag_names" :key="tag_name" :label="tag_name">
            <el-autocomplete
              v-model.trim="material_tag_filter[tag_name]"
              class="inline-input"
              :fetch-suggestions="((queryString, callback)=>tagQueryAutoCompleteSearch(queryString,callback,tag_name))"
              placeholder="自动补全"
            />
          </el-form-item>
        </div>

        <el-form-item class="item-1" label="物料编号:" label-width="85px">
          <el-input v-model.trim="form.物料编号" placeholder="输入" />
        </el-form-item>

        <el-form-item class="item-4" label="更新时间:" label-width="85px">
          <el-date-picker
            v-model.trim="form.materialTimeQuantum"
            class="picker"
            type="daterange"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>

        <el-form-item class="item-5">
          <el-button type="primary" @click="handleSearch()">搜索物料</el-button>
          <el-button type="primary" @click="clearCondition()">清空条件</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="module-a">
      <div class="title">
        <strong>物料记录</strong>
        <div>
          <el-button
            type="primary"
            size="small"
            :loading="btnLoading"
            :disabled="!管理权限['仓库物料信息可读']"
            @click="exportExcel"
          >导出EXCEL表格</el-button>
          <el-button
            type="primary"
            size="small"
            :disabled="!管理权限['仓库物料信息可写']||!管理权限['仓库物料信息可读']"
            @click="addMaterial()"
          >添加物料</el-button>
        </div>
      </div>

      <el-table :height="tableHeight" :data="materialTableData" border style="width: 100%">
        <!-- 物料历史价格展开 -->
        <el-table-column type="expand" label="供应商信息展开" width="80">
          <template slot-scope="props">
            <el-table :data="props.row['供应商历史信息']" border style="width: 100%;margin-bottom:30px;">
              <el-table-column label="供应商历史信息" align="center">
                <el-table-column align="center" prop="名称" label="供应商名称" />
                <el-table-column align="center" prop="供应商价格" label="供应商价格" />
                <el-table-column align="center" prop="供应商物料名称" label="供应商物料名称" />
                <el-table-column align="center" prop="说明" label="说明" />
              </el-table-column>
            </el-table>

            <el-table :data="props.row['供应商列表']" border style="width: 100%;">
              <el-table-column label="供应商列表" align="center">
                <el-table-column align="center" prop="名称" label="供应商名称" />
                <el-table-column align="center" prop="供应商价格" label="供应商价格" />
                <el-table-column align="center" prop="供应商物料名称" label="供应商物料名称" />
                <el-table-column align="center" prop="仓库剩余数量" label="仓库剩余数量" />
                <el-table-column align="center" prop="更新时间" label="更新时间" />
                <el-table-column align="center" prop="说明" label="说明" />
              </el-table-column>
            </el-table>
          </template>
        </el-table-column>

        <!-- 根据物料动态标签和属性自动生成表格 -->
        <el-table-column
          v-for="(tag_name,index) in material_tag_names"
          :key="index"
          :label="tag_name"
          align="center"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.tags[tag_name] }}</span>
          </template>
        </el-table-column>

        <!-- 其他物料静态属性 -->
        <el-table-column align="center" prop="物料编号" label="物料编号" width="130" />
        <el-table-column align="center" prop="仓库剩余数量" label="在库数量" width="90" />

        <el-table-column align="center" prop="仓库多余数量" label="多余数量" />
        <el-table-column align="center" prop="仓库缺少数量" label="缺少数量" />
        <el-table-column align="center" prop="生产单已使用总数量" label="生产单已使用总数量" width="100" />
        <el-table-column align="center" prop="生产单已领取总数量" label="生产单已领取总数量" width="100" />
        <el-table-column align="center" prop="采购单预采购总数量" label="采购单预采购总数量" width="100" />

        <el-table-column align="center" prop="单位" label="单位" width="60" />
        <el-table-column align="center" prop="更新时间" label="更新时间" width="160" />
        <el-table-column align="center" label="操作" width="190">
          <template slot-scope="scope">
            <el-button
              type="primary"
              size="mini"
              :disabled="!管理权限['仓库物料信息可写']"
              @click="copyAndAddNewMaterial(scope.row)"
            >复制添加</el-button>
            <el-button
              type="primary"
              size="mini"
              :disabled="!管理权限['仓库物料信息可写']"
              @click="editMaterialDetailInfo(scope.row)"
            >查看/修改</el-button>
            <el-button
              type="danger"
              size="mini"
              :disabled="!管理权限['仓库物料信息可写']"
              @click="deleteMaterial(scope.row)"
            >删除</el-button>
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

    <!--操作物料对话框-->
    <material-operation-dialog-box
      :dialog-visible="operationMaterialDetailInfoVisible"
      :on-close="closeOperationMaterialDialogCallback"
      :open-mode="openMode"
      :cur-operation-detail-info="curOperationDetailInfo"
    />
  </div>
</template>

<script>
import { deepClone, parseTime } from '@/utils'
import materialOperationDialogBox from './components/materialOperationDialogBox' // 操作物料对话框（查看，编辑，添加）
import {
  delete_warehouse_material_by_id,
  material_tags_auto_complete,
  filter_warehouse_material
} from '@/api/warehouseProcurement'
import { mapGetters } from 'vuex'
export default {
  components: { materialOperationDialogBox },
  data() {
    return {
      // 是否启用按钮loading状态防止多次点击
      btnLoading: false,
      form: {
        物料编号: null,
        颜色: null,
        单位: null,
        仓库剩余数量: null,
        更新时间: null,
        供应商信息: null, // 供应商信息
        供应商历史信息: null, // 供应商历史信息
        对应产品列表: null,
        备注: null
      },
      historySpanRows: [],
      // 配置中对物料的tags数组
      material_tag_names: [],
      // 对应的用于搜索和自动补全的tags模块
      material_tag_filter: {},
      // 当前页数
      currentPage: 1,
      // 总条目数
      total: 0,
      // 当前页数据量
      pageSize: 50,
      // 仓库物料信息
      materialTableData: [],
      // 是否展示操作物料对话框
      operationMaterialDetailInfoVisible: false,
      // 当前操作的订单信息（查看，删除）
      curOperationDetailInfo: null,
      // 打开对话框的类型
      openMode: '',
      tableHeight: ''
    }
  },
  computed: {
    ...mapGetters(['管理权限'])
  },
  created() {
    this.tableHeight = window.innerHeight * 0.75
    this.getMaterialTagName()
    this.filterMaterial()
  },
  // 进入该页面后，查询列表API
  mounted() {},
  methods: {
    // 查看指引
    handleCommand(command) {
      console.log(command)
      var x = null
      var y = null
      if (command === 'd') {
        const { href } = this.$router.resolve({
          path: '/instructionsForuse/index'
        })
        window.open(href, '_blank')
      } else {
        if (command === 'a') {
          x = 10
          y = 0
        } else if (command === 'b') {
          x = 10
          y = 5
        } else if (command === 'c') {
          x = 10
          y = 6
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
    rowExpand: function(row) {
      console.log(row)
    },

    // 页码控制时，每页数量改变的处理函数
    handleSizeChange(val) {
      this.pageSize = val
      this.filterMaterial()
    },
    // 页码控制时，每页码改变改变的处理函数
    handleCurrentChange(val) {
      this.currentPage = val
      this.filterMaterial()
    },

    // 获取配置中对物料的tags数组，确保先载入
    getMaterialTagName(callback) {
      this.material_tag_names = this.$store.getters.物料的标签
      this.material_tag_filter = {}
      for (var index in this.material_tag_names) {
        this.$set(this.material_tag_filter, this.material_tag_names[index], '')
        if (typeof callback === 'function') {
          callback()
        }
      }
    },
    // 对物料标签进行自动补全操作
    async tagQueryAutoCompleteSearch(queryString, callback, tag_name) {
      if (queryString === undefined || queryString === null) {
        queryString = ''
      }
      var login_token = this.$store.getters.token
      var post_data = {
        login_token: login_token,
        base_tags: this.material_tag_filter,
        target_tag_name: tag_name
      }
      // 调用api
      const response = await material_tags_auto_complete(post_data)
      var suggest_value_list = []
      for (var index in response.data) {
        suggest_value_list.push({
          value: response.data[index]
        })
      }
      callback(suggest_value_list)
    },
    // 页面加载时，以及数据更新时调用，用于获取最新的列表
    async filterMaterial() {
      var login_token = this.$store.getters.token
      var post_data = {
        login_token: login_token,
        pagination: {
          page: parseInt(this.currentPage),
          limit: parseInt(this.pageSize)
        },
        sort: { 更新时间: -1 }
      }
      if (this.form != null) {
        if (this.form.物料编号 != null) {
          post_data['物料编号'] = this.form.物料编号
        }

        if (this.form.materialTimeQuantum != null) {
          post_data['更新时间_下限'] = parseTime(
            this.form.materialTimeQuantum[0]
          )
          post_data['更新时间_上限'] = parseTime(
            this.form.materialTimeQuantum[1]
          )
        }
      }
      post_data['tags'] = this.material_tag_filter
      // 调用api
      const response = await filter_warehouse_material(post_data)
      var materialTableData = response.data
      for (let i = 0; i < materialTableData.length; i++) {
        var element = materialTableData[i]
        element['仓库剩余数量'] = Number(
          Number(parseFloat(element['仓库剩余数量']).toFixed(2))
        )
        element['仓库缺少数量'] = Number(
          Number(parseFloat(element['仓库缺少数量']).toFixed(2))
        )
        element['生产单已使用总数量'] = Number(
          Number(parseFloat(element['生产单已使用总数量']).toFixed(2))
        )
        element['生产单已领取总数量'] = Number(
          Number(parseFloat(element['生产单已领取总数量']).toFixed(2))
        )
      }
      this.materialTableData = materialTableData
      this.total = response.total_count
    },

    clearCondition() {
      this.form = {}
      this.material_tag_filter = {}
      for (var index in this.material_tag_names) {
        this.$set(this.material_tag_filter, this.material_tag_names[index], '')
      }
      this.filterMaterial()
    },
    // 处理物料的搜索
    handleSearch() {
      this.filterMaterial(this.form) // 重新载入数据
    },
    // 添加物料信息按钮
    addMaterial() {
      this.openMode = 'add'
      this.curOperationDetailInfo = {}
      this.operationMaterialDetailInfoVisible = true
    },
    // 复制该选择项的物料信息，添加成为新的物料信息（用于极少数信息改动的新物料添加）
    copyAndAddNewMaterial(materialInfo) {
      this.openMode = 'copyToAdd'
      this.curOperationDetailInfo = deepClone(materialInfo)
      this.operationMaterialDetailInfoVisible = true
    },
    // 查看/编辑按钮点击
    editMaterialDetailInfo(materialInfo) {
      this.openMode = 'viewAndModify'
      this.curOperationDetailInfo = deepClone(materialInfo)
      this.operationMaterialDetailInfoVisible = true
    },

    // 删除按钮点击
    async deleteMaterial(materialInfo) {
      if (!confirm('确定进行修改吗？修改将会对记录进行永久的改变')) {
        return false
      }
      var meterialUniqueId = materialInfo.unique_id
      var post_data = {
        login_token: this.$store.getters.token,
        unique_id: meterialUniqueId
      }
      await delete_warehouse_material_by_id(post_data)
      this.$message({
        type: 'success',
        message: '该物料已成功删除'
      })
      this.filterMaterial()
    },
    // 操作物料对话框关闭后回调
    closeOperationMaterialDialogCallback(status, refresh_flag) {
      this.operationMaterialDetailInfoVisible = status
      if (refresh_flag) {
        this.filterMaterial()
      }
    },
    // 导出excel
    exportExcel() {
      this.btnLoading = true
      setTimeout(() => {
        this.btnLoading = false
      }, 3000)
      const tHeader = [
        ...this.material_tag_names,
        '物料名称',
        '物料编号',
        '在库数量',
        '多余数量',
        '缺少数量',
        '生产单已使用总数量',
        '生产单已领取总数量',
        '采购单预采购总数量',
        '单位',
        '更新时间'
      ]
      const filterVal = [
        ...this.material_tag_names,
        '物料名称',
        '物料编号',
        '仓库剩余数量',
        '仓库多余数量',
        '仓库缺少数量',
        '生产单已使用总数量',
        '生产单已领取总数量',
        '采购单预采购总数量',
        '单位',
        '更新时间'
      ]
      var materialTableData = deepClone([...this.materialTableData])
      for (let i = 0; i < materialTableData.length; i++) {
        var element = materialTableData[i]
        for (const key in element.tags) {
          element[key] = element.tags[key]
        }
      }
      console.log(11111)
      console.log(tHeader)
      console.log(filterVal)
      console.log(materialTableData)
      const tableData = materialTableData
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
.warehouse-list {
  padding: 10px;
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
      padding: 0px 10px;
      // height: 130px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      .item-0 {
        width: 100%;
        display: flex;
        justify-content: space-between;
      }
      .item-1 {
        width: 20%;
      }
      .item-1 {
        width: 20%;
      }
      .item-2 {
        width: 20%;
      }
      .item-3 {
        width: 20%;
      }
      .item-4 {
        width: 40%;
        margin-right: 200px;
      }
    }
  }

  .module-a {
    .title {
      display: flex;
      justify-content: space-between;
      line-height: 32px;
      margin-bottom: 5px;
    }
    .el-button--mini {
      margin-bottom: 5px;
    }
  }
}
</style>

