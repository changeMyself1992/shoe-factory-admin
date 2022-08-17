<template>
  <div class="arrange-production-note">
    <div class="header">
      <b>{{ calculateTitle }}</b>
    </div>
    <el-form ref="form" :model="form" label-position="left" :rules="formRules">
      <!--生产单号，日期，二维码-->
      <div class="module-a">
        <el-form-item class="col-1" prop="生产单编号" label="生产单编号:" label-width="100px">
          <el-input v-model.trim="form.生产单编号" placeholder="单行输入" disabled />
        </el-form-item>
        <el-form-item class="col-2" prop="生产单时间" label="生产单日期:" label-width="100px">
          <el-date-picker v-model.trim="form.生产单时间" type="date" placeholder="选择日期" disabled />
        </el-form-item>
        <el-form-item v-if="form.生产单二维码" class="col-3" label="二维码:" label-width="70px">
          <img :src="form.生产单二维码">
        </el-form-item>
      </div>

      <!--订单基本信息-->
      <el-card class="module-b">
        <div slot="header" class="clearfix">
          <strong>订单基本信息</strong>
        </div>
        <order-basic-information
          ref="orderBasicInformation"
          :whether-to-show-the-title="false"
          :order-info="orderInfo"
        />
      </el-card>

      <!--①排产产品选择-->
      <el-card class="module-c">
        <div slot="header" class="clearfix">
          <strong>包含的产品表格</strong>
        </div>
        <el-row class="product-list">
          <div v-if="calculateProductInfo" class="list">
            <product-list-a
              ref="productListA"
              :product-list-info="calculateProductInfo"
              :whether-the-tag-is-editable="false"
              :whether-the-brand-is-editable="false"
              :is-the-customer-product-number-editable="false"
              :is-pei-ma-editable="false"
              :is-show-select-product="openMode==='add'?true:false"
              :is-show-product-detail="openMode!=='add'?true:false"
              :is-show-add-product="false"
              :select-post-call-back="openMode==='add'?selectPostCallBack:null"
              :whether-to-show-the-number-of-scheduled-production="true"
              :whether-the-number-of-scheduled-production-is-shown="true"
              :whether-to-show-total="true"
            />
          </div>
        </el-row>
      </el-card>

      <!--②工艺选择-->
      <el-card v-if="openMode === 'add'" class="module-d">
        <div slot="header" class="clearfix">
          <strong>工艺选择</strong>
        </div>

        <el-row v-if="!whetherTheObjectIsNull(selectedProductAndArrange)" class="row2">
          <el-transfer
            v-model.trim="craftCheckList"
            :data="processList"
            :titles="['工序来源', '工序选中']"
          />
        </el-row>
      </el-card>

      <!--③产品分多批次排产-->
      <el-card v-if="openMode=='add'" class="module-f">
        <div slot="header" class="clearfix">
          <strong>产品分多批次排产</strong>
        </div>
        <div v-if="!whetherTheObjectIsNull(craftCheckList)" class="row1">
          <div class="radio-box">
            <el-radio
              v-if="!whetherTheObjectIsNull(selectedProductAndArrange)"
              v-model.trim="autoGenerateMode"
              label="manual"
            >手动排产</el-radio>
            <el-radio
              v-if="!whetherTheObjectIsNull(selectedProductAndArrange)"
              v-model.trim="autoGenerateMode"
              label="average"
            >尽量平均配码</el-radio>
            <el-radio
              v-if="!whetherTheObjectIsNull(selectedProductAndArrange)"
              v-model.trim="autoGenerateMode"
              label="averageInteger"
            >尽量平均整数配码</el-radio>
            <el-radio
              v-if="!whetherTheObjectIsNull(selectedProductAndArrange)"
              v-model.trim="autoGenerateMode"
              label="single"
            >单一码数配码</el-radio>
          </div>

          <span class="des">{{ batchDescription }}</span>
          <span v-if="autoGenerateMode==='averageInteger'" class="des">配码整数：规定每张生产单的数量是该整数的倍数</span>

          <div
            v-if="autoGenerateMode==='averageInteger'"
            class="batch-box"
            style="margin-right: 10px;"
          >
            <span class="text-1">配码整数</span>
            <div class="input-number">
              <el-input-number v-model="integer_interval" :min="5" :max="1000" :step="5" step-strictly />
            </div>
          </div>

          <div v-if="autoGenerateMode!==''" class="batch-box">
            <span class="text-1">最小批次 {{ minimumProductionSchedule }}</span>
            <div class="input-number">
              <el-input-number
                v-model.trim="productionSchedulingBatch"
                :min="minimumProductionSchedule"
                :max="maximumProductionSchedule"
                @change="handleBatchChange"
              />
            </div>
            <span class="text-2">最大批次 {{ maximumProductionSchedule }}</span>
          </div>
        </div>
      </el-card>

      <!--④排产表填写-->
      <el-card class="module-e">
        <div slot="header" class="clearfix">
          <strong v-if="openMode==='add'">排产表填写</strong>
          <strong v-if="openMode!=='add'">当前完成情况</strong>
        </div>

        <el-row class="row2">
          <production-scheduling-table
            ref="productionSchedulingTable"
            :open-mode="openMode"
            :auto-generate-mode="autoGenerateMode"
            :production-scheduling-batch="productionSchedulingBatch"
            :selected-product-and-arrange="selectedProductAndArrange"
            :craft-check-list="craftCheckList"
            :production-note-process-data="productionNoteProcessData"
            :process-record="processRecord"
            :integer-interval="integer_interval"
          />
        </el-row>
      </el-card>

      <!--生产单备注-->
      <el-form-item prop="生产单备注" label="生产单备注:" label-width="90px">
        <el-input
          v-model="form.生产单备注"
          type="textarea"
          :rows="2"
          placeholder="请输入内容"
          :disabled="openMode=='detail'"
        />
      </el-form-item>

      <!--表单按钮组-->
      <el-form-item class="btn-box">
        <el-button
          v-if="openMode=='add'"
          class="submit"
          type="primary"
          size="mini"
          :disabled="!管理权限['生产单详情可写']"
          @click="onSubmit"
        >添加排产信息</el-button>
        <el-button
          v-if="openMode=='edit'"
          class="submit"
          type="primary"
          size="mini"
          :disabled="!管理权限['生产单详情可写']"
          @click="onEditSubmit"
        >修改排产信息</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import productListA from '@/views/components/productListA' // product-a组件
import orderBasicInformation from '@/views/components/orderBasicInformation' // 订单基本信息展示组件
import productionSchedulingTable from '@/views/components/productionSchedulingTable' // 订单基本信息展示组件
import { generate_year_month_sequence_number } from '@/api/otherUtilityClasses'
import { parseTime, deepClone, isEmpty } from '@/utils'
import {
  get_order_by_id,
  add_production_note,
  edit_production_note_by_id,
  get_production_note_by_id
} from '@/api/ordersForProductionScheduling'
import { match_recent_production_note_process_info_by_product_info } from '@/api/scheduleManagement'
import { filter_process } from '@/api/maintenanceOfProcessPartsOfProductLibrary'
import { 验证生产单编号 } from '@/utils/validate'
import { mapGetters } from 'vuex'
export default {
  components: {
    productListA,
    orderBasicInformation,
    productionSchedulingTable
  },
  data() {
    return {
      form: {},
      formRules: {
        生产单编号: [
          { required: true, trigger: 'blur', validator: 验证生产单编号 }
        ],
        生产单时间: [{ required: true, trigger: 'blur' }]
      },
      order_unique_id: '', // 订单的unique_id
      orderInfo: {}, // 对应的订单信息,要传递给子组件
      processList: [], // 工序的名称列表，用于选择工序时使用
      includedProducts: [], // 对应的订单包含的产品信息,要传递给子组件
      selectedProductAndArrange: {}, // 选中的产品
      craftCheckList: [], // 选中的工艺
      // （仅用于编辑和详情查看模式）存储目前完成的情况（即数据库中的配码完成总计数）
      productionNoteProcessData: [], // 对应数据库的 生产单工序信息
      openMode: '',
      curOperationDetailInfo: {}, // 别的页面传递过来的信息
      processRecord: [], // 选中一个产品后 它的以前工序记录 用于预填
      // 自动排单的模式，manual/average/averageInteger/single 手动排产/尽量平均配码/尽量平均整数配码/单一码数
      autoGenerateMode: 'manual',
      productionSchedulingBatch: 1, // 排产批次
      minimumProductionSchedule: 1, // 最小排产次数
      maximumProductionSchedule: 1, // 最大排产次数
      integer_interval: 5
      /** ******************************************************************************************************************************* */
    }
  },
  computed: {
    ...mapGetters(['管理权限']),
    // 标题显示
    calculateTitle: function() {
      if (this.openMode === 'add') return '创建生产单'
      else if (this.openMode === 'detail') return '生产单详情'
      else if (this.openMode === 'edit') return '编辑生产单'
      return ''
    },
    // 计算各种模式下应该传给productList组件的product-info
    calculateProductInfo: function() {
      if (this.openMode === 'add') return this.includedProducts
      else if (
        (this.openMode === 'detail' || this.openMode === 'edit') &&
        !isEmpty(this.selectedProductAndArrange)
      ) {
        var productInfoList = []
        productInfoList.push(this.selectedProductAndArrange)
        return productInfoList
      }
      return null
    },
    batchDescription: function() {
      if (this.autoGenerateMode === 'manual') {
        return '手动排产：可根据实际需要，完全手动排产'
      } else if (this.autoGenerateMode === 'average') {
        return '尽量平均配码：按照配码总数平均分配，尽量保证每张生产单的配码总数平均分配'
      } else if (this.autoGenerateMode === 'averageInteger') {
        return '尽量平均整数配码：按照配码总数平均分配，尽量保证每张生产单的配码总数平均分配并且为配码整数的倍数'
      } else if (this.autoGenerateMode === 'single') {
        return '按照码数分配，尽量保证每张生产单只有一个码数，并且每张生产单的生产数量大致相同'
      }
      return ''
    }
  },
  watch: {
    autoGenerateMode: function(newVal, oldVal) {
      // 尽量平均配码
      if (newVal === 'average') {
        this.calculateTheMinimumProductionSchedule()
        this.calculateTheMaximumProductionSchedule()
        this.productionSchedulingBatch = 1 // 设置默认排产数
      } else if (newVal === 'averageInteger') {
        this.calculateTheMinimumProductionSchedule()
        this.calculateTheMaximumProductionSchedule()
        this.productionSchedulingBatch = 1 // 设置默认排产数
      } else if (newVal === 'single') {
        // 单一码数配码
        this.calculateTheMinimumProductionSchedule()
        this.calculateTheMaximumProductionSchedule()
        this.productionSchedulingBatch = this.minimumProductionSchedule
      } else if (newVal === 'manual') {
        // 手动排产
        this.calculateTheMinimumProductionSchedule()
        this.calculateTheMaximumProductionSchedule()
        this.productionSchedulingBatch = 1
      }
    },
    integer_interval: function(newVal, oldVal) {
      this.calculateTheMinimumProductionSchedule()
      this.calculateTheMaximumProductionSchedule()
      this.productionSchedulingBatch = 1 // 设置默认排产数
    }
  },
  created() {
    this.initializeData()
  },
  methods: {
    /**
     * 初始化
     */
    async initializeData() {
      console.log(11111)
      console.log()
      // 必须要知道是从哪跳进来的
      if (isEmpty(this.$route.query.from)) return
      // 如果来自生产单表格组件
      if (this.$route.query.from === 'productNoteTable') {
        this.curOperationDetailInfo = JSON.parse(
          this.$route.query.curOperationDetailInfo
        )
      } else if (
        this.$route.query.from === 'orderSheetForProductionScheduling'
      ) {
        // 如果来自排产的订单表格组件
        this.curOperationDetailInfo = this.$route.query.curOperationDetailInfo
      } else if (this.$route.query.from === 'orderList') {
        // 如果来自订单列表页面
        var curOperationDetailInfo = {
          login_token: this.$route.query.login_token,
          unique_id: this.$route.query.unique_id
        }
        this.curOperationDetailInfo = curOperationDetailInfo
      } else if (this.$route.query.from === 'productionSchedule') {
        // 如果来自生产进度管理页面
        this.curOperationDetailInfo = this.$route.query.curOperationDetailInfo
      }
      this.openMode = this.$route.query.mode
      this.getAllProcess() // 获取所有工序

      // 获取生产单详情
      if (this.openMode === 'detail' || this.openMode === 'edit') {
        var post_data = {
          login_token: this.$store.getters.token,
          unique_id: this.curOperationDetailInfo['unique_id']
        }
        var production_note_response = await get_production_note_by_id(
          post_data
        )
        this.curOperationDetailInfo = deepClone(production_note_response.data)
      }

      switch (this.openMode) {
        case 'add':
          // 拷贝空的生产单数据结构
          this.form = deepClone(this.$store.getters['空的生产单结构'])
          // eslint-disable-next-line no-case-declarations
          const res_a = await generate_year_month_sequence_number({
            login_token: this.$store.getters.token,
            流水单分组: 'SCD'
          })
          var code = res_a.data['流水号']
          this.form.unique_id = code
          this.form['生产单编号'] = code
          this.form['生产单时间'] = new Date()
          this.orderInitialization()
          this.form['生产单备注'] = this.curOperationDetailInfo['订单备注']
          this.orderInfo = deepClone(this.form['对应订单'])
          this.includedProducts = this.curOperationDetailInfo['包含的产品']
          break
        case 'detail':
          this.order_unique_id = this.curOperationDetailInfo['对应订单'][
            'unique_id'
          ]
          await this.getOrderDetails() // 获取订单详情
          this.retrieveDetailEditModeProductionNoteData()
          break
        case 'edit':
          this.order_unique_id = this.curOperationDetailInfo['对应订单'][
            'unique_id'
          ]
          await this.getOrderDetails() // 获取订单详情
          this.retrieveDetailEditModeProductionNoteData()
          break
      }
    },

    /**
     * 订单初始化
     */
    orderInitialization() {
      this.form['对应订单']['tags'] = this.curOperationDetailInfo['tags']
      this.form['对应订单']['unique_id'] = this.curOperationDetailInfo[
        'unique_id'
      ]
      this.form['对应订单']['上传图片列表'] = this.curOperationDetailInfo[
        '上传图片列表'
      ]
      this.form['对应订单']['交货日期'] = this.curOperationDetailInfo[
        '交货日期'
      ]
      this.form['对应订单']['客户信息'] = this.curOperationDetailInfo[
        '客户信息'
      ]
      this.form['对应订单']['订单备注'] = this.curOperationDetailInfo[
        '订单备注'
      ]
      this.form['对应订单']['订单日期'] = this.curOperationDetailInfo[
        '订单日期'
      ]
      this.form['对应订单']['订单编号'] = this.curOperationDetailInfo[
        '订单编号'
      ]
    },
    /**
     * 获取订单详情
     */
    async getOrderDetails() {
      var post_data = {
        login_token: this.$store.getters.token,
        unique_id: this.order_unique_id
      }
      const response = await get_order_by_id(post_data)
      var res = response.data
      this.includedProducts = res['包含的产品']
    },

    /**
     * 获取所有工序
     */
    async getAllProcess() {
      var res = await filter_process({ login_token: this.$store.getters.token })
      this.processList = []
      for (var i = 0; i < res.data.length; i++) {
        this.processList.push({
          key: res.data[i]['工序名称'],
          label: res.data[i]['工序名称']
        })
      }
    },

    /**
     * 获取生产单详情
     */
    retrieveDetailEditModeProductionNoteData() {
      this.form = deepClone(this.curOperationDetailInfo)
      this.orderInfo = deepClone(this.form['对应订单'])

      // 赋值选中的产品
      for (var i = 0; i < this.includedProducts.length; i++) {
        if (
          this.includedProducts[i]['产品信息']['unique_id'] ===
          this.form['排产产品']['产品信息']['unique_id']
        ) {
          this.selectedProductAndArrange = deepClone(this.includedProducts[i])
        }
      }

      // 赋值生产单工序信息
      // 赋值选中的工序
      this.productionNoteProcessData = []
      this.craftCheckList = []
      for (i = 0; i < this.form['生产单工序信息'].length; i++) {
        this.productionNoteProcessData.push(
          deepClone(this.form['生产单工序信息'][i])
        )
        this.craftCheckList.push(
          this.form['生产单工序信息'][i]['工序信息']['工序名称']
        )
      }
    },

    /**
     * 选择产品后回调
     */
    async selectPostCallBack(productInfo) {
      this.selectedProductAndArrange = productInfo
      var parameter = {
        login_token: this.$store.getters.token,
        data: {
          排产产品: {
            产品信息: {
              unique_id: this.selectedProductAndArrange['产品信息'].unique_id,
              tags: this.selectedProductAndArrange['产品信息'].tags,
              产品编号: this.selectedProductAndArrange['产品信息']['产品编号']
            }
          }
        }
      }
      var res = await match_recent_production_note_process_info_by_product_info(
        parameter
      )
      this.processRecord = res.data['生产单工序信息']
      this.craftCheckList = []
      for (let i = 0; i < this.processRecord.length; i++) {
        const element = this.processRecord[i]
        this.craftCheckList.push(element['工序信息']['工序名称'])
      }
    },

    /**
     * 提交新的生产单
     */
    onSubmit(formName) {
      this.$refs.form.validate(async valid => {
        if (valid) {
          // 提交之前验证
          if (isEmpty(this.selectedProductAndArrange)) {
            this.$message({
              type: 'warning',
              message: '请选择一个产品进行排产!'
            })
            return false
          } else if (isEmpty(this.craftCheckList)) {
            this.$message({
              type: 'warning',
              message: '至少要选择一个工序！'
            })
            return false
          }

          for (
            let index = 0;
            index <
            this.$refs.productionSchedulingTable.sizeArrangeList_add.length;
            index++
          ) {
            const sizeArrangeItem = this.$refs.productionSchedulingTable
              .sizeArrangeList_add[index]
            if (sizeArrangeItem['此次总排产数'] === 0) {
              this.$message({
                type: 'warning',
                message: '此次总排产数为0，不能进行排产'
              })
              return false
            }

            this.form.生产单时间 = parseTime(
              new Date(this.form.生产单时间),
              '{y}-{m}-{d}'
            )
            // 提交之前验证
            if (sizeArrangeItem.剩余未排产数 <= 0) {
              this.$message({
                type: 'warning',
                message: '该产品已全部排产完毕，不可再进行排产'
              })
              return false
            } else if (
              sizeArrangeItem.此次总排产数 < 1 &&
              this.productionSchedulingBatc === 1
            ) {
              this.$message({
                type: 'warning',
                message: '产品排产数量不能小于1！'
              })
              return false
            }

            // 如果不是第一次提交 那么要生成信息的生产单id
            if (index !== 0) {
              const res_a = await generate_year_month_sequence_number({
                login_token: this.$store.getters.token,
                流水单分组: 'SCD'
              })
              var code = res_a.data['流水号']
              // code = code + index
              this.form.unique_id = code
              this.form['生产单编号'] = code
            }

            // 加入 "排产产品">"产品信息"
            this.form['排产产品']['产品信息'] = this.selectedProductAndArrange[
              '产品信息'
            ]

            // 加入 "排产产品">"排产配码数量"
            var arrangedCount = []
            for (var k = 0; k < sizeArrangeItem['配码'].length; k++) {
              var element = sizeArrangeItem['配码'][k]
              arrangedCount.push({
                尺码: element['尺码'],
                国标码: element['国标码'],
                目标数量: Number(parseFloat(element['此次排产']).toFixed(2))
              })
            }
            this.form['排产产品']['排产配码数量']['配码'] = arrangedCount
            this.form['排产产品']['排产配码数量']['总排产数'] =
              sizeArrangeItem.此次总排产数

            // 加入 "生产单工序信息"
            var productionNoteProcessInfo = []
            var new_arranged_count = deepClone(arrangedCount)
            for (k = 0; k < new_arranged_count.length; k++) {
              new_arranged_count[k]['完成数量'] = 0
            }
            for (k = 0; k < this.craftCheckList.length; k++) {
              productionNoteProcessInfo.push({
                员工计件: [],
                员工计件配码总计数: {
                  配码: new_arranged_count,
                  总完成数: 0
                },
                工序信息: {
                  unique_id: this.craftCheckList[k],
                  工序名称: this.craftCheckList[k]
                },
                工序工资: this.$refs.productionSchedulingTable.salary[
                  this.craftCheckList[k]
                ],
                配码完成总计数: {
                  配码: new_arranged_count,
                  总完成数: 0
                }
              })
              if (
                this.$refs.productionSchedulingTable.salary[
                  this.craftCheckList[k]
                ] === 0
              ) {
                this.$message({
                  type: 'warning',
                  message:
                    '工序：' +
                    this.craftCheckList[k] +
                    ' 的工资输入值为0，请再次确认后重新提交'
                })
                return false
              }
            }
            this.form['生产单工序信息'] = productionNoteProcessInfo

            // 发起添加排产单请求
            var post_data = {
              login_token: this.$store.getters.token,
              data: this.form
            }
            await add_production_note(post_data)
            this.$message({
              type: 'success',
              message: '创建生产单成功！'
            })
          }

          var visitedViews = this.$store.getters.visitedViews
          for (let i = 0; i < visitedViews.length; i++) {
            const view = visitedViews[i]
            if (view.title === '生产单操作') {
              this.$store.dispatch('delView', view).then(res => {
                this.$router.push('/productOrderManagement/productOrderList')
              })
            }
          }
        } else {
          this.$message({ type: 'warning', message: '请完善表单信息' })
          return false
        }
      })
    },

    /**
     * 修改生产单
     */
    async onEditSubmit() {
      var post_data = {
        login_token: this.$store.getters.token,
        unique_id: this.form.生产单编号,
        update_data: {
          生产单备注: this.form.生产单备注,
          生产单工序信息: this.$refs.productionSchedulingTable
            .productionNoteProcessData_clone
        }
      }
      const response = await edit_production_note_by_id(post_data)
      this.$message({ type: 'success', message: response.msg })

      var visitedViews = this.$store.getters.visitedViews
      for (let i = 0; i < visitedViews.length; i++) {
        const view = visitedViews[i]
        if (view.title === '生产单操作') {
          this.$store.dispatch('delView', view).then(res => {
            this.$router.push('/productOrderManagement/productOrderList')
          })
        }
      }
    },
    // 限制计数器输入
    handleBatchChange(value) {
      if (isNaN(value)) this.productionSchedulingBatch = 1
      this.productionSchedulingBatch = Number(parseFloat(value).toFixed(0))
    },
    // 计算最大排产数 manual/average/averageInteger/single
    calculateTheMaximumProductionSchedule() {
      // 如果是手动排产那么最大排产次数为1
      if (this.autoGenerateMode === 'manual') {
        this.maximumProductionSchedule = 1
      } else if (this.autoGenerateMode === 'average') {
        var 配码 = this.selectedProductAndArrange['配码数量']['配码']
        // 找出所有配码里面 目标数量-已排产数量 最大的值 就是最大排产数
        var temp = []
        for (let i = 0; i < 配码.length; i++) {
          const element = 配码[i]
          temp.push(element['目标数量'] - element['已排产数量'])
        }
        temp.sort(function(a, b) {
          return b - a
        })
        this.maximumProductionSchedule = temp[0]
      } else if (this.autoGenerateMode === 'averageInteger') {
        this.maximumProductionSchedule = Math.floor(
          (this.selectedProductAndArrange['配码数量']['总数'] -
            this.selectedProductAndArrange['配码数量']['已经排产数量']) /
            this.integer_interval
        )
      } else {
        // 所有未排产的总数加起来就是 最大排产数
        var count = 0
        配码 = this.selectedProductAndArrange['配码数量']['配码']
        for (let i = 0; i < 配码.length; i++) {
          const element = 配码[i]
          count += element['目标数量'] - element['已排产数量']
        }
        this.maximumProductionSchedule = count
      }
    },
    // 计算最小排产数 manual/average/averageInteger/single
    calculateTheMinimumProductionSchedule() {
      if (
        this.autoGenerateMode === 'average' ||
        this.autoGenerateMode === 'manual' ||
        this.autoGenerateMode === 'averageInteger'
      ) {
        this.minimumProductionSchedule = 1
      } else if (this.autoGenerateMode === 'single') {
        let non_zero_size = 0
        var 配码 = this.selectedProductAndArrange['配码数量']['配码']
        for (let i = 0; i < 配码.length; i++) {
          const element = 配码[i]
          if (element['目标数量'] - element['已排产数量'] > 0) {
            non_zero_size = non_zero_size + 1
          }
        }
        this.minimumProductionSchedule = non_zero_size
      }
    },
    // 是否是空对象
    whetherTheObjectIsNull(obj) {
      return isEmpty(obj)
    }

  }
}
</script>

<style lang="scss" scoped>
.arrange-production-note {
  .header {
    text-align: center;
    font-size: 18px;
    height: 40px;
    line-height: 40px;
  }
  .module-a {
    padding: 0 10px;
    margin-top: 60px;
    margin-bottom: 30px;
    display: flex;
    justify-content: space-between;
    .col-1 {
      width: 250px;
    }
    .col-2 {
      width: 250px;
    }
    .col-3 {
      width: 200px;
      position: relative;
      img {
        position: absolute;
        top: -90%;
        width: 80px;
        height: 80px;
      }
    }
  }
  .module-b {
    margin-bottom: 20px;
    padding: 0 20px;
  }
  .module-c {
    overflow: hidden;
    margin-bottom: 20px;
    padding: 0 20px;
    .row1 {
      height: 40px;
      line-height: 40px;
    }
    .product-list {
      overflow: hidden;
      width: 100%;
      .product {
        margin-bottom: 30px;
      }
    }
  }
  .module-d {
    margin-bottom: 20px;
    padding: 0 20px;
    .row1 {
      margin-bottom: 10px;
      line-height: 29px;
    }
  }
  .module-e {
    margin-bottom: 20px;
    .row1 {
      margin-bottom: 10px;
      line-height: 29px;
    }
  }
  .module-f {
    margin-bottom: 20px;
    .row1 {
      display: flex;
      flex-wrap: wrap;
      .radio-box {
        width: 100%;
        margin-bottom: 10px;
      }
      .des {
        width: 100%;
        color: #409EFF;
        margin-bottom: 10px;
      }
      .batch-box {
        display: flex;
        align-items: center;
        .text-1 {
          margin-right: 5px;
        }
        .text-2 {
          margin-left: 5px;
        }
      }
    }
  }
  .btn-box {
    display: flex;
    justify-content: center;
    .submit {
      margin-right: 50px;
    }
  }
}
</style>

