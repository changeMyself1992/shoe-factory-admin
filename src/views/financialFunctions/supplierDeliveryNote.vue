<template>
  <div class="supplierDeliveryNote">
    <div class="useintro">
      <el-dropdown :show-timeout="0" @command="handleCommand">
        <img src="@/assets/images/help.png" class="help">
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="a">如何查看各个供应商的结算情况及详细的流水单？</el-dropdown-item>
          <el-dropdown-item command="b">如何导出各个供应商的结算统计Excel表？</el-dropdown-item>
          <el-dropdown-item command="c">供应商如何配合使用本系统进行送货？</el-dropdown-item>
          <el-dropdown-item command="d">工厂怎样确认一个送货单？</el-dropdown-item>
          <el-dropdown-item command="e">工厂如何手动添加一个送货记录或退货记录？</el-dropdown-item>
          <el-dropdown-item command="f">工厂如何使用现结单功能?</el-dropdown-item>
          <el-dropdown-item command="g" class="blue">更多问题，请访问帮助中心</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>

    <!-- 供应商结算统计 模块-->
    <el-card v-if="管理权限['供应商结算列表可读']" class="box-card">
      <div slot="header" class="clearfix" style="text-align: center;">
        <h3>供应商结算统计</h3>
      </div>
      <div slot="header" class="clearfix">
        <div class="base-info">
          <div class="header">
            <b>条件查询供应商结算统计记录</b>
          </div>

          <el-form class="info-box" :model="formSupplier" label-position="left">
            <el-form-item class="item-1" label="记录时间段:" label-width="100px">
              <template>
                <el-radio v-model.trim="radioA" label="0">今日</el-radio>
                <el-radio v-model.trim="radioA" label="1">昨日</el-radio>
                <el-radio v-model.trim="radioA" label="2">本月</el-radio>
                <el-radio v-model.trim="radioA" label="3">自定义</el-radio>
              </template>
              <el-date-picker
                v-model.trim="formSupplier.记录时间段"
                class="picker"
                type="daterange"
                unlink-panels
                range-separator="-"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                :disabled="radioA!=='3'"
              />
            </el-form-item>
            <el-form-item class="item-1" label="流水单类型:" label-width="100px">
              <el-checkbox
                v-for="status in deliveryNoteTypeOpetion"
                :key="status"
                v-model="流水单类型"
                :label="status"
              >{{ status }}</el-checkbox>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <div class="module-c">
        <el-table
          v-if="supplierSettlementStatistics&&supplierSettlementStatistics['供应商结算统计列表']"
          :max-height="tableHeight"
          :data="supplierSettlementStatistics['供应商结算统计列表']"
          border
        >
          <el-table-column align="center" label="操作" width="120">
            <template slot-scope="scope">
              <el-button
                type="primary"
                size="mini"
                :disabled="!管理权限['供应商结算列表可读']"
                @click="onClickViewAllInvoicesForThisVendor(scope.row)"
              >流水单详情</el-button>
            </template>
          </el-table-column>

          <el-table-column align="center" prop="名称" label="供应商名称" min-width="200">
            <template slot-scope="scope">
              <el-button @click="viewSupplierDetails(scope.row)">
                <span>{{ scope.row['名称'] }}</span>
                <svg-icon
                  :icon-class="scope.row['if_unified_match']?'yrz':'wrz'"
                  :class-name="scope.row['if_unified_match']?'yrz':'wrz'"
                />
              </el-button>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="联系电话" label="联系电话" min-width="130" />

          <!--送货单-->
          <el-table-column
            v-if="whetherToDisplayTheDeliveryListColumn"
            label="送货单统计"
            align="center"
            label-class-name="delivery-note row-1"
          >
            <el-table-column align="center" width="100" label-class-name="delivery-note row-2">
              <template slot="header">
                <!-- <div class="delivery-note-col"> -->
                <!--自定义表头-->
                <p style="text-align:center;">已确认金额</p>
                <el-tag
                  v-if="supplierSettlementStatistics"
                  style="width:90%;text-align:center;"
                  effect="dark"
                  class="tag"
                >{{ supplierSettlementStatistics['已确认的送货单总计金额'] }}</el-tag>
                <!-- </div> -->
              </template>
              <template slot-scope="scope">
                <span>{{ scope.row['已确认的送货单金额'] }}</span>
              </template>
            </el-table-column>

            <el-table-column align="center" width="100" label-class-name="delivery-note row-2">
              <template slot="header">
                <!--自定义表头-->
                <p style="text-align:center;">已结算金额</p>
                <el-tag
                  v-if="supplierSettlementStatistics"
                  style="width:90%;text-align:center;"
                  effect="dark"
                  class="tag"
                >{{ supplierSettlementStatistics['已结算的送货单总计金额'] }}</el-tag>
              </template>
              <template slot-scope="scope">
                <span>{{ scope.row['已结算的送货单金额'] }}</span>
              </template>
            </el-table-column>

            <el-table-column align="center" width="100" label-class-name="delivery-note row-2">
              <template slot="header">
                <!--自定义表头-->
                <p style="text-align:center;">未确认金额</p>
                <el-tag
                  v-if="supplierSettlementStatistics"
                  style="width:90%;text-align:center;"
                  effect="dark"
                  class="tag"
                >{{ supplierSettlementStatistics['未确认的送货单总计金额'] }}</el-tag>
              </template>
              <template slot-scope="scope">
                <span>{{ scope.row['未确认的送货单金额'] }}</span>
              </template>
            </el-table-column>

            <el-table-column align="center" width="100" label-class-name="delivery-note row-2">
              <template slot="header">
                <!--自定义表头-->
                <p style="text-align:center;">待作废金额</p>
                <el-tag
                  v-if="supplierSettlementStatistics"
                  style="width:90%;text-align:center;"
                  effect="dark"
                  class="tag"
                >{{ supplierSettlementStatistics['待作废的送货单总计金额'] }}</el-tag>
              </template>
              <template slot-scope="scope">
                <span>{{ scope.row['待作废的送货单金额'] }}</span>
              </template>
            </el-table-column>
          </el-table-column>

          <!--退货单-->
          <el-table-column
            v-if="whetherToDisplayTheReturnColumn"
            label="退货单统计"
            align="center"
            label-class-name="return-order row-1"
          >
            <!--待退货-->
            <el-table-column align="center" width="100" label-class-name="return-order row-2">
              <template slot="header">
                <!--自定义表头-->
                <p style="text-align:center;">待退货金额</p>
                <el-tag
                  v-if="supplierSettlementStatistics"
                  style="width:90%;text-align:center;"
                  effect="dark"
                  class="tag"
                >{{ supplierSettlementStatistics['待退货的退货单总计金额'] }}</el-tag>
              </template>
              <template slot-scope="scope">
                <span>{{ scope.row['待退货的退货单金额'] }}</span>
              </template>
            </el-table-column>

            <!--已退货-->
            <el-table-column align="center" width="100" label-class-name="return-order row-2">
              <template slot="header">
                <p style="text-align:center;">已退货金额</p>
                <el-tag
                  v-if="supplierSettlementStatistics"
                  style="width:90%;text-align:center;"
                  effect="dark"
                  class="tag"
                >{{ supplierSettlementStatistics['已退货的退货单总计金额'] }}</el-tag>
              </template>
              <template slot-scope="scope">
                <span>{{ scope.row['已退货的退货单金额'] }}</span>
              </template>
            </el-table-column>

            <!--待作废-->
            <el-table-column align="center" width="100" label-class-name="return-order row-2">
              <template slot="header">
                <p style="text-align:center;">待作废金额</p>
                <el-tag
                  v-if="supplierSettlementStatistics"
                  style="width:90%;text-align:center;"
                  effect="dark"
                  class="tag"
                >{{ supplierSettlementStatistics['待作废的退货单总计金额'] }}</el-tag>
              </template>
              <template slot-scope="scope">
                <span>{{ scope.row['待作废的退货单金额'] }}</span>
              </template>
            </el-table-column>
          </el-table-column>

          <!--现结单-->
          <el-table-column
            v-if="whetherToDisplayTheCurrentColumn"
            label="现结单统计"
            align="center"
            label-class-name="current-statement row-1"
          >
            <!--未结算-->
            <el-table-column width="100" align="center" label-class-name="current-statement row-2">
              <template slot="header">
                <p style="text-align:center;">未结算金额</p>
                <el-tag
                  v-if="supplierSettlementStatistics"
                  style="width:90%;text-align:center;"
                  effect="dark"
                  class="tag"
                >{{ supplierSettlementStatistics['未结算的现结单总计金额'] }}</el-tag>
              </template>
              <template slot-scope="scope">
                <span>{{ scope.row['未结算的现结单金额'] }}</span>
              </template>
            </el-table-column>

            <!--已结算-->
            <el-table-column width="100" align="center" label-class-name="current-statement row-2">
              <template slot="header">
                <p style="text-align:center;">已结算金额</p>
                <el-tag
                  v-if="supplierSettlementStatistics"
                  style="width:90%;text-align:center;"
                  effect="dark"
                  class="tag"
                >{{ supplierSettlementStatistics['已结算的现结单总计金额'] }}</el-tag>
              </template>
              <template slot-scope="scope">
                <span>{{ scope.row['已结算的现结单金额'] }}</span>
              </template>
            </el-table-column>
          </el-table-column>
        </el-table>

        <el-pagination
          class="el-pagination"
          :current-page="supplierSettlement_currentPage"
          :page-sizes="[50, 100, 150, 200]"
          :page-size="supplierSettlement_pageSize"
          :total="supplierSettlement_total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSupplierSettlementPageSizeChange"
          @current-change="handleSupplierSettlementCurrentPage"
        />
      </div>
    </el-card>

    <!--流水单记录 块-->
    <el-card v-if="管理权限['供应商流水单列表可读']" class="bx-card">
      <div slot="header" class="clearfix" style="text-align: center;">
        <h3>流水单记录</h3>
      </div>
      <div slot="header" class="clearfix">
        <delivery-note-condition-query
          id="deliveryNoteConditionQuery"
          ref="deliveryNoteConditionQuery"
          :current-page="deliveryNote_currentPage"
          :page-size="deliveryNote_pageSize"
          :callback-after-condition-query="callbackAfterConditionQuery"
          :init-pagination="initPagination"
          :is-check-the-delivery-note-to-be-confirmed="isCheckTheDeliveryNoteToBeConfirmed"
        />
      </div>
      <div class="module-c">
        <div class="row-1">
          <div class="btn">
            <el-button
              type="primary"
              size="small"
              :loading="btnLoading"
              :disabled="!管理权限['供应商流水单列表可读']"
              @click="exportExcel()"
            >导出EXCEL表格</el-button>

            <el-button
              type="primary"
              size="small"
              :loading="btnLoading"
              :disabled="multipleSelection.length===0||!管理权限['确认送货单']?true:false"
              @click="BatchConfirmSupplierTransactionByIds()"
            >批量确认送货单</el-button>
            <el-button
              type="primary"
              size="small"
              :loading="btnLoading"
              :disabled="multipleSelection.length===0||!管理权限['结算送货单']?true:false"
              @click="batchSettleSupplierTransactionByIds()"
            >批量结算送货单</el-button>

            <!-- 退货功能 -->
            <el-button
              type="primary"
              size="small"
              :loading="btnLoading"
              :disabled="!管理权限['添加退货单']"
              @click="addReturnNote()"
            >添加退货单</el-button>
            <!-- 送货功能 -->
            <el-button
              type="primary"
              size="small"
              :loading="btnLoading"
              :disabled="!管理权限['添加送货单']"
              @click="addDeliverNote()"
            >添加送货单</el-button>
            <!-- 现结单功能 -->
            <el-button
              type="primary"
              size="small"
              :loading="btnLoading"
              :disabled="!管理权限['添加现结单']"
              @click="addNowTheStatement()"
            >添加现结单</el-button>
          </div>

          <div v-if="supplierToEnterTheQrCode" class="img-box">
            <span>供应商扫码送货：</span>
            <img :src="supplierToEnterTheQrCode">
          </div>
        </div>

        <el-table
          :max-height="tableHeight"
          :data="deliveryNoteList"
          border
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column align="center" prop="流水单类型" label="流水单类型" width="80">
            <template slot-scope="scope">
              <div v-if="scope.row.流水单类型 === '送货单'" class="green">{{ scope.row.流水单类型 }}</div>
              <div v-else-if="scope.row.流水单类型 === '退货单'" class="red">{{ scope.row.流水单类型 }}</div>
              <div v-else-if="scope.row.流水单类型 === '现结单'" class>{{ scope.row.流水单类型 }}</div>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="交易状态" label="交易状态" width="80">
            <template slot-scope="scope">
              <div :class="scope.row.交易状态 === '未确认'? 'red':''">{{ scope.row.交易状态 }}</div>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="供应商名称" label="供应商名称" width="200">
            <template slot-scope="scope">
              <el-button @click="viewSupplierDetails(scope.row)">
                <span>{{ scope.row['供应商名称'] }}</span>
                <svg-icon
                  :icon-class="scope.row['if_unified_match']?'yrz':'wrz'"
                  :class-name="scope.row['if_unified_match']?'yrz':'wrz'"
                />
              </el-button>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="货号" label="货号" width="120" />
          <el-table-column align="center" prop="名称及规格" label="名称及规格" width="120" />
          <el-table-column align="center" label="单价/单位" min-width="110">
            <template slot-scope="scope">
              <span>{{ scope.row.单价 }}元 / {{ scope.row.单位 }}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="数量" label="数量" width="90" />

          <el-table-column align="center" prop="总价格" label="总价" width="90" />
          <el-table-column align="center" label="送货人（电话）" min-width="180">
            <template slot-scope="scope">
              <!--如果送货人姓名和送货单位经手人手机同时存在-->
              <span
                v-if="scope.row['送货人姓名'] && scope.row['送货单位经手人手机']"
              >{{ scope.row['送货人姓名'] }}（{{ scope.row['送货单位经手人手机'] }}）</span>
              <!--如果只存在送货人姓名-->
              <span v-else-if="scope.row['送货人姓名']">
                {{ scope.row['送货人姓名'] }}
              </span>
              <!--如果只存在送货单位经手人手机-->
              <span v-else-if="scope.row['送货单位经手人手机']">
                {{ scope.row['送货单位经手人手机'] }}
              </span>
            </template>
          </el-table-column>
          <el-table-column align="center" label="收货人（电话）" min-width="180">
            <template slot-scope="scope">
              <!--如果收货人姓名和收货单位经手人手机同时存在-->
              <span
                v-if="scope.row['收货人姓名'] && scope.row['收货单位经手人手机']"
              >{{ scope.row['收货人姓名'] }}（{{ scope.row['收货单位经手人手机'] }}）</span>
              <!--如果只存在收货人姓名-->
              <span v-else-if="scope.row['收货人姓名']">
                {{ scope.row['收货人姓名'] }}
              </span>
              <!--如果只存在收货单位经手人手机-->
              <span v-else-if="scope.row['收货单位经手人手机']">
                {{ scope.row['收货单位经手人手机'] }}
              </span>
            </template>
          </el-table-column>
          <el-table-column align="center" label="付款人（电话）" min-width="180">
            <template slot-scope="scope">
              <!--如果付款人姓名和付款人手机同时存在-->
              <span
                v-if="scope.row['付款人姓名'] && scope.row['付款人手机']"
              >{{ scope.row['付款人姓名'] }}（{{ scope.row['付款人手机'] }}）</span>
              <!--如果只存在付款人姓名-->
              <span v-else-if="scope.row['付款人姓名']">
                {{ scope.row['付款人姓名'] }}
              </span>
              <!--如果只存在付款人手机-->
              <span v-else-if="scope.row['付款人手机']">
                {{ scope.row['付款人手机'] }}
              </span>
            </template>
          </el-table-column>
          <el-table-column type="expand" align="center" label="备注信息展开" width="90">
            <template slot-scope="scope">
              <div v-if="scope.row['流水单类型']==='送货单'" class="product-note-box">
                <el-card class="box-card">
                  <div slot="header" class="clearfix">
                    <strong style="margin-right:10px;">备注</strong>
                    <el-button
                      type="primary"
                      size="mini"
                      :disabled="!管理权限['编辑流水单']"
                      @click="onSubmitANote(scope.row)"
                    >提交备注</el-button>
                  </div>
                  <el-input
                    v-model="scope.row.备注"
                    type="textarea"
                    :disabled="false"
                    placeholder="备注"
                  />
                </el-card>
              </div>
              <div v-else>{{ scope.row.备注?scope.row.备注:'无任何备注信息' }}</div>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="记录时间" label="记录时间" width="180" />
          <el-table-column align="center" label="操作" width="250">
            <template slot-scope="scope">
              <!--送货单的操作按钮-->
              <div v-if="scope.row['流水单类型']==='送货单'" class="btn-box">
                <el-button
                  v-if="whetherToDisplayTheActionButton(scope.row,'确认送货单')"
                  type="primary"
                  size="mini"
                  :disabled="!(管理权限['确认送货单'] && scope.row['添加送货发起方']==='供应商')"
                  :loading="btnLoading"
                  @click="onConfirmTheSupplierEidt(scope.row)"
                >确认送货单</el-button>

                <el-button
                  v-if="whetherToDisplayTheActionButton(scope.row,'结算送货单')"
                  type="primary"
                  size="mini"
                  :disabled="!管理权限['结算送货单']"
                  @click="settleSupplierDetailInfo(scope.row)"
                >结算送货单</el-button>

                <el-button
                  v-if="whetherToDisplayTheActionButton(scope.row,'作废送货单')"
                  type="danger"
                  size="mini"
                  :disabled="!管理权限['作废送货单']"
                  :loading="btnLoading"
                  @click="deleteSupplier(scope.row)"
                >作废送货单</el-button>

                <el-button
                  v-if="whetherToDisplayTheActionButton(scope.row,'确认作废送货单')"
                  type="danger"
                  size="mini"
                  :disabled="!(管理权限['确认作废送货单']&&scope.row['作废送货发起方']==='供应商')"
                  :loading="btnLoading"
                  @click="confirmingDeleteSupplier(scope.row)"
                >确认作废送货单</el-button>
              </div>

              <!-- 退货单的操作按钮 -->
              <div v-if="scope.row['流水单类型']==='退货单'" class="btn-box">
                <el-button
                  v-if="whetherToDisplayTheActionButton(scope.row,'确认退货单')"
                  type="primary"
                  size="mini"
                  :disabled="!(管理权限['确认退货单'] && scope.row['添加退货发起方']==='供应商')"
                  :loading="btnLoading"
                  @click="sureRerurn(scope.row)"
                >确认退货单</el-button>
                <el-button
                  v-if="whetherToDisplayTheActionButton(scope.row,'作废退货单')"
                  type="danger"
                  size="mini"
                  :disabled="!管理权限['退货作废退货单']"
                  :loading="btnLoading"
                  @click="delRerurn(scope.row)"
                >作废退货单</el-button>
                <el-button
                  v-if="whetherToDisplayTheActionButton(scope.row,'确认作废退货单')"
                  type="danger"
                  size="mini"
                  :disabled="!(管理权限['确认退货作废退货单'] && scope.row['作废退货发起方']==='供应商')"
                  :loading="btnLoading"
                  @click="sureDelRerurn(scope.row)"
                >确认作废退货单</el-button>
              </div>

              <!--现结单的操作按钮-->
              <div v-if="scope.row['流水单类型']==='现结单'" class="btn-box">
                <el-button
                  v-if="whetherToDisplayTheActionButton(scope.row,'结算现结单')"
                  type="primary"
                  size="mini"
                  :disabled="!管理权限['结算现结单']"
                  :loading="btnLoading"
                  @click="settleTheCurrentStatement(scope.row)"
                >结算现结单</el-button>
                <el-button
                  v-if="whetherToDisplayTheActionButton(scope.row,'作废现结单')"
                  type="danger"
                  size="mini"
                  :disabled="!管理权限['作废现结单']"
                  :loading="btnLoading"
                  @click="voidCashStatement(scope.row)"
                >作废现结单</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>

        <el-pagination
          class="el-pagination"
          :current-page="deliveryNote_currentPage"
          :page-sizes="[50, 100, 150, 200]"
          :page-size="deliveryNote_pageSize"
          :total="deliveryNote_total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script>
var date = new Date()
var y = date.getFullYear()
var m = date.getMonth()
var d = date.getDate()
import { parseTime, deepClone } from '@/utils'
import {
  batch_settle_supplier_transaction_by_ids,
  batch_confirm_supplier_transaction_by_ids,
  confirm_supplier_transaction_by_id,
  delete_supplier_transaction_by_id,
  confirm_delete_supplier_transaction_by_id,
  generate_wx_qr_code,
  generate_supplier_settlement_stats_summary_list,
  settle_supplier_transaction_by_id,
  edit_supplier_transaction_by_id,
  settle_cash_supplier_transaction,
  delete_cash_supplier_transaction_by_id
} from '@/api/supplier'
import {
  confirm_refund_transaction_by_id,
  delete_refund_transaction_by_id
} from '@/api/supplier'
import deliveryNoteConditionQuery from '@/views/components/deliveryNoteConditionQuery'

import { mapGetters } from 'vuex'
export default {
  components: { deliveryNoteConditionQuery },
  data() {
    return {
      // 是否启用按钮loading状态防止多次点击
      btnLoading: false,
      // 供应商结算统计记录 时间段快捷选项
      radioA: '2',
      // 供应商结算统计搜索条件
      formSupplier: {
        记录时间段: []
      },
      // 供应商结算统计结果
      supplierSettlementStatistics: {},
      // 结算记录的总条目数
      supplierSettlement_total: 0,
      // 供应商结算的当前页数
      supplierSettlement_currentPage: 1,
      // 供应商结算的每页数据量
      supplierSettlement_pageSize: 50,
      // 流水单类型opetion
      deliveryNoteTypeOpetion: ['送货单', '退货单', '现结单'],
      流水单类型: ['送货单', '退货单', '现结单'],

      // 流水单列表
      deliveryNoteList: [],
      // 送货单的总条目数
      deliveryNote_total: 0,
      // 送货单的当前页数
      deliveryNote_currentPage: 1,
      // 送货单的每页数据量
      deliveryNote_pageSize: 50,
      // 供应商录入二维码
      supplierToEnterTheQrCode: '',
      // 表格多选数组
      multipleSelection: [],
      // 是否要查询待确认的送货单
      isCheckTheDeliveryNoteToBeConfirmed: false,
      tableHeight: ''
    }
  },
  computed: {
    ...mapGetters(['管理权限']),
    // 是否显示送货单列
    whetherToDisplayTheDeliveryListColumn: function() {
      if (this.流水单类型.includes('送货单')) return true
      return false
    },
    // 是否显示退货单列
    whetherToDisplayTheReturnColumn: function() {
      if (this.流水单类型.includes('退货单')) return true
      return false
    },
    // 是否显示现结单列
    whetherToDisplayTheCurrentColumn: function() {
      if (this.流水单类型.includes('现结单')) return true
      return false
    }
  },
  watch: {
    radioA: function(newVal, oldVal) {
      this.formSupplier['记录时间段'] = []
      switch (newVal) {
        case '0':
          // 今日
          this.formSupplier['记录时间段'][0] = new Date(
            Date.parse(new Date(y, m, d))
          )
          this.formSupplier['记录时间段'][1] = new Date(
            Date.parse(new Date(y, m, d + 1)) - 1000
          )
          break
        case '1':
          // 昨日
          this.formSupplier['记录时间段'][0] = new Date(
            Date.parse(new Date(y, m, d - 1))
          )
          this.formSupplier['记录时间段'][1] = new Date(
            Date.parse(new Date(y, m, d)) - 1000
          )
          break
        case '2':
          // 本月
          var firstDay = new Date(y, m, 1)
          var lastDay = new Date(y, m + 1, 0, 23, 59, 59)
          this.formSupplier['记录时间段'][0] = firstDay
          this.formSupplier['记录时间段'][1] = lastDay
      }
    },
    'formSupplier.记录时间段': function(newVal, oldVal) {
      if (newVal.length === 2) {
        this.generateSupplierSettlementStatsSummaryList()
      }
    }
  },
  created() {
    this.getTheSupplierToEnterTheQrCode()
    this.tableHeight = window.innerHeight * 0.75
    if (this.formSupplier['记录时间段'].length === 0) {
      var date = new Date()
      var y = date.getFullYear()
      var m = date.getMonth()
      var firstDay = new Date(y, m, 1)
      var lastDay = new Date(y, m + 1, 0, 23, 59, 59)
      this.formSupplier['记录时间段'][0] = firstDay
      this.formSupplier['记录时间段'][1] = lastDay
    }
    // 是否要查询待确认的送货单
    if (this.$route.query.isCheckTheDeliveryNoteToBeConfirmed) {
      this.isCheckTheDeliveryNoteToBeConfirmed = true
    }
  },
  // 进入该页面后，查询列表API
  mounted() {
    if (this.isCheckTheDeliveryNoteToBeConfirmed) {
      const anchorElement = document.getElementById('deliveryNoteConditionQuery')
      if (anchorElement) {
        setTimeout(() => {
          anchorElement.scrollIntoView()
        }, 1200)
      }
    }

    this.$refs.deliveryNoteConditionQuery.filterSupplierTransactions()
    this.generateSupplierSettlementStatsSummaryList()
  },
  methods: {
    // 查看指引
    handleCommand(command) {
      console.log(command)
      var x = null
      var y = null
      if (command === 'g') {
        const { href } = this.$router.resolve({
          path: '/instructionsForuse/index'
        })
        window.open(href, '_blank')
      } else {
        if (command === 'a') {
          x = 3
          y = 8
        } else if (command === 'b') {
          x = 3
          y = 9
        } else if (command === 'c') {
          x = 3
          y = 10
        } else if (command === 'd') {
          x = 3
          y = 11
        } else if (command === 'e') {
          x = 3
          y = 12
        } else if (command === 'f') {
          x = 3
          y = 13
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

    // 添加退货单
    addReturnNote() {
      this.$router.push({
        path: '/financialFunctions/supplierAddReturnNote'
      })
    },
    // 添加送货单
    addDeliverNote() {
      this.$router.push({
        path: '/financialFunctions/supplierAddDeliverNote'
      })
    },
    // 添加现结单
    addNowTheStatement() {
      this.$router.push({
        path: '/financialFunctions/supplierAddNowTheStatement'
      })
    },
    // 获取供应商送货单录入微信跳转二维码
    async getTheSupplierToEnterTheQrCode() {
      var login_token = this.$store.getters.token
      var post_data = {
        login_token: login_token
      }
      var res = await generate_wx_qr_code(post_data)
      this.supplierToEnterTheQrCode = res.data['二维码']
    },
    // 查看供应商详情
    viewSupplierDetails(supplierInfo) {
      this.$router.push({
        path: '/supplierManagement/supplierList',
        query: {
          名称: supplierInfo['名称'] || supplierInfo['供应商名称'] || ''
        } // 模式为添加产品模式
      })
    },

    /** 供应商结算记录统计******************************start********************************************* */

    // 供应商结算统计----页码控制时，每页数量改变的处理函数
    handleSupplierSettlementPageSizeChange(val) {
      this.supplierSettlement_pageSize = val
      this.generateSupplierSettlementStatsSummaryList()
    },
    // 供应商结算统计----页码控制时，页码改变的处理函数
    handleSupplierSettlementCurrentPage(val) {
      this.supplierSettlement_currentPage = val
      this.generateSupplierSettlementStatsSummaryList()
    },
    // 条件查询供应商统计
    async generateSupplierSettlementStatsSummaryList() {
      var login_token = this.$store.getters.token
      var post_data = {
        login_token: login_token,
        pagination: {
          page: parseInt(this.supplierSettlement_currentPage),
          limit: parseInt(this.supplierSettlement_pageSize)
        },
        sort: { 更新时间: -1 }
      }
      if (this.formSupplier.记录时间段.length === 2) {
        post_data['记录时间_上限'] = parseTime(
          new Date(this.formSupplier.记录时间段[1])
        )
        post_data['记录时间_下限'] = parseTime(
          new Date(this.formSupplier.记录时间段[0])
        )
      }

      var response = await generate_supplier_settlement_stats_summary_list(
        post_data
      )
      this.supplierSettlement_total = response.data['供应商个数']

      this.supplierSettlementStatistics = null
      this.$nextTick(() => {
        this.supplierSettlementStatistics = response.data
      })
    },

    /** 供应商结算记录统计******************************end*********************************************** */

    /** 流水单******************************start********************************************* */

    // 流水单----页码控制时，每页数量改变的处理函数
    handleSizeChange(val) {
      this.deliveryNote_pageSize = val
    },
    // 流水单----页码控制时，页码改变的处理函数
    handleCurrentChange(val) {
      this.deliveryNote_currentPage = val
    },
    // 重置 deliveryNote_currentPage 和 deliveryNote_pageSize
    initPagination() {
      if (
        this.deliveryNote_currentPage === 1 &&
        this.deliveryNote_pageSize === 50
      ) {
        this.$refs.deliveryNoteConditionQuery.filterSupplierTransactions()
        return
      }
      this.deliveryNote_currentPage = 1
      this.deliveryNote_pageSize = 50
    },
    // 流水单查询回调方法
    callbackAfterConditionQuery(res) {
      if (res && res.data) {
        this.deliveryNoteList = res.data
        this.deliveryNote_total = res.total_count
      }
    },

    /**
     * 送货单按钮方法*****************************start**************************
     */

    // 确认送货单单按钮点击
    async onConfirmTheSupplierEidt(noteSupply) {
      var supplier_post_data = {
        login_token: this.$store.getters.token,
        unique_id: noteSupply.unique_id
      }
      this.btnLoading = true
      setTimeout(() => {
        this.btnLoading = false
      }, 1000)
      await confirm_supplier_transaction_by_id(supplier_post_data)
      this.$message({
        type: 'success',
        message: '确定操作已成功'
      })
      this.$refs.deliveryNoteConditionQuery.filterSupplierTransactions()
    },

    // 结算送货单按钮点击
    async settleSupplierDetailInfo(supplierInfo) {
      var supplier_post_data = {
        login_token: this.$store.getters.token,
        unique_id: supplierInfo.unique_id
      }
      this.btnLoading = true
      setTimeout(() => {
        this.btnLoading = false
      }, 1000)
      const res = await settle_supplier_transaction_by_id(supplier_post_data)
      this.$message({
        type: 'success',
        message: res.msg
      })
      this.$refs.deliveryNoteConditionQuery.filterSupplierTransactions()
    },

    // 作废送货单按钮点击
    async deleteSupplier(supplierInfo) {
      if (!confirm('确定进行作废吗？修改后供应商记录会永久作废')) {
        return false
      }
      var supplierUniqueId = supplierInfo.unique_id
      var post_data = {
        login_token: this.$store.getters.token,
        unique_id: supplierUniqueId
      }
      this.btnLoading = true
      setTimeout(() => {
        this.btnLoading = false
      }, 1000)
      var response = await delete_supplier_transaction_by_id(post_data)
      this.$message({
        type: 'success',
        message: response.msg
      })
      this.$refs.deliveryNoteConditionQuery.filterSupplierTransactions()
    },

    // 确认作废流水单按钮点击
    async confirmingDeleteSupplier(supplierInfo) {
      if (!confirm('确定进行确认作废吗？修改后供应商记录会永久作废')) {
        return false
      }
      var supplierUniqueId = supplierInfo.unique_id
      var post_data = {
        login_token: this.$store.getters.token,
        unique_id: supplierUniqueId
      }
      this.btnLoading = true
      setTimeout(() => {
        this.btnLoading = false
      }, 1000)
      var response = await confirm_delete_supplier_transaction_by_id(post_data)
      this.$message({
        type: 'success',
        message: response.msg
      })
      this.$refs.deliveryNoteConditionQuery.filterSupplierTransactions()
    },

    // 批量确认流水单信息
    async BatchConfirmSupplierTransactionByIds() {
      var unique_ids = []
      for (let i = 0; i < this.multipleSelection.length; i++) {
        const element = this.multipleSelection[i]
        if (element['流水单类型'] !== '送货单') {
          this.$message({
            type: 'warning',
            message: '只允许批量确认送货单！'
          })
          return
        }
        if (
          element['交易状态'] !== '未确认' &&
          element['交易状态'] !== '已结算'
        ) {
          this.$message({
            type: 'warning',
            message: '只允许确认未确认的和已结算的送货单！'
          })
          return
        }
        unique_ids.push(element.unique_id)
      }
      var paramter = {
        login_token: this.$store.getters.token,
        unique_ids: unique_ids
      }
      this.btnLoading = true
      setTimeout(() => {
        this.btnLoading = false
      }, 1000)
      const res = await batch_confirm_supplier_transaction_by_ids(paramter)
      this.$message({
        type: 'success',
        message: res.msg
      })
      this.$refs.deliveryNoteConditionQuery.filterSupplierTransactions()
      this.multipleSelection = []
    },

    // 批量结算流水单信息
    async batchSettleSupplierTransactionByIds() {
      var unique_ids = []
      for (let i = 0; i < this.multipleSelection.length; i++) {
        const element = this.multipleSelection[i]
        if (element['流水单类型'] !== '送货单') {
          this.$message({
            type: 'warning',
            message: '只允许批量结算送货单！'
          })
          return
        }
        if (element['交易状态'] !== '已确认') {
          this.$message({
            type: 'warning',
            message: '只允许结算已确认的送货单！'
          })
          return
        }
        unique_ids.push(element.unique_id)
      }
      var paramter = {
        login_token: this.$store.getters.token,
        unique_ids: unique_ids
      }
      this.btnLoading = true
      setTimeout(() => {
        this.btnLoading = false
      }, 1000)
      const res = await batch_settle_supplier_transaction_by_ids(paramter)
      this.$message({
        type: 'success',
        message: res.msg
      })
      this.$refs.deliveryNoteConditionQuery.filterSupplierTransactions()
      this.multipleSelection = []
    },

    /**
     * 送货单按钮方法*****************************end**************************
     */

    /**
     * 退货单按钮方法*****************************start**************************
     */

    // 确认退货单
    async sureRerurn(supplierInfo) {
      var supplier_post_data = {
        login_token: this.$store.getters.token,
        unique_id: supplierInfo.unique_id
      }
      this.btnLoading = true
      setTimeout(() => {
        this.btnLoading = false
      }, 1000)
      await confirm_refund_transaction_by_id(supplier_post_data)
      this.btnLoading = false
      this.$message({
        type: 'success',
        message: '确认退货操作已成功'
      })
      this.$refs.deliveryNoteConditionQuery.filterSupplierTransactions()
    },

    // 作废退货
    async delRerurn(supplierInfo) {
      var supplier_post_data = {
        login_token: this.$store.getters.token,
        unique_id: supplierInfo.unique_id,
        订单状态: supplierInfo.交易状态
      }
      this.btnLoading = true
      setTimeout(() => {
        this.btnLoading = false
      }, 1000)
      await delete_refund_transaction_by_id(supplier_post_data)
      this.$message({
        type: 'success',
        message: '作废退货操作已成功'
      })
      this.$refs.deliveryNoteConditionQuery.filterSupplierTransactions()
    },

    // 确认作废退货
    async sureDelRerurn(supplierInfo) {
      var supplier_post_data = {
        login_token: this.$store.getters.token,
        unique_id: supplierInfo.unique_id,
        订单状态: supplierInfo.交易状态
      }
      this.btnLoading = true
      setTimeout(() => {
        this.btnLoading = false
      }, 1000)
      await delete_refund_transaction_by_id(supplier_post_data)
      this.btnLoading = false
      this.$message({
        type: 'success',
        message: '确认作废退货操作已成功'
      })
      this.$refs.deliveryNoteConditionQuery.filterSupplierTransactions()
    },

    /**
     * 退货单按钮方法*****************************end**************************
     */

    /**
     * 现结单按钮方法*****************************start**************************
     */
    // 结算现结单
    async settleTheCurrentStatement(supplierInfo) {
      var supplier_post_data = {
        login_token: this.$store.getters.token,
        unique_id: supplierInfo.unique_id,
        付款人手机: supplierInfo.付款人手机
      }

      this.btnLoading = true
      setTimeout(() => {
        this.btnLoading = false
      }, 1000)
      var res = await settle_cash_supplier_transaction(supplier_post_data)
      this.$message({
        type: 'success',
        message: res.msg
      })
      this.$refs.deliveryNoteConditionQuery.filterSupplierTransactions()
    },
    // 作废现结单
    async voidCashStatement(supplierInfo) {
      var supplier_post_data = {
        login_token: this.$store.getters.token,
        unique_id: supplierInfo.unique_id
      }

      this.btnLoading = true
      setTimeout(() => {
        this.btnLoading = false
      }, 1000)
      var res = await delete_cash_supplier_transaction_by_id(
        supplier_post_data
      )
      this.$message({
        type: 'success',
        message: res.msg
      })
      this.$refs.deliveryNoteConditionQuery.filterSupplierTransactions()
    },
    /**
     * 现结单按钮方法*****************************end**************************
     */

    // 查看该供应商的所有流水单按钮点击
    onClickViewAllInvoicesForThisVendor(data) {
      this.$router.push({
        path: '/financialFunctions/supplierDeliveryNoteB',
        query: {
          unique_id: data.unique_id,
          name: data['名称'],
          记录时间段: JSON.stringify(this.formSupplier['记录时间段']),
          radio: String(this.radioA)
        }
      })
    },

    // 是否显示操作按钮
    whetherToDisplayTheActionButton(row, btnName) {
      var status = row['交易状态']
      var type = row['流水单类型']
      switch (type) {
        case '送货单':
          switch (status) {
            case '未确认':
              switch (btnName) {
                case '确认送货单':
                  return true
                case '作废送货单':
                  return true
              }
              break
            case '已确认':
              switch (btnName) {
                case '结算送货单':
                  return true
                case '作废送货单':
                  return true
              }
              break
            case '已结算':
              switch (btnName) {
                case '作废送货单':
                  return true
              }
              break
            case '待作废':
              switch (btnName) {
                case '确认作废送货单':
                  return true
              }
              break
            case '已作废':
              return false
          }
          break

        case '退货单':
          switch (status) {
            case '待退货':
              switch (btnName) {
                case '确认退货单':
                  return true
                case '作废退货单':
                  return true
              }
              break
            case '已退货':
              switch (btnName) {
                case '作废退货单':
                  return true
              }
              break
            case '待作废':
              switch (btnName) {
                case '确认作废退货单':
                  return true
              }
              break
            case '已作废':
              return false
          }
          break

        case '现结单':
          switch (status) {
            case '未结算':
              switch (btnName) {
                case '结算现结单':
                  return true
                case '作废现结单':
                  return true
              }
              break
            case '已结算':
              switch (btnName) {
                case '作废现结单':
                  return true
              }
              break
            case '已作废':
              return false
          }
          break
      }
      return false
    },
    // 表格选择事件
    handleSelectionChange(val) {
      this.multipleSelection = val
    },

    // 提交备注
    async onSubmitANote(deliveryNote) {
      if (!confirm('确定进行修改吗？修改将会对记录进行永久的改变')) {
        return false
      }
      var supplier_post_data = {
        login_token: this.$store.getters.token,
        unique_id: deliveryNote.unique_id,
        update_data: deliveryNote
      }
      await edit_supplier_transaction_by_id(supplier_post_data)
      this.$message({
        type: 'success',
        message: '修改操作已成功记录!'
      })
      this.$refs.deliveryNoteConditionQuery.filterSupplierTransactions()
    },
    // 导出excel
    async exportExcel() {
      var that = this
      this.btnLoading = true
      setTimeout(() => {
        this.btnLoading = false
      }, 1500)
      var response = await this.$refs.deliveryNoteConditionQuery.filterSupplierTransactions('excelExportData')

      const tHeader = [
        '流水单类型',
        '交易状态',
        '供应商名称',
        '货号',
        '名称及规格',
        '单价/单位',
        '数量',
        '总价',
        '送货人（电话）',
        '收货人（电话）',
        '付款人（电话）',
        '备注',
        '记录时间'
      ]
      const filterVal = [
        '流水单类型',
        '交易状态',
        '供应商名称',
        '货号',
        '名称及规格',
        '单价/单位',
        '数量',
        '总价格',
        '送货人（电话）',
        '收货人（电话）',
        '付款人（电话）',
        '备注',
        '记录时间'
      ]

      var tableData = deepClone([...response.data])
      for (let i = 0; i < tableData.length; i++) {
        var element = tableData[i]
        element['单价/单位'] = `${element['单价']}元/${element['单位']}`
        // 如果送货人姓名和送货单位经手人手机同时存在
        if (element['送货人姓名'] && element['送货单位经手人手机']) {
          element['送货人（电话）'] = `${element['送货人姓名']}（${element['送货单位经手人手机']}）`
        } else if (element['送货人姓名']) {
          element['送货人（电话）'] = element['送货人姓名']
        } else if (element['送货单位经手人手机']) {
          element['送货人（电话）'] = element['送货单位经手人手机']
        } else {
          element['送货人（电话）'] = ''
        }

        // 如果收货人姓名和收货单位经手人手机同时存在
        if (element['收货人姓名'] && element['收货单位经手人手机']) {
          element['收货人（电话）'] = `${element['收货人姓名']}（${element['收货单位经手人手机']}）`
        } else if (element['收货人姓名']) {
          element['收货人（电话）'] = element['收货人姓名']
        } else if (element['收货单位经手人手机']) {
          element['收货人（电话）'] = element['收货单位经手人手机']
        } else {
          element['收货人（电话）'] = ''
        }

        // 如果付款人姓名和付款人手机同时存在
        if (element['付款人姓名'] && element['付款人手机']) {
          element['付款人（电话）'] = `${element['付款人姓名']}（${element['付款人手机']}）`
        } else if (element['付款人姓名']) {
          element['付款人（电话）'] = element['付款人姓名']
        } else if (element['付款人手机']) {
          element['付款人（电话）'] = element['付款人手机']
        } else {
          element['付款人（电话）'] = ''
        }
      }
      const data = this.formatJson(filterVal, tableData)
      import('@/vendor/Export2Excel').then(excel => {
        excel.export_json_to_excel({
          header: tHeader, // 表头 必填
          data, // 具体数据 必填
          filename: '流水单表', // 非必填
          autoWidth: true, // 非必填
          bookType: 'xlsx' // 非必填
        })
        that.btnLoading = false
      })
    },
    // 把json数据格式化，以便导出excel
    formatJson(filterVal, jsonData) {
      return jsonData.map(v =>
        filterVal.map(j => {
          return v[j]
        })
      )
    }

    /** 流水单******************************end********************************************* */
  }
}
</script>

<style lang="scss" scoped>
.red {
  color: red;
}
.green {
  color: green;
}
.yellow {
  color: yellow;
}

.supplierDeliveryNote {
  padding: 10px;
  background-color: #f1f1f1;
  .info-box {
    .item-1 {
      width: 500px;
    }
  }
  .module-c {
    .title {
      margin-bottom: 20px;
    }
    .row-1 {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      .btn {
        height: 40px;
      }
      .img-box {
        display: flex;
        align-items: center;
        img {
          width: 106px;
          height: 106px;
        }
      }
      .tag {
        margin: 0 5px 5px 0;
      }
    }
    .btn-box {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      .el-button:nth-child(3n) {
        margin-top: 5px;
      }
    }
  }
}
</style>

<style>
.el-form-item {
  margin-bottom: 10px;
}
.box-card {
  margin-bottom: 30px;
}
.delivery-note {
  background-color: #fafaf6;
  padding: 0 !important;
}
.delivery-note.row-1 {
  font-weight: 700;
  color: #000;
  height: 34px;
  line-height: 34px !important;
}
.delivery-note.row-2 {
  height: 94px;
}

.return-order {
  background-color: #f1f5fb;
  padding: 0 !important;
}
.return-order.row-1 {
  font-weight: 700;
  color: #000;
  height: 34px;
  line-height: 34px !important;
}
.return-order.row-2 {
  height: 94px;
}

.current-statement {
  background-color: #faf6f8;
  padding: 0 !important;
}
.current-statement.row-1 {
  font-weight: 700;
  color: #000;
  height: 34px;
  line-height: 34px !important;
}
.current-statement.row-2 {
  height: 94px;
}
</style>
