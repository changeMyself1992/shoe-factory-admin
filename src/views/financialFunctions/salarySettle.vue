<template>
  <div class="app-container">
    <div class="useintro">
      <el-dropdown :show-timeout="0" @command="handleCommand">
        <img src="@/assets/images/help.png" class="help">
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="a">员工如何查看自己的工资？</el-dropdown-item>
          <el-dropdown-item command="b">管理人员如何查看员工工资和部门工资？</el-dropdown-item>
          <el-dropdown-item command="c">财务结算工资时如何导出工资结算Excel表?</el-dropdown-item>
          <el-dropdown-item command="d">管理人员如何确认指定员工计件记录？</el-dropdown-item>
          <el-dropdown-item command="e">如何添加工资抵扣费用？?</el-dropdown-item>
          <el-dropdown-item command="f" class="blue">更多问题，请访问帮助中心</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <el-form ref="form" class="conditional-search" :model="form" label-position="left">
      <div class="header">
        <b>选择工资结算时间范围</b>
      </div>
      <div class="info-box">
        <el-form-item class="item-2" label="工资结算时间段:" label-width="120px">
          <template>
            <el-radio v-model.trim="radio" label="1">今日</el-radio>
            <el-radio v-model.trim="radio" label="2">昨日</el-radio>
            <el-radio v-model.trim="radio" label="3">本月</el-radio>
            <el-radio v-model.trim="radio" label="4">自定义</el-radio>
          </template>
          <el-date-picker
            v-model.trim="form.salaryNoteUpdateTimeQuantum"
            class="picker"
            type="daterange"
            unlink-panels
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :disabled="radio!=='4'"
          />
        </el-form-item>
        <el-form-item class="item-1">
          <el-button
            :loading="excelLoading"
            type="primary"
            :disabled="!管理权限['工资列表详情可导出']"
            @click="exportExcel"
          >下载结算Excel</el-button>
          <el-progress
            class="progress"
            style="margin-top:5px;"
            :text-inside="true"
            :stroke-width="16"
            :percentage="excelDownloadSchedule"
          />
        </el-form-item>
      </div>
    </el-form>

    <el-card v-if="管理权限['员工工资列表可读']" class="bx-card">
      <div slot="header" class="clearfix">
        <strong>员工个人工资 {{ timeRange }}</strong>
        <el-button type="primary" size="mini" :disabled="!管理权限['工资抵扣']" @click="handleAddDeduction">添加工资抵扣费用</el-button>
      </div>

      <el-table
        v-if="salarySummary&&salarySummary['员工工资']"
        ref="table"
        :max-height="tableHeight"
        :data="salarySummary['员工工资']"
        border
        :row-class-name="tableRowClassName"
        :cell-style="cellStyle"
      >
        <el-table-column align="center" prop="员工姓名" label="姓名" width="100" sortable />
        <el-table-column align="center" prop="员工手机" label="手机" width="120" sortable />
        <el-table-column
          align="center"
          prop="负责工序"
          label="工序"
          :filters="processScreeningArray"
          :filter-method="filterOrderStatus"
          min-width="250"
        >
          <template slot-scope="scope">
            <el-tag v-for="value in scope.row.负责工序" :key="value" class="tag">{{ value }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column
          align="center"
          width="120"
          prop="已确认工资"
          label-class-name="confirmed-wages"
          sortable
        >
          <template slot="header">
            <!--自定义表头-->
            <div class="header">
              <span style="width:100%;ext-align:center;line-height: 30px;">已确认工资</span>
              <el-tag
                style="width:90%;text-align:center;margin:auto;"
                class="tag"
              >{{ salarySummary['已确认工资总额'] }}</el-tag>
            </div>
          </template>
          <template slot-scope="scope">
            <span>{{ scope.row['已确认工资'] }}</span>
          </template>
        </el-table-column>

        <el-table-column
          align="center"
          width="120"
          prop="未确认工资"
          label-class-name="unconfirmed-wages"
          sortable
        >
          <template slot="header">
            <!--自定义表头effect="dark"-->
            <div class="header">
              <span style="width:100%;ext-align:center;line-height: 30px;">未确认工资</span>
              <el-tag
                style="width:90%;text-align:center;margin:auto;"
                class="tag"
              >{{ salarySummary['未确认工资总额'] }}</el-tag>
            </div>
          </template>
          <template slot-scope="scope">
            <span>{{ scope.row['未确认工资'] }}</span>
          </template>
        </el-table-column>

        <el-table-column
          align="center"
          width="120"
          prop="累计工资"
          label-class-name="total-wages"
          sortable
        >
          <template slot="header">
            <!--自定义表头-->
            <div class="header">
              <span style="width:100%;ext-align:center;line-height: 30px;">累计工资</span>
              <el-tag
                style="width:90%;text-align:center;margin:auto;"
                class="tag"
              >{{ salarySummary['工资总额'] }}</el-tag>
            </div>
          </template>
          <template slot-scope="scope">
            <span>{{ scope.row['累计工资'] }}</span>
          </template>
        </el-table-column>

        <el-table-column
          align="center"
          width="120"
          prop="累计抵扣金额"
          label-class-name="deduction-wages"
          sortable
        >
          <template slot="header">
            <!--自定义表头-->
            <div class="header">
              <span style="width:100%;ext-align:center;line-height: 30px;">抵扣费用</span>
              <el-tag
                style="width:90%;text-align:center;"
                effect="dark"
                class="tag"
              >{{ salarySummary['抵扣工资总额'] }}</el-tag>
            </div>
          </template>
          <template slot-scope="scope">
            <span>{{ scope.row['累计抵扣金额'] }}</span>
          </template>
        </el-table-column>

        <el-table-column
          align="center"
          prop="工作状态"
          label="员工状态"
          width="120"
          :filters="[ {text:'在职',value:'在职'},{text:'离职',value:'离职'},{text:'请假',value:'请假'},{text:'开除',value:'开除'},{text:'待确认',value:'待确认'}]"
          :filter-method="filterWorkStatus"
        />
        <el-table-column type="expand" align="center" label="工资备注信息展开" width="90">
          <template slot-scope="scope">
            <div class="product-note-box">
              <el-card class="box-card">
                <div slot="header" class="clearfix">
                  <strong style="margin-right:10px;">备注</strong>
                  <!-- :disabled="!管理权限['编辑流水单']" -->
                  <el-button
                    type="primary"
                    size="mini"
                    @click="onSubmitANote(scope.row)"
                  >提交备注</el-button>
                </div>
                <el-input
                  v-model="scope.row.工资统计备注"
                  type="textarea"
                  :disabled="false"
                  placeholder="无备注信息"
                />
              </el-card>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="操作" label="操作" width="110">
          <template slot-scope="scope">
            <el-button
              type="primary"
              size="mini"
              :disabled="!管理权限['员工工资详情可读']"
              @click="checkSalaryNoteDetail(scope.row.员工手机)"
            >查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card v-if="管理权限['部门工资列表可读']" class="bx-card">
      <div slot="header" class="clearfix">
        <strong>部门工资汇总 {{ timeRange }}</strong>
      </div>

      <el-table
        v-if="salarySummary&&salarySummary['部门工资']"
        ref="table"
        :max-height="tableHeight"
        :data="salarySummary&&salarySummary['部门工资']"
        border
      >
        <el-table-column align="center" prop="工序名称" label="工序名称" />
        <el-table-column align="center" prop="已确认计件数量" label="已确认计件数量" />
        <el-table-column align="center" prop="已确认工资" label="已确认工资" />
        <el-table-column align="center" prop="未确认计件数量" label="未确认计件数量" />
        <el-table-column align="center" prop="未确认工资" label="未确认工资" />
        <el-table-column align="center" prop="累计计件数量" label="累计计件数量" />
        <el-table-column align="center" prop="累计工资" label="累计工资" />
        <el-table-column align="center" prop="操作" label="操作" width="110">
          <template slot-scope="scope">
            <el-button
              type="primary"
              size="mini"
              :disabled="!管理权限['部门工资详情可读']"
              @click="toViewDepartmentalSalaryDetails(scope.row)"
            >查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加员工抵扣费用对话框 -->
    <wage-deduction-dialog-box
      :dialog-visible="wageDeductionDialogVisible"
      :on-close="closeWageDeductionDialogCallback"
    />
  </div>
</template>

<script>
import { parseTime, isEmpty, deepClone } from '@/utils'
import wageDeductionDialogBox from './components/wageDeductionDialogBox'
import {
  generate_salary_list_for_frontend_by_time_range,
  generate_salary_list_for_excel_by_time_range
} from '@/api/theFinancialManagement'
import {
  edit_user_by_id
} from '@/api/personnelAndAuthorityManagement'
import { filter_process } from '@/api/maintenanceOfProcessPartsOfProductLibrary'
import { mapGetters } from 'vuex'
export default {
  components: { wageDeductionDialogBox },
  data() {
    return {
      form: {
        salaryNoteUpdateTimeQuantum: [] // 用于搜索的工资详情的时间区间
      },
      radio: '3',
      // 工资共计
      salarySummary: {},
      settleLoading: false,
      excelLoading: false,
      // 所属工序的筛选数组
      processScreeningArray: [],
      tableHeight: '',
      excelDownloadSchedule: 0,
      timer: null, // 定时器
      // 是否显示工资抵扣对话框
      wageDeductionDialogVisible: false
    }
  },
  computed: {
    ...mapGetters(['管理权限']),
    timeRange() {
      if (!isEmpty(this.form.salaryNoteUpdateTimeQuantum)) {
        return `（${parseTime(
          this.form.salaryNoteUpdateTimeQuantum[0]
        )} 到 ${parseTime(this.form.salaryNoteUpdateTimeQuantum[1])}）`
      } else {
        return ''
      }
    }
  },
  watch: {
    radio: function(newVal, oldVal) {
      this.form.salaryNoteUpdateTimeQuantum = []
      var date = new Date()
      var y = date.getFullYear()
      var m = date.getMonth()
      var d = date.getDate()
      switch (newVal) {
        case '1':
          // 今日
          this.form.salaryNoteUpdateTimeQuantum[0] = new Date(
            Date.parse(new Date(y, m, d))
          )
          this.form.salaryNoteUpdateTimeQuantum[1] = new Date(
            Date.parse(new Date(y, m, d + 1)) - 1000
          )
          break
        case '2':
          // 昨日
          this.form.salaryNoteUpdateTimeQuantum[0] = new Date(
            Date.parse(new Date(y, m, d - 1))
          )
          this.form.salaryNoteUpdateTimeQuantum[1] = new Date(
            Date.parse(new Date(y, m, d)) - 1000
          )
          break
        case '3':
          // 本月
          var firstDay = new Date(y, m, 1)
          var lastDay = new Date(y, m + 1, 0, 23, 59, 59)
          this.form.salaryNoteUpdateTimeQuantum[0] = firstDay
          this.form.salaryNoteUpdateTimeQuantum[1] = lastDay
          break
      }
    },
    'form.salaryNoteUpdateTimeQuantum': function(newVal, oldVal) {
      if (newVal.length > 1) {
        this.filterSalaryNote()
      }
    }
  },
  created() {
    this.tableHeight = window.innerHeight * 0.75
    this.initializesTheProcessFilterArrayToWhichItBelongs()
    this.filterSalaryNote()
  },
  mounted() {},
  methods: {
    // 查看指引
    handleCommand(command) {
      console.log(command)
      var x = null
      var y = null
      if (command === 'f') {
        const { href } = this.$router.resolve({
          path: '/instructionsForuse/index'
        })
        window.open(href, '_blank')
      } else {
        if (command === 'a') {
          x = 3
          y = 0
        } else if (command === 'b') {
          x = 3
          y = 1
        } else if (command === 'c') {
          x = 3
          y = 2
        } else if (command === 'd') {
          x = 3
          y = 3
        } else if (command === 'e') {
          x = 3
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

    tableRowClassName({ row, rowIndex }) {
      if (rowIndex % 2 === 0) {
        return 'primary-row'
      }
      return ''
    },

    // 查看员工个人工资详情
    async checkSalaryNoteDetail(employeeUniqueId) {
      var date_upper = ''
      var date_lower = ''
      if (
        this.form.salaryNoteUpdateTimeQuantum !== null &&
        this.form.salaryNoteUpdateTimeQuantum.length > 0
      ) {
        date_upper = parseTime(this.form.salaryNoteUpdateTimeQuantum[1]) // 日期上限（结束日期）
        date_lower = parseTime(this.form.salaryNoteUpdateTimeQuantum[0]) // 日期下限（开始日期）
      }
      const { href } = this.$router.resolve({
        path: '/financialFunctions/salaryDetail',
        query: {
          login_token: this.$store.getters.token,
          unique_id: employeeUniqueId,
          date_upper: date_upper,
          date_lower: date_lower
        }
      })
      window.open(href, '_blank')
    },

    // 初始化所属工序筛选数组
    async initializesTheProcessFilterArrayToWhichItBelongs() {
      this.processScreeningArray = []
      var res = await filter_process({
        login_token: this.$store.getters.token
      })
      var 全部的工序 = res.data
      for (let i = 0; i < 全部的工序.length; i++) {
        const element = 全部的工序[i]
        this.processScreeningArray.push({
          text: element.工序名称,
          value: element.工序名称
        })
      }
    },

    // 工资结算
    salarySettlement() {
      this.excelDownloadSchedule = 0
      var time = 60
      var count = 0
      // 如果定时器对象存在 要清除一下
      if (this.timer) {
        clearInterval(this.timer)
      }
      this.timer = setInterval(() => {
        if (time) {
          time = time - 1
          count += 1
          this.excelDownloadSchedule = Number(
            parseFloat((count * 99) / 60).toFixed(2)
          )
        } else {
          clearInterval(this.timer)
          this.timer = null
        }
      }, 1000)

      return new Promise((resolve, reject) => {
        var post_data = {
          login_token: this.$store.getters.token
        }
        // 如果有时间限制则在筛选条件中加入时间
        if (!isEmpty(this.form.salaryNoteUpdateTimeQuantum)) {
          post_data['日期_上限'] = parseTime(
            this.form.salaryNoteUpdateTimeQuantum[1]
          )
          post_data['日期_下限'] = parseTime(
            this.form.salaryNoteUpdateTimeQuantum[0]
          )
          // 获取查询后的工资日期
          generate_salary_list_for_excel_by_time_range(post_data)
            .then(response => {
              // 如果已经拿到数据了，定时器还没有销毁，那么我们手动释放
              if (this.timer) {
                clearInterval(this.timer)
              }
              this.excelDownloadSchedule = 100
              this.excelLoading = false
              resolve(response.data)
            })
            .catch(err => {
              console.error(err)
              this.excelLoading = false
            })
        } else {
          this.$message({
            message: '请选择一个工资结算时间段范围！',
            type: 'warning'
          })
          this.excelLoading = false
          reject('请选择一个工资结算时间段范围！')
        }
      })
    },

    async filterSalaryNote() {
      this.settleLoading = true
      setTimeout(() => {
        this.settleLoading = false
      }, 2000)
      // 初始化日期
      if (this.form.salaryNoteUpdateTimeQuantum.length === 0) {
        var date = new Date()
        var y = date.getFullYear()
        var m = date.getMonth()
        var firstDay = new Date(y, m, 1)
        var lastDay = new Date(y, m + 1, 0, 23, 59, 59)
        this.form.salaryNoteUpdateTimeQuantum[0] = firstDay
        this.form.salaryNoteUpdateTimeQuantum[1] = lastDay
      }

      var post_data = {
        login_token: this.$store.getters.token
      }
      // 如果有时间限制则在筛选条件中加入时间
      if (
        this.form.salaryNoteUpdateTimeQuantum !== [] &&
        this.form.salaryNoteUpdateTimeQuantum.length > 0
      ) {
        post_data['日期_上限'] = parseTime(
          this.form.salaryNoteUpdateTimeQuantum[1]
        )
        post_data['日期_下限'] = parseTime(
          this.form.salaryNoteUpdateTimeQuantum[0]
        )
      }
      this.salarySummary = null
      // 获取查询后的工资日期
      var response = await generate_salary_list_for_frontend_by_time_range(
        post_data
      )
      this.settleLoading = false
      this.salarySummary = response.data
    },

    // 查看部门工资详情
    toViewDepartmentalSalaryDetails(row) {
      if (isEmpty(this.form.salaryNoteUpdateTimeQuantum)) {
        this.$message({
          message: '请选择一个工资结算时间段范围！',
          type: 'warning'
        })
        return
      }
      const { href } = this.$router.resolve({
        path: '/financialFunctions/departmentalSalaryDetails',
        query: {
          parcess_unique_id: row.工序名称,
          salaryNoteUpdateTimeQuantum: this.form.salaryNoteUpdateTimeQuantum
        }
      })
      window.open(href, '_blank')
    },

    filterOrderStatus(value, row) {
      for (let i = 0; i < row.负责工序.length; i++) {
        const processName = row.负责工序[i]
        if (processName === value) {
          return true
        }
      }
      return false
    },

    filterWorkStatus(value, row) {
      if (row['工作状态'] === value) return true
      return false
    },

    cellStyle(info) {
      // 在职 0DA317
      // 请假 0938D4
      // 开除 E72414
      // 离职 9D27B0
      // 待确认 F5A623

      // 如果列所有等于9 代表工作状态
      if (info.columnIndex === 9) {
        if (info.row['工作状态'] === '在职') {
          return 'color:#0DA317;'
        }
        if (info.row['工作状态'] === '请假') {
          return 'color:#0938D4;'
        }
        if (info.row['工作状态'] === '开除') {
          return 'color:#E72414;'
        }
        if (info.row['工作状态'] === '离职') {
          return 'color:#9D27B0;'
        }
        if (info.row['工作状态'] === '待确认') {
          return 'color:#F5A623;'
        }
        return ''
      }
      return ''
    },
    // 添加工资抵扣
    handleAddDeduction() {
      this.wageDeductionDialogVisible = true
    },
    // 工资抵扣关闭回调  isRefresh 是否需要刷新父组件数据
    closeWageDeductionDialogCallback(isRefresh) {
      this.wageDeductionDialogVisible = false
      if (isRefresh) {
        this.filterSalaryNote()
      }
    },
    // 提交备注
    async onSubmitANote(row) {
      var post_data = {
        login_token: this.$store.getters.token,
        unique_id: row.unique_id,
        update_data: {
          工资统计备注: row['工资统计备注']
        }
      }
      await edit_user_by_id(post_data)
      this.$message({
        type: 'success',
        message: '修改备注成功!'
      })
    },

    // 导出excel
    async exportExcel() {
      this.excelLoading = true
      var original = await this.salarySettlement()
      // 子表一： 工资总结
      var excelSalarySummary = [
        {
          工资总人数: original['工资总人数'],
          工资总计件数: Number(
            parseFloat(parseFloat(original['工资总计件数']).toFixed(2))
          ),
          '确认工资+未确认工资': Number(
            parseFloat(parseFloat(original['工资总额']).toFixed(2))
          ),
          未确认计件数: Number(
            parseFloat(parseFloat(original['未确认工资总计件数']).toFixed(2))
          ),
          未确认工资总额: Number(
            parseFloat(parseFloat(original['未确认工资总额']).toFixed(2))
          ),
          已确认计件数: Number(
            parseFloat(parseFloat(original['已确认工资总计件数']).toFixed(2))
          ),
          已确认工资总额: Number(
            parseFloat(parseFloat(original['已确认工资总额']).toFixed(2))
          ),
          抵扣工资总额: Number(
            parseFloat(parseFloat(original['抵扣工资总额']).toFixed(2))
          ),
          累计抵扣工资总额: Number(
            parseFloat(parseFloat(original['累计抵扣工资总额']).toFixed(2))
          ),
          正常抵扣工资总额: Number(
            parseFloat(parseFloat(original['正常抵扣工资总额']).toFixed(2))
          ),
          作废抵扣工资总额: Number(
            parseFloat(parseFloat(original['作废抵扣工资总额']).toFixed(2))
          )
        }
      ]
      // 子表二： 员工工资
      var excelPersonalSalaryNote = []
      for (var m = 0; m < original['员工工资'].length; m++) {
        var curr_item_c = original['员工工资'][m]
        var item_c = {
          员工姓名: curr_item_c['员工姓名'],
          员工手机: curr_item_c['员工手机'],
          负责工序: curr_item_c['负责工序'].join(', '),
          已确认工资: Number(
            parseFloat(parseFloat(curr_item_c['已确认工资']).toFixed(2))
          ),
          未确认工资: Number(
            parseFloat(parseFloat(curr_item_c['未确认工资']).toFixed(2))
          ),
          累计抵扣金额: Number(
            parseFloat(parseFloat(curr_item_c['累计抵扣金额']).toFixed(2))
          ),
          正常抵扣金额: Number(
            parseFloat(parseFloat(curr_item_c['正常抵扣金额']).toFixed(2))
          ),
          作废抵扣金额: Number(
            parseFloat(parseFloat(curr_item_c['作废抵扣金额']).toFixed(2))
          ),
          累计工资: Number(
            parseFloat(parseFloat(curr_item_c['累计工资']).toFixed(2))
          ),
          工作状态: curr_item_c['工作状态']
        }
        excelPersonalSalaryNote.push(item_c)
      }
      // 子表三： 部门工资
      var excelDepartmentSalaryNote = []
      for (var n = 0; n < original['部门工资'].length; n++) {
        var curr_item_d = original['部门工资'][n]
        var item_d = {
          工序名称: curr_item_d['工序名称'],
          已确认工资: Number(
            parseFloat(parseFloat(curr_item_d['已确认工资']).toFixed(2))
          ),
          已确认计件数量: Number(
            parseFloat(parseFloat(curr_item_d['已确认计件数量']).toFixed(2))
          ),
          未确认工资: Number(
            parseFloat(parseFloat(curr_item_d['未确认工资']).toFixed(2))
          ),
          未确认计件数量: Number(
            parseFloat(parseFloat(curr_item_d['未确认计件数量']).toFixed(2))
          ),
          累计工资: Number(
            parseFloat(parseFloat(curr_item_d['累计工资']).toFixed(2))
          ),
          累计计件数量: Number(
            parseFloat(parseFloat(curr_item_d['累计计件数量']).toFixed(2))
          )
        }
        excelDepartmentSalaryNote.push(item_d)
      }
      // 子表四： 工资详情
      var excelSalaryDetail = []
      for (var key_b in original.员工工资详情) {
        const element = original.员工工资详情[key_b]
        var item_b = {}
        item_b['员工姓名'] = element.员工姓名
        item_b['员工手机'] = element.员工手机
        item_b['员工工作状态'] = element.员工工作状态
        item_b['工序名称'] = element.工序名称
        item_b['工序总排产数'] = Number(
          parseFloat(element['排产产品.排产配码数量.总排产数'])
        )
        item_b['完成数量'] = parseFloat(element['完成数量'])
        item_b['工序单位工资'] = Number(
          parseFloat(parseFloat(element.工序单位工资).toFixed(2))
        )
        item_b['应发工资'] = Number(
          parseFloat(parseFloat(element.应发工资).toFixed(2))
        )
        item_b['生产单编号'] = element.生产单编号
        for (const key in element.产品信息.tags) {
          if (element.产品信息.tags.hasOwnProperty(key)) {
            console.log(key)
            console.log(element.产品信息.tags[key])
            item_b[key] = element.产品信息.tags[key]
          }
        }
        item_b['确认记录管理者姓名'] = element.确认记录管理者姓名
        item_b['记录确认'] = element.记录确认 === true ? '是' : '否'
        item_b['记录输入时间'] = element.记录输入时间
        item_b['记录确认时间'] = element.记录确认时间
        excelSalaryDetail.push(item_b)
        console.log(excelSalaryDetail)
      }
      // 子表五： 抵扣详情
      var deductionDetail = []
      for (var key_e in original.员工抵扣详情) {
        const element = original.员工抵扣详情[key_e]
        var item_e = {}
        item_e['员工姓名'] = element.员工姓名
        item_e['员工手机'] = element.员工手机
        item_e['工资抵扣原因'] = element.工资抵扣原因
        item_e['抵扣金额'] = element.抵扣金额
        item_e['记录管理者姓名'] = element.记录管理者姓名
        item_e['记录输入时间'] = element.记录输入时间
        item_e['记录发生时间'] = element.记录发生时间
        item_e['是否作废'] = element.是否作废 ? '是' : '否'
        deductionDetail.push(item_e)
      }
      var json = []
      json.push(excelSalarySummary)
      json.push(excelPersonalSalaryNote)
      json.push(excelDepartmentSalaryNote)
      json.push(excelSalaryDetail)
      json.push(deductionDetail)
      var ws_names = ['工资总结', '员工工资', '部门工资', '工资详情', '抵扣详情']
      var tHeader = [
        [
          '工资总人数',
          '工资总计件数',
          '确认工资+未确认工资',
          '已确认计件数',
          '已确认工资总额',
          '未确认计件数',
          '未确认工资总额',
          '抵扣工资总额',
          '累计抵扣工资总额',
          '正常抵扣工资总额',
          '作废抵扣工资总额'
        ],
        [
          '员工姓名',
          '员工手机',
          '负责工序',
          '已确认工资',
          '未确认工资',
          '累计抵扣金额',
          '正常抵扣金额',
          '作废抵扣金额',
          '累计工资',
          '工作状态'
        ],
        [
          '工序名称',
          '已确认工资',
          '已确认计件数量',
          '未确认工资',
          '未确认计件数量',
          '累计工资',
          '累计计件数量'
        ],
        [
          '员工姓名',
          '员工手机',
          '员工工作状态',
          '工序名称',
          '工序总排产数',
          '完成数量',
          '工序单位工资',
          '应发工资',
          '生产单编号',
          '确认记录管理者姓名',
          '记录确认',
          '记录输入时间',
          '记录确认时间'
        ],
        [
          '员工姓名',
          '员工手机',
          '工资抵扣原因',
          '抵扣金额',
          '记录管理者姓名',
          '记录输入时间',
          '记录发生时间',
          '是否作废'
        ]
      ]
      var filterVal = [
        [
          '工资总人数',
          '工资总计件数',
          '确认工资+未确认工资',
          '已确认计件数',
          '已确认工资总额',
          '未确认计件数',
          '未确认工资总额',
          '抵扣工资总额',
          '累计抵扣工资总额',
          '正常抵扣工资总额',
          '作废抵扣工资总额'
        ],
        [
          '员工姓名',
          '员工手机',
          '负责工序',
          '已确认工资',
          '未确认工资',
          '累计抵扣金额',
          '正常抵扣金额',
          '作废抵扣金额',
          '累计工资',
          '工作状态'
        ],
        [
          '工序名称',
          '已确认工资',
          '已确认计件数量',
          '未确认工资',
          '未确认计件数量',
          '累计工资',
          '累计计件数量'
        ],
        [
          '员工姓名',
          '员工手机',
          '员工工作状态',
          '工序名称',
          '工序总排产数',
          '完成数量',
          '工序单位工资',
          '应发工资',
          '生产单编号',
          '确认记录管理者姓名',
          '记录确认',
          '记录输入时间',
          '记录确认时间'
        ],
        [
          '员工姓名',
          '员工手机',
          '工资抵扣原因',
          '抵扣金额',
          '记录管理者姓名',
          '记录输入时间',
          '记录发生时间',
          '是否作废'
        ]
      ]
      var itemarr = deepClone(this.$store.getters['产品的标签'])
      // for (const key in original.员工工资详情[0].产品信息.tags) {
      //   if (original.员工工资详情[0].产品信息.tags.hasOwnProperty(key)) {
      //     itemarr.push(key)
      //   }
      // }
      console.log(itemarr)
      tHeader[3].splice(9, 0, ...itemarr)
      filterVal[3].splice(9, 0, ...itemarr)
      console.log('************')
      console.log(json)
      var datas = []
      for (let j = 0; j < filterVal.length; j++) {
        const data = this.formatJson(filterVal[j], json[j])
        datas.push(data)
      }

      var firstDay = parseTime(this.form.salaryNoteUpdateTimeQuantum[0])
      var lastDay = parseTime(this.form.salaryNoteUpdateTimeQuantum[1])
      var file_name = '工资信息表' + '_' + firstDay + '_' + lastDay
      import('@/vendor/Export2Excel').then(excel => {
        excel.export_json_to_excel_multi_table({
          ws_names: ws_names,
          header: tHeader, // 表头 必填
          datas: datas, // 具体数据 必填
          filename: file_name // 非必填
        })
        this.excelLoading = false
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
  .conditional-search {
    margin-bottom: 30px;
    border: 1px solid #bbbbbb;
    .header {
      padding: 0 10px;
      height: 40px;
      line-height: 40px;
      border-bottom: 1px solid #bbbbbb;
    }
    .header2 {
      padding: 0 10px;
      height: 45px;
      line-height: 40px;
    }
    .info-box {
      padding: 10px 10px 0px 10px;
      height: 120px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      .item-1 {
        width: 15%;
        position: relative;
        .progress {
          position: absolute;
          bottom: -20px;
          left: 0;
          width: 100%;
        }
      }
      .item-2 {
        width: 50%;
      }
    }
  }

  .bx-card {
    margin-bottom: 20px;
  }

  .el-table .primary-row {
    background: #87cefa;
  }

  .el-table .success-row {
    background: #f0f9eb;
  }

  .tag {
    margin: 2px;
  }
}
</style>

<style>
.confirmed-wages {
  background-color: #fafaf6;
  padding: 0 !important;
  height: 100px;
}
.confirmed-wages .header {
  display: flex;
  flex-wrap: wrap;
}

.unconfirmed-wages {
  background-color: #faf6f8;
  padding: 0 !important;
  height: 100px;
}
.unconfirmed-wages .header {
  display: flex;
  flex-wrap: wrap;
}

.deduction-wages {
  background-color: #d3f2f38c;
  padding: 0 !important;
  height: 100px;
}
.deduction-wages .header {
  display: flex;
  flex-wrap: wrap;
}

.total-wages {
  background-color: #f1f5fb;
  padding: 0 !important;
  height: 100px;
}
.total-wages .header {
  display: flex;
  flex-wrap: wrap;
}
</style>

