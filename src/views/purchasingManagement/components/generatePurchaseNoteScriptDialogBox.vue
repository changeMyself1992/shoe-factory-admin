<template>
  <div class="app-container">
    <el-dialog :visible.sync="show" title="根据生产单生成采购单详情" center>
      <el-form ref="form" :model="form">
        <!-- 基本信息 -->
        <el-form-item class="base-info">
          <el-row>
            <el-col :span="24">
              <div>采购单基本信息</div>
            </el-col>
          </el-row>

          <el-row class="row-1">
            <el-col :span="8">
              <el-form-item label="采购单编号:" label-width="90px">
                <el-input v-model.trim="form.purchaseNoteId" :disabled="true" placeholder="自动生成" />
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="采购单时间:" label-width="95px">
                <el-date-picker v-model.trim="form.purchaseNoteTime" type="date" placeholder="今日时间" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="24">
              <div>
                <strong>采购物料清单</strong>
                <el-button type="primary" size="mini" @click="addPurchaseNote()">+ / - 添加及删除采购物料</el-button>
              </div>
            </el-col>
          </el-row>
          <el-row class="row-1">
            <el-table :data="materialTableData" border>
              <el-table-column align="center" label="物料编号">
                <template slot-scope="scope">
                  <el-input v-model.trim="scope.row.materialId" />
                </template>
              </el-table-column>
              <el-table-column align="center" prop="materialName" label="物料名称" />
              <el-table-column align="center" prop="materialColor" label="物料颜色" />
              <el-table-column align="center" prop="materialAmount" label="在库数量" />
              <el-table-column align="center" label="采购数量">
                <template slot-scope="scope">
                  <el-input v-model.trim="scope.row.materialPurchaseAmount" />
                </template>
              </el-table-column>
              <el-table-column
                align="center"
                prop="materialUnit"
                :disabled="true"
                label="单位"
                width="50"
              />
              <el-table-column align="center" label="操作" width="60">
                <template slot-scope="scope">
                  <el-button type="danger" size="mini" @click="handleDelete(scope.row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-row>
        </el-form-item>
        <!--备注信息-->
        <el-form-item class="other-note">
          <div class="other-note-title">备注</div>
          <el-input
            v-model="form.otherNote"
            type="textarea"
            :sapn="24"
            :rows="5"
            placeholder="采购单相关备注信息"
          />
        </el-form-item>
        <!--生产单信息-->
        <el-form-item class="other-note">
          <div class="other-note-title">对应生产单详细情况</div>
          <el-table class="table" :data="productNoteTableData">
            <el-table-column align="center" prop="orderId" label="订单编号" />
            <el-table-column align="center" prop="productNoteId" label="生产单编号" />
            <el-table-column align="center" prop="productId" label="产品编号" />
            <el-table-column align="center" prop="productName" label="产品名称" />
            <el-table-column align="center" prop="needProductAmount" label="待生产数量" />
            <el-table-column align="center" prop="orderUpdateTime" label="订单交付日期" />
            <el-table-column align="center" prop="productEndTime" label="生产结束日期" />
          </el-table>
        </el-form-item>
        <el-form-item style="text-align:right;">
          <el-button type="primary" @click="onSubmit">生成采购单</el-button>
          <el-button type="danger" @click="onSubmit">清空表单</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
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
      form: {
        purchaseNoteId: null,
        purchaseNoteTime: null,
        productNoteTableData: [],
        otherNote: null
      },
      materialTableData: [],
      productNoteTableData: [],
      show: false
    }
  },
  computed: {},
  watch: {
    dialogVisible: function(newVal, oldVal) {
      this.show = newVal
    },
    show(newVal, oldVal) {
      if (!newVal) {
        this.onClose(this.show)
      }
    }
  },
  methods: {
    onSubmit() {
      console.log('submit!')
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  position: relative;
  box-sizing: border-box;
  .base-info {
    .row-1 {
      margin-bottom: 10px;
      .el-col {
        padding-right: 10px;
      }
      :last-child {
        padding-right: 0px;
      }
    }
    .row-2 {
      margin-bottom: 10px;
      .mobile-num {
        padding-right: 40px;
      }
    }
  }
  .provider-info {
    .row-1 {
      margin-bottom: 10px;
      .el-col {
        padding-right: 10px;
      }
      :last-child {
        padding-right: 0px;
      }
    }
  }
  .other-file {
  }

  .el-form-item {
    margin-bottom: 10px;
  }
  .avatar-uploader {
    width: 100px;
    height: 100px;
    margin: 0 auto;
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    text-align: center;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    .avatar-uploader-icon {
      font-size: 28px;
      color: #8c939d;
      width: 100%;
      height: 100%;
      line-height: 100px;
      text-align: center;
      position: relative;
    }
    .avatar {
      width: 100%;
      display: block;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
    .des {
      display: block;
      position: absolute;
      width: 100%;
      top: 80%;
      left: 50%;
      font-size: 12px;
      color: #8c939d;
      transform: translate(-50%, -50%);
    }
  }
  .avatar-uploader:hover {
    border-color: #409eff;
  }
  .text {
    font-size: 12px;
    text-align: center;
    display: inline-block;
    width: 100%;
    height: 20px;
    line-height: 20px;
  }
}
</style>
