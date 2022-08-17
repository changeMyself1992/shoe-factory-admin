<template>
  <div class="record-count-dialog-box">
    <el-dialog :visible.sync="show" title="工序计件" center width="1200px">
      <el-form ref="form" :model="form">
        <!-- <el-form-item v-if="form!==null" class="base-info">
          <el-row>
            <el-col :span="8">
              <div>生产单编号：{{ form['生产单unique_id'] }} 工序名称：{{ form['工序unique_id'] }}</div>
            </el-col>
          </el-row>

          <el-row class="row2">
            <table class="craft-table">
              <tr class="header">
                <td>工艺步骤</td>
                <td>尺码/国际码</td>
                <td
                  v-for="item in form['配码计数']['配码']"
                  :key="item['尺码']"
                >{{ item["尺码"] }} / {{ item["国标码"] }}</td>
                <td>总计</td>
              </tr>

              <tr class="header">
                <td>{{ form["工序unique_id"] }}</td>
                <td>已经完成数/目标数量</td>
                <td v-for="item in form['配码计数']['配码']" :key="item['尺码']">
                  <el-input
                    v-model.number="item['完成数量']"
                    @input="limitCompletedNum(item,item['完成数量'],0,item['目标数量'])"
                  />
                  /{{ item['目标数量'] }}
                </td>
                <td>
                  <el-input v-model.number="form['配码计数']['总完成数']" disabled />
                </td>
              </tr>
            </table>
          </el-row>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="onSubmit">完成记录</el-button>
          <el-button type="primary" @click="onCancel">取消</el-button>
        </el-form-item> -->

        <!-- 员工完成表 -->
        <el-table class="table" :data="processInfo.员工计件" border>
          <el-table-column label="员工完成表">
            <el-table-column prop="unique_id" label="员工编号" align="center" width="120" />
            <el-table-column prop="员工姓名" label="员工姓名" align="center" width="120" />
            <el-table-column prop="配码计数.总完成数" label="实际完成数量" align="center" width="120" />
            <el-table-column
              align="center"
              label="组长确认"
              :width="200"
            >
              <template slot-scope="scope">
                <el-button v-if="scope.row.记录确认" disabled type="primary" size="mini">{{ scope.row.确认管理者姓名 }}已确认</el-button>
                <el-button v-else type="primary" size="mini" @click="onGroupLeaderConfirmBtnClick(scope.row)">确认</el-button>
              </template>
            </el-table-column>
          </el-table-column>
        </el-table>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import {
  generate_manager_record_count_input,
  manager_record_count,
  manager_confirm_staff_record
} from '@/api/scheduleManagement'
import { get_production_note_by_id } from '@/api/ordersForProductionScheduling'
export default {
  // eslint-disable-next-line vue/require-prop-types
  props: ['dialogVisible', 'onClose', 'productionNoteNumber', 'processName'],
  data() {
    return {
      form: null,
      show: false,
      processInfo: {} // 改生产单中该工序的详情
    }
  },
  computed: {},
  watch: {
    dialogVisible: function(newVal, oldVal) {
      this.show = newVal
      // 如果是刚打开对话框，获取相应的数据
      if (
        newVal &&
        !oldVal &&
        this.productionNoteNumber.length > 0 &&
        this.processName.length
      ) {
        this.getLatestAccountData()
        this.getProductionNoteById()
      }
    },
    show(newVal, oldVal) {
      if (!newVal) {
        this.onClose(this.show)
      }
    }
  },
  methods: {
    // 获取最近的数据
    async getLatestAccountData() {
      var post_data = {
        login_token: this.$store.getters.token,
        生产单unique_id: this.productionNoteNumber,
        工序unique_id: this.processName
      }
      const response = await generate_manager_record_count_input(post_data)
      this.form = response.data
    },
    // 获取生产单详情
    async getProductionNoteById() {
      var post_data = {
        login_token: this.$store.getters.token,
        unique_id: this.productionNoteNumber,
        返回确认管理者姓名: true
      }
      const res = await get_production_note_by_id(post_data)
      const 生产单工序信息 = res.data.生产单工序信息
      this.processInfo = 生产单工序信息.find(item => {
        return item.工序信息.工序名称 === this.processName
      })
    },

    // 组长确认按钮点击
    async onGroupLeaderConfirmBtnClick(row) {
      var parameter = {
        login_token: this.$store.getters.token,
        '生产单unique_id': this.productionNoteNumber,
        '工序unique_id': this.processInfo['工序信息'].unique_id,
        '员工unique_id': row.unique_id
      }
      // 发起管理人员确认员工计件 请求
      const res = await manager_confirm_staff_record(parameter)
      this.$message({
        type: 'success',
        message: res.msg
      })
      // 把员工计件数组中该员工的 记录确认改为true
      var 员工计件 = this.processInfo['员工计件']
      var index = 员工计件.findIndex(element => {
        return element.unique_id === row.unique_id
      })
      if (index === -1) return
      员工计件[index]['记录确认'] = true
      员工计件[index]['确认管理者姓名'] = this.$store.getters.个人信息['姓名']
      this.processInfo['员工计件'] = 员工计件
    },
    onSubmit() {
      var post_data = this.form
      post_data['login_token'] = this.$store.getters.token
      manager_record_count(post_data)
        // this.$api.post('process/add_process',post_data)
        .then(response => {
          console.log(response.msg)
          this.onCancel()
        })
    },
    onCancel() {
      this.show = false
    },

    // 限制已完成数
    limitCompletedNum(obj, cur, min, max) {
      if (!cur) return
      else if (cur < min) cur = min
      else if (cur > max) cur = max
      obj.完成数量 = cur
      // 计算总数
      var count = 0
      var array = this.form['配码计数']['配码']
      for (let i = 0; i < array.length; i++) {
        const element = array[i]
        count += element['完成数量']
      }
      this.form['配码计数']['总完成数'] = count
      this.$forceUpdate()
    }
  }
}
</script>

<style lang="scss" scoped>
.record-count-dialog-box {
  position: relative;
  box-sizing: border-box;
  .base-info {
    .row-1 {
      margin-bottom: 10px;
      .el-col {
        padding-right: 10px;
      }
      :last-child {
        padding-right: 0px;
      }
    }
    .row-2 {
      margin-bottom: 10px;
      .mobile-num {
        padding-right: 40px;
      }
    }
  }
  .bank-card-info {
    .row-1 {
      .row-1-1 {
        margin-bottom: 10px;
        .card-user-name {
          padding-right: 20px;
        }
      }
    }
  }

  .el-form-item {
    margin-bottom: 10px;
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

<style >
.record-count-dialog-box .el-input {
  width: 50%;
}
.record-count-dialog-box .el-input__inner {
  padding: 0;
}
</style>
