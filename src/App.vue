<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import { isEmpty } from '@/utils'
export default {
  name: 'App',
  data() {
    return {
      reload: false // 是否要刷新页面
    }
  },
  created: function() {
    const that = this
    // 在这我们需要监听缓存（多个页面 想保持vuex的状态一致）
    window.addEventListener('storage', function(e) {
      if (that.isIE()) return
      if (isEmpty(e.key)) return
      console.log('监听到缓存发生改变！')
      console.log(e.key)
      if (e.key === '配码数组') {
        that.$store.dispatch('updateSizeConfigInfo')
      } else if (e.key === '生产单打印配置信息') {
        that.$store.dispatch('updateProductionNotePrintConfigInfo')
      } else if (e.key === '物料的标签') {
        that.$store.dispatch('updateMaterialTagName')
      } else if (e.key === '产品的标签') {
        that.$store.dispatch('updateProductTagName')
      } else if (e.key === '订单的标签') {
        that.$store.dispatch('updateOrderTagName')
      } else if (e.key === '供应商的标签') {
        that.$store.dispatch('updateSupplierTagName')
      } else if (e.key === 'theFullValueOfTheOrderLabel') {
        that.$store.dispatch(
          'updateAllLabelValuesCorrespondingToTheLabelNameOfTheOrderLabel'
        )
      } else if (e.key === 'allOptionsForEachLabelOfTheProduct') {
        that.$store.dispatch(
          'updateAllLabelValuesCorrespondingToTheLabelNameOfTheProductLabel'
        )
      } else if (e.key === '待审核员工数') {
        that.$store.dispatch('updateApplyUser')
      } else if (e.key === '待确认送货数') {
        that.$store.dispatch('updateToBeConfirmedSupplierTransactions')
      } else if (e.key === '待确认员工计件数') {
        that.$store.dispatch('updateUnconfirmedStaffRecord')
      } else {
        // 如果是别的缓存发生了改变 那么应该让该标签页失效。。任何页面都不能让他跳转
        that.$store.dispatch('setEnterpriseUniqueId')
      }
    })
  },
  methods: {
    isIE() {
      // 是否为ie浏览器?
      if (window.ActiveXObject || 'ActiveXObject' in window) {
        return true
      } else {
        return false
      }
    }
  }
}
</script>
<style lang="scss">
.blue {
  color: blue;
}
// .el-dropdown-menu__item{
//   width: 350px;
// }
.useintro {
  position: fixed;
  width: 109px;
  height: 33px;
  bottom: 0;
  right: 0;
  z-index: 999;
  cursor: pointer;
  img {
    width: 100%;
    height: 100%;
  }
}
.yrz {
  color: #409eff;
}
.wrz {
  color: rgb(246, 190, 66);
}
</style>
<style>
/* 让elementui表格 不满的时候不要有空隙 111111111*/
body .el-table th.gutter {
  display: table-cell !important;
}
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}
input[type="number"] {
  -moz-appearance: textfield;
}
/* 让elementui表格 不满的时候不要有空隙 111111111*/

.el-form-item__label {
  padding: 0 10px 0 0;
}
.el-form-item {
  margin-bottom: 20px;
}

.el-form-item__content {
  line-height: none;
}
.el-date-editor.el-input,
.el-date-editor.el-input__inner {
  width: 100%;
}
/*客户觉得禁用状态下看不清 微调下*/
.el-input.is-disabled .el-input__inner {
  background-color: #f5f7fa;
  border-color: #e4e7ed;
  color: #06258b;
  font-weight: 700;
  cursor: not-allowed;
}
.el-textarea.is-disabled .el-textarea__inner {
  background-color: #f5f7fa;
  border-color: #e4e7ed;
  color: #06258b;
  font-weight: 700;
  cursor: not-allowed;
}
/**表格高度稍微低一点*/
.el-table td,
.el-table th {
  padding: 5px 0;
}

#app .el-upload-list--picture .el-upload-list__item-thumbnail {
  height: auto;
}
#app .el-upload-list--picture .el-upload-list__item {
  height: auto;
}
#app
  .el-upload-list--picture
  .el-upload-list__item.is-success
  .el-upload-list__item-name {
  line-height: auto;
  margin-top: none;
}
/**滚动条 样式的修改*******start*/
/* 滚动条的宽度 */
::-webkit-scrollbar {
  width: 25px;
  height: 25px;
  position: fixed;
  top: 0px;
}
/* 滚动条的滑块 */
::-webkit-scrollbar-thumb {
  background-color: #a1a3a9;
  border-radius: 3px;
  position: fixed;
  top: 0px;
}
/**滚动条 样式的修改*******end*/

.avatar-disabled {
  background-color: #f5f7fa;
}

.el-dropdown-menu__item {
  white-space: nowrap;
}
</style>

