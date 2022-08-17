<template>
  <div class="navbar">
    <!-- 汉堡菜单 -->
    <hamburger
      :toggle-click="toggleSideBar"
      :is-active="sidebar.opened"
      class="hamburger-container"
    />
    <!-- 面包屑组件 -->
    <breadcrumb class="breadcrumb-container" />
    <div class="right-menu">
      <template v-if="device!=='mobile'">
        <!--通知中心-->
        <div class="right-menu-item">
          <el-tooltip v-if="待审核员工数>0" content="待审核员工" effect="dark" placement="bottom">
            <el-badge :value="待审核员工数" class="item hover-effect">
              <svg-icon icon-class="tianjiayuangong" class-name="badge" @click="onEmployeeToBeAuditedBtnClick" />
            </el-badge>
          </el-tooltip>

          <el-tooltip v-if="待确认送货数>0" content="待确认送货" effect="dark" placement="bottom">
            <el-badge :value="待确认送货数" class="item hover-effect">
              <svg-icon icon-class="songhuo" class-name="badge" @click="onDeliveryBtnToBeConfirmedClick" />
            </el-badge>
          </el-tooltip>

          <el-tooltip v-if="待确认员工计件数>0" content="待确认员工计件" effect="dark" placement="bottom">
            <el-badge :value="待确认员工计件数" class="item hover-effect">
              <svg-icon icon-class="jijian" class-name="badge" @click="onEmployeePieceworkToBeConfirmedClick" />
            </el-badge>
          </el-tooltip>
        </div>

        <!--帮助中心-->
        <div class="right-menu-item hover-effect">
          <el-tag type="warning" @click="useintro">帮助中心</el-tag>
        </div>

        <!--网络状况-->
        <div class="right-menu-item">
          <el-tag type="info" color="#fff">
            <span>网络状况：</span>
            <span v-if="netWorkSpeed<10" style="color:#e6a23c;">差</span>
            <span v-else-if="netWorkSpeed<50" style="color:#e6a23c;">中</span>
            <span v-else-if="netWorkSpeed>=50&&netWorkSpeed<=150" style="color:#409eff;">良</span>
            <span v-else style="color:#42b983;">优</span>
          </el-tag>
        </div>

        <!--版本号和全屏展示组件-->
        <el-tooltip content="全屏显示" effect="dark" placement="bottom">
          <screenfull id="screenfull" class="right-menu-item hover-effect" />
        </el-tooltip>
        <el-tooltip :content="版本号" effect="dark" placement="bottom">
          <size-select id="size-select" class="right-menu-item hover-effect" />
        </el-tooltip>

      </template>

      <!-- 用户信息下拉菜单 -->
      <el-dropdown class="avatar-container right-menu-item hover-effect" trigger="click">
        <div class="avatar-wrapper">
          <img src="@/assets/images/touxiang.png?imageView2/1/w/80/h/80" class="user-avatar">
          <i class="el-icon-caret-bottom" />
        </div>
        <el-dropdown-menu slot="dropdown">
          <router-link to="/">
            <el-dropdown-item>首页</el-dropdown-item>
          </router-link>

          <el-dropdown-item divided>
            <span style="display:block;" @click="logout">退出登录</span>
          </el-dropdown-item>

          <el-dropdown-item divided disabled>
            <span style="display:block;">员工姓名：{{ 个人信息.姓名 }}</span>
          </el-dropdown-item>
          <el-dropdown-item divided disabled>
            <span style="display:block;">角色：{{ 管理角色[0] }}</span>
          </el-dropdown-item>
          <el-dropdown-item divided disabled>
            <span style="display:block;">工厂名：{{ 对应企业名称 }}</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'
import SizeSelect from '@/components/SizeSelect'
import Screenfull from '@/components/Screenfull'
export default {
  components: {
    Breadcrumb,
    Hamburger,
    SizeSelect,
    Screenfull
  },
  data() {
    return {
      // 网速
      speed: '0KB/S'
    }
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'avatar',
      'device',
      '版本号',
      'netWorkSpeed',
      '个人信息',
      '管理角色',
      '对应企业名称',
      '待审核员工数',
      '待确认送货数',
      '待确认员工计件数'
    ])
  },
  created() {},
  methods: {
    toggleSideBar() {
      this.$store.dispatch('toggleSideBar')
    },
    // 点击帮助中心调用
    useintro() {
      const { href } = this.$router.resolve({
        path: '/instructionsForuse/index'
      })
      window.open(href, '_blank')
    },
    // 待审核员工按钮点击
    onEmployeeToBeAuditedBtnClick() {
      this.$router.push('/userManagement/index')
    },
    // 待确认送货按钮点击
    onDeliveryBtnToBeConfirmedClick() {
      this.$router.push({
        path: '/financialFunctions/supplierDeliveryNote',
        query: { isCheckTheDeliveryNoteToBeConfirmed: true }
      })
    },
    // 待确认员工按钮点击
    onEmployeePieceworkToBeConfirmedClick() {
      this.$router.push({
        path: '/productOrderManagement/productOrderQuickOperation'
      })
    },

    logout() {
      this.$store.dispatch('LogOut').then(() => {
        location.reload() // In order to re-instantiate the vue-router object to avoid bugs
      })
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  .hamburger-container {
    line-height: 58px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background 0.3s;
    &:hover {
      background: rgba(0, 0, 0, 0.025);
    }
  }
  .breadcrumb-container {
    float: left;
  }
  .errLog-container {
    display: inline-block;
    vertical-align: top;
  }
  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;
    &:focus {
      outline: none;
    }
    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;
      &.hover-effect {
        cursor: pointer;
        transition: background 0.3s;
        &:hover {
          background: rgba(0, 0, 0, 0.025);
        }
      }
      .item {
        margin-right: 20px;
        cursor: pointer;
        transition: background 0.3s;
        &:hover {
          background: rgba(0, 0, 0, 0.025);
        }
      }
      .item:last-child {
        margin-right: 16px;
      }
    }
    .avatar-container {
      margin-right: 30px;
      height: 100%;
      .avatar-wrapper {
        height: 100%;
        position: relative;
        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          margin-top: 5px;
          border-radius: 10px;
        }
        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }
}

.el-badge__content.is-fixed {
  top: 10px;
}
</style>

<style>
.navbar .el-badge__content.is-fixed {
  top: 10px;
}
</style>
