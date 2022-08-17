<template>
  <div class="productionSchedule">
    <div class="useintro">
      <el-dropdown :show-timeout="0" @command="handleCommand">
        <img src="@/assets/images/help.png" class="help">
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="a">员工如何使用小程序扫描生产单二维码进行个人计件？</el-dropdown-item>
          <el-dropdown-item command="b">管理人员如何确认员工计件？</el-dropdown-item>
          <el-dropdown-item command="c">管理人员如何直接分配合伙计件？</el-dropdown-item>
          <el-dropdown-item command="d" class="blue">更多问题，请访问帮助中心</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <div class="header">
      <span>进行中的生产单</span>
    </div>

    <product-note-condition-query
      ref="productNoteConditionQuery"
      :mode="'productScheduleQuery'"
      :current-page="currentPage"
      :page-size="pageSize"
      :multiple-production-single-state="['新生产单', '生产中']"
      :is-show-product-note-status="false"
      :callback-after-condition-query="callbackAfterConditionQuery"
      :callback-after-condition-clear="callbackAfterConditionClear"
    />

    <el-pagination
      class="el-pagination"
      :current-page="currentPage"
      :page-sizes="[50, 100, 150, 200]"
      :page-size="pageSize"
      :total="total"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handlePageChange"
    />
    <div class="production-order-List">
      <el-card
        v-for="item in onGoingProductionNoteTableData"
        :key="item['生产单编号']"
        class="production-order"
        shadow="always"
      >
        <div class="module-a">
          <!-- 生产单信息 -->
          <div class="collapse-item-1">
            <div class="item-1">
              <b>生产单号：{{ item['生产单编号'] }}</b>
            </div>

            <el-collapse-transition>
              <div v-show="item['是否展开']" class="transition">
                <div class="item-2">
                  <span>状态： {{ item['生产单状态'] }}</span>
                </div>

                <div class="item-2">
                  <span>时间：{{ item['生产单时间'] }}</span>
                </div>

                <div class="item-2">
                  <span>备注：{{ item['生产单备注'] }}</span>
                </div>

                <div class="item-btn">
                  <el-button
                    type="primary"
                    size="small"
                    @click="lookProductOrderDetail(item)"
                  >查看生产单详情</el-button>
                </div>
              </div>
            </el-collapse-transition>
          </div>

          <!-- 生产单对应订单信息 -->
          <div class="collapse-item-2">
            <div class="item-1">
              <b>生产单对应的订单信息</b>
            </div>
            <el-collapse-transition>
              <div v-show="item['是否展开']" class="transition">
                <div v-for="(value,name) in item['对应订单']['tags']" :key="name" class="item-2">
                  <span>{{ name }}：</span>
                  <span>{{ value }}</span>
                </div>
                <div class="item-btn">
                  <el-button type="primary" size="small" @click="lookOrderDetail(item)">查看订单详情</el-button>
                </div>
              </div>
            </el-collapse-transition>
          </div>

          <!-- 生产单产品信息 -->
          <div class="collapse-item-3">
            <div class="item-1">
              <b>生产单对应的产品信息</b>
            </div>

            <el-collapse-transition>
              <div v-show="item['是否展开']" class="transition">
                <div v-for="(value,name) in item['对应产品']['tags']" :key="name" class="item-2">
                  <span>{{ name }}：</span>
                  <span>{{ value }}</span>
                </div>
                <div class="item-btn">
                  <el-button
                    type="primary"
                    size="small"
                    @click="viewProductInformation(item)"
                  >查看产品详情</el-button>
                </div>
              </div>
            </el-collapse-transition>

            <!--el-collapse-item__arrow el-icon-arrow-right-->
            <!--el-collapse-item__arrow el-icon-arrow-right is-active-->
            <div class="arrow" @click="expandButtonClick(item)">
              <i v-if="funa(item)" class="el-collapse-item__arrow el-icon-arrow-right is-active" />
              <i v-else class="el-collapse-item__arrow el-icon-arrow-right" />
            </div>
          </div>
        </div>

        <!-- 工序完成度 -->
        <div class="module-b">
          <el-button
            v-for="process_item in item['工序总结']"
            :key="process_item['工序名称']"
            class="btn-process"
            :class="process_item['是否需要确认']?'primary':'info'"
            :disabled="!管理权限['生产单进度管理可写']"
            @click="handleRecordCount(item['生产单编号'], process_item['工序名称'])"
          >
            <b>工序</b>
            :{{ process_item['工序名称'] }}
            <b>计件</b>
            : {{ process_item['员工计件完成数量'] }}/{{ process_item['总排产数'] }} (员工计件:{{ process_item['员工计件完成数量'] }})
          </el-button>
          <div class="btn-complete">
            <el-button
              type="danger"
              plain
              :disabled="!管理权限['强制完成生产单可写']"
              @click="handleFinishedProductionOrder(item['生产单编号'])"
            >
              <b>点击完成整个生产任务</b>
            </el-button>
          </div>
        </div>

        <div class="module-c">
          <span class="text">生产单完成度：{{ (item['完成百分比']*100).toFixed(1) }}%</span>
          <el-progress
            class="progress"
            :text-inside="true"
            :stroke-width="18"
            :percentage="Number(parseFloat(item['完成百分比']*100).toFixed(1))"
          />
        </div>
      </el-card>
    </div>

    <!-- 管理员计件对话框 -->
    <record-count-dialog-box
      :dialog-visible="dialogVisible"
      :on-close="closeRecordCountDialogCallback"
      :production-note-number="countSelectData.productionNoteNumber"
      :process-name="countSelectData.processName"
    />

    <!--订单对话框-->
    <order-dialog-box
      :dialog-visible="orderDialogVisible"
      :on-close="closeEditOrderDialogCallback"
      :cur-operation-detail-info="curOrderInfo"
      :open-mode="openMode"
    />
  </div>
</template>

<script>
import recordCountDialogBox from './components/recordCountDialogBox'
import orderDialogBox from '@/views/orderManagement/components/orderDialogBox' // 订单对话框
import productNoteConditionQuery from '@/views/components/productNoteConditionQuery' // 生产单条件查询组件
import {
  filter_order,
  finish_production_note_by_id
} from '@/api/ordersForProductionScheduling'
import { mapGetters } from 'vuex'

export default {
  components: {
    recordCountDialogBox,
    orderDialogBox,
    productNoteConditionQuery
  },
  data() {
    return {
      dialogVisible: false, // 管理员计件对话框
      onGoingProductionNoteTableData: [], // 生产单列表
      // 管理员计件对话框打开时选中的订单和工序信息
      countSelectData: {
        productionNoteNumber: '',
        processName: ''
      },
      // 当前的订单信息
      curOrderInfo: {},
      // 是否展示订单对话框
      orderDialogVisible: false,
      openMode: '', // 点开对话框的时候的模式
      // 当前页数
      currentPage: 1,
      // 当前页数据量
      pageSize: 50,
      // 总条目数
      total: 0
    }
  },
  computed: {
    ...mapGetters(['管理权限'])
  },
  created() {},
  mounted() {
    this.$refs.productNoteConditionQuery.listOnGoingProductionNotes()
  },
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
          x = 6
          y = 0
        } else if (command === 'b') {
          x = 6
          y = 1
        } else if (command === 'c') {
          x = 6
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

    // 页码控制时，每页数量改变的处理函数
    handleSizeChange(val) {
      this.pageSize = val
      this.$refs.productNoteConditionQuery.scheduleDebouncedHandleSearch()
    },
    // 页码控制时，每页码改变改变的处理函数
    handlePageChange(val) {
      this.currentPage = val
      this.$refs.productNoteConditionQuery.scheduleDebouncedHandleSearch()
    },

    // 子组件条件查询之后回调
    callbackAfterConditionQuery(response) {
      var data = response.data
      data.forEach(element => {
        element['是否展开'] = false
      })
      this.onGoingProductionNoteTableData = data
      this.total = response.total_count
    },

    // 子组件清空搜索条件之后回调
    callbackAfterConditionClear() {
      this.currentPage = 1
      this.pageSize = 50
      this.$nextTick(() => {
        this.$refs.productNoteConditionQuery.listOnGoingProductionNotes()
      })
    },

    // 点击完成整个生产任务
    async handleFinishedProductionOrder(production_node_number) {
      if (
        confirm(
          '确定要完成编号为' +
            production_node_number +
            '的生产单吗？完成后，所有该生产单的工序都将改为完成。'
        ) &&
        confirm(
          '请再次确认是否要完成编号为' + production_node_number + '的生产单？'
        )
      ) {
        var post_data = {
          login_token: this.$store.getters.token,
          生产单unique_id: production_node_number
        }
        const response = await finish_production_note_by_id(post_data)
        if (response.status === 'OK') {
          this.$message({
            type: 'success',
            message: `编号为${production_node_number}生产单被标记为完成！`
          })
          // 刷新正在进行的生产单
          this.$refs.productNoteConditionQuery.listOnGoingProductionNotes()
        }
      }
    },
    // 管理员计件对话框关闭后回调
    handleRecordCount(production_note_number, process_name) {
      this.countSelectData = {
        productionNoteNumber: production_note_number,
        processName: process_name
      }
      this.dialogVisible = true
    },
    // 管理员计件对话框关闭后回调
    closeRecordCountDialogCallback(status) {
      this.dialogVisible = status
      this.$refs.productNoteConditionQuery.listOnGoingProductionNotes()
    },
    // 查看生产单详情
    lookProductOrderDetail(data) {
      data['unique_id'] = data['生产单编号']
      this.$router.push({
        path: '/productOrderManagement/arrangeProductionNote',
        query: {
          mode: 'detail',
          from: 'productionSchedule',
          curOperationDetailInfo: data
        }
      })
    },
    // 查看订单详情
    async lookOrderDetail(data) {
      const parameter = {
        login_token: this.$store.getters.token,
        订单编号: data.对应订单.订单编号
      }
      const response = await filter_order(parameter)
      this.curOrderInfo = response.data[0]
      this.openMode = 'lookOver'
      this.orderDialogVisible = true
    },
    // 查看产品信息
    viewProductInformation(data) {
      this.$router.push({
        path: '/productManagement/product0peration',
        query: { mode: 'detail', unique_id: data.对应产品.产品编号 } // 模式为添加产品模式
      })
    },
    // 订单对话框关闭后回调
    closeEditOrderDialogCallback(status) {
      this.orderDialogVisible = status
    },
    // 展开按钮点击
    expandButtonClick(item) {
      item['是否展开'] = !item['是否展开']
    },
    funa(item) {
      return item['是否展开']
    }
  }
}
</script>

<style lang="scss">
.productionSchedule {
  padding: 30px;
  .header {
    font-size: 24px;
    margin-bottom: 40px;
  }
  .el-pagination {
    margin-bottom: 10px;
  }
  .production-order-List {
    overflow: hidden;
    .production-order {
      margin-bottom: 30px;
      overflow: hidden;
      .module-a {
        display: flex;
        justify-content: space-between;
        border-bottom: 1px solid #ebeef5;
        margin-bottom: 20px;
        .collapse-item-1,
        .collapse-item-2,
        .collapse-item-3 {
          flex: 1;
          border-right: 1px solid #ebeef5;
          padding: 0 30px;
          .item-1 {
            margin: 20px 0 20px 0;
            width: 100%;
            text-align: center;
          }
          .transition {
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-content: space-between;
            flex-wrap: wrap;
            min-height: 130px;
            .item-2 {
              width: 50%;
              margin-bottom: 10px;
              text-align: center;
            }
            .item-2:nth-child(even) {
              text-align: right;
            }
            .item-2:nth-child(odd) {
              text-align: left;
            }
            .item-btn {
              margin-bottom: 10px;
              width: 100%;
              text-align: center;
            }
          }
        }
        .collapse-item-3 {
          border-right: none;
          position: relative;
          .arrow {
            cursor: pointer;
            width: 15px;
            height: 15px;
            position: absolute;
            right: 15px;
            top: 20px;
          }
        }
      }
      .module-b {
        padding: 0 20px;
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;
        .btn-process {
          margin-bottom: 5px;
          width: 350px;
        }
        .btn-process.primary {
          color: #fff;
          background-color: #409eff;
          border-color: #409eff;
        }
        .btn-process.info {
          color: #409eff;
          background: #ecf5ff;
          border-color: #b3d8ff;
        }
        .btn-complete {
          display: flex;
          margin-bottom: 5px;
          justify-content: center;
          width: 100%;
        }
      }
      .module-c {
        padding: 0 20px;
        margin-bottom: 20px;
        display: flex;
        .text {
          width: 200px;
        }
        .progress {
          width: 100%;
        }
      }
    }
  }
}

.el-card__body {
  padding: 0;
}
.el-button + .el-button {
  margin-left: 0px;
}
</style>

