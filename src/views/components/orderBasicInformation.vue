<template>
  <!-- 订单基本信息展示组件 -->
  <div class="order-basic-information">

    <div v-if="whetherToShowTheTitle" class="title">
      <b>订单基本信息</b>
    </div>

    <div v-if="orderInfo" class="info-box">
      <div class="tags">
        <el-form-item
          v-for="(value, name) in orderInfo.tags"
          :key="name"
          class="item-0"
          :label="name"
        >
          <el-input v-model.trim="orderInfo.tags[name]" placeholder="单行输入" disabled />
        </el-form-item>
      </div>

      <el-form-item class="item-1" label="订单编号:" label-width="80px">
        <el-input v-model.trim="orderInfo.订单编号" placeholder="单行输入" disabled />
      </el-form-item>

      <el-form-item
        v-if="orderInfo&&orderInfo.客户信息 &&orderInfo.客户信息.名称"
        class="item-2"
        label="客户信息:"
        label-width="80px"
      >
        <el-input v-model.trim="orderInfo.客户信息.名称" placeholder="单行输入" disabled />
      </el-form-item>

      <el-form-item class="item-3" label="订单日期:" label-width="80px">
        <el-input v-model.trim="orderInfo.订单日期" placeholder="单行输入" disabled />
      </el-form-item>

      <el-form-item class="item-4" label="交货日期:" label-width="80px">
        <el-input v-model.trim="orderInfo.交货日期" placeholder="单行输入" disabled />
      </el-form-item>

      <el-form-item class="item-5" label="订单备注:" label-width="80px">
        <el-input
          v-model="orderInfo.订单备注"
          type="textarea"
          placeholder="五"
          maxlength="30"
          show-word-limit
          disabled
        />
      </el-form-item>
    </div>

  </div>
</template>

<script>
export default {
  props: {
    // 父组件传递过来的订单信息 必须的
    orderInfo: {
      type: Object,
      required: true,
      default: function() {
        return null
      }
    },
    // 是否展示标题
    whetherToShowTheTitle: {
      type: Boolean,
      default: function() {
        return true
      }
    }
  },
  data() {
    return {
      correspondsToTheOrder: {}
    }
  },
  computed: {},
  watch: {
    // orderInfo: function(newVal, oldVal) {
    //   if (newVal && !oldVal) {
    //     this.correspondsToTheOrder = this.orderInfo
    //   }
    // }
  },
  created() {

  },
  mounted() {},
  methods: {}
}
</script>

<style lang="scss" scoped>
.order-basic-information {
    .title {
      padding: 0 10px;
      height: 40px;
      line-height: 40px;
    }
    .info-box {
      border: 1px solid #bbbbbb;
      padding: 10px 10px 0 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      .tags {
        width: 100%;
        display: flex;
        justify-content: space-between;
        .item-0 {
          width: 155.6px;
          margin-bottom: 10px;
        }
      }
      .item-1,
      .item-3,
      .item-4 {
        width: 220px;
        margin-bottom: 10px;
      }
      .item-2{
        width: 300px;
        margin-bottom: 10px;
      }
      .item-5 {
        width: 70%;
        margin-bottom: 10px;
      }
    }

}
</style>

