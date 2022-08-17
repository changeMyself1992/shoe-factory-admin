<template>
  <div class="add-purchase-note">
    <div class="useintro" @click="viewUseIntro">
      <img src="@/assets/images/help.png" class="help">
    </div>
    <el-form ref="form" class="module-a" :model="form">
      <el-form-item class="item-1" label="采购单编号:" label-width="90px">
        <el-input v-model.trim="form.采购单编号" placeholder />
      </el-form-item>

      <el-form-item class="item-2" label="采购单时间:" label-width="90px">
        <el-date-picker v-model.trim="form.采购单日期" type="date" placeholder="今日时间" />
      </el-form-item>

      <div class="item-3">
        <el-table :data="materialEnquiryForm" border>
          <el-table-column label="搜索物料" align="center">
            <el-table-column v-for="tag_name in 物料的标签" :key="tag_name" :label="tag_name">
              <template slot-scope="scope_a">
                <el-autocomplete
                  v-model.trim="scope_a.row[tag_name]"
                  :fetch-suggestions="((queryString,callback)=>tagQueryAutoCompleteSearch(callback,tag_name,scope_a.row))"
                  placeholder="自动补全"
                />
              </template>
            </el-table-column>

            <el-table-column label="搜索" align="center">
              <template slot-scope="scope_b">
                <el-button
                  type="primary"
                  size="small"
                  @click="filterWarehouseMaterial(scope_b.row)"
                >搜索物料</el-button>
              </template>
            </el-table-column>
          </el-table-column>
        </el-table>
      </div>

      <div class="item-4">
        <el-table
          :data="warehouse_materials_options"
          border
          @selection-change="handleSelectionChange"
        >
          <el-table-column label="选择物料" align="center">
            <el-table-column align="center" prop="物料编号" label="物料编号" />

            <el-table-column v-for="tag_name in 物料的标签" :key="tag_name" :label="tag_name">
              <template slot-scope="scope_a">
                <span>{{ scope_a.row.tags[tag_name] }}</span>
              </template>
            </el-table-column>

            <el-table-column align="center" prop="仓库剩余数量" label="仓库剩余总数量">
              <template slot-scope="scope">
                <span>{{ scope.row['仓库剩余数量'] }}</span>
                <span>{{ scope.row['单位'] }}</span>
              </template>
            </el-table-column>

            <el-table-column type="selection" width="100" align="center" />
          </el-table-column>
        </el-table>
      </div>

      <div class="item-5">
        <el-table :data="form.物料列表" border>
          <el-table-column label="采购单包含的物料" align="center">
            <el-table-column align="center" prop="物料编号" label="物料编号" />

            <el-table-column
              v-for="tag_name in 物料的标签"
              :key="tag_name"
              :label="tag_name"
              align="center"
            >
              <template slot-scope="scope_c">
                <span>{{ scope_c.row.tags[tag_name] }}</span>
              </template>
            </el-table-column>

            <el-table-column align="center" prop="仓库剩余数量" label="仓库剩余总数量">
              <template slot-scope="scope">
                <span>{{ scope.row['仓库剩余数量'] }}</span>
                <span>{{ scope.row['单位'] }}</span>
              </template>
            </el-table-column>

            <!-- 供应商信息 -->
            <el-table-column align="center" label="供应商信息">
              <el-table-column align="center" label="供应商选择" width="150">
                <template slot-scope="scope_d">
                  <el-select
                    v-model.trim="scope_d.row['供应商信息']['名称']"
                    placeholder="请选择供应商"
                    @change="supplierSelect(scope_d.row['供应商信息']['名称'],scope_d.row)"
                  >
                    <el-option
                      v-for="item in scope_d.row['供应商列表']"
                      :key="item.名称"
                      :label="item.名称"
                      :value="item.名称"
                    />
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column align="center" prop="供应商信息.名称" label="供应商名称" />
              <el-table-column align="center" prop="供应商信息.供应商价格" label="供应商价格">
                <template slot-scope="scope">
                  <span>{{ scope.row['供应商信息']['供应商价格'] }}</span>
                  <span>元</span>
                </template>
              </el-table-column>
              <el-table-column align="center" prop="供应商信息.供应商物料名称" label="供应商物料名称" />
              <el-table-column align="center" prop="供应商信息.仓库剩余数量" label="供应商仓库剩余数量" />
            </el-table-column>

            <el-table-column align="center" label="目标购买数量" width="180">
              <template slot-scope="scope_d">
                <el-input-number
                  v-model.trim="scope_d.row['目标购买数量']"
                  :precision="2"
                  :min="0"
                  :step="0.1"
                  size="small"
                />
                <span>{{ scope_d.row['单位'] }}</span>
              </template>
            </el-table-column>

            <el-table-column align="center" label="删除" width="80">
              <template slot-scope="scope_e">
                <el-button
                  type="danger"
                  size="mini"
                  @click="handleDeletePurchaseMaterial(scope_e.row)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table-column>
        </el-table>
      </div>

      <!--备注信息-->
      <el-form-item class="item-6" label="备注">
        <el-input v-model="form.备注" type="textarea" :sapn="24" :rows="3" placeholder="采购单相关备注信息" />
      </el-form-item>

      <el-form-item class="item-7">
        <el-button class="btn-generate" type="primary" @click="onGeneratePurchaseOrder">生成采购单</el-button>
        <el-button
          class="btn-order"
          type="primary"
          disabled
          @click="toggleGeneratePurchaseNote()"
        >通过未排产订单生成采购单</el-button>
        <el-button class="btn-clear" type="danger" @click="clearForm">清空表单</el-button>
      </el-form-item>
    </el-form>

    <!--通过订单生产采购单 对话框-->
    <el-dialog :visible.sync="show" title="通过未排产的订单生成采购单" center width="1200px">
      <div>
        <el-table :data="orderTableData" border @selection-change="handleSelectionOrderChange">
          <el-table-column align="center" label="选择" type="selection" width="50" />
          <el-table-column align="center" prop="订单编号" label="订单编号" />
          <el-table-column
            v-for="tag_name in 订单的标签"
            :key="tag_name"
            :label="tag_name"
            align="center"
          >
            <template slot-scope="scope_a">
              <span>{{ scope_a.row.tags[tag_name] }}</span>
            </template>
          </el-table-column>
          <el-table-column type="expand" align="center" prop="包含的产品" label="包含的产品信息" width="200">
            <template slot-scope="props">
              <el-table :data="props.row.包含的产品" border>
                <el-table-column align="center" prop="产品信息.产品编号" label="产品编号" />
                <el-table-column
                  v-for="tag_name in 产品的标签"
                  :key="tag_name"
                  :label="tag_name"
                  align="center"
                >
                  <template slot-scope="scope_b">
                    <span>{{ scope_b.row.产品信息.tags[tag_name] }}</span>
                  </template>
                </el-table-column>
                <el-table-column
                  type="expand"
                  align="center"
                  prop="产品信息.部位详情"
                  label="部位详情"
                  width="150"
                >
                  <template slot-scope="scope_c">
                    <el-table :data="scope_c.row.产品信息.部位详情" border>
                      <el-table-column align="center" prop="部位名称" label="部位名称" />
                      <el-table-column align="center" label="物料标签">
                        <el-table-column
                          v-for="tag_name in 物料的标签"
                          :key="tag_name"
                          :label="tag_name"
                          align="center"
                        >
                          <template slot-scope="scope_d">
                            <span>{{ scope_d.row.使用物料.tags[tag_name] }}</span>
                          </template>
                        </el-table-column>
                        <el-table-column align="center" prop="使用物料.所选供应商信息.仓库剩余数量" label="仓库剩余数量" />
                      </el-table-column>
                    </el-table>
                  </template>
                </el-table-column>
                <el-table-column align="center" prop="配码数量.总数" label="待生产数量" />
              </el-table>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="交货日期" label="交货日期" />
          <el-table-column align="center" prop="订单日期" label="订单日期" />
        </el-table>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="onDetermineBtnClick">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  material_tags_auto_complete,
  filter_warehouse_material,
  add_purchase_note,
  generate_purchase_note_input_by_order_list
} from '@/api/warehouseProcurement'
import { generate_year_month_sequence_number } from '@/api/otherUtilityClasses'
import { filter_order } from '@/api/ordersForProductionScheduling'
import { isEmpty, deepClone, parseTime } from '@/utils'
import { mapGetters } from 'vuex'
export default {
  components: {},
  data() {
    return {
      // 提交采购单
      form: {
        采购单编号: '',
        采购单日期: '',
        物料列表: [],
        关联订单列表: [],
        备注: ''
      },
      // 物料的标签
      materialEnquiryForm: [
        // {
        //   材料类型: '',
        //   材质: '',
        //   颜色: '',
        //   物料名称: ''
        // }
      ],
      // 查询回来的物料数组
      warehouse_materials_options: [],
      // 是否展示订单选择对话框
      show: false,
      // 全部的新订单
      orderTableData: [],
      // 用户选择的订单
      multipleOrderSelection: []
    }
  },
  computed: {
    ...mapGetters(['物料的标签', '订单的标签', '产品的标签'])
  },
  watch: {},

  async created() {
    await this.initForm()
    this.getMaterialTagName()
    this.filterPendingOrder()
  },
  mounted() {
  },
  methods: {
    // 查看指引
    viewUseIntro() {
      var routeUrl = this.$router.resolve({
        path: '/instructionsForuse/index',
        query: {
          x: 11,
          y: 1
        }
      })
      window.open(routeUrl.href, '_blank')
    },
    // 初始化form
    async initForm() {
      const res_a = await generate_year_month_sequence_number({
        login_token: this.$store.getters.token,
        流水单分组: 'CGD'
      })
      var code = res_a.data['流水号']
      this.form.采购单编号 = code
      this.form.采购单日期 = new Date()
    },
    // 获取配置中对物料的tags数组，确保先载入
    getMaterialTagName() {
      var material_tag_names = this.$store.getters.物料的标签
      var material_tag_filter = {}
      for (var index in this.material_tag_names) {
        this.$set(material_tag_filter, material_tag_names[index], '')
      }
      this.materialEnquiryForm.push(material_tag_filter)
    },
    // 对物料标签进行自动补全操作
    async tagQueryAutoCompleteSearch(callback, tag_name, base_tags) {
      var login_token = this.$store.getters.token
      var post_data = {
        login_token: login_token,
        base_tags: base_tags,
        target_tag_name: tag_name
      }
      // 调用api
      const response = await material_tags_auto_complete(post_data)
      console.log(response.data)
      var suggest_value_list = []
      for (var index in response.data) {
        suggest_value_list.push({
          value: response.data[index]
        })
      }
      callback(suggest_value_list)
    },

    // 查询物料
    async filterWarehouseMaterial(tags) {
      var post_data = {
        login_token: this.$store.getters.token,
        sort: { 更新时间: -1 }
      }
      var response = null
      if (!this.whetherTheTagsIsValid(tags)) {
        this.$message({
          type: 'warning',
          message: '请完善搜索信息'
        })
        return
      }
      post_data.tags = tags
      response = await filter_warehouse_material(post_data)
      if (isEmpty(response.data) || response.data.length === 0) {
        this.$message({
          type: 'warning',
          message: '无法查到该标签相应的物料！'
        })
      }
      this.warehouse_materials_options = []
      for (var i = 0; i < response.data.length; i++) {
        var item = response.data[i]
        this.warehouse_materials_options.push(item)
      }
    },
    // 物料选择供应商
    supplierSelect(supplierName, row) {
      if (isEmpty(supplierName)) return
      var 供应商列表 = row.供应商列表
      for (let i = 0; i < 供应商列表.length; i++) {
        var element = 供应商列表[i]
        if (element['名称'] === supplierName) {
          row['供应商信息'] = deepClone(element)
        }
      }
    },
    // 判断搜索的标签的值 是否至少有一个不为null
    whetherTheTagsIsValid(tags) {
      for (const key in tags) {
        const value = tags[key]
        if (!isEmpty(value)) return true
      }
      return false
    },

    // 物料选择回调
    handleSelectionChange(val) {
      // 如果form.物料列表 中不包含该选中的元素那就push进来
      for (let i = 0; i < val.length; i++) {
        var element = deepClone(val[i])
        const index = this.form['物料列表'].findIndex(material => {
          return material.unique_id === element.unique_id
        })
        if (index === -1) {
          if (element['供应商列表'].length > 0) {
            element['目标购买数量'] = 1
            element['供应商信息'] = deepClone(element['供应商列表'][0])
            this.form['物料列表'].push(element)
          } else {
            this.$message({
              type: 'warning',
              message:
                '您选择的物料还没有供应商，请联系管理员添加供应商之后再生成采购单'
            })
          }
        }
      }
    },

    // 将选中的物料从物料列表中删除
    handleDeletePurchaseMaterial(rowData) {
      for (var i = 0; i < this.form.物料列表.length; i++) {
        if (this.form.物料列表[i]['unique_id'] === rowData['unique_id']) {
          this.form.物料列表.splice(i, 1)
        }
      }
    },

    // 生成采购单
    async onGeneratePurchaseOrder() {
      var post_data = {
        login_token: this.$store.getters.token,
        data: {
          采购单编号: this.form.采购单编号,
          采购单日期: parseTime(this.form.采购单日期, '{y}-{m}-{d}'),
          备注: this.form.备注,
          物料列表: this.form.物料列表
        }
      }
      if (!isEmpty(this.form.关联订单列表)) {
        post_data['data']['关联订单列表'] = this.form.关联订单列表
      }
      const response = await add_purchase_note(post_data)
      this.$message({
        type: 'success',
        message: response.msg
      })
      this.$router.push({ path: '/purchasingManagement/purchaseNoteList' })
    },

    // 切换显示通过未排产订单生成采购单
    toggleGeneratePurchaseNote() {
      this.show = true
    },
    // 条件查询订单
    async filterPendingOrder() {
      var post_data = {
        login_token: this.$store.getters.token,
        sort: { 交货日期: -1 },
        pagination: {
          page: 1,
          limit: 20
        },
        订单状态: '新订单'
      }
      const response = await filter_order(post_data)
      this.orderTableData = response.data
    },
    // 订单选择回调
    handleSelectionOrderChange(val) {
      this.multipleOrderSelection = val
    },
    // 确定按钮点击的时候
    onDetermineBtnClick() {
      if (this.multipleOrderSelection.length === 0) {
        this.show = false
        return
      }
      this.form.关联订单列表 = []
      // 判断 multipleOrderSelection 用户选择的订单 是否在 form.关联订单列表 中存在
      for (let i = 0; i < this.multipleOrderSelection.length; i++) {
        const element = this.multipleOrderSelection[i]
        this.form.关联订单列表.push(element.unique_id)
      }
      this.getPurchaseNoteScriptInfo()
    },
    // 生成 生成“添加采购单”的API输入成功
    async getPurchaseNoteScriptInfo() {
      var post_data = {
        login_token: this.$store.getters.token,
        订单列表: this.form.关联订单列表
      }
      const response = await generate_purchase_note_input_by_order_list(
        post_data
      )
      this.form.物料列表 = response.data
      this.multipleOrderSelection = []
      this.show = false
    },

    // 清空列表
    async clearForm() {
      this.form = {
        采购单编号: '',
        采购单日期: '',
        物料列表: [],
        关联订单列表: [],
        备注: ''
      }
      const res_a = await generate_year_month_sequence_number({
        login_token: this.$store.getters.token,
        流水单分组: 'CGD'
      })
      var code = res_a.data['流水号']
      this.form.采购单编号 = code
      this.materialEnquiryForm = []
      this.getMaterialTagName()
      this.warehouse_materials_options = []
    }
  }
}
</script>

<style lang="scss" scoped>
.add-purchase-note {
  padding: 10px;
  .module-a {
    display: flex;
    width: 100%;
    justify-content: space-between;
    flex-wrap: wrap;
    .item-1,
    .item-2 {
      width: 250px;
    }
    .item-3,
    .item-4,
    .item-5,
    .item-6 {
      width: 100%;
      overflow: auto;
    }
    .item-7 {
      overflow: hidden;
      width: 100%;
      .btn-generate {
        float: right;
      }
      .btn-clear {
        float: right;
        margin-right: 20px;
      }
      .btn-order {
        float: right;
        margin-right: 20px;
      }
    }
  }
}
</style>
