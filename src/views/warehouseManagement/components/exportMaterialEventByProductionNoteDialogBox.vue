<template>
  <div class="exportMaterialEventByProductionNoteDialogBox">
    <el-dialog :visible.sync="show" title="根据生产单登记出库" center width="1300px">
      <product-note-table
        ref="onGoingProductNoteTable"
        :product-note-model="'onGoing'"
        :whether-to-show-export-excex="false"
        :whether-the-action-item-is-displayed="false"
        :whether-batch-operation-switch-is-displayed="false"
        :whether-to-display-the-advanced-search-switch="false"
        :whether-advanced-search-is-enabled-by-default="true"
        :whether-multiple-selection-is-enabled="true"
        :default-page-size="20"
        :default-page-sizes="[20, 40, 60, 100]"
        :call-back-select-change="handleSelectionChange"
      />

      <el-table :data="materialTableData" border>
        <el-table-column align="center" label="根据选中的生产单生成的物料清单">
          <el-table-column align="center" prop="物料编号" label="物料编号" width="110" />
          <el-table-column
            v-for="(value,index) in 物料的标签"
            :key="index"
            align="center"
            :label="value"
          >
            <template slot-scope="scope_a">
              <span>{{ scope_a.row.tags[value] }}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="供应商信息.仓库剩余数量" label="在库数量" />
          <el-table-column align="center" label="领取数量" width="100">
            <template slot-scope="scope">
              <el-input
                v-model.number="scope.row.该物料变更数量"
                type="number"
                @input="whenEnterExitQuantity(scope.row)"
                @focus="($event)=>{$event.currentTarget.select()}"
              />
            </template>
          </el-table-column>
          <el-table-column align="center" prop="单位" label="单位" width="50" />

          <el-table-column prop="供应商信息" label="供应商信息" align="center">
            <el-table-column align="center" prop="供应商信息.名称" label="供应商名称" />
            <el-table-column align="center" prop="供应商信息.供应商物料名称" label="供应商物料名称" />
            <el-table-column align="center" prop="供应商信息.供应商价格" label="供应商价格" />
            <el-table-column align="center" prop="供应商信息.仓库剩余数量" label="仓库剩余数量" />
            <el-table-column align="center" prop="供应商信息.更新时间" label="更新时间" width="160" />
            <el-table-column align="center" prop="供应商信息.说明" label="说明" width="160" />
          </el-table-column>
        </el-table-column>
      </el-table>

      <el-form>
        <el-form-item style="text-align:right;">
          <el-button type="primary" plain :loading="btn_loading" @click="onSubmit">领取出库</el-button>
          <el-button type="danger" plain @click="clearFilterCondition">清空表单</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import {
  generate_exit_inventory_by_product_note,
  inventory_change_via_operation
} from '@/api/warehouseProcurement'
import productNoteTable from '@/views/productOrderManagement/components/productNoteTable' // 排产单表格组件
export default {
  components: { productNoteTable },
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
      // 选中的生产单
      multipleSelection: [],
      // 用于条件查询物料
      searchForm: {
        production_note_filter_condition: ''
      },
      // 根据选中的生产单生成的物料清单
      materialTableData: [],
      // 告诉父组件是否需要刷新数据
      refresh_flag: false,
      // 按钮是否禁用
      btn_loading: false,
      关联生产单: [
      //   {
      //   unique_id: '',
      //   生产单编号: '',
      //   生产单日期: ''
      // }
      ],
      show: false
    }
  },
  computed: {
    ...mapGetters(['物料的标签'])
  },
  watch: {
    dialogVisible: function(newVal, oldVal) {
      this.show = newVal
      if (newVal) {
        this.clearFilterCondition()
      }
    },
    show(newVal, oldVal) {
      if (!newVal) {
        this.onClose(this.show, this.refresh_flag)
      }
    }
  },
  methods: {
    // 根据生产单生成出库API的输入值
    async generateExitInventoryByProductNote(post_data) {
      const response = await generate_exit_inventory_by_product_note(post_data)
      var production_note_detail = response.data

      var newArray_a = this.materialTableData.concat(production_note_detail['物料变更列表'])
      for (var index in newArray_a) {
        newArray_a[index]['该物料变更数量'] = Math.abs(Number(parseFloat(newArray_a[index]['该物料变更数量']).toFixed(2)))
        newArray_a[index]['供应商信息']['仓库剩余数量'] = Number(Number(newArray_a[index]['供应商信息']['仓库剩余数量']).toFixed(2))
        newArray_a[index]['对应的生产单编号'] = production_note_detail['关联生产单']['unique_id']
      }
      this.materialTableData = newArray_a

      var newArray_b = this.关联生产单.concat({
        unique_id: production_note_detail['关联生产单']['unique_id'],
        生产单编号: production_note_detail['关联生产单']['unique_id'],
        生产单日期: production_note_detail['关联生产单']['生产单时间']
      })
      this.关联生产单 = newArray_b
    },
    // 当输入添加数量的时候
    whenEnterExitQuantity(row) {
      var 该物料变更数量 = row['该物料变更数量']
      if (!该物料变更数量 || Number(parseFloat(该物料变更数量)) < 0) {
        row['该物料变更数量'] = 0
      }
    },
    // 领取出库
    async onSubmit() {
      this.btn_loading = true

      // 2.添加出库事件
      for (let a = 0; a < this.关联生产单.length; a++) {
        const element_a = this.关联生产单[a]
        // 2.1组合物料变更数量
        var 物料变更列表 = []
        // 在materialTableData中找出和element_a.unique_id 相等的所有元素
        var materials = this.materialTableData.filter(item => {
          return element_a.unique_id === item['对应的生产单编号']
        })
        for (var i = 0; i < materials.length; i++) {
          const element_b = materials[i]
          if (element_b.供应商信息.仓库剩余数量 < element_b.该物料变更数量) {
            this.$message({
              type: 'error',
              message: `物料编号: ${element_b.物料编号}，该物料领取数量不得多余该物料在库数量`
            })
            this.btn_loading = false
            return
          }
          var 物料变更列表元素 = {
            unique_id: element_b.unique_id,
            物料编号: element_b.物料编号,
            tags: element_b.tags,
            该物料变更数量: -Number(element_b.该物料变更数量),
            单位: element_b.单位,
            供应商信息: element_b.供应商信息
          }
          物料变更列表.push(物料变更列表元素)
        }
        // 3.生成请求参数并发送
        var inventory_post_data = {
          login_token: this.$store.getters.token,
          事件类型: '出库',
          物料变更列表: 物料变更列表,
          关联生产单: element_a
        }
        await inventory_change_via_operation(inventory_post_data)
      }
      this.$message({
        type: 'success',
        message: '所有的生产单物料出库操作已成功记录'
      })
      this.btn_loading = false
      this.show = false
      this.refresh_flag = true
    },
    // 当进行生产单选择的时候
    async handleSelectionChange(val) {
      this.multipleSelection = val
      this.materialTableData = []
      this.关联生产单 = []
      for (let i = 0; i < this.multipleSelection.length; i++) {
        const element = this.multipleSelection[i]
        var post_data = {
          login_token: this.$store.getters.token,
          生产单编号: element['生产单编号']
        }
        await this.generateExitInventoryByProductNote(post_data)
      }
    },
    // 清空表单
    clearFilterCondition() {
      this.multipleSelection = []
      // 用于条件查询物料
      this.searchForm = {
        production_note_filter_condition: ''
      }
      // 根据选中的生产单生成的物料清单
      this.materialTableData = []
      // 告诉父组件是否需要刷新数据
      this.refresh_flag = false
      // 按钮是否禁用
      this.btn_loading = false
      this.关联生产单 = []
      if (this.$refs.onGoingProductNoteTable) {
        this.$refs.onGoingProductNoteTable.toggleSelection()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.exportMaterialEventByProductionNoteDialogBox {
  .search-form {
    .info-box {
      display: flex;
      .item-1 {
        margin-right: 20px;
      }
    }
  }
}
</style>
