<template>
  <div class="wageDeductionDialogBox">
    <el-dialog :visible.sync="show" title="添加员工工资抵扣记录" center width="1000px">
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
      </div>

      <!--已经存在的员工-->
      <el-table :data="tableData" border>
        <el-table-column align="center" label="已经存在的员工">
          <el-table-column label="选择" width="70" center>
            <template slot-scope="scope">
              <el-radio
                v-model="curSelectIndex"
                class="radio"
                :label="scope.$index"
                @change.native="radioHandler(scope.$index)"
              >&nbsp;</el-radio>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="name" label="姓名" />
          <el-table-column align="center" prop="mobile_num" label="绑定手机" />
          <el-table-column align="center" prop="role" label="角色" />
          <el-table-column align="center" prop="gender" label="性别" />
          <el-table-column align="center" prop="work_status" label="工作状态" />
        </el-table-column>
      </el-table>

      <el-pagination
        class="el-pagination"
        :current-page="page"
        :page-sizes="[5, 10, 30]"
        :page-size="limit"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />

      <!--员工抵扣信息表单-->
      <el-form ref="form" class="form" :model="form" label-position="left">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>抵扣费用填写</span>
          </div>

          <el-form-item class="item" prop="姓名" label="员工姓名" label-width="100px">
            <el-input v-model.trim="form.姓名" disabled />
          </el-form-item>
          <el-form-item class="item" prop="工资抵扣原因" label="工资抵扣原因" label-width="100px">
            <el-input v-model="form.工资抵扣原因" />
          </el-form-item>
          <el-form-item class="item" prop="抵扣金额" label="抵扣金额" label-width="100px">
            <el-input v-model="form.抵扣金额" type="number" @blur="onBlurElementsInfo" />
          </el-form-item>
          <el-form-item class="item" prop="记录发生时间" label="记录发生时间" label-width="100px">
            <el-date-picker
              v-model="form.记录发生时间"
              type="datetime"
              placeholder="选择日期时间"
            />
          </el-form-item>
        </el-card>
      </el-form>

      <div class="form-btn-box">
        <el-button
          type="primary"
          size="small"
          :loading="loading"
          @click="formSubmit()"
        >提交</el-button>
        <el-button size="small" @click="formCancel()">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { filter_user } from '@/api/personnelAndAuthorityManagement'
import { manager_add_staff_costs } from '@/api/employeeDeductionInformation'
import { isEmpty, parseTime } from '@/utils'
export default {
  props: {
    dialogVisible: Boolean,
    onClose: {
      required: true,
      validator: function(value) {
        return true
      }
    }
  },
  data() {
    return {
      show: false,
      // 是否需要刷新父组件
      isRefresh: false,
      // 搜索内容
      searchValue: '',
      // 条件搜索 按手机号，姓名...等等条件 name, role, mobile_num
      searchLabel: 'name',
      // 当前页数
      page: 1,
      // 当前页数据量
      limit: 5,
      // 总条目数
      total: 0,
      // 用户信息
      tableData: [],
      loading: false,
      // 当前选中的员工索引
      curSelectIndex: -1,
      // 当前选中的员工信息
      selectedStaffInfo: {},
      form: {
        员工unique_id: '',
        姓名: '',
        工资抵扣原因: '',
        抵扣金额: 0,
        记录发生时间: ''
      }
    }
  },
  computed: {},
  watch: {
    dialogVisible: function(newVal, oldVal) {
      this.show = newVal
      // 如果是打开的过程
      if (newVal && !oldVal) {
        this.filterUser()
      }
    },
    show: function(newVal, oldVal) {
      if (!newVal) {
        this.onClose(this.isRefresh)
        this.initializeData()
      }
    },
    // 任何时候搜索框有变化都会调用该函数
    searchValue: function(newSearchValue, oldSearchValue) {
      this.debouncedHandleSearch()
    },
    selectedStaffInfo: function(newVal, oldVal) {
      if (newVal) {
        this.form.员工unique_id = newVal.unique_id
        this.form.姓名 = newVal.name
      } else {
        this.form.员工unique_id = ''
        this.form.姓名 = ''
      }
    }
  },
  created() {
    this.debouncedHandleSearch = this.$_.debounce(this.filterUser, 800)
  },
  methods: {
    initializeData() {
      // 是否需要刷新父组件
      this.isRefresh = false
      // 搜索内容
      this.searchValue = ''
      // 条件搜索 按手机号，姓名...等等条件 name, role, mobile_num
      this.searchLabel = 'name'
      // 当前页数
      this.page = 1
      // 当前页数据量
      this.limit = 5
      // 总条目数
      this.total = 0
      // 用户信息
      this.tableData = []
      this.loading = false
      // 当前选中的员工索引
      this.curSelectIndex = -1
      // 当前选中的员工信息
      this.selectedStaffInfo = {}
      this.form = {
        员工unique_id: '',
        姓名: '',
        工资抵扣原因: '',
        抵扣金额: 0,
        记录发生时间: ''
      }
    },
    // 页数改变
    handleCurrentChange(val) {
      this.page = val
      this.curSelectIndex = -1
      this.selectedStaffInfo = {}
      this.filterUser()
    },
    // 每页最大数据量改变
    handleSizeChange(val) {
      this.curSelectIndex = -1
      this.selectedStaffInfo = {}
      this.limit = val
      this.filterUser()
    },
    // 查询 已经存在的员工
    async filterUser() {
      var post_data = {
        login_token: this.$store.getters.token,
        sort: { update_time: -1 },
        工作状态: ['在职', '离职', '请假', '开除']
      }
      if (this.searchLabel !== undefined && this.searchValue.length > 0) {
        this.searchValue = this.searchValue.trim()
        this.page = 1
        this.limit = 5
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
        page: this.page,
        limit: this.limit
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
          负责工序: item['负责工序'],
          unique_id: item['unique_id']
        }
        user_items.push(curr_item)
      }
      this.tableData = user_items
      this.total = response.total_count
    },
    // 选择一个员工
    radioHandler(index) {
      this.selectedStaffInfo = this.tableData[index]
    },
    // 抵扣金额失去焦点后
    onBlurElementsInfo() {
      if (isEmpty(this.form['抵扣金额']) || this.form['抵扣金额'] < 0) {
        this.form['抵扣金额'] = 0
      } else {
        this.form['抵扣金额'] = Number(parseFloat(this.form['抵扣金额']).toFixed(2))
      }
    },
    formSubmit(e) {
      this.loading = true
      this.$nextTick(async() => {
        if (isEmpty(this.form['员工unique_id']) || isEmpty(this.form['姓名'])) {
          this.loading = false
          this.$message({
            message: '请选择一个员工！',
            type: 'warning'
          })
          return
        }
        if (isEmpty(this.form['工资抵扣原因'])) {
          this.loading = false
          this.$message({
            message: '请填写抵扣原因！',
            type: 'warning'
          })
          return
        }
        if (isEmpty(this.form['抵扣金额']) || this.form['抵扣金额'] < 0) {
          this.loading = false
          this.$message({
            message: '请填写抵扣金额！',
            type: 'warning'
          })
          return
        }
        if (!this.form['记录发生时间']) {
          this.loading = false
          this.$message({
            message: '请填写记录发生时间！',
            type: 'warning'
          })
          return
        }
        var paramter = {
          login_token: this.$store.getters.token,
          data: {
            员工unique_id: this.form.员工unique_id,
            工资抵扣原因: this.form.工资抵扣原因,
            抵扣金额: this.form.抵扣金额,
            记录发生时间: parseTime(this.form['记录发生时间'], '{y}-{m}-{d} {h}:{i}:{s}')
          }
        }
        try {
          var res = await manager_add_staff_costs(paramter)
          this.$message({ message: res.msg, type: 'success' })
          this.isRefresh = true
          this.show = false
        } catch (error) {
          this.loading = false
        }
      })
    },
    formCancel() {
      this.show = false
    }

  }
}
</script>

<style lang="scss" scoped>
.wageDeductionDialogBox {
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
  .form-btn-box{
    margin-top: 10px;
    display: flex;
    justify-content: center;
  }
}
</style>
