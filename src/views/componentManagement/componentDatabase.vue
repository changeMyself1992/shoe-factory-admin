<template>
  <div class="app-container">
    <div class="useintro">
      <el-dropdown :show-timeout="0" @command="handleCommand">
        <img src="@/assets/images/help.png" class="help">
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="a">如何添加或删除部位信息？</el-dropdown-item>
          <el-dropdown-item command="b">如何调整部位顺序？</el-dropdown-item>
          <el-dropdown-item command="c" class="blue">更多问题，请访问帮助中心</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <div class="table-a">
      <el-input v-model.trim="searchValue" class="input-with-select" placeholder="请输入搜索部位名称">
        <el-button slot="append" icon="el-icon-search" @click="handleSearch()" />
      </el-input>

      <el-button class="addcomponent" type="primary" size="small" :disabled="!管理权限['部位列表可写']" @click="handleAdd()">添加新的部位</el-button>
      <el-button class="excel" type="primary" size="small" :loading="btnLoading" :disabled="!管理权限['部位列表可读']" @click="exportExcel">导出EXCEL表格</el-button>
    </div>

    <el-table :data="tableData" border>
      <el-table-column align="center" prop="name" label="部位名称" />
      <el-table-column align="center" prop="description" label="描述" />
      <el-table-column align="center" prop="comment" label="备注" />
      <!-- <el-table-column align="center" prop="updateTime" label="更新时间" /> -->

      <el-table-column label="操作" width="300">
        <template slot-scope="scope">
          <el-button type="primary" size="small" :disabled="!管理权限['部位列表可写']" @click="increaseRank(scope.row)">上升</el-button>
          <el-button type="primary" size="small" :disabled="!管理权限['部位列表可写']" @click="decreaseRank(scope.row)">下降</el-button>
          <el-button type="primary" size="small" :disabled="!管理权限['部位列表可写']" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button type="danger" size="small" :disabled="!管理权限['部位列表可写']" @click="handleDelete(scope.row)">删除</el-button>
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
    <!-- 添加部位信息对话框 -->
    <component-operation-dialog-box
      :dialog-visible="dialogVisible"
      :on-close="closeAddComponentDialogCallback"
      :mode="mode"
      :component-data="componentData"
    />
  </div>
</template>

<script>
import { deepClone } from '@/utils'
import componentOperationDialogBox from './components/componentOperationDialogBox'
import {
  delete_component_by_id, increase_component_by_id, decrease_component_by_id, filter_component
} from '@/api/maintenanceOfProcessPartsOfProductLibrary'
import { mapGetters } from 'vuex'
export default {
  components: { componentOperationDialogBox },
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
      // 是否展示添加部位对话框
      dialogVisible: false,
      // 是否启用按钮loading状态防止多次点击
      btnLoading: false,
      mode: 'add',
      componentData: {}
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
    this.debouncedHandleSearch = this.$_.debounce(this.handleSearch, 300)
  },
  // 进入该页面后，查询列表API
  mounted() {
    this.filterComponent()
  },
  destroyed() {
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
          x = 9
          y = 0
        } else if (command === 'b') {
          x = 9
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
      this.filterComponent()
    },
    // 页码控制时，每页码改变改变的处理函数
    handleCurrentChange(val) {
      this.currentPage = val
      this.filterComponent()
    },
    // 添加部位点击
    handleAdd() {
      this.mode = 'add'
      this.componentData = {}
      this.$nextTick(() => {
        this.dialogVisible = true
      })
    },
    // 编辑部位点击
    handleEdit(componentData) {
      this.mode = 'edit'
      this.componentData = componentData
      this.$nextTick(() => {
        this.dialogVisible = true
      })
    },
    // 添加人员对话框关闭后回调
    closeAddComponentDialogCallback(status) {
      this.dialogVisible = status
      this.filterComponent()
    },
    // 提高排名
    async increaseRank(componentData) {
      var post_data = {
        login_token: this.$store.getters.token,
        unique_id: componentData.name
      }
      await increase_component_by_id(post_data)
      await this.filterComponent()
    },
    // 降低排名
    async decreaseRank(componentData) {
      var post_data = {
        login_token: this.$store.getters.token,
        unique_id: componentData.name
      }
      await decrease_component_by_id(post_data)
      await this.filterComponent()
    },
    // 处理删除部位的点击请求
    handleDelete(componentData) {
      if (!confirm('删除操作将会永久删除该部位，你确认吗？')) {
        return false
      }
      var post_data = {
        'login_token': this.$store.getters.token,
        'unique_id': componentData.name
      }
      // 调用api
      delete_component_by_id(post_data)
        .then(response => {
          this.filterComponent() // 重新载入数据
        })
    },
    // 处理部位的搜索
    handleSearch() {
      this.filterComponent(this.searchValue) // 重新载入数据
    },
    // 页面加载时，以及数据更新时调用，用于获取最新的部位列表
    filterComponent(component_name) {
      var post_data = {
        'login_token': this.$store.getters.token,
        'pagination': {
          'page': parseInt(this.currentPage),
          'limit': parseInt(this.pageSize)
        }
      }
      if (component_name !== undefined) {
        post_data['部位名称'] = '.*' + component_name + '.*'
      }

      filter_component(post_data)
        .then(response => {
        // 成功接收到数据
          var component_items = []
          for (var i = 0; i < response.data.length; i++) {
            var item = response.data[i]
            component_items.push({
              'name': item['部位名称'],
              'description': item['描述'],
              'comment': item['备注'],
              'updateTime': item['更新时间']
            })
          }
          this.tableData = component_items
          this.total = response.total_count
        })
    },
    // 导出excel
    exportExcel() {
      this.btnLoading = true
      setTimeout(() => {
        this.btnLoading = false
      }, 3000)
      const tHeader = [
        '部位名称',
        '描述',
        '备注',
        '更新时间'
      ]
      const filterVal = [
        'name',
        'description',
        'comment',
        'updateTime'
      ]
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
    .addcomponent {
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
