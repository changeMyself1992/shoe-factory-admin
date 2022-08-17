<template>
  <!--登记入库和出库对话框-->
  <div class="header">
    <div class="check-in-and-out-dialog-box">
      <el-dialog :visible.sync="show" :title="calculateTitle" center width="1200px">
        <!-- 物料选项条件查询 -->
        <div class="module-a">
          <div class="header">
            <b>{{ title_a }}</b>
            <div class="btn-box">
              <el-button type="primary" size="small" @click="filterWarehouseMaterial">查询物料</el-button>
            </div>
          </div>

          <el-form ref="searchForm" :model="searchForm" class="info-box" label-position="left">
            <!-- 标签信息 -->
            <div v-if="tag_names.length>0" class="item-1">
              <el-form-item
                v-for="(value,tag_name) in searchForm.tags"
                :key="tag_name"
                :label="tag_name"
              >
                <el-autocomplete
                  v-model.trim="searchForm.tags[tag_name]"
                  class="inline-input"
                  :fetch-suggestions="((queryString, callback)=>tagQueryAutoCompleteSearch(queryString,callback,tag_name))"
                  placeholder="自动补全"
                />
              </el-form-item>
            </div>

            <el-form-item class="item-2" label="物料编号:" label-width="85px">
              <el-input v-model.trim="searchForm.物料编号" />
            </el-form-item>
          </el-form>
        </div>

        <div class="module-b" label-position="left">
          <el-table :data="warehouse_materials_options" border highlight-current-row>
            <el-table-column label="物料查询结果（可选择行）" align="center">
              <el-table-column label="选择" width="70" center>
                <template slot-scope="scope">
                  <el-radio v-model.trim="curSelectMaterialsIndex" class="radio" :label="scope.$index" @change.native="radioHandler(scope.$index)">&nbsp;</el-radio>
                </template>
              </el-table-column>
              <el-table-column prop="物料编号" label="物料编号" align="center" />
              <el-table-column
                v-for="(tag, index) in tag_names"
                :key="index"
                align="center"
                :label="tag"
              >
                <template slot-scope="scope_a">
                  <span>{{ scope_a.row.tags[tag] }}</span>
                </template>
              </el-table-column>
            </el-table-column>
          </el-table>
          <el-pagination
            class="el-pagination"
            :current-page="currentPage"
            :page-sizes="[20, 40, 60, 80]"
            :page-size="pageSize"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>

        <el-form ref="form" class="module-c" :model="form">
          <el-form-item
            class="item-1"
            prop="出库或入库数量"
            :label="openMode === 'putInStorage'?'入库数量:':'出库数量:'"
          >
            <el-input v-model.trim="form.出库或入库数量" disabled />
          </el-form-item>

          <el-form-item v-if="curSelectMaterialsInfo" class="item-1" label="当前仓库剩余量">
            <el-input v-model.trim="curSelectMaterialsInfo.仓库剩余数量" disabled />
          </el-form-item>

          <!--备注信息-->
          <el-form-item class="item-2" prop="备注" label="备注:">
            <el-input v-model="form.备注" type="textarea" :sapn="24" :rows="2" :placeholder="note" />
          </el-form-item>
        </el-form>

        <!-- 供应商列表 -->
        <supplier-list-a
          v-if="curSelectMaterialsInfo"
          ref="supplierListA"
          :whether-to-display-the-operation-column="false"
          :supplier-list-info="curSelectMaterialsInfo['供应商列表']"
          :calculate-warehouse-surplus="calculateWarehouseSurplus"
          :is-show-add-supplier="false"
          :whether-to-disable-the-supplier-name-input-box="true"
          :whether-to-disable-the-supplier-price-input-box="true"
          :whether-to-disable-the-supplier-warehouse-surplus-input-box="true"
          :whether-to-disable-the-supplier-material-name-input-box="true"
          :whether-to-disable-the-instruction-input-box="true"
          :whether-to-disable-the-supplier-material-change-quantity-input-box="false"
          :description-of-warehouse-surplus="descriptionOfWarehouseSurplus"
        />

        <div style="text-align:right;">
          <el-button
            v-if="openMode==='putInStorage'"
            type="primary"
            :loading="isDisable"
            @click="inventoryChangeViaOperation('入库')"
          >添加入库</el-button>
          <el-button
            v-if="openMode==='outbound'"
            type="primary"
            :disabled="isDisable"
            @click="inventoryChangeViaOperation('出库')"
          >领取出库</el-button>
          <el-button type="danger" @click="initData">清空表单</el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import {
  isEmpty,
  isObjectValueEqual,
  objectHasAtLeastOneKeyWhoseValueIsNotNull
} from '@/utils'
import {
  material_tags_auto_complete,
  inventory_change_via_operation,
  filter_warehouse_material
} from '@/api/warehouseProcurement'
import supplierListA from '@/views/components/supplierListA'
export default {
  components: { supplierListA },
  props: {
    dialogVisible: Boolean,
    onClose: {
      required: true,
      validator: function(value) {
        return true
      }
    },
    openMode: {
      type: String,
      // 对象或数组默认值必须从一个工厂函数获取
      default: function() {
        return ''
      }
    }
  },
  data() {
    return {
      // 对应的用于物料的搜索和自动补全的tags模块
      tag_names: [],
      submit_flag: false, // 用于判断是否是点击了提交按钮
      warehouse_materials_options: [], // 用于自动补全的选项
      // 用于条件查询物料
      searchForm: {
        tags: {},
        物料编号: ''
      },
      form: {
        物料编号: '',
        unique_id: '',
        备注: '',
        单位: '',
        出库或入库数量: 0 // 出库或入库数量
      },
      // 当前页数
      currentPage: 1,
      // 总条目数
      total: 0,
      // 当前页数据量
      pageSize: 20,
      // 当前选择的物料信息
      curSelectMaterialsInfo: null,
      // 当前选中的物料索引
      curSelectMaterialsIndex: -1,
      isDisable: false,
      show: false
    }
  },
  computed: {
    calculateTitle: function() {
      if (this.openMode === 'putInStorage') return '物料登记入库'
      else if (this.openMode === 'outbound') return '物料登记出库'
      return ''
    },
    title_a: function() {
      if (this.openMode === 'putInStorage') return '搜索要入库的物料'
      else if (this.openMode === 'outbound') return '搜索要出库的物料'
      return ''
    },
    note: function() {
      if (this.openMode === 'putInStorage') return '物料入库备注信息'
      else if (this.openMode === 'outbound') return '物料出库备注信息'
      return ''
    },
    descriptionOfWarehouseSurplus: function() {
      if (this.openMode === 'putInStorage') return '入库数量'
      else if (this.openMode === 'outbound') return '出库数量'
      return ''
    }
  },
  watch: {
    dialogVisible: function(newVal, oldVal) {
      this.show = newVal
      // 获取标签信息
      this.getMaterialTagName()
    },
    show(newVal, oldVal) {
      if (!newVal) {
        this.onClose(this.show, this.submit_flag)
        this.initData()
      }
    }
  },
  methods: {
    radioHandler(index) {
      this.curSelectMaterialsInfo = this.warehouse_materials_options[index]
    },
    initData() {
      this.form = {
        备注: '',
        出库或入库数量: 0 // 出库或入库数量
      }
      this.getMaterialTagName()
      this.submit_flag = false
      this.warehouse_materials_options = []
      this.curSelectMaterialsInfo = null
      this.curSelectMaterialsIndex = -1
    },
    // 获取配置中对物料的tags数组，确保先载入
    getMaterialTagName(callback) {
      this.tag_names = this.$store.getters.物料的标签
      this.searchForm.tags = {}
      for (var index in this.tag_names) {
        this.$set(this.searchForm.tags, this.tag_names[index], '')
      }
    },
    // 对物料标签进行自动补全操作
    async tagQueryAutoCompleteSearch(queryString, callback, tag_name) {
      if (queryString === undefined || queryString === null) {
        queryString = ''
      }
      var post_data = {
        login_token: this.$store.getters.token,
        base_tags: this.searchForm.tags,
        target_tag_name: tag_name
      }
      const response = await material_tags_auto_complete(post_data)
      var suggest_value_list = []
      for (var index in response.data) {
        suggest_value_list.push({
          value: response.data[index]
        })
      }
      callback(suggest_value_list)
    },

    // 进行入库,出库,操作。
    async inventoryChangeViaOperation(eventType = '入库') {
      this.isDisable = true
      setTimeout(() => {
        this.isDisable = false
      }, 1000)
      if (isEmpty(this.curSelectMaterialsInfo)) {
        this.$message({
          type: 'warning',
          message: '请进行物料选择！！'
        })
        return
      }

      // 2.添加入库或者出库事件
      var 物料变更列表 = []
      for (let i = 0; i < this.curSelectMaterialsInfo.供应商列表.length; i++) {
        const element = this.curSelectMaterialsInfo.供应商列表[i]
        var 该物料变更数量 = 0
        if (eventType === '出库') {
          该物料变更数量 =
            element.物料变更数量 === 0 ? 0 : -element.物料变更数量
        } else {
          该物料变更数量 =
            element.物料变更数量 === 0 ? 0 : element.物料变更数量
        }
        var 物料变更列表元素 = {
          unique_id: this.curSelectMaterialsInfo.unique_id,
          物料编号: this.curSelectMaterialsInfo.物料编号,
          tags: this.curSelectMaterialsInfo.tags,
          该物料变更数量: 该物料变更数量,
          单位: this.curSelectMaterialsInfo.单位,
          供应商信息: {
            供应商物料名称: element.供应商物料名称,
            供应商价格: Number(element.供应商价格),
            仓库剩余数量: Number(element.仓库剩余数量),
            说明: element.备注,
            unique_id: element.unique_id,
            名称: element.名称,
            更新时间: element.更新时间
          }
        }
        物料变更列表.push(物料变更列表元素)
      }
      var inventory_post_data = {
        login_token: this.$store.getters.token,
        事件类型: eventType,
        物料变更列表: 物料变更列表,
        备注: this.form.备注
      }
      // 调用api
      await inventory_change_via_operation(inventory_post_data)
      this.$message({
        type: 'success',
        message: '该物料入库操作已成功记录'
      })
      this.show = false
      this.submit_flag = true
    },
    // 页码控制时，每页数量改变的处理函数
    handleSizeChange(val) {
      this.pageSize = val
      this.filterWarehouseMaterial()
    },
    // 页码控制时，每页码改变改变的处理函数
    handleCurrentChange(val) {
      this.currentPage = val
      this.filterWarehouseMaterial()
    },
    // 查询物料
    async filterWarehouseMaterial() {
      var post_data = {
        login_token: this.$store.getters.token,
        sort: { 更新时间: -1 },
        pagination: {
          page: parseInt(this.currentPage),
          limit: parseInt(this.pageSize)
        }
      }
      var response = null
      // 如果有编号 那么按编号查询
      if (!isEmpty(this.searchForm.物料编号)) {
        post_data['物料编号'] = this.searchForm.物料编号.trim()
        response = await filter_warehouse_material(post_data)
        // 如果没查到，那做一个提示
        if (response.data.length === 0) {
          this.$message({
            type: 'warning',
            message: '没有找到该物料信息，请检查物料编号是否输入有误'
          })
          return
        }
      } else if (
        objectHasAtLeastOneKeyWhoseValueIsNotNull(this.searchForm.tags)
      ) {
        // 如果标签至少有一个key不为空 按标签查询
        post_data.tags = this.searchForm.tags
        response = await filter_warehouse_material(post_data)
      } else {
        this.$message({
          type: 'warning',
          message: '请完善搜索信息'
        })
        return
      }
      // 如果没查到任何物料信息，那么做一个提示
      if (isEmpty(response.data)) {
        this.$message({
          type: 'warning',
          message: '查询不到符合条件的物料信息，请到仓库列表去添加！'
        })
      }
      this.warehouse_materials_options = []
      for (var i = 0; i < response.data.length; i++) {
        var item = response.data[i]
        item['仓库剩余数量'] = Number(parseFloat(item['仓库剩余数量']).toFixed(2))
        for (let j = 0; j < item['供应商列表'].length; j++) {
          var element = item['供应商列表'][j]
          element['仓库剩余数量'] = Number(
            Number(element['仓库剩余数量']).toFixed(2)
          )
        }
        this.warehouse_materials_options.push(item)
      }
      this.total = response.total_count
    },
    // 判断 查询结果是否有和搜索标签完全一致的物料
    whetherTheQueryResultsContainSearchTags() {
      var isEquality = false
      this.warehouse_materials_options.forEach(element => {
        if (isObjectValueEqual(element.tags, this.searchForm.tags)) {
          isEquality = true
        }
      })
      return isEquality
    },
    // 计算仓库剩余量
    calculateWarehouseSurplus() {
      var 物料变更数量 = 0
      for (let i = 0; i < this.curSelectMaterialsInfo.供应商列表.length; i++) {
        var element = this.curSelectMaterialsInfo.供应商列表[i]
        物料变更数量 += Number(element.物料变更数量)
      }
      this.form.出库或入库数量 = 物料变更数量
    }
  }
}
</script>

<style lang="scss" scoped>
.check-in-and-out-dialog-box {
  position: relative;
  box-sizing: border-box;
  .module-a {
    margin-bottom: 30px;
    border: 1px solid #bbbbbb;
    .header {
      padding: 0 10px;
      height: 40px;
      line-height: 40px;
      border-bottom: 1px solid #bbbbbb;
      display: flex;
      justify-content: space-between;
    }
    .info-box {
      padding: 0px 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      .item-1 {
        width: 100%;
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;
        .title {
          width: 100%;
        }
      }
    }
  }
  .module-b {
    margin-bottom: 30px;
  }

  .module-c {
    margin-bottom: 30px;
    display: flex;
    flex-wrap: wrap;
    .item-1 {
      width: 150px;
      margin-right: 20px;
    }
    .item-2 {
      width: 100%;
    }
  }

  .el-form-item {
    margin-bottom: 10px;
  }
}
</style>
