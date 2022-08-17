<template>
  <div class="app-container">
    <div class="useintro">
      <el-dropdown :show-timeout="0" @command="handleCommand">
        <img src="@/assets/images/help.png" class="help">
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="a">如何添加或删除工序信息？</el-dropdown-item>
          <el-dropdown-item command="b">如何调整工序顺序？</el-dropdown-item>
          <el-dropdown-item command="c" class="blue">更多问题，请访问帮助中心</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <div class="table-a">
      <el-input v-model.trim="searchValue" class="input-with-select" placeholder="请输入搜索工序名称">
        <el-button slot="append" icon="el-icon-search" @click="handleSearch()" />
      </el-input>

      <el-button class="addprocess" type="primary" size="small" :disabled="!管理权限['工序信息可写']" @click="handleAdd()">添加新的工序</el-button>
      <el-button class="excel" type="primary" size="small" :disabled="!管理权限['工序信息可读']" :loading="btnLoading" @click="exportExcel">导出EXCEL表格</el-button>
    </div>

    <el-table :data="tableData" border>
      <el-table-column align="center" prop="name" label="工序名称" width="120" />
      <el-table-column align="center" prop="description" label="描述" />
      <el-table-column align="center" prop="comment" label="备注" />
      <!-- <el-table-column align="center" prop="updateTime" label="更新时间" width="180" /> -->

      <el-table-column align="center" label="操作" width="300">
        <template slot-scope="scope">
          <el-button type="primary" size="small" :disabled="!管理权限['工序信息可写']" @click="increaseRank(scope.row)">上升</el-button>
          <el-button type="primary" size="small" :disabled="!管理权限['工序信息可写']" @click="decreaseRank(scope.row)">下降</el-button>
          <el-button type="primary" size="small" :disabled="!管理权限['工序信息可写']" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button type="danger" size="small" :disabled="!管理权限['工序信息可写']" @click="handleDelete(scope.row)">删除</el-button>
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
    <!-- 添加工序信息对话框 -->
    <process-operation-dialog-box
      :dialog-visible="dialogVisible"
      :on-close="closeAddProcessDialogCallback"
      :mode="mode"
      :process-data="processData"
    />
  </div>
</template>

<script>
import { deepClone } from '@/utils'
import processOperationDialogBox from './components/processOperationDialogBox'
import { filter_process, delete_process_by_id, increase_process_by_id, decrease_process_by_id } from '@/api/maintenanceOfProcessPartsOfProductLibrary'
import { mapGetters } from 'vuex'
export default {
  components: { processOperationDialogBox },
  data() {
    return {
      // 搜索内容
      searchValue: '',
      // 当前页数
      currentPage: 1,
      // 总条目数
      total: 0,
      // 当前页数据量
      pageSize: 50,
      // 用户信息
      tableData: [],
      // 是否启用按钮loading状态防止多次点击
      btnLoading: false,
      // 是否展示添加工序对话框
      dialogVisible: false,
      mode: 'add',
      processData: {}
    }
  },
  computed: {
    ...mapGetters([
      '管理权限'
    ])
  },
  watch: {
    // 任何时候搜索框有变化都会调用该函数
    searchValue: function(newSearchValue, oldSearchValue) {
      this.debouncedHandleSearch()
    }
  },
  created: function() {
    // _.debounce is a function provided by lodash to limit how
    // often a particularly expensive operation can be run.
    // In this case, we want to limit how often we access
    // yesno.wtf/api, waiting until the user has completely
    // finished typing before making the ajax request. To learn
    // more about the _.debounce function (and its cousin
    // _.throttle), visit: https://lodash.com/docs#debounce
    this.debouncedHandleSearch = this.$_.debounce(this.handleSearch, 300)
  },
  // 进入该页面后，查询列表API
  mounted() {
    this.filterProcess()
  },
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
          x = 8
          y = 0
        } else if (command === 'b') {
          x = 8
          y = 1
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
      this.filterProcess()
    },
    // 页码控制时，每页码改变改变的处理函数
    handleCurrentChange(val) {
      this.currentPage = val
      this.filterProcess()
    },
    // 添加工序点击
    handleAdd() {
      this.mode = 'add'
      this.processData = {}
      this.$nextTick(() => {
        this.dialogVisible = true
      })
    },
    // 编辑工序
    handleEdit(processData) {
      this.mode = 'edit'
      this.processData = processData
      this.$nextTick(() => {
        this.dialogVisible = true
      })
    },
    // 对话框关闭后回调
    closeAddProcessDialogCallback(status, refresh_flag) {
      this.dialogVisible = status
      if (refresh_flag) {
        this.filterProcess()
      }
    },
    // 提高排名
    async increaseRank(processData) {
      var post_data = {
        login_token: this.$store.getters.token,
        unique_id: processData.name
      }
      await increase_process_by_id(post_data)
      await this.filterProcess()
    },
    // 降低排名
    async decreaseRank(processData) {
      var post_data = {
        login_token: this.$store.getters.token,
        unique_id: processData.name
      }
      await decrease_process_by_id(post_data)
      await this.filterProcess()
    },

    // 处理删除工序的点击请求
    handleDelete(processData) {
      this.$confirm('删除操作将会永久删除该工序，你确认吗?', 'Warning', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          var post_data = {
            login_token: this.$store.getters.token,
            unique_id: processData.name
          }
          await delete_process_by_id(post_data)
          await this.filterProcess()
        })
        .catch(err => {
          console.error(err)
        })
    },
    // 处理工序的搜索
    handleSearch() {
      this.filterProcess(this.searchValue) // 重新载入数据
    },
    // 页面加载时，以及数据更新时调用，用于获取最新的工序列表
    async filterProcess(process_name) {
      var post_data = {
        login_token: this.$store.getters.token,
        pagination: {
          page: parseInt(this.currentPage),
          limit: parseInt(this.pageSize)
        }
      }
      if (process_name !== undefined) {
        post_data['工序名称'] = '.*' + process_name + '.*'
      }
      const response = await filter_process(post_data)
      var process_items = []
      for (var i = 0; i < response.data.length; i++) {
        var item = response.data[i]
        process_items.push({
          name: item['工序名称'],
          description: item['描述'],
          comment: item['备注'],
          updateTime: item['更新时间']
        })
      }
      this.tableData = process_items
      this.total = response.total_count
    },
    // 导出excel
    exportExcel() {
      this.btnLoading = true
      setTimeout(() => {
        this.btnLoading = false
      }, 3000)
      const tHeader = ['工序名称', '描述', '备注', '更新时间']
      const filterVal = ['name', 'description', 'comment', 'updateTime']
      const tableData = deepClone([...this.tableData])
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
.app-container {
  .table-a {
    position: relative;
    overflow: hidden;
    margin-bottom: 20px;
    .input-with-select {
      float: left;
      width: 35%;
    }
    .addprocess {
      float: right;
    }
    .excel {
      float: right;
      margin-right: 10px;
    }
  }
  .table-b {
    width: 100%;
  }
  .el-pagination {
    text-align: right;
  }
}
</style>
