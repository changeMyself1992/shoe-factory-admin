<template>
  <div class="app-container">
    <div class="table-a">
      <el-select slot="prepend" v-model.trim="searchLabel" placeholder="请选择">
        <el-option label="搜索：名字" value="name" />
        <el-option label="搜索：身份" value="role" />
        <el-option label="搜索：手机号码" value="mobile_num" />
        <el-option label="搜索：工作状态" value="Working_state" />
      </el-select>
      <el-input v-model.trim="searchValue" class="input-with-select" placeholder="请输入搜索的字符和目标">
        <el-button slot="append" icon="el-icon-search" @click="filterUser" />
      </el-input>

      <el-button
        class="adduser"
        type="primary"
        size="small"
        :disabled="!管理权限['人员管理可写']"
        @click="handleAdd()"
      >添加人员信息</el-button>
      <el-button class="excel" type="primary" size="small" :loading="btnLoading" :disabled="!管理权限['人员管理列表可读']" @click="exportExcel">导出EXCEL表格</el-button>
      <div class="useintro">
        <el-dropdown :show-timeout="0" @command="handleCommand">
          <img src="@/assets/images/help.png" class="help">
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="a">如何查看企业所有员工信息？</el-dropdown-item>
            <el-dropdown-item command="b">企业如何添加员工和管理人员？</el-dropdown-item>
            <el-dropdown-item command="c">未注册的员工如何自行申请注册？</el-dropdown-item>
            <el-dropdown-item command="d">管理人员如何审核通过提交注册申请的员工？</el-dropdown-item>
            <el-dropdown-item command="e" class="blue">更多问题，请访问帮助中心</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>

    <!--已经存在的员工-->
    <el-table :height="tableHeight" :data="tableData" border :default-sort="{prop: 'date', order: 'descending'}" :cell-style="cellStyle">
      <el-table-column align="center" label="已经存在的员工">
        <el-table-column align="center" prop="name" label="姓名">
          <template slot-scope="scope">
            <span><i v-if="'超级管理员' in scope.row" class="el-icon-star-on" />&nbsp;{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="mobile_num" label="绑定手机" />
        <el-table-column align="center" prop="role" label="角色" />
        <el-table-column
          align="center"
          label="工序"
          min-width="230"
        >
          <template slot-scope="scope">
            <el-tag v-for="value in scope.row.负责工序" :key="value" class="tag">{{ value }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="gender" label="性别" />
        <el-table-column align="center" prop="birthday" label="出生日期" />
        <el-table-column
          align="center"
          prop="work_status"
          label="工作状态"
          :filters="[{ text: '在职', value: '在职' }, { text: '离职', value: '离职' }, { text: '请假', value: '请假' },
                     { text: '开除', value: '开除' }]"
          :filter-method="filterTag"
        />
        <el-table-column align="center" prop="update_time" label="更新时间" width="180" sortable />

        <el-table-column label="操作" width="150">
          <template slot-scope="scope">
            <el-button
              type="primary"
              size="small"
              :disabled="!管理权限['人员管理可写']"
              @click="handleEdit(scope.row)"
            >编辑</el-button>
            <el-button
              type="danger"
              size="small"
              :disabled="!管理权限['人员管理可写']"
              @click="handleDelete(scope.row)"
            >删除</el-button>
          </template>
        </el-table-column>
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

    <!--申请的员工-->
    <el-table :data="ApplyTableData" border :default-sort="{prop: 'date', order: 'descending'}" :cell-style="cellStyle">
      <el-table-column align="center" label="员工申请">
        <el-table-column align="center" prop="name" label="姓名" />
        <el-table-column align="center" prop="mobile_num" label="绑定手机" />
        <el-table-column align="center" prop="role" label="角色" />
        <el-table-column
          align="center"
          label="工序"
          min-width="230"
        >
          <template slot-scope="scope">
            <el-tag v-for="value in scope.row.负责工序" :key="value" class="tag">{{ value }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="gender" label="性别" />
        <el-table-column align="center" prop="birthday" label="出生日期" />
        <el-table-column align="center" prop="work_status" label="工作状态" />
        <el-table-column align="center" prop="update_time" label="更新时间" width="180" sortable />

        <el-table-column label="操作" width="150">
          <template slot-scope="scope">
            <el-button
              type="primary"
              size="small"
              :disabled="!管理权限['人员管理可写']"
              @click="handleEdit(scope.row)"
            >编辑</el-button>
            <el-button
              type="danger"
              size="small"
              :disabled="!管理权限['人员管理可写']"
              @click="handleDelete(scope.row)"
            >拒绝</el-button>
          </template>
        </el-table-column>
      </el-table-column>
    </el-table>
    <el-pagination
      class="el-pagination"
      :current-page="currentApplyPage"
      :page-sizes="[50, 100, 150, 200]"
      :page-size="currentApplyPageSize"
      :total="currentApplyTotal"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleApplySizeChange"
      @current-change="handleApplyPageChange"
    />
    <!-- 添加人员信息对话框 -->
    <add-user-dialog-box
      :edit-user-mode="editUserMode"
      :edit-user-unique-id="editUserUniqueId"
      :dialog-visible="dialogVisible"
      :on-close="closeAddRoleDialogCallback"
    />
  </div>
</template>

<script>
import addUserDialogBox from './components/addUserDialogBox'
import { deepClone } from '@/utils'
import {
  filter_user,
  delete_user_by_id
} from '@/api/personnelAndAuthorityManagement'
import { mapGetters } from 'vuex'
export default {
  components: { addUserDialogBox },
  data() {
    return {
      // 搜索内容
      searchValue: '',
      // 条件搜索 按手机号，姓名...等等条件 name, role, mobile_num
      searchLabel: 'name',
      // 当前页数
      currentPage: 1,
      // 当前页数据量
      pageSize: 50,
      // 总条目数
      total: 0,
      // 用户信息
      tableData: [],

      // 员工申请表的页
      currentApplyPage: 1,
      // 员工申请表的页数据量
      currentApplyPageSize: 50,
      // 员工申请表的总条目数
      currentApplyTotal: 0,
      // 员工申请表的用户信息
      ApplyTableData: [],

      // 是否展示添加员工对话框
      dialogVisible: false,
      // 是否展示添加员工对话框模式为编辑模式
      editUserMode: false,
      // 用于编辑员工信息时的员工unique_id
      editUserUniqueId: null,

      // 是否启用按钮loading状态防止多次点击
      btnLoading: false,
      tableHeight: ''
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
    this.tableHeight = window.innerHeight * 0.75
    // _.debounce is a function provided by lodash to limit how
    // often a particularly expensive operation can be run.
    // In this case, we want to limit how often we access
    // yesno.wtf/api, waiting until the user has completely
    // finished typing before making the ajax request. To learn
    // more about the _.debounce function (and its cousin
    // _.throttle), visit: https://lodash.com/docs#debounce
    this.debouncedHandleSearch = this.$_.debounce(this.filterUser, 800)
    this.filterUser()
    this.filterApplyUser()
  },
  // 进入该页面后，查询列表API
  mounted() {
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
          x = 1
          y = 0
        } else if (command === 'b') {
          x = 1
          y = 1
        } else if (command === 'c') {
          x = 1
          y = 2
        } else if (command === 'd') {
          x = 1
          y = 3
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

    // 添加人员点击
    handleAdd() {
      this.editUserMode = false
      this.dialogVisible = true
    },
    // 添加人员对话框关闭后回调
    // 是否需要刷新父组件
    closeAddRoleDialogCallback(status, isRefresh) {
      this.dialogVisible = status
      if (isRefresh) {
        this.filterUser()
        this.filterApplyUser()
      }
    },

    // 页码控制时，每页数量改变的处理函数
    handleSizeChange(val) {
      this.pageSize = val
      this.filterUser()
    },
    // 页码控制时，每页码改变改变的处理函数
    handleCurrentChange(val) {
      this.currentPage = val
      this.filterUser()
    },
    filterTag(value, row) {
      return row.work_status === value
    },
    // 查询 已经存在的员工
    async filterUser() {
      var post_data = {
        login_token: this.$store.getters.token,
        sort: { update_time: -1 },
        '工作状态': ['在职', '离职', '请假', '开除']
      }
      if (this.searchLabel !== undefined && this.searchValue.length > 0) {
        this.searchValue = this.searchValue.trim()
        this.currentPage = 1
        this.pageSize = 50
        if (this.searchLabel === 'name') {
          post_data['姓名'] = '.*' + this.searchValue + '.*'
        } else if (this.searchLabel === 'role') {
          post_data['管理角色'] = '.*' + this.searchValue + '.*'
        } else if (this.searchLabel === 'mobile_num') {
          post_data['绑定手机号'] = '.*' + this.searchValue + '.*'
        } else if (this.searchLabel === 'Working_state') {
          var temp = []
          temp.push(this.searchValue)
          post_data['工作状态'] = temp
        }
      }
      post_data['pagination'] = {
        page: parseInt(this.currentPage),
        limit: parseInt(this.pageSize)
      }
      const response = await filter_user(post_data)
      var user_items = []
      for (var i = 0; i < response.data.length; i++) {
        var item = response.data[i]
        var curr_item = {
          name: item['个人信息']['姓名'],
          mobile_num: item['绑定手机号'],
          role: item['管理角色'],
          gender: item['个人信息']['性别'],
          birthday: item['个人信息']['出生日期'],
          update_time: item['更新时间'],
          work_status: item['工作状态'],
          负责工序: item['负责工序']
        }

        if ('超级管理员' in item) {
          curr_item['超级管理员'] = item['超级管理员']
        }
        user_items.push(curr_item)
      }
      this.tableData = user_items
      this.total = response.total_count
    },

    handleApplySizeChange(val) {
      this.currentApplyPageSize = val
      this.filterApplyUser()
    },
    handleApplyPageChange(val) {
      this.currentApplyPage = val
      this.filterApplyUser()
    },
    // 查询待确认的员工
    async filterApplyUser() {
      var post_data = {
        login_token: this.$store.getters.token,
        pagination: {
          page: parseInt(this.currentApplyPage),
          limit: parseInt(this.currentApplyPageSize)
        },
        sort: { update_time: -1 },
        '工作状态': ['待确认']
      }
      const response = await filter_user(post_data)
      var user_items = []
      for (var i = 0; i < response.data.length; i++) {
        var item = response.data[i]
        user_items.push({
          name: item['个人信息']['姓名'],
          mobile_num: item['绑定手机号'],
          role: item['管理角色'],
          gender: item['个人信息']['性别'],
          birthday: item['个人信息']['出生日期'],
          update_time: item['更新时间'],
          work_status: item['工作状态'],
          负责工序: item['负责工序']
        })
      }
      this.ApplyTableData = user_items
      this.currentApplyTotal = response.total_count
    },

    // 导出excel
    exportExcel() {
      this.btnLoading = true
      setTimeout(() => {
        this.btnLoading = false
      }, 3000)
      const tHeader = [
        '姓名',
        '绑定手机号',
        '角色',
        '负责工序',
        '性别',
        '出生日期',
        '工作状态',
        '更新时间'
      ]
      const filterVal = [
        'name',
        'mobile_num',
        'role',
        '负责工序',
        'gender',
        'birthday',
        'work_status',
        'update_time'
      ]
      const tableData = deepClone([...this.tableData])
      const data = this.formatJson(filterVal, tableData)
      import('@/vendor/Export2Excel').then(excel => {
        excel.export_json_to_excel({
          header: tHeader, // 表头 必填
          data, // 具体数据 必填
          filename: '人员列表', // 非必填
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
    },
    // 编辑按钮
    handleEdit(roleData) {
      this.editUserMode = true
      this.editUserUniqueId = roleData['mobile_num']
      this.dialogVisible = true
    },
    // 删除按钮
    async handleDelete(roleData) {
      if (confirm('确认要删除用户' + roleData['name'] + '吗？')) {
        var post_data = {
          login_token: this.$store.getters.token,
          unique_id: roleData['mobile_num']
        }
        // 调用api 删除相应的产品
        const response = await delete_user_by_id(post_data)
        this.filterUser()
        this.filterApplyUser()
        this.$message({
          type: 'success',
          message: response.msg
        })
      }
    },

    cellStyle(info) {
      // 在职 0DA317
      // 请假 0938D4
      // 开除 E72414
      // 离职 9D27B0
      // 待确认 F5A623

      // 如果列所有等于5 代表工作状态
      if (info.columnIndex === 6) {
        if (info.row.work_status === '在职') {
          return 'color:#0DA317;'
        }
        if (info.row.work_status === '请假') {
          return 'color:#0938D4;'
        }
        if (info.row.work_status === '开除') {
          return 'color:#E72414;'
        }
        if (info.row.work_status === '离职') {
          return 'color:#9D27B0;'
        }
        if (info.row.work_status === '待确认') {
          return 'color:#F5A623;'
        }
        return ''
      }
      return ''
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
    .adduser {
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
    margin-bottom: 30px;
  }
  .el-icon-star-on{
    color: red;
  }
  .tag {
    margin: 2px;
  }
}
</style>
