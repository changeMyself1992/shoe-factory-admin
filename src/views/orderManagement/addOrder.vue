<template>
  <div class="add-order">
    <div class="useintro" @click="viewUseIntro">
      <img src="@/assets/images/help.png" class="help">
    </div>
    <el-form ref="form" class="form" :model="form" label-position="left" :rules="formRules">
      <div class="order-basr-info">
        <div class="title">订单基本信息</div>
        <div class="order-info">
          <!-- 订单的动态标签(自动补全) -->
          <div
            v-if="order_tag_names.length>0"
            class="item-0"
            :model="order_tag_filter"
            label-position="left"
          >
            <el-form-item v-for="tag_name in order_tag_names" :key="tag_name" :label="tag_name">
              <el-autocomplete
                v-model.trim="order_tag_filter[tag_name]"
                :fetch-suggestions="((queryString, callback)=>tagQueryAutoCompleteSearch(queryString,callback,tag_name))"
              />
            </el-form-item>
          </div>

          <el-form-item class="item-1" prop="订单编号" label="订单编号:" label-width="90px">
            <el-input v-model.trim="form.订单编号" name="订单编号" placeholder="单行输入" disabled />
          </el-form-item>

          <el-form-item class="item-3" prop="客户信息" label="客户信息:" label-width="90px">
            <el-select v-model.trim="value" placeholder="请选择" clearable :change="onSelectchange">
              <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item class="item-4" prop="订单日期" label="订单日期:" label-width="90px">
            <el-date-picker v-model.trim="form.订单日期" name="订单日期" type="date" placeholder="选择日期" />
          </el-form-item>

          <el-form-item class="item-5" prop="交货日期" label="交货日期:" label-width="90px">
            <el-date-picker v-model.trim="form.交货日期" name="交货日期" type="date" placeholder="选择日期" />
          </el-form-item>

          <el-form-item class="item-6" prop="订单状态" label="订单状态:" label-width="90px">
            <el-radio v-model.trim="form['订单状态']" label="新订单" disabled>新订单</el-radio>
            <el-radio v-model.trim="form['订单状态']" label="排产中" disabled>排产中</el-radio>
            <el-radio v-model.trim="form['订单状态']" label="完成" disabled>完成</el-radio>
          </el-form-item>

          <el-form-item class="item-8" prop="订单备注" label="订单备注:" label-width="90px">
            <el-input v-model="form.订单备注" type="textarea" :rows="3" name="订单备注" placeholder="多行输入" />
          </el-form-item>

          <el-form-item class="item-9" prop="上传图片列表">
            <el-upload
              v-loading="loading"
              class="avatar-uploader"
              :action="fileUploadUrl"
              :data="{'login_token':token}"
              :show-file-list="false"
              :on-success="handlePaperOrderSuccess"
              :on-error="handleUploadError"
              :before-upload="beforeAvatarUpload"
            >
              <img v-if="form['上传图片列表'][0]" :src="form['上传图片列表'][0]" class="avatar">
              <i v-else class="el-icon-plus avatar-uploader-icon" />
              <span class="des">上传纸字订单</span>
            </el-upload>
          </el-form-item>

          <el-form-item class="item-9">
            <el-upload
              v-loading="loading"
              class="avatar-uploader"
              :action="fileUploadUrl"
              :data="{'login_token':token}"
              :show-file-list="false"
              :on-success="handleSampleSuccess"
              :on-error="handleUploadError"
              :before-upload="beforeAvatarUpload"
            >
              <img v-if="form['上传图片列表'][1]" :src="form['上传图片列表'][1]" class="avatar">
              <i v-else class="el-icon-plus avatar-uploader-icon" />
              <span class="des">上传样品图片</span>
            </el-upload>
          </el-form-item>
        </div>
      </div>

      <el-card>
        <el-form-item class="product-list">
          <div class="title">
            <span>订单包含的产品列表</span>
          </div>
          <div class="list">
            <product-list-a
              ref="productListA"
              :brand="form.tags.品牌"
              :is-show-download-excel-btn="true"
              :is-show-upload-excel-btn="true"
              :is-show-delete-from-order="true"
            />
          </div>
        </el-form-item>
      </el-card>

      <div class="form-btn-box">
        <el-button
          :loading="loading"
          type="primary"
          size="small"
          :disabled="!管理权限['订单管理可写']"
          @click="onSubmit('form')"
        >确认添加订单</el-button>
        <el-button type="primary" size="small" @click="onReset('form')">取消添加订单</el-button>
      </div>
    </el-form>
  </div>
</template>

<script>
import productListA from '@/views/components/productListA'
import {
  add_order,
  order_tags_auto_complete
} from '@/api/ordersForProductionScheduling'
import { generate_year_month_sequence_number } from '@/api/otherUtilityClasses'
import { filter_client } from '@/api/customer'
import { parseTime, isEmpty, deepClone, beforeUploadIcon } from '@/utils'
import {
  验证订单编号,
  验证订单状态,
  验证订单上传图片列表
} from '@/utils/validate'
import { mapGetters } from 'vuex'
export default {
  components: { productListA },
  props: [],
  data() {
    return {
      // 配置中对订单的tags数组
      order_tag_names: [],
      // 对应的用于搜索和自动补全的tags模块
      order_tag_filter: {},
      form: {
        tags: {},
        订单编号: '',
        上传图片列表: new Array(2),
        交货日期: null,
        包含的产品: [],
        客户信息: {},
        订单备注: '暂时无备注',
        订单日期: new Date(),
        订单状态: '新订单',
        已排产生产单列表: []
      },
      formRules: {
        订单编号: [
          { required: true, trigger: 'blur', validator: 验证订单编号 }
        ],
        上传图片列表: [
          { required: true, trigger: 'blur', validator: 验证订单上传图片列表 }
        ],
        交货日期: [
          {
            required: true,
            trigger: 'blur',
            validator: (rule, value, callback) => {
              if (!value) {
                callback(new Error('交货日期必选'))
              } else {
                callback()
              }
            }
          }
        ],
        订单日期: [{ required: true, trigger: 'blur' }],
        订单状态: [{ required: true, trigger: 'blur', validator: 验证订单状态 }]
      },
      options: [
        // {
        //   value: '选项1',
        //   label: '黄金糕'
        // }
      ],
      // 客户列表
      clientList: [],
      // 客户选中的值
      value: '',
      loading: false
    }
  },
  computed: {
    ...mapGetters(['fileUploadUrl', 'token', '管理权限'])
  },
  watch: {
    value: function(newVal, oldVal) {
      var index = parseInt(newVal)
      this.form.客户信息 = this.clientList[index] || {}
    },
    order_tag_filter: function(newVal, oldVal) {
      this.form.tags = newVal
    }
  },
  async created() {
    const res_a = await generate_year_month_sequence_number({
      login_token: this.$store.getters.token,
      流水单分组: 'DD'
    })
    var code = res_a.data['流水号']
    this.form = deepClone(this.$store.getters.空的订单结构)
    this.form.订单编号 = code
    this.form.订单日期 = new Date()
    this.form.订单状态 = '新订单'
    this.getOrderTagName()
    this.filterClient()
  },
  mounted() {
  },
  methods: {
    // 查看指引
    viewUseIntro() {
      var routeUrl = this.$router.resolve({
        path: '/instructionsForuse/index',
        query: {
          x: 4,
          y: 0
        }
      })
      window.open(routeUrl.href, '_blank')
    },

    // 获取配置中对订单的tags数组，确保先载入
    async getOrderTagName(callback) {
      this.order_tag_names = this.$store.getters.订单的标签
      this.order_tag_filter = {}
      for (var index in this.order_tag_names) {
        this.$set(this.order_tag_filter, this.order_tag_names[index], '')
      }
      if (typeof callback === 'function') {
        callback()
      }
    },
    // 对订单标签进行自动补全操作
    async tagQueryAutoCompleteSearch(queryString, callback, tag_name) {
      if (queryString === undefined || queryString === null) {
        queryString = ''
      }
      var login_token = this.$store.getters.token
      var post_data = {
        login_token: login_token,
        base_tags: this.order_tag_filter,
        target_tag_name: tag_name
      }
      const response = await order_tags_auto_complete(post_data)
      var suggest_value_list = []
      for (var index in response.data) {
        suggest_value_list.push({
          value: response.data[index]
        })
      }
      callback(suggest_value_list)
    },
    onSubmit(formName) {
      this.$refs[formName].validate(async valid => {
        if (valid) {
          var 包含的产品 = await this.$refs.productListA.returnProductList()
          if (isEmpty(包含的产品)) return
          this.form.包含的产品 = 包含的产品
          if (this.form.交货日期 <= this.form.订单日期) {
            this.$message({
              type: 'warning',
              message: '交货日期应在订单日期之后！！'
            })
            return
          }
          this.form.订单日期 = parseTime(this.form.订单日期, '{y}-{m}-{d}')
          this.form.交货日期 = parseTime(this.form.交货日期, '{y}-{m}-{d}')
          var parameter = {
            login_token: this.$store.getters.token,
            data: this.form
          }
          this.loading = true
          const res = await add_order(parameter)
          this.loading = false
          this.$message({
            type: 'success',
            message: res.msg
          })
          this.$router.push('/orderManagement/orderList')
        } else {
          this.$message({
            type: 'warning',
            message: '请完善表单信息'
          })
          return false
        }
      })
    },
    async onReset(formName) {
      const res_a = await generate_year_month_sequence_number({
        login_token: this.$store.getters.token,
        流水单分组: 'DD'
      })
      var code = res_a.data['流水号']
      this.form = deepClone(this.$store.getters.空的订单结构)
      this.form.订单编号 = code
      this.form.订单日期 = new Date()
      this.form.订单状态 = '新订单'
      this.value = ''
      this.getOrderTagName()
      this.$refs.productListA.initProductList()
    },
    // 上传纸质订单图片成功
    handlePaperOrderSuccess(res, file) {
      this.loading = false
      if (res.status === 'OK') {
        this.form['上传图片列表'][0] = res.url
        this.$forceUpdate()
      } else if (res.status === 'TOKEN_FAIL') {
        this.form['上传图片列表'][0] = []
        this.$alert(
          '你已被登出，请重新登录。',
          '登录过期',
          {
            confirmButtonText: '确定',
            callback: (item) => {
              this.$store.dispatch('LogOut').then(() => {
                location.reload() // 为了重新实例化vue-router对象 避免bug
              })
            }
          }
        )
      } else {
        this.form['上传图片列表'][0] = []
        this.$message({
          type: 'error',
          message: res.msg
        })
      }
    },
    // 上传样品图片成功
    handleSampleSuccess(res, file) {
      this.loading = false
      if (res.status === 'OK') {
        this.form['上传图片列表'][1] = res.url
        this.$forceUpdate()
      } else if (res.status === 'TOKEN_FAIL') {
        this.form['上传图片列表'][1] = []
        this.$alert(
          '你已被登出，请重新登录。',
          '登录过期',
          {
            confirmButtonText: '确定',
            callback: (item) => {
              this.$store.dispatch('LogOut').then(() => {
                location.reload() // 为了重新实例化vue-router对象 避免bug
              })
            }
          }
        )
      } else {
        this.form['上传图片列表'][1] = []
        this.$message({
          type: 'error',
          message: res.msg
        })
      }
    },
    // 上传之前回调
    beforeAvatarUpload(file) {
      if (beforeUploadIcon(file)) {
        this.loading = true
        return true
      } else {
        return false
      }
    },
    // 上传失败回调
    handleUploadError(err) {
      this.$message({
        type: 'error',
        message: '上传失败！！！'
      })
      console.error(err)
      this.loading = false
    },
    // 获取所有用户信息
    async filterClient() {
      var post_data = {
        login_token: this.$store.getters.token
      }
      const response = await filter_client(post_data)
      this.clientList = response.data
      var options = []
      this.clientList.forEach((element, index) => {
        var item = {
          value: index,
          label: element['名称']
        }
        options.push(item)
      })
      this.options = options
    },
    // 客户名称选择回调
    onSelectchange(item) {}
  }
}
</script>

<style lang="scss" scoped>
.add-order {
  padding: 10px;
  .form {
    .order-basr-info {
      border: 1px solid #bbbbbb;
      margin-bottom: 20px;
      .title {
        padding: 0 10px;
        height: 40px;
        line-height: 40px;
        border-bottom: 1px solid #bbbbbb;
      }
      .order-info {
        padding: 20px 10px 0px 10px;
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        .item-0 {
          width: 100%;
          display: flex;
          justify-content: space-between;
        }
        .item-1,
        .item-2,
        .item-4,
        .item-5,
        .item-7 {
          width: 21%;
        }
        .item-3 {
          width: 21%;
        }
        .item-6 {
          width: 42%;
        }
        .item-8 {
          width: 70%;
          height: 75px;
          overflow: hidden;
        }
        .item-9 {
          width: 10%;
          height: 75rpx;
          overflow: hidden;
          .avatar-uploader {
            width: 90px;
            height: 75px;
            margin: 0 auto;
            border: 1px dashed #d9d9d9;
            border-radius: 6px;
            text-align: center;
            cursor: pointer;
            position: relative;
            overflow: hidden;
            .el-upload {
              width: 100%;
              height: 100%;
              .avatar-uploader-icon {
                font-size: 20px;
                color: #8c939d;
                width: 100%;
                height: 100%;
                line-height: 60px;
                text-align: center;
                position: relative;
              }
              .avatar {
                width: 100%;
                display: block;
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
              }
              .des {
                position: absolute;
                width: 100%;
                top: 80%;
                left: 50%;
                font-size: 12px;
                color: #8c939d;
                transform: translate(-50%, -50%);
              }
            }
          }
          .avatar-uploader:hover {
            border-color: #409eff;
          }
        }
      }
    }
    .product-list {
      .title {
        display: flex;
        height: 30px;
        line-height: 30px;
        justify-content: space-between;
        margin-bottom: 10px;
      }
      .list {
        width: 100%;
        overflow: auto;
      }
    }
    .form-btn-box {
      display: flex;
      justify-content: center;
      .el-button + .el-button {
        margin-left: 40px;
      }
    }
  }
}
</style>
