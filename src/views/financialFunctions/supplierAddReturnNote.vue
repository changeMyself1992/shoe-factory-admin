<template>
  <div class="invoice">
    <el-form ref="form" class="form" :model="form" label-position="left">
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>① 填写退货单基本信息</span>
        </div>

        <div class="modul-a">
          <el-form-item class="item" prop="供应商名称" label="供应商名称:" label-width="100px">
            <el-autocomplete
              v-model="form['供应商名称']"
              class="input"
              :fetch-suggestions="((queryString,callback)=>tagQueryAutoCompleteSearch(callback,queryString))"
              placeholder="供应商名称"
            />
          </el-form-item>
          <el-form-item class="item" prop="工厂名称" label="工厂名称:" label-width="100px">
            <el-input v-model="form.工厂名称" class="input" disabled />
          </el-form-item>
          <el-form-item class="item" prop="收货单位经手人手机" label="收货单位经手人手机:" label-width="150px">
            <el-input v-model="form.收货单位经手人手机" class="input" disabled />
          </el-form-item>
        </div>
      </el-card>

      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>② 填写退货单货物信息</span>
          <el-button
            style="float: right;"
            type="primary"
            size="mini"
            @click="addElementsOfGoods()"
          >继续添加货物</el-button>
        </div>

        <el-table ref="table" class="table" :data="form.退货单" border>
          <el-table-column align="center" prop="名称及规格" label="名称及规格" width="200">
            <template slot-scope="scope">
              <el-select
                v-model="scope.row.名称及规格"
                placeholder="请选择"
                @change="selectChangeProduct($event,scope.$index)"
              >
                <el-option
                  v-for="item in options"
                  :key="item.名称及规格"
                  :label="item.名称及规格"
                  :value="item.名称及规格"
                />
              </el-select>
            </template>
          </el-table-column>

          <el-table-column align="center" prop="货号" label="货号">
            <template slot-scope="scope">
              <el-input v-model="scope.row.货号" disabled />
            </template>
          </el-table-column>

          <el-table-column align="center" prop="单位" label="单位">
            <template slot-scope="scope">
              <el-input v-model="scope.row.单位" disabled />
            </template>
          </el-table-column>
          <el-table-column align="center" prop="最大可退货数量" label="最大可退货数量">
            <template slot-scope="scope">
              <el-input v-model="scope.row.最大可退货数量" disabled type="number" />
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
          <el-table-column align="center" prop="备注" label="备注" min-width="300">
            <template slot-scope="scope">
              <el-input v-model="scope.row.备注" @focus="($event)=>{$event.currentTarget.select()}" />
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
  </div>
</template>

<script>
import { return_goods_list, add_return_goods_note } from '@/api/supplier'
import { filter_supplier } from '@/api/supplier'
import { deepClone, isEmpty } from '@/utils'
export default {
  components: {},
  data() {
    return {
      form: {},
      factoryInformationList: [],
      loading: false,
      options: []
    }
  },
  watch: {
    'form.供应商名称': function(newVal, oldVal) {
      for (let i = 0; i < this.factoryInformationList.length; i++) {
        const element = this.factoryInformationList[i]
        if (element.名称 === newVal) {
          this.form['供应商unique_id'] = element.unique_id
          this.return_goods_list_dataList()
          var 退货单 = []
          退货单.push(deepClone(this.$store.getters['空的供应商退货单元素']))
          this.form['退货单'] = 退货单
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
      var form = deepClone(this.$store.getters['空的供应商退货单'])
      form['工厂unique_id'] = this.$store.getters['对应企业unique_id']
      form['工厂名称'] = this.$store.getters['对应企业名称']
      form['收货单位经手人手机'] = this.$store.getters['绑定手机号']
      form['退货单'].push(
        deepClone(this.$store.getters['空的供应商退货单元素'])
      )
      for (const key in form) {
        this.$set(this.form, key, form[key])
      }
    },
    async tagQueryAutoCompleteSearch(callback, queryString = '') {
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
      callback(suggest_value_list)
    },
    return_goods_list_dataList() {
      return_goods_list({
        供应商unique_id: this.form['供应商unique_id'],
        login_token: this.$store.getters.token
      }).then(res => {
        console.log(res)
        this.options = res.data
      })
    },
    // 选择货物
    selectChangeProduct(event, index) {
      console.log('选中的名称及规格：' + event)
      console.log('被点击的行的index：' + index)
      var item = this.options.find(item => {
        return item.名称及规格 === event
      })
      this.form['退货单'][index].单位 = item.单位
      this.form['退货单'][index].单价 = item.单价
      this.form['退货单'][index].货号 = item.货号
      this.form['退货单'][index].最大可退货数量 = item.sum_count
    },
    // 货物信息输入框失去焦点后
    onBlurElementsInfo(mode, index) {
      if (mode === '数量') {
        this.form['退货单'][index]['数量'] = isEmpty(
          this.form['退货单'][index]['数量']
        )
          ? 0
          : Number(parseFloat(this.form['退货单'][index]['数量']).toFixed(2))
        // 如果是数量得话 总价格=数量*单价
        this.form['退货单'][index]['总价格'] = Number(
          parseFloat(
            this.form['退货单'][index]['数量'] *
              this.form['退货单'][index]['单价']
          ).toFixed(2)
        )
      } else if (mode === '单价') {
        this.form['退货单'][index]['单价'] = isEmpty(
          this.form['退货单'][index]['单价']
        )
          ? 0
          : Number(parseFloat(this.form['退货单'][index]['单价']).toFixed(2))
        // 如果是单价得话 总价格=数量*单价
        this.form['退货单'][index]['总价格'] = Number(
          parseFloat(
            this.form['退货单'][index]['单价'] *
              this.form['退货单'][index]['数量']
          ).toFixed(2)
        )
      } else if (mode === '总价格') {
        this.form['退货单'][index]['总价格'] = isEmpty(
          this.form['退货单'][index]['总价格']
        )
          ? 0
          : Number(parseFloat(this.form['退货单'][index]['总价格']).toFixed(2))
        // 如果单价不为0 那么计算数量
        if (this.form['退货单'][index]['单价'] !== 0) {
          this.form['退货单'][index]['数量'] = Number(
            parseFloat(
              this.form['退货单'][index]['总价格'] /
                this.form['退货单'][index]['单价']
            ).toFixed(2)
          )
        } else if (this.form['退货单'][index]['数量'] !== 0) {
          // 如果数量不为0 那么计算单价
          this.form['退货单'][index]['单价'] = Number(
            parseFloat(
              this.form['退货单'][index]['总价格'] /
                this.form['退货单'][index]['数量']
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
    // 继续添加货物的时候，判断form.退货单
    continueToAddGoodsJudgmentCriteria() {
      for (let r = 0; r < this.form['退货单'].length; r++) {
        const element_wai = this.form['退货单'][r]
        if (isEmpty(element_wai.单位)) {
          this.$message({
            message: `退货单第${r + 1}行，请选择名称及规格`,
            type: 'warning'
          })
          return false
        }
        if (isEmpty(element_wai.数量) && isEmpty(element_wai.单价)) {
          this.$message({
            message: `退货单第${r + 1}行，数量和单价至少要输入1项！`,
            type: 'warning'
          })
          return false
        }
        if (isEmpty(element_wai.总价格)) {
          this.$message({
            message: `退货单第${r + 1}行，总价格是必填项！`,
            type: 'warning'
          })
          return false
        }
        if (element_wai.数量 > element_wai.最大可退货数量) {
          this.$message({
            message: `退货单第${r + 1}行，退货数量不能大于最大退货数量`,
            type: 'warning'
          })
          return false
        }
        for (let c = r + 1; c < this.form['退货单'].length; c++) {
          // 如果找到重复的名称或者是完全一样的unique_id，那么也不合规
          const element_nei = this.form['退货单'][c]
          if (element_nei.名称及规格 === element_wai.名称及规格) {
            this.$message({
              message: '退货单中不允许出现重复的名称及规格',
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
      this.$nextTick(() => {
        if (!this.continueToAddGoodsJudgmentCriteria()) return
        this.form['退货单'].push(
          deepClone(this.$store.getters['空的供应商退货单元素'])
        )
      })
    },
    // 删除退货单中的元素
    removeElementsFromList(index) {
      if (this.form['退货单'].length <= 1) {
        for (const key in this.form['退货单'][0]) {
          this.form['退货单'][0][key] = this.$store.getters[
            '空的供应商退货单元素'
          ][key]
        }
        return
      }
      this.form['退货单'].splice(index, 1)
    },
    formSubmit(e) {
      this.loading = true
      this.$nextTick(async() => {
        if (!this.continueToAddGoodsJudgmentCriteria()) {
          this.loading = false
          return
        }
        if (
          isEmpty(this.form['供应商名称']) ||
          isEmpty(this.form['供应商unique_id'])
        ) {
          this.loading = false
          this.$message({
            message: '不存在的供应商无法提交退货单！',
            type: 'warning'
          })
          return
        }
        var 退货单 = this.form.退货单.map(item => {
          const element = {}
          for (const key in item) {
            if (key !== '最大可退货数量') element[key] = item[key]
          }
          return element
        })
        var paramter = {
          login_token: this.$store.getters.token,
          供应商unique_id: this.form.供应商unique_id,
          退货单: 退货单
        }
        try {
          var res = await add_return_goods_note(paramter)
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
.invoice {
  .box-card {
    margin-bottom: 10px;
  }
  .form-btn-box {
    display: flex;
    justify-content: center;
  }
}
</style>
