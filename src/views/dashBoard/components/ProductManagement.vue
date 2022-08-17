<template>
  <el-row :gutter="30" class="panel-group">
    <el-breadcrumb separator="/" class="breadcrumb-top">
      <el-breadcrumb-item>
        <span>
          <svg-icon icon-class="ziliaoku" class-name="card-panel-icon" />
        </span>
        产品库
      </el-breadcrumb-item>
      <el-breadcrumb-item>工艺维护</el-breadcrumb-item>
      <el-breadcrumb-item>部位维护</el-breadcrumb-item>
    </el-breadcrumb>

    <el-col v-if="whetherOrNotShownSection('产品资料库')" :xs="6" :sm="5" :md="4" :lg="3" class="card-panel-col">
      <div style="height:100%;" @click="jumpPage('/productManagement/ProductDatabase')">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper icon-success">
            <svg-icon icon-class="ziliaoku" class-name="card-panel-icon" />
            <div class="card-panel-text">产品资料库</div>
          </div>
        </div>
      </div>
    </el-col>

    <el-col v-if="whetherOrNotShownSection('工序管理')" :xs="6" :sm="5" :md="4" :lg="3" class="card-panel-col">
      <div style="height:100%;" @click="jumpPage('/craftManagement/craftDatabase')">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper icon-success">
            <svg-icon icon-class="xianlu" class-name="card-panel-icon" />
            <div class="card-panel-text">工序管理</div>
          </div>
        </div>
      </div>
    </el-col>

    <el-col v-if="whetherOrNotShownSection('部位管理')" :xs="6" :sm="5" :md="4" :lg="3" class="card-panel-col">
      <div style="height:100%;" @click="jumpPage('/componentManagement/componentDatabase')">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper icon-success">
            <svg-icon icon-class="bwgl" class-name="card-panel-icon" />
            <div class="card-panel-text">部位管理</div>
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
  methods: {}
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
