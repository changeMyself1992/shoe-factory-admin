<template>
  <div>
    <div v-if="salaryDetail&&query" class="departmental-salary-details">
      <div style="font-size: 30px; text-align: center; margin-top: 10px; margin-bottom: 10px;">
        <b>
          部门:
          <strong style="color: #87CEFA;">{{ query.parcess_unique_id }}</strong> 由
          <strong
            style="color: #87CEFA;"
          >{{ query.salaryNoteUpdateTimeQuantum[0]|formattedDate('{y}-{m}-{d}') }}</strong> 至
          <strong
            style="color: #87CEFA;"
          >{{ query.salaryNoteUpdateTimeQuantum[1]|formattedDate('{y}-{m}-{d}') }}</strong> 的工资详情
        </b>
      </div>
      <div style="margin-top: 10px; color: #87CEFA;">
        <b>工序已确认总工资: {{ salaryDetail['部门工资']['工序已确认总工资'] }}</b> &nbsp;&nbsp;
        <b>工序已确认总数量: {{ salaryDetail['部门工资']['工序已确认总数量'] }}</b> &nbsp;&nbsp;
        <b>工序未确认总工资: {{ salaryDetail['部门工资']['工序未确认总工资'] }}</b> &nbsp;&nbsp;
        <b>工序未确认总数量: {{ salaryDetail['部门工资']['工序未确认总数量'] }}</b> &nbsp;&nbsp;
        <b>工序累计总工资: {{ salaryDetail['部门工资']['工序累计总工资'] }}</b> &nbsp;&nbsp;
        <b>工序完成总数量: {{ salaryDetail['部门工资']['工序完成总数量'] }}</b> &nbsp;&nbsp;
      </div>

      <el-button type="primary" size="mini" :loading="btnLoading" :disabled="!管理权限['工资列表详情可导出']" @click="exportExcel">
        导出工资详情excel
      </el-button>

      <el-table :data="salaryDetail.生产单工资" :max-height="tableHeight">
        <el-table-column label="部门工资详情表" align="center">
          <el-table-column prop="生产单时间" label="生产单时间" align="center" width="100" />
          <el-table-column prop="生产单编号" label="生产单编号" align="center" width="150" />

          <el-table-column prop="对应订单.tags" align="center">
            <template slot="header">
              <!--自定义表头-->
              <el-button type="primary" size="small" @click.native="orderArrowClick(mode='正常点击')">
                <span>{{ orderStatusDes }}</span>
                <i
                  :class="whetherTheOrderLabelIsExpanded?'el-collapse-item__arrow el-icon-arrow-right is-active': 'el-collapse-item__arrow el-icon-arrow-right'"
                />
              </el-button>
            </template>
            <el-table-column
              v-for="(value, index) in 订单的标签"
              :key="index"
              align="center"
              :width="whetherTheOrderLabelIsExpanded?'120' :'150'"
            >
              <template slot="header">
                <!--自定义表头-->
                <div class="order-header">
                  <span>{{ value }}</span>
                </div>
              </template>
              <template slot-scope="scope">
                <span>{{ scope.row['对应订单.tags'][value] }}</span>
              </template>
            </el-table-column>
          </el-table-column>

          <el-table-column prop="排产产品.产品信息.tags" label="产品信息" align="center">
            <template slot="header">
              <el-button type="primary" size="small" @click.native="productArrowClick(mode='正常点击')">
                <span>{{ productStatusDes }}</span>
                <i
                  :class="whetherToExpandProductInformation?'el-collapse-item__arrow el-icon-arrow-right is-active': 'el-collapse-item__arrow el-icon-arrow-right'"
                />
              </el-button>
            </template>
            <el-table-column
              v-for="(value, index) in 产品的标签"
              :key="index"
              align="center"
              :width="whetherToExpandProductInformation? '120' :'150'"
            >
              <template slot="header">
                <!--自定义表头-->
                <div class="product-header">
                  <span>{{ value }}</span>
                </div>
              </template>
              <template slot-scope="scope">
                <span>{{ scope.row['排产产品.产品信息.tags'][value] }}</span>
              </template>
            </el-table-column>
          </el-table-column>

          <el-table-column prop="工序名称" label="工序名称" align="center" width="100" />
          <el-table-column prop="单位工资" label="单位工资" align="center" width="60" />
          <el-table-column prop="排产产品.排产配码数量.总排产数" label="产品总排产数" align="center" width="70">
            <template slot-scope="scope">
              <span>{{ scope.row['排产产品.排产配码数量.总排产数'] }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="已确认工资" label="已确认工资" align="center" width="90" />
          <el-table-column prop="已确认计件数量" label="已确认计件数量" align="center" width="90" />
          <el-table-column prop="未确认工资" label="未确认工资" align="center" width="90" />
          <el-table-column prop="未确认计件数量" label="未确认计件数量" align="center" width="90" />
          <el-table-column prop="累计工资" label="累计工资" align="center" width="90" />
          <el-table-column prop="累计计件数量" label="累计计件数量" align="center" width="90" />
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
  </div>
</template>

<script>
import { generate_salary_list_for_frontend_by_process_time_range, generate_salary_list_for_excel_by_process_time_range } from '@/api/ordersForProductionScheduling'
import { parseTime, deepClone } from '@/utils'
import { mapGetters } from 'vuex'
export default {
  components: {},
  data() {
    return {
      salaryDetail: null,
      originalSalaryDetail: null,
      query: null, // 传递过来的数据
      订单的标签: [],
      whetherTheOrderLabelIsExpanded: true, // 是否展开订单信息
      // 是否启用按钮loading状态防止多次点击
      btnLoading: false,
      whetherToExpandProductInformation: false, // 是否展开产品信息
      tableHeight: '',
      // 当前页数
      currentPage: 1,
      // 总条目数
      total: 0,
      // 当前页数据量
      pageSize: 50
    }
  },
  computed: {
    ...mapGetters([
      '管理权限'
    ]),
    orderStatusDes() {
      if (this.whetherTheOrderLabelIsExpanded) return '关闭订单详情'
      else return '展开订单详情'
    },
    productStatusDes() {
      if (this.whetherToExpandProductInformation) return '关闭产品详情'
      else return '展开产品详情'
    }
  },
  created() {
    this.tableHeight = window.innerHeight * 0.75
    this.query = this.$route.query
    this.generateSalaryListForFrontendByProcessTimeRange()
  },
  mounted() {},
  methods: {
    // 页码控制时，每页数量改变的处理函数
    handleSizeChange(val) {
      this.pageSize = val
      this.generateSalaryListForFrontendByProcessTimeRange()
    },
    // 页码控制时，每页码改变改变的处理函数
    handleCurrentChange(val) {
      this.currentPage = val
      this.generateSalaryListForFrontendByProcessTimeRange()
    },
    // 指定时间 生成部门工资结算 给管理人员显示的统计数据
    async generateSalaryListForFrontendByProcessTimeRange() {
      var post_data = {
        login_token: this.$store.getters.token,
        工序unique_id: this.$route.query.parcess_unique_id,
        日期_上限: parseTime(this.$route.query.salaryNoteUpdateTimeQuantum[1]),
        日期_下限: parseTime(this.$route.query.salaryNoteUpdateTimeQuantum[0]),
        pagination: {
          page: parseInt(this.currentPage),
          limit: parseInt(this.pageSize)
        }
      }
      const res = await generate_salary_list_for_frontend_by_process_time_range(
        post_data
      )
      this.salaryDetail = res.data
      this.originalSalaryDetail = deepClone(res.data)
      this.total = res.data.pagination.total
      this.orderArrowClick('初始化')
      this.productArrowClick('初始化')
    },
    // 指定时间 生成部门工资结算excel表格 给管理人员显示的统计数据和详细数据
    generateSalaryListForExcelByProcessTimeRange() {
      return new Promise((resolve, reject) => {
        var post_data = {
          login_token: this.$store.getters.token,
          '工序unique_id': this.$route.query.parcess_unique_id,
          日期_上限: parseTime(this.$route.query.salaryNoteUpdateTimeQuantum[1]),
          日期_下限: parseTime(this.$route.query.salaryNoteUpdateTimeQuantum[0])
        }
        generate_salary_list_for_excel_by_process_time_range(post_data)
          .then(response => {
            resolve(response.data)
          })
          .catch(err => {
            console.error(err)
            this.btnLoading = false
          })
      })
    },
    // 导出excel
    async exportExcel() {
      this.btnLoading = true
      var original = await this.generateSalaryListForExcelByProcessTimeRange()
      console.log(original)

      // 子表一： 部门工资
      var tableData1 = []
      var tableData1_Header = [
        '工序名称',
        '工序完成总数量',
        '工序已确认总工资',
        '工序已确认总数量',
        '工序未确认总工资',
        '工序未确认总数量',
        '工序累计总工资'
      ]
      tableData1.push(original.部门工资)
      console.log(11111)
      console.log(tableData1_Header)
      console.log(tableData1)

      // 子表二： 生产单工资
      var tableData2 = []
      var tableData2_Header = []
      var 生产单工资 = original.生产单工资
      for (let i = 0; i < 生产单工资.length; i++) {
        var element = 生产单工资[i]
        for (let j = 0; j < this.$store.getters.订单的标签.length; j++) {
          element['对应订单-' + this.$store.getters.订单的标签[j]] = element['对应订单.tags'][this.$store.getters.订单的标签[j]]
        }
        for (let j = 0; j < this.$store.getters.产品的标签.length; j++) {
          element['排产产品-' + this.$store.getters.产品的标签[j]] = element['排产产品.产品信息.tags'][this.$store.getters.产品的标签[j]]
        }
        element['总排产数'] = element['排产产品.排产配码数量.总排产数']
        delete element['对应订单.tags']
        delete element['排产产品.产品信息.tags']
        delete element['排产产品.排产配码数量.总排产数']
        tableData2.push(element)
        if (i === 0) {
          for (const key in element) {
            tableData2_Header.push(key)
          }
        }
      }
      console.log(22222)
      console.log(tableData2_Header)
      console.log(tableData2)

      // 子表三： 未确认的工资详情
      var tableData3 = []
      var tableData3_Header = [
        '员工姓名',
        '员工工作状态',
        '员工手机',
        '完成数量'
      ]
      for (let j = 0; j < this.$store.getters.订单的标签.length; j++) {
        tableData3_Header.push('对应订单-' + this.$store.getters.订单的标签[j])
      }
      tableData3_Header = tableData3_Header.concat([
        '工序单位工资',
        '工序名称',
        '应发工资'
      ])
      for (let j = 0; j < this.$store.getters.产品的标签.length; j++) {
        tableData3_Header.push('排产产品-' + this.$store.getters.产品的标签[j])
      }
      tableData3_Header = tableData3_Header.concat([
        '排产产品-总排产数',
        '生产单编号',
        '确认记录管理者姓名',
        '记录确认',
        '记录确认时间',
        '记录输入时间'
      ])
      var 未确认的工资详情 = original.未确认的工资详情
      for (let i = 0; i < 未确认的工资详情.length; i++) {
        // eslint-disable-next-line no-redeclare
        var element = 未确认的工资详情[i]
        for (let j = 0; j < this.$store.getters.订单的标签.length; j++) {
          element['对应订单-' + this.$store.getters.订单的标签[j]] = element['对应订单.tags.' + this.$store.getters.订单的标签[j]]
        }
        for (let j = 0; j < this.$store.getters.产品的标签.length; j++) {
          element['排产产品-' + this.$store.getters.产品的标签[j]] = element['排产产品.产品信息.tags.' + this.$store.getters.产品的标签[j]]
        }
        element['记录确认'] = element['记录确认'] ? '是' : '否'
        element['排产产品-总排产数'] = element['排产产品.排产配码数量.总排产数']
        // 遍历element的key 如果不被表头所包含 那么要删掉它
        for (const key in element) {
          if (!tableData3_Header.includes(key)) {
            delete element[key]
          }
        }
        tableData3.push(element)
      }
      console.log(33333)
      console.log(tableData3_Header)
      console.log(tableData3)

      // 子表四： 未确认的工资详情
      var tableData4 = []
      var tableData4_Header = tableData3_Header
      var 已确认的工资详情 = original.已确认的工资详情
      for (let i = 0; i < 已确认的工资详情.length; i++) {
        // eslint-disable-next-line no-redeclare
        var element = 已确认的工资详情[i]
        for (let j = 0; j < this.$store.getters.订单的标签.length; j++) {
          element['对应订单-' + this.$store.getters.订单的标签[j]] = element['对应订单.tags.' + this.$store.getters.订单的标签[j]]
        }
        for (let j = 0; j < this.$store.getters.产品的标签.length; j++) {
          element['排产产品-' + this.$store.getters.产品的标签[j]] = element['排产产品.产品信息.tags.' + this.$store.getters.产品的标签[j]]
        }
        element['记录确认'] = element['记录确认'] ? '是' : '否'
        element['排产产品-总排产数'] = element['排产产品.排产配码数量.总排产数']
        // 遍历element的key 如果不被表头所包含 那么要删掉它
        for (const key in element) {
          if (!tableData4_Header.includes(key)) {
            delete element[key]
          }
        }
        tableData4.push(element)
      }
      console.log(44444)
      console.log(tableData4_Header)
      console.log(tableData4)

      var ws_names = ['部门工资', '生产单工资', '未确认的工资详情', '已确认的工资详情']

      // 表数据
      var json = []
      json.push(tableData1)
      json.push(tableData2)
      json.push(tableData3)
      json.push(tableData4)

      // 表头
      var tHeader = []
      tHeader.push(tableData1_Header)
      tHeader.push(tableData2_Header)
      tHeader.push(tableData3_Header)
      tHeader.push(tableData4_Header)

      // 从tableData里面查的key
      var filterVal = []
      filterVal.push(tableData1_Header)
      filterVal.push(tableData2_Header)
      filterVal.push(tableData3_Header)
      filterVal.push(tableData4_Header)

      var datas = []
      for (let j = 0; j < filterVal.length; j++) {
        const data = this.formatJson(filterVal[j], json[j])
        datas.push(data)
      }

      var filename = `[ ${this.query.parcess_unique_id}]_[${parseTime(this.query.salaryNoteUpdateTimeQuantum[0], '{y}-{m}-{d}')} ]_[${parseTime(this.query.salaryNoteUpdateTimeQuantum[1], '{y}-{m}-{d}')}]_[工资详情]` // 非必填

      import('@/vendor/Export2Excel').then(excel => {
        excel.export_json_to_excel_multi_table({
          ws_names: ws_names,
          header: tHeader, // 表头 必填
          datas: datas, // 具体数据 必填
          filename: filename
        })
        this.btnLoading = false
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
    // 订单按钮箭头点击
    orderArrowClick(mode = '正常点击') {
      if (mode === '正常点击') {
        this.whetherTheOrderLabelIsExpanded = !this
          .whetherTheOrderLabelIsExpanded
      }

      if (this.whetherTheOrderLabelIsExpanded) {
        this.订单的标签 = deepClone(this.$store.getters.订单的标签)
        this.salaryDetail = deepClone(this.originalSalaryDetail)
      } else {
        var 生产单工资 = this.salaryDetail.生产单工资
        for (let i = 0; i < 生产单工资.length; i++) {
          var element = 生产单工资[i]
          element['对应订单.tags'] = { '...': '...' }
        }
        this.订单的标签 = ['...']
      }
    },
    productArrowClick(mode = '正常点击') {
      if (mode === '正常点击') {
        this.whetherToExpandProductInformation = !this
          .whetherToExpandProductInformation
      }
      if (this.whetherToExpandProductInformation) {
        this.产品的标签 = this.$store.getters.产品的标签
        this.salaryDetail = deepClone(this.originalSalaryDetail)
      } else {
        this.产品的标签 = ['...']
        var 生产单工资 = this.salaryDetail.生产单工资
        for (let i = 0; i < 生产单工资.length; i++) {
          var element = 生产单工资[i]
          element['排产产品.产品信息.tag'] = { '...': '...' }
        }
      }
    }
  }
}
</script>

<style lang="scss">
.departmental-salary-details {
  padding: 0 20px;
  .order-header {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: block;
    width: 100%;
    overflow: auto;
    background-color: #d4d4d4;
  }
  .product-header{
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: block;
    width: 100%;
    overflow: auto;
    background-color: #f1e8e8;
  }
  .el-pagination{
    margin-bottom: 100px;
    margin: 10px 0 80px 0;
    float: right;
  }
  .tag {
    margin: 2px;
  }
  .el-table .cell,
  .el-table th div {
    overflow: visible;
  }
}
</style>
