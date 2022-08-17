<template>
  <!-- 排产表组件 -->
  <div class="production-scheduling-table">
    <div class="title">{{ title }}</div>
    <table v-if="sizeArrangeList_add.length>0 && openMode==='add'" class="craft-table">
      <tr class="header">
        <td>工艺步骤</td>
        <td>工序工资</td>
        <td>尺码/国际码</td>
        <td
          v-for="(item,index) in sizeArrangeList_add[0]['配码']"
          :key="index"
        >{{ item["尺码"] }} / {{ item["国标码"] }}</td>
        <td>总计</td>
      </tr>

      <tr v-for="(process_name,index) in craftCheckList" :key="index" class="header">
        <td>{{ process_name }}</td>
        <td>
          <el-input
            v-model="salary[process_name]"
            type="number"
            @blur="processWageRestraint_add(process_name)"
            @focus="($event)=>{$event.currentTarget.select()}"
          />
        </td>
        <td>此次排产数/剩余未排产数量</td>
        <td v-for="(item ,idx) in sizeArrangeList_add[0]['配码']" :key="idx">
          <el-input
            v-model.number="sizeArrangeList_add[0]['配码'][idx]['此次排产']"
            :disabled="autoGenerateMode!=='manual'"
            @input="limitThisOutput(sizeArrangeList_add[0]['配码'][idx],sizeArrangeList_add[0]['配码'][idx]['此次排产'],0,item['目标数量']-item['已排产数量'],index)"
            @focus="($event)=>{$event.currentTarget.select()}"
          />
          /{{ item["目标数量"]-item["已排产数量"] }}
        </td>
        <td>
          <el-input v-model.number="sizeArrangeList_add[0]['此次总排产数']" disabled />
          /{{ sizeArrangeList_add[0]['剩余未排产数'] }}
        </td>
      </tr>
    </table>

    <table v-if="productionNoteProcessData_clone.length>0 && openMode!=='add'" class="craft-table">
      <tr class="header">
        <td>工艺步骤</td>
        <td>工序工资</td>
        <td>尺码/国际码</td>
        <td
          v-for="(item,index) in productionNoteProcessData_clone[0]['配码完成总计数']['配码']"
          :key="index"
        >{{ item["尺码"] }} / {{ item["国标码"] }}</td>
        <td>总计</td>
      </tr>

      <tr
        v-for="(processItem, process_index) in productionNoteProcessData_clone"
        :key="process_index"
        class="header"
      >
        <td>{{ processItem['工序信息']['工序名称'] }}</td>
        <td>
          <el-input
            v-model.number="processItem['工序工资']"
            type="number"
            :disabled="openMode==='detail'"
            @blur="processWageRestraint_other(process_index)"
          />
        </td>
        <td>已经完成数/目标数量</td>
        <td
          v-for="(item,index) in productionNoteProcessData_clone[process_index]['配码完成总计数']['配码']"
          :key="index"
        >
          <el-input
            v-model.number="item['完成数量']"
            :disabled="openMode==='detail'||openMode==='edit'"
            @input="limitTheNumOfCompletions(item,item['完成数量'],0,item['目标数量'],process_index)"
          />
          /{{ item['目标数量'] }}
        </td>

        <td>
          <el-input
            v-model.number="productionNoteProcessData_clone[process_index]['配码完成总计数']['总完成数']"
            disabled
          />
        </td>
      </tr>
    </table>
  </div>
</template>

<script>
// import { match_recent_production_note_process_info_by_product_info } from '@/api/scheduleManagement'
import { isEmpty, deepClone, sumArray } from '@/utils'
export default {
  props: {
    // 组件打开方式
    openMode: {
      type: String,
      default: ''
    },
    // 选中的产品
    selectedProductAndArrange: {
      type: Object,
      default: function() {
        return {}
      }
    },
    // 选中的产品的以前工序记录用于预填
    processRecord: {
      type: Array,
      default: function() {
        return []
      }
    },
    // 选中的工艺
    craftCheckList: {
      type: Array,
      required: true,
      default: function() {
        return []
      }
    },
    // 生产单子工序信息 （detail，edit 模式 会传过来）
    productionNoteProcessData: {
      type: Array,
      default: function() {
        return []
      }
    },
    // 排产的次数
    productionSchedulingBatch: {
      type: Number,
      default: 1
    },
    // 自动排产的模式
    autoGenerateMode: {
      type: String,
      default: ''
    },
    integerInterval: {
      type: Number,
      default: 1
    }
  },
  data() {
    return {
      /** **********************添加模式用到的变量*****************start******************* */
      sizeArrangeList_add: [
        // {
        //   配码: [
        //     {
        //       国标码: 220,
        //       尺码: 34,
        //       已排产数量: 0,
        //       此次排产: 10,
        //       目标数量: 10
        //     }
        //   ],
        //   此次总排产数: 0,
        //   剩余未排产数: 0
        // }
      ],
      salary: {}, // 不同工序的工序工资
      /** **********************添加模式用到的变量*****************end******************* */

      /** **********************其他模式用到的变量*****************start******************* */
      productionNoteProcessData_clone: []
      /** **********************其他模式用到的变量*****************end******************* */

      /** **********************通用的变量*****************start******************* */
      /** **********************通用的变量*****************start******************* */
    }
  },
  computed: {
    title: function() {
      if (this.autoGenerateMode === 'manual') {
        return ''
      } else if (this.autoGenerateMode === 'average') {
        return '该表格所显示的是首张生产单，仅供参考'
      } else if (this.autoGenerateMode === 'averageInteger') {
        return '该表格所显示的是首张生产单，仅供参考'
      } else if (this.autoGenerateMode === 'single') {
        return '该表格所显示的是首张生产单，仅供参考'
      }
      return ''
    }
  },
  watch: {
    // 监听批次的变化
    productionSchedulingBatch: function(newVal, oldVal) {
      if (this.openMode === 'add' && !isEmpty(this.selectedProductAndArrange)) {
        this.addTheInitializationOfThePattern()
      }
    },
    // 监听选中产品的变化
    selectedProductAndArrange: function(newVal, oldVal) {
      if (this.openMode === 'add' && !isEmpty(this.selectedProductAndArrange)) {
        this.addTheInitializationOfThePattern()
      }
    },
    // 监听排产模式的变化
    autoGenerateMode: function(newVal, oldVal) {
      if (this.openMode === 'add' && !isEmpty(this.selectedProductAndArrange)) {
        this.addTheInitializationOfThePattern()
      }
    },
    productionNoteProcessData: function(newVal, oldVal) {
      if (
        (this.openMode === 'detail' || this.openMode === 'edit') &&
        !isEmpty(newVal)
      ) {
        this.productionNoteProcessData_clone = deepClone(newVal)
      }
    },
    craftCheckList: function(newVal, oldVal) {
      if (this.openMode === 'add' && !isEmpty(newVal)) {
        this.initialChemicalProcessSalary()
      }
    }
  },
  created() {},
  mounted() {},
  methods: {

    // 添加模式的初始化
    async addTheInitializationOfThePattern() {
      // 分不同模式进行自动排产分单处理
      // 平均分尺码 和 手动排产
      if (this.autoGenerateMode === 'average' || this.autoGenerateMode === 'manual' || this.autoGenerateMode === 'averageInteger') {
        // 1. 尺码计算
        var temp = {}
        var selectedProductAndArrange = deepClone(
          this.selectedProductAndArrange
        )
        console.log(selectedProductAndArrange)

        var batch = this.productionSchedulingBatch // 要平均分为几张订单
        var total_size = selectedProductAndArrange['配码数量']['配码'].length // 一共有多少个码数
        var left = [] // 码数剩余计数，剩余排产数
        for (var i = 0; i < total_size; i++) {
          left.push(selectedProductAndArrange['配码数量']['配码'][i]['目标数量'] - selectedProductAndArrange['配码数量']['配码'][i]['已排产数量'])
        }
        console.log(left)
        var notes = []
        var total_count = selectedProductAndArrange['配码数量']['总数'] - selectedProductAndArrange['配码数量']['已经排产数量']
        if (this.autoGenerateMode === 'average' || this.autoGenerateMode === 'manual') {
          var average_batch = Math.floor(total_count / batch)
        } else {
          // 如果是尽量平均整数配码的时候可以通过前端传入一个参数来改变integer_interval这个值
          var integer_interval = this.integerInterval
          average_batch = Math.floor(Math.floor(total_count / batch) / integer_interval) * integer_interval
        }
        for (var a = 0; a < batch - 1; a++) {
          var note = []
          for (var b = 0; b < total_size; b++) {
            note.push(0)
          }
          var count = 0
          var index = 0

          while (count < average_batch) {
            if (left[index] > 0) {
              note[index] += 1
              left[index] -= 1
              count += 1
            }
            index += 1

            if (index >= total_size) {
              index -= total_size
            }
          }

          notes.push(note)
        }
        // 处理最后一个生产单
        notes.push(left)
        console.log(notes)

        // 转化为前端根据码数的格式
        for (var m = 0; m < total_size; m++) {
          var ele = selectedProductAndArrange['配码数量']['配码'][m]
          temp[ele['尺码']] = []
          for (var n = 0; n < batch; n++) {
            temp[ele['尺码']][n] = notes[n][m]
          }
        }
        console.log(1111)
        console.log(temp)

        this.sizeArrangeList_add = []
        for (let b = 0; b < this.productionSchedulingBatch; b++) {
          var sizeArrangeItem = {
            配码: [],
            此次总排产数: 0,
            剩余未排产数:
              selectedProductAndArrange['配码数量']['总数'] -
              selectedProductAndArrange['配码数量']['已经排产数量']
          }
          for (
            let c = 0;
            c < selectedProductAndArrange['配码数量']['配码'].length;
            c++
          ) {
            var element_b = selectedProductAndArrange['配码数量']['配码'][c]
            var 配码元素 = deepClone(element_b)
            配码元素['此次排产'] = temp[String(element_b['尺码'])][b]
            sizeArrangeItem.配码.push(配码元素)
            sizeArrangeItem.此次总排产数 =
              sizeArrangeItem.此次总排产数 + 配码元素['此次排产']
          }
          // this.sizeArrangeList_add.push(sizeArrangeItem)
          if (sizeArrangeItem['此次总排产数'] !== 0) {
            this.sizeArrangeList_add.push(sizeArrangeItem)
          }
        }
        console.log(2222)
        console.log(this.sizeArrangeList_add)
      } else {
        // 单一码数配码
        // 1. 尺码计算
        temp = {}
        selectedProductAndArrange = deepClone(
          this.selectedProductAndArrange
        )
        batch = this.productionSchedulingBatch // 要平均分为几张订单
        total_size = selectedProductAndArrange['配码数量']['配码'].length // 一共有多少个码数
        left = [] // 码数剩余计数，剩余排产数
        for (let i = 0; i < total_size; i++) {
          left.push(selectedProductAndArrange['配码数量']['配码'][i]['目标数量'] - selectedProductAndArrange['配码数量']['配码'][i]['已排产数量'])
        }
        // console.log(left)
        notes = []
        total_count = selectedProductAndArrange['配码数量']['总数'] - selectedProductAndArrange['配码数量']['已经排产数量']

        average_batch = Math.floor(total_count / batch)
        var min_batch = Math.max(1, Math.floor(average_batch * 0.7))
        console.log(average_batch)
        console.log(min_batch)

        index = 0
        var new_note_flag = false
        note = []
        for (let a = 0; a < total_size; a++) {
          note.push(0)
        }

        // eslint-disable-next-line no-constant-condition
        while (true) {
          if (left[index] >= average_batch) {
            note[index] += average_batch
            left[index] -= average_batch
            notes.push(note)
            note = []
            for (let a = 0; a < total_size; a++) {
              note.push(0)
            }
            new_note_flag = true
          } else if (left[index] >= min_batch) {
            note[index] += min_batch
            left[index] -= min_batch
            notes.push(note)
            note = []
            for (let a = 0; a < total_size; a++) {
              note.push(0)
            }
            new_note_flag = true
          }
          // 准备进入下一个循环
          index += 1
          if (index >= total_size) {
            index -= total_size
            if (new_note_flag !== true) { // 没有大于阈值的尺码了
              break
            } else { // 否则进入下一轮
              new_note_flag = false
            }
          }
        }

        // 第二轮组合剩余的零散尺码
        while (sumArray(left) > 0) {
          note = []
          for (let a = 0; a < total_size; a++) {
            note.push(0)
          }
          index = 0
          var operation_flag = false
          // eslint-disable-next-line no-constant-condition
          while (true) {
            if (left[index] > 0) {
              note[index] += left[index]
              left[index] = 0
              operation_flag = true
            }

            if (sumArray(note) >= min_batch) {
              notes.push(note)
              note = []
              for (let a = 0; a < total_size; a++) {
                note.push(0)
              }
            }

            // 准备进入下一个循环
            index += 1
            if (index >= total_size) {
              index -= total_size
              if (operation_flag !== true) { // 没有大于阈值的尺码了
                break
              } else { // 否则进入下一轮
                operation_flag = false
              }
            }
          }
        }

        // 处理最后一个剩余
        if (sumArray(note) > 0) {
          notes.push(note)
          note = []
          for (let a = 0; a < total_size; a++) {
            note.push(0)
          }
        }
        // 打印结果
        console.log(notes)
        // 转化为前端根据码数的格式
        for (let m = 0; m < total_size; m++) {
          ele = selectedProductAndArrange['配码数量']['配码'][m]
          temp[ele['尺码']] = []
          for (let n = 0; n < batch; n++) {
            temp[ele['尺码']][n] = notes[n][m]
          }
        }
        console.log(1111)
        console.log(temp)

        this.sizeArrangeList_add = []
        for (let b = 0; b < this.productionSchedulingBatch; b++) {
          const sizeArrangeItem = {
            配码: [],
            此次总排产数: 0,
            剩余未排产数:
            selectedProductAndArrange['配码数量']['总数'] -
            selectedProductAndArrange['配码数量']['已经排产数量']
          }
          for (
            let c = 0;
            c < selectedProductAndArrange['配码数量']['配码'].length;
            c++
          ) {
            const element_b = selectedProductAndArrange['配码数量']['配码'][c]
            const 配码元素 = deepClone(element_b)
            配码元素['此次排产'] = temp[String(element_b['尺码'])][b]
            sizeArrangeItem.配码.push(配码元素)
            sizeArrangeItem.此次总排产数 =
            sizeArrangeItem.此次总排产数 + 配码元素['此次排产']
          }
          // this.sizeArrangeList_add.push(sizeArrangeItem)
          if (sizeArrangeItem['此次总排产数'] !== 0) {
            this.sizeArrangeList_add.push(sizeArrangeItem)
          }
        }
        console.log(2222)
        console.log(this.sizeArrangeList_add)
      }
    },

    // 初始化工序工资
    initialChemicalProcessSalary() {
      this.salary = {}
      for (var i = 0; i < this.craftCheckList.length; i++) {
        const process = this.craftCheckList[i]
        const 生产单工序信息 = this.processRecord
        // 如果工序记录不为空
        if (!isEmpty(生产单工序信息)) {
          var index = 生产单工序信息.findIndex(item => {
            return item.工序信息.工序名称 === process
          })
          // 如果工序记录中有该工序
          if (index !== -1) {
            this.$set(
              this.salary,
              process,
              生产单工序信息[index]['工序工资']
            )
          } else {
            this.$set(this.salary, process, 0.0)
          }
        } else {
          this.$set(this.salary, process, 0.0)
        }
      }
    },

    // 限制工序工资_添加模式
    processWageRestraint_add(process_name) {
      if (!this.salary[process_name] || this.salary[process_name] < 0) {
        this.salary[process_name] = 0
      }
      this.salary[process_name] = Number(parseFloat(this.salary[process_name]).toFixed(2))
    },
    // 限制工序工资_其他模式
    processWageRestraint_other(process_index) {
      if (
        !this.productionNoteProcessData_clone[process_index]['工序工资'] ||
        this.productionNoteProcessData_clone[process_index]['工序工资'] < 0
      ) {
        this.productionNoteProcessData_clone[process_index]['工序工资'] = 0
      }
      this.productionNoteProcessData_clone[process_index]['工序工资'] = Number(parseFloat(this.productionNoteProcessData_clone[process_index]['工序工资']).toFixed(2))
    },

    // 限制此次排产数字
    limitThisOutput(obj, cur, min, max, process_index) {
      if (!cur) cur = 0
      else if (cur < min) cur = min
      else if (cur > max) cur = max
      obj.此次排产 = cur
      this.$forceUpdate()
      this.totalArrangeCountFromSizeArrangeList()
    },
    // 实时计算totalArrangeCount
    totalArrangeCountFromSizeArrangeList() {
      var 配码 = this.sizeArrangeList_add[0]['配码']
      var count = 0
      配码.forEach(element => {
        count += element.此次排产
      })
      this.sizeArrangeList_add[0]['此次总排产数'] = count
    },

    // 限制已经完成数字
    limitTheNumOfCompletions(obj, cur, min, max, process_index) {
      if (!cur) cur = 0
      else if (cur < min) cur = min
      else if (cur > max) cur = max
      obj.完成数量 = cur
      this.$forceUpdate()
      this.totalProcess(process_index)
    },
    // 实时计算当前工序的总完成数
    totalProcess(process_index) {
      var array = this.productionNoteProcessData_clone[process_index][
        '配码完成总计数'
      ]['配码']
      var count = 0
      for (let i = 0; i < array.length; i++) {
        const element = array[i]
        count += element['完成数量']
      }
      this.productionNoteProcessData_clone[process_index]['配码完成总计数'][
        '总完成数'
      ] = count
    }
  }
}
</script>

<style lang="scss" scoped>
.production-scheduling-table {
  .title{
    text-align: center;
    padding: 10px;
    color: red;
  }
  .craft-table {
    width: 100%;
    border: 1px solid #000;
    border-collapse: collapse;
    caption-side: bottom;
    table-layout: fixed;
    td {
      border: 1px solid #000;
      font-size: 12px;
      font-weight: bold;
      text-align: center;
      vertical-align: center;
    }
    .header {
      td:nth-child(1) {
        width: 70px;
      }
      td:nth-child(2) {
        width: 100px;
      }
      //尺码表格
      .size-table {
        width: 100%;
        border: none;
        tr {
          td {
            border: none;
            width: 88px;
          }
        }
      }
    }
    .k_l td:nth-child(3),
    .c_p td:nth-child(3),
    .c_m td:nth-child(3),
    .b_z td:nth-child(3) {
      font-size: 10px;
    }
  }
}
</style>

<style>
.production-scheduling-table .el-input__inner {
  height: 30px;
  line-height: 30px;
  padding: 0 0 0 5px;
  width: 70px;
}
</style>

