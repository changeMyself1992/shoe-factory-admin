<template>
  <div class="add-user-dialog-box">
    <el-dialog :visible.sync="show" :title="calculateTitle" center width="1000px">
      <el-form ref="userForm" :model="form" label-position="left" :rules="userFormRules">
        <!-- 基本信息 -->
        <div class="base-info">
          <div class="header">
            <b>基本信息</b>
          </div>

          <div class="info-box">
            <el-form-item class="item-1" prop="个人信息.姓名" label="姓名:" label-width="60px">
              <el-input v-model.trim="form.个人信息.姓名" placeholder="姓名" />
            </el-form-item>

            <el-form-item class="item-2" prop="个人信息.性别" label="性别:" label-width="60px">
              <el-select v-model.trim="form.个人信息.性别" placeholder="性别">
                <el-option
                  v-for="item in genderOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>

            <el-form-item class="item-3" prop="个人信息.出生日期" label="出生日期:" label-width="90px">
              <el-date-picker v-model.trim="form.个人信息.出生日期" type="date" placeholder="出生日期" />
            </el-form-item>

            <el-form-item class="item-4" prop="管理角色" label="管理角色:" label-width="90px">
              <el-select
                v-model.trim="form.管理角色"
                placeholder="请选择"
                :change="onSelectedManagementRole(form.管理角色)"
              >
                <el-option
                  v-for="item in roleOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>

            <el-form-item class="item-5" prop="绑定手机号" label="绑定手机号:" label-width="100px">
              <el-input
                v-model.trim="form.绑定手机号"
                :disabled="editUserMode"
                placeholder="绑定手机号"
                type="number"
                oninput="if(value.length > 11) value = value.slice(0,11)"
              />
            </el-form-item>

            <el-form-item class="item-6" prop="个人信息.身份证号" label="身份证号:" label-width="90px">
              <el-input
                v-model.trim="form.个人信息.身份证号"
                placeholder="身份证号"
                @blur="onIdNumberInputCompleted(form.个人信息.身份证号)"
              />
            </el-form-item>

            <el-form-item class="item-8" prop="工作状态" label="工作状态:" label-width="90px">
              <el-radio-group v-model.trim="form['工作状态']">
                <el-radio label="在职">在职</el-radio>
                <el-radio label="离职">离职</el-radio>
                <el-radio label="请假">请假</el-radio>
                <el-radio label="开除">开除</el-radio>
                <el-radio label="待确认">待确认</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item class="item-9" prop="负责工序" label="负责工序:" label-width="90px">
              <el-checkbox-group v-model.trim="form.负责工序">
                <el-checkbox
                  v-for="process in 全部的工序"
                  :key="process.工序名称"
                  :label="process.工序名称"
                >{{ process.工序名称 }}</el-checkbox>
              </el-checkbox-group>
            </el-form-item>

            <el-form-item class="item-7" prop="个人信息.地址" label="地址:" label-width="70px">
              <el-input
                v-model="form.个人信息.地址"
                type="textarea"
                :autosize="{ minRows: 2, maxRows: 4}"
                placeholder="请输入地址"
              />
            </el-form-item>

            <el-form-item class="item-10" prop="个人信息.身份证正面照片">
              <el-upload
                class="upload-demo"
                :file-list="frontFileList"
                :data="{'login_token':token}"
                :multiple="false"
                :action="fileUploadUrl"
                :on-preview="handlePreview"
                :on-remove="handleIDPositiveRemove"
                :on-success="handleIDPositiveSuccess"
                :on-error="handleUploadError"
                :before-upload="beforeUpload"
                list-type="picture"
              >
                <el-button
                  size="small"
                  type="primary"
                  :loading="loading"
                >{{ uploadBtn_1 }}</el-button>
                <div slot="tip" class="el-upload__tip">请上传jpg/jpeg/png文件，且不超过2mb</div>
              </el-upload>
            </el-form-item>

            <el-form-item class="item-11" prop="个人信息.身份证反面照片">
              <el-upload
                class="upload-demo"
                :file-list="behindFileList"
                :multiple="false"
                :action="fileUploadUrl"
                :data="{'login_token':token}"
                :on-preview="handlePreview"
                :on-remove="handleIDReverseRemove"
                :on-success="handleIDReverseSuccess"
                :on-error="handleUploadError"
                :before-upload="beforeUpload"
                list-type="picture"
              >
                <el-button
                  size="small"
                  type="primary"
                  :loading="loading"
                >{{ uploadBtn_2 }}</el-button>
                <div slot="tip" class="el-upload__tip">请上传jpg/jpeg/png文件，且不超过2mb</div>
              </el-upload>
            </el-form-item>
          </div>
        </div>

        <!-- 银行卡信息 -->
        <div class="box-card">
          <div class="header">
            <b>银行卡信息</b>
          </div>

          <div class="info-box">
            <el-form-item class="item-1" prop="银行卡信息.账户开户姓名" label="账户开户姓名:" label-width="120px">
              <el-input v-model.trim="form.银行卡信息.账户开户姓名" placeholder="账户开户姓名" />
            </el-form-item>

            <el-form-item class="item-2" prop="银行卡信息.开户行" label="开户行:" label-width="80px">
              <el-input v-model.trim="form.银行卡信息.开户行" placeholder="开户行" />
            </el-form-item>

            <el-form-item class="item-3" prop="银行卡信息.银行账号" label="银行账号:" label-width="90px">
              <el-input v-model.trim="form.银行卡信息.银行账号" placeholder="银行账号" @input="validateNum" />
            </el-form-item>

            <el-form-item class="item-4" prop="银行卡信息.银行卡照片">
              <el-upload
                class="upload-demo"
                bank-file-list
                :file-list="bankFileList"
                :multiple="false"
                :action="fileUploadUrl"
                :data="{'login_token':token}"
                :on-remove="handleBankCardPhotoRemove"
                :on-success="handleBankCardPhotoSuccess"
                :on-error="handleUploadError"
                :before-upload="beforeUpload"
                :on-preview="handlePreview"
                list-type="picture"
              >
                <el-button
                  size="small"
                  type="primary"
                  :loading="loading"
                >{{ uploadBtn_3 }}</el-button>
                <div slot="tip" class="el-upload__tip">请上传jpg/jpeg/png文件，且不超过2mb</div>
              </el-upload>
            </el-form-item>
          </div>
        </div>

        <!--按钮组-->
        <div class="btn-box">
          <el-button v-if="!editUserMode" type @click="initializeData">清空表单</el-button>
          <el-button v-if="!editUserMode" type="primary" @click="onSubmit">立即创建用户</el-button>
          <el-button v-if="editUserMode" type="primary" @click="onSubmit">修改用户信息</el-button>
        </div>
      </el-form>
    </el-dialog>

    <el-dialog :visible.sync="imageDetailsDialogVisible">
      <img width="100%" :src="dialogImageUrl" alt="">
    </el-dialog>
  </div>
</template>

<script>
import { parseTime, isEmpty, deepClone, beforeUploadIcon } from '@/utils'
import { mapGetters } from 'vuex'
import {
  验证手机号,
  验证管理角色,
  验证姓名,
  验证性别,
  验证工作状态,
  验证负责工序,
  验证身份证号,
  validateIdNumber,
  验证地址,
  验证账户开户姓名,
  验证开户行,
  验证银行账号,
  验证银行卡照片
} from '@/utils/validate'
import { filter_role_authority } from '@/api/personnelAndAuthorityManagement'
import { filter_process } from '@/api/maintenanceOfProcessPartsOfProductLibrary'
import {
  get_user_by_id,
  add_user,
  edit_user_by_id
} from '@/api/personnelAndAuthorityManagement'
export default {
  props: {
    dialogVisible: Boolean,
    onClose: {
      required: true,
      validator: function(value) {
        return true
      }
    },
    editUserMode: Boolean,
    // eslint-disable-next-line vue/require-default-prop
    editUserUniqueId: String
  },
  data() {
    return {
      form: {},
      userFormRules: {
        绑定手机号: [
          { required: true, trigger: 'blur', validator: 验证手机号 }
        ],
        管理角色: [{ required: true, validator: 验证管理角色 }],
        工作状态: [
          { required: true, validator: 验证工作状态 }
        ],
        负责工序: [
          { required: true, validator: 验证负责工序 }
        ],
        '个人信息.姓名': [
          { required: true, trigger: 'blur', validator: 验证姓名 }
        ],
        '个人信息.性别': [{ required: true, validator: 验证性别 }],
        '个人信息.身份证号': [{ trigger: 'blur', validator: 验证身份证号 }],
        '个人信息.地址': [{ trigger: 'blur', validator: 验证地址 }],
        '银行卡信息.账户开户姓名': [
          { trigger: 'blur', validator: 验证账户开户姓名 }
        ],
        '个人信息.身份证反面照片': [{ validator: 验证银行卡照片 }],
        '个人信息.身份证正面照片': [{ validator: 验证银行卡照片 }],
        '银行卡信息.开户行': [{ trigger: 'blur', validator: 验证开户行 }],
        '银行卡信息.银行账号': [{ trigger: 'blur', validator: 验证银行账号 }],
        '银行卡信息.银行卡照片': [{ validator: 验证银行卡照片 }]
      },
      // 性别选项
      genderOptions: [
        {
          value: '男',
          label: '男'
        },
        {
          value: '女',
          label: '女'
        }
      ],
      // 角色选项
      roleOptions: [],
      show: false,
      // 是否需要刷新父组件
      isRefresh: false,
      // 身份证正面
      frontFileList: [
        {
          // name: '',
          // url: ''
        }
      ],
      // 身份证正面
      behindFileList: [],
      // 银行卡照片
      bankFileList: [],
      loading: false,
      全部的工序: [],

      dialogImageUrl: '',
      imageDetailsDialogVisible: false
    }
  },
  computed: {
    ...mapGetters(['fileUploadUrl', 'token']),
    calculateTitle: function() {
      if (this.editUserMode) return '编辑员工'
      else return '添加员工'
    },
    uploadBtn_1: function() {
      if (isEmpty(this.form.个人信息.身份证正面照片)) {
        return '点击上传身份证正面'
      } else {
        return '点击替换身份证正面'
      }
    },
    uploadBtn_2: function() {
      if (isEmpty(this.form.个人信息.身份证反面照片)) {
        return '点击上传身份证反面'
      } else {
        return '点击替换身份证反面'
      }
    },
    uploadBtn_3: function() {
      if (isEmpty(this.form.银行卡信息.银行卡照片)) {
        return '点击上传银行卡照片'
      } else {
        return '点击替换银行卡照片'
      }
    }
  },
  watch: {
    dialogVisible: function(newVal, oldVal) {
      this.show = newVal
      // 如果是打开的过程
      if (newVal && !oldVal) {
        this.queryAllAuthority()
        // 如果是编辑模式，需要获取相关的用户信息
        if (this.editUserMode) {
          this.queryUserInfoDetails()
        }
      }
    },
    show: function(newVal, oldVal) {
      if (!newVal) {
        this.onClose(this.show, this.isRefresh)
        this.initializeData()
      }
    }
  },
  async created() {
    this.initializeData()
    var res = await filter_process({ login_token: this.$store.getters.token })
    this.全部的工序 = res.data
  },
  methods: {
    // 提交新用户的表单信息
    // 142322199209204038
    onSubmit(formName) {
      if (this.form.个人信息.出生日期) {
        this.form.个人信息.出生日期 = parseTime(
          new Date(this.form.个人信息.出生日期),
          '{y}-{m}-{d}'
        )
      }
      this.$refs.userForm.validate(async valid => {
        if (valid) {
          // 如果是添加人员信息模式，用相应API
          if (!this.editUserMode) {
            var post_data_a = {
              login_token: this.$store.getters.token,
              data: this.form
            }
            const response = await add_user(post_data_a)
            this.$message({
              type: 'success',
              message: response.msg
            })
            this.initializeData()
            this.show = false
            this.isRefresh = true
          } else {
            // 如果是修改人员信息模式，用相应API
            var post_data_b = {
              login_token: this.$store.getters.token,
              unique_id: this.editUserUniqueId,
              update_data: this.form
            }
            const response = await edit_user_by_id(post_data_b)
            this.$message({
              type: 'success',
              message: response.msg
            })
            this.initializeData()
            this.show = false
            this.isRefresh = true
          }
        } else {
          this.$message({
            type: 'warning',
            message: '请完善表单信息'
          })
          return false
        }
      })
    },
    // 清空表格信息
    initializeData() {
      this.form = deepClone(this.$store.getters.空员工结构)
      this.isRefresh = false
      // 身份证正面
      this.frontFileList = []
      // 身份证正面
      this.behindFileList = []
      // 银行卡照片
      this.bankFileList = []
    },
    // 获取所有角色权限
    async queryAllAuthority() {
      var post_data = {
        login_token: this.$store.getters.token
      }
      const response = await filter_role_authority(post_data)
      var role_items = []
      for (var i = 0; i < response.data.length; i++) {
        var item = response.data[i]
        // 添加都表格数据中
        role_items.push({
          value: item['管理角色'],
          label: item['管理角色']
        })
      }
      this.roleOptions = role_items
    },
    // 获取指定用户详细信息
    async queryUserInfoDetails() {
      var post_data = {
        login_token: this.$store.getters.token,
        unique_id: this.editUserUniqueId
      }
      const response = await get_user_by_id(post_data)
      this.form = response.data
      if (!isEmpty(this.form.个人信息.身份证正面照片)) {
        this.frontFileList = [
          {
            name: 'front.jpg',
            url: this.form.个人信息.身份证正面照片
          }
        ]
      }
      if (!isEmpty(this.form.个人信息.身份证反面照片)) {
        this.behindFileList = [
          {
            name: 'behind.jpg',
            url: this.form.个人信息.身份证反面照片
          }
        ]
      }
      if (!isEmpty(this.form.银行卡信息.银行卡照片)) {
        this.bankFileList = [
          {
            name: 'bankCardPhoto.jpg',
            url: this.form.银行卡信息.银行卡照片
          }
        ]
      }
    },
    // 银行账号 4位4位隔开
    validateNum(item) {
      var value = item
        .replace(/\s/g, '')
        .replace(/[^\d]/g, '')
        .replace(/(\d{4})(?=\d)/g, '$1 ')
      this.form.银行卡信息.银行账号 = value
    },
    // 身份证输入完成的时候 把日期取出来
    // 142322199209204038
    // 130503670401001
    onIdNumberInputCompleted(iIdNo = this.form.个人信息.身份证号) {
      var tmpStr = ''
      if (!validateIdNumber(iIdNo)) return
      var date = null
      if (iIdNo.length === 15) {
        tmpStr = iIdNo.substring(6, 12)
        tmpStr = '19' + tmpStr
        tmpStr =
          tmpStr.substring(0, 4) +
          '-' +
          tmpStr.substring(4, 6) +
          '-' +
          tmpStr.substring(6)
        date = new Date(tmpStr)
        if (isEmpty(date.getTime())) {
          // 代表解析出来的是 Invalid Date
          this.form.个人信息.出生日期 = ''
        } else {
          // 代表解析出来的是正确的日期对象
          this.form.个人信息.出生日期 = date
        }
      } else {
        tmpStr = iIdNo.substring(6, 14)
        tmpStr =
          tmpStr.substring(0, 4) +
          '-' +
          tmpStr.substring(4, 6) +
          '-' +
          tmpStr.substring(6)
        date = new Date(tmpStr)
        if (isEmpty(date.getTime())) {
          // 代表解析出来的是 Invalid Date
          this.form.个人信息.出生日期 = ''
        } else {
          // 代表解析出来的是正确的日期对象
          this.form.个人信息.出生日期 = date
        }
      }
    },
    // 当选中管理角色
    onSelectedManagementRole(role) {
      // console.log(role)
      // 如果role不是员工，那么
    },

    // 上传之前调用
    beforeUpload(file) {
      if (beforeUploadIcon(file)) {
        this.loading = true
        return true
      } else {
        return false
      }
    },

    // 身份证正面删除的时候
    handleIDPositiveRemove() {
      this.form['个人信息']['身份证正面照片'] = ''
      this.frontFileList = []
    },
    // 查看图片详情的时候
    handlePreview(file) {
      this.dialogImageUrl = file.url
      this.imageDetailsDialogVisible = true
    },
    // 身份证正面上传成功的时候
    handleIDPositiveSuccess(res, file) {
      this.loading = false
      console.log(res)
      if (res.status === 'OK') {
        this.form['个人信息']['身份证正面照片'] = res.url
        this.frontFileList = [
          {
            name: 'front.jpg',
            url: res.url
          }
        ]
      } else if (res.status === 'TOKEN_FAIL') {
        this.form['个人信息']['身份证正面照片'] = ''
        this.frontFileList = []
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
        this.form['个人信息']['身份证正面照片'] = ''
        this.frontFileList = []
        this.$message({
          type: 'error',
          message: res.msg
        })
      }
    },
    // 身份证反面删除的时候
    handleIDReverseRemove() {
      this.form['个人信息']['身份证反面照片'] = ''
      this.behindFileList = []
    },
    // 身份证反面上传成功的时候
    handleIDReverseSuccess(res, file) {
      this.loading = false
      console.log(res)
      if (res.status === 'OK') {
        this.form['个人信息']['身份证反面照片'] = res.url
        this.behindFileList = [
          {
            name: 'behind.jpg',
            url: res.url
          }
        ]
      } else if (res.status === 'TOKEN_FAIL') {
        this.form['个人信息']['身份证反面照片'] = ''
        this.behindFileList = []
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
        this.form['个人信息']['身份证反面照片'] = ''
        this.behindFileList = []
        this.$message({
          type: 'error',
          message: res.msg
        })
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

    handleBankCardPhotoRemove() {
      this.form['银行卡信息']['银行卡照片'] = ''
      this.bankFileList = []
    },
    // 银行卡上传成功的时候
    handleBankCardPhotoSuccess(res, file) {
      this.loading = false
      if (res.status === 'OK') {
        this.form['银行卡信息']['银行卡照片'] = res.url
        this.bankFileList = [
          {
            name: 'bankCardPhoto.jpg',
            url: res.url
          }
        ]
      } else if (res.status === 'TOKEN_FAIL') {
        this.form['银行卡信息']['银行卡照片'] = ''
        this.bankFileList = []
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
        this.form['银行卡信息']['银行卡照片'] = ''
        this.bankFileList = []
        this.$message({
          type: 'error',
          message: res.msg
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.add-user-dialog-box {
  .base-info {
    margin-bottom: 30px;
    border: 1px solid #bbbbbb;
    .header {
      padding: 0 10px;
      height: 40px;
      line-height: 40px;
      border-bottom: 1px solid #bbbbbb;
    }
    .info-box {
      padding: 20px 10px 0 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      .item-1 {
        width: 140px;
      }
      .item-2 {
        width: 200px;
      }
      .item-3 {
        width: 240px;
      }
      .item-4 {
        width: 240px;
      }
      .item-5 {
        width: 40%;
      }
      .item-8 {
        width: 60%;
      }
      .item-9 {
        width: 100%;
      }
      .item-6 {
        width: 40%;
      }
      .item-7 {
        width: 100%;
      }
      .item-10 {
        width: 50%;
        padding-right: 20px;
      }
      .item-11 {
        padding-left: 20px;
        width: 50%;
      }
    }
  }
  .box-card {
    margin-bottom: 30px;
    border: 1px solid #bbbbbb;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    .header {
      width: 100%;
      padding: 0 10px;
      height: 40px;
      line-height: 40px;
      border-bottom: 1px solid #bbbbbb;
    }
    .info-box {
      padding: 20px 10px 0 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      .item-4 {
        width: 50%;
        padding-right: 20px;
      }
    }
  }
  .btn-box {
    display: flex;
    justify-content: center;
  }
}
.avatar-uploader:hover {
  border-color: #409eff;
}
</style>
