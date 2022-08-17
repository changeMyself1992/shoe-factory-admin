<template>
  <div class="product-list-a">
    <el-button
      v-if="isShowAddProduct"
      :loading="btnLoading"
      class="addPro"
      type="primary"
      size="small"
      @click="addProduct()"
    >继续添加产品</el-button>

    <el-button
      v-if="isShowDownloadExcelBtn"
      :loading="btnLoading"
      class="downloadExcel"
      type="primary"
      size="small"
      @click="downloadExcelTemplate()"
    >下载产品excel模板</el-button>

    <div v-if="isShowUploadExcelBtn" class="uploadExcel">
      <el-progress
        class="progress"
        :text-inside="true"
        :stroke-width="16"
        :percentage="excelUploadSchedule"
      />
      <upload-excel-component
        :loading="btnLoading"
        :on-success="handleSuccess"
        :before-upload="beforeUpload"
      />
    </div>

    <table id="table" :style="calculateTheWidthOfTheTable">
      <tr>
        <td v-if="isShowSelectProduct" rowspan="2">选择产品</td>
        <td v-if="whetherToShowTheNumberOfScheduledProduction" rowspan="2">可排产数</td>
        <td v-if="whetherTheNumberOfScheduledProductionIsShown" rowspan="2">已排产数</td>
        <td v-if="whetherToShowTotal" rowspan="2">总数</td>
        <td :colspan="tag_names.length+1">产品信息</td>
        <td rowspan="2">品牌</td>
        <td rowspan="2">客户产品编号</td>
        <td :colspan="配码数组.length+2">配码数量</td>
        <td v-if="isShowDeleteFromOrder" rowspan="2" colspan="2">从订单删除</td>
        <td v-if="isShowProductDetail" rowspan="2" colspan="2">产品详情</td>
      </tr>

      <tr>
        <td>产品编号</td>
        <td v-for="(item_a,index_a) in tag_names" :key="index_a">{{ item_a }}</td>
        <td v-for="(item_b) in 配码数组" :key="item_b.size">{{ item_b.size }}</td>
        <td>件数</td>
        <td>总数</td>
      </tr>

      <tr
        v-for="(product,product_index) in productList"
        :key="product_index"
        v-loading="whetherLabelInputProcessingIsTakingPlace"
      >
        <!--选择产品 按钮-->
        <td v-if="isShowSelectProduct" class="option">
          <el-radio
            v-model.trim="radio"
            :class="product['配码数量']['已经排产数量']>=product['配码数量']['总数']?'':'select-radio'"
            :label="product"
            border
            :disabled="product['配码数量']['已经排产数量']>=product['配码数量']['总数']"
            @change="selected"
          >
            <span class="select-text">选择</span>
          </el-radio>
        </td>

        <td
          v-if="whetherToShowTheNumberOfScheduledProduction"
        >{{ product['配码数量']['总数']-product['配码数量']['已经排产数量'] }}</td>
        <td v-if="whetherTheNumberOfScheduledProductionIsShown">{{ product['配码数量']['已经排产数量'] }}</td>
        <td v-if="whetherToShowTotal">{{ product['配码数量']['总数'] }}</td>

        <!--产品编号-->
        <td class="product-number">
          <el-input v-model.trim="product.产品信息.产品编号" placeholder disabled />
        </td>

        <!-- 产品标签 -->
        <td v-for="(value,tag_name) in product.产品信息.tags" :key="tag_name" class="tag">
          <el-tooltip
            class="item"
            effect="dark"
            :content="product.产品信息.tags[tag_name]"
            placement="bottom"
          >
            <el-autocomplete
              v-model.trim="product.产品信息.tags[tag_name]"
              :disabled="!whetherTheTagIsEditable"
              :fetch-suggestions="((queryString, callback)=>tagQueryAutoCompleteSearch(tag_name,product.产品信息.tags,callback))"
              @blur="handleBlur(product_index)"
            />
          </el-tooltip>
        </td>

        <!-- 品牌 -->
        <td class="brand">
          <el-autocomplete
            v-model.trim="product.品牌"
            :disabled="!whetherTheBrandIsEditable"
            size="mini"
            :fetch-suggestions="brandQuerySearch"
            @blur="customerProductNumberInput(product.品牌,brands)"
          />
        </td>

        <!-- 客户产品编号 -->
        <td class="cus-pro-num">
          <el-autocomplete
            v-model.trim="product.客户产品编号"
            :disabled="!isTheCustomerProductNumberEditable"
            size="mini"
            :fetch-suggestions="querySearch"
            @blur="customerProductNumberInput(product.客户产品编号,customerProductNumbers)"
          />
        </td>

        <!-- 配码输入 -->
        <td
          v-for="(size_info,size_index) in product.配码数量.配码"
          :key="size_index"
          class="pei-ma-input"
        >
          <el-tooltip
            class="item"
            effect="dark"
            :content="String(size_info.目标数量)"
            placement="bottom"
          >
            <el-input
              v-model.number="size_info.目标数量"
              :disabled="!isPeiMaEditable"
              type="number"
              size="mini"
              @focus="($event)=>{$event.currentTarget.select()}"
              @input="peiMaBlur(product_index,size_index,size_info.目标数量)"
            />
          </el-tooltip>
        </td>

        <!-- 件数 -->
        <td class="number">
          <el-input
            v-model.number="product.配码数量.件数"
            :disabled="!isPeiMaEditable"
            type="number"
            placeholder="0"
            size="mini"
            @focus="($event)=>{$event.currentTarget.select()}"
            @input="numberOfPieceBlur(product_index)"
          />
        </td>

        <!-- 总数 -->
        <td class="total">
          <el-tooltip
            class="item"
            effect="dark"
            :content="String(product.配码数量.总数)"
            placement="bottom"
          >
            <el-input
              v-model.trim="product.配码数量.总数"
              type="number"
              placeholder="0"
              size="mini"
              disabled
            />
          </el-tooltip>
        </td>

        <!-- 从订单删除 按钮 -->
        <td v-if="isShowDeleteFromOrder" class="option">
          <el-button type="danger" size="mini" @click="removeProductFromOrder(product_index)">删除</el-button>
        </td>

        <!--产品详情 按钮-->
        <td v-if="isShowProductDetail" class="option">
          <el-button type="primary" size="mini" @click="viewProductInformation(product.产品信息)">查看</el-button>
        </td>
      </tr>
    </table>
  </div>
</template>

<script>
import {
  product_tags_auto_complete,
  filter_product
} from '@/api/maintenanceOfProcessPartsOfProductLibrary'
import { generate_year_month_sequence_number } from '@/api/otherUtilityClasses'
import {
  isEmpty,
  deepClone,
  compareObj,
  isObjectValueEqual,
  beforeUploadExcel
} from '@/utils'
import UploadExcelComponent from './UploadExcel.vue'
export default {
  components: { UploadExcelComponent },
  props: {
    brand: {
      type: String,
      default: null
    },
    // 父组件传递过来的产品列表信息
    productListInfo: {
      type: Array,
      default: function() {
        return []
      }
    },
    // 标签是否可编辑
    whetherTheTagIsEditable: {
      type: Boolean,
      default: true
    },
    // 品牌是否可编辑
    whetherTheBrandIsEditable: {
      type: Boolean,
      default: true
    },
    // 客户产品编号是否可编辑
    isTheCustomerProductNumberEditable: {
      type: Boolean,
      default: true
    },
    // 配码是否可编辑
    isPeiMaEditable: {
      type: Boolean,
      default: true
    },
    // 是否显示继续添加产品按钮
    isShowAddProduct: {
      type: Boolean,
      default: true
    },
    // 是否显示下载产品excel模板按钮
    isShowDownloadExcelBtn: {
      type: Boolean,
      default: false
    },
    // 是否显示上传产品excel按钮
    isShowUploadExcelBtn: {
      type: Boolean,
      default: false
    },
    // 选择产品后 回调给父组件
    selectPostCallBack: {
      type: Function,
      default: null
    },
    // 是否显示选择产品操作项
    isShowSelectProduct: {
      type: Boolean,
      default: false
    },
    // 是否显示从订单删除操作项
    isShowDeleteFromOrder: {
      type: Boolean,
      default: false
    },
    // 是否显示产品详情操作项
    isShowProductDetail: {
      type: Boolean,
      default: false
    },
    // 是否显示可排产数
    whetherToShowTheNumberOfScheduledProduction: {
      type: Boolean,
      default: false
    },
    // 是否显示已排产数
    whetherTheNumberOfScheduledProductionIsShown: {
      type: Boolean,
      default: false
    },
    // 是否显示总数
    whetherToShowTotal: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      配码数组: [],
      productList: [],
      // 空产品数据结构
      emptyProduct: {},
      tag_names: [
        // '楦型',
        // '款号',
        // .....
      ],
      // 客户自己的品牌数组
      brands: [],
      // 客户产品编号
      customerProductNumbers: [],
      // 选中的产品
      radio: {},
      // 产品列表的excel表头（上传，下载，excel要用）
      excelHeader: [],
      btnLoading: false,
      excelUploadSchedule: 0,
      // 是否正在进行标签输入处理
      whetherLabelInputProcessingIsTakingPlace: false
    }
  },
  computed: {
    // 计算table的宽度
    calculateTheWidthOfTheTable() {
      var 产品信息的宽 = 170 + this.tag_names.length * 120
      var 品牌的宽 = 120
      var 客户产品编号的宽 = 120
      var 配码数量的宽 = this.配码数组.length * 100
      var 件数的宽 = 100
      var 总数的宽 = 100
      var 表格行操作的宽 = 100
      return `width: ${产品信息的宽 +
        品牌的宽 +
        客户产品编号的宽 +
        配码数量的宽 +
        件数的宽 +
        总数的宽 +
        表格行操作的宽}px;`
    }
  },
  watch: {
    brand: function(newVal, oldVal) {
      if (
        newVal &&
        !this.brands.find(item => {
          return item.value === newVal
        })
      ) {
        this.brands.push({
          value: newVal
        })
        this.emptyProduct.品牌 = newVal
        // 遍历productList 设置品牌名为默认
        this.productList.forEach(element => {
          element.品牌 = newVal
        })
      }
    },
    productListInfo: function(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.initializeData()
      }
    }
  },
  created() {
    this.initializeData()
  },
  mounted() {},
  methods: {
    // 初始化
    initializeData() {
      // 初始化配码数组
      this.initializesTheCollocationArray()
      // 初始化标签
      this.getProductTagName()
      // 初始化 emptyProduct
      var 配码 = []
      this.配码数组.forEach(element => {
        var item = {
          国标码: element.gjm,
          尺码: element.size,
          已排产数量: 0,
          目标数量: 0
        }
        配码.push(item)
      })
      this.emptyProduct = deepClone(this.$store.getters.订单包含的产品空元素)
      this.emptyProduct.配码数量.件数 = 1
      this.emptyProduct['配码数量']['配码'] = 配码

      this.initProductList()
      this.initExcelHeader()
    },

    // 初始化配码数组
    initializesTheCollocationArray() {
      if (this.productListInfo.length === 0) {
        this.配码数组 = deepClone(this.$store.getters['配码数组'])
      } else {
        var 配码 = this.productListInfo[0]['配码数量']['配码']
        this.配码数组 = 配码.map(item => {
          return {
            gjm: String(item['国标码']),
            size: String(item['尺码'])
          }
        })
      }
    },

    // 初始化excelHeader
    initExcelHeader() {
      var 产品的标签 = deepClone(this.$store.getters['产品的标签'])
      var 配码数组 = deepClone(this.配码数组)
      var 配码 = []
      for (let i = 0; i < 配码数组.length; i++) {
        var element = 配码数组[i]
        配码.push(String(element.size))
      }
      this.excelHeader = [
        ...产品的标签,
        '品牌',
        '客户产品编号',
        ...配码,
        '件数',
        '总数'
      ]
    },

    // 获取配置中对产品的tags数组，确保先载入
    getProductTagName(callback) {
      this.tag_names = this.$store.getters.产品的标签
    },

    /**
     * 对产品标签进行自动补全操作
     * tag_name 要查询的标签名
     * callback 要求一个数组为参数,这个数组就是点选范围
     */
    async tagQueryAutoCompleteSearch(tag_name, tags, callback) {
      var post_data = {
        login_token: this.$store.getters.token,
        base_tags: tags,
        target_tag_name: tag_name
      }
      // 调用api
      var response = await product_tags_auto_complete(post_data)
      var suggest_value_list = []
      for (var index in response.data) {
        suggest_value_list.push({
          value: response.data[index]
        })
      }
      callback(suggest_value_list)
    },

    // 初始化productList
    initProductList() {
      this.excelUploadSchedule = 0
      var emptyProduct = deepClone(this.emptyProduct)
      this.productList = []
      if (this.productListInfo.length === 0) {
        emptyProduct['品牌'] = ''
        var tags = {}
        for (let i = 0; i < this.tag_names.length; i++) {
          var element = this.tag_names[i]
          tags[element] = ''
        }
        emptyProduct.产品信息.tags = tags
        this.productList.push(emptyProduct)
      } else {
        // 如果父组件传递产品列表信息过来那么自己组合 使用父组件数据
        for (let i = 0; i < this.productListInfo.length; i++) {
          // eslint-disable-next-line no-redeclare
          var element = this.productListInfo[i]
          if (!element) return
          emptyProduct['产品信息'] = element['产品信息']
          emptyProduct['品牌'] = element['品牌']
          emptyProduct['客户产品编号'] = element['客户产品编号']
          emptyProduct['配码数量'] = element['配码数量']
          this.productList.push(element)
        }
      }
    },

    // 根据条件对产品进行搜索
    async filterProducts(post_data) {
      var response = await filter_product(post_data)
      return response.data
    },

    // 客户产品编号查询
    querySearch(queryString, cb) {
      var customerProductNumbers = this.customerProductNumbers
      var results = queryString
        ? customerProductNumbers.filter(this.createFilter(queryString))
        : customerProductNumbers
      // 调用 callback 返回建议列表的数据
      cb(results)
    },
    // 品牌查询搜索
    brandQuerySearch(queryString, cb) {
      var brands = this.brands
      var results = queryString
        ? brands.filter(this.createFilter(queryString))
        : brands
      // 调用 callback 返回建议列表的数据
      cb(results)
    },
    // 生成过滤
    createFilter(queryString) {
      return item => {
        return (
          item.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
        )
      }
    },

    // 当标签输入框离开焦点的时候
    handleBlur(product_index) {
      setTimeout(async() => {
        this.whetherLabelInputProcessingIsTakingPlace = true
        setTimeout(() => {
          this.whetherLabelInputProcessingIsTakingPlace = false
        }, 800)
        var tags = deepClone(this.productList[product_index].产品信息.tags)
        var post_data = {
          login_token: this.$store.getters.token,
          tags: tags
        }
        // 查询产品
        var res = await this.filterProducts(post_data)
        // 判断 如果查询结果为0，或者查询结果为空 那我们就要生成一个新产品，

        // 应该判断为空并且没有与之前重复的，才新生成一个
        if (isEmpty(res) || res.length === 0) {
          console.log(this.productList)
          for (let j = 0; j < this.productList.length; j++) {
            const ele = this.productList[j]
            if (isObjectValueEqual(ele.产品信息.tags, tags) && j !== product_index) {
              console.log('=============')
              this.productList[product_index].产品信息 = deepClone(ele.产品信息)
              return
            }
          }
          var res_a1 = await generate_year_month_sequence_number({
            login_token: this.$store.getters.token,
            流水单分组: 'CPD'
          })
          var code1 = res_a1.data['流水号']
          this.productList[product_index].产品信息.产品编号 = code1
          this.productList[product_index].产品信息.unique_id = code1
        } else {
          // 如果查询结果长度 大于0,那么遍历所有的产品 查找是否有和我输入的标签完全一致的产品 如果有那么选中它
          for (let i = 0; i < res.length; i++) {
            var element = res[i]
            if (isObjectValueEqual(element.tags, tags)) {
              this.productList[product_index].产品信息 = element
              return
            }
          }
          var res_a2 = await generate_year_month_sequence_number({
            login_token: this.$store.getters.token,
            流水单分组: 'CPD'
          })
          var code2 = res_a2.data['流水号']
          // 如果没有找到完全相等的那么 创建新的
          this.productList[product_index].产品信息.产品编号 = code2
          this.productList[product_index].产品信息.unique_id = code2
        }
      }, 200)
    },

    // 客户产品编号和品牌输入框失去焦点的时候
    customerProductNumberInput(item, array) {
      if (!item) return
      var isRepetition = false
      for (let i = 0; i < array.length; i++) {
        var element = array[i]
        if (element.value === item) isRepetition = true
      }
      if (isRepetition) return
      array.push({
        value: item
      })
    },
    // 配码输入的时候
    peiMaBlur(product_index, size_index, 目标数量) {
      this.productList[product_index]['配码数量']['配码'][size_index][
        '目标数量'
      ] = 目标数量 ? Math.abs(Math.ceil(目标数量)) : 0
      // 计算总数
      this.calculateTheTotalNumberOfCodes(product_index)
    },
    // 件数输入框失去焦点的时候
    numberOfPieceBlur(product_index) {
      var 件数 = this.productList[product_index]['配码数量']['件数']
      if (!件数 || parseInt(件数) < 1) {
        this.productList[product_index]['配码数量']['件数'] = 1
      }
      // 计算总数
      this.calculateTheTotalNumberOfCodes(product_index)
    },
    // 计算配码总数
    calculateTheTotalNumberOfCodes(product_index) {
      var count = 0
      for (
        let i = 0;
        i < this.productList[product_index]['配码数量']['配码'].length;
        i++
      ) {
        var element = this.productList[product_index]['配码数量']['配码'][i]
        count = count + Number(element.目标数量)
      }
      this.productList[product_index]['配码数量']['总数'] =
        count * this.productList[product_index]['配码数量']['件数']
    },
    // 添加产品
    addProduct() {
      setTimeout(async() => {
        var res = await this.checkProductList(false)
        if (!res) return
        var addProduct = deepClone(this.productList[this.productList.length - 1])
        this.productList.push(addProduct)
      }, 800)
    },
    // 把选中的产品从订单中删除
    removeProductFromOrder(product_index) {
      if (this.productList.length <= 1) {
        this.$message({
          type: 'warning',
          message: '至少得包含一个产品！！！'
        })
        return
      }
      this.productList.splice(product_index, 1)
    },
    // 该计算属性让父组件调用返回 productList
    async returnProductList() {
      var bool = await this.checkProductList()
      if (!bool) return null
      var productList = deepClone(this.productList)
      for (let i = 0; i < productList.length; i++) {
        var product = productList[i]
        product['配码数量']['配码'].forEach(element => {
          element.目标数量 = product['配码数量']['件数'] * element.目标数量
        })
        product['配码数量']['件数'] = 1
      }
      return productList
    },
    // 检查productList数据结构是否正常
    // beforeAndAfter 是否进行前后比较
    async checkProductList(beforeAndAfter = true) {
      // 是否允许产品重复
      var whetherOrNotDuplicationIsAllowed = false
      for (let r = 0; r < this.productList.length; r++) {
        var element_wai = this.productList[r]
        // 如果productList 中有产品编号未完成，不可添加，
        if (isEmpty(element_wai.产品信息.产品编号)) {
          this.$message({
            type: 'warning',
            message: '每一行必须包含产品编号！！！'
          })
          return false
        }
        if (isEmpty(element_wai.配码数量.总数)) {
          this.$message({
            type: 'warning',
            message: '订单的产品总数必须大于0'
          })
          return false
        }
        if (!beforeAndAfter) continue
        for (let c = r + 1; c < this.productList.length; c++) {
          // 如果找到重复的编号或者是完全一样的标签信息，那么也不可添加
          var element_nei = this.productList[c]
          if (
            element_nei.产品信息.产品编号 === element_wai.产品信息.产品编号 ||
            compareObj(element_nei.产品信息.tags, element_wai.产品信息.tags)
          ) {
            if (whetherOrNotDuplicationIsAllowed) continue
            try {
              await this.$confirm(
                '检查到重复的产品是否确认添加？',
                '重复产品确认',
                {
                  confirmButtonText: '确定',
                  cancelButtonText: '取消',
                  type: 'warning'
                }
              )
              whetherOrNotDuplicationIsAllowed = true
            } catch (error) {
              return false
            }
          }
        }
      }
      return true
    },
    // 查看产品信息
    viewProductInformation(product) {
      const { href } = this.$router.resolve({
        path: '/briefProductInformation/index',
        query: { mode: 'detail', unique_id: product['产品编号'] } // 模式为添加产品模式
      })
      window.open(href, '_blank')
    },
    // 告诉父组件当前选中的产品
    selected() {
      this.selectPostCallBack(this.radio)
    },

    // 上传excel之前检查
    beforeUpload(file) {
      this.excelUploadSchedule = 0
      if (beforeUploadExcel(file)) {
        this.btnLoading = true
        return true
      } else {
        return false
      }
    },
    // 上传成功后处理
    handleSuccess({ results, header }) {
      if (!this.$_.isEqual(header, this.excelHeader)) {
        this.$message({
          type: 'warning',
          message: '必须按照指定的产品excel模板进行提交！！！'
        })
        this.btnLoading = false
        return
      }

      console.log('解析产品列表excel：')
      console.log(header)
      console.log(results)

      this.productList = []
      // 是否允许产品重复
      var whetherOrNotDuplicationIsAllowed = false
      this.$nextTick(async() => {
        var productList = []
        var productTags = deepClone(this.$store.getters['产品的标签'])

        // 遍历解析出来的json数组
        for (let i = 0; i < results.length; i++) {
          var element_a = results[i]
          // 1.先拿到该元素的产品标签
          var tags = {}
          for (var key in element_a) {
            if (productTags.includes(key)) {
              tags[key] = String(element_a[key]).trim()
            }
          }
          var product = deepClone(this.$store.getters['订单包含的产品空元素'])

          // 2.去跟productList比对。查找是否有完全一模一样的标签
          for (let a = 0; a < productList.length; a++) {
            if (whetherOrNotDuplicationIsAllowed) continue
            const element_d = productList[a]
            if (isObjectValueEqual(element_d.产品信息.tags, tags)) {
              try {
                await this.$confirm(
                  `检查到excel表第${a + 2}行，和第${i +
                    2}行，是重复的产品，是否确认要添加重复的产品？`,
                  '重复产品确认',
                  {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                  }
                )
                whetherOrNotDuplicationIsAllowed = true
              } catch (error) {
                this.excelUploadSchedule = 0
                this.btnLoading = false
                return
              }
            }
          }

          // product.产品信息 ****组合*********************************************************************start
          var post_data = {
            login_token: this.$store.getters.token,
            tags: tags
          }
          // 3.去跟数据库比对。查找是否有完全一模一样的标签产品
          var res = await this.filterProducts(post_data)
          var res_a = {}
          var code = ''
          // 判断 如果查询结果为0，或者查询结果为空 那我们就要生成一个新产品，
          if (isEmpty(res) || res.length === 0) {
            res_a = await generate_year_month_sequence_number({
              login_token: this.$store.getters.token,
              流水单分组: 'CPD'
            })
            code = res_a.data['流水号']
            product.产品信息.产品编号 = code
            product.产品信息.unique_id = code
            product.产品信息.tags = tags
          } else {
            // 如果查询结果长度 大于0,那么遍历所有的产品 查找是否有和我输入的标签完全一致的产品 如果有那么选中它
            var index = res.findIndex(element_b => {
              return isObjectValueEqual(element_b.tags, tags)
            })
            // 如果有 那么给product.产品信息赋值
            if (index !== -1) {
              product.产品信息 = res[index]
            } else {
              res_a = await generate_year_month_sequence_number({
                login_token: this.$store.getters.token,
                流水单分组: 'CPD'
              })
              code = res_a.data['流水号']
              // 如果没有找到完全相等的那么 使用新的编号
              product.产品信息.产品编号 = code
              product.产品信息.unique_id = code
              product.产品信息.tags = tags
            }
          }
          // product.产品信息 ****组合*********************************************************************end

          // product.品牌 和 product.客户产品编号 ****组合******************************************************start
          product['品牌'] = String(element_a['品牌'])
          product['客户产品编号'] = String(element_a['客户产品编号'])
          // product.品牌 和 product.客户产品编号 ****组合******************************************************end

          // product.配码数量 ****组合******************************************************start
          product.配码数量['件数'] = isEmpty(
            Number(parseInt(element_a['件数']))
          )
            ? 1
            : Number(parseInt(element_a['件数']))

          for (let c = 0; c < this.配码数组.length; c++) {
            const element_c = this.配码数组[c]
            product.配码数量['配码'].push({
              国标码: element_c.gjm,
              尺码: element_c.size,
              已排产数量: 0,
              目标数量: isEmpty(Number(element_a[String(element_c.size)]))
                ? 0
                : Math.floor(Number(element_a[String(element_c.size)]))
            })
          }

          // 计算总数
          var count = 0
          for (let b = 0; b < product['配码数量']['配码'].length; b++) {
            var element = product['配码数量']['配码'][b]
            count = count + Number(element.目标数量)
          }
          if (count === 0) {
            this.$message({
              message: '配码数量不能全为0，请修改后重新上传',
              type: 'warning'
            })
            this.btnLoading = false
            return
          }
          product['配码数量']['总数'] = count * product['配码数量']['件数']
          // product.配码数量 ****组合******************************************************end
          this.excelUploadSchedule = Number(
            parseFloat(((i + 1) / results.length) * 100).toFixed(1)
          )
          productList.push(product)
        }
        this.btnLoading = false
        this.productList = productList
        console.log('产品列表excel数组组合为订单的产品元素：')
        console.log(productList)
      })
    },
    // 下载excel模板
    downloadExcelTemplate() {
      this.btnLoading = true
      setTimeout(() => {
        this.btnLoading = false
      }, 1000)
      var 产品的标签 = deepClone(this.$store.getters['产品的标签'])
      var 配码数组 = deepClone(this.配码数组)
      var 配码 = []
      for (let i = 0; i < 配码数组.length; i++) {
        var element = 配码数组[i]
        配码.push(String(element.size))
      }

      var tHeader = [
        ...产品的标签,
        '品牌',
        '客户产品编号',
        ...配码,
        '件数',
        '总数'
      ]

      var filterVal = tHeader

      var tableData = []
      var tableItem = {}
      for (let i = 0; i < 产品的标签.length; i++) {
        var key = 产品的标签[i]
        tableItem[key] = ''
      }
      tableItem['品牌'] = ''
      tableItem['客户产品编号'] = ''
      for (let i = 0; i < 配码.length; i++) {
        key = 配码[i]
        tableItem[key] = 0
      }
      tableItem['件数'] = 1
      tableItem['总数'] = 0
      tableData.push(tableItem)

      console.log(tHeader)
      console.log(filterVal)
      console.log(tableData)

      var data = this.formatJson(filterVal, tableData)
      console.log(2222)
      console.log(data)
      import('@/vendor/Export2Excel').then(excel => {
        excel.export_json_to_excel({
          header: tHeader, // 表头 必填
          data, // 具体数据 必填
          filename: '产品列表', // 非必填
          autoWidth: true, // 非必填
          bookType: 'xlsx' // 非必填
        })
      })
    },
    // 把json数据格式化，以便导出excel
    formatJson(filterVal, jsonData) {
      return jsonData.map(v =>
        filterVal.map(j => {
          return v[j]
        })
      )
    }
  }
}
</script>

<style lang="scss" scoped>
.product-list-a {
  font-size: 12px;
  width: 100%;
  padding-bottom: 30px;
  overflow: auto;
  .addPro {
    position: absolute;
    top: 0px;
    right: 0;
    z-index: 1000;
  }
  .downloadExcel {
    position: absolute;
    top: 0px;
    right: 130px;
    z-index: 1000;
  }
  .uploadExcel {
    position: absolute;
    top: 0px;
    right: 290px;
    z-index: 1000;
    line-height: 32px;
    display: flex;
    align-items: center;
    .progress {
      width: 180px;
      margin-right: 10px;
    }
  }

  .select-radio {
    width: 80px;
    transition: border linear 0.2s, -webkit-box-shadow linear 0.5s;
    border-color: rgba(141, 39, 142, 0.75);
    box-shadow: 0 0 10px rgba(111, 1, 32, 3);
  }
  #table {
    border: 1px solid #000;
    border-collapse: collapse;
    table-layout: auto;
    tr {
      td {
        white-space: nowrap;
        padding: 5px 10px;
        border: 1px solid #000;
        font-size: 12px;
        line-height: 20px;
        font-weight: bold;
        text-align: center;
        vertical-align: center;
        // word-break: break-all;
      }
      td.product-number {
        width: 170px;
      }
      td.tag {
        width: 120px;
      }
      td.brand {
        width: 120px;
      }
      td.cus-pro-num {
        width: 120px;
      }
      td.pei-ma-input {
        width: 100px;
      }
      td.number {
        width: 100px;
      }
      td.total {
        width: 100px;
      }
      td.option {
        width: 100px;
      }
    }
  }
}
</style>

<style>
.product-list-a .el-input__inner {
  width: none;
  height: 30px;
  line-height: 30px;
}
</style>

