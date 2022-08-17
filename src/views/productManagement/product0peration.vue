<template>
  <div class="add-product">
    <el-form ref="form" :model="form" label-position="left" :rules="formRules">
      <!--产品详细信息-->
      <div class="module-a">
        <div class="header">
          {{ generateProductInformationTitles }}
          <!--不是详情模式需要展示 添加部位和物料信息到产品 按钮-->
          <span v-if="form.hasOwnProperty('成本估算')">
            <b>产品成本估算：{{ form['成本估算'] }}</b>
          </span>
        </div>

        <div class="info-box">
          <!-- 产品动态标签信息 -->
          <div v-loading="whetherLabelInputProcessingIsTakingPlace" class="row-1">
            <el-form-item
              v-for="(value,tag_name) in form.tags"
              :key="tag_name"
              class="item-1"
              :label="tag_name"
            >
              <el-autocomplete
                v-model.trim="form.tags[tag_name]"
                class="inline-input"
                :fetch-suggestions="((queryString, callback)=>tagQueryAutoCompleteSearch(queryString,callback,tag_name))"
                placeholder="自动补全"
                :disabled="(mode_setting.detail || mode_setting.edit)"
                @blur="handleBlur"
              />
            </el-form-item>
          </div>

          <!-- 产品基本属性信息 -->

          <div class="row-2">
            <el-form-item class="item-1" prop="产品编号" label="产品编号:" label-width="85px">
              <el-input v-model.trim="form.产品编号" disabled placeholder="自动生成" />
            </el-form-item>
          </div>

          <el-form-item class="item-4" prop="备注" label="产品备注:" label-width="85px">
            <el-input
              v-model="form.备注"
              :disabled="mode_setting.detail"
              type="textarea"
              :rows="3"
              placeholder="暂无备注"
            />
          </el-form-item>

          <el-form-item class="item-5" prop="产品图片列表">
            <el-upload
              v-loading="loading"
              :class="mode_setting.detail?'avatar-disabled':''"
              :action="fileUploadUrl"
              list-type="picture-card"
              :limit="1"
              :data="{'login_token':token}"
              :on-success="handleAvatarSuccess"
              :on-error="handleAvatarError"
              :before-upload="beforeAvatarUpload"
              :on-remove="handleRemove"
              :on-preview="handlePictureCardPreview"
              :disabled="mode_setting.detail"
              :file-list="fileList"
            >
              <i slot="default" class="el-icon-plus" />
            </el-upload>
            <div class="des">
              <span>上传产品图片,支持jpg/jpeg/png格式</span>
            </div>
            <el-dialog :visible.sync="dialogVisible">
              <img width="100%" :src="dialogImageUrl" alt="">
            </el-dialog>

          </el-form-item>

          <el-form-item id="componentParent" class="item-6" prop="部位详情" label="产品包含的部位和物料信息列表：">
            <add-component-material-to-product
              v-if="form.部位详情"
              ref="addComponentMaterialToProduct"
              :parts-list="form.部位详情"
              :mode-components="modeComponents"
              :tags="form.tags"
            />
          </el-form-item>

          <el-form-item class="item-7">
            <el-button
              v-if="mode_setting.add||mode_setting.copy"
              type="primary"
              size="small"
              @click="confirmAddProduct('form')"
            >确认添加产品</el-button>
            <el-button
              v-if="mode_setting.edit"
              type="primary"
              size="small"
              @click="confirmEditProduct('form')"
            >确认修改产品</el-button>
            <el-button type="primary" size="small" @click="cancelOperation">取消操作</el-button>
          </el-form-item>
        </div>
      </div>
    </el-form>
  </div>
</template>

<script>
import addComponentMaterialToProduct from './components/addComponentMaterialToProduct'
import { mapGetters } from 'vuex'
import {
  get_product_by_id,
  product_tags_auto_complete,
  edit_product_by_id,
  add_product,
  filter_product
} from '@/api/maintenanceOfProcessPartsOfProductLibrary'
import {
  generate_year_month_sequence_number
} from '@/api/otherUtilityClasses'
import { deepClone, isEmpty, beforeUploadIcon } from '@/utils'
export default {
  components: { addComponentMaterialToProduct },
  props: [],
  data() {
    const 验证产品编号 = (rule, value, callback) => {
      if (!value) {
        callback(new Error('产品编号是必填的。'))
      } else {
        callback()
      }
    }

    return {
      product_unique_id: null, // 修改时存储unique_id用
      // 依据添加、查看、修改三种不同的模式对页面进行复用, 默认添加产品
      mode_setting: {
        add: true,
        edit: false,
        detail: false,
        copy: false
      },
      modeComponents: 'add',
      original_copy_form: {},
      form: {},
      formRules: {
        产品编号: [{ required: true, trigger: 'blur', validator: 验证产品编号 }]
      },
      loading: false,

      dialogImageUrl: '',
      dialogVisible: false,
      disabled: false,
      fileList: [
        // {
        //   name: 'food.jpeg',
        //   url: '....',
        //   uid: file.uid,
        //   status: 'success'
        // }
      ],
      // 是否正在进行标签输入处理
      whetherLabelInputProcessingIsTakingPlace: false
    }
  },
  computed: {
    ...mapGetters(['fileUploadUrl', 'token', '管理权限']),
    generateProductInformationTitles: function() {
      if (this.mode_setting.add) return '添加新的产品'
      else if (this.mode_setting.detail) return '产品详细信息'
      else if (this.mode_setting.copy) return '复制并添加新的产品'
      else return '修改产品信息'
    }
  },
  watch: {},
  mounted() {
  },
  created() {
    this.setComponentState()
    // 如果是详情模式,编辑模式,复制添加模式, 那么通过传递过来的产品id，去查询产品
    if (
      this.mode_setting.detail ||
      this.mode_setting.edit ||
      this.mode_setting.copy
    ) {
      this.product_unique_id = this.$route.query.unique_id
      this.getProductById()
      // 如果是添加模式 那么定义空的产品结构
    } else if (this.mode_setting.add) {
      this.initializeData()
    }
  },
  methods: {
    initializeData() {
      var 空的产品结构 = deepClone(this.$store.getters.空的产品结构)
      for (const key in 空的产品结构) {
        this.$set(this.form, key, 空的产品结构[key])
      }

      // 获取产品标签
      var tag_names = this.$store.getters.产品的标签
      for (var index in tag_names) {
        this.$set(this.form.tags, tag_names[index], '')
      }
    },
    // 对标签进行自动补全操作
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
      // 调用api
      const response = await product_tags_auto_complete(post_data)
      var suggest_value_list = []
      for (var index in response.data) {
        suggest_value_list.push({
          value: response.data[index]
        })
      }
      callback(suggest_value_list)
    },
    // 确认修改产品
    confirmEditProduct(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          // 1.组合图片列表
          this.form['产品图片列表'] = []
          for (let i = 0; i < this.fileList.length; i++) {
            const element = this.fileList[i]
            this.form['产品图片列表'].push(element.url)
          }
          var post_data = {
            login_token: this.$store.getters.token,
            unique_id: this.product_unique_id,
            update_data: this.form
          }
          // 从addComponentMaterialToProduct组件中 获取部位详情
          var 部位详情 = this.$refs.addComponentMaterialToProduct.returnPartsDetail()
          if (isEmpty(部位详情)) return
          this.form.部位详情 = 部位详情
          // 调用api
          edit_product_by_id(post_data).then(response => {
            this.$message({
              type: 'success',
              message: response.msg
            })
            this.$router.push('/productManagement/ProductDatabase')
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
    /**
     * 添加产品方法
     * continueFlag 继续添加产品的标记,如果为true 那么添加产品成功之后不跳转
     */
    confirmAddProduct(formName, continueFlag) {
      this.$refs[formName].validate(async valid => {
        if (valid) {
          // 1.先查询该产品是否在数据库存在
          var post_data_a = {
            login_token: this.$store.getters.token,
            tags: this.form.tags
          }
          const response_a = await filter_product(post_data_a)
          const data = response_a.data
          // 如果查询结果长度不为0，那么遍历所有的产品 查找是否有和我输入的标签完全一致的产品 如果有 那么退出方法
          if (!isEmpty(response_a.data) && response_a.data.length > 0) {
            for (let i = 0; i < data.length; i++) {
              var element = data[i]
              if (this.$_.isEqual(element.tags, this.form.tags)) {
                this.$message({
                  type: 'warning',
                  message: '该产品已经存在于产品库,请修改产品信息再添加'
                })
                return
              }
            }
          }
          // 2.从addComponentMaterialToProduct组件中 获取部位详情
          var 部位详情 = this.$refs.addComponentMaterialToProduct.returnPartsDetail()
          if (isEmpty(部位详情)) return
          this.form.部位详情 = 部位详情
          // 3.组合图片列表
          this.form['产品图片列表'] = []
          for (let i = 0; i < this.fileList.length; i++) {
            const element = this.fileList[i]
            this.form['产品图片列表'].push(element.url)
          }
          // 4.开始真正的添加产品
          var post_data_b = {
            login_token: this.$store.getters.token,
            data: this.form
          }
          const response_b = await add_product(post_data_b)
          this.$message({
            type: 'success',
            message: response_b.msg
          })
          this.$router.push('/productManagement/ProductDatabase')
        } else {
          this.$message({
            type: 'warning',
            message: '请完善表单信息'
          })
          return false
        }
      })
    },
    // 取消添加产品
    cancelOperation() {
      this.$router.push('/productManagement/ProductDatabase')
    },

    // 上传成功回调
    handleAvatarSuccess(res, file) {
      this.loading = false
      if (res.status === 'OK') {
        this.fileList.push({
          name: file.name,
          uid: file.uid,
          url: res.url,
          status: 'success'
        })
      } else if (res.status === 'TOKEN_FAIL') {
        this.form['产品图片列表'] = []
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
        this.form['产品图片列表'] = []
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
    handleAvatarError(err) {
      this.$message({
        type: 'error',
        message: '上传失败！！！'
      })
      console.error(err)
      this.loading = false
    },
    // 删除产品图
    handleRemove(file) {
      console.log(file)
      var index = this.fileList.findIndex(item => {
        return item.uid === file.uid
      })
      if (index !== -1) {
        this.fileList.splice(index, 1)
      }
    },
    // 查看产品图
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url
      this.dialogVisible = true
    },
    // 下载产品图片
    handleDownload(file) {
      console.log(file)
    },

    // 处理删除产品包含的部位和物料信息
    handleDelete(data) {
      for (var i = 0; i < this.form.部位详情.length; i++) {
        if (
          this.form.部位详情[i]['componentName'] === data['componentName'] &&
          this.form.部位详情[i]['materialNumber'] === data['materialNumber']
        ) {
          this.form.部位详情.splice(i, 1)
        }
      }
    },
    // 根据参数设置被组件不同的模式：添加、详情、修改、复制并添加
    setComponentState() {
      if (this.$route.query.mode === 'detail') {
        this.mode_setting = {
          add: false,
          edit: false,
          detail: true,
          copy: false
        }
        this.modeComponents = 'detail'
      } else if (this.$route.query.mode === 'edit') {
        this.mode_setting = {
          add: false,
          edit: true,
          detail: false,
          copy: false
        }
        this.modeComponents = 'edit'
      } else if (this.$route.query.mode === 'copy') {
        this.mode_setting = {
          add: false,
          edit: false,
          detail: false,
          copy: true
        }
        this.modeComponents = 'copy'
      } else {
        this.mode_setting = {
          add: true,
          edit: false,
          detail: false,
          copy: false
        }
        this.modeComponents = 'add'
      }
    },
    // 通过id获取产品详情
    async getProductById() {
      var post_data = {
        login_token: this.$store.getters.token,
        unique_id: this.product_unique_id
      }
      const response = await get_product_by_id(post_data)
      this.form = response.data

      // 处理产品的成本估算
      if (!this.form.hasOwnProperty('成本估算')) {
        this.form['成本估算'] = '暂无'
      }
      if (this.form['成本估算'] !== '暂无') {
        this.form['成本估算'] =
          String(this.form['成本估算'].toFixed(2)) + '元/对'
      }
      this.fileList = []
      for (let i = 0; i < this.form['产品图片列表'].length; i++) {
        const element = this.form['产品图片列表'][i]
        this.fileList.push({
          name: '图片' + i,
          url: element,
          uid: i,
          status: 'success'
        })
      }

      // 前端用于判断表格是否改写
      if (this.mode_setting.copy) {
        const res_a = await generate_year_month_sequence_number({ login_token: this.$store.getters.token, 流水单分组: 'CPD' })
        var code = res_a.data['流水号']
        this.form.产品编号 = code
        this.original_copy_form = deepClone(this.form)
        delete this.original_copy_form['unique_id']
      }
    },
    // 当标签输入的时候 那么就应该去查询产品了
    handleBlur(product_index) {
      // 需要使用定时器，因为 输入焦点事件快于下拉选中
      setTimeout(async() => {
        this.whetherLabelInputProcessingIsTakingPlace = true
        setTimeout(() => {
          this.whetherLabelInputProcessingIsTakingPlace = false
        }, 800)
        var post_data = {
          login_token: this.$store.getters.token,
          tags: this.form.tags
        }
        const response = await filter_product(post_data)
        var data = response.data
        // 如果查询结果长度 大于0,那么遍历所有的产品 查找是否有和我输入的标签完全一致的产品 如果有那么选中它
        if (!isEmpty(data) || data.length > 0) {
          for (let i = 0; i < data.length; i++) {
            var element = data[i]
            if (this.$_.isEqual(element.tags, this.form.tags)) {
              this.form = element
              return
            }
          }
        }

        // 如果没有找到完全相等的,或者数组长度为0  那么创建新的
        var tags = deepClone(this.form.tags)
        if (this.modeComponents === 'copy') {
          var 部位详情 = deepClone(this.form.部位详情)
        } else {
          部位详情 = deepClone(this.$refs.addComponentMaterialToProduct.部位详情)
        }

        var form = deepClone(this.$store.getters.空的产品结构)
        form.tags = tags
        form.部位详情 = 部位详情
        const res_a = await generate_year_month_sequence_number({ login_token: this.$store.getters.token, 流水单分组: 'CPD' })
        const unique_id = res_a.data['流水号']
        form.unique_id = unique_id
        form.产品编号 = unique_id
        this.form = form
      }, 200)
    }
  }
}
</script>

<style lang="scss" scoped>
.add-product {
  padding: 10px;
  // width: 2500px;
  .module-a {
    margin-bottom: 50px;
    border: 1px solid #bbbbbb;
    .header {
      padding: 0 10px;
      height: 40px;
      border-bottom: 1px solid #bbbbbb;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .info-box {
      padding: 10px 10px 10px 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      position: relative;
      .row-1 {
        width: 100%;
        display: flex;
        justify-content: space-between;
        .item-1 {
          margin-right: 20px;
        }
        .item-1:last-child {
          margin-right: 0px;
        }
      }

      .row-2 {
        width: 100%;
        display: flex;
        justify-content: flex-start;
        .item-1 {
          width: 250px;
        }
      }

      .item-4 {
        width: 500px;
      }

      .item-5 {
        position: absolute;
        top: 110px;
        right: 10px;
      }

      .item-6 {
        width: 100%;
      }
      .item-7 {
        width: 100%;
        display: flex;
        justify-content: center;
      }
    }
  }
}
</style>

<style>
.add-product .des {
  width: 300px;
  text-align: right;
  font-size: 14px;
  color: #8c939d;
  line-height: 20px;
  position: absolute;
  display: inline-block;
  right: 0;
}
</style>

