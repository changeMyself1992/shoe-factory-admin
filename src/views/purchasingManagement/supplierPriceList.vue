<template>
  <div class="warehouse-list">
    <div class="base-info">
      <div class="header">
        <b>供应商信息</b>
        <el-button
          class="addPro"
          type="primary"
          size="small"
          @click="handleSelectSupplierForPriceList()"
        >选择供应商</el-button>
      </div>
      <el-form ref="form" class="info-box" :model="supplierInfo" label-position="left">

        <el-form-item class="item-1" label="名称:" label-width="85px">
          <el-input v-model.trim="supplierInfo['名称']" placeholder="输入" disabled />
        </el-form-item>

        <el-form-item class="item-2" label="地址:" label-width="85px">
          <el-input v-model.trim="supplierInfo['地址']" placeholder="输入" disabled />
        </el-form-item>

        <el-form-item class="item-3" label="电话:" label-width="85px">
          <el-input v-model.trim="supplierInfo['电话']" placeholder="输入" disabled />
        </el-form-item>

        <el-form-item class="item-4" label="备注:" label-width="85px">
          <el-input v-model.trim="supplierInfo['备注']" placeholder="输入" disabled />
        </el-form-item>

      </el-form>

    </div>

    <div class="module-c">
      <div class="title">
        <strong>报价单</strong>
      </div>
      <div class="module-a">
        <el-button type="primary" size="small" :loading="btnLoading" @click="exportExcel()">导出EXCEL表格</el-button>
      </div>
      <el-table :data="materialTableData" border style="width: 100%" row-key="id">
        <!-- 其他物料静态属性 -->
        <el-table-column align="center" prop="物料编号" label="物料编号" width="200" />
        <!-- 根据物料动态标签和属性自动生成表格 -->
        <el-table-column v-for="tag_name in 物料的标签" :key="tag_name" :label="tag_name">
          <template slot-scope="scope_a">
            <span>{{ scope_a.row.tags[tag_name] }}</span>
          </template>
        </el-table-column>

        <el-table-column align="center" prop="供应商信息.名称" label="供应商名称" />
        <el-table-column align="center" prop="供应商信息.供应商物料名称" label="供应商物料名称" />
        <el-table-column align="center" prop="供应商信息.供应商价格" label="供应商报价" />
        <el-table-column align="center" prop="单位" label="单位" />
        <el-table-column align="center" prop="更新时间" label="更新时间" width="160" />

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

    <!--添加供应商对话框-->
    <select-supplier-for-price-list-dialog-box
      :dialog-visible="selectSupplierForPriceListDialogVisible"
      :on-close="closeSelectSupplierForPriceListDialog"
    />
  </div>
</template>

<script>
import { deepClone } from '@/utils'
import { mapGetters } from 'vuex'
import store from '@/store'
import selectSupplierForPriceListDialogBox from './components/selectSupplierForPriceListDialogBox' // 查看修改物料对话框
import request from '@/utils/request'
export default {
  components: { selectSupplierForPriceListDialogBox },
  data() {
    return {
      // 是否启用按钮loading状态防止多次点击
      btnLoading: false,
      // 配置中对物料的tags数组
      material_tag_names: [],
      // 是否弹出选择供应商对话框
      selectSupplierForPriceListDialogVisible: false,
      // 供应商的信息
      supplierInfo: {
        unique_id: '',
        tags: [],
        名称: '',
        地址: '',
        电话: '',
        备注: '',
        更新时间: ''
      },
      // 当前页数
      currentPage: 1,
      // 总条目数
      total: 0,
      // 当前页数据量
      pageSize: 50,
      // 仓库物料列表的动态表头列表
      tableHeader: [],
      // 仓库物料列表的动态表头列表对应属性
      tableProps: [],
      // 仓库物料信息
      materialTableData: [],
      // 是否展示添加物料对话框
      addMaterialDialogVisible: false,
      // 是否展示编辑物料对话框
      editMaterialDetailInfoVisible: false,
      // 当前操作的订单信息（查看，删除）
      curOperationDetailInfo: null
    }
  },
  computed: {
    ...mapGetters(['物料的标签', '订单的标签', '产品的标签'])
  },
  // 进入该页面后，查询列表API
  mounted() {
    this.getMaterialTagName()
  },
  methods: {
    // 页码控制时，每页数量改变的处理函数
    handleSizeChange(val) {
      this.pageSize = val
      this.filterMaterial()
    },
    // 页码控制时，每页码改变改变的处理函数
    handleCurrentChange(val) {
      this.currentPage = val
      this.filterMaterial()
    },
    // 选择需要报价单的供应商
    handleSelectSupplierForPriceList() {
      this.selectSupplierForPriceListDialogVisible = true
    },
    // 关闭选择供应商对话框回调
    closeSelectSupplierForPriceListDialog(status, supplierInfoItem) {
      this.selectSupplierForPriceListDialogVisible = status
      if (supplierInfoItem && supplierInfoItem.unique_id) {
        this.supplierInfo = supplierInfoItem
        this.getPriceList()
      }
    },

    // 页面加载时，以及数据更新时调用，用于获取最新的列表
    getPriceList() {
      var login_token = store.getters.token
      var post_data = {
        login_token: login_token,
        unique_id: this.supplierInfo.unique_id,
        pagination: {
          page: parseInt(this.currentPage),
          limit: parseInt(this.pageSize)
        },
        sort: { 更新时间: -1 }
      }

      request({
        url: 'supplier/get_supplier_price_list_by_id',
        method: 'post',
        data: post_data
      })
        .then(response => {
          // 成功接收到数据
          if (response.status === 'OK') {
            console.log('*****')
            console.log(response)
            this.materialTableData = response.data
            this.total = response.total_count

            // 将动态 tags 的信息展开到外层
            for (var data_index in this.materialTableData) {
              for (var tag_index in this.material_tag_names) {
                this.materialTableData[data_index][this.material_tag_names[tag_index]] = this.materialTableData[data_index]['tags'][this.material_tag_names[tag_index]]
              }
            }

            // 配置表头信息、表头对应属性信息和表单信息
            this.tableHeader = []
            this.tableProps = []
            for (var index in this.material_tag_names) {
              this.tableHeader.push(this.material_tag_names[index])
              this.tableProps.push(this.material_tag_names[index])
            }
          }
        })
        .catch(error => {
          console.log(error)
        })
    },
    // 获取配置中对物料的tags数组，确保先载入
    getMaterialTagName(callback) {
      var login_token = store.getters.token
      var post_data = {
        login_token: login_token
      }
      // 调用api
      request({
        url: 'warehouse/get_material_tag_names',
        method: 'post',
        data: post_data
      })
        .then(response => {
          // 成功接收到数据
          if (response.status === 'OK') {
            this.material_tag_names = response.data
          }
          if (typeof (callback) === 'function') {
            callback()
          }
        })
        .catch(error => {
          console.log(error)
          if (typeof (callback) === 'function') {
            callback()
          }
        })
    },

    clearCondition() {
    },

    // 导出excel
    exportExcel() {
      this.btnLoading = true
      setTimeout(() => {
        this.btnLoading = false
      }, 3000)
      var tHeader = ['物料编号']
      var filterVal = ['物料编号']
      var tableData = deepClone([...this.materialTableData])
      // 将一些关注的深层信息展开到外层
      for (var data_index in tableData) {
        tableData[data_index]['供应商信息.供应商价格'] = tableData[data_index]['供应商信息']['供应商价格']
        tableData[data_index]['供应商信息.名称'] = tableData[data_index]['供应商信息']['名称']
        tableData[data_index]['供应商信息.供应商物料名称'] = tableData[data_index]['供应商信息']['供应商物料名称']
      }

      for (var index in this.material_tag_names) {
        tHeader.push(this.material_tag_names[index])
        filterVal.push(this.material_tag_names[index])
      }
      tHeader.push('供应商名称')
      tHeader.push('供应商物料名称')
      tHeader.push('供应商报价')
      tHeader.push('单位')
      tHeader.push('报价更新时间')
      filterVal.push('供应商信息.名称')
      filterVal.push('供应商信息.供应商物料名称')
      filterVal.push('供应商信息.供应商价格')
      filterVal.push('单位')
      filterVal.push('更新时间')

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
</style>
