<template>
  <div class="factoryKanBanData">
    <!--收益统计模块-->
    <el-card v-if="管理权限['收益统计可读']" class="modul-a">
      <el-menu
        :default-active="earningsActiveIndex"
        class="el-menu-demo"
        mode="horizontal"
        @select="handleEarningsSelect"
      >
        <el-menu-item index="1">日收益</el-menu-item>
        <el-menu-item index="2">月收益</el-menu-item>
        <el-menu-item index="3">年收益</el-menu-item>
      </el-menu>

      <div class="tags-box">
        <el-tag class="tag">更新时间：{{ profitsUpdate }}</el-tag>
        <el-tag v-for="(value, key) in getDayProfits" :key="key" class="tag">{{ key }}:{{ value }}</el-tag>
      </div>

      <div id="mychart-dom-bar-A" />
    </el-card>

    <!--生产订单统计模块-->
    <el-card v-if="管理权限['生产订单统计可读']" class="modul-b">
      <el-menu
        :default-active="outputActiveIndex"
        class="el-menu-demo"
        mode="horizontal"
        @select="handleOutputSelect"
      >
        <el-menu-item index="1">日产量</el-menu-item>
        <el-menu-item index="2">月产量</el-menu-item>
        <el-menu-item index="3">年产量</el-menu-item>
      </el-menu>
      <div class="tags-box">
        <el-tag class="tag">更新时间：{{ productUpdate }}</el-tag>
        <el-tag v-if="outputActiveIndex==='1'" class="tag">当日产量:{{ getProductNoteTHISDAY }}</el-tag>
        <el-tag v-else-if="outputActiveIndex==='2'" class="tag">当月产量:{{ getProductNoteTHISMONTH }}</el-tag>
        <el-tag v-else class="tag">当年产量:{{ getProductNoteTHISYEAR }}</el-tag>
      </div>
      <div id="mychart-dom-line-A" />

      <div class="progress-box">
        <div v-for="(item, index) in newProcessGetProductNote" :key="index" class="progress">
          <el-progress type="circle" :percentage="item['工序完成进度']" />
          <span class="span-a">{{ item.工序名称 }}</span>
          <span class="span-b">{{ item.生产单编号 }}</span>
        </div>
      </div>
    </el-card>

    <!--销售订单统计模块-->
    <el-card v-if="管理权限['销售订单统计可读']" class="modul-b">
      <el-menu
        :default-active="marketActiveIndex"
        class="el-menu-demo"
        mode="horizontal"
        @select="handleMarketSelect"
      >
        <el-menu-item index="1">日销售额</el-menu-item>
        <el-menu-item index="2">月销售额</el-menu-item>
        <el-menu-item index="3">年销售额</el-menu-item>
      </el-menu>
      <div class="tags-box">
        <el-tag class="tag">更新时间：{{ sellUpdate }}</el-tag>
        <el-tag v-if="marketActiveIndex==='1'" class="tag">当日销售额:{{ getOrderNoteTHISDAY }}</el-tag>
        <el-tag v-else-if="marketActiveIndex==='2'" class="tag">当月销售额:{{ getOrderNoteTHISMONTH }}</el-tag>
        <el-tag v-else class="tag">当年销售额:{{ getOrderNoteTHISYEAR }}</el-tag>
      </div>
      <div id="mychart-dom-line-B" />
    </el-card>

    <el-card v-if="管理权限['本月热销产品统计可读']" class="box-card">
      <div slot="header" class="clearfix">
        <span>本月热销产品</span>
      </div>
      <div v-for="(value_a,key_a) in hotItemsThisMonth" :key="key_a" class="item">
        <span class="key">{{ key_a }}</span>
        <div class="tag-box">
          <el-tag
            v-for="(value_b, key_b) in value_a"
            :key="key_b"
            class="tag"
          >{{ key_b }}:{{ value_b }}</el-tag>
        </div>
      </div>
    </el-card>

    <el-card v-if="管理权限['客户统计可读']" class="box-card">
      <div slot="header" class="clearfix">
        <span>本月热销客户</span>
      </div>
      <div v-for="(value_a,key_a) in hotCustomerThisMonth" :key="key_a" class="item">
        <span class="key">{{ key_a }}</span>
        <div class="tag-box">
          <el-tag
            v-for="(value_b, key_b) in value_a"
            :key="key_b"
            class="tag"
          >{{ key_b }}:{{ value_b }}</el-tag>
        </div>
      </div>
    </el-card>

    <!--采购单统计模块-->
    <el-card v-if="管理权限['采购供应统计可读']" class="modul-b">
      <el-menu
        :default-active="purchaseActiveIndex"
        class="el-menu-demo"
        mode="horizontal"
        @select="handlePurchaseSelect"
      >
        <el-menu-item index="1">日采购额</el-menu-item>
        <el-menu-item index="2">月采购额</el-menu-item>
        <el-menu-item index="3">年采购额</el-menu-item>
      </el-menu>
      <div class="tags-box">
        <el-tag class="tag">更新时间：{{ suppPurUpdate }}</el-tag>
        <el-tag v-if="purchaseActiveIndex==='1'" class="tag">当日采购额:{{ thisDayPurchasesMoney }}</el-tag>
        <el-tag v-else-if="purchaseActiveIndex==='2'" class="tag">当月采购额:{{ thisMonthPurchasesMoney }}</el-tag>
        <el-tag v-else class="tag">当年采购额:{{ thisYearPurchasesMoney }}</el-tag>
      </div>
      <div id="mychart-dom-line-C" />
    </el-card>

    <!--供应商结算统计模块-->
    <el-card v-if="管理权限['供应商结算统计可读']" class="modul-b">
      <div slot="header" class="clearfix">
        <span>供应商结算</span>
      </div>
      <div id="mychart-dom-pie-A" />
    </el-card>

  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import {
  get_day_profits,
  get_month_profits,
  get_year_profits,
  get_product_note,
  get_month_product_note,
  get_year_product_note,
  get_order_data,
  get_year_order_data,
  get_month_sell_products,
  get_month_customer_data,
  get_day_supplier_purchases,
  get_month_supplier_purchases,
  get_years_supplier_purchases,
  get_month_supplier_statements
} from '@/api/statisticsData'
var echarts = require('echarts')
export default {
  data() {
    return {
      factory_unique_id: '',

      earningsActiveIndex: '1',
      // 收益统计信息
      getDayProfits: {},
      // 收益统计信息更新时间
      profitsUpdate: '',
      // 收益统计X轴数据
      profitsMonthXAxis: [],
      // 收益统计Y轴数据
      profitsMonthSeries: [],

      outputActiveIndex: '1',
      // 当日产量
      getProductNoteTHISDAY: 0,
      // 当月产量
      getProductNoteTHISMONTH: 0,
      // 当年产量
      getProductNoteTHISYEAR: 0,
      // 最新生产单工序数据
      newProcessGetProductNote: [],
      // 产量统计更新时间
      productUpdate: '',
      sevenDayXAxis: [],
      sevenDaySeries: [],

      marketActiveIndex: '1',
      marketXAxis: [],
      marketSeries: [],
      // 当日销售额
      getOrderNoteTHISDAY: 0,
      // 当月销售额
      getOrderNoteTHISMONTH: 0,
      // 当年销售额
      getOrderNoteTHISYEAR: 0,
      // 销售数据 更新时间
      sellUpdate: '',

      // 本月热销产品
      hotItemsThisMonth: {},
      // 本月热销客户
      hotCustomerThisMonth: {},

      purchaseActiveIndex: '1',
      // 当日采购额
      thisDayPurchasesMoney: 0,
      // 当月采购额
      thisMonthPurchasesMoney: 0,
      // 当年采购额
      thisYearPurchasesMoney: 0,
      // 采购供应更新时间
      suppPurUpdate: '',
      purchasesXAxis: [],
      purchasesSeries: [],

      // 月供应商结算数据
      monthlySupplierSettlement: {}
    }
  },
  computed: {
    ...mapGetters([
      '管理权限'
    ])
  },
  watch: {},
  created() {
    const { query } = this.$route
    this.factory_unique_id = query.unique_id
  },
  mounted() {
    if (this.$store.getters['管理权限']['收益统计可读']) this.drawRevenueBarChart()
    if (this.$store.getters['管理权限']['生产订单统计可读']) this.drawOrderOutputLineChart()
    if (this.$store.getters['管理权限']['销售订单统计可读']) this.drawSalesOrderLineChart()
    if (this.$store.getters['管理权限']['本月热销产品统计可读']) this.statisticsDataGetMonthSellProducts()
    if (this.$store.getters['管理权限']['客户统计可读']) this.statisticsDataGetMonthCustomerData()
    if (this.$store.getters['管理权限']['采购供应统计可读']) this.drawPurchaseAndSupplyLineChart()
    if (this.$store.getters['管理权限']['供应商结算统计可读']) this.getGysPieOption()
  },
  methods: {
    // 收益选项进行选择的时候
    handleEarningsSelect(key, keyPath) {
      this.earningsActiveIndex = key
      this.drawRevenueBarChart()
    },
    // 绘制收益柱状图
    async drawRevenueBarChart() {
      var dom = document.getElementById('mychart-dom-bar-A')
      var myChart = echarts.init(dom)

      if (this.earningsActiveIndex === '1') {
        await this.statisticsDataGetDayProfits()
      } else if (this.earningsActiveIndex === '2') {
        await this.statisticsDataGetMonthProfits()
      } else {
        await this.statisticsDataGetYearProfits()
      }

      var option = null
      var posList = [
        'left',
        'right',
        'top',
        'bottom',
        'inside',
        'insideTop',
        'insideLeft',
        'insideRight',
        'insideBottom',
        'insideTopLeft',
        'insideTopRight',
        'insideBottomLeft',
        'insideBottomRight'
      ]
      var app = {}
      app.configParameters = {
        rotate: {
          min: -90,
          max: 90
        },
        align: {
          options: {
            left: 'left',
            center: 'center',
            right: 'right'
          }
        },
        verticalAlign: {
          options: {
            top: 'top',
            middle: 'middle',
            bottom: 'bottom'
          }
        },
        position: {
          options: echarts.util.reduce(
            posList,
            function(map, pos) {
              map[pos] = pos
              return map
            },
            {}
          )
        },
        distance: {
          min: 0,
          max: 100
        }
      }
      app.config = {
        rotate: 0,
        align: 'center',
        verticalAlign: 'middle',
        position: ['50%', -15],
        distance: 10,
        onChange: function() {
          var labelOption = {
            normal: {
              rotate: app.config.rotate,
              align: app.config.align,
              verticalAlign: app.config.verticalAlign,
              position: app.config.position,
              distance: app.config.distance
            }
          }
          myChart.setOption({
            series: [
              {
                label: labelOption
              }
            ]
          })
        }
      }
      var labelOption = {
        show: true,
        position: app.config.position,
        distance: app.config.distance,
        align: app.config.align,
        verticalAlign: app.config.verticalAlign,
        rotate: app.config.rotate,
        formatter: params => {
          if (!params.value) return ''
          return params.value
        },
        color: '#333',
        fontSize: 12,
        // borderWidth: 1,
        // borderColor: "auto",
        padding: 2,
        rich: {
          name: {
            textBorderColor: 'black',
            color: '#fff'
          }
        }
      }
      option = {
        color: ['#DC5460'],
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        calculable: true,
        xAxis: [
          {
            type: 'category',
            axisTick: {
              show: false
            },
            axisLabel: {
              interval: 0,
              rotate: 40
            },
            data: this.profitsMonthXAxis
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ],
        grid: {
          left: '0',
          right: '0',
          containLabel: true
        },
        series: [
          {
            name: '收益金额',
            type: 'bar',
            barGap: 0,
            barWidth: 25,
            label: labelOption,
            color: '#89A7E8',
            data: this.profitsMonthSeries
          },
          {
            name: '收益金额',
            type: 'line',
            barGap: 0,
            barWidth: 25,
            // label: labelOption,
            color: '#DC5460',
            data: this.profitsMonthSeries
          }
        ]
      }
      if (option && typeof option === 'object') {
        myChart.setOption(option, true)
      }
    },
    // 日收益
    async statisticsDataGetDayProfits() {
      var paramter = {
        factory_unique_id: this.factory_unique_id,
        login_token: this.$store.getters.token,
        operate: '' // update
      }
      var res = await get_day_profits(paramter)
      var resData = res.data['近7天收益']
      var profitsMonthXAxis = []
      var profitsMonthSeries = []
      for (var i = 0; i < resData.length; i++) {
        profitsMonthXAxis.push(
          resData[i]['时间标记'].split('-')[0] +
            '年' +
            resData[i]['时间标记'].split('-')[1] +
            '月' +
            resData[i]['时间标记'].split('-')[2] +
            '日'
        )
        profitsMonthSeries.push(resData[i]['内容']['日收益金额'])
      }
      this.getDayProfits = res.data['日收益']['内容']
      this.profitsUpdate = res.data['日收益']['更新时间']
      this.profitsMonthXAxis = profitsMonthXAxis
      this.profitsMonthSeries = profitsMonthSeries
    },
    // 月收益
    async statisticsDataGetMonthProfits() {
      var paramter = {
        factory_unique_id: this.factory_unique_id,
        login_token: this.$store.getters.token,
        operate: '' // update
      }
      var res = await get_month_profits(paramter)
      var resData = res.data['近半年收益']
      var profitsMonthXAxis = []
      var profitsMonthSeries = []
      for (var i = 0; i < resData.length; i++) {
        // profitsMonthXAxis.push(resData[i]['时间标记'].split('-')[1] + '月')
        profitsMonthXAxis.push(
          resData[i]['时间标记'].split('-')[0] +
            '年' +
            resData[i]['时间标记'].split('-')[1] +
            '月'
        )
        profitsMonthSeries.push(resData[i]['内容']['月收益金额'])
      }

      this.getDayProfits = res.data['本月收益']['内容']
      this.profitsUpdate = res.data['本月收益']['更新时间']
      this.profitsMonthXAxis = profitsMonthXAxis
      this.profitsMonthSeries = profitsMonthSeries
    },
    // 年收益
    async statisticsDataGetYearProfits() {
      var paramter = {
        factory_unique_id: this.factory_unique_id,
        login_token: this.$store.getters.token,
        operate: '' // update
      }
      var res = await get_year_profits(paramter)
      var resData = res.data['近两年收益']
      var profitsMonthXAxis = []
      var profitsMonthSeries = []
      for (var i = 0; i < resData.length; i++) {
        profitsMonthXAxis.push(resData[i]['时间标记'] + '年')
        profitsMonthSeries.push(resData[i]['内容']['年收益金额'])
      }
      this.getDayProfits = res.data['今年收益']['内容']
      this.profitsUpdate = res.data['今年收益']['更新时间']
      this.profitsMonthXAxis = profitsMonthXAxis
      this.profitsMonthSeries = profitsMonthSeries
    },

    // 产量选项进行选择的时候
    handleOutputSelect(key, keyPath) {
      this.outputActiveIndex = key
      this.drawOrderOutputLineChart()
    },
    // 绘制订单产量折线图
    async drawOrderOutputLineChart() {
      var dom = document.getElementById('mychart-dom-line-A')
      var myChart = echarts.init(dom)

      if (this.outputActiveIndex === '1') {
        await this.statisticsDataGetProductNote()
      }
      if (this.outputActiveIndex === '2') {
        await this.statisticsDataGetMonthProductNote()
      }
      if (this.outputActiveIndex === '3') {
        await this.statisticsDataGetYearProductNote()
      }

      var option = {
        color: ['#DC5460'],
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            // 坐标轴指示器，坐标轴触发有效
            type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
          },
          position: ['50%', '50%']
        },
        grid: {
          left: 0,
          right: 0,
          bottom: 20,
          top: 20,
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            axisLabel: {
              interval: 0,
              rotate: 40
            },
            data: this.sevenDayXAxis
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ],
        series: [
          {
            name: '当日产量',
            type: 'line',
            itemStyle: {
              normal: {
                label: {
                  show: true,
                  color: '#89A7E8'
                }
              }
            },
            data: this.sevenDaySeries
          }
        ]
      }

      if (option && typeof option === 'object') {
        myChart.setOption(option, true)
      }
    },
    // 日生产订单api
    async statisticsDataGetProductNote() {
      var paramter = {
        factory_unique_id: this.factory_unique_id,
        login_token: this.$store.getters.token,
        operate: '' // update
      }
      var res = await get_product_note(paramter)
      // 生产订单圆环工序图
      var newProcessGetProductNote =
        res.data['当日数据']['内容']['最新生产单工序数据']
      if (newProcessGetProductNote.length > 0) {
        for (var i = 0; i < newProcessGetProductNote.length; i++) {
          newProcessGetProductNote[i].title = ''
          newProcessGetProductNote[i].canvasWidth = 80
          newProcessGetProductNote[i].valueColor = '#333'
          newProcessGetProductNote[i].lineWidth = '5'
          newProcessGetProductNote[i]['工序完成进度'] =
            newProcessGetProductNote[i]['工序完成进度'] * 100
        }
        var colorArr = [
          '#4A90E2',
          '#F19F27',
          '#2FCC71',
          '#DC5460',
          '#768CD2',
          '#EB8C4C',
          '#7B91B3',
          '#F9D710',
          '#D2767F',
          '#516ECD',
          '#06258B',
          '#4A90E2',
          '#F19F27',
          '#2FCC71',
          '#DC5460',
          '#768CD2',
          '#EB8C4C',
          '#7B91B3',
          '#F9D710',
          '#D2767F',
          '#516ECD',
          '#06258B'
        ]
        for (var j = 0; j < newProcessGetProductNote.length; j++) {
          newProcessGetProductNote[j].lineColor = colorArr[j]
        }
      }
      // 生产订单折线图
      var sevenDayXAxis = []
      var sevenDaySeries = []
      for (var k = 0; k < res.data['近7天数据'].length; k++) {
        sevenDayXAxis.push(
          res.data['近7天数据'][k]['时间标记'].split('-')[0] +
            '年' +
            res.data['近7天数据'][k]['时间标记'].split('-')[1] +
            '月' +
            res.data['近7天数据'][k]['时间标记'].split('-')[2] +
            '日'
        )
        sevenDaySeries.push(res.data['近7天数据'][k]['当日产量'])
      }

      this.getProductNoteTHISDAY = res.data['当日数据']['内容']['当日产量']
      this.getProductNoteTHISMONTH = res.data['当月数据']['当月产量']
      this.getProductNoteTHISYEAR = res.data['当年数据']['当年产量']
      this.newProcessGetProductNote =
        res.data['当日数据']['内容']['最新生产单工序数据']
      this.productUpdate = res.data['当日数据']['更新时间']
      this.sevenDayXAxis = sevenDayXAxis
      this.sevenDaySeries = sevenDaySeries
    },
    // 月生产订单api
    async statisticsDataGetMonthProductNote() {
      var paramter = {
        factory_unique_id: this.factory_unique_id,
        login_token: this.$store.getters.token,
        operate: '' // update
      }
      var res = await get_month_product_note(paramter)
      var sevenDayXAxis = []
      var sevenDaySeries = []
      for (var k = 0; k < res.data['近半年的数据'].length; k++) {
        sevenDayXAxis.push(
          res.data['近半年的数据'][k]['时间标记'].split('-')[0] +
            '年' +
            res.data['近半年的数据'][k]['时间标记'].split('-')[1] +
            '月'
        )
        sevenDaySeries.push(res.data['近半年的数据'][k]['当月产量'])
      }
      this.sevenDayXAxis = sevenDayXAxis
      this.sevenDaySeries = sevenDaySeries
    },
    // 年生产订单api
    async statisticsDataGetYearProductNote() {
      var paramter = {
        factory_unique_id: this.factory_unique_id,
        login_token: this.$store.getters.token,
        operate: '' // update
      }
      var res = await get_year_product_note(paramter)
      var sevenDayXAxis = []
      var sevenDaySeries = []
      for (var k = 0; k < res.data['近两年的数据'].length; k++) {
        sevenDayXAxis.push(res.data['近两年的数据'][k]['时间标记'] + '年')
        sevenDaySeries.push(res.data['近两年的数据'][k]['当年产量'])
      }
      this.sevenDayXAxis = sevenDayXAxis
      this.sevenDaySeries = sevenDaySeries
    },

    // 销售选项进行选择的时候
    handleMarketSelect(key, keyPath) {
      this.marketActiveIndex = key
      this.drawSalesOrderLineChart()
    },
    // 绘制销售订单折线图
    async drawSalesOrderLineChart() {
      var dom = document.getElementById('mychart-dom-line-B')
      var myChart = echarts.init(dom)
      if (this.marketActiveIndex === '1' || this.marketActiveIndex === '2') {
        await this.statisticsDataGetOrderNote()
      } else {
        await this.statisticsDataGetYearOrderNote()
      }

      var app = {}
      var posList = [
        'left',
        'right',
        'top',
        'bottom',
        'inside',
        'insideTop',
        'insideLeft',
        'insideRight',
        'insideBottom',
        'insideTopLeft',
        'insideTopRight',
        'insideBottomLeft',
        'insideBottomRight'
      ]
      app.configParameters = {
        rotate: {
          min: -90,
          max: 90
        },
        align: {
          options: {
            left: 'left',
            center: 'center',
            right: 'right'
          }
        },
        verticalAlign: {
          options: {
            top: 'top',
            middle: 'middle',
            bottom: 'bottom'
          }
        },
        position: {
          options: echarts.util.reduce(
            posList,
            function(map, pos) {
              map[pos] = pos
              return map
            },
            {}
          )
        },
        distance: {
          min: 0,
          max: 100
        }
      }
      app.config = {
        rotate: 0,
        align: 'center',
        verticalAlign: 'middle',
        position: ['50%', -15],
        distance: 10,
        onChange: function() {
          var labelOption = {
            normal: {
              rotate: app.config.rotate,
              align: app.config.align,
              verticalAlign: app.config.verticalAlign,
              position: app.config.position,
              distance: app.config.distance
            }
          }
          myChart.setOption({
            series: [
              {
                label: labelOption
              }
            ]
          })
        }
      }
      var labelOption = {
        show: true,
        position: app.config.position,
        distance: app.config.distance,
        align: app.config.align,
        verticalAlign: app.config.verticalAlign,
        rotate: app.config.rotate,
        formatter: params => {
          if (!params.value) return ''
          return params.value
        },
        color: '#333',
        fontSize: 12,
        // borderWidth: 1,
        // borderColor: "auto",
        padding: 2,
        rich: {
          name: {
            textBorderColor: 'black',
            color: '#fff'
          }
        }
      }
      var option = {
        color: ['#DC5460', '#d14a61'],
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        calculable: true,
        xAxis: [
          {
            type: 'category',
            axisTick: {
              show: false
            },
            axisLabel: {
              interval: 0,
              rotate: 40
            },
            data: this.marketXAxis
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ],
        grid: {
          left: '0',
          right: '0',
          containLabel: true
        },
        series: [
          {
            name: '销售额',
            type: 'bar',
            barGap: 0,
            barWidth: 25,
            label: labelOption,
            color: '#89A7E8',
            data: this.marketSeries
          },
          {
            name: '销售额',
            type: 'line',
            barGap: 0,
            barWidth: 25,
            // label: labelOption,
            color: '#DC5460',
            data: this.marketSeries
          }
        ]
      }

      if (option && typeof option === 'object') {
        myChart.setOption(option, true)
      }
    },
    // 销售订单数据（日月）
    async statisticsDataGetOrderNote() {
      var paramter = {
        factory_unique_id: this.factory_unique_id,
        login_token: this.$store.getters.token,
        operate: '' // update
      }
      var res = await get_order_data(paramter)
      if (this.marketActiveIndex === '1') {
        // 日的
        var marketXAxis = []
        var marketSeries = []
        for (let k = 0; k < res.data['近7天销售数据'].length; k++) {
          marketXAxis.push(
            res.data['近7天销售数据'][k]['时间标记'].split('-')[0] +
              '年' +
              res.data['近7天销售数据'][k]['时间标记'].split('-')[1] +
              '月' +
              res.data['近7天销售数据'][k]['时间标记'].split('-')[2] +
              '日'
          )
          marketSeries.push(res.data['近7天销售数据'][k]['内容']['当日销售额'])
        }
        this.marketXAxis = marketXAxis
        this.marketSeries = marketSeries
      } else if (this.marketActiveIndex === '2') {
        marketXAxis = []
        marketSeries = []
        for (let k = 0; k < res.data['近半年销售订单数据'].length; k++) {
          marketXAxis.push(
            res.data['近半年销售订单数据'][k]['时间标记'].split('-')[0] +
              '年' +
              res.data['近半年销售订单数据'][k]['时间标记'].split('-')[1] +
              '月'
          )
          marketSeries.push(
            res.data['近半年销售订单数据'][k]['内容']['当月销售额']
          )
        }
        this.marketXAxis = marketXAxis
        this.marketSeries = marketSeries
      }
      this.getOrderNoteTHISDAY =
        res.data['日销售订单数据']['内容']['当日销售额']
      this.getOrderNoteTHISMONTH =
        res.data['当月销售订单']['内容']['当月销售额']
      this.getOrderNoteTHISYEAR =
        res.data['当年销售订单']['内容']['当年销售额']
      this.sellUpdate = res.data['日销售订单数据']['更新时间']
    },
    // 销售订单数据（年）
    async statisticsDataGetYearOrderNote() {
      var paramter = {
        factory_unique_id: this.factory_unique_id,
        login_token: this.$store.getters.token,
        operate: '' // update
      }
      var res = await get_year_order_data(paramter)
      console.log(res.data)
      var marketXAxis = []
      var marketSeries = []
      for (var k = 0; k < res.data['近两年销售订单数据'].length; k++) {
        marketXAxis.push(res.data['近两年销售订单数据'][k]['时间标记'] + '年')
        marketSeries.push(
          res.data['近两年销售订单数据'][k]['内容']['当年销售额']
        )
      }
      this.marketXAxis = marketXAxis
      this.marketSeries = marketSeries
    },

    // 获取本月热销产品
    async statisticsDataGetMonthSellProducts() {
      var paramter = {
        factory_unique_id: this.factory_unique_id,
        login_token: this.$store.getters.token,
        operate: '' // update
      }
      var res = await get_month_sell_products(paramter)
      this.hotItemsThisMonth = res.data['内容']
    },
    // 本月热销客户统计
    async statisticsDataGetMonthCustomerData() {
      var paramter = {
        factory_unique_id: this.factory_unique_id,
        login_token: this.$store.getters.token,
        operate: '' // update
      }
      var res = await get_month_customer_data(paramter)
      this.hotCustomerThisMonth = res.data['内容']
    },

    // 销售选项进行选择的时候
    handlePurchaseSelect(key, keyPath) {
      this.purchaseActiveIndex = key
      this.drawPurchaseAndSupplyLineChart()
    },
    // 绘制采购供应折线图
    async drawPurchaseAndSupplyLineChart() {
      var dom = document.getElementById('mychart-dom-line-C')
      var myChart = echarts.init(dom)

      if (this.purchaseActiveIndex === '1') {
        await this.statisticsDataGetDaySupplierPurchases()
      } else if (this.purchaseActiveIndex === '2') {
        await this.statisticsDataGetMonthSupplierPurchases()
      } else {
        await this.statisticsDataGetYearSupplierPurchases()
      }
      var option = {
        color: ['#DC5460'],
        tooltip: {
          trigger: 'axis',
          axisPointer: { // 坐标轴指示器，坐标轴触发有效
            type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
          },
          position: ['50%', '50%']
        },
        grid: {
          left: 0,
          right: 0,
          bottom: 20,
          top: 20,
          containLabel: true
        },
        xAxis: [{
          type: 'category',
          axisLabel: {
            interval: 0,
            rotate: 40
          },
          data: this.purchasesXAxis
        }],
        yAxis: [{
          type: 'value'
        }],
        series: [{
          name: '当日采购额',
          type: 'line',
          smooth: true,
          itemStyle: {
            normal: {
              label: {
                show: true,
                color: '#89A7E8'
              }
            }
          },
          data: this.purchasesSeries
        }]
      }
      if (option && typeof option === 'object') {
        myChart.setOption(option, true)
      }
    },
    // 日采购供应数据（日）
    async statisticsDataGetDaySupplierPurchases() {
      var paramter = {
        factory_unique_id: this.factory_unique_id,
        login_token: this.$store.getters.token,
        operate: '' // update
      }
      var res = await get_day_supplier_purchases(paramter)
      var purchasesXAxis = []
      var purchasesSeries = []
      for (var k = 0; k < res.data['近7天采购量'].length; k++) {
        purchasesXAxis.push(res.data['近7天采购量'][k]['时间标记'].split('-')[0] + '年' + res.data['近7天采购量'][k]['时间标记'].split('-')[1] + '月' + res.data['近7天采购量'][k]['时间标记'].split('-')[2] + '日')
        purchasesSeries.push(res.data['近7天采购量'][k]['内容']['当日采购额'])
      }
      this.thisDayPurchasesMoney = res.data['当日采购量']['内容']['当日采购额']
      this.thisMonthPurchasesMoney = res.data['当月采购量']['内容']['当月采购额']
      this.thisYearPurchasesMoney = res.data['当年采购量']['内容']['当年采购额']
      this.suppPurUpdate = res.data['当日采购量']['更新时间']
      this.purchasesXAxis = purchasesXAxis
      this.purchasesSeries = purchasesSeries
    },
    // 近半年来采购供应数据（月）
    async statisticsDataGetMonthSupplierPurchases() {
      var paramter = {
        factory_unique_id: this.factory_unique_id,
        login_token: this.$store.getters.token,
        operate: '' // update
      }
      var res = await get_month_supplier_purchases(paramter)

      // 近半年来采购供应图表
      var purchasesXAxis = []
      var purchasesSeries = []
      for (var k = 0; k < res.data['近半年采购额'].length; k++) {
        purchasesXAxis.push(res.data['近半年采购额'][k]['时间标记'].split('-')[0] + '年' + res.data['近半年采购额'][k]['时间标记'].split('-')[1] + '月')
        purchasesSeries.push(res.data['近半年采购额'][k]['内容']['当月采购额'])
      }
      this.purchasesXAxis = purchasesXAxis
      this.purchasesSeries = purchasesSeries
    },
    // 年采购供应数据
    async statisticsDataGetYearSupplierPurchases() {
      var paramter = {
        factory_unique_id: this.factory_unique_id,
        login_token: this.$store.getters.token,
        operate: '' // update
      }
      var res = await get_years_supplier_purchases(paramter)
      var purchasesXAxis = []
      var purchasesSeries = []
      for (var k = 0; k < res.data['近半年采购额'].length; k++) {
        purchasesXAxis.push(res.data['近半年采购额'][k]['时间标记'] + '年')
        purchasesSeries.push(res.data['近半年采购额'][k]['内容']['当年采购额'])
      }
      this.purchasesXAxis = purchasesXAxis
      this.purchasesSeries = purchasesSeries
    },

    // 获取供应商圆环图
    async getGysPieOption() {
      var dom = document.getElementById('mychart-dom-pie-A')
      var myChart = echarts.init(dom)
      await this.statisticsDataGetMonthSupplierStatements()

      var legendData = []
      var seriesData = []
      for (let i = 0; i < this.monthlySupplierSettlement.内容.当月供应商结算总金额排行榜.length; i++) {
        var element = this.monthlySupplierSettlement.内容.当月供应商结算总金额排行榜[i]
        legendData.push(element['供应商名称'])
        seriesData.push({
          value: element['结算总金额'],
          name: element['供应商名称']
        })
      }

      var option = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 10,
          data: legendData
        },
        series: [
          {
            name: '结算总金额',
            type: 'pie',
            radius: ['50%', '70%'],
            avoidLabelOverlap: false,
            label: {
              normal: {
                show: false,
                position: 'center'
              },
              emphasis: {
                show: true,
                textStyle: {
                  fontSize: '30',
                  fontWeight: 'bold'
                }
              }
            },
            labelLine: {
              normal: {
                show: false
              }
            },
            data: seriesData
          }
        ]
      }

      if (option && typeof option === 'object') {
        myChart.setOption(option, true)
      }
    },
    // 月供应商结算
    async statisticsDataGetMonthSupplierStatements() {
      var paramter = {
        factory_unique_id: this.factory_unique_id,
        login_token: this.$store.getters.token,
        operate: '' // update
      }
      var res = await get_month_supplier_statements(paramter)
      this.monthlySupplierSettlement = res.data
    }
  }
}
</script>

<style lang="scss" scoped>
.factoryKanBanData {
  padding: 40px;
  .modul-a {
    margin-bottom: 20px;
    .tags-box {
      display: flex;
      justify-content: flex-start;
      .tag {
        margin: 10px 20px 10px 0;
      }
    }
    #mychart-dom-bar-A {
      height: 400px;
      width: 100%;
    }
  }
  .modul-b {
    margin-bottom: 20px;
    .tags-box {
      display: flex;
      justify-content: flex-start;
      .tag {
        margin: 10px 20px 10px 0;
      }
    }
    #mychart-dom-line-A {
      height: 400px;
      width: 100%;
    }
    #mychart-dom-line-B {
      height: 400px;
      width: 100%;
    }
    #mychart-dom-line-C {
      height: 400px;
      width: 100%;
    }
    #mychart-dom-pie-A{
      height: 400px;
      width: 100%;
    }
    .progress-box {
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      .progress {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        .span-a {
          width: 100%;
          text-align: center;
          margin-top: 5px;
        }
        .span-b {
          width: 100%;
          text-align: center;
          margin-top: 10px;
          margin-bottom: 20px;
        }
      }
    }
  }
  .box-card {
    margin-bottom: 20px;
    .item {
      margin-bottom: 5px;
      display: flex;
      .key {
        width: 200px;
        line-height: 28px;
      }
      .tag-box {
        display: flex;
        flex-wrap: wrap;
        .tag {
          margin: 0 10px 10px 0;
        }
      }
    }
    .item:last-child {
      margin-bottom: 0px;
    }
  }
}
</style>

