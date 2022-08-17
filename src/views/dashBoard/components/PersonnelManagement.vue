<template>
  <el-row :gutter="30" class="panel-group">
    <el-breadcrumb separator="/" class="breadcrumb-top">
      <el-breadcrumb-item>
        <span>
          <svg-icon icon-class="renyuan" class-name="card-panel-icon" />
        </span>
        人员管理
      </el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>财务管理</el-breadcrumb-item>
    </el-breadcrumb>

    <el-col v-if="whetherOrNotShownSection('人员管理')" :xs="6" :sm="5" :md="4" :lg="3" class="card-panel-col">
      <div style="height:100%;" @click="jumpPage('/userManagement/index')">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper icon-success">
            <svg-icon icon-class="renyuan" class-name="card-panel-icon" />
            <span class="card-panel-text">人员管理</span>
          </div>
        </div>
      </div>
    </el-col>

    <el-col v-if="whetherOrNotShownSection('权限管理')" :xs="6" :sm="5" :md="4" :lg="3" class="card-panel-col">
      <div style="height:100%;" @click="jumpPage('/rightsManagement/index')">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper icon-success">
            <svg-icon icon-class="quanxian" class-name="card-panel-icon" />
            <span class="card-panel-text">权限管理</span>
          </div>
        </div>
      </div>
    </el-col>

    <el-col v-if="whetherOrNotShownSection('员工工资')" :xs="6" :sm="5" :md="4" :lg="3" class="card-panel-col">
      <div style="height:100%;" @click="jumpPage('/financialFunctions/salarySettle')">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper icon-success">
            <svg-icon icon-class="yggz" class-name="card-panel-icon" />
            <span class="card-panel-text">员工工资</span>
          </div>
        </div>
      </div>
    </el-col>

    <el-col v-if="whetherOrNotShownSection('订单结算')" :xs="6" :sm="5" :md="4" :lg="3" class="card-panel-col">
      <div style="height:100%;" @click="jumpPage('/financialFunctions/orderSettle')">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper icon-success">
            <svg-icon icon-class="gysdz" class-name="card-panel-icon" />
            <span class="card-panel-text">订单结算</span>
          </div>
        </div>
      </div>
    </el-col>

    <el-col v-if="whetherOrNotShownSection('供应商流水单')" :xs="6" :sm="5" :md="4" :lg="3" class="card-panel-col">
      <div style="height:100%;" @click="jumpPage('/financialFunctions/supplierDeliveryNote')">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper icon-success">
            <svg-icon icon-class="gyslsd" class-name="card-panel-icon" />
            <span class="card-panel-text">供应商流水单</span>
          </div>
        </div>
      </div>
    </el-col>
  </el-row>
</template>

<script>
export default {
  components: {},
  props: {
    jumpPage: {
      type: Function,
      default: null
    },
    whetherOrNotShownSection: {
      type: Function,
      default: null
    }
  },
  data() {
    return {}
  },
  computed: {
  },
  methods: {
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.panel-group {
  font-weight: 700;
  background-color: rgb(253, 249, 249);
  margin-bottom: 30px;
  .breadcrumb-top {
    height: 70px;
    background-color: #fff;
    line-height: 70px;
    padding-left: 10px;
    span {
      .card-panel-icon {
        color: black;
        font-weight: 700;
        font-size: 20px;
      }
    }
  }
  .card-panel-col {
    height: 130px;
    .card-panel {
      height: 100%;
      cursor: pointer;
      font-size: 12px;
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      &:hover {
        .card-panel-icon-wrapper {
          color: #fff;
        }
        .icon-success {
          background: #40c9c6;
        }
      }
      .icon-success {
        color: #40c9c6;
      }
      .card-panel-icon-wrapper {
        padding: 10px;
        transition: all 0.38s ease-out;
        border-radius: 6px;
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        height: 100px;
        .card-panel-icon {
          font-size: 48px;
          width: 100%;
        }
        .card-panel-text {
          width: 100%;
          height: 22px;
          line-height: 28px;
          text-align: center;
          color: black;
        }
      }
    }
  }
}
</style>
