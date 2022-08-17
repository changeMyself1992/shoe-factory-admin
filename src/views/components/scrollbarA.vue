<template>
  <div class="scrollbar-a">
    <!-- 滚动条 -->
    <div ref="out_box" :class="outBoxclassName">
      <div ref="in_box" class="in_box" :style="old_new" @mousedown="mouseDown" @mouseup="mouseUp" />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  props: {
    // 父组件ID
    parentComponentId: {
      type: String,
      default: ''
    },
    // 表格id
    tableID: {
      type: String,
      default: ''
    },
    // 页面向上滚定多少开始吸附
    adsorptionHighly: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      // 滚动条参数***********************************
      parentWidth: 0, // 父组件的宽度
      tableWidth: 0, // 表格的宽度
      slidWidth: 0, // 滑块的宽度
      moveWidth: 0, // 可移动的距离
      whetherTheMouseIsPressedDown: false, // 鼠标是否按下
      start_x: 0, // 鼠标点击的坐标(屏幕坐标)
      end_x: 0, // 鼠标停止的坐标(屏幕坐标)
      old_new: {
        // 滚动条偏移量
        left: 0
      },
      // 滚动条移动后左边的空距
      leftstr: '0px',
      // 表格document
      tableDoc: {},
      // 滚动条参数************************************
      outBoxclassName: 'out_box fixed'
    }
  },
  computed: {
    ...mapGetters(['opened'])
  },
  watch: {
    opened: function(newVal, oldVal) {
      // 监听到侧边栏状态改变也要重新初始化滚动条
      this.ifmove()
    }
  },
  created() {},
  mounted() {
    // 监听窗口变化
    window.onresize = this.ifmove
    window.onmouseup = this.mouseUp
    window.onmousemove = this.mouseMove
    // window.onscroll = this.pageScroll
    this.ifmove()
  },
  methods: {
    // 滚动条事件*************************************************************************************
    mouseDown(event) {
      this.start_x = event.clientX
      this.whetherTheMouseIsPressedDown = true
      this.leftstr = this.old_new.left
    },
    mouseMove(event) {
      if (!this.whetherTheMouseIsPressedDown) return
      // 禁止鼠标拖拽复制文字
      window.getSelection
        ? window.getSelection().removeAllRanges()
        : document.selection.empty()
      // 计算鼠标的结束位置
      this.end_x = event.clientX
      var offset_x = this.end_x - this.start_x
      // 计算可移动长度
      this.moveWidth =
        (1 - this.parentWidth / this.tableWidth) * this.parentWidth -
        parseFloat(this.leftstr)
      // 计算滚动条偏移量
      // 1.1如果偏移量小于已经移动了的左边空距，那么直接设置left为0，防止左边超出容器范围
      if (offset_x <= -parseFloat(this.leftstr)) this.old_new.left = '0px'
      // 1.2 如果偏移量大于等于右边可移动的范围，那么设置left为右边可移动的范围加上左边已移动的范围，防止右边超出容器范围
      else if (offset_x >= this.moveWidth) {
        this.old_new.left = this.moveWidth + parseFloat(this.leftstr) + 'px'
        // eslint-disable-next-line brace-style
      }
      // 1.3 正常情况下是鼠标X偏移量加上左边已经移动了的范围
      else this.old_new.left = offset_x + parseFloat(this.leftstr) + 'px'

      // 设置表格的滑动位置
      // 1.1如果偏移量小于已经移动了的左边空距，那么直接设置left为0，防止左边超出容器范围
      if (offset_x <= -parseFloat(this.leftstr)) {
        this.tableDoc.scrollLeft = 0
      } else if (offset_x >= this.moveWidth) {
        // 1.2 如果偏移量大于等于右边可移动的范围，那么设置left为右边可移动的范围加上左边已移动的范围乘以表格宽度和父组件的比值，防止右边超出容器范围
        this.tableDoc.scrollLeft =
          (this.moveWidth + parseFloat(this.leftstr)) *
          (this.tableWidth / this.parentWidth)
      } else {
        // 1.3 正常情况下是鼠标X偏移量加上左边已经移动了的范围在乘以表格宽度和父组件的比值
        this.tableDoc.scrollLeft =
          (offset_x + parseFloat(this.leftstr)) *
          (this.tableWidth / this.parentWidth)
      }
      // 防止卡顿
      this.tableDoc.scrollTop = 0
    },
    mouseUp(event) {
      if (!event) return
      if (document.getElementById('componentParent'))document.getElementById('componentParent').width = this.componentParent_width

      this.whetherTheMouseIsPressedDown = false
    },
    ifmove() {
      setTimeout(() => {
        // 该滚动条组件的引用方的父节点的宽度
        this.componentParent_width = document.getElementById(
          'componentParent'
        ).width

        this.tableDoc = document
          .getElementById(this.tableID)
          .querySelectorAll('.el-table__body-wrapper')[0]
        // 禁用表格自带的滚动条
        this.tableDoc.style.overflow = 'hidden'
        // 获取父组件宽度
        this.parentWidth = document.getElementById(this.parentComponentId).clientWidth
        this.parentHeight = document.getElementById(this.parentComponentId).clientHeight
        // 获取表格宽度
        this.tableWidth = this.tableDoc.getElementsByTagName(
          'table'
        )[0].clientWidth

        // 设置滑块的宽度
        this.slidWidth =
          (this.parentWidth / this.tableWidth) * this.parentWidth
        this.$refs.in_box.style.width = this.slidWidth + 'px'
        // 设置滚动条的总宽度
        this.$refs.out_box.style.width = this.parentWidth + 'px'
        // 计算可移动的长度
        this.moveWidth =
          this.parentWidth -
          (this.parentWidth / this.tableWidth) * this.parentWidth
      }, 1000)
    },
    // 滚动条事件*************************************************************************************
    pageScroll(even) {
      var st = document.body.scrollTop || document.documentElement.scrollTop
      if (st > this.adsorptionHighly) {
        this.outBoxclassName = 'out_box absolute'
      } else {
        this.outBoxclassName = 'out_box fixed'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.scrollbar-a {
  .out_box {
    height: 30px;
    background: #dfdfdf;
    z-index: 9;

    .in_box {
      position: absolute;
      z-index: 9;
      left: 0px;
      height: 30px;
      cursor: pointer;
      bottom: 0;
      background: #bebdbd;
    }
  }
  .fixed{
    position: fixed;
    bottom: 0px;
  }
  .absolute{
    position: absolute;
     bottom: 0px;
  }

}
</style>

