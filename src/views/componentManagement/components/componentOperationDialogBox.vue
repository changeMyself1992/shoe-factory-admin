<template>
  <div class="add-component-dialog-box">
    <el-dialog :visible.sync="show" :title="title" center width="720px">
      <el-form ref="form" :model="form" class="base-info" :rules="formRules" label-width="85px">
        <!-- 基本信息 -->
        <el-form-item class="item-1" prop="部位名称" label="部位名称:">
          <el-input v-model.trim="form.部位名称" :disabled="mode==='add'?false:true" class="name-a" placeholder="部位名称" />
        </el-form-item>

        <el-form-item class="item-2" prop="描述" label="部位描述:">
          <el-input v-model.trim="form.描述" placeholder="部位描述" />
        </el-form-item>

        <el-form-item class="item-3" prop="备注" label="部位名称:">
          <el-input v-model="form.备注" type="textarea" :rows="3" placeholder="部位备注" />
        </el-form-item>

        <el-form-item class="item-4">
          <el-button v-if="mode==='add'" type="primary" @click="addComponent">添加部位</el-button>
          <el-button v-else type="primary" @click="editComponent">编辑部位</el-button>
          <el-button type="primary" @click="onCancel">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import {
  add_component,
  edit_component_by_id
} from '@/api/maintenanceOfProcessPartsOfProductLibrary'
import {
  验证部位名称
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
    componentData: {
      type: Object,
      default: function() {
        return {
          部位名称: '',
          描述: '',
          备注: ''
        }
      }
    }
  },
  data() {
    return {
      form: {
        部位名称: '',
        描述: '',
        备注: ''
      },
      formRules: {
        部位名称: [
          { required: true, trigger: 'blur', validator: 验证部位名称 }
        ]
      },
      show: false
    }
  },
  computed: {
    title() {
      return this.mode === 'add' ? '添加部位' : '编辑部位'
    }
  },
  watch: {
    dialogVisible: function(newVal, oldVal) {
      this.show = newVal
    },
    show(newVal, oldVal) {
      if (!newVal) {
        this.onClose(this.show)
        this.onCancel()
      }
    },
    componentData: function(newVal, oldVal) {
      if (!isEmpty(newVal)) {
        this.form['部位名称'] = newVal['name']
        this.form['描述'] = newVal['description']
        this.form['备注'] = newVal['comment']
      } else {
        this.form = {
          部位名称: '',
          描述: '',
          备注: ''
        }
      }
    }
  },
  methods: {
    addComponent() {
      this.$refs.form.validate(valid => {
        if (valid) {
          var post_data = {
            login_token: this.$store.getters.token,
            data: {
              部位名称: this.form.部位名称,
              描述: this.form.描述,
              备注: this.form.备注
            }
          }
          add_component(post_data)
            .then(response => {
              this.$message({ type: 'success', message: '添加部位成功' })
              this.onCancel()
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
    editComponent() {
      this.$refs.form.validate(valid => {
        if (valid) {
          var post_data = {
            unique_id: this.form.部位名称,
            login_token: this.$store.getters.token,
            update_data: {
              部位名称: this.form.部位名称,
              描述: this.form.描述,
              备注: this.form.备注
            }
          }
          edit_component_by_id(post_data)
            .then(response => {
              this.$message({ type: 'success', message: '编辑部位成功' })
              this.onCancel()
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
    onCancel() {
      this.$refs.form.resetFields()
      this.show = false
    }
  }
}
</script>

<style lang="scss" scoped>
.add-component-dialog-box {
  position: relative;
  box-sizing: border-box;
  .base-info {
    .item-4 {
      display: flex;
      justify-content: space-between;
    }
  }
}
</style>
