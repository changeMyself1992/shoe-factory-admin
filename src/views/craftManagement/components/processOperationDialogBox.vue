<template>
  <div class="add-process-dialog-box">
    <el-dialog :visible.sync="show" :title="title" center width="720px">
      <el-form ref="form" class="info-box" :model="form" :rules="formRules">
        <!-- 基本信息 -->
        <el-form-item class="item-1" prop="工序名称" label="工序名称:" label-width="85px">
          <el-input v-model.trim="form.工序名称" :disabled="mode==='add'?false:true" placeholder="工序名称" />
        </el-form-item>

        <el-form-item class="item-2" prop="描述" label="工序描述:" label-width="85px">
          <el-input
            v-model="form.描述"
            type="textarea"
            :rows="3"
            placeholder="暂无描述"
          />
        </el-form-item>

        <el-form-item class="item-3" prop="备注" label="工序备注:" label-width="85px">
          <el-input
            v-model="form.备注"
            type="textarea"
            :rows="3"
            placeholder="暂无备注"
          />
        </el-form-item>

        <el-form-item>
          <el-button v-if="mode==='add'" type="primary" @click="addProcess('form')">添加工序</el-button>
          <el-button v-else type="primary" @click="editProcess('form')">编辑工序</el-button>
          <el-button type="primary" @click="onReset('form')">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import {
  add_process,
  edit_process_by_id
} from '@/api/maintenanceOfProcessPartsOfProductLibrary'
import {
  验证工序名称
  // 验证产品备注
} from '@/utils/validate'
import { isEmpty } from '@/utils'

export default {
  props: {
    dialogVisible: Boolean,
    onClose: {
      required: true,
      validator: function(value) {
        return true
      }
    },
    mode: {
      type: String,
      default: 'add'
    },
    processData: {
      type: Object,
      default: function() {
        return {
          工序名称: null,
          描述: '',
          备注: ''
        }
      }
    }
  },
  data() {
    return {
      form: {
        工序名称: null,
        描述: '',
        备注: ''
      },
      formRules: {
        工序名称: [
          { required: true, trigger: 'blur', validator: 验证工序名称 }
        ]
      },
      show: false,
      // 告诉父组件是否需要刷新数据
      refresh_flag: false
    }
  },
  computed: {
    title() {
      return this.mode === 'add' ? '添加工序' : '编辑工序'
    }
  },
  watch: {
    dialogVisible: function(newVal, oldVal) {
      this.show = newVal
      this.refresh_flag = false
    },
    show(newVal, oldVal) {
      if (!newVal) {
        this.onClose(this.show, this.refresh_flag)
      }
    },
    processData: function(newVal, oldVal) {
      if (!isEmpty(newVal)) {
        this.form['工序名称'] = newVal['name']
        this.form['描述'] = newVal['description']
        this.form['备注'] = newVal['comment']
      } else {
        this.form = {
          工序名称: null,
          描述: '',
          备注: ''
        }
      }
    }
  },
  methods: {
    addProcess(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          var post_data = {
            login_token: this.$store.getters.token,
            data: {
              工序名称: this.form.工序名称.trim(),
              描述: this.form.描述,
              备注: this.form.备注
            }
          }
          add_process(post_data).then(response => {
            this.$message({ type: 'success', message: '添加工序成功' })
            this.refresh_flag = true
            this.onReset('form')
          })
        } else {
          this.$message({
            type: 'warning',
            message: '请完善表单信息'
          })
          return false
        }
      })
    },
    editProcess(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          var post_data = {
            unique_id: this.form.工序名称,
            login_token: this.$store.getters.token,
            update_data: {
              工序名称: this.form.工序名称,
              描述: this.form.描述,
              备注: this.form.备注
            }
          }
          edit_process_by_id(post_data).then(response => {
            this.$message({ type: 'success', message: '编辑工序成功' })
            this.refresh_flag = true
            this.onReset('form')
          })
        } else {
          this.$message({
            type: 'warning',
            message: '请完善表单信息'
          })
          return false
        }
      })
    },
    onReset(formName) {
      this.$refs[formName].resetFields()
      this.show = false
    }
  }
}
</script>

<style lang="scss" scoped>
.add-process-dialog-box {
  position: relative;
  box-sizing: border-box;
}
</style>
