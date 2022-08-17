<template>
  <div class="warehouse-list">
    <div class="base-info">
      <div class="header">
        <b>条件查询</b>
      </div>

      <!-- 供应商的定位标签(自动补全) -->
      <el-form
        v-if="supplier_tag_names.length>0"
        ref="form"
        class="info-box"
        :model="supplier_tag_filter"
        label-position="left"
      >
        <el-form-item
          v-for="tag_name in supplier_tag_names"
          :key="tag_name"
          :label="tag_name"
          label-width="85px"
        >
          <el-autocomplete
            v-model.trim="supplier_tag_filter[tag_name]"
            class="inline-input"
            :fetch-suggestions="((queryString, callback)=>tagQueryAutoCompleteSearch(queryString,callback,tag_name))"
            placeholder="自动补全"
          />
        </el-form-item>
      </el-form>

      <el-form ref="form" class="info-box" :model="form" label-position="left">
        <el-form-item class="item-1" label="名称:" label-width="85px">
          <el-input v-model.trim="form['名称']" placeholder="输入" />
        </el-form-item>

        <el-form-item class="item-2" label="地址:" label-width="85px">
          <el-input v-model.trim="form['地址']" placeholder="输入" />
        </el-form-item>

        <el-form-item class="item-3" label="电话:" label-width="85px">
          <el-input v-model.trim="form['电话']" placeholder="输入" />
        </el-form-item>

        <el-form-item class="item-5">
          <el-button type="primary" @click="handleSearch()">搜索供应商</el-button>
          <el-button type="primary" @click="clearCondition()">清空条件</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="module-c">
      <div class="title">
        <strong>供应商记录</strong>
      </div>
      <div class="module-a">
        <el-button
          type="primary"
          size="small"
          :loading="btnLoading"
          @click="exportExcel()"
        >导出EXCEL表格</el-button>
        <el-button
          type="primary"
          size="small"
          :disabled="NOT_EDITABLED"
          @click="addSupplier()"
        >添加供应商</el-button>
      </div>
      <el-table :data="supplierTableData" border>
        <el-table-column
          v-if="supplier_tag_names.length>0"
          align="center"
          label="供应商标签"
          :width="80*supplier_tag_names.length"
        >
          <template slot-scope="scope">
            <el-button
              v-for="tag_name in supplier_tag_names"
              :key="tag_name"
              round
              type="info"
              size="mini"
              :disable="true"
              plain
            >
              <font size="0.5" color="blue">{{ tag_name }}</font>
              <br>
              <b>{{ scope.row.tags[tag_name] }}</b>
            </el-button>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="名称" label="供应商名称" />
        <el-table-column align="center" prop="电话" label="电话" width="180" />
        <el-table-column align="center" prop="地址" label="地址" />
        <el-table-column align="center" prop="备注" label="备注" />
        <el-table-column align="center" prop="更新时间" label="更新时间" width="155" />
        <el-table-column align="center" label="操作" width="220">
          <template slot-scope="scope">
            <el-button
              type="primary"
              size="mini"
              @click="editSupplierDetailInfo(scope.row,'detail')"
            >查看</el-button>
            <el-button
              type="primary"
              size="mini"
              @click="editSupplierDetailInfo(scope.row,'modify')"
            >修改</el-button>
            <el-button
              type="danger"
              size="mini"
              :disabled="NOT_EDITABLED"
              @click="deleteSupplier(scope.row)"
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

    <!--操作供应商对话框-->
    <the-action-supplier-dialog-box
      :dialog-visible="supploerDialogVisible"
      :on-close="closeSupplierDialogCallback"
      :open-model="openModel"
      :cur-operation-detail-info="curOperationDetailInfo"
    />
  </div>
</template>

<script>
import {
  deepClone,
  isEmpty,
  objectHasAtLeastOneKeyWhoseValueIsNotNull
} from '@/utils'
import { supplier_tags_auto_complete, filter_supplier } from '@/api/supplier'
import theActionSupplierDialogBox from './components/theActionSupplierDialogBox' // 操作供应商对话框
import request from '@/utils/request'
export default {
  components: { theActionSupplierDialogBox },
  data() {
    return {
      NOT_EDITABLED: false, // 修改权限
      // 是否启用按钮loading状态防止多次点击
      btnLoading: false,
      form: {
        名称: '',
        地址: '',
        电话: ''
      },
      // 配置中对供应商的tags数组
      supplier_tag_names: [],
      // 对应的用于搜索和自动补全的tags模块
      supplier_tag_filter: {},
      // 当前页数
      currentPage: 1,
      // 总条目数
      total: 0,
      // 当前页数据量
      pageSize: 50,
      // 仓库供应商信息
      supplierTableData: [],
      // 是否展示添加供应商对话框
      supploerDialogVisible: false,
      // 当前操作的订单信息（查看，删除）
      curOperationDetailInfo: null,
      // 打开对话框的方式
      openModel: 'add'
    }
  },
  created() {
    this.getSupplierTagName()
    this.filterSupplier()
  },
  // 进入该页面后，查询列表API
  mounted() {
    if (
      this.$store.getters.管理权限.hasOwnProperty('采购管理可编辑') &&
      this.$store.getters.管理权限['采购管理可编辑']
    ) {
      this.NOT_EDITABLED = false
    } else {
      this.NOT_EDITABLED = true
    }
  },
  methods: {
    // 页码控制时，每页数量改变的处理函数
    handleSizeChange(val) {
      this.pageSize = val
      this.filterSupplier()
    },
    // 页码控制时，每页码改变改变的处理函数
    handleCurrentChange(val) {
      this.currentPage = val
      this.filterSupplier()
    },

    // 获取配置中对供应商的tags数组，确保先载入
    getSupplierTagName(callback) {
      this.supplier_tag_names = this.$store.getters.供应商的标签
      this.supplier_tag_filter = {}
      for (var index in this.supplier_tag_names) {
        this.$set(this.supplier_tag_filter, this.supplier_tag_names[index], '')
      }
    },
    // 对供应商标签进行自动补全操作
    async tagQueryAutoCompleteSearch(queryString, callback, tag_name) {
      if (queryString === undefined || queryString === null) {
        queryString = ''
      }
      var login_token = this.$store.getters.token
      var post_data = {
        login_token: login_token,
        base_tags: this.supplier_tag_filter,
        target_tag_name: tag_name
      }
      // 调用api
      const response = await supplier_tags_auto_complete(post_data)
      var suggest_value_list = []
      for (var index in response.data) {
        suggest_value_list.push({
          value: response.data[index]
        })
      }
      callback(suggest_value_list)
    },
    // 页面加载时，以及数据更新时调用，用于获取最新的列表
    async filterSupplier() {
      var login_token = this.$store.getters.token
      var post_data = {
        login_token: login_token,
        pagination: {
          page: parseInt(this.currentPage),
          limit: parseInt(this.pageSize)
        },
        sort: { 更新时间: -1 }
      }

      if (!isEmpty(this.form['名称'])) {
        post_data['名称'] = this.form['名称']
      }
      if (!isEmpty(this.form['地址'])) {
        post_data['地址'] = this.form['地址']
      }
      if (!isEmpty(this.form['电话'])) {
        post_data['电话'] = this.form['电话']
      }
      // 至少输入了一个标签
      if (objectHasAtLeastOneKeyWhoseValueIsNotNull(this.supplier_tag_filter)) {
        post_data['tags'] = this.supplier_tag_filter
      }
      var response = await filter_supplier(post_data)
      this.supplierTableData = response.data
      this.total = response.total_count
    },

    clearCondition() {
      this.form = {}
      this.supplier_tag_filter = {}
    },
    // 处理供应商的搜索
    handleSearch() {
      this.filterSupplier(this.form) // 重新载入数据
    },
    // 添加供应商信息按钮
    addSupplier() {
      this.supploerDialogVisible = true
      this.openModel = 'add'
    },
    // 查看和修改按钮点击
    editSupplierDetailInfo(supplierInfo, openModel) {
      this.curOperationDetailInfo = deepClone(supplierInfo)
      this.openModel = openModel
      this.supploerDialogVisible = true
    },

    // 删除按钮点击
    deleteSupplier(supplierInfo) {
      if (!confirm('确定进行删除吗？修改后供应商记录会永久删除')) {
        return false
      }
      var post_data = {
        login_token: this.$store.getters.token,
        unique_id: supplierInfo.unique_id
      }
      request({
        url: 'supplier/delete_supplier_by_id',
        method: 'post',
        data: post_data
      })
        .then(response => {
          if (response.status === 'OK') {
            this.$message({
              type: 'success',
              message: '该供应商已成功删除'
            })
            this.filterSupplier()
          }
        })
        .catch(error => {
          console.log(error)
        })
    },

    // 供应商对话框关闭后回调
    closeSupplierDialogCallback(status, refresh_flag) {
      this.supploerDialogVisible = status
      if (refresh_flag) {
        this.filterSupplier()
      }
    },
    // 导出excel
    exportExcel() {
      this.btnLoading = true
      setTimeout(() => {
        this.btnLoading = false
      }, 3000)
      const tHeader = [
        '供应商名称',
        '供应商电话',
        '供应商地址',
        '更新时间',
        '备注'
      ]
      const filterVal = [
        '名称',
        '电话',
        '地址',
        '更新时间',
        '备注'
      ]
      const tableData = deepClone([...this.supplierTableData])
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
      padding: 10px 10px;
      height: 130px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
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
        width: 50%;
      }
    }
  }

  .module-c {
    .title {
      margin-bottom: 20px;
    }
  }
}
</style>

<style scoped>
.el-form-item {
  margin-bottom: 0px;
}
.app-container .el-form-item[data-v-66945489] {
  margin-bottom: 0px;
}
.el-date-editor.el-input,
.el-date-editor.el-input__inner {
  width: 100%;
}
</style>
