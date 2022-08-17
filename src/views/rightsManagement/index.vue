<template>
  <div class="rightsManagement">
    <el-button class="add-role-btn" type="primary" :disabled="!管理权限['权限管理可写']" @click="handleAddRole">新增角色</el-button>
    <div class="useintro" @click="viewUseIntro">
      <img src="@/assets/images/help.png" class="help">
    </div>

    <el-table :data="rolesList" style="width: 100%;margin-top:30px;" border>
      <el-table-column align="center" label="角色名称" width="220">
        <template slot-scope="scope">{{ scope.row["管理角色"] }}</template>
      </el-table-column>
      <el-table-column align="header-center" label="权限描述">
        <template slot-scope="scope">
          <el-tree
            :ref="'tree'+scope.$index"
            :data="permissionStructureTable"
            :props="defaultProps"
            :show-checkbox="true"
            node-key="id"
            class="permission-tree"
            :disabled="true"
          />
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="260">
        <template slot-scope="scope">
          <el-button type="primary" size="small" :disabled="!管理权限['权限管理可写']" @click="handleConfirmTheEditor(scope)">确认编辑</el-button>
          <el-button type="primary" size="small" :disabled="!管理权限['权限管理可写']" @click="handleReset(scope)">重置</el-button>
          <el-button type="danger" size="small" :disabled="!管理权限['权限管理可写']" @click="handleDelete(scope)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'编辑角色':'新建角色'">
      <el-form :model="role" label-width="80px" label-position="left">
        <el-form-item label="名字">
          <el-input
            v-model.trim="role['管理角色']"
            placeholder="角色 名字"
            :disabled="dialogType=='edit'?true:false"
          />
        </el-form-item>
        <el-form-item label="权限配置">
          <el-tree
            ref="tree"
            :data="permissionStructureTable"
            :props="defaultProps"
            :show-checkbox="true"
            node-key="id"
            class="permission-tree"
          />
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="confirmRole">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
// import { deepClone } from '@/utils'
import { validateRoleInput } from '@/utils/validate'
import {
  filter_role_authority,
  edit_role_authority_by_id,
  add_role_authority,
  delete_role_authority_by_id
} from '@/api/personnelAndAuthorityManagement'
const defaultRole = {
  管理角色: ''
}
import { mapGetters } from 'vuex'
export default {
  data() {
    return {
      role: Object.assign({}, defaultRole),
      permissionStructureTable: [], // 权限结构表
      rolesList: [], // 全部的角色列表
      dialogVisible: false,
      dialogType: 'new',
      defaultProps: {
        children: 'children',
        label: 'label'
      }
    }
  },
  computed: {
    ...mapGetters([
      '管理权限'
    ])
  },
  watch: {},
  created() {
    this.getRoles()
    this.permissionStructureTable = this.$store.getters['权限结构表']
  },
  mounted() {
  },
  methods: {
    // 查看指引
    viewUseIntro() {
      var routeUrl = this.$router.resolve({
        path: '/instructionsForuse/index',
        query: {
          x: 2,
          y: 0
        }
      })
      window.open(routeUrl.href, '_blank')
    },
    // 按条件获取角色以及他们的权限信息
    async getRoles(
      filterCondition = { login_token: this.$store.getters.token }
    ) {
      const res = await filter_role_authority(filterCondition)
      this.rolesList = res.data
      this.$nextTick(() => {
        for (let i = 0; i < this.rolesList.length; i++) {
          const role = this.rolesList[i]
          var labels = []
          for (const key in role['管理权限']) {
            if (role['管理权限'][key]) {
              labels.push(key)
            }
          }
          // console.log('当前编辑角色的全部权限', labels)

          var ids = []
          for (const key in this.$store.getters.permissionMap) {
            if (labels.includes(this.$store.getters.permissionMap[key])) {
              ids.push(Number(key))
            }
          }
          // console.log('当前编辑角色的全部权限的对应id', ids)
          this.$refs['tree' + i].setCheckedKeys(ids)
        }
      })
    },

    handleAddRole() {
      this.role = Object.assign({}, defaultRole)
      // 把树节点设置为全不选
      if (this.$refs.tree) {
        this.$refs.tree.setCheckedNodes([])
      }
      this.dialogType = 'new'
      this.dialogVisible = true
    },

    async handleConfirmTheEditor(scope) {
      var checkedKeys_a = this.$refs['tree' + scope.$index].getCheckedKeys()
      console.log('选中的权限id：', checkedKeys_a)

      var checkedKeys_b = []
      // 组合完整的返回给后端的权限结构
      for (let i = 0; i < checkedKeys_a.length; i++) {
        var id = String(checkedKeys_a[i])
        if (this.$store.getters.permissionMap[id] && !checkedKeys_b.includes(this.$store.getters.permissionMap[id])) {
          checkedKeys_b.push(this.$store.getters.permissionMap[id])
        }
      }
      console.log('选中的权限：', checkedKeys_b)

      var jurisdiction = {}
      for (let i = 0; i < this.$store.getters['全部的细分权限'].length; i++) {
        if (checkedKeys_b.includes(this.$store.getters['全部的细分权限'][i])) {
          jurisdiction[this.$store.getters['全部的细分权限'][i]] = true
        } else {
          jurisdiction[this.$store.getters['全部的细分权限'][i]] = false
        }
      }
      // 遍历该角色的所有权限（可能一共是50个权限，但是pc只用到了43个）
      // 如果key被 jurisdiction 包含，那么跳转啥也不做，如果不被包含，那么把该角色默认的权限，还是带给后端
      const permissions = scope.row['管理权限']
      for (const key in permissions) {
        if (jurisdiction.hasOwnProperty(key)) {
          continue
        } else {
          jurisdiction[key] = permissions[key]
        }
      }
      console.log('给后端的权限：', jurisdiction)

      var obj_a = {
        login_token: this.$store.getters.token,
        unique_id: scope.row.unique_id,
        update_data: {
          管理权限: jurisdiction
        }
      }
      const res = await edit_role_authority_by_id(obj_a)
      this.$message({
        type: 'success',
        message: res.msg
      })
      this.getRoles()
    },

    handleDelete(scope) {
      this.$confirm('确认删除角色?', 'Warning', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          var obj = {
            login_token: this.$store.getters.token,
            unique_id: scope.row.unique_id
          }
          const res = await delete_role_authority_by_id(obj)
          this.$message({
            type: 'success',
            message: res.msg
          })
          this.getRoles()
        })
        .catch(err => {
          console.error(err)
        })
    },

    async confirmRole() {
      var checkedKeys_a = this.$refs.tree.getCheckedKeys()
      console.log('选中的权限id：', checkedKeys_a)

      var checkedKeys_b = []
      // 组合完整的返回给后端的权限结构
      for (let i = 0; i < checkedKeys_a.length; i++) {
        var id = String(checkedKeys_a[i])
        if (this.$store.getters.permissionMap[id] && !checkedKeys_b.includes(this.$store.getters.permissionMap[id])) {
          checkedKeys_b.push(this.$store.getters.permissionMap[id])
        }
      }
      console.log('选中的权限：', checkedKeys_b)

      var jurisdiction = {}
      for (let i = 0; i < this.$store.getters['全部的细分权限'].length; i++) {
        if (checkedKeys_b.includes(this.$store.getters['全部的细分权限'][i])) {
          jurisdiction[this.$store.getters['全部的细分权限'][i]] = true
        } else {
          jurisdiction[this.$store.getters['全部的细分权限'][i]] = false
        }
      }
      // 遍历该角色的所有权限（可能一共是50个权限，但是pc只用到了43个）
      // 如果key被 jurisdiction 包含，那么跳转啥也不做，如果不被包含，那么默认设置为false，把该权限传递给后端
      const permissions = this.$store.getters['管理权限']
      for (const key in permissions) {
        if (jurisdiction.hasOwnProperty(key)) {
          continue
        } else {
          jurisdiction[key] = false
        }
      }
      console.log('给后端的权限：', jurisdiction)

      if (!validateRoleInput(this.role['管理角色'])) {
        this.$message({
          type: 'error',
          message: '角色为不超过8位的任意字符'
        })
        return
      }
      var obj_b = {
        login_token: this.$store.getters.token,
        data: {
          管理角色: this.role['管理角色'].trim(),
          管理权限: jurisdiction
        }
      }
      const res = await add_role_authority(obj_b)
      this.$message({
        type: 'success',
        message: res.msg
      })
      this.getRoles()
      this.dialogVisible = false
    },

    handleReset() {
      this.getRoles()
    }
  }
}
</script>
<style lang="scss" scoped>
.rightsManagement {
  .add-role-btn{
    margin: 5px 0 0 10px;
  }
  .roles-table {
    margin-top: 30px;
  }
  .permission-tree {
    margin-bottom: 30px;
    float: left;
    margin-right: 50px;
  }
  .box{
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    .des{
      margin: 5px 30px;
    }
  }
}
</style>
