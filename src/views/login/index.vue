
<template>
  <div style="height: 1000px;position: relative;">
    <div class="login-container">
      <el-form
        ref="loginForm"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        auto-complete="on"
        label-position="left"
      >
        <div class="title-container">
          <h3 class="title">验证码登录</h3>
          <div class="sweep-login">
            <el-button class="thirdparty-button" type="warning" @click="showDialog=true">微信扫码登录</el-button>
            <svg-icon icon-class="qr-code" class-name="qr-code-icon" />
            <div class="qr-code-box" />
          </div>
        </div>

        <el-form-item prop="手机号">
          <span class="svg-container">
            <svg-icon icon-class="user" />
          </span>
          <el-input
            v-model.trim="loginForm.手机号"
            placeholder="手机号"
            name="手机号"
            type="number"
            auto-complete="on"
            oninput="if(value.length > 11) value = value.slice(0,11)"
          />
        </el-form-item>

        <!-- 验证码输入 -->
        <el-form-item prop="验证码">
          <span class="svg-container">
            <svg-icon icon-class="list" />
          </span>
          <el-input v-model.trim="loginForm.验证码" placeholder="手机验证码" name="验证码" type="number" />
          <span
            :style="{cursor:showNumber?'default':'pointer'}"
            class="show-pwd"
            @click="handlePhoneCode"
          >
            <span v-if="showNumber">{{ number }}</span>
            <el-button v-else type="primary" round>发送验证码</el-button>
          </span>
        </el-form-item>

        <el-card v-if="showSelectBox" class="box-card">
          <div slot="header" class="clearfix">
            <span>选择您要登录的企业</span>
          </div>
          <div class="list">
            <el-radio-group v-model.trim="selectEnterprise">
              <el-radio
                v-for="item in options"
                :key="item.value"
                class="radio"
                :label="item.value"
              >{{ item.label }}</el-radio>
            </el-radio-group>
          </div>

        </el-card>

        <el-button
          :loading="loading"
          type="primary"
          style="width:100%;margin-bottom:30px;"
          :disabled="whetherLoginIsAllowed"
          @click.native.prevent="handleLogin"
        >登录</el-button>
      </el-form>
    </div>
    <el-dialog :visible.sync="showDialog" center width="600px">
      <div class="title-box-top">微信扫码登录，更安全</div>
      <div class="qrcode-box">
        <el-card v-if="isTheQrCodeValid" style="width:250px;">
          <img class="qrcode" :src="qrcode_url" alt>
        </el-card>
        <el-card v-else style="width:250px;">
          <div class="main-code" @click="failureTreatmentOfQrCode">
            <div class="public-code">
              <div class="app-wrap">
                <div class="app-fail">
                  <span class="fail-mark" />
                  <svg-icon icon-class="shuaxin" class-name="app-code-icon" />
                  <span class="app-title">二维码失效 点击重试</span>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </div>
      <div class="title-box-bottom">
        <svg-icon icon-class="saoyisao" class-name="card-panel-icon" />
        <div class="des-box">
          <div class="des-a">打开手机微信</div>
          <div class="des-b">扫一扫登录</div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { 验证手机号, 验证验证码, isValidPhone } from '@/utils/validate'
import {
  request_verification_message,
  check_verification_message,
  generate_qrcode_info_by_login,
  retrieve_login_token_by_qrcode_token
} from '@/api/loginAndLogoutTool'
export default {
  name: 'Login',
  components: {},
  data() {
    return {
      // 注册表单数据
      loginForm: {
        手机号: '',
        验证码: null
      },
      loginRules: {
        手机号: [{ required: true, trigger: 'blur', validator: 验证手机号 }],
        验证码: [{ required: true, trigger: 'blur', validator: 验证验证码 }]
      },
      loading: false,
      showNumber: false, // 是否正在倒计时
      number: 60, // 倒计时数字
      // 企业列表
      options: [],
      // 选中的企业id
      selectEnterprise: '',
      // 是否激活登录按钮
      whetherLoginIsAllowed: true,

      showDialog: false,
      qrcode_token: '',
      qrcode_url: '',
      timer: null,
      // 二维码是否有效
      isTheQrCodeValid: true
    }
  },
  computed: {
    showSelectBox() {
      if (this.options.length > 0) return true
      else return false
    }
  },
  watch: {
    selectEnterprise: function(newVal, oldVal) {
      console.log('选中的企业id：' + newVal)
      var index = this.options.findIndex(item => {
        return item.value === newVal
      })
      this.$store
        .dispatch('BindEnterpriseInfo', this.options[index])
        .then(res => {
          this.whetherLoginIsAllowed = false
        })
        // eslint-disable-next-line handle-callback-err
        .catch(error => {
          this.whetherLoginIsAllowed = true
        })
    },
    showDialog: async function(newVal, oldVal) {
      const that = this
      if (newVal) {
        clearInterval(that.timer)
        var res = await generate_qrcode_info_by_login({})
        this.qrcode_token = res.data.qrcode_token
        this.qrcode_url = res.data.qrcode_url
        this.isTheQrCodeValid = true
        var timer = setInterval(async() => {
          var paramter = {
            qrcode_token: that.qrcode_token
          }
          var res = await retrieve_login_token_by_qrcode_token(paramter)
          if (res && res.status === 'OK') {
            clearInterval(that.timer)
            var login_token = res.data.login_token
            var 对应企业unique_id列表 = res.data['对应企业unique_id列表']
            var 对应企业名称列表 = res.data['对应企业名称列表']
            // 1.设置token
            that.$store.dispatch('setToken', login_token)
            // 2.绑定企业
            that.$store
              .dispatch('BindEnterpriseInfo', {
                value: 对应企业unique_id列表[0],
                label: 对应企业名称列表[0]
              })
              .then(res => {
                // 3.跳转dashboard 首页
                that.$router.push({ path: '/dashboard' })
              })
          } else if (res && res.status === 'LOGIN_QRCODE_EXPIRED') {
            // 登录二维码过期请刷新重试
            clearInterval(that.timer)
            that.isTheQrCodeValid = false
          }
        }, 2000)
        that.timer = timer
      } else {
        clearInterval(that.timer)
        that.isTheQrCodeValid = true
      }
    },
    'loginForm.验证码': function(newVal, oldVal) {
      if (String(newVal).length === 4 && isValidPhone(String(this.loginForm.手机号))) {
        this.handleGetEnterpriseList()
      }
    }
  },

  created() {
    var phoneNumberMemory = this.$store.getters.phoneNumberMemory
    if (phoneNumberMemory) {
      this.loginForm['手机号'] = String(phoneNumberMemory)
    }
  },
  destroyed() {},
  methods: {
    // 验证码请求
    async handlePhoneCode() {
      if (this.showNumber || !isValidPhone(this.loginForm.手机号)) {
        return
      }
      var paramter = {
        手机号: this.loginForm.手机号
      }
      var res = await request_verification_message(paramter)
      this.$message({
        type: 'success',
        message: res.msg
      })
      this.showNumber = true
      const timer = setInterval(() => {
        if (this.number === 0) {
          this.showNumber = false
          clearInterval(timer)
        } else {
          this.number -= 1
        }
      }, 1000)
    },
    // 获取企业列表（）
    handleGetEnterpriseList() {
      this.$refs.loginForm.validate(async valid => {
        if (valid) {
          this.loading = true
          setTimeout(() => {
            this.loading = false
          }, 3000)
          // 1.先验证from表单
          await check_verification_message(this.loginForm)
          // 2.生成token以及企业列表
          await this.$store.dispatch('GenerateToken', this.loginForm)
          this.loading = false
          this.options = this.$store.getters['对应企业名称列表'].map(
            (item, index) => {
              return {
                value: this.$store.getters['对应企业unique_id列表'][index],
                label: item
              }
            }
          )
          this.selectEnterprise = this.options[0].value || ''
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    // 登录
    async handleLogin() {
      this.loading = true
      setTimeout(() => {
        if (this.$router.history.current.path === '/login') {
          this.$message({
            type: 'warning',
            message: '当前网络状态不好，请刷新页面重新登录'
          })
        }
      }, 8000)
      // 登录手机号进行记忆缓存
      await this.$store.dispatch('cacheThePhoneNumber', this.loginForm)
      // 跳转dashboard 首页
      this.$router.push({ path: '/dashboard' })
    },
    // 二维码失效处理
    async failureTreatmentOfQrCode() {
      const that = this
      clearInterval(that.timer)
      var res = await generate_qrcode_info_by_login({})
      this.qrcode_token = res.data.qrcode_token
      this.qrcode_url = res.data.qrcode_url
      this.isTheQrCodeValid = true
      var timer = setInterval(async() => {
        var paramter = {
          qrcode_token: that.qrcode_token
        }
        var res = await retrieve_login_token_by_qrcode_token(paramter)
        if (res && res.status === 'OK') {
          clearInterval(that.timer)
          var login_token = res.data.login_token
          var 对应企业unique_id列表 = res.data['对应企业unique_id列表']
          var 对应企业名称列表 = res.data['对应企业名称列表']
          // 1.设置token
          that.$store.dispatch('setToken', login_token)
          // 2.绑定企业
          that.$store
            .dispatch('BindEnterpriseInfo', {
              value: 对应企业unique_id列表[0],
              label: 对应企业名称列表[0]
            })
            .then(res => {
              // 3.跳转dashboard 首页
              that.$router.push({ path: '/dashboard' })
            })
        } else if (res && res.status === 'LOGIN_QRCODE_EXPIRED') {
          // 登录二维码过期请刷新重试
          clearInterval(that.timer)
          that.isTheQrCodeValid = false
        }
      }, 2000)
      that.timer = timer
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss">
/* 修复input 背景不协调 和光标变色 */
/* Detail see https://github.com/PanJiaChen/vue-element-admin/pull/s927 */

$bg: #283443;
$light_gray: #eee;
$cursor: #fff;

@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  .login-container .el-input input {
    color: $cursor;
    &::first-line {
      color: $light_gray;
    }
  }
}

/* reset element-ui css */
.login-container {
  .el-input {
    display: inline-block;
    height: 47px;
    width: 85%;
    input {
      background: transparent;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: $light_gray;
      height: 47px;
      caret-color: $cursor;
      &:-webkit-autofill {
        -webkit-box-shadow: 0 0 0px 1000px $bg inset !important;
        -webkit-text-fill-color: $cursor !important;
      }
    }
  }
  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    color: #454545;
  }
}
</style>

<style rel="stylesheet/scss" lang="scss">
$bg: #2d3a4b;
$dark_gray: #889aa4;
$light_gray: #eee;

.login-container {
  position: absolute;
  height: 100%;
  width: 100%;
  background-color: $bg;
  .login-form {
    position: absolute;
    left: 0;
    right: 0;
    width: 520px;
    max-width: 100%;
    padding: 35px 35px 15px 35px;
    margin: 120px auto;
  }
  .tips {
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;
    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }
  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }
  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }

  .box-card {
    .radio {
      padding: 5px 0;
    }
    .list{
      max-height: 250px;
      overflow: auto;
    }
  }
}
</style>

<style>
.login-container .el-button + .el-button {
  margin-left: 0px;
}
.title-container {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.title-container .title {
  font-size: 26px;
  color: #eee;
  font-weight: bold;
}
.title-container .sweep-login {
  display: flex;
  align-items: center;
}

.title-container .sweep-login .thirdparty-button {
}

.title-container .sweep-login .qr-code-icon {
  font-size: 60px;
  color: #f52b00;
  position: relative;
}
.title-container .sweep-login .qr-code-box {
  position: absolute;
  background: linear-gradient(225deg, transparent 42px, #2d3a4b 0);
  width: 60px;
  height: 60px;
  right: 0;
}
.title-box-top {
  font-weight: 700;
  color: #000;
  font-size: 24px;
  margin-bottom: 50px;
  text-align: center;
}
.qrcode-box {
  display: flex;
  justify-content: center;
  margin-bottom: 50px;
}
.qrcode-box .el-card__body {
  display: flex;
  justify-content: center;
}
.qrcode-box .qrcode {
  width: 200px;
  height: 200px;
}

.qrcode-box .main-code {
  width: 172px;
  margin: 0 auto;
}
.qrcode-box .main-code .public-code {
  width: 172px;
  height: 172px;
}
.qrcode-box .main-code .app-wrap {
    position: relative;
    border: 1px solid #e2e2e2;
    height: 100%;
}
.qrcode-box .main-code .app-wrap .app-fail {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
}
.qrcode-box .main-code .app-wrap .app-fail .fail-mark {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,.8);
    font-size: 14px;
    color: #fff;
}
.qrcode-box .main-code .app-wrap .app-fail .app-code-icon {
    display: inline-block;
    position: absolute;
    z-index: 10;
    left: 50%;
    top: 45px;
    transform: translateX(-50%);
    cursor: pointer;
    font-size: 60px;
    color: #fff;
}
.qrcode-box .main-code .app-wrap .app-fail .app-title {
    position: absolute;
    display: block;
    width: 100%;
    bottom: 19px;
    text-align: center;
    font-size: 14px;
    color: #fff;
    z-index: 10;
    cursor: pointer;

}

.title-box-bottom {
  display: flex;
  justify-content: center;
  align-items: center;
}
.title-box-bottom .card-panel-icon {
  color: rgb(255, 58, 0);
  font-size: 30px;
  font-weight: 700;
  margin-right: 20px;
}
.title-box-bottom .des-box {
}
.title-box-bottom .des-box .des-a {
  width: 100%;
  color: #a09999;
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 4px;
}
.title-box-bottom .des-box .des-b {
  color: #a09999;
  font-size: 18px;
  font-weight: 700;
}
</style>
