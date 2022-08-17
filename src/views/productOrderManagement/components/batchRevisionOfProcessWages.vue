<template>
  <div>
    <el-dialog :visible.sync="show" center width="1000px" title="批量修正工序工资" :show-close="false">
      <div class="batch-revision-of-process-wages">
        <el-form
          v-if="form.工序工资清单.length>0"
          ref="processSalaryForm"
          :model="form"
          label-position="left"
        >
          <div v-for="(item,index) in form.工序工资清单" :key="index">
            <el-form-item
              class="col-1"
              :prop="item.工序名称"
              :label="'修改'+item['工序名称']+'工序工资'"
              label-width="130px"
            >
              <el-input v-model="item.工序工资" type="number" placeholder="修改工资" @blur="customerProductNumberInput(item)" />
            </el-form-item>
          </div>

          <el-form-item>
            <el-button type="primary" :loading="btnLoading" @click="onSubmit">提交修改</el-button>
            <el-button @click="onCancel">取消</el-button>
          </el-form-item>
        </el-form>
        <el-progress v-if="form.unique_ids.length>1" :text-inside="true" :stroke-width="26" :percentage="percentageOfProgressSubmitted" />

      </div>
    </el-dialog>
  </div>
</template>

<script>
import { deepClone } from '@/utils'
import { batch_edit_production_note_process_salary_by_ids } from '@/api/ordersForProductionScheduling'
export default {
  props: {
    curOperationDetailInfo: {
      type: Array,
      required: true
    },
    dialogVisible: Boolean,
    uniqueIds: {
      type: Array,
      required: true
    },
    onClose: {
      required: true,
      validator: function(value) {
        return true
      }
    }
  },
  data() {
    return {
      form: {
        login_token: '',
        prepare_flag: false,
        unique_ids: [],
        工序工资清单: []
      },
      show: false,
      // 是否启用按钮loading状态防止多次点击
      btnLoading: false,
      // 提交进度百分比
      percentageOfProgressSubmitted: 0
    }
  },
  computed: {},
  watch: {
    dialogVisible: function(newVal, oldVal) {
      this.show = newVal
      if (newVal && !oldVal) {
        this.btnLoading = false
        this.percentageOfProgressSubmitted = 0
      }
    },
    show: function(newVal, oldVal) {
      if (!newVal) {
        this.onClose(this.show)
      }
    },
    curOperationDetailInfo: function(newVal, oldVal) {
      if (newVal) {
        this.form.工序工资清单 = []
        var array = deepClone(newVal)
        for (let i = 0; i < array.length; i++) {
          this.$set(this.form.工序工资清单, i, array[i])
        }
        // this.form.工序工资清单 = deepClone(newVal)
      }
    },
    uniqueIds: function(newVal, oldVal) {
      if (newVal) {
        this.form.unique_ids = deepClone(newVal)
      }
    }
  },
  methods: {
    onSubmit() {
      this.$refs.processSalaryForm.validate(async valid => {
        this.btnLoading = true
        this.form.login_token = this.$store.getters.token
        this.form.prepare_flag = false
        for (let i = 0; i < this.form.工序工资清单.length; i++) {
          const element = this.form.工序工资清单[i]
          if (!element.工序工资 || element.工序工资 <= 0) {
            this.$message({
              type: 'warning',
              message: '工资必须为数字，并且要大于等于0'
            })
            return
          }
        }
        // 如果要修改的生产单超过1个了，那么就要分批次修改了
        if (this.form.unique_ids.length > 1) {
          var start_data = new Date()
          console.log('开始时间：', start_data.getTime())
          var form = deepClone(this.form)
          // 余数
          var remainder = this.form.unique_ids.length % 1
          // 商
          var consult = Math.floor(this.form.unique_ids.length / 1)
          var respose_a = {}
          var count = 0
          for (let a = 0; a < consult; a++) {
            // 0 1 2 3 4
            // 0-10  10-20 20-30 30-40 40-50
            // a*10 - (a+1)*10
            var startIndex = a * 1
            var endIndex = (a + 1) * 1
            // 如果是最后一次循环那么要判断余数是否为0，如果为0代表能除尽endIndex不做任何处理
            // 如果余数不为零 那么endIndex就要加上余数
            if (a === consult - 1 && remainder !== 0) {
              endIndex = endIndex + remainder
            }
            // 截取 this.form.unique_ids
            form.unique_ids = this.form.unique_ids.slice(startIndex, endIndex)
            console.log(form.unique_ids)
            respose_a = await batch_edit_production_note_process_salary_by_ids(form)
            count += form.unique_ids.length
            // 更新进度条
            this.percentageOfProgressSubmitted = Number(parseFloat(count / this.form.unique_ids.length).toFixed(2)) * 100
          }
          var end_data = new Date()
          console.log('结束时间：', end_data.getTime())
          console.log('耗时：', end_data.getTime() - start_data.getTime())
          this.$message({ type: 'success', message: respose_a.msg })
          this.btnLoading = false
          this.show = false
        } else {
          const respose_b = await batch_edit_production_note_process_salary_by_ids(
            this.form
          )
          this.$message({ type: 'success', message: respose_b.msg })
          this.btnLoading = false
          this.show = false
        }
      })
    },
    onCancel() {
      this.show = false
    },
    // 客户产品编号和品牌输入框失去焦点的时候
    customerProductNumberInput(item) {
      if (!Number(item.工序工资) || Number(item.工序工资) <= 0) item.工序工资 = 1
      item.工序工资 = Number(parseFloat(item.工序工资).toFixed(2))
    }
  }
}
</script>

<style lang="scss" scoped>
.batch-revision-of-process-wages {
}
</style>

