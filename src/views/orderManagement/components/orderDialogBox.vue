<template>
  <div>
    <el-dialog :visible.sync="show" center width="1300px" :show-close="false">
      <!-- <el-button v-if="openMode=='lookOver'" class="no-print" type="primary" size="small" @click="printComponent()">打印</el-button> -->
      <div id="orderDialogBox" class="order-dialog-box">
        <div class="title">{{ calculateTitle }}</div>
        <el-form
          v-if="Object.keys(form).length>1"
          ref="editOrderForm"
          class="module-a"
          :model="form"
          :rules="editOrderFormRules"
          label-position="left"
        >
          <div class="base-info">
            <div class="header">
              <b>订单基本信息</b>
            </div>

            <div class="info-box">
              <!-- 订单动态标签信息 -->
              <div class="item-0">
                <el-form-item
                  v-for="(value,tag_name) in form.tags"
                  :key="tag_name"
                  :label="tag_name"
                >
                  <el-autocomplete
                    v-model.trim="form.tags[tag_name]"
                    :fetch-suggestions="((queryString, callback)=>tagQueryAutoCompleteSearch(queryString,callback,tag_name))"
                    placeholder="自动补全"
                    :disabled="openMode=='lookOver'?true:form['订单状态']==='新订单'?false:true"
                  />
                </el-form-item>
              </div>

              <!-- 其他订单静态属性 -->
              <el-form-item class="item-1" prop="订单编号" label="订单编号:" label-width="90px">
                <el-input v-model.trim="form['unique_id']" disabled placeholder="单行输入" />
              </el-form-item>

              <el-form-item class="item-2" prop="订单状态" label="订单状态:" label-width="90px">
                <el-input v-model.trim="form['订单状态']" placeholder="单行输入" :disabled="true" />
              </el-form-item>

              <el-form-item class="item-4" prop="订单日期" label="订单日期:" label-width="90px">
                <el-date-picker
                  v-model.trim="form['订单日期']"
                  format="yyyy-MM-dd"
                  type="datetime"
                  placeholder="选择日期时间"
                  :disabled="openMode=='lookOver'?true:form['订单状态']==='新订单'?false:true"
                />
              </el-form-item>

              <el-form-item class="item-5" prop="交货日期" label="交货日期:" label-width="90px">
                <el-date-picker
                  v-model.trim="form['交货日期']"
                  format="yyyy-MM-dd"
                  type="datetime"
                  placeholder="选择日期时间"
                  :disabled="openMode=='lookOver'?true:form['订单状态']==='新订单'?false:true"
                />
              </el-form-item>

              <el-form-item class="item-8" prop="客户信息.名称" label="客户名称:" label-width="85px">
                <el-select
                  v-model.trim="form['客户信息']['名称']"
                  placeholder="请选择"
                  :disabled="openMode=='lookOver'?true:form['订单状态']==='新订单'?false:true"
                  @change="onSelectChange"
                >
                  <el-option
                    v-for="item in clientOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>

              <el-form-item class="item-9" prop="客户信息" label="客户地址:" label-width="85px">
                <el-input v-model.trim="form['客户信息']['地址']" placeholder="单行输入" disabled />
              </el-form-item>

              <el-form-item class="item-10" prop="客户信息" label="客户电话:" label-width="84px">
                <el-input v-model.trim="form['客户信息']['电话']" placeholder="单行输入" disabled />
              </el-form-item>

              <el-form-item class="item-6 no-print" prop="订单备注" label="订单备注:" label-width="90px">
                <el-input
                  v-model="form['订单备注']"
                  type="textarea"
                  :rows="3"
                  placeholder="多行输入"
                  :disabled="openMode=='lookOver'"
                />
              </el-form-item>

              <el-form-item class="item-7 no-print" prop="上传图片列表">
                <el-upload
                  v-if="openMode==='lookOver'"
                  class="avatar-uploader"
                  action
                  :disabled="true"
                >
                  <el-popover placement="left" title trigger="hover">
                    <img
                      v-if="Array.isArray(form['上传图片列表']) && form['上传图片列表'].length>=1"
                      :src="form['上传图片列表'][0]"
                      class="avatar"
                    >
                    <i v-else class="el-icon-plus avatar-uploader-icon" />
                    <img
                      slot="reference"
                      :src="form['上传图片列表'][0]"
                      alt
                      style="max-height: 70px; max-width: 250px"
                      @click="downloadPic(form['上传图片列表'][0],'纸字订单')"
                    >
                  </el-popover>
                </el-upload>

                <el-upload
                  v-else
                  v-loading="loading"
                  class="avatar-uploader"
                  :action="fileUploadUrl"
                  :data="{'login_token':token}"
                  :show-file-list="false"
                  :on-success="(res, file)=>{
                    handlePaperOrderSuccess(res, file,0)
                  }"
                  :before-upload="beforeAvatarUpload"
                >
                  <img
                    v-if="Array.isArray(form['上传图片列表']) && form['上传图片列表'].length>=1 && form['上传图片列表'][0]"
                    :src="form['上传图片列表'][0]"
                    class="avatar"
                  >
                  <i v-else class="el-icon-plus avatar-uploader-icon" />
                </el-upload>

                <span class="des">上传纸字订单</span>
              </el-form-item>

              <el-form-item class="item-7 no-print">
                <el-upload
                  v-if="openMode==='lookOver'"
                  class="avatar-uploader"
                  action
                  :disabled="true"
                >
                  <el-popover placement="left" title trigger="hover">
                    <img
                      v-if="Array.isArray(form['上传图片列表']) && form['上传图片列表'].length>=2&&form['上传图片列表'][1]"
                      :src="form['上传图片列表'][1]"
                      class="avatar"
                    >
                    <i v-else class="el-icon-plus avatar-uploader-icon" />
                    <img
                      slot="reference"
                      :src="form['上传图片列表'][1]"
                      alt
                      style="max-height: 70px; max-width: 250px"
                      @click="downloadPic(form['上传图片列表'][1],'样品图片')"
                    >
                  </el-popover>
                </el-upload>

                <el-upload
                  v-else
                  v-loading="loading"
                  class="avatar-uploader"
                  :action="fileUploadUrl"
                  :data="{'login_token':token}"
                  :show-file-list="false"
                  :on-success="(res, file)=>{
                    handlePaperOrderSuccess(res, file,1)
                  }"
                  :before-upload="beforeAvatarUpload"
                >
                  <img
                    v-if="Array.isArray(form['上传图片列表']) && form['上传图片列表'].length>=2&&form['上传图片列表'][1]"
                    :src="form['上传图片列表'][1]"
                    class="avatar"
                  >
                  <i v-else class="el-icon-plus avatar-uploader-icon" />
                </el-upload>

                <span class="des">上传产品图片</span>
              </el-form-item>
            </div>
          </div>
        </el-form>

        <div class="module-b">
          <div class="title">订单包含得产品列表</div>
        </div>
        <div class="module-c">
          <product-list-a
            ref="productListA"
            :product-list-info="curOperationDetailInfo['包含的产品']"
            :whether-the-tag-is-editable="openMode=='edit'&&form['订单状态']==='新订单'?true:false"
            :whether-the-brand-is-editable="openMode=='edit'&&form['订单状态']==='新订单'?true:false"
            :is-the-customer-product-number-editable="openMode=='edit'&&form['订单状态']==='新订单'?true:false"
            :is-pei-ma-editable="openMode=='edit'&&form['订单状态']==='新订单'?true:false"
            :is-show-delete-from-order="openMode=='edit'&&form['订单状态']==='新订单'?true:false"
            :is-show-product-detail="openMode!=='edit'?true:false"
            :is-show-add-product="openMode=='edit'&&form['订单状态']==='新订单'?true:false"
          />
        </div>

        <div v-if="openMode=='edit'" class="module-d">
          <el-button type="primary" size="small" @click="onSubmit('editOrderForm')">提交编辑</el-button>
          <el-button type="primary" size="small" @click="onReset('editOrderForm')">取消编辑</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import productListA from '@/views/components/productListA' // product-a组件
import {
  order_tags_auto_complete,
  edit_order_by_id
} from '@/api/ordersForProductionScheduling'
import { parseTime, isEmpty, deepClone, beforeUploadIcon } from '@/utils'
import { filter_client } from '@/api/customer'
import $ from 'jquery'
import {
  验证订单编号,
  验证订单状态,
  验证订单上传图片列表,
  验证包含的产品,
  验证已排产生产单列表
} from '@/utils/validate'
import { mapGetters } from 'vuex'
export default {
  components: { productListA },
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
      required: true
    },
    openMode: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      form: {},
      originalFrom: {},
      editOrderFormRules: {
        订单编号: [
          { required: true, trigger: 'blur', validator: 验证订单编号 }
        ],
        上传图片列表: [
          { required: true, trigger: 'change', validator: 验证订单上传图片列表 }
        ],
        交货日期: [{ required: true, trigger: 'blur' }],
        包含的产品: [
          { required: true, trigger: 'change', validator: 验证包含的产品 }
        ],
        订单日期: [{ required: true, trigger: 'blur' }],
        订单状态: [
          { required: true, trigger: 'blur', validator: 验证订单状态 }
        ],
        已排产生产单列表: [
          { required: true, trigger: 'blur', validator: 验证已排产生产单列表 }
        ]
      },
      clientOptions: [],
      clientList: [],
      show: false,
      addedProductInfo: null, // 添加的产品详情（子组件返回）
      sizeInfo: null, // 添加的产品尺码以及数量信息(子组件返回)
      loading: false
    }
  },
  computed: {
    ...mapGetters(['fileUploadUrl', 'token']),
    calculateTitle: function() {
      return (
        '订单_' +
        this.$store.getters['对应企业名称'] +
        '_' +
        this.curOperationDetailInfo.订单编号
      )
    }
  },
  watch: {
    dialogVisible: function(newVal, oldVal) {
      this.show = newVal
    },
    curOperationDetailInfo: function(newVal, oldVal) {
      this.form = deepClone(newVal)
      this.originalFrom = deepClone(newVal)
    },
    show: function(newVal, oldVal) {
      if (!newVal) this.onClose(this.show)
    }
  },
  mounted() {
    this.filterClient()
  },
  methods: {
    async downloadPic(imgUrl, picName) {
      if (imgUrl) {
        window.open(imgUrl, '_blank')
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
        base_tags: this.form.tags,
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
    async onSubmit() {
      var 包含的产品 = await this.$refs.productListA.returnProductList()
      if (isEmpty(包含的产品)) return
      this.form.包含的产品 = 包含的产品
      this.form.订单日期 = parseTime(this.form.订单日期, '{y}-{m}-{d}')
      this.form.交货日期 = parseTime(this.form.交货日期, '{y}-{m}-{d}')

      var 交货日期 = this.form.交货日期.substring(0, 19)
      交货日期 = 交货日期.replace(/-/g, '/')
      var 订单日期 = this.form.订单日期.substring(0, 19)
      订单日期 = 订单日期.replace(/-/g, '/')
      if (交货日期 <= 订单日期) {
        this.$message({
          type: 'warning',
          message: '交货日期应在订单日期之后！！'
        })
        return
      }

      const parameter = {
        login_token: this.$store.getters.token,
        unique_id: this.form.unique_id,
        update_data: this.form
      }
      // 去除对象内多余的空值key
      for (const key in parameter.update_data) {
        if (!parameter.update_data[key]) {
          delete parameter.update_data[key]
        }
      }
      const res = await edit_order_by_id(parameter)
      this.show = false
      this.$message({
        type: 'success',
        message: res.msg
      })
    },
    // 获取所有客户信息
    async filterClient() {
      var post_data = {
        login_token: this.$store.getters.token
      }
      const response = await filter_client(post_data)
      this.clientList = response.data
      var clientOptions = []
      this.clientList.forEach((element, index) => {
        var item = {
          value: index,
          label: element['名称']
        }
        clientOptions.push(item)
      })
      this.clientOptions = clientOptions
    },
    // 更换了客户
    onSelectChange(item) {
      var client = deepClone(this.clientList)[item]
      // 选择相应的客户
      this.$set(this.form, '客户信息', client)
    },
    onReset(formName) {
      // this.$refs[formName].resetFields()
      this.show = false
    },
    // 上传成功回调
    handlePaperOrderSuccess(res, file, index) {
      this.loading = false
      if (res.status === 'OK') {
        this.form['上传图片列表'][index] = res.url
        this.$forceUpdate()
      } else if (res.status === 'TOKEN_FAIL') {
        this.form['上传图片列表'][index] = []
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
        this.form['上传图片列表'][index] = []
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
    // 打印组件
    printComponent() {
      $('#orderDialogBox').print({
        globalStyles: true,
        mediaPrint: false,
        stylesheet: null,
        noPrintSelector: '.no-print',
        iframe: true,
        append: null,
        prepend: null,
        manuallyCopyFormValues: true,
        deferred: $.Deferred(),
        timeout: 750,
        title: null, // 谷歌不支持 ie支持
        doctype: '<!doctype html>'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.order-dialog-box {
  .title {
    width: 100%;
    font-size: 22px;
    text-align: center;
    margin-bottom: 20px;
    color: #000;
    font-weight: 700;
  }
  .module-a {
    .base-info {
      margin-bottom: 10px;
      border: 1px solid #bbbbbb;
      .header {
        padding: 0 10px;
        height: 40px;
        line-height: 40px;
        border-bottom: 1px solid #bbbbbb;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .info-box {
        padding: 20px 10px 0px 10px;
        // height: 160px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        .item-0 {
          width: 100%;
          display: flex;
          justify-content: space-between;
        }
        .item-1 {
          width: 245px;
        }
        .item-2 {
          width: 245px;
        }
        .item-3 {
          width: 245px;
        }
        .item-4 {
          width: 245px;
        }
        .item-5 {
          width: 245px;
        }
        .item-6 {
          width: 698px;
        }
        .item-7 {
          height: 75px;
          margin-left: 80px;
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
            }

            .text {
              line-height: 0;
            }
          }
          .des {
            position: absolute;
            width: 100%;
            top: 113%;
            left: 50%;
            font-size: 12px;
            color: #8c939d;
            transform: translate(-50%, -50%);
            line-height: normal;
            text-align: center;
          }
        }
        .item-8 {
          width: 240px;
          margin-right: 80px;
        }
        .item-9 {
          width: 240px;
          margin-right: 400px;
        }
        .item-10 {
          width: 240px;
        }
      }
    }
  }
  .module-b {
    margin-bottom: 10px;
    .title,
    .addPro {
      display: inline-block;
      margin-right: 30px;
    }
  }
  .module-c {
    overflow: auto;
    padding-top: 35px;
    position: relative;
  }
  .module-d {
    display: flex;
    justify-content: center;
    .el-button + .el-button {
      margin-left: 40px;
    }
  }
}
</style>
