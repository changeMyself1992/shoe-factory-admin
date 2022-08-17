<template>
  <div class="app-container">
    <!-- 条件查询 -->
    <el-form ref="form" class="module-b" :model="form" label-position="left">
      <div class="header">
        <b>操作日志条件查询</b>
      </div>
      <div class="info-box">

        <el-form-item class="item-1" label="操作员姓名:" label-width="90px">
          <el-input v-model.trim="form.operatorName" placeholder="单行输入" />
        </el-form-item>
        <el-form-item class="item-1" label="操作员手机号:" label-width="100px">
          <el-input v-model.trim="form.operatorPhone" placeholder="单行输入" />
        </el-form-item>
        <el-form-item class="item-1" label="级别:" label-width="65px">
          <el-input v-model.trim="form.operationLevel" placeholder="单行输入" />
        </el-form-item>

        <el-form-item class="item-4" label="操作时间段:" label-width="85px">
          <el-date-picker
            v-model.trim="form.operationUpdateTimeQuantum"
            class="picker"
            type="daterange"
            unlink-panels
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>

        <el-form-item class="item-5">
          <el-button type="primary" @click="filterOperationLog">搜索</el-button>
          <el-button type="primary" @click="clearFilterCondition">清空条件</el-button>
        </el-form-item>
      </div>
    </el-form>

    <div class="module-c">
      <div class="title">操作日志列表：</div>

      <el-table :data="tableData" border>
        <!-- 根据产品动态标签和属性自动生成表格 -->
        <el-table-column align="center" prop="operatorName" label="操作员姓名" width="150" />
        <el-table-column align="center" prop="operatorPhone" label="操作员手机号" width="200" />
        <el-table-column align="center" prop="operationLevel" label="操作级别" width="150" />
        <el-table-column align="center" prop="operationTime" label="操作时间" width="200" />
        <el-table-column align="center" prop="operationNote" label="操作简讯" />

        <!-- 操作部分 -->
        <!-- <el-table-column align="center" label="操作" width="240">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="handleDetail(scope.row)">查看详情</el-button>
          </template>
        </el-table-column> -->
      </el-table>
    </div>

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
</template>

<script>
import {
  filter_operation_log
} from '@/api/operationLogManagement'
import { isEmpty, parseTime } from '@/utils'

export default {
  components: {},
  data() {
    return {
      // 当前页数
      currentPage: 1,
      // 总条目数
      total: 0,
      // 当前页数据量
      pageSize: 50,
      form: {
        operatorName: '',
        operatorPhone: '',
        operationLevel: ''
      },
      // 产品列表的内容信息
      tableData: []
    }
  },

  computed: {
  },

  async created() {
    // _.debounce is a function provided by lodash to limit how
    // often a particularly expensive operation can be run.
    // In this case, we want to limit how often we access
    // yesno.wtf/api, waiting until the user has completely
    // finished typing before making the ajax request. To learn
    // more about the _.debounce function (and its cousin
    // _.throttle), visit: https://lodash.com/docs#debounce
    await this.filterOperationLog()
  },

  // 进入该页面后，查询列表API
  mounted() {
  },
  methods: {
    // 页码控制时，每页数量改变的处理函数
    handleSizeChange(val) {
      this.pageSize = val
      this.filterOperationLog()
    },
    // 页码控制时，每页码改变改变的处理函数
    handleCurrentChange(val) {
      this.currentPage = val
      this.filterOperationLog()
    },
    // 清空查询条件
    clearFilterCondition() {
      this.form = {
        operatorName: '',
        operatorPhone: '',
        operationLevel: ''
      }
    },
    // 页面加载时，以及数据更新时调用，用于获取最新的工序列表
    async filterOperationLog() {
      var post_data = {
        login_token: this.$store.getters.token,
        pagination: {
          page: parseInt(this.currentPage),
          limit: parseInt(this.pageSize)
        },
        sort: {
          操作时间: -1
        }
      }

      if (!isEmpty(this.form.operationUpdateTimeQuantum)) {
        post_data['操作时间_上限'] = parseTime(
          this.form.operationUpdateTimeQuantum[1]
        )
        post_data['操作时间_下限'] = parseTime(
          this.form.operationUpdateTimeQuantum[0]
        )
      }

      if (!isEmpty(this.form.operatorName)) {
        post_data['操作员姓名'] = '.*' + this.form.operatorName + '.*'
        // 删除页码参数，检索整个数据库
        delete post_data.pagination
      }

      if (!isEmpty(this.form.operatorPhone)) {
        post_data['操作员手机号'] = '.*' + this.form.operatorPhone + '.*'
        // 删除页码参数，检索整个数据库
        delete post_data.pagination
      }

      if (!isEmpty(this.form.operationLevel)) {
        post_data['级别'] = '.*' + this.form.operationLevel + '.*'
        // 删除页码参数，检索整个数据库
        delete post_data.pagination
      }
      const response = await filter_operation_log(post_data)

      // 对获得的操作日志信息进行处理
      var product_items = []
      for (var i = 0; i < response.data.length; i++) {
        var item = {
          operatorName: response.data[i]['操作员姓名'],
          operatorPhone: response.data[i]['操作员手机号'],
          operationLevel: response.data[i]['级别'],
          operationTime: response.data[i]['操作时间'],
          operationNote: response.data[i]['操作简讯']
        }

        // 添加都表格数据中
        product_items.push(item)
      }

      this.tableData = product_items
      this.total = response.total_count // 页数控制用的总产品数
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  .module-a {
    margin-bottom: 20px;
  }
  .module-b {
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
      .item-1,
      .item-2,
      .item-3 {
        width: 250px;
      }
      .item-4 {
        width: 520px;
      }
    }
  }
  .module-c {
    .title {
      margin-bottom: 20px;
    }
    .el-button--mini {
      margin-bottom: 5px;
    }
  }
}
</style>

