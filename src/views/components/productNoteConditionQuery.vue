<template>
  <div class="product-note-condition-query">
    <el-form ref="form" class="module-b" :model="form" label-position="left">
      <el-card class="box-card">
        <div slot="header" class="clearfix header">
          <b>生产单条件查询</b>
        </div>

        <div class="info-box">
          <!-- 订单的动态标签(自动补全) -->
          <div class="row-1">
            <div class="left">
              <b>订单信息：</b>
            </div>
            <div v-if="订单的标签.length>0" class="right" :model="form.orderTags">
              <div class="item-2">
                <el-form-item prop="orderUniqueId" label="订单编号:" label-width="80px">
                  <el-input v-model.trim="form.orderUniqueId" placeholder="单行输入" />
                </el-form-item>
              </div>
              <div class="item-1">
                <el-form-item v-for="tag_name in 订单的标签" :key="tag_name" :label="tag_name">
                  <el-autocomplete
                    v-model.trim="form.orderTags[tag_name]"
                    :fetch-suggestions="((queryString, callback)=>tagQueryAutoCompleteSearch(queryString,callback,tag_name))"
                    placeholder="自动补全"
                    @input="mode==='productNoteQuery'?debouncedHandleSearch():scheduleDebouncedHandleSearch()"
                  />
                </el-form-item>
              </div>
            </div>
          </div>

          <div class="row-2">
            <div class="left">
              <b>包含的产品信息：</b>
            </div>
            <!-- 产品的动态标签(自动补全) -->
            <div v-if="产品的标签.length>0" class="right">
              <div class="item-2">
                <el-form-item prop="productUniqueId" label="产品编号:" label-width="80px">
                  <el-input v-model.trim="form.productUniqueId" placeholder="单行输入" />
                </el-form-item>
              </div>
              <div class="item-1">
                <el-form-item
                  v-for="tag_name in 产品的标签"
                  :key="tag_name"
                  :label="tag_name"
                  class="tag"
                >
                  <template>
                    <el-checkbox v-model="tagcheckbox[tag_name]" @change="changeTagCheck">精确匹配</el-checkbox>
                  </template>
                  <el-autocomplete
                    v-model.trim="form.productTags[tag_name]"
                    :fetch-suggestions="((queryString, callback)=>productTagQueryAutoCompleteSearch(queryString,callback,tag_name))"
                    placeholder="自动补全"
                    @input="mode==='productNoteQuery'?debouncedHandleSearch():scheduleDebouncedHandleSearch()"
                  />
                </el-form-item>
              </div>
            </div>
          </div>

          <div class="row-3">
            <div class="left">
              <b>生产单自身的信息：</b>
            </div>

            <div class="right">
              <div class="item-1">
                <el-form-item prop="productNoteTimeRange" label="生产单时间范围" label-width="120px">
                  <el-date-picker
                    v-model.trim="form.productNoteTimeRange"
                    class="picker"
                    type="daterange"
                    unlink-panels
                    range-separator="-"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                  />
                </el-form-item>

                <el-form-item prop="生产单编号" label="生产单编号" label-width="90px">
                  <el-input v-model.trim="form.生产单编号" placeholder="单行输入" />
                </el-form-item>
              </div>

              <el-form-item
                v-if="isShowProductNoteStatus"
                class="item-2"
                prop="生产单状态"
                label="生产单状态："
                label-width="100px"
              >
                <el-radio
                  v-for="statusValue in productNoteStatus"
                  :key="statusValue"
                  v-model.trim="form['生产单状态']"
                  :label="statusValue"
                >{{ statusValue }}</el-radio>
              </el-form-item>
            </div>
          </div>

          <el-form-item class="row-4">
            <el-button
              v-if="mode==='productNoteQuery'"
              class="btn"
              type="primary"
              @click="filterProductNote()"
            >搜索</el-button>
            <el-button
              v-else-if="mode==='productScheduleQuery'"
              class="btn"
              type="primary"
              @click="listOnGoingProductionNotes()"
            >搜索</el-button>
            <el-button class="btn" type="primary" @click="clearFilterCondition()">清空条件</el-button>
          </el-form-item>
        </div>
      </el-card>
    </el-form>
    <el-dialog
      title="导出Excel中"
      :visible.sync="centerDialogVisible"
      width="30%"
      center
    >
      <el-progress
        class="excleprogress"
        :text-inside="true"
        :stroke-width="16"
        :percentage="excleprogressValue"
      />
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { deepClone } from '@/utils'
import { product_tags_auto_complete } from '@/api/maintenanceOfProcessPartsOfProductLibrary'
import {
  parseTime,
  isEmpty,
  objectHasAtLeastOneKeyWhoseValueIsNotNull
} from '@/utils'
import {
  order_tags_auto_complete,
  filter_production_note,
  list_ongoing_production_notes
} from '@/api/ordersForProductionScheduling'
export default {
  props: {
    currentPage: {
      type: Number,
      default: 1
    },
    pageSize: {
      type: Number,
      default: 50
    },
    // 查询之后回调父组件
    callbackAfterConditionQuery: {
      type: Function,
      default() {
        return
      }
    },
    // 清空条件之后回调父组件
    callbackAfterConditionClear: {
      type: Function,
      default() {
        return
      }
    },
    // 是否展示订单状态选择框
    isShowProductNoteStatus: {
      type: Boolean,
      default: true
    },
    multipleProductionSingleState: {
      type: Array,
      default() {
        return ['新生产单', '生产中']
      }
    },
    // productNoteQuery(生产单查询)， productScheduleQuery(生产进度查询)
    mode: {
      type: String,
      default: 'productNoteQuery'
    }
  },
  data() {
    return {
      form: {
        updateTimeRange: [], // 更新时间_下限  到 更新时间_上限
        生产单编号: '',
        productNoteTimeRange: [], // 生产单时间_下限 到 生产单时间_上限
        生产单状态: '',

        orderTags: {}, // 对应订单.tags
        orderUniqueId: '', // 对应订单.订单编号

        productTags: {}, // 排产产品.产品信息.tags
        productUniqueId: '' // 排产产品.产品信息.产品编号
      },
      // 条件搜索的生产单状态
      productNoteStatus: ['生产中', '新生产单', '完成'],
      // 搜索按钮是否点击过
      searchClicked: false,
      // 是否精确匹配
      tagcheckbox: [],
      total_count: 0,
      // 导出excel的进度
      excleprogressValue: 0,
      centerDialogVisible: false
    }
  },
  computed: {
    ...mapGetters(['订单的标签', '产品的标签'])
  },
  watch: {},
  created() {
    this.debouncedHandleSearch = this.$_.debounce(this.filterProductNote, 1000)
    this.scheduleDebouncedHandleSearch = this.$_.debounce(
      this.listOnGoingProductionNotes,
      1000
    )
    this.getOrderTagName()
    this.getProductTagNames()
  },
  mounted() {},
  methods: {
    // 精确匹配是否开启
    changeTagCheck() {
      this.filterProductNote()
    },
    // 生成查询条件
    generateQueryConditions() {
      var parameter = {
        login_token: this.$store.getters.token,
        pagination: {
          page: this.currentPage,
          limit: this.pageSize
        },
        sort: { 更新时间: -1 },
        preview_flag: true
      }
      if (this.form.updateTimeRange.length > 0) {
        parameter['更新时间_下限'] = parseTime(
          new Date(this.form.updateTimeRange[0])
        )
        parameter['更新时间_上限'] = parseTime(
          new Date(this.form.updateTimeRange[1])
        )
      }
      if (this.form.生产单编号) {
        parameter['生产单编号'] = this.form.生产单编号.trim()
      }
      if (this.form.productNoteTimeRange.length > 0) {
        parameter['生产单时间_下限'] = parseTime(
          new Date(this.form.productNoteTimeRange[0])
        )
        parameter['生产单时间_上限'] = parseTime(
          new Date(this.form.productNoteTimeRange[1])
        )
      }
      if (this.form.生产单状态 && this.isShowProductNoteStatus) {
        parameter['生产单状态'] = this.form.生产单状态
      }
      if (!this.isShowProductNoteStatus) {
        parameter['多个生产单状态'] = this.multipleProductionSingleState
      }

      if (
        !isEmpty(this.form.orderTags) &&
        objectHasAtLeastOneKeyWhoseValueIsNotNull(this.form.orderTags)
      ) {
        // 遍历orderTags 去空白
        for (const key in this.form.orderTags) {
          this.form.orderTags[key] = this.form.orderTags[key].trim()
        }
        parameter['对应订单.tags'] = this.form.orderTags
      }
      if (this.form.orderUniqueId) {
        parameter['对应订单.订单编号'] = this.form.orderUniqueId
      }
      if (
        !isEmpty(this.form.productTags) &&
        objectHasAtLeastOneKeyWhoseValueIsNotNull(this.form.productTags)
      ) {
        // 遍历orderTags 去空白
        for (const key in this.form.productTags) {
          this.form.productTags[key] = this.form.productTags[key].trim()
        }

        parameter['排产产品.产品信息.tags'] = this.form.productTags
      }

      if (this.form.productUniqueId) {
        parameter[
          '排产产品.产品信息.产品编号'
        ] = this.form.productUniqueId.trim()
      }
      return parameter
    },
    // 按条件查询生产单
    async filterProductNote() {
      var parameter = this.generateQueryConditions()
      // // 精确匹配  ^{搜索内容}$

      var parameterDeep = deepClone(parameter)
      if (parameterDeep['排产产品.产品信息.tags'] !== undefined) {
        if (Object.values(parameterDeep['排产产品.产品信息.tags']).some(v => v !== '')) {
          var tagcheckbox = this.tagcheckbox
          Object.keys(parameterDeep['排产产品.产品信息.tags']).forEach(function(key) {
            if (tagcheckbox[key] && parameterDeep['排产产品.产品信息.tags'][key] !== '') {
              if ((parameterDeep['排产产品.产品信息.tags'][key]).indexOf('$') === -1) {
                parameterDeep['排产产品.产品信息.tags'][key] = '^' + parameterDeep['排产产品.产品信息.tags'][key] + '$'
              }
            }
            if (parameterDeep['排产产品.产品信息.tags'][key] !== '' && tagcheckbox[key]) {
              if ((parameterDeep['排产产品.产品信息.tags'][key]).indexOf('$') === -1) {
                parameterDeep['排产产品.产品信息.tags'][key] = '^' + parameterDeep['排产产品.产品信息.tags'][key] + '$'
              }
            }
          })
        }
      }
      const res = await filter_production_note(parameterDeep)
      this.total_count = res.total_count
      // 执行父组件的回调
      this.callbackAfterConditionQuery(res)
    },
    // 按条件查询生产进度
    async listOnGoingProductionNotes() {
      var parameter = this.generateQueryConditions()
      const res = await list_ongoing_production_notes(parameter)
      // 执行父组件的回调
      this.callbackAfterConditionQuery(res)
    },

    // 获取配置中对订单的tags数组，确保先载入
    getOrderTagName() {
      const order_tag_names = this.$store.getters.订单的标签
      for (var index in order_tag_names) {
        this.$set(this.form['orderTags'], order_tag_names[index], '')
      }
    },
    // 获取配置中对产品的tags数组，确保先载入
    getProductTagNames() {
      // 是否精确匹配tags数组
      var tagobj = {}
      for (let index = 0; index < this.$store.getters.产品的标签.length; index++) {
        const element = this.$store.getters.产品的标签[index]
        tagobj[element] = false
      }
      this.tagcheckbox = tagobj
      console.log(this.tagcheckbox)

      const product_tag_names = this.$store.getters.产品的标签
      for (var index in product_tag_names) {
        this.$set(this.form['productTags'], product_tag_names[index], '')
      }
    },

    // 对订单标签进行自动补全操作
    async tagQueryAutoCompleteSearch(queryString, callback, tag_name) {
      if (queryString === undefined || queryString === null) {
        queryString = ''
      }
      var login_token = this.$store.getters.token
      var post_data = {
        login_token: login_token,
        base_tags: this.form.orderTags,
        target_tag_name: tag_name
      }
      const response = await order_tags_auto_complete(post_data)
      var suggest_value_list = []
      for (var index in response.data) {
        suggest_value_list.push({
          value: response.data[index]
        })
      }
      callback(suggest_value_list)
    },

    // 对产品标签进行自动补全操作
    async productTagQueryAutoCompleteSearch(queryString, callback, tag_name) {
      if (queryString === undefined || queryString === null) {
        queryString = ''
      }
      var login_token = this.$store.getters.token
      var post_data = {
        login_token: login_token,
        base_tags: this.form.productTags,
        target_tag_name: tag_name
      }
      const response = await product_tags_auto_complete(post_data)
      var suggest_value_list = []
      for (var index in response.data) {
        suggest_value_list.push({
          value: response.data[index]
        })
      }
      callback(suggest_value_list)
    },
    // 清空查询条件
    clearFilterCondition() {
      this.form = {
        updateTimeRange: [], // 更新时间_下限  到 更新时间_上限
        生产单编号: '',
        productNoteTimeRange: [], // 生产单时间_下限 到 生产单时间_上限
        生产单状态: '',

        orderTags: {}, // 对应订单.tags
        orderUniqueId: '', // 对应订单.订单编号

        productTags: {}, // 排产产品.产品信息.tags
        productUniqueId: '' // 排产产品.产品信息.产品编号
      }
      this.getOrderTagName()
      this.getProductTagNames()
      this.callbackAfterConditionClear()
    },
    // 条件查询全部的条目(不分页的所有数据,导出excel用)
    async productNoteTableFilterAllItems() {
      this.excleprogressValue = 0
      this.centerDialogVisible = true
      // pagenum为循环次数
      console.log(this.total_count)
      var pagenum = Math.ceil(this.total_count / 100)
      // allitem为所有数据
      var allitem = []
      for (let i = 0; i < pagenum; i++) {
        var parameter = {
          login_token: this.$store.getters.token,
          pagination: {
            page: i + 1,
            limit: 100
          },
          sort: { 更新时间: -1 },
          preview_flag: false
        }
        if (this.form.updateTimeRange.length > 0) {
          parameter['更新时间_下限'] = parseTime(
            new Date(this.form.updateTimeRange[0])
          )
          parameter['更新时间_上限'] = parseTime(
            new Date(this.form.updateTimeRange[1])
          )
        }
        if (this.form.生产单编号) {
          parameter['生产单编号'] = this.form.生产单编号.trim()
        }
        if (this.form.productNoteTimeRange.length > 0) {
          parameter['生产单时间_下限'] = parseTime(
            new Date(this.form.productNoteTimeRange[0])
          )
          parameter['生产单时间_上限'] = parseTime(
            new Date(this.form.productNoteTimeRange[1])
          )
        }
        if (this.form.生产单状态 && this.isShowProductNoteStatus) {
          parameter['生产单状态'] = this.form.生产单状态
        }
        if (!this.isShowProductNoteStatus) {
          parameter['多个生产单状态'] = this.multipleProductionSingleState
        }

        if (
          !isEmpty(this.form.orderTags) &&
          objectHasAtLeastOneKeyWhoseValueIsNotNull(this.form.orderTags)
        ) {
          // 遍历orderTags 去空白
          for (const key in this.form.orderTags) {
            this.form.orderTags[key] = this.form.orderTags[key].trim()
          }
          parameter['对应订单.tags'] = this.form.orderTags
        }
        if (this.form.orderUniqueId) {
          parameter['对应订单.订单编号'] = this.form.orderUniqueId
        }
        if (
          !isEmpty(this.form.productTags) &&
          objectHasAtLeastOneKeyWhoseValueIsNotNull(this.form.productTags)
        ) {
          // 遍历orderTags 去空白
          for (const key in this.form.productTags) {
            this.form.productTags[key] = this.form.productTags[key].trim()
          }

          parameter['排产产品.产品信息.tags'] = this.form.productTags
        }

        if (this.form.productUniqueId) {
          parameter[
            '排产产品.产品信息.产品编号'
          ] = this.form.productUniqueId.trim()
        }
        // // 精确匹配  ^{搜索内容}$

        var parameterDeep = deepClone(parameter)
        if (parameterDeep['排产产品.产品信息.tags'] !== undefined) {
          if (Object.values(parameterDeep['排产产品.产品信息.tags']).some(v => v !== '')) {
            var tagcheckbox = this.tagcheckbox
            Object.keys(parameterDeep['排产产品.产品信息.tags']).forEach(function(key) {
              if (tagcheckbox[key] && parameterDeep['排产产品.产品信息.tags'][key] !== '') {
                if ((parameterDeep['排产产品.产品信息.tags'][key]).indexOf('$') === -1) {
                  parameterDeep['排产产品.产品信息.tags'][key] = '^' + parameterDeep['排产产品.产品信息.tags'][key] + '$'
                }
              }
              if (parameterDeep['排产产品.产品信息.tags'][key] !== '' && tagcheckbox[key]) {
                if ((parameterDeep['排产产品.产品信息.tags'][key]).indexOf('$') === -1) {
                  parameterDeep['排产产品.产品信息.tags'][key] = '^' + parameterDeep['排产产品.产品信息.tags'][key] + '$'
                }
              }
            })
          }
        }
        const res = await filter_production_note(parameterDeep)
        allitem.push(...res.data)
        this.excleprogressValue = Number(
          parseFloat(
            (i / pagenum) * 98
          ).toFixed(1)
        )
      }
      console.log(allitem)
      this.centerDialogVisible = false
      return allitem
    }
  }
}
</script>

<style lang="scss" scoped>
.product-note-condition-query {
  .module-b {
    margin-bottom: 30px;
    .header {
      text-align: center;
    }
    .info-box {
      padding: 0 20px;
      .row-1,
      .row-2,
      .row-3 {
        display: flex;
        width: 100%;
        border-bottom: 1px solid #ebeef5;
        .right {
          width: 100%;
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          .item-1 {
            width: 100%;
            display: flex;
            justify-content: space-between;
          }
        }
      }

      .row-1 {
        .left {
          width: 200px;
          font-size: 16px;
          line-height: 38px;
        }
        .right {
          .item-2 {
            width: 100%;
            display: flex;
          }
        }
      }

      .row-2 {
        padding-top: 10px;
        .left {
          width: 200px;
          font-size: 16px;
          line-height: 38px;
        }
        .right {
          .item-1 {
            .tag {
              width: 160px;
            }
          }
          .item-2 {
            width: 100%;
            display: flex;
          }
        }
      }

      .row-3 {
        padding-top: 10px;
        .left {
          width: 200px;
          font-size: 16px;
          line-height: 38px;
        }
      }

      .row-4 {
        width: 100%;
        display: flex;
        justify-content: center;
        padding-top: 20px;
        .btn {
          width: 98px;
          margin: 0 20px;
        }
      }
    }
  }
  .el-card__body {
    padding-bottom: 0px;
  }
}
</style>

<style lang="scss" >
.product-note-condition-query {
  .el-card__body {
    padding: 10px;
  }
  .el-form-item {
    margin-bottom: 10px;
  }
}
</style>

