<template>
  <div class="supplierAddNowTheStatement">
    <el-form ref="form" class="form" :model="form" label-position="left">
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>① 填写现结单基本信息</span>
        </div>

        <div class="modul-a">
          <el-form-item class="item" prop="供应商名称" label="供应商名称:" label-width="100px">
            <el-autocomplete
              v-model="form['供应商名称']"
              class="input"
              :fetch-suggestions="((queryString,callback)=>tagQueryAutoCompleteSearch(callback,queryString))"
              placeholder="供应商名称"
            >
              <template slot-scope="{ item }">
                <div v-if="item.label==='点击按钮添加'" class="name" @click="addSupplier">
                  {{ item.label }}
                  <svg-icon slot="suffix" class-name="add-supplier" icon-class="tianjia" />
                </div>
                <div v-else>{{ item.value }}</div>
              </template>
            </el-autocomplete>
          </el-form-item>
          <el-form-item class="item" prop="工厂名称" label="工厂名称:" label-width="100px">
            <el-input v-model="form.工厂名称" class="input" disabled />
          </el-form-item>

          <el-form-item class="item" prop="交易状态" label="交易状态:" label-width="100px">
            <el-select v-model="form.交易状态" placeholder="请选择">
              <el-option
                v-for="item in transactionStatusOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item class="item" label="付款人选择:" label-width="130px">
            <div class="payer-choice-box">
              <el-input v-model="form.付款人手机" style="width:150px;" disabled />
              <el-autocomplete
                v-model="付款人搜索关键字"
                style="width:400px;"
                :fetch-suggestions="((queryString,callback)=>returnsAListOfPayerInformation(callback,queryString))"
                placeholder="输入关键字匹配"
                @focus="($event)=>{$event.currentTarget.select()}"
                @select="((item)=>{selectPayer(item)})"
              >
                <el-button slot="append" icon="el-icon-search" />
              </el-autocomplete>

              <el-select v-model.trim="searchLabel" placeholder="请选择">
                <el-option label="搜索：名字" value="name" />
                <el-option label="搜索：身份" value="role" />
                <el-option label="搜索：手机号码" value="mobile_num" />
                <el-option label="搜索：工作状态" value="Working_state" />
              </el-select>
            </div>
          </el-form-item>
        </div>
      </el-card>

      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>② 填写现结单货物信息</span>
          <el-button
            style="float: right;"
            type="primary"
            size="mini"
            @click="addElementsOfGoods()"
          >继续添加货物</el-button>
        </div>

        <el-table ref="table" class="table" :data="form.现结单" border>
          <el-table-column align="center" prop="名称及规格" label="名称及规格" width="200">
            <template slot-scope="scope">
              <el-autocomplete
                v-model="scope.row['名称及规格']"
                :fetch-suggestions="((queryString,callback)=>nameSpecificationQueryAutoCompleteSearch(callback,queryString))"
                placeholder="名称及规格"
                @select="((item)=>{handleSelect(item,scope.$index)})"
              />
            </template>
          </el-table-column>

          <el-table-column align="center" prop="货号" label="货号">
            <template slot-scope="scope">
              <el-input v-model.trim="scope.row.货号" />
            </template>
          </el-table-column>

          <el-table-column align="center" prop="单位" label="单位">
            <template slot-scope="scope">
              <el-input v-model.trim="scope.row.单位" />
            </template>
          </el-table-column>
          <el-table-column align="center" prop="数量" label="数量">
            <template slot-scope="scope">
              <el-input
                v-model="scope.row.数量"
                type="number"
                @blur="onBlurElementsInfo('数量',scope.$index)"
                @focus="($event)=>{$event.currentTarget.select()}"
              />
            </template>
          </el-table-column>
          <el-table-column align="center" prop="单价" label="单价">
            <template slot-scope="scope">
              <el-input
                v-model="scope.row.单价"
                type="number"
                @blur="onBlurElementsInfo('单价',scope.$index)"
                @focus="($event)=>{$event.currentTarget.select()}"
              />
            </template>
          </el-table-column>
          <el-table-column align="center" prop="总价格" label="总价格">
            <template slot-scope="scope">
              <el-input
                v-model="scope.row.总价格"
                type="number"
                @blur="onBlurElementsInfo('总价格',scope.$index)"
                @focus="($event)=>{$event.currentTarget.select()}"
              />
            </template>
          </el-table-column>
          <el-table-column align="center" label="备注" min-width="300">
            <template slot-scope="scope">
              <el-input v-model="scope.row.备注" />
            </template>
          </el-table-column>
          <el-table-column align="center" label="操作">
            <template slot-scope="scope">
              <el-button type="danger" size="mini" @click="removeElementsFromList(scope.$index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <div class="form-btn-box">
        <el-button type="primary" size="small" :loading="loading" @click="formSubmit()">提交</el-button>
        <el-button size="small" @click="formReset()">重置</el-button>
      </div>
    </el-form>
    <!--操作供应商对话框-->
    <the-action-supplier-dialog-box
      :dialog-visible="supploerDialogVisible"
      :on-close="closeSupplierDialogCallback"
      :open-model="'add'"
    />
  </div>
</template>

<script>
var 空的供应商现结单 = {
  login_token: '',
  供应商unique_id: '',
  工厂unique_id: '',
  供应商名称: '',
  工厂名称: '',
  交易状态: '已结算',
  现结单: [],
  付款人手机: ''
}
const 空的供应商现结单元素 = {
  货号: '',
  名称及规格: '',
  单位: '',
  数量: '',
  单价: '',
  总价格: '',
  备注: ''
}

import {
  get_supplier_quotation_info_by_key_word,
  add_cash_supplier_transaction
} from '@/api/supplier'
import { filter_user } from '@/api/personnelAndAuthorityManagement'
import { filter_supplier } from '@/api/supplier'
import { deepClone, isEmpty } from '@/utils'
import { mapGetters } from 'vuex'
import theActionSupplierDialogBox from '@/views/supplierManagement/components/theActionSupplierDialogBox' // 操作供应商对话框
export default {
  components: { theActionSupplierDialogBox },
  data() {
    return {
      form: {},
      付款人搜索关键字: `姓名：${this.$store.getters['个人信息']['姓名']}，管理角色：${this.$store.getters['管理角色'][0]}`,
      // 搜索方式
      searchLabel: 'name',
      factoryInformationList: [],
      loading: false,
      transactionStatusOptions: [
        {
          value: '未结算',
          label: '未结算'
        },
        {
          value: '已结算',
          label: '已结算'
        }
      ],
      supploerDialogVisible: false
    }
  },
  computed: {
    ...mapGetters(['管理权限'])
  },
  watch: {
    'form.供应商名称': function(newVal, oldVal) {
      for (let i = 0; i < this.factoryInformationList.length; i++) {
        const element = this.factoryInformationList[i]
        if (element.名称 === newVal) {
          this.form['供应商unique_id'] = element.unique_id
          var 现结单 = []
          现结单.push(deepClone(空的供应商现结单))
          this.form['现结单'] = 现结单
          return
        }
      }
    }
  },
  created() {
    this.initializationForm()
  },
  methods: {
    // 初始化form
    initializationForm() {
      var form = deepClone(空的供应商现结单)
      form['工厂unique_id'] = this.$store.getters['对应企业unique_id']
      form['工厂名称'] = this.$store.getters['对应企业名称']
      form['付款人手机'] = this.$store.getters['绑定手机号']
      form['现结单'] = []
      form['现结单'].push(deepClone(空的供应商现结单元素))
      for (const key in form) {
        this.$set(this.form, key, form[key])
      }
    },
    // 查询供应商
    async tagQueryAutoCompleteSearch(callback, queryString) {
      var post_data = {
        login_token: this.$store.getters.token,
        名称: queryString
      }
      const response = await filter_supplier(post_data)
      this.factoryInformationList = response.data
      var suggest_value_list = []
      for (var index in response.data) {
        suggest_value_list.push({
          value: response.data[index]['名称']
        })
      }
      if (suggest_value_list.length === 0) {
        suggest_value_list.push({
          label: '点击按钮添加'
        })
      }
      callback(suggest_value_list)
    },

    // 返回物品列表
    async nameSpecificationQueryAutoCompleteSearch(callback, queryString = '') {
      if (!this.form['供应商unique_id']) {
        return []
      }
      var post_data = {
        login_token: this.$store.getters.token,
        关键字: queryString,
        供应商unique_id: this.form['供应商unique_id']
        // 发起人: '工厂'
      }

      const response = await get_supplier_quotation_info_by_key_word(post_data)
      this.nameAndSpecificationList = response.data['报价单信息列表']
      var suggest_value_list = []
      for (var index in response.data['报价单信息列表']) {
        suggest_value_list.push({
          value: response.data['报价单信息列表'][index]['名称及规格']
        })
      }
      callback(suggest_value_list)
    },
    // 选择货物
    handleSelect(item, index) {
      // 1.根据索引 判断 form.现结单.名称及规格 是否能在nameAndSpecificationList中能找到
      var invoice = this.form['现结单'][index]
      var i = this.nameAndSpecificationList.findIndex(item => {
        return item['名称及规格'] === invoice['名称及规格']
      })
      if (i !== -1) {
        // 如果找到了
        this.$set(this.form['现结单'][index], '单价', this.nameAndSpecificationList[i][
          '单价'
        ])
        this.$set(this.form['现结单'][index], '单位', this.nameAndSpecificationList[i][
          '单位'
        ])
        this.$set(this.form['现结单'][index], '备注', this.nameAndSpecificationList[i][
          '备注'
        ])
        this.$set(this.form['现结单'][index], '货号', this.nameAndSpecificationList[i][
          '货号'
        ])
      }
      return
    },

    // 返回付款人信息列表
    async returnsAListOfPayerInformation(callback, queryString) {
      var post_data = {
        login_token: this.$store.getters.token,
        sort: { update_time: -1 },
        工作状态: ['在职', '离职', '请假', '开除'],
        pagination: {
          page: 1,
          limit: 300
        }
      }
      if (this.searchLabel === 'name') {
        post_data['姓名'] = '.*' + queryString + '.*'
      } else if (this.searchLabel === 'role') {
        post_data['管理角色'] = '.*' + queryString + '.*'
      } else if (this.searchLabel === 'mobile_num') {
        post_data['绑定手机号'] = '.*' + queryString + '.*'
      } else if (this.searchLabel === 'Working_state') {
        var temp = []
        temp.push(this.searchValue)
        post_data['工作状态'] = temp
      }

      const response = await filter_user(post_data)
      var suggest_value_list = []
      for (var i in response.data) {
        suggest_value_list.push({
          value: `姓名：${response.data[i]['个人信息']['姓名']}，管理角色：${response.data[i]['管理角色']}`,
          data: response.data[i]
        })
      }
      // if (suggest_value_list.length === 0) {
      //   this.form['付款人手机'] = ''
      // }
      callback(suggest_value_list)
    },
    // 选择付款人
    selectPayer(item) {
      this.form['付款人手机'] = item.data['绑定手机号']
    },

    // 货物信息输入框失去焦点后
    onBlurElementsInfo(mode, index) {
      if (mode === '数量') {
        this.form['现结单'][index]['数量'] = isEmpty(
          this.form['现结单'][index]['数量']
        )
          ? 0
          : Number(parseFloat(this.form['现结单'][index]['数量']).toFixed(2))
        // 如果是数量得话 总价格=数量*单价
        this.form['现结单'][index]['总价格'] = Number(
          parseFloat(
            this.form['现结单'][index]['数量'] *
              this.form['现结单'][index]['单价']
          ).toFixed(2)
        )
      } else if (mode === '单价') {
        this.form['现结单'][index]['单价'] = isEmpty(
          this.form['现结单'][index]['单价']
        )
          ? 0
          : Number(parseFloat(this.form['现结单'][index]['单价']).toFixed(2))
        // 如果是单价得话 总价格=数量*单价
        this.form['现结单'][index]['总价格'] = Number(
          parseFloat(
            this.form['现结单'][index]['单价'] *
              this.form['现结单'][index]['数量']
          ).toFixed(2)
        )
      } else if (mode === '总价格') {
        this.form['现结单'][index]['总价格'] = isEmpty(
          this.form['现结单'][index]['总价格']
        )
          ? 0
          : Number(parseFloat(this.form['现结单'][index]['总价格']).toFixed(2))
        // 如果单价不为0 那么计算数量
        if (this.form['现结单'][index]['单价'] !== 0) {
          this.form['现结单'][index]['数量'] = Number(
            parseFloat(
              this.form['现结单'][index]['总价格'] /
                this.form['现结单'][index]['单价']
            ).toFixed(2)
          )
        } else if (this.form['现结单'][index]['数量'] !== 0) {
          // 如果数量不为0 那么计算单价
          this.form['现结单'][index]['单价'] = Number(
            parseFloat(
              this.form['现结单'][index]['总价格'] /
                this.form['现结单'][index]['数量']
            ).toFixed(2)
          )
        } else {
          this.$message({
            message: '数量和单价至少要输入一项',
            type: 'warning'
          })
        }
      }
    },
    // 继续添加货物的时候，判断form.现结单
    continueToAddGoodsJudgmentCriteria() {
      for (let r = 0; r < this.form['现结单'].length; r++) {
        const element_wai = this.form['现结单'][r]
        if (isEmpty(element_wai.单位)) {
          this.$message({
            message: `现结单第${r + 1}行，请选择名称及规格`,
            type: 'warning'
          })
          return false
        }
        if (isEmpty(element_wai.数量) && isEmpty(element_wai.单价)) {
          this.$message({
            message: `现结单第${r + 1}行，数量和单价至少要输入1项！`,
            type: 'warning'
          })
          return false
        }
        if (isEmpty(element_wai.总价格)) {
          this.$message({
            message: `现结单第${r + 1}行，总价格是必填项！`,
            type: 'warning'
          })
          return false
        }
        for (let c = r + 1; c < this.form['现结单'].length; c++) {
          // 如果找到重复的名称或者是完全一样的unique_id，那么也不合规
          const element_nei = this.form['现结单'][c]
          if (element_nei.名称及规格 === element_wai.名称及规格) {
            this.$message({
              message: '现结单中不允许出现重复的名称及规格',
              type: 'warning'
            })
            return false
          }
        }
      }
      return true
    },
    // 继续添加货物
    addElementsOfGoods() {
      // 等待一下先让失去焦点的逻辑处理完
      setTimeout(() => {
        if (!this.continueToAddGoodsJudgmentCriteria()) return
        var emptyElement = deepClone(空的供应商现结单元素)
        this.form['现结单'].push(emptyElement)
      }, 100)
    },
    // 删除现结单中的元素
    removeElementsFromList(index) {
      if (this.form['现结单'].length <= 1) {
        for (const key in this.form['现结单'][0]) {
          this.form['现结单'][0][key] = deepClone(空的供应商现结单元素)
        }
        return
      }
      this.form['现结单'].splice(index, 1)
    },
    // 添加供应商信息按钮
    addSupplier() {
      if (!this.$store.getters['管理权限']['供应商信息可写']) {
        this.$message({
          message: '没有添加供应商的权限！',
          type: 'warning'
        })
        return
      }
      this.supploerDialogVisible = true
    },
    // 供应商对话框关闭后回调
    closeSupplierDialogCallback(status, refresh_flag) {
      this.supploerDialogVisible = false
    },
    formSubmit(e) {
      this.loading = true
      this.$nextTick(async() => {
        if (
          isEmpty(this.form['供应商名称']) ||
          isEmpty(this.form['供应商unique_id'])
        ) {
          this.loading = false
          this.$message({
            message: '供应商名称是必选！',
            type: 'warning'
          })
          return
        }
        if (isEmpty(this.form['付款人手机'])) {
          this.loading = false
          this.$message({
            message: '付款人信息是必选（可通过付款人选择来快速点选）！',
            type: 'warning'
          })
          return
        }
        if (!this.continueToAddGoodsJudgmentCriteria()) {
          this.loading = false
          return
        }

        var paramter = {
          login_token: this.$store.getters.token,
          供应商unique_id: this.form.供应商unique_id,
          工厂unique_id: this.form.工厂unique_id,
          付款人手机: this.form['付款人手机'],
          交易状态: this.form['交易状态'],
          现结单: this.form.现结单.map(item => {
            var 现结单元素 = deepClone(空的供应商现结单元素)
            for (const key in 现结单元素) {
              现结单元素[key] = item[key]
            }
            return 现结单元素
          })
        }
        try {
          var res = await add_cash_supplier_transaction(paramter)
          this.$message({
            message: res.msg,
            type: 'success'
          })
          this.$router.push({
            path: '/financialFunctions/supplierDeliveryNote'
          })
        } catch (error) {
          this.loading = false
        }
      })
    },

    formReset() {
      console.log('form发生了reset事件')
      // 页面初始化流程
      this.initializationForm()
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss">
// $bg: #2d3a4b;
.supplierAddNowTheStatement {
  .box-card {
    margin-bottom: 10px;
  }
  .form-btn-box {
    display: flex;
    justify-content: center;
  }
  .add-supplier {
    color: #409eff;
    font-size: 22px;
    margin-top: 10px;
  }
}
</style>

<style>
.payer-choice-box {
  display: flex;
}
</style>

