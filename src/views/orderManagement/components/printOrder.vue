<template>
  <div>
    <el-dialog :visible.sync="show" center width="90%" :show-close="false">
      <div class="print-box">
        <el-button
          class="no-print"
          type="primary"
          size="small"
          :loading="loading"
          @click="printComponent()"
        >打印</el-button>
        <el-progress
          class="progress no-print"
          :text-inside="true"
          :stroke-width="16"
          :percentage="excelUploadSchedule"
        />
      </div>

      <div id="printProductionNote">
        <div
          v-for="(orderInfo,index) in printDetailInfoList"
          :key="index"
          class="printProductionNote"
        >
          <div class="title">{{ orderInfo['客户信息']['名称'] }}订货单</div>
          <el-table :data="returnArray(orderInfo)">
            <el-table-column label="订单信息" align="center">
              <el-table-column prop="订单编号" label="订单编号" align="center" width="120" />
              <el-table-column prop="订单日期" label="订单日期" align="center" width="120" />
              <el-table-column prop="交货日期" label="交货日期" align="center" width="120" />
              <el-table-column label="供应商" align="center" width="240">
                <template>
                  <span>{{ 对应企业名称 }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="客户信息.名称" label="客户名称" align="center" />
              <el-table-column prop="客户信息.地址" label="客户地址" align="center" />
              <el-table-column prop="客户信息.电话" label="客户电话" align="center" />
            </el-table-column>
          </el-table>
          <el-table :data="orderInfo['包含的产品']" show-summary :summary-method="getSummaries">
            <el-table-column label="产品信息" align="center">
              <el-table-column
                v-for="(tag,idx) in 产品的标签"
                :key="idx+'_0'"
                :label="tag"
                align="center"
              >
                <template slot-scope="scope">
                  <span>{{ scope.row['产品信息']['tags'][tag] }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="配码数量.件数" label="件数" align="center" width="60" />
              <el-table-column prop="配码数量.总数" label="总数" align="center" width="60" />
              <el-table-column label="单价" align="center" width="60">
                <template>
                  <span>173.5</span>
                </template>
              </el-table-column>
              <el-table-column
                v-for="(obj,idx) in 配码数组"
                :key="idx+'_1'"
                :label="obj['size']"
                align="center"
                width="55"
              >
                <template slot-scope="scope">
                  <span>{{ scope.row['配码数量']['配码'][idx]['目标数量'] }}</span>
                </template>
              </el-table-column>
            </el-table-column>
          </el-table>
          <!-- <div class="total-row">
            <div class="col-0">
              <span>合计</span>
            </div>
            <div class="col-1">
              <span>6</span>
            </div>
            <div class="col-2">
              <span>30</span>
            </div>
            <div class="col-3" />
            <div class="col-4" :style="`min-width: ${配码数组.length*55}px;`">
              <span>30</span>
            </div>
          </div> -->
          <el-row class="note-row">
            <el-col :span="4">
              <div class="note">
                <span>备</span>
                <span>注</span>
              </div>
            </el-col>
            <el-col :span="20">
              <div class="note-des">{{ orderInfo.订单备注 }}</div>
            </el-col>
          </el-row>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import $ from 'jquery'
export default {
  props: {
    printDetailInfoList: {
      type: Array,
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
      配码数组: [],
      show: false,
      loading: false,
      excelUploadSchedule: 0
    }
  },
  computed: {
    ...mapGetters(['对应企业名称', '产品的标签'])
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
        this.onClose()
        this.loading = false
        this.excelUploadSchedule = 0
      }
    }
  },
  methods: {
    init() {
      if (this.printDetailInfoList.length > 0) {
        var 配码 = this.printDetailInfoList[0]['包含的产品'][0]['配码数量'][
          '配码'
        ]
        this.配码数组 = 配码.map(item => {
          return {
            gjm: String(item['国标码']),
            size: String(item['尺码'])
          }
        })
      }
    },
    returnArray(obj) {
      return [obj]
    },

    getSummaries(param) {
      const { columns, data } = param
      if (columns.length === 0) return
      const sums = []
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = '合计'
          return
        } else if (index === this.$store.getters['产品的标签'].length) {
          // 合计件数
          sums[index] = data.length
        } else if (index === this.$store.getters['产品的标签'].length + 1) {
          // 合计总数
          var count = 0
          for (let i = 0; i < data.length; i++) {
            const element = data[i]
            count += element['配码数量']['总数']
          }
          sums[index] = count
        } else if (index > this.$store.getters['产品的标签'].length + 2) {
          // 合计每个码数
          count = 0
          for (let i = 0; i < data.length; i++) {
            const element = data[i]
            var 配码 = element['配码数量']['配码']
            // 9  0
            // 10 1
            // 11 2
            // 12 3
            // 13 4
            // 14 5
            // 15 6
            // 16 7
            // 17 8
            // 18 9
            // 19 10
            // 20 11
            // 21 12
            // 22 13
            var 目标数量 = 配码[index - (this.$store.getters['产品的标签'].length + 3)]['目标数量']
            count += 目标数量
          }
          sums[index] = count
        } else {
          sums[index] = ''
        }
      })

      return sums
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
    }
  }
}
</script>

<style lang="scss" scoped>
.print-box {
  display: flex;
  align-items: center;
  .progress {
    margin-left: 10px;
    width: 150px;
  }
}
.printProductionNote {
  .title {
    width: 100%;
    font-size: 22px;
    text-align: center;
    margin-bottom: 20px;
    color: #000;
    font-weight: 700;
  }
  .total-row {
    height: 34px;
    border: 1px solid #ebeef5;
    border-top: none;
    display: flex;
    justify-content: space-between;
    .col-0 {
      width: 100%;
      font-weight: 700;
      line-height: 34px;
      text-align: center;
    }
    .col-1 {
      min-width: 60px;
      border-left: 1px solid #ebeef5;
      font-weight: 700;
      line-height: 34px;
      text-align: center;
    }
    .col-2 {
      min-width: 60px;
      border-left: 1px solid #ebeef5;
      font-weight: 700;
      line-height: 34px;
      text-align: center;
    }
    .col-3 {
      min-width: 60px;
      border-left: 1px solid #ebeef5;
    }
    .col-4 {
      border-left: 1px solid #ebeef5;
      font-weight: 700;
      line-height: 34px;
      text-align: center;
    }
  }

  .note-row {
    border: 1px solid #ebeef5;
    border-top: none;
  }
  .note {
    height: 80px;
    border-right: 1px solid #ebeef5;
    display: flex;
    justify-content: space-between;
    font-size: 22px;
    font-weight: 700;
    align-items: center;
    padding: 0 20px;
  }
  .note-des {
    font-size: 22px;
    font-weight: 700;
    padding: 10px;
  }
}
</style>

