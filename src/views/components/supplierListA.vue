<template>
  <div class="supplier-list-a">
    <el-button
      v-if="isShowAddSupplier"
      class="addPro"
      type="primary"
      size="small"
      @click="addSupplier()"
    >继续添加供应商</el-button>
    <el-table :data="supplierList" style="margin-bottom:30px;">
      <el-table-column label="供应商列表" align="center">
        <el-table-column align="center" prop="名称" label="供应商名称">
          <template slot-scope="scpoe">
            <el-autocomplete
              v-model.trim="scpoe.row['名称']"
              class="inline-input"
              :fetch-suggestions="((queryString, callback)=>supplierNameQueryAutoCompleteSearch(scpoe.row['名称'],callback))"
              placeholder="自动补全"
              :disabled="whetherToDisableTheSupplierNameInputBox"
              @select="handleSelect($event,scpoe.row)"
            />
          </template>
        </el-table-column>

        <el-table-column align="center" prop="供应商价格" label="供应商价格">
          <template slot-scope="scpoe">
            <el-input
              v-model.number="scpoe.row['供应商价格']"
              type="number"
              :disabled="whetherToDisableTheSupplierPriceInputBox"
              @input="onSupplierPriceInput(scpoe.row,scpoe.$index)"
              @focus="($event)=>{$event.currentTarget.select()}"
            />
          </template>
        </el-table-column>

        <el-table-column align="center" prop="物料变更数量" :label="descriptionOfWarehouseSurplus">
          <template slot-scope="scpoe">
            <el-input
              v-model.number="scpoe.row['物料变更数量']"
              type="number"
              :disabled="whetherToDisableTheSupplierMaterialChangeQuantityInputBox"
              @input="onWarehouseSurplusInput(scpoe.row,scpoe.$index)"
              @focus="($event)=>{$event.currentTarget.select()}"
            />
          </template>
        </el-table-column>

        <el-table-column align="center" prop="仓库剩余数量" label="仓库剩余数量">
          <template slot-scope="scpoe">
            <el-input
              v-model="scpoe.row['仓库剩余数量']"
              type="number"
              :disabled="whetherToDisableTheSupplierWarehouseSurplusInputBox"
              @blur="limitedDecimalNumber(scpoe.row,scpoe.$index)"
            />
          </template>
        </el-table-column>

        <el-table-column align="center" prop="供应商物料名称" label="供应商物料名称">
          <template slot-scope="scpoe">
            <el-input
              v-model.trim="scpoe.row['供应商物料名称']"
              placeholder="供应商物料名称"
              :disabled="whetherToDisableTheSupplierMaterialNameInputBox"
            />
          </template>
        </el-table-column>

        <el-table-column align="center" prop="更新时间" label="更新时间" width="200">
          <template slot-scope="scpoe">
            <el-input v-model.trim="scpoe.row['更新时间']" placeholder="更新时间" disabled />
          </template>
        </el-table-column>

        <el-table-column align="center" prop="说明" label="说明">
          <template slot-scope="scpoe">
            <el-input
              v-model.trim="scpoe.row['说明']"
              placeholder="说明"
              :disabled="whetherToDisableTheInstructionInputBox"
            />
          </template>
        </el-table-column>

        <el-table-column
          v-if="whetherToDisplayTheOperationColumn"
          align="center"
          label="操作"
          width="100"
        >
          <template slot-scope="scope">
            <el-button
              type="danger"
              size="mini"
              @click="removeSupplierFromList(scope.$index)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { filter_supplier } from '@/api/supplier'
import { isEmpty, deepClone, parseTime } from '@/utils'
export default {
  props: {
    // 父组件传递过来的供应商列表信息
    supplierListInfo: {
      type: Array,
      default: function() {
        return []
      }
    },
    // 回调给父组件 计算仓库剩余数量
    calculateWarehouseSurplus: {
      type: Function,
      default: null
    },
    // 是否显示操作列
    whetherToDisplayTheOperationColumn: {
      type: Boolean,
      default: true
    },
    // 是否显示继续添加供应商按钮
    isShowAddSupplier: {
      type: Boolean,
      default: true
    },
    // 是否禁用供应商名称输入框
    whetherToDisableTheSupplierNameInputBox: {
      type: Boolean,
      default: false
    },
    // 是否禁用供应商物料变更数量输入框
    whetherToDisableTheSupplierMaterialChangeQuantityInputBox: {
      type: Boolean,
      default: false
    },
    // 是否禁用供应商仓库剩余量输入框
    whetherToDisableTheSupplierWarehouseSurplusInputBox: {
      type: Boolean,
      default: false
    },
    // 是否禁用供应商价格输入框
    whetherToDisableTheSupplierPriceInputBox: {
      type: Boolean,
      default: false
    },
    // 是否禁用供应商物料名称输入框
    whetherToDisableTheSupplierMaterialNameInputBox: {
      type: Boolean,
      default: false
    },
    // 是否禁用说明输入框
    whetherToDisableTheInstructionInputBox: {
      type: Boolean,
      default: false
    },
    // 仓库剩余量的描述
    descriptionOfWarehouseSurplus: {
      type: String,
      default: '物料变更数量'
    }
  },
  data() {
    return {
      // 当前表格显示的供应商列表
      supplierList: [],
      // 数据库中全部的供应商列表
      allSuppliers: []
    }
  },
  computed: {
    // 该计算属性让父组件调用返回 productList
    returnSupplierList() {
      if (!this.checkSupplierList()) return null
      return this.supplierList
    }
  },
  watch: {
    supplierListInfo: function(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.initSupplierList()
      }
    }
  },
  created() {
    this.initSupplierList()
    this.checkAllSuppliers()
  },
  mounted() {
  },
  methods: {
    // 初始化供应商列表
    initSupplierList() {
      this.supplierList = []
      if (this.supplierListInfo.length === 0) {
        this.supplierList.push(
          deepClone(this.$store.getters.物料的空的供应商信息)
        )
      } else {
        this.supplierList = this.supplierListInfo
        // 如果是出库或者入库操作在使用本组件，添加一个物料变更数量key
        // 物料变更数量 应该默认为0
        if (this.descriptionOfWarehouseSurplus !== '仓库剩余数量') {
          for (let i = 0; i < this.supplierList.length; i++) {
            this.$set(this.supplierList[i], '物料变更数量', 0)
          }
        }
      }
    },

    // 查询数据库全部的供应商
    async checkAllSuppliers() {
      var post_data = {
        login_token: this.$store.getters.token
      }
      const response = await filter_supplier(post_data)
      this.allSuppliers = response.data
    },

    // 添加供应商
    addSupplier() {
      if (!this.checkSupplierList()) return
      var emptySupplier = deepClone(
        this.supplierList[this.supplierList.length - 1]
      )
      emptySupplier.unique_id = ''
      emptySupplier.名称 = ''
      emptySupplier.更新时间 = parseTime(new Date(), '{y}-{m}-{d} {h}:{i}:{s}')
      this.supplierList.push(emptySupplier)
      this.calculateWarehouseSurplus()
    },

    // 检查 supplierList 数据结构是否正常
    // （这个供应商不在数据库存在或者没有unique_id或者unique_id重复，没有名称或者存在完全一样的供应商名称，这几种情况就是不正常，不可继续添加供应商）
    checkSupplierList() {
      for (let r = 0; r < this.supplierList.length; r++) {
        const element_wai = this.supplierList[r]
        var index = this.allSuppliers.findIndex(item => {
          return item.名称 === element_wai.名称
        })
        if (index === -1) {
          this.$message({
            type: 'warning',
            message: `第${r + 1}行，不允许添加不存在的供应商！`
          })
          return false
        }
        if (isEmpty(element_wai.unique_id)) {
          this.$message({
            type: 'warning',
            message: `第${r + 1}行，供应商数据缺少unique_id！`
          })
          return false
        }
        if (isEmpty(element_wai.名称)) {
          this.$message({
            type: 'warning',
            message: `第${r + 1}行，供应商数据缺少名称！`
          })
          return false
        }
        for (let c = r + 1; c < this.supplierList.length; c++) {
          // 如果找到重复的编号或者是完全一样的标签信息，那么也不可添加
          const element_nei = this.supplierList[c]
          if (
            element_nei.unique_id === element_wai.unique_id ||
            element_nei.名称 === element_wai.名称
          ) {
            this.$message({
              type: 'warning',
              message: '供应商列表中不允许出现重复的供应商名称和unique_id'
            })
            return false
          }
        }
      }
      return true
    },

    // 对供应商名称进行自动补全操作
    async supplierNameQueryAutoCompleteSearch(queryString, callback, row) {
      var post_data = {
        名称: queryString,
        login_token: this.$store.getters.token,
        sort: { 更新时间: -1 }
      }
      const response = await filter_supplier(post_data)
      var suggest_value_list = []
      for (var index in response.data) {
        suggest_value_list.push({
          value: response.data[index]['名称'],
          obj: response.data[index]
        })
      }
      suggest_value_list.push(response.data)
      callback(suggest_value_list)
    },

    // 供应商选择回调
    handleSelect(item, row) {
      console.log('打印选中的供应商和当前行数据')
      console.log(item.obj)
      console.log(row)
      row.unique_id = item.obj.unique_id
      row.仓库剩余数量 = 0
      row.供应商价格 = 0
      row.供应商物料名称 = ''
      row.名称 = item.obj.名称
      row.更新时间 = item.obj.更新时间
      row.说明 = ''
      this.calculateWarehouseSurplus()
    },

    // 删除供应商列表中的元素
    removeSupplierFromList(index) {
      if (this.supplierList.length <= 1) {
        this.$message({
          type: 'warning',
          message: '至少得包含一个供应商元素！！！'
        })
        return
      }
      this.supplierList.splice(index, 1)
      this.calculateWarehouseSurplus()
    },

    // 当输入供应商价格的时候
    onSupplierPriceInput(row, index) {
      var 供应商价格 = row['供应商价格']
      if (供应商价格 === '' || Number(parseFloat(供应商价格)) < 0) {
        row['供应商价格'] = 0
      } else {
        row['供应商价格'] = Number(parseFloat(供应商价格).toFixed(2))
      }
    },

    // 当输入物料变更数量得时候
    onWarehouseSurplusInput(row, index) {
      var 物料变更数量 = Number(Number(row['物料变更数量']).toFixed(2))
      if (!物料变更数量 || Number(parseFloat(物料变更数量)) < 0) {
        row['物料变更数量'] = 0
      } else {
        row['物料变更数量'] = 物料变更数量
      }
      this.calculateWarehouseSurplus()
    },
    limitedDecimalNumber(row, index) {
      var 仓库剩余数量 = row['仓库剩余数量']
      if (仓库剩余数量 === '' || Number(parseFloat(仓库剩余数量)) < 0) {
        row['仓库剩余数量'] = 0
      } else {
        row['仓库剩余数量'] = Number(parseFloat(仓库剩余数量).toFixed(2))
      }
      this.calculateWarehouseSurplus()
    }
  }
}
</script>

<style lang="scss" scoped>
.supplier-list-a {
  font-size: 12px;
  width: 100%;
  padding-bottom: 30px;
  overflow: auto;
  position: relative;
  .addPro {
    position: absolute;
    top: 0px;
    right: 0;
    z-index: 1000;
  }
}
</style>

