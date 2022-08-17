<template>
  <div class="real-time-plate">
    <div class="header">
      <img src="@/assets/images/title_image_1.png" alt>
      <span class="title">工厂实时看板系统</span>
    </div>
    <div class="section_a">
      <!-- 天气模块 -->
      <div class="environment">
        <div class="item">
          <img class="bg" src="@/assets/images/小bg@2x.png" alt>
          <div class="left">
            <img src="@/assets/images/天气@2x.png" alt style="width: 40px;">
          </div>
          <div class="right">
            <span class="text-1">天气</span>
            <span class="text-2">{{ weather.wea }}</span>
          </div>
        </div>

        <div class="item">
          <img class="bg" src="@/assets/images/小bg@2x.png" alt>
          <div class="left">
            <img src="@/assets/images/温度@2x.png" alt style="width: 30px;">
          </div>
          <div class="right">
            <span class="text-1">温度</span>
            <span class="text-2">{{ weather.tem }}℃</span>
          </div>
        </div>

        <div class="item">
          <img class="bg" src="@/assets/images/小bg@2x.png" alt>
          <div class="left">
            <img src="@/assets/images/湿度@2x.png" alt style="width: 40px;">
          </div>
          <div class="right">
            <span class="text-1">湿度</span>
            <span class="text-2">{{ weather.humidity }}%</span>
          </div>
        </div>

        <div class="item">
          <img class="bg" src="@/assets/images/小bg@2x.png" alt>
          <div class="left">
            <img src="@/assets/images/pm@2x.png" alt style="width: 40px;">
          </div>
          <div class="right">
            <span class="text-1">PM2.5</span>
            <span class="text-2">{{ weather.air_pm25 }}ug/m³</span>
          </div>
        </div>
      </div>

      <div class="productNote">
        <div class="lt" />
        <div class="rt" />
        <div class="rb" />
        <div class="lb" />
        <div class="module-a">
          <span class="item-1">现完成数</span>
          <span class="item-2">0</span>
          <span class="item-2">0</span>
          <span class="item-2">0</span>
          <div class="item-3">
            <span>生产单总数</span>
            <span>{{ allProductionNoteTableData.length }}</span>
          </div>
        </div>
        <div id="productNoteInfo" />
      </div>

      <!-- 时间模块 -->
      <div class="time">
        <img src="@/assets/images/大bg@2x.png">
        <div class="left">
          <span class="text-1">{{ monthAndDay }}</span>
          <span class="text-2">{{ week }}</span>
          <span class="text-3">{{ accordingToTheLunarCalendar }}</span>
        </div>
        <div class="right">
          <span>{{ whenAVehicle }}</span>
        </div>
      </div>
    </div>

    <div class="section_b">
      <div class="title">
        <span>生产进度统计</span>
        <div class="process">
          <div class="color" />
          <div class="text">开料</div>
        </div>
        <div class="process">
          <div class="color" />
          <div class="text">铲痞</div>
        </div>
        <div class="process">
          <div class="color" />
          <div class="text">孟谢</div>
        </div>
        <div class="process">
          <div class="color" />
          <div class="text">车秒</div>
        </div>
        <div class="process">
          <div class="color" />
          <div class="text">包子</div>
        </div>
      </div>
      <div class="product-note-list">
        <div class="product-note-item-box">
          <div class="header">
            <div class="item-1">
              <span>生产单号: 12345678900</span>
              <span>生产单时间: 2019-16-18</span>
            </div>
            <div class="item-2">
              <el-progress :percentage="100" style="color:#fff;" />
            </div>
            <div class="item-3">
              <div
                v-for="(item,index) in 工序总结"
                :key="index"
                class="process"
                :style="calculateTheWidthOfThe"
              >
                <span class="arrows">→</span>

                <el-tag v-if="item.员工计件完成数量===item.总排产数" class="tag">
                  <span>{{ item.工序名称 }}{{ item.员工计件完成数量 }}个</span>
                  <b />
                  <span>(完成)</span>
                </el-tag>

                <div v-else-if="item.员工计件完成数量>0&&item.员工计件完成数量!==item.总排产数" class="circle">
                  <div class="ongoing">
                    <span>{{ item.工序名称 }}</span>
                    <span>(进行中)</span>
                  </div>
                  <el-progress type="circle" :percentage="50" :width="60" :show-text="false" />
                </div>

                <el-tag v-else class="tag unfinished">
                  <span>未完成</span>
                </el-tag>
              </div>
            </div>
          </div>
          <div id="product-note-item" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
var echarts = require('echarts')
import { list_ongoing_production_notes } from '@/api/ordersForProductionScheduling'
import axios from 'axios'
import { parseTime, Lunar } from '@/utils'
export default {
  name: 'RealTimePlate',
  data() {
    return {
      // ['开料', '铲皮', '锰鞋', '扯面', '包装']
      工序总结: [
        {
          unique_id: '开料',
          工序名称: '开料',
          总排产数: 50,
          总计件完成数量: 0,
          员工计件完成数量: 50
        },
        {
          unique_id: '铲皮',
          工序名称: '铲皮',
          总排产数: 50,
          总计件完成数量: 0,
          员工计件完成数量: 50
        },
        {
          unique_id: '锰鞋',
          工序名称: '锰鞋',
          总排产数: 50,
          总计件完成数量: 0,
          员工计件完成数量: 25
        },
        {
          unique_id: '开料',
          工序名称: '开料',
          总排产数: 50,
          总计件完成数量: 0,
          员工计件完成数量: 0
        },
        {
          unique_id: '开料',
          工序名称: '开料',
          总排产数: 50,
          总计件完成数量: 0,
          员工计件完成数量: 0
        }
      ],
      allProductionNoteTableData: [], // 生产单列表
      weather: {}, // 天气
      whenAVehicle: '', // 当前时间 时分秒
      monthAndDay: '', // 公历的月和日
      week: '', // 星期数
      accordingToTheLunarCalendar: ''
    }
  },
  computed: {
    // 计算工序宽度
    calculateTheWidthOfThe: function() {
      return `width: ${100 / this.工序总结.length}%;`
    }
  },
  watch: {
    // 监听生产单列表 发生变化的话渲染饼图
    allProductionNoteTableData: function(newVal, oldVal) {
      if (newVal && Array.isArray(newVal) && newVal.length > 0) {
        this.drawThePieChart()
      }
    }
  },
  created() {
    // 获取天气
    this.forTheWeather()
    // 获取当前时间
    this.theCountdown()
    setInterval(() => { this.theCountdown() }, 1000)
    // 获取生产单列表
    this.listOnGoingProductionNotes()
  },
  mounted() {
    this.drawABarChart()
  },
  methods: {
    // 获取天气
    forTheWeather() {
      var that = this
      axios
        .get('https://www.tianqiapi.com/api/?version=v6&city=北京')
        .then(function(reponse) {
          that.weather = reponse.data
        })
    },
    // 倒计时计算
    theCountdown() {
      const date = new Date()
      this.whenAVehicle = parseTime(date, '{h}:{i}:{s}')
      this.monthAndDay = `${date.getMonth() + 1}月${date.getDate()}日`
      const week = date.getDay()
      switch (week) {
        case 0:
          this.week = '星期日'
          break
        case 1:
          this.week = '星期一'
          break
        case 2:
          this.week = '星期二'
          break
        case 3:
          this.week = '星期三'
          break
        case 4:
          this.week = '星期四'
          break
        case 5:
          this.week = '星期五'
          break
        case 6:
          this.week = '星期六'
          break
      }
      const accordingToTheLunarCalendar = Lunar.toLunar(date.getFullYear(), date.getMonth() + 1, date.getDate())
      this.accordingToTheLunarCalendar = `${accordingToTheLunarCalendar[3]}年${accordingToTheLunarCalendar[5]}月${accordingToTheLunarCalendar[6]}日`
    },
    // 获取生产单列表
    async listOnGoingProductionNotes() {
      this.allProductionNoteTableData = []
      var post_data = {
        login_token: this.$store.getters.token
      }
      const response = await list_ongoing_production_notes(post_data)
      this.allProductionNoteTableData = response.data
    },
    // 绘制生产单饼状图
    drawThePieChart() {
      var dom = document.getElementById('productNoteInfo')
      var myChart = echarts.init(dom)
      var app = {}
      var option = null
      app.title = '环形图'
      option = {
        title: {
          text: '今日生产单统计',
          x: 'center',
          textStyle: {
            color: '#fff'
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        color: ['#959697', '#da2145', '#22dcfe'],
        // 图例组件展现了不同系列的标记(symbol)，颜色和名字
        legend: {
          orient: 'vertical',
          left: '10',
          bottom: '10',
          data: ['新生产单', '排产中', '已完成'],
          textStyle: {
            color: '#fff'
          }
        },
        series: [
          {
            name: '',
            type: 'pie',
            radius: ['25%', '50%'],
            center: ['66%', '53%'], // 距离左右，上下距离的百分比
            label: {
              normal: {
                formatter: '  {b|{b}:} {c|{c}}\n  {per|{d}%}',
                rich: {
                  b: {
                    fontSize: 14,
                    lineHeight: 20
                  },
                  c: {
                    fontSize: 14,
                    lineHeight: 14
                  },
                  per: {
                    fontSize: 16,
                    lineHeight: 16,
                    color: '#fff'
                  }
                }
              }
            },
            labelLine: {
              normal: {
                show: true
              }
            },
            data: this.returnsThePieChartDataObject()
          }
        ]
      }
      if (option && typeof option === 'object') {
        myChart.setOption(option, true)
      }
    },
    // 返回饼图data对象
    returnsThePieChartDataObject() {
      var value_1 = 0
      var value_2 = 0
      var value_3 = 0
      for (let i = 0; i < this.allProductionNoteTableData.length; i++) {
        const element = this.allProductionNoteTableData[i]
        if (element.生产单状态 === '新生产单') value_1 += 1
        else if (element.生产单状态 === '排产中') value_2 += 1
        else if (element.生产单状态 === '已完成') value_3 += 1
      }
      var data = [
        { value: value_1, name: '新生产单' },
        { value: value_2, name: '排产中' },
        { value: value_3, name: '已完成' }
      ]
      return data
    },

    // 绘制生产单信息柱状图
    drawABarChart() {
      var dom = document.getElementById('product-note-item')
      var myChart = echarts.init(dom)
      var app = {}
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

      //
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
        rotate: 90,
        align: 'left',
        verticalAlign: 'middle',
        position: 'insideBottom',
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
              },
              {
                label: labelOption
              },
              {
                label: labelOption
              },
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
          return params.seriesName
        },
        color: '#fff',
        fontSize: 12,
        rich: {
          name: {
            textBorderColor: 'black',
            color: '#fff'
          }
        }
      }

      option = {
        // color: ['#003366', '#006699', '#4cabce', '#e5323e'],
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        grid: {
          x: 25,
          y: 25,
          x2: 25,
          y2: 25,
          borderWidth: 1
        },
        calculable: true,
        xAxis: [
          {
            axisLine: {
              lineStyle: {
                color: '#fff'
              }
            },
            type: 'category',
            axisTick: { show: true },
            data: ['开料', '铲皮', '锰鞋', '扯面', '包装']
          }
        ],
        yAxis: [
          {
            axisLine: {
              lineStyle: {
                color: '#fff'
              }
            },
            type: 'value'
          }
        ],
        series: [
          {
            name: '员工A',
            type: 'bar',
            barGap: '10%',
            label: labelOption,
            data: [10, 30, 10, 0, 0]
          },
          {
            name: '员工B',
            type: 'bar',
            label: labelOption,
            data: [10, 10, 10, 0, 0]
          },
          {
            name: '员工C',
            type: 'bar',
            label: labelOption,
            data: [10, 10, 5, 0, 0]
          },
          {
            name: '员工D',
            type: 'bar',
            label: labelOption,
            data: [20, 0, 0, 0, 0]
          }
        ]
      }
      if (option && typeof option === 'object') {
        myChart.setOption(option, true)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.real-time-plate {
  background-color: #020f3c;
  min-height: calc(100vh - 50px);
  .header {
    width: 100%;
    height: 75.5ppx;
    position: relative;
    img {
      width: 100%;
    }
    .title {
      position: absolute;
      font-size: 24px;
      font-weight: 700;
      color: #fff;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
    }
  }
  .section_a {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    align-items: center;
    .environment {
      height: 160px;
      width: 300px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      margin-left: 30px;
      .item {
        width: 140px;
        height: 60px;
        position: relative;
        .bg {
          width: 140px;
          height: 60px;
          position: absolute;
          left: 0;
          right: 0;
          z-index: 1;
        }
        .left {
          float: left;
          width: 60px;
          height: 60px;
          position: relative;
          img {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 2;
          }
        }
        .right {
          float: right;
          height: 100%;
          width: 80px;
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          .text-1 {
            width: 100%;
            color: #5a89b9;
            text-align: center;
          }
          .text-2 {
            color: #fff;
            width: 100%;
            text-align: center;
            font-weight: 700;
            font-size: 18px;
          }
        }
      }
    }
    .productNote {
      width: 480px;
      height: 260px;
      border: 1px solid #0b2f6f;
      position: relative;
      padding: 10;
      .lt,
      .rt,
      .rb,
      .lb {
        width: 10px;
        height: 10px;
        position: absolute;
      }
      .lt {
        border-top: 3px solid #00d3e7;
        border-left: 3px solid #00d3e7;
        left: -2px;
        top: -2px;
      }
      .rt {
        border-top: 3px solid #00d3e7;
        border-right: 3px solid #00d3e7;
        right: -2px;
        top: -2px;
      }
      .rb {
        border-bottom: 3px solid #00d3e7;
        border-right: 3px solid #00d3e7;
        right: -2px;
        bottom: -2px;
      }
      .lb {
        border-bottom: 3px solid #00d3e7;
        border-left: 3px solid #00d3e7;
        left: -2px;
        bottom: -2px;
      }
      .module-a {
        margin-left: 10px;
        margin-top: 10px;
        position: absolute;
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;
        // background-color: pink;
        align-items: center;
        width: 160px;
        height: 70px;
        .item-1 {
          width: 100%;
          color: #5a89b9;
          width: 100%;
          text-align: left;
        }
        .item-2 {
          background-color: #0b2f6f;
          font-size: 24px;
          height: 30px;
          line-height: 30px;
          color: #fff;
        }
        .item-3 {
          display: flex;
          align-items: center;
          font-size: 14px;
          color: #fff;
          justify-content: space-between;
        }
      }
      #productNoteInfo {
        height: 100%;
        width: 100%;
      }
    }
    .time {
      width: 300px;
      height: 140px;
      margin-right: 30px;
      font-size: 0;
      position: relative;
      img {
        width: 100%;
        height: 100%;
      }
      .left,
      .right {
        height: 100%;
        position: absolute;
        top: 0;
      }
      .left {
        left: 0;
        width: 127px;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        .text-1,
        .text-2,
        .text-3 {
          width: 100%;
          color: #b9c3f3;
          text-align: center;
        }
        .text-1 {
          font-size: 20px;
          margin-top: 5px;
        }
        .text-2 {
          font-size: 20px;
        }
        .text-3 {
          font-size: 16px;
          margin-bottom: 5px;
        }
      }
      .right {
        right: 0;
        width: 173px;
        color: #fff;
        font-size: 34px;
        text-align: center;
        line-height: 140px;
      }
    }
  }
  .section_b {
    padding: 10px;
    .title {
      display: flex;
      justify-content: flex-start;
      height: 40px;
      line-height: 40px;
      align-items: center;
      span:first-child {
        font-size: 18px;
        color: #4b8dc3;
        margin-left: 20px;
        margin-right: 10px;
      }
      .process {
        display: flex;
        height: 20px;
        justify-content: space-between;
        align-items: center;
        margin-right: 10px;
        .color {
          width: 10px;
          height: 10px;
          background-color: red;
          margin-right: 5px;
        }
        .text {
          color: #fff;
          font-size: 14px;
          line-height: 20px;
        }
      }
    }
    .product-note-list {
      border: 1px solid #0b2f6f;
      padding: 10px 5px;
      .product-note-item-box {
        width: 600px;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        .header {
          width: 100%;
          .item-1 {
            width: 100%;
            font-size: 14px;
            color: #fff;
            display: flex;
            justify-content: space-evenly;
          }
          .item-2 {
            width: 100%;
          }
          .item-3 {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            padding: 0 30px 0 22px;
            .process {
              display: flex;
              justify-content: center;
              align-items: center;
              position: relative;
              .arrows {
                color: green;
                font-weight: 700;
                text-align: right;
              }
              .tag {
                background-color: #43a0e5;
                line-height: 16px;
                flex: 1;
                height: 35px;
                display: flex;
                flex-wrap: wrap;
                align-items: center;
                justify-content: center;
                color: #fff;
              }
              .tag.unfinished {
                background-color: #22252d;
              }
              .circle {
                position: relative;
                .ongoing {
                  font-size: 12px;
                  width: 100%;
                  position: absolute;
                  top: 48%;
                  left: 50%;
                  transform: translate(-50%, -50%);
                  color: #fff;
                  display: flex;
                  justify-content: center;
                  flex-wrap: wrap;
                }
              }
            }
          }
        }
        #product-note-item {
          width: 100%;
          height: 260px;
        }
      }
    }
  }
}
</style>

