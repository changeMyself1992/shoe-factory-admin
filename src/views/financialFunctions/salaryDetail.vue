<template>
  <div class="app-container">
    <div
      class="header"
      style="font-size: 30px; text-align: center; margin-top: 10px; margin-bottom: 10px;"
    >
      <b>
        员工:
        <strong style="color: #87CEFA;">{{ statisticalInformation.员工姓名 }}</strong> 由
        <strong style="color: #87CEFA;">{{ startDate }}</strong> 至
        <strong style="color: #87CEFA;">{{ endDate }}</strong> 的工资详情
      </b>
    </div>

    <div class="tag-box">
      <el-tag key="员工姓名" effect="dark" class="tag">员工姓名:{{ statisticalInformation.员工姓名 }}</el-tag>
      <el-tag key="员工手机" effect="dark" class="tag">员工手机:{{ statisticalInformation.员工手机 }}</el-tag>
      <el-tag key="累计计件数量" effect="dark" class="tag">累计计件数量:{{ statisticalInformation.累计计件数量 }}</el-tag>
      <el-tag key="累计工资" effect="dark" class="tag">累计工资:{{ statisticalInformation.累计工资 }}</el-tag>
      <el-tag key="累计抵扣金额" effect="dark" class="tag">累计抵扣金额:{{ deductionOfStatistical['累计抵扣金额'] }}</el-tag>
    </div>

    <el-collapse v-model.trim="activeNames">
      <el-collapse-item title="未确认的记录（折叠面板可展开关闭）" name="1">
        <!-- 未确认的工资列表 **************start**************-->
        <div>
          <div class="header" style="margin:0px 0 10px 0;">
            <el-tag
              key="未确认计件数量"
              effect="dark"
              class="tag"
            >未确认计件数量:{{ statisticalInformation.未确认计件数量 }}</el-tag>
            <el-tag key="未确认工资" effect="dark" class="tag">未确认工资:{{ statisticalInformation.未确认工资 }}</el-tag>
          </div>

          <el-table
            class="table"
            :data="unconfirmedDetailList"
            border
            style="width: 100%"
            :max-height="tableHeight"
          >
            <el-table-column width="80" align="center" prop="工序名称" label="工序名称" />
            <el-table-column width="110" align="center" prop="生产单编号" label="生产单编号" />
            <el-table-column width="70" align="center" prop="记录确认" label="记录是否确认">
              <template slot-scope="scope">
                <span>{{ scope.row['记录确认']?'是':'否' }}</span>
              </template>
            </el-table-column>
            <el-table-column width="160" align="center" prop="记录输入时间" label="记录输入时间" />
            <el-table-column width="160" align="center" prop="记录确认时间" label="记录确认时间" />
            <el-table-column width="100" align="center" prop="确认记录管理者姓名" label="确认记录管理者姓名" />
            <el-table-column width="80" align="center" prop="总排产数" label="总排产数">
              <template slot-scope="scope">
                <span>{{ scope.row['排产产品.排产配码数量.总排产数'] }}</span>
              </template>
            </el-table-column>
            <el-table-column width="80" align="center" prop="完成数量" label="完成数量" />
            <el-table-column width="80" align="center" prop="工序单位工资" label="工序单位工资" />
            <el-table-column width="80" align="center" prop="应发工资" label="应发工资" />
            <el-table-column align="center" label="产品信息" min-width="250">
              <template slot-scope="scope">
                <el-tag
                  v-for="(value,name) in scope.row['排产产品.产品信息.tags']"
                  :key="name"
                  class="tag"
                >{{ name }} : {{ value }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column width="150" align="center" label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  size="small"
                  :disabled="!管理权限['员工工资详情可写']"
                  @click="confirmStaffRecord(scope.row)"
                >点击确认计件记录</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination
            class="el-pagination"
            :current-page="unconfirmedCurrentPage"
            :page-sizes="[50, 100, 150, 200]"
            :page-size="unconfirmedPageSize"
            :total="unconfirmedTotal"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="(val)=>{handleSizeChange(val,false)}"
            @current-change="(val)=>{handlePageChange(val,false)}"
          />
        </div>
        <!-- 未确认的工资列表 **************end**************-->
      </el-collapse-item>

      <el-collapse-item title="已确认的记录（折叠面板可展开关闭）" name="2">
        <!-- 已确认的工资列表 **************start**************-->
        <div class="header" style="margin:0px 0 10px 0;">
          <el-tag
            key="已确认计件数量"
            effect="dark"
            class="tag"
          >已确认计件数量:{{ statisticalInformation.已确认计件数量 }}</el-tag>
          <el-tag key="已确认工资" effect="dark" class="tag">已确认工资:{{ statisticalInformation.已确认工资 }}</el-tag>
        </div>

        <el-table
          class="table"
          :data="salaryDetailList"
          border
          style="width: 100%"
          :max-height="tableHeight"
        >
          <el-table-column width="80" align="center" prop="工序名称" label="工序名称" />
          <el-table-column width="110" align="center" prop="生产单编号" label="生产单编号" />
          <el-table-column width="70" align="center" prop="记录确认" label="记录是否确认">
            <template slot-scope="scope">
              <span>{{ scope.row['记录确认']?'是':'否' }}</span>
            </template>
          </el-table-column>
          <el-table-column width="160" align="center" prop="记录输入时间" label="记录输入时间" />
          <el-table-column width="160" align="center" prop="记录确认时间" label="记录确认时间" />
          <el-table-column width="100" align="center" prop="确认记录管理者姓名" label="确认记录管理者姓名" />
          <el-table-column width="80" align="center" label="总排产数">
            <template slot-scope="scope">
              <span>{{ scope.row['排产产品.排产配码数量.总排产数'] }}</span>
            </template>
          </el-table-column>
          <el-table-column width="80" align="center" prop="完成数量" label="完成数量" />
          <el-table-column width="80" align="center" prop="工序单位工资" label="工序单位工资" />
          <el-table-column width="80" align="center" prop="应发工资" label="应发工资" />
          <el-table-column align="center" label="产品信息" min-width="250">
            <template slot-scope="scope">
              <el-tag
                v-for="(value,name) in scope.row['排产产品.产品信息.tags']"
                :key="name"
                class="tag"
              >{{ name }} : {{ value }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column width="150" align="center" label="操作">
            <template slot-scope="scope">
              <el-button
                disabled
                type="primary"
                size="small"
                @click="confirmStaffRecord(scope.row)"
              >记录已经确认</el-button>
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
          @size-change="(val)=>{handleSizeChange(val,true)}"
          @current-change="(val)=>{handlePageChange(val,true)}"
        />

        <!-- 已确认的工资列表 **************end**************-->
      </el-collapse-item>

      <el-collapse-item title="已抵扣的记录（折叠面板可展开关闭）" name="3">
        <!-- 已抵扣的工资列表 **************start**************-->
        <div class="header" style="margin:0px 0 10px 0;">
          <el-tag key="正常抵扣金额" effect="dark" class="tag">正常抵扣金额:{{ deductionOfStatistical.正常抵扣金额 }}</el-tag>
          <el-tag key="作废抵扣金额" effect="dark" class="tag">作废抵扣金额:{{ deductionOfStatistical.作废抵扣金额 }}</el-tag>
        </div>
        <el-table
          class="table"
          :data="payrollDeduction"
          border
          style="width: 100%"
          :max-height="tableHeight"
        >
          <el-table-column align="center" prop="员工姓名" label="员工姓名" />
          <el-table-column align="center" prop="员工手机" label="员工手机" />
          <el-table-column align="center" prop="工资抵扣原因" label="工资抵扣原因" />
          <el-table-column align="center" prop="抵扣金额" label="抵扣金额(元)" />
          <el-table-column align="center" prop="记录管理者姓名" label="记录管理者姓名" />
          <el-table-column align="center" prop="记录输入时间" label="记录输入时间" />
          <el-table-column align="center" prop="记录发生时间" label="记录发生时间" />
          <el-table-column align="center" label="是否作废" width="120">
            <template slot-scope="scope">
              <el-tag :type="scope.row['是否作废']?'danger':'success'">{{ scope.row['是否作废']?'是':'否' }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column align="center" label="操作" width="120">
            <template slot-scope="scope">
              <el-button
                type="danger"
                size="mini"
                :disabled="!(管理权限['工资抵扣']&&!scope.row['是否作废'])"
                @click="invalid(scope.row)"
              >作废</el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-pagination
          class="el-pagination"
          :current-page="deductionCurrentPage"
          :page-sizes="[50, 100, 150, 200]"
          :page-size="deductionPageSize"
          :total="deductionTotal"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="(val)=>{handleDeductionSizeChange(val)}"
          @current-change="(val)=>{handleDeductionPageChange(val)}"
        />
        <!-- 已抵扣的工资列表 **************end**************-->
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script>
import {
  manager_get_staff_salary_stats_by_unique_id,
  manager_get_staff_salary_records_by_unique_id
} from '@/api/ordersForProductionScheduling'
import {
  manager_get_staff_costs_stats_by_unique_id,
  manager_filter_staff_costs,
  manager_delete_staff_costs_by_unique_id
} from '@/api/employeeDeductionInformation'
import { manager_confirm_staff_record } from '@/api/scheduleManagement'
import { isEmpty } from '@/utils'
import { mapGetters } from 'vuex'
export default {
  components: {},
  data() {
    return {
      activeNames: ['1'], // 折叠面板展开管理

      salaryDetailList: [], // 已确认的工资列表
      currentPage: 1, // 已确认当前页数
      pageSize: 50, // 已确认当前页数据量
      total: 0, // 已确认的记录总数

      unconfirmedDetailList: [], // 未确认的工资列表
      unconfirmedCurrentPage: 1, // 未确认当前页数
      unconfirmedPageSize: 50, // 已确认的当前页数据量
      unconfirmedTotal: 0, // 未确认的记录总数

      payrollDeduction: [], // 抵扣工资列表
      deductionCurrentPage: 1, // 抵扣当前页数
      deductionPageSize: 50, // 抵扣当前页数据量
      deductionTotal: 0, // 抵扣总数

      startDate: '', // 路由传递过来的参数
      endDate: '', // 路由传递过来的参数

      statisticalInformation: {}, // 员工工资信息统计
      deductionOfStatistical: {}, // 抵扣统计

      tableHeight: ''
    }
  },
  computed: {
    ...mapGetters(['管理权限'])
  },
  created() {
    this.tableHeight = window.innerHeight * 0.75
    if (
      isEmpty(this.$route.query.unique_id) ||
      isEmpty(this.$route.query.date_upper) ||
      isEmpty(this.$route.query.date_lower)
    ) {
      return
    }
    this.startDate = this.$route.query.date_lower.split(' ')[0].trim()
    this.endDate = this.$route.query.date_upper.split(' ')[0].trim()
    this.managerGetStaffSalaryStatsByUniqueId()
    this.managerGetStaffCostsStatsByUniqueId()
    this.managerGetStaffSalaryRecordsByUniqueId(true)
    this.managerGetStaffSalaryRecordsByUniqueId(false)
    this.managerFilterStaffCosts()
  },
  mounted() {},
  methods: {
    // 页码控制时，每页数量改变的处理函数
    handleSizeChange(val, recordConfirmationStatus = false) {
      if (recordConfirmationStatus) {
        this.pageSize = val
        this.managerGetStaffSalaryRecordsByUniqueId(true)
      } else {
        this.unconfirmedPageSize = val
        this.managerGetStaffSalaryRecordsByUniqueId(false)
      }
    },
    // 页码控制时，每页码改变改变的处理函数
    handlePageChange(val, recordConfirmationStatus) {
      if (recordConfirmationStatus) {
        this.currentPage = val
        this.managerGetStaffSalaryRecordsByUniqueId(true)
      } else {
        this.unconfirmedCurrentPage = val
        this.managerGetStaffSalaryRecordsByUniqueId(false)
      }
    },
    // 指定时间 管理员通过员工的unique_id获得他的工资统计信息
    async managerGetStaffSalaryStatsByUniqueId() {
      var post_data = {
        login_token: this.$route.query.login_token,
        日期_上限: this.$route.query.date_upper,
        日期_下限: this.$route.query.date_lower,
        unique_id: this.$route.query.unique_id
      }
      var response = await manager_get_staff_salary_stats_by_unique_id(
        post_data
      )
      this.statisticalInformation = response.data
    },

    // 指定时间 管理员通过员工的unique_id获得他的工资记录信息
    // recordConfirmationStatus 记录确认的bool值
    async managerGetStaffSalaryRecordsByUniqueId(
      recordConfirmationStatus = false
    ) {
      if (
        isEmpty(this.$route.query.unique_id) ||
        isEmpty(this.$route.query.date_upper) ||
        isEmpty(this.$route.query.date_lower)
      ) {
        return
      }
      var post_data = {
        login_token: this.$route.query.login_token,
        unique_id: this.$route.query.unique_id,
        记录确认: recordConfirmationStatus,
        日期_上限: this.$route.query.date_upper,
        日期_下限: this.$route.query.date_lower,
        pagination: {
          page: recordConfirmationStatus
            ? parseInt(this.currentPage)
            : parseInt(this.unconfirmedCurrentPage),
          limit: recordConfirmationStatus
            ? parseInt(this.pageSize)
            : parseInt(this.unconfirmedPageSize)
        },
        sort: {
          记录确认时间: -1
        }
      }

      var response = await manager_get_staff_salary_records_by_unique_id(
        post_data
      )
      if (recordConfirmationStatus) {
        this.salaryDetailList = response.data['记录列表']
        this.total = response.data.pagination.total
      } else {
        this.unconfirmedDetailList = response.data['记录列表']
        this.unconfirmedTotal = response.data.pagination.total
      }
    },
    // 确认工资记录
    async confirmStaffRecord(item) {
      var parameter = {
        login_token: this.$store.getters.token,
        生产单unique_id: item['生产单编号'],
        工序unique_id: item['工序名称'],
        员工unique_id: this.$route.query.unique_id
      }
      // 发起管理人员确认员工计件 请求
      const res = await manager_confirm_staff_record(parameter)
      this.$message({
        type: 'success',
        message: res.msg
      })
      // 重新初始化页面
      this.managerGetStaffSalaryStatsByUniqueId()
      this.managerGetStaffSalaryRecordsByUniqueId(true)
      this.managerGetStaffSalaryRecordsByUniqueId(false)
    },
    // 指定时间 管理员通过员工unique_id获取工资抵扣信息
    async managerGetStaffCostsStatsByUniqueId() {
      if (
        isEmpty(this.$route.query.unique_id) ||
        isEmpty(this.$route.query.date_upper) ||
        isEmpty(this.$route.query.date_lower)
      ) {
        return
      }
      var post_data = {
        login_token: this.$route.query.login_token,
        unique_id: this.$route.query.unique_id,
        日期_上限: this.$route.query.date_upper,
        日期_下限: this.$route.query.date_lower
      }
      var response = await manager_get_staff_costs_stats_by_unique_id(
        post_data
      )
      this.deductionOfStatistical = response.data
    },
    // 指定时间 管理员通过员工unique_id获取工资抵扣记录
    async managerFilterStaffCosts() {
      if (
        isEmpty(this.$route.query.unique_id) ||
        isEmpty(this.$route.query.date_upper) ||
        isEmpty(this.$route.query.date_lower)
      ) {
        return
      }
      var post_data = {
        login_token: this.$route.query.login_token,
        员工unique_id: this.$route.query.unique_id,
        日期_上限: this.$route.query.date_upper,
        日期_下限: this.$route.query.date_lower,
        pagination: {
          page: this.deductionCurrentPage,
          limit: this.deductionPageSize
        },
        sort: {
          记录输入时间: -1
        }
      }
      var response = await manager_filter_staff_costs(post_data)
      this.payrollDeduction = response.data['记录列表']
      this.deductionTotal = response.data.pagination.total
    },

    // 页码控制时，每页码改变改变的处理函数
    handleDeductionPageChange(val, recordConfirmationStatus) {
      this.deductionCurrentPage = val
      this.managerFilterStaffCosts()
    },
    // 页码控制时，每页数量改变的处理函数
    handleDeductionSizeChange(val) {
      this.deductionPageSize = val
      this.managerFilterStaffCosts()
    },
    async invalid(row) {
      if (!confirm('确定进行作废吗？')) {
        return false
      }
      var post_data = {
        login_token: this.$store.getters.token,
        unique_id: row.unique_id
      }
      var res = await manager_delete_staff_costs_by_unique_id(post_data)
      this.managerGetStaffCostsStatsByUniqueId()
      this.managerFilterStaffCosts()
      this.$message({
        type: 'success',
        message: res.msg
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  .table {
    .tag {
      margin: 2px;
    }
  }
  .tag-box {
    margin-bottom: 10px;
  }
  .el-pagination {
    float: right;
    margin: 10px 0;
  }
}
</style>
