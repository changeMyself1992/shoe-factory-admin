<template>
  <!--查看修改出库和入库事件对话框-->
  <div class="edit-import-material-event-dialog-box">
    <el-dialog :visible.sync="show" :title="calculateTitle" center width="900px">
      <el-form ref="form" :model="form">
        <!-- 基本信息 -->
        <div class="module-a">
          <div class="header">
            <b>物料基本信息</b>
          </div>

          <div class="info-box">
            <el-form-item
              v-for="(value,name) in form.materialTags"
              :key="name"
              class="item-0"
              :label="name"
            >
              <el-input v-model.trim="form.materialTags[name]" :disabled="true" />
            </el-form-item>

            <el-form-item class="item-1" prop="materialId" label="物料编号:" label-width="80px">
              <el-input v-model.trim="form.materialId" :disabled="true" placeholder="物料编号" />
            </el-form-item>

            <el-form-item class="item-2" prop="materialUnit" label="单位:" label-width="55px">
              <el-input v-model.trim="form.materialUnit" :disabled="true" placeholder="单位" />
            </el-form-item>
          </div>
        </div>

        <!-- 仓库信息 -->
        <div class="module-a">
          <div class="header">
            <b>{{ warehouseInformation }}</b>
          </div>

          <div class="info-box">
            <el-form-item
              class="item-1"
              prop="materialAmountBeforeExport"
              :label="quantityBeforeDeliveryOrStorage"
              label-width="95px"
            >
              <el-input
                v-if="openMode==='putInStorage'"
                v-model.trim="form.materialAmountBeforeImport"
                disabled
              />
              <el-input
                v-if="openMode==='outbound'"
                v-model.trim="form.materialAmountBeforeExport"
                disabled
              />
            </el-form-item>

            <el-form-item
              class="item-1"
              :label="getOrAddQuantity"
              label-width="80px"
            >
              <el-input
                v-if="openMode==='putInStorage'"
                v-model.trim="form.materialAmountImport"
                disabled
              />
              <el-input v-if="openMode==='outbound'" v-model.trim="form.materialAmountExport" disabled />
            </el-form-item>

            <el-form-item
              class="item-1"
              :label="outOrInStorageTime"
              label-width="80px"
            >
              <el-date-picker
                v-if="openMode==='putInStorage'"
                v-model.trim="form.materialImportTime"
                :disabled="true"
                type="date"
              />
              <el-date-picker
                v-if="openMode==='outbound'"
                v-model.trim="form.materialExportTime"
                :disabled="true"
                type="date"
              />
            </el-form-item>
          </div>
        </div>

        <!--备注信息-->
        <!-- <el-form-item class="other-note" prop="otherNote" label="备注:">
          <el-input
            v-model="form.otherNote"
            type="textarea"
            :sapn="24"
            :rows="5"
            :placeholder="note"
          />
        </el-form-item> -->

        <el-form-item style="text-align:right;">
          <el-button type="primary" plain @click="onCancel">完成查看</el-button>
          <!-- <el-button
            v-if="openMode==='putInStorage'"
            type="danger"
            plain
            @click="onModifyInboundEvents"
          >确认修改</el-button>
          <el-button
            v-if="openMode==='outbound'"
            type="danger"
            plain
            @click="onModifyTheOutboundEvent"
          >确认修改</el-button> -->
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import {
  delete_warehouse_material_event_by_id,
  inventory_change_via_operation
} from '@/api/warehouseProcurement'
export default {
  props: {
    dialogVisible: Boolean,
    onClose: {
      required: true,
      validator: function(value) {
        return true
      }
    },
    curOperationDetailInfo: {
      type: Object,
      // 对象或数组默认值必须从一个工厂函数获取
      default: function() {
        return {}
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
      form: {},
      show: false,
      refresh_flag: false
    }
  },
  computed: {
    calculateTitle: function() {
      if (this.openMode === 'putInStorage') return '查看入库事件'
      else if (this.openMode === 'outbound') return '查看出库事件'
      return ''
    },
    warehouseInformation: function() {
      if (this.openMode === 'putInStorage') return '入库信息'
      else if (this.openMode === 'outbound') return '出库信息'
      return ''
    },
    quantityBeforeDeliveryOrStorage: function() {
      if (this.openMode === 'putInStorage') return '入库前数量:'
      else if (this.openMode === 'outbound') return '出库前数量:'
      return ''
    },
    getOrAddQuantity: function() {
      if (this.openMode === 'putInStorage') return '添加数量:'
      else if (this.openMode === 'outbound') return '领取数量:'
      return ''
    },
    outOrInStorageTime: function() {
      if (this.openMode === 'putInStorage') return '入库时间:'
      else if (this.openMode === 'outbound') return '出库时间:'
      return ''
    }
    // note: function() {
    //   if (this.openMode === 'putInStorage') return '物料入库备注信息'
    //   else if (this.openMode === 'outbound') return '物料出库备注信息'
    //   return ''
    // }
  },
  watch: {
    dialogVisible: function(newVal, oldVal) {
      this.show = newVal
    },
    curOperationDetailInfo: function(newVal, oldVal) {
      this.form = newVal
    },
    show(newVal, oldVal) {
      if (!newVal) {
        this.onClose(this.show, this.refresh_flag)
        this.refresh_flag = false
      }
    }
  },
  mounted() {
  },
  methods: {
    // 修改入库事件
    async onModifyInboundEvents() {
      if (!confirm('这个操作会永久的改变记录，你确定要进行修改操作吗？')) { return false }
      var login_token = this.$store.getters.token
      // 1.先删除该事件
      var post_data_a = {
        login_token: this.$store.getters.token,
        unique_id: this.form.materialImportTime
      }
      await delete_warehouse_material_event_by_id(post_data_a)
      // 2.添加入库事件
      var post_data_b = {
        login_token: login_token,
        事件类型: '入库',
        物料变更列表: [
          {
            unique_id: this.form.materialId,
            物料编号: this.form.materialId,
            改变量: parseFloat(this.form.materialAmountImport)
          }
        ],
        备注: this.form.otherNote
      }
      await inventory_change_via_operation(post_data_b)
      this.$message({
        type: 'success',
        message: '该物料入库操作已成功记录'
      })
      this.onCancel()
    },
    // 修改出库事件
    async onModifyTheOutboundEvent() {
      if (!confirm('这个操作会永久的改变记录，你确定要进行修改操作吗？')) return false
      const post_data_a = {
        login_token: this.$store.getters.token,
        unique_id: this.form.materialExportTime
      }
      // 1.先删除该事件
      await delete_warehouse_material_event_by_id(post_data_a)

      // 2.添加出库事件
      var post_data_b = {
        login_token: this.$store.getters.token,
        事件类型: '出库',
        物料变更列表: [
          {
            unique_id: this.form.materialUniqueId,
            物料编号: this.form.materialId,
            改变量: parseFloat(this.form.materialAmountExport)
          }
        ],
        备注: this.form.otherNote
      }
      await inventory_change_via_operation(post_data_b)
      this.$message({
        type: 'success',
        message: '该物料出库操作已成功记录'
      })
      this.refresh_flag = true
      this.show = false
    },
    onCancel() {
      this.show = false
    }
  }
}
</script>

<style lang="scss" scoped>
.edit-import-material-event-dialog-box {
  padding: 10px;
  .module-a {
    margin-bottom: 20px;
    border: 1px solid #bbbbbb;
    .header {
      padding: 0 10px;
      height: 40px;
      line-height: 40px;
      border-bottom: 1px solid #bbbbbb;
    }
    .info-box {
      padding: 20px 10px 0px 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
    }
  }
  .module-a {
    .header {
    }
    .info-box {
      .item-1 {
        width: 250px;
      }
      .item-2 {
        width: 200px;
      }
      .item-3 {
        width: 150px;
      }
      .item-4 {
        width: 150px;
      }
    }
  }
}
</style>
