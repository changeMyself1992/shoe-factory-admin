<template>
  <div id="printContent">
    <el-dialog :visible.sync="show" center width="1200px">
      <div class="detail-purchase-note-dialog-box">
        <div class="title">
          查看采购单详情
        </div>
        <el-form ref="form" :model="form">
          <el-button class="no-print" type="primary" size="small" @click="printComponent()">打印</el-button>
          <div class="base-info">
            <el-form-item class="item-1" label="采购单编号:" label-width="100px">
              <el-input v-model.trim="form.purchaseNoteId" placeholder :disabled="true" />
            </el-form-item>

            <el-form-item class="item-2" label="采购单时间:" label-width="110px">
              <el-date-picker
                v-model.trim="form.purchaseNoteTime"
                type="date"
                placeholder="今日时间"
                :disabled="true"
              />
            </el-form-item>
          </div>

          <el-table class="table" :data="form.materialTableData" border>
            <el-table-column align="center" prop="物料编号" label="物料编号" width="100" />

            <el-table-column
              v-for="tag_name in 物料的标签"
              :key="tag_name"
              :label="tag_name"
              align="center"
              width="80"
            >
              <template slot-scope="scope_a">
                <span>{{ scope_a.row.tags[tag_name] }}</span>
              </template>
            </el-table-column>

            <el-table-column align="center" prop="仓库剩余数量" label="仓库剩余数量" width="60" />
            <el-table-column align="center" prop="单位" label="单位" width="40" />

            <el-table-column align="center" prop="供应商信息" label="供应商信息">
              <el-table-column align="center" prop="供应商信息.名称" label="供应商名称" />
              <el-table-column align="center" prop="供应商信息.供应商价格" label="供应商价格" />
              <el-table-column align="center" prop="供应商信息.供应商物料名称" label="供应商物料名称" />
              <el-table-column align="center" prop="供应商信息.仓库剩余数量" label="该批次仓库剩余数量">
                <template slot-scope="scope">
                  <span>{{ scope.row['供应商信息']['仓库剩余数量'] }}</span>
                  <span>{{ scope.row['单位'] }}</span>
                </template>
              </el-table-column>
              <el-table-column align="center" prop="供应商信息.说明" label="说明" width="150" />
            </el-table-column>

            <el-table-column align="center" prop="目标购买数量" label="目标购买数量" width="65" />
            <el-table-column align="center" prop="总价格" label="总价格" width="80">
              <template slot-scope="scope">
                <span>{{ scope.row['总价格'] }}</span>
                <span>元</span>
              </template>
            </el-table-column>
          </el-table>

          <!--备注信息-->
          <el-form-item class="other-note" label="备注">
            <el-input v-model="form.comment" type="textarea" :sapn="24" :rows="2" placeholder disabled />
          </el-form-item>
        </el-form>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import request from '@/utils/request'
import $ from 'jquery'
export default {
  props: {
    dialogVisible: Boolean,
    onClose: {
      required: true,
      validator: function(value) {
        return true
      }
    },
    clickPurchaseNoteUniqueId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      form: {
        purchaseNoteId: '',
        purchaseNoteTime: '',
        materialTableData: [],
        relatedOrderIds: [],
        comment: ''
      },

      show: false
    }
  },
  computed: {
    ...mapGetters(['物料的标签', '订单的标签', '产品的标签'])
  },
  watch: {
    dialogVisible: function(newVal, oldVal) {
      this.show = newVal
      if (newVal && !oldVal) {
        this.getPurchaseNoteDeails()
      }
    },
    show: function(newVal, oldVal) {
      if (!newVal) {
        this.onClose(this.show)
      }
    }
  },
  methods: {
    // 将选中的物料添加到物料列表
    getPurchaseNoteDeails() {
      var post_data = {
        login_token: this.$store.getters.token,
        unique_id: this.clickPurchaseNoteUniqueId
      }

      // 调用api
      request({
        url: 'warehouse/get_purchase_note_by_id',
        method: 'post',
        data: post_data
      })
        .then(response => {
          // 成功接收到数据
          if (response.status === 'OK') {
            console.log(response.data)
            this.form = {
              purchaseNoteId: response.data['采购单编号'],
              purchaseNoteTime: response.data['采购单日期'],
              relatedOrderIds: response.data['关联订单列表'],
              comment: response.data['备注']
            }
            var material_list = []
            for (var i = 0; i < response.data['物料列表'].length; i++) {
              var material_item = response.data['物料列表'][i]
              material_item['仓库剩余数量'] = Number(
                parseFloat(material_item['仓库剩余数量']).toFixed(2)
              )
              material_item['目标购买数量'] = Number(
                parseFloat(material_item['目标购买数量']).toFixed(2)
              )
              material_item['总价格'] = Number(
                material_item['目标购买数量'] *
                  parseFloat(material_item['供应商信息']['供应商价格']).toFixed(
                    2
                  )
              )
              material_list.push(material_item)
            }
            this.form['materialTableData'] = material_list
          }
        })
        .catch(error => {
          console.log(error)
        })
    },

    // 打印组件
    printComponent() {
      $('#printContent').print({
        globalStyles: true,
        mediaPrint: false,
        stylesheet: null,
        noPrintSelector: '.no-print',
        iframe: true,
        append: null,
        prepend: null,
        manuallyCopyFormValues: true,
        deferred: $.Deferred(),
        timeout: 750,
        title: null, // 谷歌不支持 ie支持
        doctype: '<!doctype html>'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.detail-purchase-note-dialog-box {
  .title{
    text-align: center;
    font-size: 24px;
    font-weight: 700;
  }
  .base-info {
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px;
    .item-1 {
      width: 25%;
    }
    .ITEM-2 {
      width: 25%;
    }
  }
  .table {
    width: 100%;
  }
}
</style>
