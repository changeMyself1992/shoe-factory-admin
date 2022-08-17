<template>
  <!--操作供应商对话框-->
  <div class="the-action-supplier-dialog-box">
    <el-dialog :visible.sync="show" :title="calculateTitle" center width="70%">
      <el-form ref="form" :model="form">
        <!-- 标签信息 -->
        <div v-if="tag_names.length>0" class="base-info">
          <div class="header">
            <b>供应商标签信息</b>
          </div>

          <el-form-item
            v-for="(value,tag_name) in tag_filter"
            :key="tag_name"
            class="item-1"
            :label="tag_name"
            label-width="85px"
          >
            <el-autocomplete
              v-model.trim="tag_filter[tag_name]"
              class="inline-input"
              :fetch-suggestions="((queryString, callback)=>tagQueryAutoCompleteSearch(queryString,callback,tag_name))"
              placeholder="自动补全"
              :disabled="openModel==='detail'"
            />
          </el-form-item>
        </div>

        <!-- 基本信息 -->
        <el-form-item class="base-info">
          <div class="header">
            <b>供应商基本信息</b>
          </div>

          <el-row :gutter="20">
            <el-col :span="6">
              <el-input
                v-model.trim="form['名称']"
                class="name-a"
                placeholder="供应商名称"
                :disabled="openModel==='detail'"
              >
                <template slot="prepend">名称</template>
              </el-input>
            </el-col>

            <el-col :span="8">
              <el-input
                v-model.trim="form['电话']"
                class="name-a"
                placeholder="供应商电话"
                :disabled="openModel==='detail'"
              >
                <template slot="prepend">电话</template>
              </el-input>
            </el-col>

            <el-col :span="10">
              <el-input
                v-model.trim="form['地址']"
                class="name-a"
                placeholder="供应商地址"
                :disabled="openModel==='detail'"
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
            :disabled="openModel==='detail'"
          />
        </el-form-item>

        <el-form-item v-if="openModel==='add'" style="text-align:right;">
          <el-button
            type="primary"
            :disabled="NOT_EDITABLED"
            @click="onAddSupplierButtonClick"
          >添加供应商</el-button>
          <el-button type="danger" @click="clearForm">清空表单</el-button>
        </el-form-item>

        <div v-if="openModel==='modify'" style="text-align:right;">
          <el-button class="btn-1" type="primary" plain @click="()=>{show=false}">取消修改</el-button>
          <el-button
            type="primary"
            plain
            :disabled="NOT_EDITABLED"
            @click="onModifyButtonClick"
          >确认修改</el-button>
        </div>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { isValidPhone, isValidSpecialPlane } from '@/utils/validate'
import { objectWhetherAllKeysHaveNoNullValue, isEmpty } from '@/utils'
import {
  add_supplier,
  supplier_tags_auto_complete,
  edit_supplier_by_id
} from '@/api/supplier'
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
      NOT_EDITABLED: false, // 修改权限
      // 对应的用于搜索和自动补全的tags模块
      tag_names: [],
      tag_filter: {},
      form: {
        名称: '',
        电话: '',
        地址: '',
        备注: ''
      },
      show: false,
      // 告诉父组件是否要刷新数据
      refresh_flag: false
    }
  },
  computed: {
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
      // 进入的对话的时候
      if (newVal && !oldVal) {
        if (this.openModel === 'add') {
          this.getSupplierTagName()
        }

        if (this.openModel === 'detail' || this.openModel === 'modify') {
          for (var key in this.curOperationDetailInfo) {
            this.$set(this.form, key, this.curOperationDetailInfo[key])
          }
          for (var key_a in this.curOperationDetailInfo.tags) {
            this.$set(
              this.tag_filter,
              key_a,
              this.curOperationDetailInfo.tags[key_a]
            )
          }
        }
      }
    },
    show(newVal, oldVal) {
      if (!newVal) {
        this.onClose(this.show, this.refresh_flag)
        this.clearForm()
      }
    }
  },
  mounted() {
    if (
      this.$store.getters.管理权限.hasOwnProperty('采购管理可编辑') &&
      this.$store.getters.管理权限['采购管理可编辑']
    ) {
      this.NOT_EDITABLED = false
    } else {
      this.NOT_EDITABLED = true
    }
  },
  methods: {
    // 获取配置中对供应商的tags数组，确保先载入
    getSupplierTagName(callback) {
      this.tag_names = this.$store.getters.供应商的标签
      this.tag_filter = {}
      for (var index in this.tag_names) {
        this.$set(this.tag_filter, this.tag_names[index], '')
      }
    },

    // 添加供应商按钮点击
    async onAddSupplierButtonClick() {
      if (!objectWhetherAllKeysHaveNoNullValue(this.tag_filter)) {
        this.$message({ type: 'warning', message: '标签信息必须全部填写！' })
        return false
      }
      if (isEmpty(this.form['名称'])) {
        this.$message({ type: 'warning', message: '供应商名称必须填写！' })
        return false
      }
      // 如果他输入了电话信息，那么就必须是正确的
      if (!isEmpty(this.form['电话'])) {
        // 如果电话 不满足手机号和座机的验证，那么不许提交
        if (
          !isValidPhone(this.form['电话']) &&
          !isValidSpecialPlane(this.form['电话'])
        ) {
          this.$message({
            type: 'warning',
            message: '必须输入正确的电话，例如：18888888888或者025-85951313'
          })
          return false
        }
      }
      for (const key in this.tag_filter) {
        this.tag_filter[key] = String(this.tag_filter[key]).trim()
      }

      var login_token = this.$store.getters.token
      var post_data = {
        login_token: login_token,
        data: {
          tags: this.tag_filter,
          名称: this.form['名称'].trim(),
          电话: this.form['电话'].trim(),
          地址: this.form['地址'].trim(),
          备注: this.form['备注'].trim()
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
        电话: '',
        地址: '',
        备注: ''
      }
      this.getSupplierTagName()
      this.refresh_flag = false
    },

    // 修改供应商按钮点击
    async onModifyButtonClick() {
      if (!confirm('确定进行修改吗？修改将会对供应商记录进行永久的改变')) {
        return false
      }
      if (!objectWhetherAllKeysHaveNoNullValue(this.tag_filter)) {
        this.$message({ type: 'warning', message: '标签信息必须全部填写！' })
        return false
      }
      if (isEmpty(this.form['名称'])) {
        this.$message({ type: 'warning', message: '供应商名称必须填写！' })
        return false
      }
      // 如果他输入了电话信息，那么就必须是正确的
      if (!isEmpty(this.form['电话'])) {
        // 如果电话 不满足手机号和座机的验证，那么不许提交
        if (
          !isValidPhone(this.form['电话']) &&
          !isValidSpecialPlane(this.form['电话'])
        ) {
          this.$message({
            type: 'warning',
            message: '必须输入正确的电话，例如：18888888888或者025-85951313'
          })
          return false
        }
      }
      // 标签需要去除头尾空白
      for (const key in this.tag_filter) {
        this.tag_filter[key] = String(this.tag_filter[key]).trim()
      }

      var login_token = this.$store.getters.token
      var post_data = {
        login_token: login_token,
        unique_id: this.form.unique_id,
        update_data: {
          tags: this.tag_filter,
          名称: this.form['名称'],
          电话: this.form['电话'],
          地址: this.form['地址'],
          备注: this.form['备注']
        }
      }
      await edit_supplier_by_id(post_data)
      this.$message({ type: 'success', message: '修改供应商信息成功' })
      this.refresh_flag = true
      this.show = false
    },

    // 对供应商标签进行自动补全操作
    async tagQueryAutoCompleteSearch(queryString, callback, tag_name) {
      if (queryString === undefined || queryString === null) {
        queryString = ''
      }
      var login_token = this.$store.getters.token
      var post_data = {
        login_token: login_token,
        base_tags: this.tag_filter,
        target_tag_name: tag_name
      }
      const response = await supplier_tags_auto_complete(post_data)
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
