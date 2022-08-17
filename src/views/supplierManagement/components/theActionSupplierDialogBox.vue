<template>
  <!--操作供应商对话框-->
  <div class="the-action-supplier-dialog-box">
    <el-dialog :visible.sync="show" :title="calculateTitle" center width="70%">
      <el-form ref="form" :model="form">

        <!-- 基本信息 -->
        <el-form-item class="base-info">
          <div class="header">
            <b>供应商基本信息</b>
          </div>

          <el-row :gutter="20">
            <el-col :span="7">
              <el-autocomplete
                v-model.trim="form['名称']"
                style="width: 100%;"
                :fetch-suggestions="((queryString,callback)=>tagQueryAutoCompleteSearch(callback))"
                placeholder="供应商名称"
                @select="((item)=>{handleSelect(item)})"
              >
                <template slot="prepend">供应商名称</template>
              </el-autocomplete>
            </el-col>

            <el-col :span="7">
              <el-input
                v-model.trim="form['联系电话']"
                placeholder="供应商电话"
                :disabled="Selected"
              >
                <template slot="prepend">联系电话</template>
              </el-input>
            </el-col>

            <el-col :span="10">
              <el-input
                v-model.trim="form['地址']"
                placeholder="供应商地址"
                :disabled="Selected"
              >
                <template slot="prepend">地址</template>
              </el-input>
            </el-col>
          </el-row>
        </el-form-item>

        <!--备注信息-->
        <el-form-item class="other-note">
          <div class="other-note-title">备注</div>
          <el-input
            v-model="form['备注']"
            type="textarea"
            :sapn="24"
            :rows="5"
            placeholder="供应商备注信息"
            :disabled="Selected"
          />
        </el-form-item>

        <el-form-item style="text-align:right;">
          <el-button
            type="primary"
            @click="onAddSupplierButtonClick"
          >添加供应商</el-button>
          <el-button type="danger" @click="clearForm">清空表单</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { isValidPhone, isValidSpecialPlane } from '@/utils/validate'
import { isEmpty } from '@/utils'
import {
  add_supplier,
  check_supplier_info_by_key_word
} from '@/api/supplier'
import { mapGetters } from 'vuex'
export default {
  props: {
    // 打开该对话框的模式（正在进行，已完成）
    openModel: {
      type: String,
      default: 'add' // add, detail, modify
    },
    dialogVisible: Boolean,
    onClose: {
      required: true,
      validator: function(value) {
        return true
      }
    },
    // 当前操作的供应商对象（查看和修改的时候会传过来）
    curOperationDetailInfo: {
      type: Object,
      default: function() {
        return {}
      }
    }
  },
  data() {
    return {
      // 对应的用于搜索和自动补全的tags模块
      tag_names: [],
      tag_filter: {},
      suggest_value_list: [],
      form: {
        名称: '',
        电话: '',
        地址: '',
        备注: ''
      },
      show: false,
      // 告诉父组件是否要刷新数据
      refresh_flag: false,
      // 是否是点选的供应商
      Selected: false
    }
  },
  computed: {
    ...mapGetters([
      '管理权限'
    ]),
    calculateTitle: function() {
      if (this.openModel === 'add') return '添加供应商'
      if (this.openModel === 'detail') return '查看供应商信息'
      if (this.openModel === 'modify') return '修改供应商信息'
      return ''
    }
  },
  watch: {
    dialogVisible: function(newVal, oldVal) {
      this.show = newVal
    },
    show(newVal, oldVal) {
      if (!newVal) {
        this.onClose(this.show, this.refresh_flag)
        this.clearForm()
      }
    }
  },
  mounted() {
  },
  created() {
  },
  methods: {
    // 添加供应商按钮点击
    async onAddSupplierButtonClick() {
      if (isEmpty(this.form['名称']) || isEmpty(this.form['联系电话']) || isEmpty(this.form['地址'])) {
        this.$message({ type: 'warning', message: '请完善信息！' })
        return false
      }
      // 如果他输入了电话信息，那么就必须是正确的
      if (!isEmpty(this.form['联系电话'])) {
        // 如果电话 不满足手机号和座机的验证，那么不许提交
        if (
          !isValidPhone(this.form['联系电话']) &&
          !isValidSpecialPlane(this.form['联系电话'])
        ) {
          this.$message({
            type: 'warning',
            message: '必须输入正确的联系电话，例如：18888888888或者025-85951313'
          })
          return false
        }
      }
      var login_token = this.$store.getters.token
      var post_data = {
        login_token: login_token,
        data: {
          名称: this.form['名称'].trim(),
          联系电话: this.form['联系电话'].trim(),
          地址: this.form['地址'].trim(),
          备注: this.form['备注'],
          tags: []
        }
      }
      if (this.suggest_value_list.some(item => item.value === this.form['名称'])) {
        console.log('pass')
      } else {
        if (!confirm('确定添加一个全新的供应商吗？')) {
          return false
        }
      }
      // 添加供应商进库存信息数据库
      await add_supplier(post_data)
      this.$message({ type: 'success', message: '添加供应商成功' })
      this.show = false
      this.refresh_flag = true
    },
    // 清空表单按钮点击
    clearForm() {
      this.form = {
        名称: '',
        联系电话: '',
        地址: '',
        备注: ''
      }
      this.refresh_flag = false
    },
    handleSelect(item) {
      this.form['联系电话'] = item['联系电话']
      this.form['地址'] = item['地址']
      this.Selected = true
    },
    // 对供应商标签进行自动补全操作
    async tagQueryAutoCompleteSearch(callback) {
      var login_token = this.$store.getters.token
      var post_data = {
        login_token: login_token,
        关键字: this.form['名称']
      }
      const response = await check_supplier_info_by_key_word(post_data)
      var suggest_value_list = []
      for (var index in response.data['供应商信息列表']) {
        suggest_value_list.push({
          value: response.data['供应商信息列表'][index]['名称'],
          地址: response.data['供应商信息列表'][index]['地址'],
          联系电话: response.data['供应商信息列表'][index]['联系电话']
        })
      }
      this.Selected = false
      callback(suggest_value_list)
    }
  }
}
</script>

<style lang="scss" scoped>
.the-action-supplier-dialog-box {
  position: relative;
  box-sizing: border-box;
  .base-info {
    .header {
      margin-bottom: 10px;
    }
  }
}
</style>
