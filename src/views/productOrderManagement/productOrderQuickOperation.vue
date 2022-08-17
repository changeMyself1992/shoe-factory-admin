<template>
  <div class="productOrderQuickOperation">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>待确认计件查询条件</span>
      </div>
      <el-form ref="form" class="conditional-search" :model="form" label-position="left">
        <el-form-item prop="生产单编号" label="生产单编号" label-width="100px">
          <el-input v-model.trim="form.生产单编号" />
        </el-form-item>
        <el-form-item prop="员工姓名" label="员工姓名" label-width="100px">
          <el-input v-model.trim="form.员工姓名" />
        </el-form-item>
        <el-form-item prop="员工手机" label="员工手机" label-width="100px">
          <el-input v-model.number="form.员工手机" />
        </el-form-item>
        <el-form-item prop="工序" label="工序" label-width="100px">
          <el-radio v-for="process in 全部的工序" :key="process.工序名称" v-model="form.工序" :label="process.工序名称">{{ process.工序名称 }}</el-radio>
          <!-- <el-checkbox-group v-model.trim="form.工序">
            <el-checkbox
              v-for="process in 全部的工序"
              :key="process.工序名称"
              :label="process.工序名称"
            >{{ process.工序名称 }}</el-checkbox>
          </el-checkbox-group> -->
        </el-form-item>

        <el-form-item class="row-4">
          <el-button class="btn" type="primary" @click="filterUnconfirmedStaffRecord()">搜索</el-button>
          <el-button class="btn" type @click="clearFilterCondition()">清空条件</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-button
      :loading="btnLoading"
      type="primary"
      size="mini"
      :disabled="!(管理权限['生产单详情可写']&&multipleSelection.length>0)"
      @click="submitMultiple()"
    >批量确认</el-button>
    <el-table ref="multipleTable" :data="tableData" border @selection-change="handleSelectionChange">
      <el-table-column
        type="selection"
        width="55"
      />
      <el-table-column align="center" prop="生产单编号" label="生产单编号" />
      <el-table-column align="center" label="订单信息">
        <el-table-column
          v-for="(tag, index) in 订单的标签"
          :key="index"
          :label="tag"
          align="center"
          :prop="`对应订单.tags.${tag}`"
        />
      </el-table-column>
      <el-table-column type="expand" align="center" label="产品信息展开" width="90">
        <template slot-scope="scope">
          <el-form label-position="left" inline class="demo-table-expand">
            <el-form-item v-for="(tag, index) in 产品的标签" :key="index" :label="tag">
              <span>{{ scope.row.排产产品.产品信息.tags[tag] }}</span>
            </el-form-item>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="排产产品.产品信息.产品编号" label="产品编号" />
      <el-table-column align="center" prop="排产产品.排产配码数量.总排产数" label="生产单总数" />
      <el-table-column align="center" prop="生产单时间" label="日期" />
      <el-table-column align="center" prop="生产单工序信息.工序信息.工序名称" label="工序" />
      <el-table-column align="center" prop="生产单工序信息.员工计件.员工姓名" label="姓名" />
      <el-table-column align="center" prop="生产单工序信息.员工计件.unique_id" label="员工编号" />
      <el-table-column align="center" prop="生产单工序信息.员工计件.配码计数.总完成数" label="实际完成量" />
      <el-table-column align="center" label="总工资">
        <template slot-scope="scope">
          <span>{{ scope.row.生产单工序信息.工序工资*scope.row.生产单工序信息.员工计件.配码计数.总完成数 }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作">
        <template slot-scope="scope">
          <el-button
            :loading="btnLoading"
            type="primary"
            size="mini"
            :disabled="!管理权限['生产单详情可写']"
            @click="submitItemGX(scope.row)"
          >确认</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      style="float:right"
      :current-page="page"
      :page-sizes="[30, 60, 100, 150]"
      :page-size="limit"
      :total="total"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handlePageChange"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import {
  filter_unconfirmed_staff_record,
  batch_manager_confirm_staff_record
} from '@/api/ordersForProductionScheduling'
import { filter_process } from '@/api/maintenanceOfProcessPartsOfProductLibrary'
import { isEmpty } from '@/utils'
export default {
  components: {},
  data() {
    return {
      form: {
        生产单编号: '',
        员工姓名: '',
        员工手机: '',
        工序: ''
      },
      全部的工序: [],
      // 当前页数
      page: 1,
      // 当前页数据量
      limit: 30,
      // 总条目数
      total: 0,
      tableData: [],
      btnLoading: false,
      multipleSelection: []
    }
  },
  computed: {
    ...mapGetters(['订单的标签', '产品的标签', '管理权限'])
  },
  async created() {
    var res = await filter_process({ login_token: this.$store.getters.token })
    this.全部的工序 = res.data
    this.filterUnconfirmedStaffRecord()
  },
  mounted() {},
  methods: {
    // 页码控制时，每页码改变改变的处理函数
    handlePageChange(val) {
      this.page = val
      this.filterUnconfirmedStaffRecord()
    },
    // 页码控制时，每页数量改变的处理函数
    handleSizeChange(val) {
      this.limit = val
      this.filterUnconfirmedStaffRecord()
    },

    async filterUnconfirmedStaffRecord() {
      var paramter = {
        login_token: this.$store.getters.token,
        pagination: {
          page: this.page,
          limit: this.limit
        }
      }
      if (!isEmpty(this.form.生产单编号)) {
        paramter['生产单编号'] = this.form.生产单编号
      }
      if (!isEmpty(this.form.员工姓名)) {
        paramter['员工姓名'] = this.form.员工姓名
      }
      if (!isEmpty(this.form.员工手机)) {
        paramter['员工手机'] = this.form.员工手机
      }
      if (!isEmpty(this.form.工序)) {
        paramter['工序'] = this.form.工序
      }
      var res = await filter_unconfirmed_staff_record(paramter)
      this.total = res.data.pagination.total
      this.tableData = res.data.items
    },
    clearFilterCondition() {
      this.page = 1
      this.limit = 30
      this.form = {
        生产单编号: '',
        员工姓名: '',
        员工手机: '',
        工序: ''
      }
      this.multipleSelection = []
      this.$refs.multipleTable.clearSelection()
      this.filterUnconfirmedStaffRecord()
    },
    // 提交单个生产单的所选工序
    async submitItemGX(row) {
      var parameter = {
        login_token: this.$store.getters.token,
        员工计件记录: [
          {
            生产单unique_id: row['生产单编号'],
            工序unique_id: row['生产单工序信息']['工序信息']['unique_id'],
            员工unique_id: row['生产单工序信息']['员工计件']['unique_id']
          }
        ]
      }
      this.btnLoading = true
      setTimeout(() => {
        this.btnLoading = false
      }, 1200)
      await batch_manager_confirm_staff_record(parameter)
      this.filterUnconfirmedStaffRecord()
      this.$message({
        type: 'success',
        message: '计件记录确认成功！'
      })
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    // 提交多个生产单的所选工序
    async submitMultiple() {
      var parameter = {
        login_token: this.$store.getters.token
      }
      var 员工计件记录 = []
      for (let i = 0; i < this.multipleSelection.length; i++) {
        const element = this.multipleSelection[i]
        员工计件记录.push(
          {
            生产单unique_id: element['生产单编号'],
            工序unique_id: element['生产单工序信息']['工序信息']['unique_id'],
            员工unique_id: element['生产单工序信息']['员工计件']['unique_id']
          }
        )
      }
      parameter['员工计件记录'] = 员工计件记录
      this.btnLoading = true
      setTimeout(() => {
        this.btnLoading = false
      }, 2000)
      var res = await batch_manager_confirm_staff_record(parameter)
      this.multipleSelection = []
      this.$refs.multipleTable.clearSelection()
      this.filterUnconfirmedStaffRecord()
      this.$message({
        type: 'success',
        message: res.msg
      })
    }
  }
}
</script>

<style lang="scss">
.productOrderQuickOperation {
  padding: 20px 20px 80px 20px;
  .demo-table-expand {
    font-size: 0;
  }
  .demo-table-expand label {
    width: 90px;
    color: #99a9bf;
  }
  .demo-table-expand .el-form-item {
    margin-right: 0;
    margin-bottom: 0;
    width: 50%;
  }
}
</style>

