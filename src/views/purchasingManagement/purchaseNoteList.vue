<template>
  <div class="purchase-note-list">
    <div class="useintro">
      <el-dropdown :show-timeout="0" @command="handleCommand">
        <img src="@/assets/images/help.png" class="help">
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="a">如何查看和删除一个采购单？</el-dropdown-item>
          <el-dropdown-item command="b">如何理解采购单的等待和完成两种状态？</el-dropdown-item>
          <el-dropdown-item command="c" class="blue">更多问题，请访问帮助中心</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <div class="base-info">
      <div class="header" align="left">
        <strong>条件查询</strong>
      </div>
      <el-form ref="form" class="info-box" :model="form" label-position="left">
        <el-form-item class="item-1" label="采购单编号:" label-width="90px">
          <el-input v-model.trim="form.采购单编号" placeholder="采购单编号" />
        </el-form-item>

        <el-form-item class="item-2" label="订单编号:" label-width="75px">
          <el-input v-model.trim="form.关联订单编号" placeholder="关联订单编号" />
        </el-form-item>

        <el-form-item class="item-3" label="生产单编号:" label-width="90px">
          <el-input v-model.trim="form.关联生产单编号" placeholder="关联生产单编号" />
        </el-form-item>

        <el-form-item class="item-4" label="采购单时间:" label-width="90px">
          <el-date-picker
            v-model.trim="form.purchaseNoteTimeQuantum"
            class="picker"
            type="daterange"
            unlink-panels
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>

        <el-form-item class="item-5" prop="采购单状态" label="采购单状态:" label-width="90px">
          <!-- <el-radio v-model.trim="form.采购单状态" label="等待">等待</el-radio> -->
          <!-- <el-radio v-model.trim="form.采购单状态" label="完成">完成</el-radio> -->
          <!-- <el-radio v-model.trim="form.采购单状态" label="作废">作废</el-radio> -->
          <el-checkbox-group v-model.trim="form.采购单状态">
            <el-checkbox label="等待">等待</el-checkbox>
            <el-checkbox label="完成">完成</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item class="item-6">
          <el-button type="primary" @click="handleSearch()">查询采购记录</el-button>
          <el-button type="primary" @click="clearCondition()">清空条件</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-card style="margin-bottom:5px;">
      <div class="module-c">
        <el-table :height="tableHeight" :data="purchaseNoteTableData" border>
          <el-table-column label="采购记录" align="center">
            <el-table-column align="center" prop="finishedPurchaseNoteId" label="采购单编号" />
            <el-table-column align="center" prop="finishedRelatedOrderId" label="关联订单编号" />
            <el-table-column align="center" prop="finishedNeedPurchaseMaterial" label="所需采购原料" />
            <el-table-column align="center" prop="finishedPurchaseNoteUpdateTime" label="更新时间" />
            <!-- :filters="[{ text: '等待', value: '等待' }, { text: '完成', value: '完成' }]"
              :filter-method="filterTag" -->
            <el-table-column
              align="center"
              prop="采购单状态"
              label="采购单状态"
            />
            <el-table-column align="center" label="操作" width="250">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  size="mini"
                  @click="clickPurchaseNoteDetailInfo(scope.row)"
                >查看</el-button>
                <el-button
                  v-if="scope.row.采购单状态 === '等待'"
                  type="primary"
                  size="mini"
                  :disabled="!管理权限['采购单详情可写']"
                  @click="completeInStock(scope.row)"
                >完成入库</el-button>
                <el-button
                  type="danger"
                  size="mini"
                  :disabled="!管理权限['采购单详情可写']"
                  @click="deleteFinishedPurchaseNote(scope.row)"
                >删除</el-button>
              </template>
            </el-table-column>

          </el-table-column>
        </el-table>
      </div>
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
    </el-card>

    <!--查看采购单详情对话框-->
    <detail-purchase-note-dialog-box
      :dialog-visible="DialogVisible"
      :on-close="closeDetailPurchaseNoteDialogCallback"
      :click-purchase-note-unique-id="clickPurchaseNoteUniqueId"
    />
  </div>
</template>

<script>
import { parseTime, isEmpty } from '@/utils'
import request from '@/utils/request'
import { filter_purchase_note, edit_purchase_note_by_id } from '@/api/warehouseProcurement'
import detailPurchaseNoteDialogBox from './components/detailPurchaseNoteDialogBox' // 查看修改物料对话框
import { mapGetters } from 'vuex'
export default {
  components: { detailPurchaseNoteDialogBox },
  data() {
    return {
      form: {
        采购单编号: '',
        关联订单编号: '',
        关联生产单编号: '',
        purchaseNoteTimeQuantum: [], // 采购单时间段
        采购单状态: ['等待', '完成']
      },
      // 当前页数
      currentPage: 1,
      // 总条目数
      total: 0,
      // 当前页数据量
      pageSize: 50,
      purchaseNoteTableData: [],
      DialogVisible: false,
      clickPurchaseNoteUniqueId: '',
      tableHeight: ''
    }
  },
  computed: {
    ...mapGetters([
      '管理权限'
    ])
  },

  created() {
    this.tableHeight = window.innerHeight * 0.75
    this.handleSearch()
  },
  mounted() {
  },
  methods: {
    // 查看指引
    handleCommand(command) {
      console.log(command)
      var x = null
      var y = null
      if (command === 'c') {
        const { href } = this.$router.resolve({
          path: '/instructionsForuse/index'
        })
        window.open(href, '_blank')
      } else {
        if (command === 'a') {
          x = 11
          y = 0
        } else if (command === 'b') {
          x = 11
          y = 2
        }
        var routeUrl = this.$router.resolve({
          path: '/instructionsForuse/index',
          query: {
            x: x,
            y: y
          }
        })
        window.open(routeUrl.href, '_blank')
      }
    },

    // 处理完结采购单的搜索
    async handleSearch() {
      var post_data = {
        login_token: this.$store.getters.token,
        pagination: {
          page: parseInt(this.currentPage),
          limit: parseInt(this.pageSize)
        },
        sort: { 采购单提交时间: -1 }
      }
      if (!isEmpty(this.form['采购单编号'])) {
        post_data['采购单编号'] = this.form['采购单编号'].trim()
      }
      if (!isEmpty(this.form['关联订单编号'])) {
        post_data['关联订单编号'] = this.form['关联订单编号'].trim()
      }
      if (!isEmpty(this.form['关联生产单编号'])) {
        post_data['关联生产单编号'] = this.form['关联生产单编号'].trim()
      }
      if (!isEmpty(this.form.purchaseNoteTimeQuantum)) {
        post_data['更新时间_下限'] = parseTime(this.form.purchaseNoteTimeQuantum[0])
        post_data['更新时间_上限'] = parseTime(this.form.purchaseNoteTimeQuantum[1])
      }
      if (!isEmpty(this.form.采购单状态)) {
        post_data['采购单状态'] = this.form['采购单状态']
      }

      const response = await filter_purchase_note(post_data)

      var process_items = []
      for (var i = 0; i < response.data.length; i++) {
        var purchase_note_data = response.data[i]
        var process_item = {
          finishedPurchaseNoteId: purchase_note_data['采购单编号'],
          finishedPurchaseNoteUpdateTime: purchase_note_data['采购单日期'],
          采购单状态: purchase_note_data['采购单状态']
        }

        var relatedOrderIds = []
        for (
          var j = 0;
          j < purchase_note_data['关联订单列表'].length;
          j++
        ) {
          relatedOrderIds.push(purchase_note_data['关联订单列表'][j])
        }
        process_item['finishedRelatedOrderId'] = relatedOrderIds.join(
          '; '
        )
        if (process_item['finishedRelatedOrderId'].length === 0) {
          process_item['finishedRelatedOrderId'] = '无关联订单'
        }

        var needPurchaseMaterial = []
        // eslint-disable-next-line no-redeclare
        for (var j = 0; j < purchase_note_data['物料列表'].length; j++) {
          var need_purchase_item = ''
          for (var index in this.$store.getters.物料的标签) {
            need_purchase_item = need_purchase_item + purchase_note_data['物料列表'][j].tags[this.$store.getters.物料的标签[index]] + ' '
          }
          need_purchase_item = need_purchase_item + purchase_note_data['物料列表'][j]['目标购买数量'].toFixed(2) + ' ' + purchase_note_data['物料列表'][j]['单位']
          needPurchaseMaterial.push(need_purchase_item)
        }
        process_item[
          'finishedNeedPurchaseMaterial'
        ] = needPurchaseMaterial.join('; ')
        process_item['unique_id'] = purchase_note_data['unique_id']
        process_items.push(process_item)
      }
      this.purchaseNoteTableData = process_items
      this.total = response.total_count
    },

    // 页码控制时，每页数量改变的处理函数
    handleSizeChange(val) {
      this.pageSize = val
      this.handleSearch()
    },
    // 页码控制时，每页码改变改变的处理函数
    handleCurrentChange(val) {
      this.currentPage = val
      this.handleSearch()
    },

    completePendingPurchaseNote(purchaseNoteInfo) {
      console.log(purchaseNoteInfo)
      var login_token = this.$store.getters.token
      var post_data = {
        login_token: login_token,
        unique_id: purchaseNoteInfo['unique_id']
      }

      request({
        url: 'warehouse/enter_inventory_and_finish_purchase_note',
        method: 'post',
        data: post_data
      })
        .then(response => {
          if (response.status === 'OK') {
            this.$message({
              type: 'success',
              message: '该采购单已成功完结'
            })
            // this.filterPendingPurchaseNote()
            // this.filterFinishedPurchaseNote()
            this.handleSearch()
          }
        })
        .catch(error => {
          console.log(error)
        })
    },

    // 删除按钮点击
    deletePendingPurchaseNote(purchaseNoteInfo) {
      if (!confirm('确认删除吗？')) {
        return false
      }
      var purchaseNoteUniqueId = purchaseNoteInfo['unique_id']
      var post_data = {
        login_token: this.$store.getters.token,
        unique_id: purchaseNoteUniqueId
      }
      request({
        url: 'warehouse/delete_purchase_note_by_id',
        method: 'post',
        data: post_data
      })
        .then(response => {
          if (response.status === 'OK') {
            this.$message({
              type: 'success',
              message: '该采购单已成功删除'
            })
            // this.filterPendingPurchaseNote()
            // this.filterFinishedPurchaseNote()
            this.handleSearch()
          } else {
            this.$message({
              type: 'error',
              message: response.msg
            })
          }
        })
        .catch(error => {
          console.log(error)
        })
    },

    // 删除按钮点击
    deleteFinishedPurchaseNote(purchaseNoteInfo) {
      if (
        confirm(
          '确定要删除' +
            purchaseNoteInfo.finishedPurchaseNoteId +
            '的采购单吗？'
        )
      ) {
        var purchaseNoteUniqueId = purchaseNoteInfo['unique_id']
        var post_data = {
          login_token: this.$store.getters.token,
          unique_id: purchaseNoteUniqueId
        }
        request({
          url: 'warehouse/delete_purchase_note_by_id',
          method: 'post',
          data: post_data
        })
          .then(response => {
            if (response.status === 'OK') {
              this.$message({
                type: 'success',
                message: '该采购单已成功删除'
              })
              // this.filterPendingPurchaseNote()
              this.handleSearch()
            } else {
              this.$message({
                type: 'error',
                message: response.msg
              })
            }
          })
          .catch(error => {
            console.log(error)
          })
      }
    },

    // 查看按钮点击
    clickPurchaseNoteDetailInfo(materialInfo) {
      this.clickPurchaseNoteUniqueId = materialInfo.unique_id
      this.DialogVisible = true
    },
    // 完成入库点击
    async completeInStock(purchaseNoteInfo) {
      if (!confirm('确认完成入库该采购单吗？')) {
        return false
      }
      var login_token = this.$store.getters.token
      var post_data = {
        login_token: login_token,
        unique_id: purchaseNoteInfo['unique_id'],
        update_data: { 采购单状态: '完成' }
      }
      var response = await edit_purchase_note_by_id(post_data)
      console.log(response)
      if (response.status === 'OK') {
        this.$message({
          type: 'success',
          message: response.msg
        })
      }
      this.handleSearch()
    },

    // 查看采购单对话框关闭后回调
    closeDetailPurchaseNoteDialogCallback(status) {
      this.DialogVisible = status
    },
    clearCondition() {
      this.form = {}
    },
    filterTag(value, row) {
      return row.采购单状态 === value
    }
  }
}
</script>

<style lang="scss" scoped>
.purchase-note-list {
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
      padding: 20px 10px 0px 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      .item-1,
      .item-2,
      .item-3 {
        width: 20%;
      }
      .item-4 {
        width: 480px;
      }

      .item-5 {
        width: 350px;
      }

      .item-6 {
        display: flex;
        justify-content: space-between;
      }
    }
  }
}
</style>
