<template>
  <!--操作物料对话框（查看，编辑，添加）-->
  <div class="edit-material-dialog-box">
    <el-dialog :visible.sync="show" :title="calculateTitle" center width="1200px">
      <el-form ref="form" :model="form" :rules="formRules" label-position="left">
        <!-- 基本信息 -->
        <div class="base-info">
          <div class="header">
            <b>物料基本信息</b>
          </div>

          <div class="box-a">
            <!-- 动态标签部分 -->
            <el-form-item
              v-for="(value,tag_name) in form.tags"
              :key="tag_name"
              class="item-0"
              :label="tag_name"
            >
              <el-autocomplete
                v-model.trim="form.tags[tag_name]"
                class="inline-input"
                :fetch-suggestions="((queryString, callback)=>tagQueryAutoCompleteSearch(queryString,callback,tag_name))"
                placeholder="自动补全"
              />
            </el-form-item>
            <!-- 静态属性部分 -->
            <el-form-item class="item-1" prop="物料编号" label="物料编号:" label-width="85px">
              <el-input v-model.trim="form.物料编号" :disabled="true" placeholder="物料编号" />
            </el-form-item>
            <el-form-item class="item-4" prop="单位" label="单位:" label-width="60px">
              <el-input v-model.trim="form.单位" placeholder="单位" />
            </el-form-item>
            <el-form-item class="item-5" prop="仓库剩余数量" label="仓库剩余数量:" label-width="115px">
              <el-input v-model.trim="form.仓库剩余数量" disabled />
            </el-form-item>
            <el-form-item class="item-6" prop="备注" label="备注:" label-width="45px">
              <el-input
                v-model.trim="form.备注"
                type="textarea"
                :sapn="24"
                :rows="3"
                placeholder="物料相关备注信息"
              />
            </el-form-item>
          </div>
        </div>

        <!-- 供应商列表 -->
        <supplier-list-a
          ref="supplierListA"
          :whether-to-disable-the-supplier-warehouse-surplus-input-box="openMode === 'viewAndModify'?true:false"
          :supplier-list-info="form['供应商列表']"
          :calculate-warehouse-surplus="calculateWarehouseSurplus"
          :whether-to-disable-the-supplier-material-change-quantity-input-box="true"
        />

        <!-- 供应商历史信息 -->
        <el-table v-if="form.供应商历史信息" :data="form.供应商历史信息" style="margin-bottom:30px;">
          <el-table-column label="供应商历史信息" align="center">
            <el-table-column align="center" prop="名称" label="供应商名称" />
            <el-table-column align="center" prop="供应商价格" label="供应商价格" />
            <el-table-column align="center" prop="供应商物料名称" label="供应商物料名称" />
            <el-table-column align="center" prop="说明" label="说明" />
          </el-table-column>
        </el-table>

        <div v-if="openMode==='viewAndModify'" class="btn-box">
          <el-button class="btn-1" type="primary" plain @click="()=>{show=false}">取消修改</el-button>
          <el-button
            type="primary"
            plain
            @click="onConfirmTheModification"
          >确认修改</el-button>
        </div>

        <el-form-item v-if="openMode==='add'||openMode==='copyToAdd'" class="btn-box">
          <el-button type="primary" @click="onAddMaterialInfoBtnClick">添加物料信息</el-button>
          <el-button type="warning" @click="continueToAdd">继续添加物料信息</el-button>
          <el-button type="danger" @click="onClearForm">清空表单</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import supplierListA from '@/views/components/supplierListA'
import { generate_year_month_sequence_number } from '@/api/otherUtilityClasses'
import { deepClone, isEmpty } from '@/utils'
import { 验证正整数和正浮点数 } from '@/utils/validate'
import {
  edit_warehouse_material_by_id,
  material_tags_auto_complete,
  add_warehouse_matetial
} from '@/api/warehouseProcurement'
import { mapGetters } from 'vuex'
export default {
  components: { supplierListA },
  props: {
    dialogVisible: Boolean,
    onClose: {
      required: true,
      validator: function(value) {
        return true
      }
    },
    openMode: {
      type: String,
      // 对象或数组默认值必须从一个工厂函数获取
      default: function() {
        return ''
      }
    },
    curOperationDetailInfo: {
      type: Object,
      // 对象或数组默认值必须从一个工厂函数获取
      default: function() {
        return {}
      }
    }
  },
  data() {
    return {
      // 对应的用于搜索和自动补全的tags模块
      tag_names: [],
      form: {},
      // 原始的form记录，用于修改供应商列表提交后，入库的时候和当前的form作比对
      oldForm: {},
      formRules: {
        // 物料编号: [{ required: true, message: '请输入活动名称', trigger: 'blur' }],
        单位: [{ required: true, message: '请输入单位', trigger: 'blur' }],
        仓库剩余数量: [
          { required: true, trigger: 'blur', validator: 验证正整数和正浮点数 }
        ]
      },
      show: false,
      // 告诉父组件是否需要刷新数据
      refresh_flag: false,
      // 元素的form数据(上一次提交的form)
      original_copy_form: {}
    }
  },
  computed: {
    ...mapGetters([
      '管理权限'
    ]),
    calculateTitle: function() {
      if (this.openMode === 'viewAndModify') return '查看/修改物料信息'
      else if (this.openMode === 'add') return '添加新的物料信息'
      else if (this.openMode === 'copyToAdd') return '复制添加新的物料信息'
      return ''
    }
  },

  watch: {
    dialogVisible: function(newVal, oldVal) {
      this.show = newVal
      this.refresh_flag = false
      // 进入的对话的时候
      if (newVal && !oldVal) {
        if (this.openMode === 'viewAndModify') {
          this.initializeDataAccordingToViewAndEditModes()
        } else if (this.openMode === 'copyToAdd') {
          this.initializeDataAccordingToCopyToAddModes()
        } else if (this.openMode === 'add') {
          this.initializeDataAccordingToAddModes()
        }
      }
    },
    show: function(newVal, oldVal) {
      if (!newVal) {
        this.onClose(this.show, this.refresh_flag)
        this.refresh_flag = false
      }
    }
  },
  created() {
    this.tag_names = this.$store.getters.物料的标签
  },
  mounted() {

  },
  methods: {
    // 根据查看/修改 模式来初始化一些数据
    initializeDataAccordingToViewAndEditModes() {
      this.form = deepClone(this.$store.getters.空的物料结构)
      for (const key in this.form) {
        this.form[key] = this.curOperationDetailInfo[key]
      }
      this.calculateWarehouseSurplus()
      this.oldForm = deepClone(this.form)
    },
    // 根据 复制添加 模式来初始化一些数据
    async initializeDataAccordingToCopyToAddModes() {
      this.initializeDataAccordingToViewAndEditModes()
      const res_a = await generate_year_month_sequence_number({
        login_token: this.$store.getters.token,
        流水单分组: 'WLD'
      })
      var code = res_a.data['流水号']
      this.form.物料编号 = code
    },
    // 根据 添加 模式来初始化一些数据
    async initializeDataAccordingToAddModes() {
      this.form = deepClone(this.$store.getters.空的物料结构)
      this.form.供应商列表 = []
      this.form.供应商列表.push(
        deepClone(this.$store.getters.物料的空的供应商信息)
      )
      for (var index in this.tag_names) {
        this.$set(this.form.tags, this.tag_names[index], '')
      }
      const res_a = await generate_year_month_sequence_number({
        login_token: this.$store.getters.token,
        流水单分组: 'WLD'
      })
      var code = res_a.data['流水号']
      this.form.物料编号 = code
      this.form.仓库剩余数量 = 0.0
    },
    // 确认修改
    onConfirmTheModification() {
      this.$refs.form.validate(async valid => {
        if (valid) {
          if (!confirm('确定进行修改吗？修改将会对记录进行永久的改变')) {
            return false
          }
          // 1.修改物料
          var 供应商列表 = this.$refs.supplierListA.returnSupplierList
          console.log(供应商列表)
          if (isEmpty(供应商列表)) return
          this.form.供应商列表 = 供应商列表
          var material_post_data = {
            login_token: this.$store.getters.token,
            unique_id: this.form.unique_id,
            update_data: this.form
          }
          await edit_warehouse_material_by_id(material_post_data)
          this.$message({
            type: 'success',
            message: '该物料修改操作已成功记录'
          })
          this.refresh_flag = true
          this.show = false
        } else {
          this.$message({
            type: 'warning',
            message: '请完善表单信息'
          })
          return false
        }
      })
    },
    // 添加物料信息按钮点击
    onAddMaterialInfoBtnClick() {
      this.$refs.form.validate(async valid => {
        if (valid) {
          // // this.form['供应商列表']
          // var supplierList = this.$refs.supplierListA.returnSupplierList
          // if (isEmpty(supplierList)) {
          //   return
          // }
          // this.form['供应商列表'] = supplierList
          var material_post_data = {
            login_token: this.$store.getters.token,
            data: this.form
          }
          // 添加物料进库存信息数据库
          await add_warehouse_matetial(material_post_data)
          this.$message({
            type: 'success',
            message: '添加物料成功'
          })
          // 拷贝这次的表单数据
          this.original_copy_form = deepClone(this.form)
          this.refresh_flag = true
          this.show = false
        } else {
          this.$message({
            type: 'warning',
            message: '请完善表单信息'
          })
          return false
        }
      })
    },
    // 继续添加物料信息 按钮点击
    async continueToAdd() {
      // 1.把上一次的form表单信息拷回来
      this.form = deepClone(this.original_copy_form)
      // 2.生成新id
      const res_a = await generate_year_month_sequence_number({
        login_token: this.$store.getters.token,
        流水单分组: 'WLD'
      })
      var code = res_a.data['流水号']
      this.form.物料编号 = code
    },
    // 清空表单点击
    onClearForm() {
      // this.form = deepClone(this.$store.getters.空的物料结构)
      this.initializeDataAccordingToAddModes()
    },
    // 对物料标签进行自动补全操作
    async tagQueryAutoCompleteSearch(queryString, callback, tag_name) {
      if (queryString === undefined || queryString === null) {
        queryString = ''
      }
      var post_data = {
        login_token: this.$store.getters.token,
        base_tags: this.form.tags,
        target_tag_name: tag_name
      }
      // 调用api
      const response = await material_tags_auto_complete(post_data)
      var suggest_value_list = []
      for (var index in response.data) {
        suggest_value_list.push({
          value: response.data[index]
        })
      }
      callback(suggest_value_list)
    },
    // 计算仓库剩余量
    calculateWarehouseSurplus() {
      var 仓库剩余数量 = 0
      for (let i = 0; i < this.form.供应商列表.length; i++) {
        const element = this.form.供应商列表[i]
        仓库剩余数量 += Number(element.仓库剩余数量)
      }
      this.form.仓库剩余数量 = 仓库剩余数量
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
      padding: 20px 10px 0 10px;

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
        width: 30%;
      }
      .item-5 {
        width: 30%;
      }
      .item-6 {
        width: 80%;
      }
    }
  }
  .btn-box {
    display: flex;
    justify-content: center;
  }
}
</style>

