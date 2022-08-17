<template>
  <div class="warehouse-list">
    <div class="useintro">
      <el-dropdown :show-timeout="0" @command="handleCommand">
        <img src="@/assets/images/help.png" class="help">
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="a">如何添加客户的基本信息？</el-dropdown-item>
          <el-dropdown-item command="b">如何修改客户的基本信息？</el-dropdown-item>
          <el-dropdown-item command="c">如何删除客户的基本信息？</el-dropdown-item>
          <el-dropdown-item command="d" class="blue">更多问题，请访问帮助中心</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <div class="module-a">
      <div class="header">
        <b>条件查询</b>
      </div>

      <el-form ref="clientListForm" class="info-box" :model="form" label-position="left">
        <!-- 客户的定位标签(自动补全) -->
        <div v-if="client_tag_names.length>0" class="item-0">
          <el-form-item
            v-for="tag_name in client_tag_names"
            :key="tag_name"
            :label="tag_name"
            label-width="75px"
          >
            <el-autocomplete
              v-model.trim="client_tag_filter[tag_name]"
              class="inline-input"
              :fetch-suggestions="((queryString, callback)=>tagQueryAutoCompleteSearch(queryString,callback,tag_name))"
              placeholder="自动补全"
            />
          </el-form-item>
        </div>

        <el-form-item class="item-1" prop="名称" label="名称:" label-width="85px">
          <el-input v-model.trim="form['名称']" placeholder="输入" />
        </el-form-item>

        <el-form-item class="item-2" prop="地址" label="地址:" label-width="85px">
          <el-input v-model.trim="form['地址']" placeholder="输入" />
        </el-form-item>

        <el-form-item class="item-3" prop="电话" label="电话:" label-width="85px">
          <el-input v-model.trim="form['电话']" placeholder="输入" />
        </el-form-item>

        <el-form-item class="item-4">
          <el-button type="primary" @click="handleSearch()">搜索客户</el-button>
          <el-button type="primary" @click="clearCondition('clientListForm')">清空条件</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="module-b">
      <div class="header">
        <div class="title">
          <strong>客户记录</strong>
        </div>
        <div class="btn-box">
          <el-button type="primary" size="small" :loading="btnLoading" :disabled="!管理权限['客户列表可读']" @click="exportExcel">导出EXCEL表格</el-button>
          <el-button type="primary" size="small" :disabled="!管理权限['客户管理可写']" @click="addClient()">添加客户</el-button>
        </div>
      </div>
      <el-table class="table" :data="clientTableData" border>
        <!-- 根据客户动态标签和属性自动生成表格 -->
        <el-table-column v-for="(item,index) in tableHeader" :key="index" :prop="tableProps[index]" :label="item" align="center" />
        <!-- 客户静态属性 -->
        <el-table-column align="center" prop="名称" label="客户名称" />
        <el-table-column align="center" prop="电话" label="电话" />
        <el-table-column align="center" prop="地址" label="地址" />
        <el-table-column align="center" prop="备注" label="备注" />
        <el-table-column align="center" prop="更新时间" label="更新时间" />
        <el-table-column align="center" label="操作" width="200">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" :disabled="!管理权限['客户管理可写']" @click="editClientDetailInfo(scope.row)">查看/修改</el-button>
            <el-button type="danger" size="mini" :disabled="!管理权限['客户管理可写']" @click="deleteClient(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-pagination
      class="paging"
      :current-page="currentPage"
      :page-sizes="[10, 20, 30, 40]"
      :page-size="pageSize"
      :total="total"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />

    <!--客户对话框-->
    <client-dialog-box
      :dialog-visible="clienteleDialogVisible"
      :open-mode="openMode"
      :on-close="clientDialogCallback"
      :cur-operation-detail-info="curOperationDetailInfo"
    />
  </div>
</template>

<script>
import { deepClone } from '@/utils'
import {
  filter_client,
  client_tags_auto_complete,
  delete_client_by_id
} from '@/api/customer'
import clientDialogBox from './components/clientDialogBox' // 客户对话框
import { mapGetters } from 'vuex'
export default {
  components: { clientDialogBox },
  data() {
    return {
      form: {
        名称: '',
        地址: '',
        电话: ''
      },
      // 是否启用按钮loading状态防止多次点击
      btnLoading: false,
      // 配置中对客户的tags数组
      client_tag_names: [],
      // 对应的用于搜索和自动补全的tags模块
      client_tag_filter: {},
      // 当前页数
      currentPage: 1,
      // 总条目数
      total: 0,
      // 当前页数据量
      pageSize: 10,
      // 客户列表的表头列表
      tableHeader: [],
      // 客户列表的表头列表对应属性
      tableProps: [],
      // 客户信息
      clientTableData: [],
      // 是否展示客户对话框
      clienteleDialogVisible: false,
      // 打开客户对话框的模式
      openMode: '',
      // 当前操作的信息（查看，删除）
      curOperationDetailInfo: null
    }
  },
  computed: {
    ...mapGetters([
      '管理权限'
    ])
  },
  // 进入该页面后，查询列表API
  created() {
    this.getClientTagName()
  },
  mounted() {
    this.filterClient()
  },
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
          x = 4
          y = 5
        } else if (command === 'b') {
          x = 4
          y = 6
        } else if (command === 'c') {
          x = 4
          y = 7
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

    // 获取配置中对客户的tags数组，确保先载入
    getClientTagName(callback) {
      this.client_tag_names = this.$store.getters['客户的标签']
      this.client_tag_filter = {}
      for (var index in this.client_tag_names) {
        this.$set(this.client_tag_filter, this.client_tag_names[index], '')
      }
    },
    // 条件查询客户信息
    async filterClient() {
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
        if (this.form['名称']) {
          post_data['名称'] = this.form['名称']
        }
        if (this.form['地址']) {
          post_data['地址'] = this.form['地址']
        }
        if (this.form['电话']) {
          post_data['电话'] = this.form['电话']
        }
      }
      post_data['tags'] = this.client_tag_filter
      // 调用api
      const response = await filter_client(post_data)
      var client_items = response.data
      for (var i = 0; i < client_items.length; i++) {
        // 将动态 tags 的信息展开到外层
        for (var tag_index in this.client_tag_names) {
          client_items[i][this.client_tag_names[tag_index]] = client_items[i]['tags'][this.client_tag_names[tag_index]]
        }
      }
      this.tableHeader = []
      this.tableProps = []
      for (var index in this.client_tag_names) {
        this.tableHeader.push(this.client_tag_names[index])
        this.tableProps.push(this.client_tag_names[index])
      }
      this.clientTableData = client_items
      this.total = response.total_count
    },
    // 页码控制时，每页数量改变的处理函数
    handleSizeChange(val) {
      this.pageSize = val
      this.filterClient()
    },
    // 页码控制时，每页码改变改变的处理函数
    handleCurrentChange(val) {
      this.currentPage = val
      this.filterClient()
    },

    // 对客户标签进行自动补全操作
    async tagQueryAutoCompleteSearch(queryString, callback, tag_name) {
      if (queryString === undefined || queryString === null) {
        queryString = ''
      }
      var login_token = this.$store.getters.token
      var post_data = {
        login_token: login_token,
        base_tags: this.client_tag_filter,
        target_tag_name: tag_name
      }
      // 调用api
      const response = await client_tags_auto_complete(post_data)
      var suggest_value_list = []
      for (var index in response.data) {
        suggest_value_list.push({
          value: response.data[index]
        })
      }
      callback(suggest_value_list)
    },
    clearCondition(formName) {
      this.$refs[formName].resetFields()
      this.client_tag_filter = {}
      for (var index in this.client_tag_names) {
        this.$set(this.client_tag_filter, this.client_tag_names[index], '')
      }
      this.filterClient()
    },
    // 处理客户的搜索
    handleSearch() {
      this.filterClient(this.form) // 重新载入数据
    },
    // 添加客户信息信息按钮
    addClient() {
      this.openMode = 'add'
      this.clienteleDialogVisible = true
    },
    // 查看 修改按钮点击
    editClientDetailInfo(supplierInfo) {
      this.openMode = 'viewAndModify'
      this.curOperationDetailInfo = deepClone(supplierInfo)
      this.clienteleDialogVisible = true
    },
    // 客户信息对话框关闭后回调
    clientDialogCallback(status, refresh_flag) {
      this.clienteleDialogVisible = status
      if (refresh_flag) {
        this.filterClient()
      }
    },

    // 删除按钮点击
    deleteClient(supplierInfo) {
      this.$confirm('确认删除客户?', 'Warning', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          var post_data = {
            login_token: this.$store.getters.token,
            unique_id: supplierInfo.unique_id
          }
          const response = await delete_client_by_id(post_data)

          this.$message({
            type: 'success',
            message: response.msg
          })
          this.filterClient()
        })
        .catch(err => {
          console.error(err)
        })
    },

    // 导出excel
    exportExcel() {
      this.btnLoading = true
      setTimeout(() => {
        this.btnLoading = false
      }, 3000)
      var tags = this.clientTableData[0].tags
      var tHeader = [
        '客户名称',
        '电话',
        '地址',
        '备注',
        '更新时间'
      ]
      var filterVal = [
        '名称',
        '电话',
        '地址',
        '备注',
        '更新时间'
      ]
      for (var key_a in tags) {
        tHeader.unshift(key_a)
        filterVal.unshift(key_a)
      }
      var tableData = deepClone([...this.clientTableData])
      for (let i = 0; i < tableData.length; i++) {
        var element = tableData[i]
        for (var key_b in element.tags) {
          element[key_b] = element.tags[key_b]
        }
        // 删除tags的键值
        delete element.tags
      }
      const data = this.formatJson(filterVal, tableData)
      import('@/vendor/Export2Excel').then(excel => {
        excel.export_json_to_excel({
          header: tHeader, // 表头 必填
          data, // 具体数据 必填
          filename: '客户信息表' // 非必填
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
  .module-a {
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
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      .item-0 {
        width: 100%;
        display: flex;
        justify-content: space-between;
      }
    }
  }

  .module-b {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    margin-bottom: 20px;
    .header {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
  }
  .paging {
    float: right;
  }
}
</style>

