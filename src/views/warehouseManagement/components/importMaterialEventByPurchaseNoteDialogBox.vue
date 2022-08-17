<template>
  <div class="importMaterialEventByPurchaseNoteDialogBox">
    <el-dialog :visible.sync="show" title="根据采购单登记入库" center width="1200px">
      <!--采购单查询/选择要入库的采购单 -->
      <el-card class="module-a">
        <div slot="header" align="center">
          <strong>搜索等待执行的采购单进行入库</strong>
        </div>
        <el-form class="module-a-form" :model="purchase_note_filter_condition">
          <el-form-item class="item-1" label="采购单编号:">
            <el-input v-model.trim="purchase_note_filter_condition.number" placeholder="单行输入" />
          </el-form-item>

          <el-form-item class="item-2">
            <el-button type="primary" @click="filterPurchaseNote">查询采购单</el-button>
            <el-button type="primary" @click="clearFilterCondition">清空条件</el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <el-card class="module-b">
        <div slot="header">
          <b>条件查询采购单结果</b>
        </div>
        <div class="info-box">
          <span class="item-1">选择采购单：</span>
          <div class="item-2">
            <el-radio
              v-for="(item, index) in purchase_note_options"
              :key="index"
              v-model.trim="purchase_note_radio_selection"
              class="radio"
              :label="item"
              border
            >{{ item.text }}</el-radio>
          </div>
        </div>
      </el-card>

      <el-form ref="form" :model="form">
        <!-- 基本信息 -->
        <el-form-item>
          <el-row>
            <el-col :span="24">
              <div>物料清单</div>
            </el-col>
          </el-row>
          <el-row class="row-1">
            <el-table :data="materialTableData" border>
              <el-table-column align="center" prop="物料编号" label="物料编号" width="120" />

              <el-table-column
                v-for="(value,index) in 物料的标签"
                :key="index"
                align="center"
                :label="value"
                width="90"
              >
                <template slot-scope="scope_a">
                  <span>{{ scope_a.row.tags[value] }}</span>
                </template>
              </el-table-column>

              <el-table-column align="center" prop="仓库剩余数量" label="在库数量" />
              <el-table-column align="center" label="添加数量" width="100">
                <template slot-scope="scope">
                  <el-input
                    v-model.number="scope.row.该物料变更数量"
                    type="number"
                    @input="whenEnterAddQuantity(scope.row)"
                  />
                </template>
              </el-table-column>
              <el-table-column align="center" prop="单位" label="单位" width="65" />

              <el-table-column prop="供应商信息" label="供应商信息" align="center">
                <el-table-column align="center" prop="供应商信息.名称" label="供应商名称" />
                <el-table-column align="center" prop="供应商信息.供应商物料名称" label="供应商物料名称" />
                <el-table-column align="center" prop="供应商信息.供应商价格" label="供应商价格" />
                <el-table-column align="center" prop="供应商信息.仓库剩余数量" label="仓库剩余数量" />
                <el-table-column align="center" prop="供应商信息.更新时间" label="更新时间" width="160" />
                <el-table-column align="center" prop="供应商信息.说明" label="说明" width="160" />
              </el-table-column>
            </el-table>
          </el-row>
        </el-form-item>
        <!--备注信息-->
        <el-form-item class="other-note">
          <div class="other-note-title">采购单备注</div>
          <el-input
            v-model="form.otherNote"
            type="textarea"
            :sapn="24"
            :rows="5"
            placeholder="采购单相关备注信息"
            :disabled="true"
          />
        </el-form-item>
        <el-form-item style="text-align:right;">
          <el-button type="primary" plain @click="onSubmit()">添加入库</el-button>
          <el-button type="danger" plain @click="onCancel()">取消请求</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import {
  generate_enter_inventory_by_purchase_note,
  filter_purchase_note,
  inventory_change_via_operation,
  edit_purchase_note_by_id
} from '@/api/warehouseProcurement'
import { isEmpty } from '@/utils/index'
export default {
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
      purchase_note_options: [], // 用于自动补全的选项
      purchase_note_radio_selection: '', // 用于物料的选择
      // 用于条件查询物料
      purchase_note_filter_condition: {
        number: null
      },
      form: {
        purchaseNoteId: null,
        purchaseNoteStatus: null,
        purchaseNoteTime: null,
        otherNote: null
      },
      materialTableData: [],
      tempPurchaseNoteData: {},
      show: false
    }
  },
  computed: {
    ...mapGetters(['物料的标签'])
  },
  watch: {
    dialogVisible: function(newVal, oldVal) {
      this.show = newVal
    },
    // 选择了相应的采购单后
    purchase_note_radio_selection: function(newVal, oldVal) {
      if (!isEmpty(newVal)) {
        var post_data = {
          login_token: this.$store.getters.token,
          采购单编号: newVal['采购单编号']
        }
        this.generateEnterInventoryByPurchaseNote(post_data)
      }
    },
    show(newVal, oldVal) {
      if (!newVal) {
        this.onClose(this.show, true)
      }
    }
  },
  methods: {
    // 提交根据采购单入库
    async onSubmit() {
      if (this.form.purchaseNoteStatus === '完成') {
        this.$message({
          type: 'warning',
          message: '已完成的采购单不可再次入库！'
        })
        return
      }
      // 2.添加入库或者出库事件
      var 物料变更列表 = []
      for (var i = 0; i < this.materialTableData.length; i++) {
        const element = this.materialTableData[i]
        var 物料变更列表元素 = {
          unique_id: element.unique_id,
          物料编号: element.物料编号,
          tags: element.tags,
          该物料变更数量: Number(element.该物料变更数量),
          单位: element.单位,
          供应商信息: element.供应商信息
        }
        物料变更列表.push(物料变更列表元素)
      }

      var inventory_post_data = {
        login_token: this.$store.getters.token,
        事件类型: '入库',
        物料变更列表: 物料变更列表,
        关联采购单: {
          unique_id: this.form.purchaseNoteId,
          采购单编号: this.form.purchaseNoteId,
          采购单日期: this.form.purchaseNoteTime
        }
      }

      // 入库事件
      await inventory_change_via_operation(inventory_post_data)
      // 把采购单设置为完成
      var purchase_note_post_data = {
        login_token: this.$store.getters.token,
        unique_id: this.tempPurchaseNoteData['采购单unique_id'],
        update_data: {
          采购单状态: '完成'
        }
      }
      await edit_purchase_note_by_id(purchase_note_post_data)
      this.$message({
        type: 'success',
        message: '该采购单物料入库操作已成功记录'
      })
      this.onCancel()
    },
    // 查询采购单
    async filterPurchaseNote() {
      var post_data = {
        login_token: this.$store.getters.token,
        pagination: {
          page: 1,
          limit: 10
        },
        采购单状态: '等待',
        sort: { 采购单日期: -1 }
      }
      if (!isEmpty(this.purchase_note_filter_condition.number)) {
        post_data[
          '采购单编号'
        ] = this.purchase_note_filter_condition.number.trim()
      }
      const response = await filter_purchase_note(post_data)
      var data_items = []
      for (var i = 0; i < response.data.length; i++) {
        var item = response.data[i]
        item['text'] =
          '采购单编号:' + item['采购单编号'] + ' 日期:' + item['采购单日期']
        data_items.push(item)
      }
      this.purchase_note_options = data_items
    },
    // 清空查询采购单信息时的条件查询信息
    clearFilterCondition() {
      this.purchase_note_options = [] // 用于自动补全的选项
      this.purchase_note_radio_selection = null // 用于物料的选择
      // 用于条件查询物料
      this.purchase_note_filter_condition = {
        number: null
      }
      this.form = {
        purchaseNoteId: null,
        purchaseNoteStatus: null,
        purchaseNoteTime: null,
        otherNote: null
      }
      this.materialTableData = []
      this.tempPurchaseNoteData = {}
    },
    completeWatch() {
      this.show = false
    },
    onCancel() {
      this.clearFilterCondition()
      this.show = false
    },
    // 根据采购单生成入库API的输入值
    async generateEnterInventoryByPurchaseNote(post_data) {
      const response = await generate_enter_inventory_by_purchase_note(
        post_data
      )
      var purchase_note_detail = response.data
      console.log(purchase_note_detail)
      this.form.purchaseNoteStatus = purchase_note_detail['采购单状态']
      this.form.purchaseNoteTime = purchase_note_detail['采购单日期']
      this.materialTableData = purchase_note_detail['物料变更列表']
      this.form.otherNote = purchase_note_detail['采购单备注']
      this.form.purchaseNoteId = purchase_note_detail['采购单unique_id']
      this.tempPurchaseNoteData = response.data
    },
    // 当输入添加数量的时候
    whenEnterAddQuantity(row) {
      var 该物料变更数量 = row['该物料变更数量']
      if (!该物料变更数量 || Number(parseFloat(该物料变更数量)) < 0) {
        row['该物料变更数量'] = 0
      }
      row['该物料变更数量'] = Number(该物料变更数量)
    }
  }
}
</script>

<style lang="scss" scoped>
.importMaterialEventByPurchaseNoteDialogBox {
  position: relative;
  box-sizing: border-box;
  .module-a {
    .module-a-form {
      display: flex;
      align-items: flex-end;
      .item-1 {
        margin-right: 80px;
      }
      .item-2 {
        height: 40px;
      }
    }
  }

  .module-b {
    margin-bottom: 30px;
    .info-box {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      .item-1 {
        width: 100%;
        margin-bottom: 10px;
      }
      .item-2 {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        .el-radio {
          margin-right: 0px;
          margin-bottom: 10px;
        }
        .el-radio.is-bordered + .el-radio.is-bordered {
          margin-left: 0px;
        }
      }
    }
  }

  .el-form-item {
    margin-bottom: 10px;
  }
}
</style>
