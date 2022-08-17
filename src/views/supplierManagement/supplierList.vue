<template>
  <div class="warehouse-list">
    <div class="useintro">
      <el-dropdown :show-timeout="0" @command="handleCommand">
        <img src="@/assets/images/help.png" class="help">
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="a">如何添加一个供应商的基本信息？</el-dropdown-item>
          <el-dropdown-item command="b">如何删除一个供应商的基本信息？</el-dropdown-item>
          <el-dropdown-item command="c">如何查看一个供应商的报价单</el-dropdown-item>
          <el-dropdown-item command="d" class="blue">更多问题，请访问帮助中心</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <div class="base-info">
      <div class="header">
        <b>条件查询</b>
      </div>

      <el-form ref="form" class="info-box" :model="form" label-position="left">
        <el-row :gutter="50">
          <el-col :span="5">
            <el-form-item class="item-1" label="名称:" label-width="50px">
              <el-input v-model.trim="form['名称']" placeholder="输入" />
            </el-form-item>
          </el-col>

          <el-col :span="5">
            <el-form-item class="item-3" label="电话:" label-width="50px">
              <el-input v-model.trim="form['电话']" placeholder="输入" />
            </el-form-item>
          </el-col>

          <el-col :span="5">
            <el-form-item class="item-2" label="地址:" label-width="50px">
              <el-input v-model.trim="form['地址']" placeholder="输入" />
            </el-form-item>
          </el-col>

          <el-col :span="9">
            <el-form-item class="item-4" label="更新时间段:" label-width="90px">
              <el-date-picker
                v-model.trim="form.更新时间段"
                class="picker"
                type="daterange"
                unlink-panels
                range-separator="-"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row type="flex" justify="space-between" align="middle">
          <el-form-item label="关联状态:" label-width="85px">
            <el-checkbox-group v-model="form.认证状态">
              <el-checkbox label="已关联" />
              <el-checkbox label="未关联" />
            </el-checkbox-group>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="handleSearch()">搜索供应商</el-button>
            <el-button type="primary" @click="clearCondition()">清空条件</el-button>
          </el-form-item>
        </el-row>
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
          :disabled="!管理权限['供应商信息可读']"
          @click="exportExcel()"
        >导出EXCEL表格</el-button>
        <el-button
          type="primary"
          size="small"
          :disabled="!管理权限['供应商信息可写']"
          @click="addSupplier()"
        >添加供应商</el-button>
      </div>
      <el-table :data="supplierTableData" border>
        <el-table-column align="center" prop="名称" label="供应商名称">
          <template slot-scope="scope">
            <span>{{ scope.row['名称'] }}</span>
            <svg-icon
              :icon-class="scope.row['if_unified_match']?'yrz':'wrz'"
              :class-name="scope.row['if_unified_match']?'yrz':'wrz'"
            />
          </template>
        </el-table-column>
        <el-table-column align="center" label="是否关联认证" width="110">
          <template slot-scope="scope">
            <span
              :style="scope.row['if_unified_match']?'color:#409EFF;':'color:rgb(246, 190, 66);'"
            >{{ scope.row['if_unified_match']?'是':'否' }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="联系电话" label="联系电话" width="130" />
        <el-table-column align="center" prop="地址" label="地址" />
        <el-table-column align="center" prop="备注" label="备注" />
        <el-table-column align="center" prop="更新时间" label="更新时间" width="155" />
        <el-table-column align="center" label="操作" width="220">
          <template slot-scope="scope">
            <el-button
              type="primary"
              size="mini"
              :disabled="!管理权限['供应商信息可读']"
              @click="viewSupplierDetailInfo(scope.row)"
            >查看报价单</el-button>
            <!-- <el-button
              type="primary"
              size="mini"
              @click="editSupplierDetailInfo(scope.row,'modify')"
            >查看/修改</el-button>-->
            <el-button
              type="danger"
              size="mini"
              :disabled="!管理权限['供应商信息可写']"
              @click="deleteSupplier(scope.row)"
            >删除</el-button>
            <el-button
              v-if="!scope.row['if_unified_match']"
              style="margin-top:10px;"
              type="primary"
              size="mini"
              @click="showCodeImg(scope.row)"
            >关联认证供应商</el-button>
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

    <!-- 供应商关联码 -->
    <el-dialog
      title="关联认证供应商"
      :visible.sync="codeImgDialogVisible"
      width="50%"
      center
    >
      <div style="text-align: center;display:flex;justify-content: space-between;">
        <div class="image">
          <div style="font-size:20px;">方式一（供应商关联码）</div>
          <img style="width:200px;height:200px;margin:10px 0;" :src="codeImg" alt="">
          <div class="">供应商手机扫码完成关联</div>
        </div>
        <el-form ref="formlink" :model="formlink" class="formlink" label-width="80px">
          <div style="font-size:20px;margin-bottom:20px;">方式二（选择供应商关联）</div>
          <el-form-item label="供应商名称">
            <el-autocomplete
              v-model="formlink['供应商名称']"
              :fetch-suggestions="((queryString,callback)=>factoryLinkSupplierAutoCompleteSearch(callback))"
              placeholder="自动补全"
              @select="((item)=>{factoryLinkSupplierHandleSelect(item)})"
            />
          </el-form-item>
          <el-form-item label="供应商电话">
            <el-input v-model="formlink['联系电话']" disabled />
          </el-form-item>
          <el-form-item label="地址">
            <el-input v-model="formlink['地址']" disabled />
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="formlink['备注']" disabled />
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="codeImgDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="factoryLinkSupplier">确定关联</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  deepClone,
  isEmpty,
  objectHasAtLeastOneKeyWhoseValueIsNotNull,
  parseTime
} from '@/utils'
import { supplier_tags_auto_complete, filter_supplier, filter_suplier_all, relate_company_to_supplier } from '@/api/supplier'
import theActionSupplierDialogBox from './components/theActionSupplierDialogBox' // 操作供应商对话框
import request from '@/utils/request'
import { mapGetters } from 'vuex'
export default {
  components: { theActionSupplierDialogBox },
  data() {
    return {
      // 是否启用按钮loading状态防止多次点击
      btnLoading: false,
      form: {
        名称: '',
        地址: '',
        电话: '',
        更新时间段: [],
        // 关联状态
        认证状态: ['已关联', '未关联']
      },
      formlink: {
        供应商名称: '',
        地址: '',
        联系电话: '',
        备注: ''
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
      // 是否展示 供应商关联码
      codeImgDialogVisible: false,
      // codeImg: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
      codeImg: '',
      // 当前操作的订单信息（查看，删除）
      curOperationDetailInfo: null,
      // 打开对话框的方式
      openModel: 'add',
      // 关联弹窗搜索
      suggest_value_list: [],
      供应商在本工厂的名称: ''
    }
  },
  computed: {
    ...mapGetters(['管理权限'])
  },
  created() {
    this.getSupplierTagName()
    if (this.$route.query['名称']) {
      this.form.名称 = this.$route.query['名称']
    }
    this.filterSupplier()
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
          x = 12
          y = 0
        } else if (command === 'b') {
          x = 12
          y = 1
        } else if (command === 'c') {
          x = 12
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
        post_data['联系电话'] = this.form['电话']
      }
      if (this.form.更新时间段.length === 2) {
        post_data['更新时间_上限'] = parseTime(
          new Date(this.form.更新时间段[1])
        )
        post_data['更新时间_下限'] = parseTime(
          new Date(this.form.更新时间段[0])
        )
      }
      if (this.form.认证状态.length > 0) {
        post_data['认证状态'] = []
        for (let i = 0; i < this.form.认证状态.length; i++) {
          const element = this.form.认证状态[i]
          if (element === '已关联') {
            post_data['认证状态'].push(true)
          } else if (element === '未关联') {
            post_data['认证状态'].push(false)
          }
        }
      }

      // 至少输入了一个标签
      if (objectHasAtLeastOneKeyWhoseValueIsNotNull(this.supplier_tag_filter)) {
        post_data['tags'] = this.supplier_tag_filter
      }
      var response = await filter_supplier(post_data)
      this.supplierTableData = response.data
      console.log(response.data)
      this.total = response.total_count
    },

    clearCondition() {
      this.form = {
        名称: '',
        地址: '',
        电话: '',
        更新时间段: [],
        认证状态: []
      }
      this.supplier_tag_filter = {}
      this.filterSupplier()
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
    // 修改按钮点击
    editSupplierDetailInfo(supplierInfo, openModel) {
      this.curOperationDetailInfo = deepClone(supplierInfo)
      this.openModel = openModel
      this.supploerDialogVisible = true
    },
    // 查看按钮点击
    viewSupplierDetailInfo(supplierInfo) {
      this.curOperationDetailInfo = deepClone(supplierInfo)
      const { href } = this.$router.resolve({
        path: '/supplierManagement/supplierDetail',
        query: {
          id: this.curOperationDetailInfo.unique_id
        }
      })
      window.open(href, '_blank')
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

    // 展示供应商关联码
    showCodeImg(supplierInfo) {
      // 调接口
      console.log(supplierInfo)
      this.codeImgDialogVisible = true
      var post_data = {
        login_token: this.$store.getters.token,
        工厂内部供应商unique_id: supplierInfo.unique_id
      }
      this.供应商在本工厂的名称 = supplierInfo['名称']
      request({
        url: 'supplier/generate_unified_match_qr_code',
        method: 'post',
        data: post_data
      })
        .then(response => {
          if (response.status === 'OK') {
            this.codeImg = response.data['二维码']
          }
        })
        .catch(error => {
          console.log(error)
        })
    },

    // 工厂主动选择关联
    async factoryLinkSupplier() {
      var login_token = this.$store.getters.token
      var post_data = {
        login_token: login_token,
        供应商unique_id: this.formlink['unique_id'],
        供应商在本工厂的名称: this.供应商在本工厂的名称
      }
      const response = await relate_company_to_supplier(post_data)
      console.log(response.data)
      this.$message({
        type: 'success',
        message: '关联成功'
      })
      this.codeImgDialogVisible = false
      this.filterSupplier()
    },
    factoryLinkSupplierHandleSelect(item) {
      console.log(item)
      this.formlink['联系电话'] = item['联系电话']
      this.formlink['地址'] = item['地址']
      this.formlink['备注'] = item['备注']
      this.formlink['unique_id'] = item['unique_id']
    },
    // 对供应商 进行自动补全操作
    async factoryLinkSupplierAutoCompleteSearch(callback) {
      var login_token = this.$store.getters.token
      var post_data = {
        login_token: login_token,
        工厂unique_id: login_token,
        名称: this.formlink['供应商名称']
      }
      const response = await filter_suplier_all(post_data)
      console.log(response.data)
      var suggest_value_list = []
      for (var index in response.data) {
        suggest_value_list.push({
          value: response.data[index]['名称'],
          地址: response.data[index]['地址'],
          联系电话: response.data[index]['联系电话'],
          备注: response.data[index]['备注'],
          unique_id: response.data[index]['unique_id']
        })
      }
      callback(suggest_value_list)
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
      const tHeader = ['供应商名称', '联系电话', '地址', '更新时间', '备注']
      const filterVal = ['名称', '联系电话', '地址', '更新时间', '备注']
      const tableData = deepClone([...this.supplierTableData])
      const data = this.formatJson(filterVal, tableData)
      import('@/vendor/Export2Excel').then(excel => {
        excel.export_json_to_excel({
          header: tHeader, // 表头 必填
          data, // 具体数据 必填
          filename: '供应商表格', // 非必填
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
      .el-row {
        margin-bottom: 10px;
        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }

  .module-c {
    .title {
      margin-bottom: 20px;
    }
  }
}
.formlink{
  .el-form-item{
    margin-bottom: 20px;
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
