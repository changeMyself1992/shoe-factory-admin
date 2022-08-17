<template>
  <div id="add-component-material-to-product" class="add-component-material-to-product">
    <el-table id="productLocationAndMaterialInfoSheet" class="table" :data="部位详情" border>
      <el-table-column type="index" width="50" align="center" />

      <el-table-column prop="部位名称" label="部位名称" align="center" width="150">
        <template slot-scope="scope">
          <el-autocomplete
            v-model.trim="scope.row.部位名称"
            class="inline-input"
            :fetch-suggestions="querySearchParts"
            placeholder="请输入内容"
            :disabled="modeComponents==='detail'"
            @select="handleSelectParts($event,scope.$index)"
            @input="debouncedhandlePartsNameInput(scope.$index)"
          />
        </template>
      </el-table-column>
      <el-table-column label="物料信息" align="center">
        <el-table-column align="center" prop="使用物料.物料编号" label="物料编号" width="180">
          <template slot-scope="scope_c">
            <el-input v-model.trim="scope_c.row.使用物料.物料编号" disabled />
          </template>
        </el-table-column>

        <el-table-column v-for="tag_name in 物料的标签" :key="tag_name" :label="tag_name" width="140">
          <template slot-scope="scope_d">
            <el-autocomplete
              v-model.trim="scope_d.row.使用物料.tags[tag_name]"
              class="inline-input"
              :fetch-suggestions="((queryString, callback,base_tags)=>tagQueryAutoCompleteSearch(tag_name,callback,scope_d.row.使用物料.tags))"
              placeholder="自动补全"
              :disabled="modeComponents==='detail'"
              @input="debouncedTagQueryAutoCompleteSearch(scope_d.$index)"
            />
          </template>
        </el-table-column>
      </el-table-column>

      <el-table-column prop="物料数量" label="物料数量" align="center" width="100">
        <template slot-scope="scope_b">
          <el-input
            v-model="scope_b.row.物料数量"
            type="number"
            :disabled="!determineWhetherTheDataInTheRowIsEditable(scope_b.row,'物料数量')"
            @blur="onMaterialNumInput(scope_b.$index)"
            @focus="($event)=>{$event.currentTarget.select()}"
          />
        </template>
      </el-table-column>

      <el-table-column v-if="管理权限['产品资料可读']" prop="使用物料.参考市场单价" label="参考市场单价" align="center" width="150">
        <template slot-scope="scope_b">
          <el-input
            v-model="scope_b.row.使用物料.参考市场单价"
            type="number"
            :disabled="!determineWhetherTheDataInTheRowIsEditable(scope_b.row,'参考市场单价')"
            @blur="onReferenceMarketPriceInput(scope_b.$index)"
            @focus="($event)=>{$event.currentTarget.select()}"
          />
        </template>
      </el-table-column>

      <el-table-column prop="使用物料.单位" label="单位" align="center" width="100">
        <template slot-scope="scope_b">
          <el-autocomplete
            v-model.trim="scope_b.row.使用物料.单位"
            class="inline-input"
            :disabled="!determineWhetherTheDataInTheRowIsEditable(scope_b.row,'单位')"
            :fetch-suggestions="querySearch"
          />
        </template>
      </el-table-column>

      <el-table-column prop="使用物料.备注" label="备注" align="center" min-width="150">
        <template slot-scope="scope_b">
          <el-input
            v-model="scope_b.row.使用物料.备注"
            :disabled="!determineWhetherTheDataInTheRowIsEditable(scope_b.row,'备注')"
            type="textarea"
            autosize
          />
        </template>
      </el-table-column>

      <el-table-column v-if="管理权限['产品资料可读']" label="供应商信息" align="center">
        <el-table-column align="center" prop="使用物料.所选供应商信息.名称" label="名称" width="220">
          <template slot-scope="scope_c">
            <el-select
              v-model="scope_c.row.使用物料.所选供应商信息.名称"
              filterable
              clearable
              placeholder="请输入关键词"
              :filter-method="(value)=>{filterMethod(scope_c.row.使用物料.所选供应商信息.名称,scope_c.row,value)}"
              :loading="loading"
              :disabled="!determineWhetherTheDataInTheRowIsEditable(scope_c.row,'名称')"
              @focus="(value)=>{filterMethod(scope_c.row.使用物料.所选供应商信息.名称,scope_c.row,value)}"
              @change="handleChange($event,scope_c.row)"
            >
              <el-option-group v-for="group in options" :key="group.label" :label="group.label">
                <el-option
                  v-for="item in group.options"
                  :key="item.名称"
                  :label="item.名称"
                  :value="item"
                />
              </el-option-group>
            </el-select>
          </template>
        </el-table-column>

        <el-table-column align="center" prop="使用物料.所选供应商信息.供应商物料名称" label="供应商物料名称" width="150">
          <template slot-scope="scope_c">
            <el-autocomplete
              v-model.trim="scope_c.row.使用物料.所选供应商信息.供应商物料名称"
              :fetch-suggestions="((queryString, callback,row)=>querySearchAsync(scope_c.row.使用物料.所选供应商信息.名称,callback,scope_c.row.使用物料.所选供应商信息.unique_id))"
              placeholder="暂无"
              :disabled="!determineWhetherTheDataInTheRowIsEditable(scope_c.row,'供应商物料名称')"
              @select="handleSelect($event,scope_c.row)"
            />
          </template>
        </el-table-column>

        <el-table-column align="center" prop="使用物料.所选供应商信息.供应商价格" label="供应商价格" width="150">
          <template slot-scope="scope_c">
            <el-input
              v-model="scope_c.row.使用物料.所选供应商信息.供应商价格"
              type="number"
              :disabled="!determineWhetherTheDataInTheRowIsEditable(scope_c.row,'供应商价格')"
              @blur="onSupplierPriceInput(scope_c.$index)"
              @focus="($event)=>{$event.currentTarget.select()}"
            />
          </template>
        </el-table-column>

        <el-table-column align="center" prop="使用物料.所选供应商信息.说明" label="说明" width="150">
          <template slot-scope="scope_c">
            <el-input
              v-model="scope_c.row.使用物料.所选供应商信息.说明"
              type="textarea"
              :disabled="!determineWhetherTheDataInTheRowIsEditable(scope_c.row,'供应商价格')"
              autosize
              @focus="($event)=>{$event.currentTarget.select()}"
            />
          </template>
        </el-table-column>
      </el-table-column>
    </el-table>
    <scrollbar-a
      :parent-component-id="'add-component-material-to-product'"
      :table-i-d="'productLocationAndMaterialInfoSheet'"
      :adsorption-highly="500"
    />
  </div>
</template>

<script>
import scrollbarA from '@/views/components/scrollbarA'
import { mapGetters } from 'vuex'
import {
  material_tags_auto_complete,
  filter_warehouse_material
} from '@/api/warehouseProcurement'
import { auto_complete_supplier_for_product_material } from '@/api/supplier'
import { generate_year_month_sequence_number } from '@/api/otherUtilityClasses'
import {
  filter_component,
  get_supplier_goods,
  get_supplier_goods_price,
  filter_nearest_product_appoint_tags,
  product_tags_auto_complete
} from '@/api/maintenanceOfProcessPartsOfProductLibrary'
import {
  deepClone,
  isEmpty,
  isObjectValueEqual,
  objectWhetherAllKeysHaveNoNullValue,
  objectHasAtLeastOneKeyWhoseValueIsNotNull,
  compareObj
} from '@/utils'
export default {
  // scrollbarA
  components: { scrollbarA },
  props: {
    // 父组件传递过来的部位详情数组
    partsList: {
      type: Array,
      default: function() {
        return []
      }
    },
    // 父组件的模式 必须要传过来
    modeComponents: {
      type: String,
      required: true
    },
    // 父组件传递过来的标签
    tags: {
      type: Object,
      default: function() {
        return {}
      }
    }
  },
  data() {
    return {
      部位详情: [],
      // 产品的空部位元素
      theEmptyPartElementOfTheProduct: {},
      // 是否启用按钮loading状态防止多次点击
      btnLoading: false,
      // 当前选中的供应商
      curSelectSupplier: {},
      // 常用的单位
      units: [
        { value: '双' },
        { value: '码' },
        { value: '尺' },
        { value: '寸' },
        { value: '件' }
      ],
      tableHeight: '',
      全部的部位: [],
      options: [],
      loading: false,
      // 当前操作的部位索引
      curIndex: 0,

      form: {
        tags: {},
        tagsCheckbox: {}
      },
      whetherToExpandLocationDetails: false, // 是否展开部位详情信息
      // 产品选择索引
      curSelectIndex: 0,
      // 查询会开的全部相似的产品
      arrayOfSimilarProducts: [],
      // 是否正在进行标签输入处理
      whetherLabelInputProcessingIsTakingPlace: false,
      部位列表: [
        {
          unique_id: '...',
          备注: '',
          描述: '',
          部位名称: '...'
        }
      ],
      allPart: [],
      // 当前选中的产品
      curSelectedProduct: {}
    }
  },
  computed: {
    ...mapGetters(['物料的标签', '管理权限']),
    partStatusDes() {
      if (this.whetherToExpandLocationDetails) return '关闭部位详情'
      else return '展开部位详情'
    }
  },
  watch: {
    partsList: function(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.initPartDetail()
      }
    }
  },
  created() {
    this.tableHeight = window.innerHeight * 0.45
    this.debouncedTagQueryAutoCompleteSearch = this.$_.debounce(
      this.handleInputFormMaterialTag,
      500
    )
    this.debouncedhandlePartsNameInput = this.$_.debounce(
      this.handlePartsNameInput,
      1000
    )
    this.initPartDetail()
  },
  mounted() {},
  methods: {
    // 初始化部位详情
    async initPartDetail() {
      var res = await filter_component({
        login_token: this.$store.getters.token,
        return_fields: ['部位名称']
      })
      this.allPart = deepClone(res.data)
      var 全部的部位 = res.data
      全部的部位 = 全部的部位.map(item => {
        return {
          value: item.部位名称,
          部位名称: item.部位名称
        }
      })
      this.全部的部位 = 全部的部位

      this.部位详情 = []
      if (this.partsList.length === 0) {
        for (let i = 0; i < res.data.length; i++) {
          const element = res.data[i]
          var theEmptyPartElementOfTheProduct = deepClone(
            this.$store.getters.产品的空部位元素
          )
          var tags = {}
          for (let j = 0; j < this.$store.getters.物料的标签.length; j++) {
            const tag = this.$store.getters.物料的标签[j]
            tags[tag] = ''
          }
          theEmptyPartElementOfTheProduct.unique_id = element.unique_id
          theEmptyPartElementOfTheProduct.部位名称 = element.部位名称
          theEmptyPartElementOfTheProduct.使用物料.tags = tags
          theEmptyPartElementOfTheProduct.使用物料.所选供应商信息 = deepClone(
            this.$store.getters.物料的空的供应商信息
          )
          this.部位详情.push(theEmptyPartElementOfTheProduct)
        }
      } else {
        // 如果父组件传递部位详情列表信息过来 那么使用父组件数据
        this.部位详情 = deepClone(this.partsList)
      }
    },
    // 对物料标签进行自动补全操作
    async tagQueryAutoCompleteSearch(tag_name, callback, base_tags) {
      base_tags[tag_name] = base_tags[tag_name].trim()
      var post_data = {
        login_token: this.$store.getters.token,
        base_tags: base_tags,
        target_tag_name: tag_name
      }
      const response = await material_tags_auto_complete(post_data)
      var suggest_value_list = []
      for (var index in response.data) {
        suggest_value_list.push({
          value: response.data[index]
        })
      }
      callback(suggest_value_list)
    },

    // 当物料标签进行输入的时候
    async handleInputFormMaterialTag(index) {
      this.部位详情[index].使用物料.unique_id = ''
      this.部位详情[index].使用物料.物料编号 = ''
      // 先判断 如果标签没有全部输满，那么不做查询请求直接退
      if (
        !objectWhetherAllKeysHaveNoNullValue(this.部位详情[index].使用物料.tags)
      ) {
        return
      }
      var post_data = {
        login_token: this.$store.getters.token,
        tags: this.部位详情[index].使用物料.tags,
        sort: { 更新时间: -1 }
      }
      const response = await filter_warehouse_material(post_data)
      const data = response.data
      // 如果查询结果长度大于0,那么遍历所有的物料，查找是否有和我输入的标签完全一致如果有那么选中它
      if (!isEmpty(data) || data.length > 0) {
        for (let i = 0; i < data.length; i++) {
          const element = data[i]
          if (
            isObjectValueEqual(element.tags, this.部位详情[index].使用物料.tags)
          ) {
            this.部位详情[index].使用物料.tags = element.tags
            this.部位详情[index].使用物料.unique_id = element.unique_id
            this.部位详情[index].使用物料.单位 = element.单位
            this.部位详情[index].使用物料.备注 = element.备注
            this.部位详情[index].使用物料.物料编号 = element.物料编号
            return
          }
        }
      } else {
        // 判断如果查询结果为0，或者没有找到和输入标签一模一样的，那么生成物料编号
        const res_a = await generate_year_month_sequence_number({
          login_token: this.$store.getters.token,
          流水单分组: 'CPD'
        })
        var code = res_a.data['流水号']
        var unique_id = code
        this.部位详情[index].使用物料.unique_id = unique_id
        this.部位详情[index].使用物料.物料编号 = unique_id
      }
    },

    // 当物料单位输入的时候
    onMaterialUnitInput(index) {
      this.部位详情[index]['使用物料']['单位'] = String(
        this.部位详情[index]['使用物料']['单位']
      ).trim()
    },

    // 当物料数量失去焦点的时候
    onMaterialNumInput(index) {
      var 物料数量 = this.部位详情[index]['物料数量']
      if (!物料数量 || Number(parseFloat(物料数量)) < 0) {
        this.部位详情[index]['物料数量'] = 0
      } else {
        this.部位详情[index]['物料数量'] = Number(
          parseFloat(物料数量).toFixed(2)
        )
      }
    },
    // 当参考市场单价输入的时候
    onReferenceMarketPriceInput(index) {
      var 参考市场单价 = this.部位详情[index]['使用物料']['参考市场单价']
      if (!参考市场单价 || Number(parseFloat(参考市场单价)) < 0) {
        this.部位详情[index]['使用物料']['参考市场单价'] = 0
      } else {
        this.部位详情[index]['使用物料']['参考市场单价'] = Number(
          parseFloat(参考市场单价).toFixed(2)
        )
      }
    },
    // 当输入供应商价格的时候
    onSupplierPriceInput(index) {
      var 供应商价格 = this.部位详情[index]['使用物料']['所选供应商信息'][
        '供应商价格'
      ]
      if (!供应商价格 || Number(parseFloat(供应商价格)) < 0) {
        this.部位详情[index]['使用物料']['所选供应商信息']['供应商价格'] = 0
      } else {
        this.部位详情[index]['使用物料']['所选供应商信息'][
          '供应商价格'
        ] = Number(parseFloat(供应商价格).toFixed(2))
      }
    },

    // 对供应商名称进行自动补全操作
    async filterMethod(queryString, row, value = '') {
      this.loading = true
      var suggest_value_list = []
      var post_data = {
        login_token: this.$store.getters.token,
        供应商名称: typeof value === 'string' ? value : '',
        物料unique_id: row.使用物料.物料编号
      }
      const response = await auto_complete_supplier_for_product_material(
        post_data
      )

      var 供应商 = response.data.其他供应商.供应商
      for (let i = 0; i < 供应商.length; i++) {
        suggest_value_list.push(供应商[i])
      }
      var 已有的供应商 = response.data.已有的供应商
      for (let j = 0; j < 已有的供应商.length; j++) {
        suggest_value_list.push(已有的供应商[j])
      }
      row['使用物料']['供应商列表'] = suggest_value_list

      this.options = [
        {
          label: '暂无物料的供应商',
          options: 供应商
        },
        {
          label: '已有物料的供应商',
          options: 已有的供应商
        }
      ]
      this.loading = false
    },
    // 供应商选择回调
    handleChange(item, row) {
      console.log('打印选中的供应商和当前行数据')
      console.log(item)
      console.log(row)
      if (!item) {
        row['使用物料']['所选供应商信息'].unique_id = ''
        row['使用物料']['所选供应商信息']['仓库剩余数量'] = 0
        row['使用物料']['所选供应商信息']['供应商价格'] = 0
        row['使用物料']['所选供应商信息']['供应商物料名称'] = ''
        row['使用物料']['所选供应商信息']['名称'] = ''
        row['使用物料']['所选供应商信息']['更新时间'] = ''
        row['使用物料']['所选供应商信息']['说明'] = ''
      } else {
        this.curSelectSupplier = item
        row['使用物料']['所选供应商信息'].unique_id = item.unique_id
        row['使用物料']['所选供应商信息']['仓库剩余数量'] = item.hasOwnProperty(
          '仓库剩余数量'
        )
          ? Number(item['仓库剩余数量'])
          : 0
        row['使用物料']['所选供应商信息']['供应商价格'] = item.hasOwnProperty(
          '供应商价格'
        )
          ? Number(item['供应商价格'])
          : 0
        row['使用物料']['所选供应商信息'][
          '供应商物料名称'
        ] = item.hasOwnProperty('供应商物料名称') ? item['供应商物料名称'] : ''
        row['使用物料']['所选供应商信息']['名称'] = item['名称']
        row['使用物料']['所选供应商信息']['更新时间'] = item['更新时间']
        row['使用物料']['所选供应商信息']['说明'] = item.hasOwnProperty('说明')
          ? item['说明']
          : ''
      }
    },
    // 查询供应商送货单中的产品名称
    async querySearchAsync(queryString, cb, supplier_unique_id) {
      if (!supplier_unique_id) cb([])
      var post_data = {
        login_token: this.$store.getters.token,
        supplier_unique_id: supplier_unique_id
      }
      const response = await get_supplier_goods(post_data)
      var data = response.data
      data = data.map(name => {
        return {
          value: name
        }
      })
      cb(data)
    },
    // 选择供应商物料名称之后
    async handleSelect(item, row) {
      var post_data = {
        login_token: this.$store.getters.token,
        goods_name: item.value,
        supplier_unique_id: row.使用物料.所选供应商信息.unique_id
      }
      const response = await get_supplier_goods_price(post_data)
      var data = response.data
      row.使用物料.所选供应商信息['供应商价格'] = data.goods_price
      row.使用物料.所选供应商信息['说明'] = data.emarks
    },

    // 清空部位的方法
    clearPart(index) {
      this.btnLoading = true
      this.curIndex = index
      setTimeout(() => {
        this.btnLoading = false
      }, 1000)

      var theEmptyPartElementOfTheProduct = deepClone(
        this.$store.getters.产品的空部位元素
      )
      var tags = {}
      for (let j = 0; j < this.$store.getters.物料的标签.length; j++) {
        const tag = this.$store.getters.物料的标签[j]
        tags[tag] = ''
      }
      theEmptyPartElementOfTheProduct.unique_id = ''
      theEmptyPartElementOfTheProduct.部位名称 = ''
      theEmptyPartElementOfTheProduct.使用物料.tags = tags
      theEmptyPartElementOfTheProduct.使用物料.所选供应商信息 = deepClone(
        this.$store.getters.物料的空的供应商信息
      )
      this.部位详情[index] = theEmptyPartElementOfTheProduct
    },
    // 删除部位
    removePart(index) {
      if (this.部位详情.length <= 1) {
        this.$message({
          type: 'warning',
          message: '至少得包含一个部位！！！'
        })
        return
      }
      this.部位详情.splice(index, 1)
    },
    // 检查 部位详情数组中的元素  数据结构是否正常
    checkPartsDetail() {
      for (let r = 0; r < this.部位详情.length; r++) {
        const element_wai = this.部位详情[r]

        // 如果部位名称为空那么，提示请选择一个部位
        if (isEmpty(element_wai.部位名称) || isEmpty(element_wai.unique_id)) {
          this.$message({
            type: 'warning',
            message: `第${r + 1}行，部位名称是必须填项目。`
          })
          return false
        }

        // 如果用户全部输完物料标签，但是还没有生成物料编号 提示稍等片刻
        if (objectWhetherAllKeysHaveNoNullValue(element_wai.使用物料.tags)) {
          if (
            isEmpty(element_wai.使用物料.unique_id) ||
            isEmpty(element_wai.使用物料.物料编号)
          ) {
            this.$message({
              type: 'warning',
              message: `第${r + 1}行,正在生成物料编号，稍等片刻。`
            })
            return false
          }
        }

        // 如果用户没有输完全部的标签，但是有物料编号（那么代表他有对标签进行删除,提示稍等片刻）
        if (!objectWhetherAllKeysHaveNoNullValue(element_wai.使用物料.tags)) {
          if (
            !isEmpty(element_wai.使用物料.unique_id) ||
            !isEmpty(element_wai.使用物料.物料编号)
          ) {
            this.$message({
              type: 'warning',
              message: `第${r + 1}行,正在计算新的物料编号，稍等片刻。`
            })
            return false
          }
        }

        // 如果至少输入了一条物料标签，但是还没有生成编号，提示如果要填写物料必须4个标签全部填写
        if (
          objectHasAtLeastOneKeyWhoseValueIsNotNull(element_wai.使用物料.tags)
        ) {
          if (
            isEmpty(element_wai.使用物料.unique_id) ||
            isEmpty(element_wai.使用物料.物料编号)
          ) {
            this.$message({
              type: 'warning',
              message: `第${r +
                1}行，缺少物料编号，要生成物料编号必须填写全部的物料信息。`
            })
            return false
          }
        }

        // 如果用户输入了供应商名称，但是供应商列表长度为0，代表这个名称根本在数据库不存在，也不允许提交
        if (
          !isEmpty(element_wai['使用物料']['所选供应商信息']['名称']) &&
          element_wai['使用物料']['供应商列表'].length === 0
        ) {
          this.$message({
            type: 'warning',
            message: `第${r +
              1}行，该供应商名称不存在，无法提交，请从搜索项中选一个供应商。`
          })
          return false
        }

        // 如果用户输入了供应商名称，但是在供应商列表中找不到跟这个名称一模一样的，那么也不允许提交
        var 供应商列表 = element_wai['使用物料']['供应商列表']
        var isExist = 供应商列表.some(item => {
          return (
            item['名称'] === element_wai['使用物料']['所选供应商信息']['名称']
          )
        })
        if (
          !isEmpty(element_wai['使用物料']['所选供应商信息']['名称']) &&
          !isExist
        ) {
          this.$message({
            type: 'warning',
            message: `第${r +
              1}行，该供应商名称不存在，无法提交，请从搜索项中选一个供应商。`
          })
          return false
        }

        // 如果用户没有输入供应商名称，但是却输入了其他供应商信息 ，也不允许提交
        if (
          isEmpty(element_wai['使用物料']['所选供应商信息']['名称']) &&
          objectHasAtLeastOneKeyWhoseValueIsNotNull(
            element_wai['使用物料']['所选供应商信息']
          )
        ) {
          this.$message({
            type: 'warning',
            message: `第${r +
              1}行，如果要填写供应商其他信息，那么首先供应商名称是必填的。`
          })
          return false
        }

        for (let c = r + 1; c < this.部位详情.length; c++) {
          const element_nei = this.部位详情[c]
          // 如果有重复的部位那么也不允许提交
          if (
            element_wai.部位名称 === element_nei.部位名称 ||
            element_wai.unique_id === element_nei.unique_id
          ) {
            this.$message({
              type: 'warning',
              message: `第${r + 1}行，第${c +
                1}行，一个产品不允许有重复的部位。`
            })
            return false
          }
          // 如果两个标签不相同，但是他们的编号相同，并且编号都不为空(说明在延迟查询的这两秒里面他在快速点击，也不允许提交)
          if (
            !compareObj(element_wai.使用物料.tags, element_nei.使用物料.tags) &&
            element_wai.使用物料.物料编号 === element_nei.使用物料.物料编号 &&
            !isEmpty(element_wai.使用物料.物料编号)
          ) {
            this.$message({
              type: 'warning',
              message: `正在生成新编号，稍等两秒...`
            })
            return false
          }
        }
      }
      return true
    },
    // 该计算属性让父组件调用返回 部位详情
    returnPartsDetail() {
      if (!this.checkPartsDetail()) return null
      return this.部位详情
    },
    // 判断该行数据是否可编辑
    determineWhetherTheDataInTheRowIsEditable(row, columnName) {
      if (this.modeComponents === 'detail') return false
      else {
        // 如果是其他模式，那么需要判断该行是否有物料编号，没有物料编号也是不允许编辑
        if (
          isEmpty(row['使用物料'].unique_id) ||
          isEmpty(row['使用物料']['物料编号'])
        ) {
          return false
        } else {
          // 如果有物料编号,那么判断列名（物料数量，参考市场单价，单位，备注  这些不属于供应商信息，直接返回true）
          if (
            columnName === '物料数量' ||
            columnName === '参考市场单价' ||
            columnName === '单位' ||
            columnName === '备注'
          ) {
            return true
          } else {
            // 如果是供应商信息里面的列，那么判断列名，如果是名称（该列用于自动补全）直接返回true
            if (columnName === '名称') return true
            else {
              // 如果不是名称,那么就要判断是否已点选了一个供应商，如果已点选 那么返回 true
              if (!isEmpty(row.使用物料.所选供应商信息.unique_id)) return true
              else return false
            }
          }
        }
      }
    },
    querySearch(queryString, cb) {
      cb(this.units)
    },
    handleSelectUnit(item) {
      console.log(item)
    },

    querySearchParts(queryString, cb) {
      var 全部的部位 = this.全部的部位
      function createFilter(queryString) {
        return 全部的部位 => {
          return (
            全部的部位.value
              .toLowerCase()
              .indexOf(queryString.toLowerCase()) === 0
          )
        }
      }
      var results = queryString
        ? 全部的部位.filter(createFilter(queryString))
        : 全部的部位
      // 调用 callback 返回建议列表的数据
      cb(results)
    },
    handleSelectParts(item, index) {
      this.部位详情[index].unique_id = item.value
    },
    // 继续添加部位
    continueAdd(index) {
      if (!this.checkPartsDetail()) return
      var theEmptyPartElementOfTheProduct = deepClone(
        this.$store.getters.产品的空部位元素
      )
      var tags = {}
      for (let j = 0; j < this.$store.getters.物料的标签.length; j++) {
        const tag = this.$store.getters.物料的标签[j]
        tags[tag] = ''
      }
      theEmptyPartElementOfTheProduct.unique_id = ''
      theEmptyPartElementOfTheProduct.部位名称 = ''
      theEmptyPartElementOfTheProduct.使用物料.tags = tags
      theEmptyPartElementOfTheProduct.使用物料.所选供应商信息 = deepClone(
        this.$store.getters.物料的空的供应商信息
      )

      this.部位详情.splice(index + 1, 0, theEmptyPartElementOfTheProduct)
    },
    // 部位名称输入的时候调用
    handlePartsNameInput(index) {
      var 部位名称 = this.部位详情[index].部位名称
      if (!isEmpty(部位名称)) {
        this.部位详情[index].unique_id = 部位名称
      }
    },
    // 智能匹配按钮点击
    async intelligentMatchingBtnClick() {
      this.curSelectIndex = 0
      this.curSelectedProduct = {}
      this.arrayOfSimilarProducts = []
      if (this.modeComponents === 'add') {
        // 获取产品标签
        var tag_names = this.$store.getters.产品的标签
        for (var index in tag_names) {
          this.$set(this.form.tags, tag_names[index], '')
          this.$set(this.form.tagsCheckbox, tag_names[index], false)
        }
      } else if (this.modeComponents === 'edit') {
        this.form.tags = deepClone(this.tags)
        for (const key in this.form.tags) {
          if (this.form.tags[key]) {
            this.$set(this.form.tagsCheckbox, key, true)
          } else {
            this.$set(this.form.tagsCheckbox, key, false)
          }
        }
        // 如果该产品全部都空标签
        if (!objectHasAtLeastOneKeyWhoseValueIsNotNull(this.form.tags)) {
          this.$message({
            type: 'warning',
            message: '该产品全部都是空标签无法智能匹配！'
          })
          return
        } else {
          await this.filterNearestProductAppointTags()
        }
      }
    },
    // 对产品标签进行自动补全操作
    async productTagQueryAutoCompleteSearch(queryString, callback, tag_name) {
      if (queryString === undefined || queryString === null) {
        queryString = ''
      }
      var login_token = this.$store.getters.token
      var base_tags = deepClone(this.form.tags)
      for (const key in base_tags) {
        if (this.form.tagsCheckbox[key]) continue
        else base_tags[key] = ''
      }
      var post_data = {
        login_token: login_token,
        base_tags: base_tags,
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
    // 当标签输入的时候 那么就应该去查询产品了
    handleBlur() {
      // 需要使用定时器，因为 输入焦点事件快于下拉选中
      setTimeout(async() => {
        this.whetherLabelInputProcessingIsTakingPlace = true
        setTimeout(() => {
          this.whetherLabelInputProcessingIsTakingPlace = false
        }, 800)
        this.filterNearestProductAppointTags()
      }, 200)
    },
    // 当打钩事件触发的时候 也应该去查询产品了
    checkboxChange() {
      this.whetherLabelInputProcessingIsTakingPlace = true
      setTimeout(() => {
        this.whetherLabelInputProcessingIsTakingPlace = false
      }, 500)
      this.filterNearestProductAppointTags()
    },

    // 智能匹配api
    async filterNearestProductAppointTags() {
      this.arrayOfSimilarProducts = []
      // 把勾选的标签选出来
      var tags = {}
      for (const key in this.form.tagsCheckbox) {
        if (this.form.tagsCheckbox[key]) {
          tags[key] = this.form.tags[key]
        }
      }
      if (isEmpty(tags)) {
        this.$message({
          type: 'warning',
          message: '至少得勾选一个标签！！！'
        })
        return
      }
      // 检查是否至少输入了一个标签
      if (!objectHasAtLeastOneKeyWhoseValueIsNotNull(tags)) {
        this.$message({
          type: 'warning',
          message: '已打钩的标签至少得有一个不为空！！！'
        })
        return
      }
      // 把不为空的标签选出来
      for (const key in tags) {
        if (!tags[key]) {
          delete tags[key]
        }
      }

      var post_data = {
        login_token: this.$store.getters.token,
        tags: tags
      }
      var response = await filter_nearest_product_appoint_tags(post_data)
      if (isEmpty(response.data)) {
        this.$message({
          type: 'warning',
          message: '没有匹配到任何相似产品！！！'
        })
        return
      }
      this.arrayOfSimilarProducts = deepClone(response.data)
    },
    // 生成部位详情文字
    generateLocationDetailsText(partDetails, partName) {
      // 先找到 这个部位
      var partDetail = partDetails.find(item => {
        return item['部位名称'] === partName
      })
      var component_details = ''
      if (!isEmpty(partDetail)) {
        if (!isEmpty(partDetail['使用物料'].tags['物料名称'])) {
          component_details += partDetail['使用物料'].tags['物料名称'] + '; '
        }
        if (!isEmpty(partDetail['使用物料']['单位'])) {
          component_details +=
            partDetail['物料数量'] + partDetail['使用物料']['单位'] + '; '
        }
      }
      return component_details
    },
    // 展开部位详情按钮点击
    partArrowClick() {
      this.whetherToExpandLocationDetails = !this.whetherToExpandLocationDetails
      if (this.whetherToExpandLocationDetails) {
        this.部位列表 = deepClone(this.allPart)
      } else {
        this.部位列表 = [
          {
            unique_id: '...',
            备注: '',
            描述: '',
            更新时间: '',
            部位名称: '...'
          }
        ]
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.add-component-material-to-product {
  font-size: 12px;
  width: 100%;
  padding-bottom: 30px;
  position: relative;
  .opetion-box {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .remove {
      font-size: 30px;
      color: #f56c6c;
    }
    .continue-add {
      font-size: 30px;
      color: #409eff;
    }
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
  }
}
</style>

<style lang="scss" >
.my-autocomplete {
  .supplier-box {
    display: flex;
    flex-wrap: wrap;
    line-height: 24px;
    margin-bottom: 20px;
    .title {
      font-weight: 700;
      width: 100%;
      border-bottom: 1px solid #ccc;
    }
    .supplier-info {
      width: 100%;
      display: flex;
      flex-wrap: wrap;
      border-bottom: 1px dashed #ccc;
      .name {
        width: 100%;
        text-overflow: ellipsis;
        overflow: hidden;
        font-size: 12px;
        color: black;
      }
      .item {
        width: 100%;
        text-overflow: ellipsis;
        overflow: hidden;
        .key {
          font-size: 12px;
          color: #b4b4b4;
        }
        .value {
          font-size: 12px;
          color: #b4b4b4;
        }
      }
    }
    .supplier-info:hover {
      background-color: #767879;
    }
  }
}
</style>
