<template>
  <div class="product-order-list">
    <div class="useintro">
      <el-dropdown :show-timeout="0" @command="handleCommand">
        <img src="@/assets/images/help.png" class="help">
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="a">如何对一个订单进行排产，自动生成生产单？</el-dropdown-item>
          <el-dropdown-item command="b">如何批量的打印多张生产单？</el-dropdown-item>
          <el-dropdown-item command="c">如何批量修改多个生产单的工序工资信息？</el-dropdown-item>
          <el-dropdown-item command="d" class="blue">更多问题，请访问帮助中心</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <el-collapse>
      <!-- 需要排产的订单 -->
      <el-collapse-item :title="'需要排产的订单   共'+notArrangedOrder_total+'个（点击展开/收起）'">
        <order-sheet-for-production-scheduling
          ref="orderSheetForProductionScheduling"
          :call-back-after-the-query="callBackAfterOrderQuery"
        />
      </el-collapse-item>

      <!-- 正在进行的生产单 -->
      <el-collapse-item :title="'进行中的生产单 共'+onGoingProductionNote_total+'个（点击展开/收起）'">
        <product-note-table
          ref="onGoingProductNoteTable"
          :product-note-model="'onGoing'"
          :call-back-after-the-query="callBackAfterProductNoteQuery"
          :call-back-after-the-operation="initializeTheComponentData"
        />
      </el-collapse-item>

      <!-- 最近完成的生产单 -->
      <el-collapse-item :title="'已完成的生产单 共'+finishedProductionNote_total+'个（点击展开/收起）'">
        <product-note-table
          ref="finishedProductNoteTable"
          :product-note-model="'finished'"
          :call-back-after-the-query="callBackAfterProductNoteQuery"
          :call-back-after-the-operation="initializeTheComponentData"
        />
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script>
import orderSheetForProductionScheduling from './components/orderSheetForProductionScheduling' // 需要排产的订单组件
import productNoteTable from './components/productNoteTable' // 排产单表格组件
export default {
  components: {
    orderSheetForProductionScheduling,
    productNoteTable
  },
  data() {
    return {
      // 订单总条目数
      notArrangedOrder_total: 0,
      // 正在进行的生产单总条目数
      onGoingProductionNote_total: 0,
      // 已经完成的生产单总条目数
      finishedProductionNote_total: 0
    }
  },
  computed: {
  },
  watch: {},
  created() {
  },
  mounted() {},
  methods: {
    // 查看指引
    handleCommand(command) {
      console.log(command)
      var x = null
      var y = null
      if (command === 'd') {
        const { href } = this.$router.resolve({
          path: '/instructionsForuse/index'
        })
        window.open(href, '_blank')
      } else {
        if (command === 'a') {
          x = 5
          y = 0
        } else if (command === 'b') {
          x = 5
          y = 1
        } else if (command === 'c') {
          x = 5
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

    // 初始化组件数据(子组件做了删除，强行完成的操作，调用这个方法，整个页面数据都更新一遍)
    initializeTheComponentData() {
      this.$refs.orderSheetForProductionScheduling.filterNotFinishedOrder()
      this.$refs.onGoingProductNoteTable.filterProductionNode()
      this.$refs.finishedProductNoteTable.filterProductionNode()
    },
    // 订单查询之后回调
    callBackAfterOrderQuery() {
      if (this.$refs.orderSheetForProductionScheduling) {
        this.notArrangedOrder_total = this.$refs.orderSheetForProductionScheduling.notArrangedOrder_total
      }
    },
    // 生产单查询之后回调
    callBackAfterProductNoteQuery(modul) {
      if (modul === 'onGoing' && this.$refs.onGoingProductNoteTable) {
        this.onGoingProductionNote_total = this.$refs.onGoingProductNoteTable.productionNote_total
      } else if (modul === 'finished' && this.$refs.finishedProductNoteTable) {
        this.finishedProductionNote_total = this.$refs.finishedProductNoteTable.productionNote_total
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.product-order-list {
  padding: 20px;
}
</style>

