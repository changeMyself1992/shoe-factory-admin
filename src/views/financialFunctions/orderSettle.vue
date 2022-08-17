<template>
  <div id="order-settle" class="order-settle">
    <div class="useintro">
      <el-dropdown :show-timeout="0" @command="handleCommand">
        <img src="@/assets/images/help.png" class="help">
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item
            command="a"
          >如何查看订单结算、更新结算相关内容及发货情况？</el-dropdown-item>
          <el-dropdown-item
            command="b"
          >如何导出订单的结算和发货情况到Excel表格？</el-dropdown-item>
          <el-dropdown-item
            command="c"
          >如何在订单结算时使用自动补全单价的功能?</el-dropdown-item>
          <el-dropdown-item
            command="d"
            class="blue"
          >更多问题，请访问帮助中心</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <!-- 条件查询 -->
    <order-condition-query
      ref="orderConditionQuery"
      :title="'订单结算条件查询'"
      :mode="'orderSettlementEnquiry'"
      :current-page="currentPage"
      :page-size="pageSize"
      :is-show-settlement-status="true"
      :is-show-order-status="false"
      :callback-after-condition-query="callbackAfterConditionQuery"
      :call-back-the-parent-component-before-the-query="
        callBackTheParentComponentBeforeTheQuery
      "
      :callback-after-condition-clear="callbackAfterConditionClear"
      @initPagination="initPagination"
    />

    <!-- 查询结果列表 -->
    <div class="module-c">
      <div class="title">
        <span>结算记录：</span>
        <!-- <el-progress
          class="excleprogress"
          :text-inside="true"
          :stroke-width="16"
          :percentage="excleprogressValue"
          @getprogress="getprogressValue"
        /> -->
        <el-button
          type="primary"
          :loading="btnLoading"
          size="small"
          :disabled="!管理权限['订单结算列表可读']"
          @click="exportExcel()"
        >导出EXCEL表格</el-button>

        <el-tag
          v-if="settlementOfStatistical.已发货"
        >已发货：{{ settlementOfStatistical.已发货 }}</el-tag>
        <el-tag
          v-if="settlementOfStatistical.已收款"
        >已收款：{{ settlementOfStatistical.已收款 }}</el-tag>
        <el-tag
          v-if="settlementOfStatistical.应发货"
        >应发货：{{ settlementOfStatistical.应发货 }}</el-tag>
        <el-tag
          v-if="settlementOfStatistical.应收款"
        >应收款：{{ settlementOfStatistical.应收款 }}</el-tag>
      </div>

      <el-checkbox
        v-model.trim="checkAll"
        style="margin-left: 20px"
        :indeterminate="isIndeterminate"
        @change="handleCheckAllChange"
      >全选</el-checkbox>
      <div style="margin: 15px 0" />
      <el-checkbox-group v-model.trim="checkList" class="checkbox-group">
        <el-checkbox label="订单编号" disabled />
        <el-checkbox label="订单日期" />
        <el-checkbox label="交货日期" />
        <el-checkbox label="订单完成百分比" />
        <el-checkbox label="订单详情" disabled />
        <el-checkbox label="产品详情" />
        <el-checkbox label="订单备注" />
        <el-checkbox label="配码详情" />
        <el-checkbox label="总数" />
        <el-checkbox label="产品单价" />
        <el-checkbox label="产品应收款" />
        <el-checkbox label="产品实收款" />
        <el-checkbox label="发货数量" />
        <el-checkbox label="发货时间" />
        <el-checkbox label="备注" />
        <el-checkbox label="结算状态" disabled />
      </el-checkbox-group>

      <el-table
        v-if="是否展示表格"
        id="settlementRecord"
        ref="table"
        v-loading="tableLoading"
        :max-height="tableHeight"
        :data="结算记录列表"
        border
        class="table"
      >
        <el-table-column type="index" width="50" />
        <el-table-column
          prop="订单编号"
          label="订单编号"
          align="center"
          width="100"
        />
        <el-table-column
          v-if="whetherToDisplayColumns('订单日期')"
          prop="订单日期"
          label="订单日期"
          align="center"
          width="110"
          sortable
        />
        <el-table-column
          v-if="whetherToDisplayColumns('交货日期')"
          prop="交货日期"
          label="交货日期"
          align="center"
          width="110"
          sortable
        />
        <el-table-column
          v-if="whetherToDisplayColumns('订单完成百分比')"
          prop="订单完成百分比"
          label="订单完成百分比"
          align="center"
          width="150"
          sortable
        >
          <template slot-scope="scope">
            <span>{{ scope.row["订单完成百分比"] | percentageDisplay }}</span>
          </template>
        </el-table-column>

        <el-table-column
          v-if="结算记录列表.length > 0 && whetherToDisplayColumns('订单详情')"
          align="center"
        >
          <template slot="header">
            <!--自定义表头-->
            <el-button
              type="primary"
              size="small"
              @click.native="orderArrowClick()"
            >
              <span>{{ orderStatusDes }}</span>
              <i
                :class="
                  whetherTheOrderLabelIsExpanded
                    ? 'el-collapse-item__arrow el-icon-arrow-right is-active'
                    : 'el-collapse-item__arrow el-icon-arrow-right'
                "
              />
            </el-button>
          </template>
          <template>
            <el-table-column
              v-for="(tag, index) in whetherTheOrderLabelIsExpanded
                ? 结算记录列表[0].订单的标签_展开
                : 结算记录列表[0].订单的标签_关闭"
              :key="index"
              :prop="tag"
              :label="tag"
              align="center"
              :width="whetherTheOrderLabelIsExpanded ? 'auto' : '150'"
              :filters="
                whetherTheOrderLabelIsExpanded
                  ? 结算记录列表[0][tag + '-Valus']
                  : []
              "
              :filter-method="
                whetherTheOrderLabelIsExpanded ? filterOrderTags : () => {}
              "
            >
              <template slot="header">
                <!--自定义表头-->
                <div class="order-header">
                  <span>{{ tag }}</span>
                </div>
              </template>
              <template slot-scope="scope">
                <span>{{ scope.row["tags_" + tag] }}</span>
              </template>
            </el-table-column>
          </template>
        </el-table-column>

        <el-table-column
          v-if="结算记录列表.length > 0 && whetherToDisplayColumns('产品详情')"
          align="center"
        >
          <template slot="header">
            <el-button
              type="primary"
              size="small"
              @click.native="productArrowClick()"
            >
              <span>{{ productStatusDes }}</span>
              <i
                :class="
                  whetherToExpandProductInformation
                    ? 'el-collapse-item__arrow el-icon-arrow-right is-active'
                    : 'el-collapse-item__arrow el-icon-arrow-right'
                "
              />
            </el-button>
          </template>
          <template>
            <el-table-column
              v-for="(tag, index) in whetherToExpandProductInformation
                ? 结算记录列表[0].产品的标签_展开
                : 结算记录列表[0].产品的标签_关闭"
              :key="index"
              align="center"
              :width="
                whetherToExpandProductInformation
                  ? tag.length >= 4
                    ? '110'
                    : 'auto'
                  : '150'
              "
              :prop="tag"
              :label="tag"
              :filters="
                whetherToExpandProductInformation
                  ? 结算记录列表[0][tag + '-Valus']
                  : []
              "
              :filter-method="
                whetherToExpandProductInformation ? filterProductTags : () => {}
              "
            >
              <template slot="header">
                <div class="product-header">
                  <span>{{ tag }}</span>
                </div>
              </template>
              <template slot-scope="scope">
                <span>{{ scope.row["包含的产品_产品信息_tags_" + tag] }}</span>
              </template>
            </el-table-column>
          </template>
        </el-table-column>

        <el-table-column
          v-if="whetherToDisplayColumns('订单备注')"
          label="订单备注"
          align="center"
          width="300"
        >
          <template slot-scope="scope">
            <el-tooltip
              class="item"
              effect="dark"
              :content="scope.row['订单备注']"
              placement="top-start"
            >
              <el-input
                v-model="scope.row['订单备注']"
                type="textarea"
                :rows="2"
                disabled
              />
            </el-tooltip>
          </template>
        </el-table-column>

        <el-table-column
          v-if="结算记录列表.length > 0 && whetherToDisplayColumns('配码详情')"
          align="center"
        >
          <template slot="header">
            <el-button
              type="primary"
              size="small"
              @click.native="peiMaArrowClick()"
            >
              <span>{{ peimaStatusDes }}</span>
              <i
                :class="
                  whetherToExpandPeiMaInformation
                    ? 'el-collapse-item__arrow el-icon-arrow-right is-active'
                    : 'el-collapse-item__arrow el-icon-arrow-right'
                "
              />
            </el-button>
          </template>
          <template>
            <el-table-column
              v-for="(value, index) in whetherToExpandPeiMaInformation
                ? 结算记录列表[0].配码数组_展开
                : 结算记录列表[0].配码数组_关闭"
              v-show="whetherToExpandPeiMaInformation"
              :key="index"
              align="center"
              :width="
                whetherToExpandPeiMaInformation
                  ? value.length > 4
                    ? '130'
                    : '60'
                  : '150'
              "
            >
              <template slot="header">
                <div class="product-header">
                  <span>{{ value }}</span>
                </div>
              </template>
              <template slot-scope="scope">
                <span>{{
                  whetherToExpandPeiMaInformation ? scope.row[value] : "..."
                }}</span>
              </template>
            </el-table-column>
          </template>
        </el-table-column>

        <el-table-column
          v-if="whetherToDisplayColumns('总数')"
          width="150"
          prop="总数"
          label="总数"
          align="center"
          sortable
        >
          <template slot-scope="scope">
            <div
              :class="
                scope.row['包含的产品_结算情况_结算状态'] === '订单取消' ||
                  scope.row['包含的产品_结算情况_结算状态'] === '订单无法收款'
                  ? 'cross-out'
                  : ''
              "
            >
              <span>
                {{ scope.row["总数"] }}
              </span>
            </div>
          </template>
        </el-table-column>

        <el-table-column
          v-if="whetherToDisplayColumns('结算状态+')"
          label="结算相关"
          align="center"
        >
          <el-table-column
            v-if="whetherToDisplayColumns('产品单价')"
            label="产品单价"
            align="center"
            :prop="'包含的产品_结算情况_产品单价'"
            sortable
            width="120"
          >
            <template slot-scope="scope">
              <el-input
                v-model="scope.row['包含的产品_结算情况_产品单价']"
                :class="
                  scope.row['包含的产品_结算情况_结算状态'] === '订单取消' ||
                    scope.row['包含的产品_结算情况_结算状态'] === '订单无法收款'
                    ? 'cross-out'
                    : ''
                "
                type="number"
                :disabled="!scope.row['结算状态是否可编辑']"
                @blur="numeralsLimit(scope.row, '包含的产品_结算情况_产品单价')"
                @focus="
                  ($event) => {
                    $event.currentTarget.select();
                  }
                "
              />
            </template>
          </el-table-column>

          <el-table-column
            v-if="whetherToDisplayColumns('产品应收款')"
            label="产品应收款"
            align="center"
            prop="包含的产品_结算情况_产品订单应收"
            sortable
            width="120"
          >
            <template slot-scope="scope">
              <div
                :class="
                  scope.row['包含的产品_结算情况_产品订单实收'] === 0 &&
                    scope.row['包含的产品_结算情况_产品订单应收'] === 0
                    ? 'money0'
                    : scope.row['包含的产品_结算情况_产品订单实收'] ===
                      scope.row['包含的产品_结算情况_产品订单应收'] &&
                      scope.row['包含的产品_结算情况_产品订单实收'] !== 0 &&
                      scope.row['包含的产品_结算情况_产品订单应收'] !== 0
                      ? 'money1'
                      : 'money2'
                "
              >
                <el-tooltip
                  class="item"
                  effect="dark"
                  :content="
                    formattedString(
                      scope.row['包含的产品_结算情况_产品订单应收']
                    )
                  "
                  placement="bottom"
                >
                  <el-input
                    v-model="scope.row['包含的产品_结算情况_产品订单应收']"
                    :class="
                      scope.row['包含的产品_结算情况_结算状态'] ===
                        '订单取消' ||
                        scope.row['包含的产品_结算情况_结算状态'] ===
                        '订单无法收款'
                        ? 'cross-out'
                        : ''
                    "
                    type="number"
                    :disabled="!scope.row['结算状态是否可编辑']"
                    @blur="
                      numeralsLimit(
                        scope.row,
                        '包含的产品_结算情况_产品订单应收'
                      )
                    "
                    @focus="
                      ($event) => {
                        $event.currentTarget.select();
                      }
                    "
                  />
                </el-tooltip>
              </div>
            </template>
          </el-table-column>

          <el-table-column
            v-if="whetherToDisplayColumns('产品实收款')"
            label="产品实收款"
            align="center"
            prop="包含的产品_结算情况_产品订单实收"
            sortable
            width="120"
          >
            <template slot-scope="scope">
              <!-- 实收款和应收款都为0时，背景灰色；实收款等于应收款且不为0的时候，是一种颜色（如绿色），实收款不等于应收款的时候是另外一种颜色（如红色） -->
              <div
                :class="
                  scope.row['包含的产品_结算情况_产品订单实收'] === 0 &&
                    scope.row['包含的产品_结算情况_产品订单应收'] === 0
                    ? 'money0'
                    : scope.row['包含的产品_结算情况_产品订单实收'] ===
                      scope.row['包含的产品_结算情况_产品订单应收'] &&
                      scope.row['包含的产品_结算情况_产品订单实收'] !== 0 &&
                      scope.row['包含的产品_结算情况_产品订单应收'] !== 0
                      ? 'money1'
                      : 'money2'
                "
              >
                <el-tooltip
                  class="item"
                  effect="dark"
                  :content="
                    formattedString(
                      scope.row['包含的产品_结算情况_产品订单实收']
                    )
                  "
                  placement="bottom"
                >
                  <el-input
                    v-model="scope.row['包含的产品_结算情况_产品订单实收']"
                    :class="
                      scope.row['包含的产品_结算情况_结算状态'] ===
                        '订单取消' ||
                        scope.row['包含的产品_结算情况_结算状态'] ===
                        '订单无法收款'
                        ? 'cross-out'
                        : ''
                    "
                    type="number"
                    :disabled="!scope.row['结算状态是否可编辑']"
                    @blur="
                      numeralsLimit(
                        scope.row,
                        '包含的产品_结算情况_产品订单实收'
                      )
                    "
                    @focus="
                      ($event) => {
                        $event.currentTarget.select();
                      }
                    "
                  />
                </el-tooltip>
              </div>
            </template>
          </el-table-column>

          <el-table-column
            v-if="whetherToDisplayColumns('发货数量')"
            label="发货数量"
            align="center"
            prop="包含的产品_结算情况_发货数量"
            sortable
            width="120"
          >
            <template slot-scope="scope">
              <!-- 当发货数量不等于总数的时候，用一种颜色，等于总数的时候是另外一种颜色。 -->
              <div
                :class="
                  scope.row['包含的产品_结算情况_发货数量'] ===
                    scope.row['总数']
                    ? 'red'
                    : 'green'
                "
              >
                <el-tooltip
                  class="item"
                  effect="dark"
                  :content="
                    formattedString(scope.row['包含的产品_结算情况_发货数量'])
                  "
                  placement="bottom"
                >
                  <el-input
                    v-model="scope.row['包含的产品_结算情况_发货数量']"
                    :class="
                      scope.row['包含的产品_结算情况_结算状态'] ===
                        '订单取消' ||
                        scope.row['包含的产品_结算情况_结算状态'] ===
                        '订单无法收款'
                        ? 'cross-out'
                        : ''
                    "
                    type="number"
                    :disabled="!scope.row['结算状态是否可编辑']"
                    @blur="
                      numeralsLimit(scope.row, '包含的产品_结算情况_发货数量')
                    "
                    @focus="
                      ($event) => {
                        $event.currentTarget.select();
                      }
                    "
                  />
                </el-tooltip>
              </div>
            </template>
          </el-table-column>

          <el-table-column
            v-if="whetherToDisplayColumns('发货时间')"
            label="发货时间"
            align="center"
            width="170"
            prop="包含的产品_结算情况_发货时间"
            sortable
          >
            <template slot-scope="scope">
              <el-date-picker
                v-model.trim="scope.row['包含的产品_结算情况_发货时间']"
                :class="
                  scope.row['包含的产品_结算情况_结算状态'] === '订单取消' ||
                    scope.row['包含的产品_结算情况_结算状态'] === '订单无法收款'
                    ? 'cross-out'
                    : ''
                "
                type="date"
                :disabled="!scope.row['结算状态是否可编辑']"
                value-format="yyyy-MM-dd"
                placeholder="选择日期"
              />
            </template>
          </el-table-column>

          <el-table-column
            v-if="whetherToDisplayColumns('备注')"
            label="备注"
            align="center"
            width="150"
          >
            <template slot-scope="scope">
              <el-input
                v-model="scope.row['包含的产品_结算情况_备注']"
                :disabled="!scope.row['结算状态是否可编辑']"
                type="textarea"
                :autosize="{ minRows: 1, maxRows: 4 }"
              />
            </template>
          </el-table-column>

          <el-table-column
            v-if="whetherToDisplayColumns('结算状态')"
            label="结算状态"
            align="center"
            width="160"
            prop="包含的产品_结算情况_发货时间"
            :filters="filter"
            :filter-method="filterSettlementStatus"
          >
            <template slot-scope="scope">
              <!-- 不同的结算状态，使用不同的背景颜色， -->
              <div
                :class="
                  scope.row['包含的产品_结算情况_结算状态'] === '未发货'
                    ? 'state1'
                    : scope.row['包含的产品_结算情况_结算状态'] === '发货中'
                      ? 'state2'
                      : scope.row['包含的产品_结算情况_结算状态'] === '已发货'
                        ? 'state3'
                        : scope.row['包含的产品_结算情况_结算状态'] === '结算中'
                          ? 'state4'
                          : scope.row['包含的产品_结算情况_结算状态'] === '已结算'
                            ? 'state5'
                            : scope.row['包含的产品_结算情况_结算状态'] === '订单取消'
                              ? 'state6'
                              : 'state7'
                "
              >
                <el-select
                  v-model.trim="scope.row['包含的产品_结算情况_结算状态']"
                  :disabled="!scope.row['结算状态是否可编辑']"
                  placeholder="请选择"
                  @change="getNewOrderState($event, scope)"
                  @visible-change="getOleOrderState($event, scope)"
                >
                  <el-option
                    v-for="item in options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </div>
            </template>
          </el-table-column>
        </el-table-column>

        <el-table-column align="center" label="操作" width="180">
          <template slot-scope="scope">
            <el-button
              v-if="!scope.row['结算状态是否可编辑']"
              :loading="btnLoading"
              type="primary"
              size="mini"
              :disabled="!管理权限['订单结算管理可写']"
              @click="handleEdit(scope.row)"
            >编辑</el-button>
            <el-button
              v-else-if="
                scope.row['结算状态是否可编辑'] &&
                  whetherOnlyOneLineOfSettlementStatusIsEditable
              "
              :loading="btnLoading"
              type="primary"
              size="mini"
              :disabled="!管理权限['订单结算管理可写']"
              @click="handleSubmit(scope.row)"
            >提交</el-button>
            <el-button
              v-else
              :loading="btnLoading"
              type="primary"
              size="mini"
              :disabled="!管理权限['订单结算管理可写']"
              @click="handleAllSubmit()"
            >全部提交</el-button>

            <el-button
              v-if="scope.row['结算状态是否可编辑']"
              :loading="btnLoading"
              type="danger"
              size="mini"
              :disabled="!管理权限['订单结算管理可写']"
              @click="handleReset(scope.row)"
            >重置</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="paging">
        <el-pagination
          class="paging-a"
          :current-page="currentPage"
          :page-sizes="[30, 60, 100, 150]"
          :page-size="pageSize"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script>
import orderConditionQuery from '@/views/components/orderConditionQuery' // 订单条件查询组件
import { deepClone, isEmpty } from '@/utils'
import {
  order_settle_edit,
  match_recent_product_settle_info_by_product_info
} from '@/api/ordersForProductionScheduling'
import { mapGetters } from 'vuex'
var default_list = [
  '订单编号',
  '订单详情',
  '产品单价',
  '总数',
  '产品应收款',
  '产品实收款',
  '发货数量',
  '发货时间',
  '结算状态'
]

var all_list = [
  '订单编号',
  '订单日期',
  '交货日期',
  '订单完成百分比',
  '订单详情',
  '产品详情',
  '订单备注',
  '配码详情',
  '总数',
  '产品单价',
  '产品应收款',
  '产品实收款',
  '发货数量',
  '发货时间',
  '备注',
  '结算状态'
]
export default {
  // scrollbarA
  components: { orderConditionQuery },
  data() {
    return {
      // 导出excel的进度
      // excleprogressValue: 0,
      // 当前页数
      currentPage: 1,
      // 当前页数据量
      pageSize: 30,
      // 是否启用按钮loading状态防止多次点击
      btnLoading: false,
      tableLoading: false,
      // 订单结算的统计
      settlementOfStatistical: {},
      // 订单列表的内容信息
      结算记录列表: [],
      // 用于重置功能
      结算记录列表的副本: [],
      // 总条目数
      total: 0,
      whetherTheOrderLabelIsExpanded: true, // 是否展开订单信息
      whetherToExpandProductInformation: false, // 是否展开产品信息
      whetherToExpandPeiMaInformation: false, // 是否展开配码信息
      options: [
        {
          value: '未发货',
          label: '未发货'
        },
        {
          value: '发货中',
          label: '发货中'
        },
        {
          value: '已发货',
          label: '已发货'
        },
        {
          value: '结算中',
          label: '结算中'
        },
        {
          value: '已结算',
          label: '已结算'
        },
        {
          value: '订单取消',
          label: '订单取消'
        },
        {
          value: '订单无法收款',
          label: '订单无法收款'
        }
      ],
      filter: [
        {
          text: '未发货',
          value: '未发货'
        },
        {
          text: '发货中',
          value: '发货中'
        },
        {
          text: '已发货',
          value: '已发货'
        },
        {
          text: '结算中',
          value: '结算中'
        },
        {
          text: '已结算',
          value: '已结算'
        },
        {
          text: '订单取消',
          label: '订单取消'
        },
        {
          text: '订单无法收款',
          label: '订单无法收款'
        }
      ],
      // 显示指定的列
      checkList: deepClone(default_list),
      checkAll: false,
      isIndeterminate: true,
      是否展示表格: false,
      // 是否只有一行结算状态可编辑
      whetherOnlyOneLineOfSettlementStatusIsEditable: false,
      tableHeight: '',
      // 订单状态被修改前值
      oldOrderState: '',
      配码数组: []
    }
  },
  computed: {
    ...mapGetters(['管理权限']),
    orderStatusDes() {
      if (this.whetherTheOrderLabelIsExpanded) return '关闭订单详情'
      else return '展开订单详情'
    },
    productStatusDes() {
      if (this.whetherToExpandProductInformation) return '关闭产品详情'
      else return '展开产品详情'
    },
    peimaStatusDes() {
      if (this.whetherToExpandProductInformation) return '关闭配码详情'
      else return '展开配码详情'
    }
  },
  watch: {},
  async created() {
    this.tableHeight = window.innerHeight * 0.75
  },
  mounted() {},
  methods: {
    // 获取自组件值更改导出excel的进度条数据
    // getprogressValue(val) {
    //   console.log(val)
    //   this.excleprogressValue = val
    // },
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
          x = 3
          y = 5
        } else if (command === 'b') {
          x = 3
          y = 6
        } else if (command === 'c') {
          x = 3
          y = 7
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
    // 订单状态未发货变成发货中或者已发货的时候，发货数量自动补全到总数的数量，然后用户自行更改
    // 获取修改前的订单状态
    getOleOrderState(e, scope) {
      var oldOrderState = scope.row['包含的产品_结算情况_结算状态']
      if (e) {
        this.oldOrderState = oldOrderState
      }
    },
    // 获取修改后的新订单状态
    getNewOrderState(e, scope) {
      console.log('旧值' + this.oldOrderState)
      console.log('新值' + e)
      if (this.oldOrderState === '未发货') {
        if (e === '发货中' || e === '已发货' || e === '已结算') {
          console.log(scope.row['总数'])
          console.log(scope.row['包含的产品_结算情况_发货数量'])
          scope.row['包含的产品_结算情况_发货数量'] = scope.row['总数']
        }
      }
    },
    initPagination() {
      this.currentPage = 1
      this.pageSize = 30
      this.$nextTick(() => {
        this.$refs.orderConditionQuery.orderSettleFilterItems()
      })
    },
    // 子组件清空搜索条件之后回调
    callbackAfterConditionClear() {
      this.currentPage = 1
      this.pageSize = 30
      this.checkList = deepClone(default_list)

      this.$nextTick(() => {
        this.$refs.orderConditionQuery.orderSettleFilterItems()
      })
    },
    // 子组件条件查询之前回调
    callBackTheParentComponentBeforeTheQuery() {
      this.tableLoading = true
      setTimeout(() => {
        this.tableLoading = false
      }, 2000)
    },
    // 子组件条件查询之后回调
    callbackAfterConditionQuery() {
      var data1 = new Date()
      this.total = this.$refs.orderConditionQuery.total
      this.settlementOfStatistical = this.$refs.orderConditionQuery.settlementOfStatistical
      var 结算记录列表 = this.$refs.orderConditionQuery.tableData.结算记录列表
      if (isEmpty(结算记录列表)) return
      // 找出结算记录列表所有配码的并集
      this.配码数组 = []
      for (let i = 0; i < 结算记录列表.length; i++) {
        const 结算记录元素 = 结算记录列表[i]
        for (const key in 结算记录元素) {
          if (/^[3|4]{1}[0-9]{1}$/.test(key) && !this.配码数组.includes(key)) {
            this.配码数组.push(key)
          }
        }
      }
      for (let i = 0; i < 结算记录列表.length; i++) {
        var element = 结算记录列表[i]
        element['结算状态是否可编辑'] = false
        element['订单完成百分比'] = Number(
          parseFloat(element['订单完成百分比']).toFixed(2)
        )

        if (i === 0) {
          // 获取订单标签的标签名对应的所有标签值
          for (const key in this.$store.getters.theFullValueOfTheOrderLabel) {
            element[key] = this.$store.getters.theFullValueOfTheOrderLabel[key]
          }
        }

        element['订单的标签_展开'] = deepClone(this.$store.getters.订单的标签)
        element['订单的标签_关闭'] = ['...']
        element['tags_...'] = '...'

        if (i === 0) {
          // 获取产品标签的标签名对应的所有标签值
          for (const key in this.$store.getters
            .allOptionsForEachLabelOfTheProduct) {
            element[
              key
            ] = this.$store.getters.allOptionsForEachLabelOfTheProduct[key]
          }
        }
        element['产品的标签_展开'] = deepClone(this.$store.getters.产品的标签)
        element['产品的标签_关闭'] = ['...']
        element['包含的产品_产品信息_tags_...'] = '...'

        element['配码数组_展开'] = this.配码数组
        element['配码数组_关闭'] = ['...']

        element.id = i
      }
      this.结算记录列表 = 结算记录列表
      this.结算记录列表的副本 = deepClone(结算记录列表)
      this.是否展示表格 = true

      var data2 = new Date()
      console.log('逻辑处理耗时：', data2.getTime() - data1.getTime())
    },

    filterOrderTags(value, row, column) {
      return row['tags_' + column.label] === value
    },
    filterProductTags(value, row, column) {
      return row['包含的产品_产品信息_tags_' + column.label] === value
    },
    filterSettlementStatus(value, row, column) {
      return row['包含的产品_结算情况_' + column.label] === value
    },
    // 页码控制时，每页数量改变的处理函数
    handleSizeChange(val) {
      this.pageSize = val
      this.$nextTick(() => {
        this.$refs.orderConditionQuery.orderSettleFilterItems()
      })
    },
    // 页码控制时，每页码改变改变的处理函数
    handleCurrentChange(val) {
      this.currentPage = val
      this.$nextTick(() => {
        this.$refs.orderConditionQuery.orderSettleFilterItems()
      })
    },
    // 订单按钮箭头点击
    orderArrowClick() {
      this.whetherTheOrderLabelIsExpanded = !this
        .whetherTheOrderLabelIsExpanded
    },
    // 产品信息按钮点击
    productArrowClick() {
      this.whetherToExpandProductInformation = !this
        .whetherToExpandProductInformation
      this.是否展示表格 = false
      setTimeout(() => {
        this.是否展示表格 = true
      }, 0)
    },
    // 配码信息按钮点击
    peiMaArrowClick() {
      this.whetherToExpandPeiMaInformation = !this
        .whetherToExpandPeiMaInformation
      this.是否展示表格 = false
      setTimeout(() => {
        this.是否展示表格 = true
      }, 0)
    },
    // number限制
    numeralsLimit(row, key) {
      if (row[key] < 0 || !row[key]) row[key] = 0
      row[key] = Number(parseFloat(row[key]).toFixed(2))
      // 实收要小于应收
      if (
        key === '包含的产品_结算情况_产品订单实收' &&
        row[key] > row['包含的产品_结算情况_产品订单应收']
      ) {
        row[key] = row['包含的产品_结算情况_产品订单应收']
      }
      // 如果输入的是产品单价,那么要计算产品应收入。总数x产品单价=产品应收款
      if (key === '包含的产品_结算情况_产品单价') {
        row['包含的产品_结算情况_产品订单应收'] = Number(
          parseFloat(row['包含的产品_配码数量_总数'] * row[key]).toFixed(2)
        )
      }
      // 如果输入的是产品应收，那么计算产品单价
      if (key === '包含的产品_结算情况_产品订单应收') {
        row['包含的产品_结算情况_产品单价'] = Number(
          parseFloat(row[key] / row['包含的产品_配码数量_总数']).toFixed(2)
        )
      }
      // 发货数量要小于总数
      if (key === '包含的产品_结算情况_发货数量' && row[key] > row['总数']) {
        row[key] = row['总数']
      }
    },
    // 编辑按钮点击
    handleEdit(row) {
      row['结算状态是否可编辑'] = true
      this.btnLoading = true
      this.$nextTick(() => {
        this.btnLoading = false
        // 计算 结算记录列表，是否只有一行的 结算状态是否可编辑 为true
        var count = 0
        for (let i = 0; i < this.结算记录列表.length; i++) {
          const element = this.结算记录列表[i]
          if (element['结算状态是否可编辑']) {
            count += 1
          }
        }
        if (count === 0) {
          // 等于0 代表没有一行是可编辑的
          this.whetherOnlyOneLineOfSettlementStatusIsEditable = false
        } else if (count === 1) {
          this.whetherOnlyOneLineOfSettlementStatusIsEditable = true
        } else {
          this.whetherOnlyOneLineOfSettlementStatusIsEditable = false
        }
        // 如果该单价为0 那么提醒用户是否要自动补单价
        if (row['包含的产品_结算情况_产品单价'] === 0) {
          this.$confirm('是否需要自动补单价?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(async() => {
            var tags = {}
            for (const key in row) {
              if (
                key.includes('包含的产品_产品信息_tags') &&
                !key.includes('包含的产品_产品信息_tags_...')
              ) {
                var productKeys = key.split('.')
                var productKey = productKeys[productKeys.length - 1]
                tags[productKey] = row[key]
              }
            }
            var paramter = {
              login_token: this.$store.getters.token,
              data: {
                产品信息: {
                  unique_id: row['产品unique_id'],
                  产品编号: row['产品unique_id'],
                  tags: tags
                }
              }
            }
            var res = await match_recent_product_settle_info_by_product_info(
              paramter
            )
            row['包含的产品_结算情况_产品单价'] =
              res.data['结算情况']['产品单价'] || 0
            row['包含的产品_结算情况_产品订单应收'] = Number(
              parseFloat(
                row['包含的产品_配码数量_总数'] *
                  row['包含的产品_结算情况_产品单价']
              ).toFixed(2)
            )
          })
        }
      })
    },
    // 重置处理
    handleReset(row) {
      // 根据row.id找到 该row的索引，不可以用传递过来的索引，因为排序表格会发生错乱
      var index = this.结算记录列表.findIndex((item) => {
        return item.id === row.id
      })
      if (index !== -1) {
        this.结算记录列表[index][
          '包含的产品_结算情况_产品单价'
        ] = this.结算记录列表的副本[index]['包含的产品_结算情况_产品单价']
        this.结算记录列表[index][
          '包含的产品_结算情况_产品订单实收'
        ] = this.结算记录列表的副本[index]['包含的产品_结算情况_产品订单实收']
        this.结算记录列表[index][
          '包含的产品_结算情况_产品订单应收'
        ] = this.结算记录列表的副本[index]['包含的产品_结算情况_产品订单应收']
        this.结算记录列表[index][
          '包含的产品_结算情况_发货数量'
        ] = this.结算记录列表的副本[index]['包含的产品_结算情况_发货数量']
        this.结算记录列表[index][
          '包含的产品_结算情况_发货时间'
        ] = this.结算记录列表的副本[index]['包含的产品_结算情况_发货时间']
        this.结算记录列表[index][
          '包含的产品_结算情况_结算状态'
        ] = this.结算记录列表的副本[index]['包含的产品_结算情况_结算状态']
        this.结算记录列表[index]['结算状态是否可编辑'] = false

        // 计算 结算记录列表，是否只有一行的 结算状态是否可编辑 为true
        var count = 0
        for (let i = 0; i < this.结算记录列表.length; i++) {
          const element = this.结算记录列表[i]
          if (element['结算状态是否可编辑']) {
            count += 1
          }
        }
        if (count === 0) {
          // 等于0 代表没有一行是可编辑的
          this.whetherOnlyOneLineOfSettlementStatusIsEditable = false
        } else if (count === 1) {
          this.whetherOnlyOneLineOfSettlementStatusIsEditable = true
        } else {
          this.whetherOnlyOneLineOfSettlementStatusIsEditable = false
        }
      }
    },

    // 提交按钮点击
    async handleSubmit(row) {
      this.btnLoading = true
      var parameter = {
        login_token: this.$store.getters.token,
        订单unique_id: row.订单编号,
        产品unique_id: row.产品unique_id,
        结算情况: {
          结算状态: row['包含的产品_结算情况_结算状态'],
          产品单价: row['包含的产品_结算情况_产品单价'],
          产品订单应收: row['包含的产品_结算情况_产品订单应收'],
          产品订单实收: row['包含的产品_结算情况_产品订单实收'],
          发货数量: row['包含的产品_结算情况_发货数量'],
          发货时间: row['包含的产品_结算情况_发货时间'],
          备注: row['包含的产品_结算情况_备注']
        }
      }
      await order_settle_edit(parameter)
      this.$message({
        type: 'success',
        message: '订单的结算状态修改成功！！'
      })
      this.btnLoading = false
      // 重新查询
      this.$refs.orderConditionQuery.orderSettleFilterItems()
    },
    // 全部提交按钮点击
    async handleAllSubmit() {
      // 1.把需要提交的行全部找出来
      var rows = this.结算记录列表.filter((item) => {
        return item['结算状态是否可编辑'] === true
      })
      this.btnLoading = true
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i]
        var parameter = {
          login_token: this.$store.getters.token,
          订单unique_id: row.订单编号,
          产品unique_id: row.产品unique_id,
          结算情况: {
            结算状态: row['包含的产品_结算情况_结算状态'],
            产品单价: row['包含的产品_结算情况_产品单价'],
            产品订单应收: row['包含的产品_结算情况_产品订单应收'],
            产品订单实收: row['包含的产品_结算情况_产品订单实收'],
            发货数量: row['包含的产品_结算情况_发货数量'],
            发货时间: row['包含的产品_结算情况_发货时间'],
            备注: row['包含的产品_结算情况_备注']
          }
        }
        await order_settle_edit(parameter)
      }
      this.$message({
        type: 'success',
        message: '订单的结算状态全部修改成功！！'
      })
      this.btnLoading = false
      // 重新查询
      this.$refs.orderConditionQuery.orderSettleFilterItems()
    },
    // 导出excel
    async exportExcel() {
      const that = this
      this.btnLoading = true

      // 子表一： 订单结算表
      var tableData1_Header = [
        '订单编号',
        '订单日期',
        '交货日期',
        '订单完成百分比',
        ...this.$store.getters.订单的标签,
        ...this.$store.getters.产品的标签,
        '订单备注',
        ...this.配码数组,
        '总数',
        '产品订单实收',
        '产品订单应收',
        '发货数量',
        '发货时间',
        '备注',
        '结算状态'
      ]
      var tableData1_filterVal = [
        '订单编号',
        '订单日期',
        '交货日期',
        '订单完成百分比',
        ...this.$store.getters.订单的标签.map((tag) => {
          return 'tags_' + tag
        }),
        ...this.$store.getters.产品的标签.map((tag) => {
          return '包含的产品_产品信息_tags_' + tag
        }),
        '订单备注',
        ...this.配码数组,
        '总数',
        '包含的产品_结算情况_产品订单实收',
        '包含的产品_结算情况_产品订单应收',
        '包含的产品_结算情况_发货数量',
        '包含的产品_结算情况_发货时间',
        '包含的产品_结算情况_备注',
        '包含的产品_结算情况_结算状态'
      ]

      // 子表一： 订单结算统计表
      var tableData2_Header = ['应收款', '已收款', '应发货', '已发货']
      var tableData2_filterVal = ['应收款', '已收款', '应发货', '已发货']

      var tHeader = []
      tHeader.push(tableData1_Header)
      tHeader.push(tableData2_Header)

      var filterVal = []
      filterVal.push(tableData1_filterVal)
      filterVal.push(tableData2_filterVal)

      try {
        var response = await that.$refs.orderConditionQuery.orderSettleFilterAllItems()
        // this.excleprogressValue = 100
        // 表数据
        var json = []
        var tableData1 = response['结算记录列表']
        var tableData2 = []
        tableData2.push({
          应收款: response.settlementOfStatistical['应收款'],
          已收款: response.settlementOfStatistical['已收款'],
          应发货: response.settlementOfStatistical['应发货'],
          已发货: response.settlementOfStatistical['已发货']
        })

        json.push(tableData1)
        json.push(tableData2)

        var datas = []
        for (let j = 0; j < filterVal.length; j++) {
          const data = this.formatJson(filterVal[j], json[j])
          datas.push(data)
        }

        var ws_names = ['订单结算', '订单结算统计']

        import('@/vendor/Export2Excel').then((excel) => {
          excel.export_json_to_excel_multi_table({
            ws_names: ws_names,
            header: tHeader, // 表头 必填
            datas: datas, // 具体数据 必填
            filename: '订单结算表'
          })
          this.btnLoading = false
        })
      } catch (error) {
        console.error(error)
        that.btnLoading = false
      }
    },
    // 把json数据格式化，以便导出excel
    formatJson(filterVal, jsonData) {
      return jsonData.map((v) =>
        filterVal.map((j) => {
          return v[j]
        })
      )
    },
    // 是否显示列
    whetherToDisplayColumns(colName) {
      if (colName === '结算状态+') {
        return (
          this.checkList.includes('产品单价') ||
          this.checkList.includes('产品应收款') ||
          this.checkList.includes('产品实收款') ||
          this.checkList.includes('发货数量') ||
          this.checkList.includes('发货时间') ||
          this.checkList.includes('备注') ||
          this.checkList.includes('结算状态')
        )
      }
      return this.checkList.includes(colName)
    },
    handleCheckAllChange(val) {
      if (val) {
        this.checkList = deepClone(all_list)
      } else {
        this.checkList = ['订单编号', '订单详情', '结算状态']
      }
      this.是否展示表格 = false
      setTimeout(() => {
        this.是否展示表格 = true
      }, 0)
      this.isIndeterminate = false
    },
    formattedString(value) {
      return String(value)
    }
  }
}
</script>

<style lang="scss">
// 实收款和应收款颜色
.money0 .el-input .el-input__inner {
  color: #616161;
}
.money1 .el-input .el-input__inner {
  color: #388e3c;
}
.money2 .el-input .el-input__inner {
  color: #d32e30;
}
// 发货数量颜色
.green .el-input .el-input__inner {
  color: #870971;
}
.red .el-input .el-input__inner {
  color: #e16f0e;
}
// 订单状态颜色
.state1 .el-select .el-input__inner {
  background: #f4f4f5;
  border: 1px solid #8f9399;
  color: #616161;
}
.state2 .el-select .el-input__inner {
  background: #fff4f4;
  border: 1px solid #f07474;
  color: #f14748;
}
.state3 .el-select .el-input__inner {
  background: #f0f9eb;
  border: 1px solid #388e3c;
  color: #388e3c;
}
.state4 .el-select .el-input__inner {
  background: #fef6f2;
  border: 1px solid #e16f0e;
  color: #e16f0e;
}
.state5 .el-select .el-input__inner {
  background: #ebf5ff;
  border: 1px solid #098787;
  color: #098787;
}
.state6 .el-select .el-input__inner {
  background: #ebf5ff;
  border: 1px solid #e6a23c;
  color: #e6a23c;
  text-decoration: line-through;
}
.state7 .el-select .el-input__inner {
  background: #ebf5ff;
  border: 1px solid #f56c6c;
  color: #f56c6c;
  text-decoration: line-through;
}
.order-settle {
  .module-c {
    width: 100%;
    overflow: auto;
    .title {
      height: 40px;
      line-height: 40px;
      margin-left: 20px;
      margin-bottom: 20px;
    }
    .checkbox-group {
      margin-left: 20px;
      width: 1000px;
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-start;
      .el-checkbox {
        margin-bottom: 10px;
      }
    }
    .table {
      margin-bottom: 20px;
      min-width: 100%;
    }
    .paging {
      overflow: hidden;
      margin-bottom: 100px;
      .paging-a {
        float: right;
      }
    }
  }
  .el-card__body {
    padding-bottom: 0px;
  }
}
.cross-out {
  position: relative;
}
.cross-out::before {
  content: " ";
  position: absolute;
  width: 100%;
  height: 1px;
  background: #616161;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
