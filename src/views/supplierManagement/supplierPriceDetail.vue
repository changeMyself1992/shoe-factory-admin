<template>
  <div class="warehouse-list">
    <div class="module-c">
      <el-form ref="supplierPriceData" :model="supplierPriceData">
        <el-form-item class="base-info">
          <div class="header">
            <b>供应商报价单详情</b>
          </div>

          <el-row :gutter="20">
            <el-col :span="4">
              <el-input
                v-model.trim="supplierPriceData['名称及规格']"
                class="name-a"
                :disabled="true"
              >
                <template slot="prepend">名称及规格</template>
              </el-input>
            </el-col>

            <el-col :span="4">
              <el-input
                v-model.trim="supplierPriceData['单位']"
                class="name-a"
                :disabled="true"
              >
                <template slot="prepend">单位</template>
              </el-input>
            </el-col>

            <el-col :span="4">
              <el-input
                v-model.trim="supplierPriceData['单价']"
                class="name-a"
                :disabled="true"
              >
                <template slot="prepend">单价</template>
              </el-input>
            </el-col>

            <el-col :span="4">
              <el-input
                v-model.trim="supplierPriceData['记录时间']"
                class="name-a"
                :disabled="true"
              >
                <template slot="prepend">记录时间</template>
              </el-input>
            </el-col>

            <el-col :span="4">
              <el-input
                v-model.trim="supplierPriceData['更新时间']"
                class="name-a"
                :disabled="true"
              >
                <template slot="prepend">更新时间</template>
              </el-input>
            </el-col>
          </el-row>
        </el-form-item>

        <el-form-item class="other-note">
          <div class="other-note-title">备注</div>
          <el-input
            v-model="supplierPriceData['备注']"
            type="textarea"
            :sapn="24"
            :rows="4"
            :disabled="true"
          />
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import { get_supplier_quotation_by_id } from '@/api/supplier'
export default {
  components: { },
  data() {
    return {
      NOT_EDITABLED: false, // 修改权限
      // 是否启用按钮loading状态防止多次点击
      btnLoading: false,
      // 当前页数
      currentPage: 1,
      // 总条目数
      total: 0,
      // 当前页数据量
      pageSize: 50,
      // 供应商报价单信息
      supplierPriceData: {},
      query: null // 传递过来的数据
    }
  },
  created() {
    this.query = this.$route.query
    console.log(this.query)
    this.getSupplierQuotationById()
  },
  // 进入该页面后，查询列表API
  mounted() {
    if (
      this.$store.getters.管理权限.hasOwnProperty('采购管理可编辑') &&
      this.$store.getters.管理权限['采购管理可编辑']
    ) {
      this.NOT_EDITABLED = false
    } else {
      this.NOT_EDITABLED = true
    }
  },
  methods: {

    // 页面加载时，以及数据更新时调用，用于获取最新的列表
    async getSupplierQuotationById() {
      var login_token = this.$store.getters.token
      var unique_id = this.query.id
      var gid = this.query.gid
      var post_data = {
        login_token: login_token,
        unique_id: unique_id,
        供应商unique_id: gid
      }
      var response = await get_supplier_quotation_by_id(post_data)
      this.supplierPriceData = response.data
      console.log(response.data)
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
.warehouse-list .base-info[data-v-4de27370] {
    margin-bottom: 0px;
    border: none;
}
.other-note{
    margin-bottom: 10px;
}
.warehouse-list .base-info .header[data-v-4de27370] {
    border-bottom: none;
}
</style>
