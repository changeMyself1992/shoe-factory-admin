<template>
  <div class="edit-material-dialog-box">
    <el-dialog :visible.sync="show" :title="calculateTitle" center width="70%">
      <el-form ref="clientForm" :model="form" :rules="formRules">
        <!-- 标签信息 -->
        <div class="base-info">
          <div class="header">
            <b>客户标签信息</b>
          </div>

          <div class="box-a">
            <el-form-item
              v-for="(value,tag_name) in form.tags"
              :key="tag_name"
              class="item-1"
              :label="tag_name"
              label-width="85px"
            >
              <el-autocomplete
                v-model.trim="form.tags[tag_name]"
                class="inline-input"
                :fetch-suggestions="((queryString, callback)=>tagQueryAutoCompleteSearch(queryString,callback,tag_name))"
                placeholder="自动补全"
              />
            </el-form-item>
          </div>
        </div>

        <!-- 基本信息 -->
        <div class="base-info">
          <div class="header">
            <b>客户基本信息</b>
          </div>

          <div class="box-a">
            <el-form-item class="item-1" prop="名称" label="名称">
              <el-input v-model.trim="form['名称']" placeholder="客户名称" />
            </el-form-item>

            <el-form-item class="item-2" prop="电话" label="电话">
              <el-input v-model.trim="form['电话']" placeholder="例如:18888888888或025-85951313" />
            </el-form-item>

            <el-form-item class="item-3" prop="地址" label="地址">
              <el-input v-model.trim="form['地址']" placeholder="客户地址" />
            </el-form-item>

            <!--备注信息-->
            <el-form-item class="item-4" prop="备注" label="备注:">
              <el-input
                v-model="form['备注']"
                type="textarea"
                :sapn="24"
                :rows="5"
                placeholder="客户备注信息"
              />
            </el-form-item>
          </div>
        </div>

        <div class="btn-box">
          <el-button v-if="openMode=='add'" type="primary" @click="addCustomerButtonClick('clientForm')">添加客户</el-button>
          <el-button v-if="openMode=='add'" type="danger" @click="onReset('clientForm')">清空表单</el-button>
          <el-button v-if="openMode=='viewAndModify'" type="primary" @click="okToModifyButtonClick('clientForm')">确认修改</el-button>
          <el-button v-if="openMode=='viewAndModify'" type="primary" @click="cancelTheModificationAndClickTheButton()">取消修改</el-button>

        </div>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import {
  client_tags_auto_complete,
  edit_client_by_id,
  add_client
} from '@/api/customer'
import {
  验证客户名称,
  验证电话
} from '@/utils/validate'
import { deepClone } from '@/utils'
import { mapGetters } from 'vuex'
export default {
  props: {
    dialogVisible: Boolean,
    onClose: {
      required: true,
      validator: function(value) {
        return true
      }
    },
    curOperationDetailInfo: {
      type: Object,
      // 对象或数组默认值必须从一个工厂函数获取
      default: function() {
        return {}
      }
    },
    // add,viewAndModify（添加，查看/修改）
    openMode: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      form: {
        tags: [],
        unique_id: '',
        名称: '',
        电话: '',
        地址: '',
        备注: ''
      },
      formRules: {
        名称: [{ required: true, trigger: 'blur', validator: 验证客户名称 }],
        电话: [{ required: true, trigger: 'blur', validator: 验证电话 }]
      },
      show: false,
      // 是否让父组件刷新数据
      refresh_flag: false
    }
  },
  computed: {
    calculateTitle: function() {
      if (this.openMode === 'add') {
        return '添加客户信息'
      } else if (this.openMode === 'viewAndModify') {
        return '查看修改客户信息'
      } else return ''
    },
    ...mapGetters([
      '管理权限'
    ])
  },
  watch: {
    dialogVisible: function(newVal, oldVal) {
      this.show = newVal
      // 进入的对话的时候
      if (newVal && !oldVal) {
        if (this.openMode === 'viewAndModify') {
          for (var key_a in this.curOperationDetailInfo) {
            this.$set(this.form, key_a, this.curOperationDetailInfo[key_a])
          }
        } else if (this.openMode === 'add') {
          var 空的客户结构 = deepClone(this.$store.getters['空的客户结构'])
          for (var key_b in 空的客户结构) {
            this.$set(this.form, key_b, 空的客户结构[key_b])
          }

          var tag_names = deepClone(this.$store.getters['客户的标签'])
          for (let i = 0; i < tag_names.length; i++) {
            this.$set(this.form.tags, tag_names[i], '')
          }
        }
      }
    },
    show(newVal, oldVal) {
      if (!newVal) {
        this.onClose(this.show, this.refresh_flag)
        this.refresh_flag = false
      }
    }
  },
  created() {
  },
  mounted() {
  },
  methods: {
    // 确认修改 按钮点击
    okToModifyButtonClick(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          var post_data = {
            login_token: this.$store.getters.token,
            unique_id: this.form.unique_id,
            update_data: this.form
          }
          edit_client_by_id(post_data).then(response => {
            this.$message({ type: 'success', message: response.msg })
            this.refresh_flag = true
            this.show = false
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
    // 取消修改，按钮点击
    cancelTheModificationAndClickTheButton() {
      this.show = false
    },
    // 添加客户按钮点击
    addCustomerButtonClick(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          var login_token = this.$store.getters.token
          var post_data = {
            login_token: login_token,
            data: this.form
          }
          // 添加客户信息
          add_client(post_data).then(response => {
            this.$message({ type: 'success', message: response.msg })
            this.show = false
            this.refresh_flag = true
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
    // 清空表单按钮点击
    onReset(formName) {
      var 空的客户结构 = deepClone(this.$store.getters['空的客户结构'])
      for (var key_b in 空的客户结构) {
        this.$set(this.form, key_b, 空的客户结构[key_b])
      }

      var tag_names = deepClone(this.$store.getters['客户的标签'])
      for (let i = 0; i < tag_names.length; i++) {
        this.$set(this.form.tags, tag_names[i], '')
      }
    },
    // 对客户标签进行自动补全操作
    async tagQueryAutoCompleteSearch(queryString, callback, tag_name) {
      if (queryString === undefined || queryString === null) {
        queryString = ''
      }
      var login_token = this.$store.getters.token
      var post_data = {
        login_token: login_token,
        base_tags: this.form.tags,
        target_tag_name: tag_name
      }
      const response = await client_tags_auto_complete(post_data)
      var suggest_value_list = []
      for (var index in response.data) {
        suggest_value_list.push({
          value: response.data[index]
        })
      }
      callback(suggest_value_list)
    }

  }
}
</script>

<style lang="scss" scoped>
.edit-material-dialog-box {
  .base-info {
    margin-bottom: 30px;
    border: 1px solid #bbbbbb;
    .header {
      padding: 0 10px;
      height: 40px;
      line-height: 40px;
      border-bottom: 1px solid #bbbbbb;
    }
    .box-a {
      padding: 10px 10px 0px 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      .item-1 {
        width: 30%;
      }
      .item-2 {
        width: 30%;
      }
      .item-3 {
        width: 30%;
      }
      .item-4 {
        width: 100%;
      }
    }
  }
  .btn-box {
    display: flex;
    justify-content: center;
    .btn-1 {
      margin-right: 40px;
    }
  }
}
</style>

