<template>
  <div class="app-container">
    <div class="useintro">
      <el-dropdown :show-timeout="0" @command="handleCommand">
        <img src="@/assets/images/help.png" class="help">
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="a">如何查找产品信息？</el-dropdown-item>
          <el-dropdown-item command="b">如何修改或删除一个产品的信息？</el-dropdown-item>
          <el-dropdown-item command="c">如何添加一个产品的信息？</el-dropdown-item>
          <el-dropdown-item command="d">如何使用【复制并添加】功能添加新的产品？</el-dropdown-item>
          <el-dropdown-item command="e">如何使用【部位物料信息智能填充】功能添加新的产品？</el-dropdown-item>
          <el-dropdown-item command="f" class="blue">更多问题，请访问帮助中心</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <div class="module-a">
      <el-button type="primary" size="small" :disabled="!管理权限['产品资料可写']" @click="handleAdd()">添加新的产品</el-button>
      <!-- <el-button
        type="primary"
        size="small"
        :disabled="!管理权限['产品资料可读']"
        :loading="btnLoading"
        @click="exportExcel()"
      >导出EXCEL表格</el-button> -->
    </div>

    <!-- 条件查询 -->
    <el-form ref="form" class="module-b" :model="form" label-position="left">
      <div class="header">
        <b>产品条件查询</b>
      </div>
      <div class="info-box">
        <!-- 产品的动态标签(自动补全) -->
        <div
          v-if="product_tag_names.length>0"
          class="item-0"
          :model="product_tag_filter"
          label-position="left"
        >
          <el-form-item v-for="tag_name in product_tag_names" :key="tag_name" :label="tag_name">
            <el-autocomplete
              v-model.trim="product_tag_filter[tag_name]"
              :fetch-suggestions="((queryString, callback)=>tagQueryAutoCompleteSearch(queryString,callback,tag_name))"
              placeholder="自动补全"
              @input="debouncedHandleSearch"
            />
          </el-form-item>
        </div>

        <el-form-item class="item-1" label="产品编号:" label-width="75px">
          <el-input v-model.trim="form.productNumber" placeholder="单行输入" />
        </el-form-item>

        <el-form-item class="item-4" label="更新时间段:" label-width="85px">
          <el-date-picker
            v-model.trim="form.productUpdateTimeQuantum"
            class="picker"
            type="daterange"
            unlink-panels
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>

        <el-form-item class="item-5">
          <el-button type="primary" @click="filterProduct">搜索</el-button>
          <el-button type="primary" @click="clearFilterCondition">清空条件</el-button>
        </el-form-item>
      </div>
    </el-form>

    <div class="module-c">
      <div class="title">产品资料列表：</div>
      <el-table :height="tableHeight" :data="tableData" border>
        <!-- 根据产品动态标签和属性自动生成表格 -->
        <el-table-column
          v-for="(item,index) in tableHeader"
          :key="index"
          :prop="item"
          :label="item"
          align="center"
          :width="calculateTableColumnWidths(item)"
        />
        <el-table-column prop="部位详情" align="center">
          <template slot="header">
            <el-button type="primary" size="small" @click.native="partArrowClick(mode='正常点击')">
              <span>{{ partStatusDes }}</span>
              <i
                :class="whetherToExpandLocationDetails?'el-collapse-item__arrow el-icon-arrow-right is-active': 'el-collapse-item__arrow el-icon-arrow-right'"
              />
            </el-button>
          </template>

          <el-table-column
            v-for="(item, index) in 全部的部位"
            :key="index"
            align="center"
            :width="whetherToExpandLocationDetails ? '100' :'170'"
          >
            <template slot="header">
              <!--自定义表头-->
              <div class="product-header">
                <span>{{ item['部位名称'] }}</span>
              </div>
            </template>
            <template slot-scope="scope">
              <span>{{ generateLocationDetailsText(scope.row['部位详情'],item['部位名称']) }}</span>
            </template>
          </el-table-column>
        </el-table-column>
        <!-- 操作部分 -->
        <el-table-column align="center" label="操作" width="240">
          <template slot-scope="scope">
            <el-button
              type="primary"
              size="mini"
              :disabled="!管理权限['产品资料可写']"
              @click="handleEdit(scope.row)"
            >编辑</el-button>
            <el-button
              type="danger"
              size="mini"
              :disabled="!管理权限['产品资料可写']"
              @click="handleDelete(scope.row)"
            >删除</el-button>
            <el-button
              type="primary"
              size="mini"
              @click="handleDetail(scope.row)"
            >产品详情</el-button>
            <el-button
              type="warning"
              size="mini"
              :disabled="!管理权限['产品资料可写']"
              @click="handleCopy(scope.row)"
            >复制并添加</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-pagination
      class="el-pagination"
      :current-page="currentPage"
      :page-sizes="[50, 100, 150, 200]"
      :page-size="pageSize"
      :total="total"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script>
import {
  product_tags_auto_complete,
  filter_product,
  delete_product_by_id
} from '@/api/maintenanceOfProcessPartsOfProductLibrary'
import { filter_component } from '@/api/maintenanceOfProcessPartsOfProductLibrary'
import { isEmpty, parseTime, deepClone } from '@/utils'
import { mapGetters } from 'vuex'
export default {
  components: {},
  data() {
    return {
      // 是否启用按钮loading状态防止多次点击
      btnLoading: false,
      // 配置中对产品的tags数组
      product_tag_names: [],
      // 对应的用于搜索和自动补全的tags模块
      product_tag_filter: {},
      // 当前页数
      currentPage: 1,
      // 总条目数
      total: 0,
      // 当前页数据量
      pageSize: 50,
      form: {
        productNumber: '',
        productUpdateTimeQuantum: null
      },
      // 产品列表的表头列表
      tableHeader: [],
      // 产品列表的表头列表对应属性
      tableProps: [],
      // 产品列表的内容信息
      tableData: [],
      whetherToExpandLocationDetails: false, // 是否展开部位详情信息
      全部的部位: [
        {
          unique_id: '...',
          备注: '',
          描述: '',
          更新时间: '',
          部位名称: '...'
        }
      ],
      allPart: [],
      tableHeight: ''
    }
  },

  computed: {
    ...mapGetters(['管理权限']),
    partStatusDes() {
      if (this.whetherToExpandLocationDetails) return '关闭部位详情'
      else return '展开部位详情'
    }
  },

  async created() {
    this.tableHeight = window.innerHeight * 0.75
    // _.debounce is a function provided by lodash to limit how
    // often a particularly expensive operation can be run.
    // In this case, we want to limit how often we access
    // yesno.wtf/api, waiting until the user has completely
    // finished typing before making the ajax request. To learn
    // more about the _.debounce function (and its cousin
    // _.throttle), visit: https://lodash.com/docs#debounce
    this.debouncedHandleSearch = this.$_.debounce(this.filterProduct, 1000)
    var res = await filter_component({ login_token: this.$store.getters.token, return_fields: ['部位名称'] })
    this.allPart = res.data

    this.getProductTagName()
    await this.filterProduct()
  },
  // 进入该页面后，查询列表API
  mounted() {},
  methods: {
    // 查看指引
    handleCommand(command) {
      console.log(command)
      var x = null
      var y = null
      if (command === 'f') {
        const { href } = this.$router.resolve({
          path: '/instructionsForuse/index'
        })
        window.open(href, '_blank')
      } else {
        if (command === 'a') {
          x = 7
          y = 0
        } else if (command === 'b') {
          x = 7
          y = 1
        } else if (command === 'c') {
          x = 7
          y = 2
        } else if (command === 'd') {
          x = 7
          y = 3
        } else if (command === 'e') {
          x = 7
          y = 4
        }
        var routeUrl = this.$router.resolve({
          path: '/instructionsForuse/index',
          query: {
            x: x,
            y: y
          }
        })
        window.open(routeUrl.href, '_blank')
      }
    },

    // 页码控制时，每页数量改变的处理函数
    handleSizeChange(val) {
      this.pageSize = val
      this.filterProduct()
    },
    // 页码控制时，每页码改变改变的处理函数
    handleCurrentChange(val) {
      this.currentPage = val
      this.filterProduct()
    },
    // 清空查询条件
    clearFilterCondition() {
      this.form = {
        productNumber: '',
        productUpdateTimeQuantum: null
      }
      this.product_tag_filter = {}
      for (var index in this.product_tag_names) {
        this.$set(this.product_tag_filter, this.product_tag_names[index], '')
      }
      this.filterProduct()
    },
    // 获取配置中对物料的tags数组，确保先载入
    getProductTagName(callback) {
      this.product_tag_names = this.$store.getters.产品的标签
      this.product_tag_filter = {}
      for (var index in this.product_tag_names) {
        this.$set(this.product_tag_filter, this.product_tag_names[index], '')
      }
    },
    // 对产品标签进行自动补全操作
    async tagQueryAutoCompleteSearch(queryString, callback, tag_name) {
      if (queryString === undefined || queryString === null) {
        queryString = ''
      }
      var login_token = this.$store.getters.token
      var post_data = {
        login_token: login_token,
        base_tags: this.product_tag_filter,
        target_tag_name: tag_name
      }
      const response = await product_tags_auto_complete(post_data)
      var suggest_value_list = []
      for (var index in response.data) {
        suggest_value_list.push({
          value: response.data[index]
        })
      }
      callback(suggest_value_list)
    },
    // 页面加载时，以及数据更新时调用，用于获取最新的工序列表
    async filterProduct() {
      var post_data = {
        login_token: this.$store.getters.token,
        pagination: {
          page: parseInt(this.currentPage),
          limit: parseInt(this.pageSize)
        },
        sort: {
          更新时间: -1
        }
      }

      if (!isEmpty(this.form.productNumber)) {
        post_data['产品编号'] = '.*' + this.form.productNumber + '.*'
      }

      if (!isEmpty(this.form.productUpdateTimeQuantum)) {
        post_data['更新时间_上限'] = parseTime(
          this.form.productUpdateTimeQuantum[1]
        )
        post_data['更新时间_下限'] = parseTime(
          this.form.productUpdateTimeQuantum[0]
        )
      }

      post_data['tags'] = this.product_tag_filter
      const response = await filter_product(post_data)

      // 对获得的产品信息进行处理
      var product_items = []
      for (var i = 0; i < response.data.length; i++) {
        var item = response.data[i]
        if (!item.hasOwnProperty('成本估算')) {
          item['成本估算'] = '暂无'
        }
        if (item['成本估算'] !== '暂无') {
          item['成本估算'] = String(item['成本估算'].toFixed(2)) + '元/对'
        }

        // 将动态 tags 的信息展开到外层
        for (var tag_index in this.product_tag_names) {
          item[this.product_tag_names[tag_index]] =
            item['tags'][this.product_tag_names[tag_index]]
        }

        // 添加都表格数据中
        product_items.push(item)
      }
      // 配置表头信息、表头对应属性信息和表单信息
      this.tableHeader = ['产品编号']
      this.tableProps = ['产品编号']
      for (var index in this.product_tag_names) {
        this.tableHeader.push(this.product_tag_names[index])
        this.tableProps.push(this.product_tag_names[index])
      }
      if (this.管理权限['产品资料可写']) {
        this.tableHeader.push('成本估算')
      }

      this.tableHeader.push('更新时间')
      this.tableProps.push('成本估算')
      this.tableProps.push('更新时间')
      this.tableData = product_items
      this.total = response.total_count // 页数控制用的总产品数
    },
    // 添加新产品
    handleAdd() {
      const { href } = this.$router.resolve({
        path: '/productManagement/product0peration',
        query: { mode: 'add' }
      })
      window.open(href, '_blank')
    },
    // 查看详情按钮点击
    handleDetail(productItem) {
      const { href } = this.$router.resolve({
        path: '/productManagement/product0peration',
        query: { mode: 'detail', unique_id: productItem['unique_id'] }
      })
      window.open(href, '_blank')
    },
    // 编辑产品按钮点击
    handleEdit(productItem) {
      const { href } = this.$router.resolve({
        path: '/productManagement/product0peration',
        query: { mode: 'edit', unique_id: productItem['unique_id'] }
      })
      window.open(href, '_blank')

      // this.$router.push({
      //   path: '/productManagement/product0peration',
      //   query: { mode: 'edit', unique_id: productItem['unique_id'] }
      // })
    },
    // 复制产品按钮点击
    handleCopy(productItem) {
      this.$router.push({
        path: '/productManagement/product0peration',
        query: { mode: 'copy', unique_id: productItem['unique_id'] }
      })
    },
    // 删除按钮点击
    handleDelete(orderInfo) {
      this.$confirm('确认删除产品吗?', 'Warning', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(res => {
          var post_data = {
            login_token: this.$store.getters.token,
            unique_id: orderInfo['unique_id']
          }
          // 调用api 删除相应的产品
          delete_product_by_id(post_data).then(res => {
            this.filterProduct()
            this.$message({
              type: 'success',
              message: res.msg
            })
          })
        })
        .catch(err => {
          console.error(err)
        })
    },
    // 计算表格列宽度
    calculateTableColumnWidths(name) {
      switch (name) {
        case '产品编号':
          return '140'
        case '产品名称':
          return '100'
        case '成本估算':
          return '100'
        case '更新时间':
          return '155'
      }
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
    partArrowClick(mode = '正常点击') {
      if (mode === '正常点击') {
        this.whetherToExpandLocationDetails = !this
          .whetherToExpandLocationDetails
      }
      if (this.whetherToExpandLocationDetails) {
        this.全部的部位 = deepClone(this.allPart)
      } else {
        this.全部的部位 = [
          {
            unique_id: '...',
            备注: '',
            描述: '',
            更新时间: '',
            部位名称: '...'
          }
        ]
      }
    },

    // TODO 导出excel
    exportExcel() {
      this.btnLoading = true
      setTimeout(() => {
        this.btnLoading = false
      }, 3000)
      const tHeader = ['产品编号', '产品名称', '颜色', '部件详情', '更新时间']
      const filterVal = [
        'productNumber',
        'productName',
        'color',
        'componentDetails',
        'updateTime'
      ]
      const tableData = deepClone([...this.tableData])
      const data = this.formatJson(filterVal, tableData)
      import('@/vendor/Export2Excel').then(excel => {
        excel.export_json_to_excel({
          header: tHeader, // 表头 必填
          data, // 具体数据 必填
          filename: 'excel-list', // 非必填
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
.app-container {
  .module-a {
    margin-bottom: 20px;
  }
  .module-b {
    margin-bottom: 30px;
    border: 1px solid #bbbbbb;
    .header {
      padding: 0 10px;
      height: 40px;
      line-height: 40px;
      border-bottom: 1px solid #bbbbbb;
    }
    .info-box {
      padding: 10px 10px 0px 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      .item-0 {
        width: 100%;
        display: flex;
        justify-content: space-between;
      }
      .item-1,
      .item-2,
      .item-3 {
        width: 250px;
      }
      .item-4 {
        width: 520px;
      }
    }
  }
  .module-c {
    .title {
      margin-bottom: 20px;
    }
    .el-button--mini {
      margin-bottom: 5px;
    }
  }
}
</style>

