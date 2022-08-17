<template>
  <div>
    <el-dialog :visible.sync="show" center width="1000px" :show-close="false">
      <div class="print-box">
        <el-button
          class="print-btn"
          type="primary"
          size="small"
          :loading="loading"
          @click="printComponent()"
        >打印</el-button>
        <el-progress
          class="progress"
          :text-inside="true"
          :stroke-width="16"
          :percentage="excelUploadSchedule"
        />
        <div class="paging">
          <strong>分页数量：</strong>
          <el-input-number v-model="numberOfPages" :min="1" :max="2" label="描述文字" />
        </div>
      </div>

      <div id="printProductionNote">
        <div
          v-for="(item_1,index_1) in titleTableDataList"
          :key="index_1"
          :class="numberOfPages===1?'printProductionNote one-pages':'printProductionNote two-pages'"
        >
          <div class="title">{{ title(index_1) }}</div>
          <div class="module-a">
            <div v-for="(item,index) in 生产单打印配置信息" :key="index" class="item">
              <span class="key">{{ calculateKey(item) }}</span>
              <span class="value">{{ calculateValue(item,index_1) }}</span>
            </div>
          </div>

          <div class="module-b">
            <img :src="productNoteDetailList[index_1].生产单二维码" alt="无图片">
          </div>

          <!--工序/工艺流程选择-->
          <div class="module-c">
            <table class="craft-table">
              <tr class="header">
                <td>工艺步骤</td>
                <td
                  v-for="(item_a,index_a) in productNoteDetailList[index_1].生产单工序信息[0].配码完成总计数.配码"
                  :key="index_a"
                >{{ item_a["尺码"] }} / {{ item_a["国标码"] }}</td>
                <td>总计</td>
              </tr>

              <!-- 这里其实是个目标数列，为了跟厂家的生产单保持一致-->
              <tr class="header">
                <td />
                <td
                  v-for="(item_d,index_d) in productNoteDetailList[index_1].生产单工序信息[0]['配码完成总计数']['配码']"
                  :key="index_d"
                >{{ item_d['目标数量'] |formattedNumber }}</td>
                <td>{{ totalProcessObjectives(index_1) }}</td>
              </tr>

              <tr
                v-for="(item_b,index_b) in productNoteDetailList[index_1].生产单工序信息"
                :key="index_b"
                class="header"
              >
                <td>{{ item_b.工序信息.工序名称 }}</td>

                <!-- {{ item_c['目标数量'] }} -->
                <td v-for="(item_c,index_c) in item_b['配码完成总计数']['配码']" :key="index_c" />

                <!-- {{ item_b["配码完成总计数"]["总完成数"] }}  -->
                <td />
              </tr>

              <tr style="height:60px;">
                <td>备注</td>
                <td
                  style="font-size: 18px; color: red; font-weight: 700;"
                  :colspan="productNoteDetailList[index_1].生产单工序信息[0]['配码完成总计数']['配码'].length-2"
                >{{ productNoteDetailList[index_1].生产单备注 }}</td>
                <td>
                  <span style="display: block;">品</span>
                  <span style="display: block;">牌</span>
                </td>
                <td colspan="2">{{ brandName(index_1) }}</td>
              </tr>
            </table>
            <div class="footer">
              <span>办公室跟单员：</span>
              <span>质量跟单员：</span>
            </div>
            <div v-if="printContainDetail && productNoteDetailList[index_1].排产产品.产品信息.部位详情.length>0">
              <div style="font-size:18px">原材料清单：</div>
              <table class="craft-table">
                <tr class="header">
                  <td>部位名称</td>
                  <td style="text-align: left;padding-left:5px">物料信息及数量</td>
                  <td style="width:70px;">部位名称</td>
                  <td style="text-align: left;padding-left:5px">物料信息及数量</td>
                </tr>
                <tr v-for="(item_o,index_o) in productNoteDetailList[index_1].排产产品.产品信息.部位详情" :key="index_o" class="header">
                  <td v-if="index_o % 2 ===0">{{ item_o['部位名称'] }}</td>
                  <td v-if="index_o % 2 ===0" style="text-align:left;"><span style="padding-left:5px;display:inline-block;transform:perspective(1px) scale(0.85)">{{ getContainDetail(item_o) }}</span></td>
                  <td v-if="index_o % 2 ===0" style="width:70px;">{{ productNoteDetailList[index_1].排产产品.产品信息.部位详情[index_o+1] ? productNoteDetailList[index_1].排产产品.产品信息.部位详情[index_o+1]['部位名称']: '' }}</td>
                  <td v-if="index_o % 2 ===0" style="text-align:left;"><span style="padding-left:5px;display:inline-block;transform:perspective(1px) scale(0.85)">{{ getContainDetail(productNoteDetailList[index_1].排产产品.产品信息.部位详情[index_o+1]) }}</span></td>
                </tr>
              </table>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  get_order_by_id,
  get_production_note_by_id
} from '@/api/ordersForProductionScheduling'
import { mapGetters } from 'vuex'
import $ from 'jquery'
export default {
  props: {
    curOperationDetailInfo: {
      type: Array,
      required: true
    },
    printContainDetail: {
      type: Boolean,
      required: true
    },
    dialogVisible: Boolean,
    onClose: {
      required: true,
      validator: function(value) {
        return true
      }
    }
  },
  data() {
    return {
      orderDetailList: [], // 订单详情
      productNoteDetailList: [], // 生产单详情
      show: false,
      // 用于展示标题区域
      titleTableDataList: [
        //   {
        //   生产单编号: '',
        //   客户名称: '',
        //   产品编号: '',
        //   客户产品编号: '',
        //   订单编号: '',
        //   材质: '',
        //   颜色: '',
        //   生产单日期: '',
        //   '内里/垫脚': '',
        //   款号: '',
        //   交货日期: '',
        //   萱型: ''
        // }
      ],
      loading: false,
      excelUploadSchedule: 0,
      // 分页数量
      numberOfPages: 1
    }
  },
  computed: {
    ...mapGetters(['生产单打印配置信息'])
  },
  watch: {
    dialogVisible: function(newVal, oldVal) {
      this.show = newVal
      if (newVal && !oldVal) {
        this.init()
      }
    },
    show: function(newVal, oldVal) {
      if (!newVal) {
        this.onClose(this.show)
        this.titleTableDataList = []
        this.orderDetailList = []
        this.productNoteDetailList = []
        this.loading = false
        this.excelUploadSchedule = 0
      }
    }
  },
  methods: {
    async init() {
      this.excelUploadSchedule = 0
      this.loading = true
      await this.getOrderDetailsAndProductionOrderDetails()

      if (!this.show) return
      // 1.重组自己的数据结构，便于标题的显示
      console.log(this.curOperationDetailInfo)
      console.log(this.productNoteDetailList)
      this.titleTableDataList = []
      for (let i = 0; i < this.curOperationDetailInfo.length; i++) {
        var titleTableData = {
          生产单编号: this.productNoteDetailList[i].生产单编号,
          客户名称: this.orderDetailList[i].客户信息.名称,
          产品编号: this.productNoteDetailList[i].排产产品.产品信息.产品编号,
          客户产品编号: this.returnsTheCustomerProductNumber(i),
          订单编号: this.orderDetailList[i].订单编号,
          生产单日期: this.productNoteDetailList[i].生产单时间,
          交货日期: this.orderDetailList[i].交货日期
        }
        //  把对应订单的tag信息对应出来: 为 订单.tags.XXX 的形式
        for (const [key, value] of Object.entries(this.orderDetailList[0]['tags'])) {
          titleTableData['订单.tags.' + key] = value
        }
        // 1.1要把标签找出来再赋值
        const tags = this.ReturnsTheLabelOfTheRowProduct(i)
        for (let i = 0; i < this.生产单打印配置信息.length; i++) {
          const element = this.生产单打印配置信息[i]
          const keys = Object.keys(element)
          if (keys.length !== 1 || !keys[0]) continue
          // 判断这个key在标签里有没有
          for (const key in tags) {
            if (element[keys[0]] === key) {
              titleTableData[key] = tags[key]
            }
          }
        }
        this.titleTableDataList.push(titleTableData)
        console.log(this.titleTableDataList)
      }
      this.excelUploadSchedule = 100
      this.loading = false
    },

    // 获取订单详情和生产单子详情
    async getOrderDetailsAndProductionOrderDetails() {
      this.orderDetailList = []
      for (let i = 0; i < this.curOperationDetailInfo.length; i++) {
        const element = this.curOperationDetailInfo[i]
        var post_data_a = {
          login_token: this.$store.getters.token,
          unique_id: element['对应订单号']
            ? element['对应订单号']
            : element['对应订单']['订单编号']
        }
        if (!this.show) {
          this.orderDetailList = []
          throw SyntaxError('中断发送请求！')
        }
        const response = await get_order_by_id(post_data_a)
        this.orderDetailList.push(response.data)

        var post_data = {
          login_token: this.$store.getters.token,
          unique_id: element['生产单编号']
        }
        if (!this.show) {
          this.productNoteDetailList = []
          throw SyntaxError('中断发送请求！')
        }
        const production_note_response = await get_production_note_by_id(
          post_data
        )
        this.productNoteDetailList.push(production_note_response.data)
        this.excelUploadSchedule = Number(
          parseFloat(
            ((i + 1) / this.curOperationDetailInfo.length) * 98
          ).toFixed(1)
        )
      }
    },
    // 返回大标题 文本
    title(index) {
      return (this.$store.getters['对应企业名称'] +
        '_生产单号: ' +
        this.productNoteDetailList[index].生产单编号
      )
    },

    // 打印组件
    printComponent() {
      this.loading = true
      setTimeout(() => {
        this.loading = false
      }, 4000)
      $('#printProductionNote').print({
        globalStyles: true,
        mediaPrint: false,
        stylesheet: null,
        noPrintSelector: '.no-print',
        iframe: true,
        append: null,
        prepend: null,
        manuallyCopyFormValues: true,
        deferred: $.Deferred(),
        timeout: 30000,
        title: null, // 谷歌不支持 ie支持
        doctype: '<!doctype html>'
      })
    },

    /**
     * 计算顶部的标题区域块 key 如何显示
     * item 必须是一个对象 且 只能有一个key
     */
    calculateKey(item) {
      for (const key in item) {
        if (key) {
          return key + ':'
        } else return ''
      }
    },
    /**
     * 计算顶部的标题区域块 value 如何显示
     * item 必须是一个对象 且 只能有一个key
     */
    calculateValue(item, index) {
      for (const key in item) {
        if (key) {
          return this.titleTableDataList[index][item[key]]
        } else {
          return ''
        }
      }
    },
    // 返回客户产品编号
    returnsTheCustomerProductNumber(index) {
      var 包含的产品 = this.orderDetailList[index].包含的产品
      for (let i = 0; i < 包含的产品.length; i++) {
        const element = 包含的产品[i]
        if (
          element.产品信息.unique_id ===
          this.productNoteDetailList[index].排产产品.产品信息.unique_id
        ) {
          return element.客户产品编号
        }
      }
      return ''
    },
    // 返回该排产产品的标签
    ReturnsTheLabelOfTheRowProduct(index) {
      var 包含的产品 = this.orderDetailList[index].包含的产品
      for (let i = 0; i < 包含的产品.length; i++) {
        const element = 包含的产品[i]
        if (
          element.产品信息.unique_id ===
          this.productNoteDetailList[index].排产产品.产品信息.unique_id
        ) {
          return element.产品信息.tags
        }
      }
      return {}
    },
    // 返回品牌名称
    brandName(index) {
      var 包含的产品 = this.orderDetailList[index].包含的产品
      for (let i = 0; i < 包含的产品.length; i++) {
        const element = 包含的产品[i]
        if (
          element.产品信息.unique_id ===
          this.productNoteDetailList[index].排产产品.产品信息.unique_id
        ) {
          return element.品牌
        }
      }
      return ''
    },
    // 工序总计
    totalProcessObjectives(index) {
      var count = 0
      var 配码 = this.productNoteDetailList[index]['生产单工序信息'][0][
        '配码完成总计数'
      ]['配码']
      for (let i = 0; i < 配码.length; i++) {
        const element = 配码[i]
        count += Number(parseFloat(element['目标数量']).toFixed(2))
      }
      return count
    },
    // 物料信息
    getContainDetail(item_o) {
      if (!item_o) {
        return
      }
      var tagsArr = ((Object.values(item_o['使用物料']['tags'])).filter(x => { return x })).join('-')
      // var wuliaoNum = item_o['使用物料']['物料编号']
      var priceNum = item_o['使用物料']['参考市场单价']
      var intNum = item_o['使用物料']['单位']
      // let wuliaoNumStr = ''
      // if (wuliaoNum) {
      //   wuliaoNumStr = wuliaoNum + ':'
      // } else {
      //   wuliaoNumStr = wuliaoNum
      // }
      var strEle = tagsArr + ' ' + priceNum + intNum
      return strEle
    }
  }
}
</script>

<style lang="scss" scoped>
.print-box {
  overflow: hidden;
  height: 40px;
  .print-btn{
    float: left;
    margin-top: 4px;
  }
  .progress {
    float: left;
    margin: 12px;
    width: 150px;
  }
  .paging{
    float: right;
  }
}
.printProductionNote {
  width: 100%;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  margin-bottom: 50px;

  .title {
    width: 100%;
    font-size: 22px;
    text-align: center;
    margin-bottom: 20px;
    color: #000;
    font-weight: 700;
  }
  .module-a {
    width: 90%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    margin-bottom: 20px;
    .item {
      width: 33.3333333%;
      line-height: 22px;
      .key {
        margin-right: 10px;
        font-weight: 700;
      }
      .value {
        font-weight: 700;
        color: #000;
        border-bottom: 1px solid #000;
      }
    }
    .item-tags {
      width: 100%;
      display: flex;
      justify-content: space-between;
      .item-tag {
        line-height: 22px;
        .key {
          margin-right: 10px;
          font-weight: 700;
        }
        .value {
          font-weight: 700;
          color: #000;
          border-bottom: 1px solid #000;
        }
      }
      .item-tag:last-child {
        width: 33.3333333%;
      }
    }

    .divider {
      width: 100%;
      height: 10px;
    }
  }

  .module-b {
    width: 10%;
    height: 75px;
    position: relative;
    margin-bottom: 20px;
    img {
      float: right;
      width: 75px;
      height: 75px;
    }
  }

  .module-c {
    width: 100%;
    .craft-table {
      width: 100%;
      border: 1px solid #000;
      border-collapse: collapse;
      caption-side: bottom;
      table-layout: fixed;
      td {
        border: 1px solid #000;
        height: 30px;
        font-size: 12px;
        font-weight: bold;
        text-align: center;
        vertical-align: center;
      }
      .header {
        td:nth-child(1) {
          width: 70px;
        }
      }
    }
    .footer {
      margin-top: 10px;
      display: flex;
      justify-content: space-between;
      span:first-child {
        width: 257px;
      }
      span:last-child {
        width: 257px;
      }
    }
  }
}
.one-pages {
  page-break-after: always;
}
.two-pages:nth-child(2n) {
  page-break-after: always;
}
</style>

