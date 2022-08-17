<template>
  <div class="dashboard-editor-container">
    <div class="useintro" @click="viewUseIntro">
      <img src="@/assets/images/help.png" class="help">
    </div>
    <div v-if="whetherOrNotShownSection('人员管理')||whetherOrNotShownSection('权限管理')||whetherOrNotShownSection('财务功能')">
      <personnel-management :jump-page="jumpPage" :whether-or-not-shown-section="whetherOrNotShownSection" />
    </div>
    <div v-if="whetherOrNotShownSection('客户/订单管理')||whetherOrNotShownSection('生产排产')||whetherOrNotShownSection('生产进度管理')">
      <production-management :jump-page="jumpPage" :whether-or-not-shown-section="whetherOrNotShownSection" />
    </div>
    <div v-if="whetherOrNotShownSection('产品资料库')||whetherOrNotShownSection('工序管理')||whetherOrNotShownSection('部位管理')">
      <product-management :jump-page="jumpPage" :whether-or-not-shown-section="whetherOrNotShownSection" />
    </div>
    <div v-if="whetherOrNotShownSection('仓库物料管理')||whetherOrNotShownSection('采购管理')">
      <warehouse-management :jump-page="jumpPage" :whether-or-not-shown-section="whetherOrNotShownSection" />
    </div>
    <div v-if="whetherOrNotShownSection('供应商管理')">
      <supplier-management :jump-page="jumpPage" :whether-or-not-shown-section="whetherOrNotShownSection" />
    </div>
  </div>
</template>
<script>
import PersonnelManagement from './components/PersonnelManagement' // 人员及权限 财务 管理
import ProductionManagement from './components/ProductionManagement' // 生产管理
import ProductManagement from './components/ProductManagement' // 产品管理
import WarehouseManagement from './components/WarehouseManagement' // 仓库管理
import supplierManagement from './components/supplierManagement' // 供应商管理

export default {
  name: 'Dashboard',
  components: {
    PersonnelManagement,
    ProductionManagement,
    ProductManagement,
    WarehouseManagement,
    supplierManagement
  },
  data() {
    return {}
  },
  computed: {
  },
  created() {},
  methods: {
    // 查看指引
    viewUseIntro() {
      const { href } = this.$router.resolve({
        path: '/instructionsForuse/index'
      })
      window.open(href, '_blank')
    },
    handleSetLineChartData(type) {},
    // 子组件点击选项卡进行页面跳转
    jumpPage(url) {
      const { href } = this.$router.resolve({
        path: url
      })
      window.open(href, '_blank')
    },
    // 判断是否要显示该模块
    whetherOrNotShownSection(pageName) {
      var 页面权限 = this.$store.getters['页面权限']
      if (页面权限.includes(pageName)) {
        return true
      }
      return false
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
.useintro {
    position: fixed;
    width:130px;
    height: 40px;
    bottom: 0;
    right: 0;
    z-index: 999;
    cursor: pointer;
    img{
      width: 100%;
      height: 100%;
    }
  }
.dashboard-editor-container {
  padding: 32px;
  background-color: rgb(240, 242, 245);
}
</style>
