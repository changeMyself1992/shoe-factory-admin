<template>
  <div class="app-container">
    <el-dialog :visible.sync="show" title="添加物料的供应商" center width="60%">

      <!-- 供应商的搜索和选择 -->
      <el-card style="margin-bottom:35px;">
        <el-row>
          <!-- 供应商的定位标签(自动补全) -->
          <el-form v-if="supplier_tag_names.length>0" ref="form" class="info-box" :model="supplier_tag_filter" label-position="left">
            <el-form-item v-for="tag_name in supplier_tag_names" :key="tag_name" :label="tag_name" label-width="85px">
              <el-autocomplete
                v-model.trim="supplier_tag_filter[tag_name]"
                class="inline-input"
                :fetch-suggestions="((queryString, callback)=>tagQueryAutoCompleteSearch(queryString,callback,tag_name))"
                placeholder="自动补全"
              />
            </el-form-item>
          </el-form>

          <!-- 供应商的其他基本信息搜索 -->
          <el-form ref="form" class="info-box" :model="form" label-position="left">

            <el-form-item class="item-1" label="名称:" label-width="85px">
              <el-input v-model.trim="form['名称']" placeholder="输入" />
            </el-form-item>

            <el-form-item class="item-2" label="地址:" label-width="85px">
              <el-input v-model.trim="form['地址']" placeholder="输入" />
            </el-form-item>

            <el-form-item class="item-3" label="电话:" label-width="85px">
              <el-input v-model.trim="form['电话']" placeholder="输入" />
            </el-form-item>

            <el-form-item class="item-5">
              <el-button type="primary" @click="filterSupplier">搜索供应商</el-button>
              <el-button type="primary" @click="clearCondition()">清空条件</el-button>
            </el-form-item>

          </el-form>

          <el-table :data="supplierTableData" border>
            <el-table-column v-if="supplier_tag_names.length>0" align="center" label="供应商标签" :width="80*supplier_tag_names.length">
              <template slot-scope="scope">
                <el-button v-for="tag_name in supplier_tag_names" :key="tag_name" round type="info" size="mini" :disable="true" plain>
                  <font size="0.5" color="blue">{{ tag_name }}</font><br>
                  <b>{{ scope.row.tags[tag_name] }}</b>
                </el-button>
              </template>
            </el-table-column>
            <el-table-column align="center" prop="名称" label="供应商名称" width="100" />
            <el-table-column align="center" prop="电话" label="电话" width="100" />
            <el-table-column align="center" prop="地址" label="地址" width="100" />
            <el-table-column align="center" prop="备注" label="备注" width="95" />
            <el-table-column align="center" prop="更新时间" label="更新时间" width="155" />

            <el-table-column label="操作" width="150">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  size="small"
                  @click="handleSelectSupplier(scope.row)"
                >选择</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-row>
      </el-card>

      <div class="module-e">
        <el-button class="addPro" type="info" size="small" @click="clearForm">清空选择</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import store from '@/store'
import request from '@/utils/request'
export default {
  components: {},
  props: {
    dialogVisible: Boolean,
    onClose: {
      required: true,
      validator: function(value) {
        return true
      }
    }
  },
  data() {
    return {
      form: {
        '名称': '',
        '地址': '',
        '电话': ''
      },
      // 配置中对供应商的tags数组
      supplier_tag_names: [],
      // 对应的用于搜索和自动补全的tags模块
      supplier_tag_filter: {},
      // 当前页数
      currentPage: 1,
      // 总条目数
      total: 0,
      // 当前页数据量
      pageSize: 10,
      // 仓库供应商信息
      supplierTableData: [],
      // 被选中的供应商信息
      selectSupplierInfo: {},
      show: false
    }
  },
  computed: {},
  watch: {
    dialogVisible: function(newVal, oldVal) {
      this.show = newVal
      // 每次进入该页面的时候，都清空表单
      if (newVal && !oldVal) {
        this.clearForm()
        this.getSupplierTagName(this.filterSupplier)
      }
    },
    show(newVal, oldVal) {
      if (!newVal) {
        this.onClose(this.show)
      }
    }
  },
  created() {},
  methods: {
    // 获取配置中对供应商的tags数组，确保先载入
    getSupplierTagName(callback) {
      var login_token = store.getters.token
      var post_data = {
        login_token: login_token
      }
      // 调用api
      request({
        url: 'supplier/get_supplier_tag_names',
        method: 'post',
        data: post_data
      })
        .then(response => {
          // 成功接收到数据
          if (response.status === 'OK') {
            this.supplier_tag_names = response.data
            this.supplier_tag_filter = {}
            for (var index in this.supplier_tag_names) {
              this.$set(this.supplier_tag_filter, this.supplier_tag_names[index], '')
            }
          }
          if (typeof (callback) === 'function') {
            callback()
          }
        })
        .catch(error => {
          console.log(error)
          if (typeof (callback) === 'function') {
            callback()
          }
        })
    },
    // 对供应商标签进行自动补全操作
    tagQueryAutoCompleteSearch(queryString, callback, tag_name) {
      if (queryString === undefined || queryString === null) {
        queryString = ''
      }
      var login_token = store.getters.token
      var post_data = {
        login_token: login_token,
        base_tags: this.supplier_tag_filter,
        target_tag_name: tag_name
      }
      // 调用api
      request({
        url: 'supplier/supplier_tags_auto_complete',
        method: 'post',
        data: post_data
      })
        .then(response => {
        // 成功接收到数据
          if (response.status === 'OK') {
            var suggest_value_list = []
            for (var index in response.data) {
              suggest_value_list.push({
                'value': response.data[index]
              })
            }
            callback(suggest_value_list)
          }
        })
        .catch(error => {
          console.log(error)
          callback([])
        })
    },
    // 页面加载时，以及数据更新时调用，用于获取最新的列表
    filterSupplier() {
      var login_token = store.getters.token
      var post_data = {
        login_token: login_token,
        pagination: {
          page: parseInt(this.currentPage),
          limit: parseInt(this.pageSize)
        },
        sort: { 更新时间: -1 }
      }
      if (this.form != null) {
        if (this.form['名称'] != null) {
          post_data['名称'] = this.form['名称']
        }
        if (this.form['地址'] != null) {
          post_data['地址'] = this.form['地址']
        }
        if (this.form['电话'] != null) {
          post_data['电话'] = this.form['电话']
        }
      }
      post_data['tags'] = this.supplier_tag_filter
      // 调用api
      request({
        url: 'supplier/filter_supplier',
        method: 'post',
        data: post_data
      })
        .then(response => {
          // 成功接收到数据
          if (response.status === 'OK') {
            this.supplierTableData = response.data
            this.total = response.total_count
          }
        })
        .catch(error => {
          console.log(error)
        })
    },
    // 选择产品
    handleSelectSupplier(supplier_info) {
      this.selectSupplierInfo = supplier_info
      this.show = false
      this.onClose(this.show, this.selectSupplierInfo)
    },
    // 清空整个表单
    clearForm() {
      this.supplierTableData = []// 产品搜索结果
      this.selectSupplierInfo = {} // 选择的产品
      this.form = {
        '名称': '',
        '地址': '',
        '电话': ''
      }
      // 对应的用于搜索和自动补全的tags模块
      this.supplier_tag_filter = {}
      for (var index in this.supplier_tag_names) {
        this.$set(this.supplier_tag_filter, this.supplier_tag_names[index], '')
      }
      // 当前页数
      this.currentPage = 1
      // 总条目数
      this.total = 0
      // 当前页数据量
      this.pageSize = 10
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  .module-a {
    margin-bottom: 30px;
  }
  .module-b {
    .title,
    .addPro {
      display: inline-block;
      margin-right: 30px;
    }
  }
  .module-c {
    .product-a {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
      background-color: rgb(253, 249, 249);
      .left {
        width: 70%;
        font-size: 12px;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        .row-1,
        .row-2 {
          width: 100%;
        }
        .row-1 {
          span:nth-child(2n + 1) {
            color: rgb(164, 164, 164);
          }
          span:nth-child(2n) {
            color: black;
            margin-right: 10px;
          }
        }
        .row-2 {
          span:nth-child(2n + 1) {
            color: rgb(164, 164, 164);
          }
          span:nth-child(2n) {
            color: black;
          }
        }
      }
      .right {
        width: 30%;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        .el-button {
          width: 60%;
        }
        .el-button + .el-button {
          margin-left: 0px;
        }
      }
    }
  }
  .module-d {
    margin-bottom: 40px;
    .table {
      width: 94%;
      table {
        width: 100%;
        height: 90px;
        border: 1px solid #000;
        border-collapse: collapse;
        caption-side: bottom;
        table-layout: fixed;
      }

      td {
        border: 1px solid #000;
        width: 20px;
        height: 30px;
        font-size: 12px;
        font-weight: bold;
        text-align: center;
        vertical-align: center;
      }
    }
  }
}
</style>

<style scoped>
.el-date-editor--datetimerange.el-input,
.el-date-editor--datetimerange.el-input__inner {
  width: 200px;
}
.el-form-item__label {
  padding: 0 10px 0 0;
}
.el-form-item {
  margin-bottom: 0px;
}
.el-form-item__content {
  line-height: none;
}
</style>

