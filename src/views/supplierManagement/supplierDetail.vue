<template>

  <div class="warehouse-list">
    <el-form ref="supplierDetailData" :model="supplierDetailData">
      <el-form-item class="base-info">
        <div class="header">
          <b>供应商详情信息</b>
        </div>

        <el-row :gutter="20">
          <el-col :span="6">
            <el-input
              v-model.trim="supplierDetailData['名称']"
              class="name-a"
              :disabled="true"
            >
              <template slot="prepend">名称</template>
            </el-input>
          </el-col>

          <!-- <el-col :span="6">
            <el-input
              v-model.trim="supplierDetailData['unique_id']"
              class="name-a"
              :disabled="true"
            >
              <template slot="prepend">unique_id</template>
            </el-input>
          </el-col> -->

          <el-col :span="6">
            <el-input
              v-model.trim="supplierDetailData['地址']"
              class="name-a"
              :disabled="true"
            >
              <template slot="prepend">地址</template>
            </el-input>
          </el-col>

          <el-col :span="6">
            <el-input
              v-model.trim="supplierDetailData['更新时间']"
              class="name-a"
              :disabled="true"
            >
              <template slot="prepend">更新时间</template>
            </el-input>
          </el-col>

          <el-col :span="6">
            <el-input
              v-model.trim="supplierDetailData['联系电话']"
              class="name-a"
              :disabled="true"
            >
              <template slot="prepend">联系电话</template>
            </el-input>
          </el-col>

        </el-row>
      </el-form-item>
      <el-form-item class="other-note">
        <div class="other-note-title">备注</div>
        <el-input
          v-model="supplierDetailData['备注']"
          type="textarea"
          :sapn="24"
          :rows="4"
          :disabled="true"
        />
      </el-form-item>
    </el-form>
    <div class="module-c">
      <div class="title">
        <strong>供应商报价单记录</strong>
      </div>
      <el-table :data="supplierPriceData" border>
        <el-table-column align="center" prop="货号" label="货号" />
        <el-table-column align="center" prop="单价" label="单价" />
        <el-table-column align="center" prop="单位" label="单位" />
        <el-table-column align="center" prop="名称及规格" label="名称及规格" />
        <el-table-column align="center" prop="备注" label="备注" />
        <el-table-column align="center" prop="记录时间" label="记录时间" width="155" />
        <el-table-column align="center" prop="更新时间" label="更新时间" width="155" />
        <!-- <el-table-column align="center" label="操作" width="220">
          <template slot-scope="scope">
            <el-button
              type="primary"
              size="mini"
              @click="viewSupplierDetailInfo(scope.row)"
            >查看</el-button>
          </template>
        </el-table-column> -->
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
import {
  deepClone
} from '@/utils'
import { filter_supplier_quotations, get_supplier_by_id } from '@/api/supplier'
export default {
  components: { },
  data() {
    return {
      // 是否启用按钮loading状态防止多次点击
      btnLoading: false,
      // 当前页数
      currentPage: 1,
      // 总条目数
      total: 0,
      // 当前页数据量
      pageSize: 50,
      // 供应商报价单信息
      supplierPriceData: [],
      supplierDetailData: {},
      query: null // 传递过来的数据
    }
  },
  created() {
    this.query = this.$route.query
    console.log(this.query)
    this.getSupplierById()
    this.filterSupplierPrice()
  },
  // 进入该页面后，查询列表API
  mounted() {

  },
  methods: {
    // 页码控制时，每页数量改变的处理函数
    handleSizeChange(val) {
      this.pageSize = val
      this.filterSupplierPrice()
    },
    // 页码控制时，每页码改变改变的处理函数
    handleCurrentChange(val) {
      this.currentPage = val
      this.filterSupplierPrice()
    },
    // 查看按钮点击
    viewSupplierDetailInfo(supplierPriceData) {
      this.curOperationDetailInfo = deepClone(supplierPriceData)
      const { href } = this.$router.resolve({
        path: '/supplierManagement/supplierPriceDetail',
        query: {
          id: this.curOperationDetailInfo.unique_id,
          gid: this.query.id
        }
      })
      window.open(href, '_blank')
    },
    // 页面加载时，以及数据更新时调用，用于获取最新的列表
    async filterSupplierPrice() {
      var login_token = this.$store.getters.token
      var unique_id = this.query.id
      var post_data = {
        login_token: login_token,
        供应商unique_id: unique_id,
        pagination: {
          page: parseInt(this.currentPage),
          limit: parseInt(this.pageSize)
        },
        sort: { 更新时间: -1 }
      }
      var response = await filter_supplier_quotations(post_data)
      this.supplierPriceData = response.data
      console.log(response.data)
      this.total = response.total_count
    },
    // 页面加载时，以及数据更新时调用，用于获取最新的列表
    async getSupplierById() {
      var login_token = this.$store.getters.token
      var unique_id = this.query.id
      var post_data = {
        login_token: login_token,
        unique_id: unique_id
      }
      var response = await get_supplier_by_id(post_data)
      this.supplierDetailData = response.data
      console.log(response.data)
    },
    // 导出excel
    exportExcel() {
      this.btnLoading = true
      setTimeout(() => {
        this.btnLoading = false
      }, 3000)
      const tHeader = [
        '供应商名称',
        '供应商电话',
        '供应商地址',
        '更新时间',
        '备注'
      ]
      const filterVal = [
        '名称',
        '电话',
        '地址',
        '更新时间',
        '备注'
      ]
      const tableData = deepClone([...this.supplierTableData])
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
.warehouse-list {
  padding: 10px;
  .base-info {
    margin-bottom: 30px;
    border: 1px solid #bbbbbb;
    .header {
      padding: 0 10px;
      height: 40px;
      line-height: 40px;
      border-bottom: 1px solid #bbbbbb;
    }
    .info-box {
      padding: 10px 10px;
      height: 130px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      .item-1 {
        width: 20%;
      }
      .item-2 {
        width: 20%;
      }
      .item-3 {
        width: 20%;
      }
      .item-4 {
        width: 50%;
      }
    }
  }

  .module-c {
    .title {
      margin-bottom: 20px;
    }
  }
}
</style>

<style scoped>
.el-form-item {
  margin-bottom: 0px;
}
.app-container .el-form-item[data-v-66945489] {
  margin-bottom: 0px;
}
.el-date-editor.el-input,
.el-date-editor.el-input__inner {
  width: 100%;
}
.warehouse-list .base-info[data-v-b29c8a1a] {
    margin-bottom: 0px;
    border: none;
}
.other-note{
    margin-bottom: 10px;
}
.warehouse-list .base-info .header[data-v-b29c8a1a] {
    border-bottom: none;
}
</style>
