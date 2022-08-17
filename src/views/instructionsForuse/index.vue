<template>
  <el-container>
    <el-header>
      <el-input v-model.trim="searchValue" class="input-with-select" placeholder="请输入关键词搜索">
        <el-button slot="append" @click="searchques(searchValue)">搜索</el-button>
      </el-input>
    </el-header>
    <el-container>
      <el-aside width="200px">
        <div class="helpname">帮助中心</div>
        <el-menu :default-active="defaultactive">
          <el-menu-item v-for="(item,i) in menutitle" :key="i" :index="item.i" @click="menuClick(i)">
            <span slot="title">{{ item.name }}</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main>
        <el-breadcrumb class="break" separator-class="el-icon-arrow-right">
          <span class="cursor" @click="breadcrumbOneClick">{{ breadcrumbOne }}</span>
          <span class="margin">/</span>
          <span class="blue">{{ breadcrumbTwo }}</span>
        </el-breadcrumb>
        <!-- 问题列表 -->
        <div v-if="type == 'qusetionList'" class="qusetionList">
          <ul>
            <li v-for="(item,i) in qusetionList" :key="i" @click="detailClick(i)"><a href="javascript:void(0)">{{ item.ques }}</a></li>
          </ul>
        </div>
        <!-- 搜索出的问题列表 -->
        <div v-else-if="type == 'searchQusetionList'" class="qusetionList">
          <ul>
            <li v-for="(item,i) in searchQusetionList" :key="i" @click="searchQuseClick(item)"><a href="javascript:void(0)">{{ item.ques }}</a></li>
          </ul>
        </div>
        <!-- 问题答案 -->
        <div v-else :style="scrollStyle" class="questionAnswer">
          <div class="tit">
            <span class="h4">{{ breadcrumbTwo }}</span>
            <el-button v-if="currbtn" class="currClick" :disabled="disablebtnpc" type="primary" size="mini" @click="currClick1">电脑端操作</el-button>
            <el-button v-if="currbtn" class="currClick" :disabled="disablebtnxcx" type="primary" size="mini" @click="currClick2">微信小程序端操作</el-button>
          </div>
          <div v-for="(item,i) in answerDetail" :key="i" class="item">
            <h5 v-if="item.type===currStates">{{ item.desc }}</h5>
            <!-- 正式服/测试服 -->
            <img v-if="item.type===currStates" :src="'https://mes.westmatrix.cn/help_images/'+item.img" :class="item.type=='pc'?'imagepc':'imagexcx'">
            <!-- <img v-if="item.type===currStates" :src="'https://mes.westmatrix.cn/test/help_images/'+item.img" :class="item.type=='pc'?'imagepc':'imagexcx'"> -->
          </div>
        </div>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import { deepClone } from '@/utils'
export default {
  name: 'RealTimePlate',
  data() {
    return {
      currbtn: true,
      currStates: '',
      disablebtnpc: true,
      disablebtnxcx: false,
      // 图片引用
      // imgUrl_require: require('@/assets/images/name.png'),
      // 展示类型 qusetionList（问题列表）questionAnswer（问题答案）
      type: 'qusetionList',
      // 搜索词语keyword
      searchValue: '',

      // 初始默认选中的defaultactive
      defaultactive: '0',

      // 面包屑第一个词
      breadcrumbOne: '帮助中心',
      // 面包屑第二个词
      breadcrumbTwo: '',

      // route1 此时的侧边问题模块index
      route1: null,
      // route2 此时的侧边问题模块对应问题列表的 某个问题的index
      route2: null,

      // 侧边栏问题模块数组
      menutitle: [
        {
          i: '0',
          name: '新手入门'
        },
        {
          i: '1',
          name: '人员管理'
        },
        {
          i: '2',
          name: '权限管理'
        },
        {
          i: '3',
          name: '财务管理'
        },
        {
          i: '4',
          name: '客户/订单管理'
        },
        {
          i: '5',
          name: '生产排产'
        },
        {
          i: '6',
          name: '生产进度管理'
        },
        {
          i: '7',
          name: '产品资料库'
        },
        {
          i: '8',
          name: '工序管理'
        },
        {
          i: '9',
          name: '部位管理'
        },
        {
          i: '10',
          name: '仓库物料管理'
        },
        {
          i: '11',
          name: '采购管理'
        },
        {
          i: '12',
          name: '供应商管理'
        }
      ],
      // 存起来 对应侧边栏每个问题模块的 问题列表数组
      qusetionArr: [
        // 0.新手入门
        ['新手教学？'],
        // 1.人员管理
        [
          '如何查看企业所有员工信息？',
          '企业如何添加员工和管理人员？',
          '未注册的员工如何自行申请注册？',
          '管理人员如何审核通过提交注册申请的员工？'
        ],
        // 2.权限管理
        [
          '怎样添加、删除职位及管理职位权限？'
        ],
        // 3.财务管理
        [
          '员工如何查看自己的工资？',
          '管理人员如何查看员工工资和部门工资？',
          '财务结算工资时如何导出工资结算Excel表?',
          '管理人员如何确认指定员工计件记录？',
          '如何添加工资抵扣费用？',
          '如何查看订单结算、更新结算相关内容及发货情况？',
          '如何导出订单的结算和发货情况到Excel表格？',
          '如何在订单结算时使用自动补全单价的功能?',
          '如何查看各个供应商的结算情况及详细的流水单？',
          '如何导出各个供应商的结算统计Excel表？',
          '供应商如何配合使用本系统进行送货？',
          '工厂怎样确认一个送货单？',
          '工厂如何手动添加一个送货记录或者退货记录？',
          '工厂如何使用现结单功能?'
        ],
        // 4.客户/订单管理
        [
          '如何添加新的订单？',
          '如何使用Excel批量导入多个订单？',
          '如何根据订单信息或者产品信息查询订单？',
          '怎样将订单列表导出成Excel表格形式？',
          '手机端如何保存分享订单页面？',
          '如何添加客户的基本信息？',
          '如何修改客户的基本信息？',
          '如何删除客户的基本信息？'
        ],
        // 5.生产排产
        [
          '如何对一个订单进行排产，自动生成生产单？',
          '如何批量的打印多张生产单？',
          '如何批量的修改多个生产单的工序工资信息？'
        ],
        // 6.生产进度管理
        [
          '员工如何使用小程序扫描生产单二维码进行个人计件？',
          '管理人员如何确认员工计件？',
          '管理人员如何直接分配合伙计件？'
        ],
        // 7.产品资料库
        [
          '如何查找产品信息？',
          '如何修改或删除一个产品的信息？',
          '如何添加一个产品的信息？',
          '如何使用【复制并添加】功能添加新的产品？',
          '如何使用【部位物料信息智能填充】功能添加新的产品？'
        ],
        // 8.工序管理
        [
          '如何添加或删除工序信息？',
          '如何调整工序的顺序？'
        ],
        // 9.部位管理
        [
          '如何添加或删除部位信息？',
          '如何调整部位顺序？'
        ],
        // 10.仓库物料管理
        [
          '如何查看仓库的库存信息并导出Excel表格？',
          '如何进行手动入库操作？',
          '如何使用采购单进行入库？',
          '如何进行手动出库操作？',
          '如何使用生产单进行出库？',
          '如何添加物料？',
          '如何使用【复制添加】功能添加新的物料？'
        ],
        // 11.采购管理
        [
          '如何查看和删除一个采购单？',
          '如何添加一个采购单？',
          '如何理解采购单的等待和完成两种状态？'
        ],
        // 12.供应商管理
        [
          '如何添加一个供应商的基本信息？',
          '如何删除一个供应商的基本信息？',
          '如何查看一个供应商的报价单？'
        ]
      ],
      // 此时展示的问题数组
      qusetionList: [],
      // 搜索出的问题数组
      searchQusetionList: [],

      // 存起来 对应侧边栏每个问题模块的 对应问题列表的所有答案
      answerList: [
        // 0.新手入门
        [
          // 问题1
          [
            // 问题1答案
            {
              'desc': '新手入门指引',
              'img': 'newhand/noData.png',
              'type': 'pc'
            }
          ]
        ],
        // 1.人员管理
        [
          // 问题1
          [
            // 问题1答案
            {
              'desc': 'PC端：1. 应用功能页面，点击【人员管理】图标即可以查看人员信息；',
              'img': 'user_right1/pc1.png',
              'type': 'pc'
            },
            {
              'desc': '小程序端：1. 应用功能页面，点击【人员列表】图标即可以查看人员信息；',
              'img': 'user_right1/xcx1.jpg',
              'type': 'xcx'
            }
          ],
          // 问题2
          [
            // 问题2答案
            {
              'desc': 'PC端：1. 打开应用功能页面，在左上角，点击【人员管理】图标；',
              'img': 'user_right2/pcyi.png',
              'type': 'pc'
            },
            {
              'desc': '2. 在右上角，点击【添加人员信息】按钮；',
              'img': 'user_right2/pcer.png',
              'type': 'pc'
            },
            {
              'desc': '3. 输入员工信息，*号为必填项，其他可选填；最后点击【立即创建用户】按钮即可添加成功；',
              'img': 'user_right2/pcsan.png',
              'type': 'pc'
            },
            {
              'desc': '4. 添加成功后自动回到人员管理页面，点击【编辑】按钮；',
              'img': 'user_right2/pcsi.png',
              'type': 'pc'
            },
            {
              'desc': '5. 编辑修改人员信息，最后点击【修改用户信息】按钮即可修改成功；',
              'img': 'user_right2/pcwu.png',
              'type': 'pc'
            },
            {
              'desc': '小程序端：1. 应用功能页面，点击【添加新员工】图标或者点击顶部员工待审核提示框；',
              'img': 'user_right2/xcxyi.png',
              'type': 'xcx'
            },
            {
              'desc': '2. 点击【编辑】按钮；',
              'img': 'user_right2/xcxer.png',
              'type': 'xcx'
            },
            {
              'desc': '3. 查看员工相关信息是否符合企业要求并可修改相关信息;将工作状态【待确认】改成【在职】或其他状态（提示：新员工提交注册申请后状态统一默认为【待确认】），最后点【提交】按钮即可同意员工加入企业；',
              'img': 'user_right2/xcxsan.png',
              'type': 'xcx'
            },
            {
              'desc': '4. 回到应用功能，点击【人员列表】图标；',
              'img': 'user_right2/xcxsi.png',
              'type': 'xcx'
            },
            {
              'desc': '5. 进入人员列表页面可查看到刚刚添加的员工，点击【编辑】按钮可再次修改；',
              'img': 'user_right2/xcxwu.png',
              'type': 'xcx'
            },
            {
              'desc': '6. 根据实际修改负责工序或管理角色等相关信息，点击【提交】按钮即可修改成功；',
              'img': 'user_right2/xcxliu.png',
              'type': 'xcx'
            }
          ],
          // 问题3
          [
            // 问题3答案
            {
              'desc': '1. 使用手机微信扫一扫，扫描管理人员小程序端的注册二维码；',
              'img': 'user_right3/yi.png',
              'type': 'xcx'
            },
            {
              'desc': '2. 填写个人注册信息，*号为必填项；填写完毕后点击【提交】按钮提交注册申请等待管理人员同意即可；',
              'img': 'user_right3/er.png',
              'type': 'xcx'
            }
          ],
          // 问题4
          [
            // 问题4答案
            {
              'desc': 'PC端：1. 应用功能页面，点击【人员管理】图标或者点击顶部【待审核员工】提示图标；',
              'img': 'user_right4/pcyi.png',
              'type': 'pc'
            },
            {
              'desc': '2. 下滑页面到员工申请板块（这里显示的都是已提交注册申请待审核的员工），点击【编辑】按钮；',
              'img': 'user_right4/pcer.png',
              'type': 'pc'
            },
            {
              'desc': '3. 查看员工相关信息是否符合企业要求并可修改相关信息;将工作状态【待确认】改成【在职】或其他状态（提示：新员工提交注册申请后状态统一默认为【待确认】），最后点【修改用户信息】按钮即可同意员工加入企业；',
              'img': 'user_right4/pcsan.png',
              'type': 'pc'
            },
            {
              'desc': '小程序端：1. 应用功能页面，点击【添加新员工】图标或者点击顶部员工待审核提示框；',
              'img': 'user_right4/xcxyi.png',
              'type': 'xcx'
            },
            {
              'desc': '2. 点击【编辑】按钮；',
              'img': 'user_right4/xcxer.png',
              'type': 'xcx'
            },
            {
              'desc': '3. 查看员工相关信息是否符合企业要求并可修改相关信息;将工作状态【待确认】改成【在职】或其他状态（提示：新员工提交注册申请后状态统一默认为【待确认】），最后点【提交】按钮即可同意员工加入企业；',
              'img': 'user_right4/xcxsan.png',
              'type': 'xcx'
            }
          ]
        ],
        // 2.权限管理
        [
          // 问题5
          [
            // 问题5答案
            {
              'desc': 'PC端：1. 应用功能页面，点击【权限管理】图标；',
              'img': 'user_right5/pc1.png',
              'type': 'pc'
            },
            {
              'desc': '2. 点击【新增角色】按钮，可添加用户权限；',
              'img': 'user_right5/pc2.png',
              'type': 'pc'
            },
            {
              'desc': '3. 点击勾选分配角色权限后，点击【确认编辑】按钮修改权限；',
              'img': 'user_right5/pc3.png',
              'type': 'pc'
            },
            {
              'desc': '4. 点击【删除】按钮删除角色权限（备注：如果要删除的该角色已绑定相关人员，则不可删除）；',
              'img': 'user_right5/pc4.png',
              'type': 'pc'
            },
            {
              'desc': '小程序端：1. 应用功能页面，点击【权限管理】图标；',
              'img': 'user_right5/xcx1.png',
              'type': 'xcx'
            },
            {
              'desc': '2. 点击【添加角色】按钮，可添加新角色权限；',
              'img': 'user_right5/xcx2.png',
              'type': 'xcx'
            },
            {
              'desc': '3. 点击【编辑权限】按钮，可编辑权限；',
              'img': 'user_right5/xcx3.png',
              'type': 'xcx'
            },
            {
              'desc': '4. 点击【删除】按钮，可删除角色权限（备注：如果要删除的该角色已绑定相关人员，则不可删除）；',
              'img': 'user_right5/xcx4.png',
              'type': 'xcx'
            }
          ]
        ],
        // 3.财务管理
        [
          // 问题1
          [
            // 问题1答案
            {
              'desc': '1. 数据看板页面找到工资信息模块，可查看工资展示信息；',
              'img': 'financial1/yi.png',
              'type': 'xcx'
            },
            {
              'desc': '2. 点击【工资详情】按钮；',
              'img': 'financial1/er.png',
              'type': 'xcx'
            },
            {
              'desc': '3. 显示当月工资信息列表详情，可通过时间搜索筛选工资；',
              'img': 'financial1/san.png',
              'type': 'xcx'
            }
          ],
          // 问题2
          [
            // 问题2答案
            {
              'desc': 'PC端：1. 应用功能页面，点击【员工工资】图标；',
              'img': 'financial2/pc1.png',
              'type': 'pc'
            },
            {
              'desc': '2. 可查看到员工个人工资模块和部门工资汇总模块；',
              'img': 'financial2/pc2.png',
              'type': 'pc'
            },
            {
              'desc': '3. 点击员工个人工资板块【查看详情】按钮，可查看到工资记录信息和已抵扣的记录信息；',
              'img': 'financial2/pc3.png',
              'type': 'pc'
            },
            {
              'desc': '小程序端：1. 应用功能页面，点击【员工工资】图标；',
              'img': 'financial2/xcx1.png',
              'type': 'xcx'
            },
            {
              'desc': '2. 打开员工工资页面后查看到【员工个人工资】标签、【部门工资汇总】标签和【抵扣记录】标签，可分别点击查看其列表信息；',
              'img': 'financial2/xcx2.png',
              'type': 'xcx'
            }
          ],
          // 问题3
          [
            // 问题3答案
            {
              'desc': '1. 应用功能页面，点击【员工工资】图标；',
              'img': 'financial3/yi.png',
              'type': 'pc'
            },
            {
              'desc': '2. 选择工资结算时间段，最后点击【下载结算Excel】按钮即可；',
              'img': 'financial3/er.png',
              'type': 'pc'
            }
          ],
          // 增加4
          [
            {
              'desc': '1. 应用功能页面，点击【员工工资】图标；',
              'img': 'newfinancial1/pc1.png',
              'type': 'pc'
            },
            {
              'desc': '2. 找到想要确认的员工，点击右边【查看详情】按钮；',
              'img': 'newfinancial1/pc2.png',
              'type': 'pc'
            },
            {
              'desc': '3. 在未确认的记录板块中，点击右侧【点击确认计件记录】按钮即可确认员工计件；',
              'img': 'newfinancial1/pc3.png',
              'type': 'pc'
            }
          ],
          // 增加5
          [
            {
              'desc': 'PC端：1. 应用功能页面，点击【员工工资】图标；',
              'img': 'newfinancial2/pc1.png',
              'type': 'pc'
            },
            {
              'desc': '2. 点击【添加工资抵扣费用】按钮；',
              'img': 'newfinancial2/pc2.png',
              'type': 'pc'
            },
            {
              'desc': '3. 可搜索找到想要添加的员工并选中，然后填写工资抵扣原因和抵扣金额，最后点击下面【提交】按钮即可；',
              'img': 'newfinancial2/pc3.png',
              'type': 'pc'
            },
            {
              'desc': '小程序端：1. 应用功能页面，点击【员工工资】图标；',
              'img': 'newfinancial2/xcx1.png',
              'type': 'xcx'
            },
            {
              'desc': '2. 点击下面【添加工资抵扣费用】按钮；',
              'img': 'newfinancial2/xcx2.png',
              'type': 'xcx'
            },
            {
              'desc': '3. 选择人员，然后填写工资抵扣原因和抵扣金额，最后点击【添加工资抵扣】按钮即可；',
              'img': 'newfinancial2/xcx3.png',
              'type': 'xcx'
            }
          ],

          // 问题4
          [
            // 问题4答案
            {
              'desc': 'PC端：1. 应用功能页面，点击【订单结算】图标；',
              'img': 'financial4/pcyi.png',
              'type': 'pc'
            },
            {
              'desc': '2. 可查看到订单结算统计表，选择一个订单结算点击【编辑】按钮进行更新；',
              'img': 'financial4/pcer.png',
              'type': 'pc'
            },
            {
              'desc': '3. 更新结算相关数据，选择结算状态，最后点击【提交】按钮即可；',
              'img': 'financial4/pcsan.png',
              'type': 'pc'
            },
            {
              'desc': '小程序端：1. 应用功能页面，点击【订单结算】图标；',
              'img': 'financial4/xcxyi.png',
              'type': 'xcx'
            },
            {
              'desc': '2. 可查看订单结算记录，点击【编辑】按钮；',
              'img': 'financial4/xcxer.png',
              'type': 'xcx'
            },
            {
              'desc': '3. 更新结算相关数据，选择结算状态，最后点击【提交】按钮即可；',
              'img': 'financial4/xcxsan.png',
              'type': 'xcx'
            }
          ],
          // 问题5
          [
            // 问题5答案
            {
              'desc': '1. 应用功能页面，点击【订单结算】图标；',
              'img': 'financial5/pc1.png',
              'type': 'pc'
            },
            {
              'desc': '2. 在订单结算条件查询中输入要查询的订单的条件，点击【搜索】按钮；',
              'img': 'financial5/pc2.png',
              'type': 'pc'
            },
            {
              'desc': '3. 点击【导出Excel】表格按钮；',
              'img': 'financial5/pc3.png',
              'type': 'pc'
            },
            {
              'desc': '4. 在弹出的对话框中填写Excel存储相关信息，点击【存储】按钮即可；',
              'img': 'financial5/pc4.png',
              'type': 'pc'
            }
          ],
          // 问题6
          [
            // 问题9答案
            {
              'desc': 'PC端：1. 在应用功能页面，点击【订单结算】图标；',
              'img': 'financial9/pc1.png',
              'type': 'pc'
            },
            {
              'desc': '2. 当结算产品单价和发货数量均为0的订单时，点击【编辑】按钮，在弹出框中选择【确定】按钮；',
              'img': 'financial9/pc2.png',
              'type': 'pc'
            },
            {
              'desc': '',
              'img': 'financial9/pc3.png',
              'type': 'pc'
            },
            {
              'desc': '3. 完善信息后，点击【提交】按钮即可；',
              'img': 'financial9/pc4.png',
              'type': 'pc'
            },
            {
              'desc': '小程序端：1. 在【应用功能】页面，点击【订单结算】图标；',
              'img': 'financial9/xcx1.png',
              'type': 'xcx'
            },
            {
              'desc': '2. 当结算产品单价和发货数量均为0的订单时，点击【编辑】按钮，会弹出智能补全提示框，在弹出框中选择【确定】按钮；',
              'img': 'financial9/xcx2.png',
              'type': 'xcx'
            },
            {
              'desc': '',
              'img': 'financial9/xcx3.png',
              'type': 'xcx'
            },
            {
              'desc': '3. 完善信息后，点击【提交】按钮即可；',
              'img': 'financial9/xcx4.png',
              'type': 'xcx'
            }
          ],
          // 问题7
          [
            // 问题7答案
            {
              'desc': 'PC端：1. 应用功能页面，点击【供应商流水单】',
              'img': 'financial6/pc1.png',
              'type': 'pc'
            },
            {
              'desc': '2. 在【供应商结算统计】里的点击【流水单详情】按钮即可。',
              'img': 'financial6/pc2.png',
              'type': 'pc'
            },
            {
              'desc': '小程序端：1. 应用功能页面，点击【供应商流水单】按钮，即可查看所有供应商的详细流水单。',
              'img': 'financial6/xcx1.png',
              'type': 'xcx'
            }
          ],
          // 问题8
          [
            // 问题7答案
            {
              'desc': '1. 应用功能页面，点击【供应商流水单】图标；',
              'img': 'financial7/yi.png',
              'type': 'pc'
            },
            {
              'desc': '2. 找到想要下载的供应商，点击【流水单详情】按钮；（备注：也可下载所有供应商的结算Excel表）；',
              'img': 'financial7/er.png',
              'type': 'pc'
            },
            {
              'desc': '3. 点击【导出EXCEL表格】按钮，即可下载该供应商的结算Excel表；',
              'img': 'financial7/san.png',
              'type': 'pc'
            }
          ],
          // 问题9
          [
            // 问题3答案
            {
              'desc': '1. 方法一：供应商使用微信扫一扫扫描工厂小程序【个人设置】中的【当前选中企业的送货填写码】二维码；',
              'img': 'supplier3/xcx1.png',
              'type': 'pc'
            },
            {
              'desc': '方法二：供应商使用微信扫一扫扫描工厂pc端【供应商流水单】页面中的【扫码填写供应商信息】二维码；',
              'img': 'supplier3/xcx2.png',
              'type': 'pc'
            },
            {
              'desc': '2. 跳转到登录页面，如果该供应商已经注册直接登录即可；如果未注册，点击【去注册】按钮；',
              'img': 'supplier3/xcx3.png',
              'type': 'pc'
            },
            {
              'desc': '3. 登录成功后打开提交送货单页面，填写送货单相关货物信息，最后点击【提交按钮】即可；',
              'img': 'supplier3/xcx4.png',
              'type': 'pc'
            }
          ],
          // 问题10
          [
            // 问题4答案
            {
              'desc': 'PC端：1. 点击【供应商流水单】图标；',
              'img': 'supplier4/pc1.png',
              'type': 'pc'
            },
            {
              'desc': '2. 找到需要确认的流水单，点击【确认送货单】按钮即可；',
              'img': 'supplier4/pc2.png',
              'type': 'pc'
            },
            {
              'desc': '小程序：1. 在【应用功能】页面，查看该页面的最上端是否有【XX条送货记录待确认】按钮，有的话点击该按钮；',
              'img': 'supplier4/xcx1.png',
              'type': 'xcx'
            },
            {
              'desc': '2. 找到需要确认的送货单，点击右边确认图标单个确认，或者勾选多个送货单点击下面【批量确认】按钮即可；',
              'img': 'supplier4/xcx2.png',
              'type': 'xcx'
            }
          ],
          // 问题11
          [
            // 问题6答案
            {
              'desc': 'PC端：1. 【应用功能】页面，点击【供应商流水单】图标；',
              'img': 'supplier6/pc1.png',
              'type': 'pc'
            },
            {
              'desc': '2. 点击【添加退货单】或【添加送货单】；',
              'img': 'supplier6/pc2.png',
              'type': 'pc'
            },
            {
              'desc': '3. 选择供应商名称，填写货物信息后，最后点击【提交】按钮即可；',
              'img': 'supplier6/pc3.png',
              'type': 'pc'
            },
            {
              'desc': '小程序端：1. 【应用功能】页面， 点击【供应商流水单】图标；',
              'img': 'supplier6/xcx1.png',
              'type': 'xcx'
            },
            {
              'desc': '2. 点击【添加退货单】；',
              'img': 'supplier6/xcx2.png',
              'type': 'xcx'
            },
            {
              'desc': '3. 选择供应商名称，填写退货单货物信息，最后点击【提交】按钮即可；',
              'img': 'supplier6/xcx3.png',
              'type': 'xcx'
            }
          ],
          // 问题12
          [
            // 问题8答案
            {
              'desc': 'PC端：1. 在【应用功能】页面，点击【供应商流水单】图标；',
              'img': 'financial8/pc1.png',
              'type': 'pc'
            },
            {
              'desc': '2. 点击【添加现结单】按钮；',
              'img': 'financial8/pc2.png',
              'type': 'pc'
            },
            {
              'desc': '3. 默认交易状态是已结算，完善信息后，点击【提交】按钮即可添加一个现结单；',
              'img': 'financial8/pc3.png',
              'type': 'pc'
            },
            {
              'desc': '4. 在流水单页面，找到需要操作的现结单，点击【结算现结单】按钮即可结算当前现结单；',
              'img': 'financial8/pc4.png',
              'type': 'pc'
            },
            {
              'desc': '5. 在流水单页面，找到需要操作的现结单，点击【作废现结单】按钮即可作废当前现结单；',
              'img': 'financial8/pc5.png',
              'type': 'pc'
            },
            {
              'desc': '小程序端：1. 在【应用功能】页面， 点击【供应商流水单】图标；',
              'img': 'financial8/xcx1.png',
              'type': 'xcx'
            },
            {
              'desc': '2. 点击【现结单】页面，点击【添加现结单】按钮；',
              'img': 'financial8/xcx2.png',
              'type': 'xcx'
            },
            {
              'desc': '3. 默认现结单状态是已结算，完善信息后,点击【提交】按钮即可添加一个现结单；',
              'img': 'financial8/xcx3.png',
              'type': 'xcx'
            },
            {
              'desc': '4. 点击【现结单】页面，如果该现结单交易状态是未结算且后边有对勾图标，点击对勾图标，在弹出来的对话框中点击【确定】按钮即可结算当前现结单；',
              'img': 'financial8/xcx4.png',
              'type': 'xcx'
            },
            {
              'desc': '',
              'img': 'financial8/xcx5.png',
              'type': 'xcx'
            },
            {
              'desc': '5. 点击【现结单】页面，点击【作废现结单】按钮，即可作废当前现结单；',
              'img': 'financial8/xcx6.png',
              'type': 'xcx'
            },
            {
              'desc': '',
              'img': 'financial8/xcx7.png',
              'type': 'xcx'
            }
          ]
        ],
        // 4.客户/订单管理
        [
          // 问题1
          [
            // 问题1答案
            {
              'desc': 'PC端：1. 应用功能页面，点击【订单管理】图标；',
              'img': 'order1/pc1.png',
              'type': 'pc'
            },
            {
              'desc': '2. 点击【添加新的订单】按钮；',
              'img': 'order1/pc2.png',
              'type': 'pc'
            },
            {
              'desc': '3. 填写订单基本信息和订单包含的产品列表信息，如果包含多个产品，请点击【继续添加产品】按钮；',
              'img': 'order1/pc3.png',
              'type': 'pc'
            },
            {
              'desc': '4. 填写完毕后，点击【确认添加订单】按钮即可添加成功；',
              'img': 'order1/pc4.png',
              'type': 'pc'
            },
            {
              'desc': '小程序端：1. 应用功能页面，点击【添加新订单】图标；',
              'img': 'order1/xcx1.png',
              'type': 'xcx'
            },
            {
              'desc': '2. 填写订单基本信息和订单包含的产品列表信息，如果包含多个产品，请点击【继续添加产品】按钮；',
              'img': 'order1/xcx2.png',
              'type': 'xcx'
            },
            {
              'desc': '3. 填写完毕后，点击【确认添加订单】按钮即可添加成功；',
              'img': 'order1/xcx3.png',
              'type': 'xcx'
            }
          ],
          // 问题2
          [
            // 问题2答案
            {
              'desc': '1. 应用功能页面，点击【订单管理】图标；',
              'img': 'order2/pc1.png',
              'type': 'pc'
            },
            {
              'desc': '2. 点击【下载订单excel模板】按钮；',
              'img': 'order2/pc2.png',
              'type': 'pc'
            },
            {
              'desc': '3. 打开下载的订单模板，根据自身实际订单信息录入表格，填写完成后将文件保存在桌面；',
              'img': 'order2/pc3.png',
              'type': 'pc'
            },
            {
              'desc': '4. 回到订单列表页面，点击【上传订单excel】按钮，选择刚才保存的订单列表添加，即可上传成功；',
              'img': 'order2/pc4.png',
              'type': 'pc'
            }
          ],
          // 问题3
          [
            // 问题3答案
            {
              'desc': 'PC端：1. 应用功能页面，点击【订单管理】图标；',
              'img': 'order3/pc1.png',
              'type': 'pc'
            },
            {
              'desc': '2. 查看到订单条件查询板块，输入想要查询的订单信息或者包含的产品信息，点击【搜索】按钮即可；',
              'img': 'order3/pc2.png',
              'type': 'pc'
            },
            {
              'desc': '小程序端：1. 应用功能页面，点击【订单管理】图标；',
              'img': 'order3/xcx1.png',
              'type': 'xcx'
            },
            {
              'desc': '2. 点击条件搜索框；',
              'img': 'order3/xcx2.png',
              'type': 'xcx'
            },
            {
              'desc': '3. 输入想要查询的订单信息或者产品信息，点击【搜索】按钮即可；',
              'img': 'order3/xcx3.png',
              'type': 'xcx'
            }
          ],
          // 问题4
          [
            // 问题4答案
            {
              'desc': '1. 应用页面，点击【订单管理】图标；',
              'img': 'order4/pc1.png',
              'type': 'pc'
            },
            {
              'desc': '2. 在订单条件查询中输入要查询的订单的条件，点击【搜索】按钮；',
              'img': 'order4/pc2.png',
              'type': 'pc'
            },
            {
              'desc': '3. 点击【导出Excel表格】按钮；',
              'img': 'order4/pc3.png',
              'type': 'pc'
            },
            {
              'desc': '4. 在弹出的对话框中填写Excel存储相关信息，点击【存储】按钮即可；',
              'img': 'order4/pc4.png',
              'type': 'pc'
            }
          ],
          // 问题5
          [
            {
              'desc': '1. 应用功能页面，点击【订单列表】图标；',
              'img': 'order5/xcx1.png',
              'type': 'xcx'
            },
            {
              'desc': '2. 找到想要分享的订单，点击【分享】按钮；',
              'img': 'order5/xcx2.png',
              'type': 'xcx'
            },
            {
              'desc': '3. 点击最下面【保存到相册】图标即可将该图片下载到手机相册里，可通过相册转发分享；',
              'img': 'order5/xcx3.png',
              'type': 'xcx'
            }
          ],
          // 8.问题1
          [
            // 问题1答案
            {
              'desc': 'PC端：1. 【应用功能】页面，点击【客户管理】图标；',
              'img': 'custom1/pc1.png',
              'type': 'pc'
            },
            {
              'desc': '2. 点击【添加客户】按钮；',
              'img': 'custom1/pc2.png',
              'type': 'pc'
            },
            {
              'desc': '3. 完善信息后，点击【添加客户】按钮即可添加；',
              'img': 'custom1/pc3.png',
              'type': 'pc'
            },
            {
              'desc': '小程序端：1. 【应用功能】页面，点击【添加客户信息】图标；',
              'img': 'custom1/xcx1.png',
              'type': 'xcx'
            },
            {
              'desc': '2. 填写客户信息，最后点击【添加客户】按钮即可；',
              'img': 'custom1/xcx2.png',
              'type': 'xcx'
            }
          ],
          // 问题2
          [
            // 问题2答案
            {
              'desc': 'PC端：1. 【应用功能】页面，点击【客户管理】图标；',
              'img': 'custom2/pc1.png',
              'type': 'pc'
            },
            {
              'desc': '2. 找到需要修改的客户，点击【查看/修改】按钮；',
              'img': 'custom2/pc2.png',
              'type': 'pc'
            },
            {
              'desc': '3. 修改信息后，点击【确认修改】按钮即可修改；',
              'img': 'custom2/pc3.png',
              'type': 'pc'
            },
            {
              'desc': '小程序端：1. 【应用功能】页面，点击【客户信息列表】图标；;',
              'img': 'custom2/xcx1.png',
              'type': 'xcx'
            },
            {
              'desc': '2. 找到需要修改的客户，点击【编辑】按钮；',
              'img': 'custom2/xcx2.png',
              'type': 'xcx'
            },
            {
              'desc': '3. 编辑完信息后，点击【确认修改】按钮即可；',
              'img': 'custom2/xcx3.png',
              'type': 'xcx'
            }
          ],
          // 问题3
          [
            // 问题3答案
            {
              'desc': 'PC端：1. 【应用功能】页面，点击【客户管理】图标；',
              'img': 'custom3/pc1.png',
              'type': 'pc'
            },
            {
              'desc': '2. 找到需要删除的客户，点击【删除】按钮；',
              'img': 'custom3/pc2.png',
              'type': 'pc'
            },
            {
              'desc': '3. 点击【确认】按钮即可删除；',
              'img': 'custom3/pc3.png',
              'type': 'pc'
            },
            {
              'desc': '小程序端：1. 【应用功能】页面，点击【客户信息列表】图标；',
              'img': 'custom3/xcx1.png',
              'type': 'xcx'
            },
            {
              'desc': '2. 找到需要删除的客户，点击【删除】按钮；',
              'img': 'custom3/xcx2.png',
              'type': 'xcx'
            },
            {
              'desc': '3. 点击【确定】按钮即可删除；',
              'img': 'custom3/xcx3.png',
              'type': 'xcx'
            }
          ]
        ],
        // 5.生产排产
        [
          // 问题1
          [
            // 问题1答案
            {
              'desc': 'PC端：1. 应用功能页面，点击【生产排产】图标；',
              'img': 'product1/pc1.png',
              'type': 'pc'
            },
            {
              'desc': '2. 打开需要排产的订单板块，选择一个要排产的订单，点击右边【点击进行排产】按钮；',
              'img': 'product1/pc2.png',
              'type': 'pc'
            },
            {
              'desc': '3. 点击【选择】按钮，选择一个产品进行生产；然后选择该生产单的生产工序；',
              'img': 'product1/pc3.png',
              'type': 'pc'
            },
            {
              'desc': '4. 接下来选择排产的方式（一共有4种排产方式，分别是手动排产：可根据实际需要，完全手动排产；尽量平均配码：按照配码总数平均分配，尽量保证每张生产单的配码总数平均分配；尽量平均整数配码：按照配码总数平均分配，尽量保证每张生产单的配码总数平均分配并且为配码整数的倍数配码整数：规定每张生产单的数量是该整数的倍数；单一码数配码：按照码数分配，尽量保证每张生产单只有一个码数，并且每张生产单的生产数量大致相同）；然后根据实际需求可对工序工资进行修改；',
              'img': 'product1/pc4.png',
              'type': 'pc'
            },
            {
              'desc': '5. 最后点击最下面【添加排产信息】按钮即可，添加成功后到进行中的生产单板块中查看；',
              'img': 'product1/pc5.png',
              'type': 'pc'
            },
            {
              'desc': '小程序端：1. 应用功能页面，点击【待排产订单列表】图标；',
              'img': 'product1/xcx1.png',
              'type': 'xcx'
            },
            {
              'desc': '2. 选择一个需要排产的订单，点击【点击进行排产】按钮；',
              'img': 'product1/xcx2.png',
              'type': 'xcx'
            },
            {
              'desc': '3. 选中一个产品进行生产；',
              'img': 'product1/xcx3.png',
              'type': 'xcx'
            },
            {
              'desc': '4. 选择该生产单的生产工序；接下来选择排产的方式（一共有4种排产方式，分别是手动排产：可根据实际需要，完全手动排产；尽量平均配码：按照配码总数平均分配，尽量保证每张生产单的配码总数平均分配；尽量平均整数配码：按照配码总数平均分配，尽量保证每张生产单的配码总数平均分配并且为配码整数的倍数配码整数：规定每张生产单的数量是该整数的倍数；单一码数配码：按照码数分配，尽量保证每张生产单只有一个码数，并且每张生产单的生产数量大致相同）；然后根据实际需求可对工序工资进行修改；',
              'img': 'product1/xcx4.png',
              'type': 'xcx'
            },
            {
              'desc': '5. 最后点击最下面【添加排产信息】按钮即可，添加成功后到生产进度页面中查看；',
              'img': 'product1/xcx5.png',
              'type': 'xcx'
            }
          ],
          // 问题2
          [
            // 问题2答案
            {
              'desc': '1. 应用功能页面，点击【生产排产】图标；',
              'img': 'product2/pc1.png',
              'type': 'pc'
            },
            {
              'desc': '2. 点击进行中的生产单板块中的【高级搜索】按钮，可以先用高级搜索筛选出生产单；然后点击【批量操作】按钮；',
              'img': 'product2/pc2.png',
              'type': 'pc'
            },
            {
              'desc': '3. 选择要打印的生产单，点击【批量打印】按钮；',
              'img': 'product2/pc3.png',
              'type': 'pc'
            },
            {
              'desc': '4. 点击【打印】按钮，根据自身电脑连接的打印机打印即可；',
              'img': 'product2/pc4.png',
              'type': 'pc'
            }
          ],
          // 问题3
          [
            // 问题3答案
            {
              'desc': '1. 应用功能页面，点击【生产排产】图标；',
              'img': 'product3/pc1.png',
              'type': 'pc'
            },
            {
              'desc': '2. 打开【正在进行中的生产单】板块， 点击【批量操作】按钮；',
              'img': 'product3/pc2.png',
              'type': 'pc'
            },
            {
              'desc': '3. 选择要批量修改的生产单；',
              'img': 'product3/pc3.png',
              'type': 'pc'
            },
            {
              'desc': '4. 点击【批量修正工序工资】按钮；',
              'img': 'product3/pc4.png',
              'type': 'pc'
            },
            {
              'desc': '5. 输入工资后，点击【提交修改】按钮即可修改；',
              'img': 'product3/pc5.png',
              'type': 'pc'
            }
          ]
        ],
        // 6.生产进度管理
        [
          // 问题1
          [
            // 问题1答案
            {
              'desc': '1. 员工小程序生产进度页面：点击右上角扫一扫图标；',
              'img': 'productstaff1/xcx1.png',
              'type': 'pc'
            },
            {
              'desc': '2. 然后去扫描生产单上的二维码；',
              'img': 'productstaff1/xcx2.png',
              'type': 'pc'
            },
            {
              'desc': '3. 员工手机端会打开该生产单详情页面，选择一个工序进行计件；',
              'img': 'productstaff1/xcx3.png',
              'type': 'pc'
            },
            {
              'desc': '4. 填写右边实际完成数量，最后点击【确认录入】按钮即可申请个人计件；',
              'img': 'productstaff1/xcx4.png',
              'type': 'pc'
            }
          ],
          // 问题2
          [
            // 问题2答案
            {
              'desc': 'PC端：1. 应用功能页面，点击【生产进度管理】图标；',
              'img': 'productstaff2/pc1.png',
              'type': 'pc'
            },
            {
              'desc': '2. 选择一个蓝框工序点击（蓝色框背景工序即代表需要确认的员工计件）；',
              'img': 'productstaff2/pc2.png',
              'type': 'pc'
            },
            {
              'desc': '3. 点击【确认】按钮即同意员工计件；',
              'img': 'productstaff2/pc3.png',
              'type': 'pc'
            },
            {
              'desc': '小程序端：方法一：1. 应用功能页面，点击最上面【员工计件待确认】记录；',
              'img': 'productstaff2/xcx1.png',
              'type': 'xcx'
            },
            {
              'desc': '2. 单选或多选要同意的员工计件信息，点击【确认】按钮或【批量确认】按钮即可同意员工计件；',
              'img': 'productstaff2/xcx2.png',
              'type': 'xcx'
            },
            {
              'desc': '方法二：1. 应用功能页面，点击最上面扫一扫图标，去扫描生产单上的二维码；或者在生产进度页面，点击右上角扫一扫图标去扫描生产单上的二维码；',
              'img': 'productstaff2/xcx3.png',
              'type': 'xcx'
            },
            {
              'desc': '2. 扫码后即打开该生产单详情页，点击需要确认的工序记录；',
              'img': 'productstaff2/xcx4.png',
              'type': 'xcx'
            },
            {
              'desc': '3. 查看员工对应信息，点击【确认】按钮即可同意员工计件；',
              'img': 'productstaff2/xcx5.png',
              'type': 'xcx'
            }
          ],
          // 问题3
          [
            // 问题3答案
            {
              'desc': '1. 生产进度页面，点击要合伙计件的生产单；',
              'img': 'productstaff3/xcx1.png',
              'type': 'xcx'
            },
            {
              'desc': '2. 点击要合伙计件的工序；',
              'img': 'productstaff3/xcx2.png',
              'type': 'xcx'
            },
            {
              'desc': '3. 点击【合伙计件记录】图标；',
              'img': 'productstaff3/xcx3.png',
              'type': 'xcx'
            },
            {
              'desc': '4. 在【合伙人选中】那列中，为需要合伙计件的人员打勾；',
              'img': 'productstaff3/xcx4.png',
              'type': 'xcx'
            },
            {
              'desc': '5. 点击【合伙人提交】按钮即合伙计件成功；',
              'img': 'productstaff3/xcx5.png',
              'type': 'xcx'
            }
          ]
        ],
        // 7.产品资料库
        [
          // 问题1
          [
            // 问题1答案
            {
              'desc': '1. 【应用功能】页面，点击【产品资料库】图标；',
              'img': 'productinfo1/pc1.png',
              'type': 'pc'
            },
            {
              'desc': '2. 填写想要查询的产品信息后，点击【搜索】按钮；',
              'img': 'productinfo1/pc2.png',
              'type': 'pc'
            }
          ],
          // 问题2
          [
            // 问题2答案
            {
              'desc': 'PC端：1. 【应用功能】页面，点击【产品资料库】图标；',
              'img': 'productinfo2/pc1.png',
              'type': 'pc'
            },
            {
              'desc': '2. 找到需要修改的产品，点击【编辑】按钮；',
              'img': 'productinfo2/pc2.png',
              'type': 'pc'
            },
            {
              'desc': '3. 修改完信息后，点击【确认修改产品】按钮即可修改；',
              'img': 'productinfo2/pc3.png',
              'type': 'pc'
            },
            {
              'desc': '4. 找到需要删除的产品，点击【删除】按钮；',
              'img': 'productinfo2/pc4.png',
              'type': 'pc'
            },
            {
              'desc': '5. 点击【确认】按钮即可删除；',
              'img': 'productinfo2/pc5.png',
              'type': 'pc'
            },
            {
              'desc': '小程序端：1. 【应用功能】页面，点击【产品列表】图标；',
              'img': 'productinfo2/xcx1.png',
              'type': 'xcx'
            },
            {
              'desc': '2. 找到需要修改的产品，点击【编辑】按钮；',
              'img': 'productinfo2/xcx2.png',
              'type': 'xcx'
            },
            {
              'desc': '3. 修改完信息后，点击【提交】按钮即可修改；',
              'img': 'productinfo2/xcx3.png',
              'type': 'xcx'
            },
            {
              'desc': '4. 回到列表页面找到需要删除的产品，点击【删除】按钮；',
              'img': 'productinfo2/xcx4.png',
              'type': 'xcx'
            },
            {
              'desc': '5. 点击【确认】按钮即可删除；',
              'img': 'productinfo2/xcx5.png',
              'type': 'xcx'
            }
          ],
          // 问题3
          [
            // 问题3答案
            {
              'desc': 'PC端：1. 【应用功能】页面，点击【产品资料库】图标；',
              'img': 'productinfo3/pc1.png',
              'type': 'pc'
            },
            {
              'desc': '2. 左上角，点击【添加新的产品】按钮；',
              'img': 'productinfo3/pc2.png',
              'type': 'pc'
            },
            {
              'desc': '3. 完善产品信息后，点击【确认添加产品】按钮即可添加；',
              'img': 'productinfo3/pc3.png',
              'type': 'pc'
            },
            {
              'desc': '小程序端：1. 【应用功能】页面，点击【添加新产品】图标；',
              'img': 'productinfo3/xcx1.png',
              'type': 'xcx'
            },
            {
              'desc': '2. 填写产品的基本信息和产品包含的部位及物料信息，最后点击【提交】按钮即可；',
              'img': 'productinfo3/xcx2.png',
              'type': 'xcx'
            }
          ],
          // 问题4
          [
            {
              'desc': '1. 应用功能页面，点击【产品资料库】图标；',
              'img': 'productinfo4/pc1.png',
              'type': 'pc'
            },
            {
              'desc': '2. 查看产品资料列表，找一个想要复制的产品，点击【复制并添加】按钮；',
              'img': 'productinfo4/pc2.png',
              'type': 'pc'
            },
            {
              'desc': '3. 因为不能添加完全一样的产品，所以需要在此基础上根据自身需求更改产品信息，最后点击【确认添加产品】按钮即可添加新的产品；',
              'img': 'productinfo4/pc3.png',
              'type': 'pc'
            }
          ],
          // 问题5
          [
            {
              'desc': '1. 应用功能页面，点击【产品资料库】图标；',
              'img': 'productinfo5/pc1.png',
              'type': 'pc'
            },
            {
              'desc': '2. 左上角，点击【添加新的产品】按钮；',
              'img': 'productinfo5/pc2.png',
              'type': 'pc'
            },
            {
              'desc': '3. 点击【部位物料信息智能填充】按钮，可以通过筛选产品来选择需要加入的部位及物料信息；',
              'img': 'productinfo5/pc3.png',
              'type': 'pc'
            },
            {
              'desc': '4. 例如通过楦型进行筛选，先勾选楦型、选择楦型，然后选择加入的部位及物料信息，最后点击【确定】按钮；',
              'img': 'productinfo5/pc4.png',
              'type': 'pc'
            },
            {
              'desc': '5. 可以查看到列表已添加上选中的部位物料信息，然后可根据自身需求补充其他部位信息和填写产品基本信息；',
              'img': 'productinfo5/pc5.png',
              'type': 'pc'
            },
            {
              'desc': '6. 填写完毕后，点击最下面的【确认添加产品】按钮即可；',
              'img': 'productinfo5/pc6.png',
              'type': 'pc'
            }
          ]
        ],
        // 8.工序管理
        [
          // 问题1
          [
            // 问题1答案
            {
              'desc': '1. 应用功能页面，点击【工序管理】图标；',
              'img': 'process1/pc1.png',
              'type': 'pc'
            },
            {
              'desc': '2. 右上角，点击【添加新的工序】按钮；',
              'img': 'process1/pc2.png',
              'type': 'pc'
            },
            {
              'desc': '3. 填写工序信息，最后点击【添加工序】按钮；',
              'img': 'process1/pc3.png',
              'type': 'pc'
            },
            {
              'desc': '4. 添加成功后可在工序管理列表中查看到该工序；',
              'img': 'process1/pc4.png',
              'type': 'pc'
            },
            {
              'desc': '5. 工序管理页面，选择一个工序点击右边【删除】按钮，即可删除；',
              'img': 'process1/pc5.png',
              'type': 'pc'
            }
          ],
          // 问题2
          [
            // 问题2答案
            {
              'desc': '1. 点击【工序管理】图标；',
              'img': 'process2/pc1.png',
              'type': 'pc'
            },
            {
              'desc': '2. 找到对应的工序，点击【上升】或【下降】按钮，即可对该工序的顺序进行调整；',
              'img': 'process2/pc2.png',
              'type': 'pc'
            }
          ]
        ],
        // 9.部位管理
        [
          // 问题1
          [
            // 问题1答案
            {
              'desc': '1. 应用功能页面，点击【部位管理】图标；',
              'img': 'part1/pc1.png',
              'type': 'pc'
            },
            {
              'desc': '2. 右上角，点击【添加新的部位】按钮；',
              'img': 'part1/pc2.png',
              'type': 'pc'
            },
            {
              'desc': '3. 填写部位信息，最后点击【添加部位】按钮；',
              'img': 'part1/pc3.png',
              'type': 'pc'
            },
            {
              'desc': '4. 添加成功后可在部位管理列表中查看到该部位；',
              'img': 'part1/pc4.png',
              'type': 'pc'
            },
            {
              'desc': '5. 部位管理页面，选择一个部位点击右边【删除】按钮，即可删除该部位；',
              'img': 'part1/pc5.png',
              'type': 'pc'
            }
          ],
          // 问题2
          [
            // 问题2答案
            {
              'desc': '1. 点击【部位管理】图标；',
              'img': 'part2/pc1.png',
              'type': 'pc'
            },
            {
              'desc': '1. 找到想要调整的部位，点击【上升】或【下降】按钮，即可对该部位的顺序进行调整。',
              'img': 'part2/pc2.png',
              'type': 'pc'
            }
          ]
        ],
        // 10.仓库物料管理
        [
          // 问题1
          [
            // 问题1答案
            {
              'desc': '1. 点击【仓库报表】选项卡；',
              'img': 'stock1/pc1.png',
              'type': 'pc'
            },
            {
              'desc': '2. 点击【导出EXCEL表格】按钮；',
              'img': 'stock1/pc2.png',
              'type': 'pc'
            }
          ],
          // 问题2
          [
            // 问题2答案
            {
              'desc': 'PC端：1. 点击【仓库入库】选项卡；',
              'img': 'stock2/pc1.png',
              'type': 'pc'
            },
            {
              'desc': '2. 点击【手动入库】按钮；',
              'img': 'stock2/pc2.png',
              'type': 'pc'
            },
            {
              'desc': '3. 输入想要查询的物料信息，点击【查询物料】按钮，查询准备入库的物料；',
              'img': 'stock2/pc3.png',
              'type': 'pc'
            },
            {
              'desc': '4. 选择准备入库的物料；',
              'img': 'stock2/pc4.png',
              'type': 'pc'
            },
            {
              'desc': '5. 输入入库数量；',
              'img': 'stock2/pc5.png',
              'type': 'pc'
            },
            {
              'desc': '6. 点击【添加入库】按钮即入库成功；',
              'img': 'stock2/pc6.png',
              'type': 'pc'
            },
            {
              'desc': '小程序端：1. 【应用功能】页面，点击【仓库入库】模块；',
              'img': 'stock2/xcx1.jpg',
              'type': 'xcx'
            },
            {
              'desc': '2. 点击【手动入库】按钮；',
              'img': 'stock2/xcx2.jpg',
              'type': 'xcx'
            },
            {
              'desc': '3. 输入想要搜索的物料信息，点击【搜索】按钮；',
              'img': 'stock2/xcx3.jpg',
              'type': 'xcx'
            },
            {
              'desc': '4. 选择准备入库的物料；',
              'img': 'stock2/xcx4.jpg',
              'type': 'xcx'
            },
            {
              'desc': '5. 输入入库数量；',
              'img': 'stock2/xcx5.jpg',
              'type': 'xcx'
            },
            {
              'desc': '6. 最后点击【添加入库】按钮即可；',
              'img': 'stock2/xcx6.jpg',
              'type': 'xcx'
            }
          ],
          // 问题3
          [
            {
              'desc': 'PC端：1. 【应用功能】页面，点击【仓库入库】模块；',
              'img': 'stock3/pc1.png',
              'type': 'pc'
            },
            {
              'desc': '2. 点击【采购单入库】按钮；',
              'img': 'stock3/pc2.png',
              'type': 'pc'
            },
            {
              'desc': '3. 输入想要搜索的采购单编号，点击【查询采购单】按钮查询采购单；',
              'img': 'stock3/pc3.png',
              'type': 'pc'
            },
            {
              'desc': '4. 选择想要入库的采购单，添加物料数量，最后点击【添加入库】按钮即可；',
              'img': 'stock3/pc4.png',
              'type': 'pc'
            },
            {
              'desc': '小程序端：1. 【应用功能】页面，点击【仓库入库】模块；',
              'img': 'stock3/xcx1.png',
              'type': 'xcx'
            },
            {
              'desc': '2. 点击【采购单入库】按钮；',
              'img': 'stock3/xcx2.png',
              'type': 'xcx'
            },
            {
              'desc': '3. 输入想要搜索的采购单编号，点击【搜索】按钮查询采购单；',
              'img': 'stock3/xcx3.png',
              'type': 'xcx'
            },
            {
              'desc': '4. 选择想要入库的采购单；',
              'img': 'stock3/xcx4.png',
              'type': 'xcx'
            },
            {
              'desc': '5. 填入物料数量，最后点击最下面【添加入库】按钮即可；',
              'img': 'stock3/xcx5.png',
              'type': 'xcx'
            }
          ],
          // 问题4
          [
            {
              'desc': 'PC端：1. 【应用功能】页面，点击【仓库出库】图标；',
              'img': 'stock4/pc1.png',
              'type': 'pc'
            },
            {
              'desc': '2. 点击【手动出库】按钮；',
              'img': 'stock4/pc2.png',
              'type': 'pc'
            },
            {
              'desc': '3. 输入要出库的物料，点击右上角【查询物料】按钮进行搜索；',
              'img': 'stock4/pc3.png',
              'type': 'pc'
            },
            {
              'desc': '4. 选择想要出库的物料，输入出库数量，最后点击【领取出库】按钮即可提交；',
              'img': 'stock4/pc4.png',
              'type': 'pc'
            },
            {
              'desc': '小程序端：1. 【应用功能】页面，点击【仓库出库】图标；',
              'img': 'stock4/xcx1.png',
              'type': 'xcx'
            },
            {
              'desc': '2. 点击【手动出库】按钮；',
              'img': 'stock4/xcx2.png',
              'type': 'xcx'
            },
            {
              'desc': '3. 输入要出库的物料，点击右上角【搜索】按钮进行搜索；',
              'img': 'stock4/xcx3.png',
              'type': 'xcx'
            },
            {
              'desc': '4. 选择想要出库的物料；',
              'img': 'stock4/xcx4.png',
              'type': 'xcx'
            },
            {
              'desc': '5. 输入出库数量，最后点击【添加出库】按钮即可提交；',
              'img': 'stock4/xcx5.png',
              'type': 'xcx'
            }
          ],
          // 问题5
          [
            {
              'desc': 'PC端：1. 【应用功能】页面，点击【仓库出库】图标；',
              'img': 'stock5/pc1.png',
              'type': 'pc'
            },
            {
              'desc': '2. 点击【生产单出库】按钮；',
              'img': 'stock5/pc2.png',
              'type': 'pc'
            },
            {
              'desc': '3. 输入生产单编号，点击右上角【搜索】按钮进行搜索；',
              'img': 'stock5/pc3.png',
              'type': 'pc'
            },
            {
              'desc': '4. 选择生产单，输入领取数量，最后点击最下面【领取出库】按钮即可提交；',
              'img': 'stock5/pc4.png',
              'type': 'pc'
            },
            {
              'desc': '小程序端：1. 【应用功能】页面，点击【仓库出库】图标；',
              'img': 'stock5/xcx1.png',
              'type': 'xcx'
            },
            {
              'desc': '2. 点击【生产单出库】按钮；',
              'img': 'stock5/xcx2.png',
              'type': 'xcx'
            },
            {
              'desc': '3. 输入生产单编号，点击右上角【搜索】按钮进行搜索；',
              'img': 'stock5/xcx3.png',
              'type': 'xcx'
            },
            {
              'desc': '4. 选择生产单，输入领取数量，最后点击最下面【领取出库】按钮即可提交；',
              'img': 'stock5/xcx4.png',
              'type': 'xcx'
            }
          ],
          // 问题6
          [
            {
              'desc': 'PC端：1. 应用功能页面，点击【仓库报表】图标；',
              'img': 'stock6/pc1.png',
              'type': 'pc'
            },
            {
              'desc': '2. 点击【添加物料】按钮；',
              'img': 'stock6/pc2.png',
              'type': 'pc'
            },
            {
              'desc': '3. 填写物料基本信息和供应商信息，最后点击【添加物料信息】按钮即可；',
              'img': 'stock6/pc3.png',
              'type': 'pc'
            },
            {
              'desc': '小程序端：1. 应用功能页面，点击【仓库报表】图标；',
              'img': 'stock6/xcx1.png',
              'type': 'xcx'
            },
            {
              'desc': '2. 点击【添加物料】按钮；',
              'img': 'stock6/xcx2.png',
              'type': 'xcx'
            },
            {
              'desc': '3. 填写物料基本信息和供应商信息，最后点击【添加物料信息】按钮即可；',
              'img': 'stock6/xcx3.png',
              'type': 'xcx'
            }
          ],
          // 问题7
          [
            {
              'desc': '1. 应用功能页面，点击【仓库报表】图标；',
              'img': 'stock7/pc1.png',
              'type': 'pc'
            },
            {
              'desc': '2. 查看物料记录，找一个想要复制的物料，点击右边【复制添加】按钮；',
              'img': 'stock7/pc2.png',
              'type': 'pc'
            },
            {
              'desc': '3. 因为不能添加完全一样的物料，所以需要在此基础上根据自身需求更改物料信息，最后点击【添加物料信息】按钮即可；',
              'img': 'stock7/pc3.png',
              'type': 'pc'
            }
          ]
        ],
        // 11.采购管理
        [
          // 问题7
          [
            // 问题7答案
            {
              'desc': 'PC端：1. 【应用功能】页面，点击【采购单列表】图标；',
              'img': 'supplier7/pc1.png',
              'type': 'pc'
            },
            {
              'desc': '2. 在条件查询中输入采购单信息，点击【查询采购单记录】按钮；',
              'img': 'supplier7/pc2.png',
              'type': 'pc'
            },
            {
              'desc': '3. 找到所需的采购单，点击【查看】按钮即可查看；',
              'img': 'supplier7/pc3.png',
              'type': 'pc'
            },
            {
              'desc': '4. 点击【删除】按钮，在点击确定即可删除采购单；',
              'img': 'supplier7/pc4.png',
              'type': 'pc'
            },
            {
              'desc': '小程序端：1. 【应用功能】页面，点击【采购单列表】图标； 点击【供应商流水单】图标；',
              'img': 'supplier7/xcx1.png',
              'type': 'xcx'
            },
            {
              'desc': '2. 找到想要查看的采购单，点击【查看】按钮即可查看；',
              'img': 'supplier7/xcx2.png',
              'type': 'xcx'
            },
            {
              'desc': '3. 点击【删除】按钮，在点击确定即可删除采购单；',
              'img': 'supplier7/xcx3.png',
              'type': 'xcx'
            }
          ],
          // 问题8
          [
            // 问题7答案
            {
              'desc': 'PC端：1. 【应用功能】页面，点击【添加采购单】图标；',
              'img': 'purchas/pc1.png',
              'type': 'pc'
            },
            {
              'desc': '2. 输入想要搜索的物料条件后，点击【搜索物料】按钮；',
              'img': 'purchas/pc2.png',
              'type': 'pc'
            },
            {
              'desc': '3. 选择物料；',
              'img': 'purchas/pc3.png',
              'type': 'pc'
            },
            {
              'desc': '4. 可以选择供应商和填写目标购买数量，最后点击【生成采购单】按钮即可；',
              'img': 'purchas/pc4.png',
              'type': 'pc'
            },
            {
              'desc': '小程序端：1. 【应用功能】页面，点击【添加采购单】图标；',
              'img': 'purchas/xcx1.png',
              'type': 'xcx'
            },
            {
              'desc': '2. 输入想要搜索的物料信息后，点击【搜索物料】按钮；',
              'img': 'purchas/xcx2.png',
              'type': 'xcx'
            },
            {
              'desc': '3. 选择物料；',
              'img': 'purchas/xcx3.png',
              'type': 'xcx'
            },
            {
              'desc': '4. 可以选择供应商和填写购买数量，最后点击【提交】按钮即可；',
              'img': 'purchas/xcx4.png',
              'type': 'xcx'
            }
          ],
          // 问题9
          [
            {
              'desc': '1. 应用功能页面，点击【采购单列表】图标；',
              'img': 'purchas1/pc1.png',
              'type': 'pc'
            },
            {
              'desc': '2. 打开采购单列表页面后，会查看到等待和完成两种状态；',
              'img': 'purchas1/pc2.png',
              'type': 'pc'
            },
            {
              'desc': '3. 当添加新的采购单后，默认是等待状态，需要去采购所需原料，当采购完毕后就可点击【完成入库】按钮进行入库；',
              'img': 'purchas1/pc3.png',
              'type': 'pc'
            },
            {
              'desc': '4. 点击【完成入库】后，状态则会变成完成状态，说明已经入库，该采购单已完成；',
              'img': 'purchas1/pc4.png',
              'type': 'pc'
            }
          ]
        ],
        // 12.供应商管理
        [
          // 问题1
          [
            // 问题1答案
            {
              'desc': 'PC端：1. 【应用功能】页面，点击【供应商列表】图标；',
              'img': 'supplier1/pc1.png',
              'type': 'pc'
            },
            {
              'desc': '2. 点击【添加供应商】按钮；',
              'img': 'supplier1/pc2.png',
              'type': 'pc'
            },
            {
              'desc': '3.  填写该页面信息，最后点击【添加供应商】按钮即可添加；',
              'img': 'supplier1/pc3.png',
              'type': 'pc'
            },
            {
              'desc': '小程序端：1. 【应用功能】页面，点击【添加供应商】图标；',
              'img': 'supplier1/xcx1.png',
              'type': 'xcx'
            },
            {
              'desc': '2. 填写该页面信息，最后点击【添加供应商】按钮即可添加；',
              'img': 'supplier1/xcx2.png',
              'type': 'xcx'
            }
          ],
          // 问题2
          [
            // 问题2答案
            {
              'desc': 'PC端：1. 【应用功能】页面，点击【供应商列表】图标；',
              'img': 'supplier2/pc1.png',
              'type': 'pc'
            },
            {
              'desc': '2. 找到要删除的供应商，点击【删除】按钮；',
              'img': 'supplier2/pc2.png',
              'type': 'pc'
            },
            {
              'desc': '3. 点击【确定】按钮即可删除；',
              'img': 'supplier2/pc3.png',
              'type': 'pc'
            },
            {
              'desc': '小程序端：1. 【应用功能】页面，点击【供应商管理】图标；',
              'img': 'supplier2/xcx1.png',
              'type': 'xcx'
            },
            {
              'desc': '2. 找到要删除的供应商，点击【删除】按钮即可删除；',
              'img': 'supplier2/xcx2.png',
              'type': 'xcx'
            }
          ],
          // 问题5
          [
            // 问题5答案
            {
              'desc': 'PC端：1. 【应用功能】页面，点击【供应商列表】图标；',
              'img': 'supplier5/pc1.png',
              'type': 'pc'
            },
            {
              'desc': '2. 点击右侧【查看报价单】按钮即可查看；',
              'img': 'supplier5/pc2.png',
              'type': 'pc'
            },
            {
              'desc': '小程序端：1. 【应用功能】页面，点击【供应商管理】图标；',
              'img': 'supplier5/xcx1.png',
              'type': 'xcx'
            },
            {
              'desc': '2. 点击右侧【查看报价单】按钮即可查看；',
              'img': 'supplier5/xcx2.png',
              'type': 'xcx'
            }
          ]
        ]
      ],
      // 此时展示的问题答案
      answerDetail: []
    }
  },
  computed: {

  },
  watch: {

  },
  created() {
    // 给问题二维数组赋xy定位坐标
    this.qusetionArrXY()
    this.menuClick(0)
    console.log('query_x' + this.$route.query.x)
    console.log('query_y' + this.$route.query.y)
    if (this.$route.query.x && this.$route.query.y) {
      console.log('不是外链')
      this.opendetail()
    }

    // 计算滚动视口高度
    var scrollViewportHeight = document.body.clientHeight - 50 - 34 - 60 - 44
    this.scrollStyle = `height:${scrollViewportHeight}px;`
  },
  mounted() {

  },
  methods: {
    // 查看电脑端
    currClick1() {
      // var str = this.answerDetail[0].desc.slice(0, 3)
      // if (str !== 'PC端') {
      //   return false
      // }
      this.currStates = 'pc'
      this.disablebtnpc = true
      this.disablebtnxcx = false
    },
    // 查看小程序端
    currClick2() {
      this.currStates = 'xcx'
      this.disablebtnpc = false
      this.disablebtnxcx = true
    },
    // qusetionArrXY
    qusetionArrXY() {
      var newQusetionArray = []
      var qusetionArray = deepClone(this.qusetionArr)
      for (let i = 0; i < qusetionArray.length; i++) {
        const item = qusetionArray[i]
        var a = []
        for (let j = 0; j < item.length; j++) {
          const ele = item[j]
          var b = {
            'ques': ele,
            'x': i,
            'y': j
          }
          a.push(b)
        }
        newQusetionArray.push(a)
      }
      console.log(newQusetionArray)
      this.qusetionArr = newQusetionArray
    },
    // 点击侧边栏问题模块
    menuClick(i) {
      this.breadcrumbOne = this.menutitle[i].name
      this.qusetionList = this.qusetionArr[i]
      this.route1 = i
      this.type = 'qusetionList'
      this.breadcrumbTwo = ''
    },
    // 点击问题列表的问题
    detailClick(i) {
      this.breadcrumbTwo = this.qusetionList[i].ques
      this.type = 'questionAnswer'
      this.route2 = i
      this.answerDetail = this.answerList[this.route1][i]
      if (this.answerDetail[0].type === this.answerDetail[((this.answerDetail).length) - 1].type) {
        // 证明是纯pc或小程序
        this.currbtn = false
      } else {
        this.currbtn = true
      }
      if (this.answerDetail[0].type === 'xcx') {
        this.currStates = 'xcx'
      }
      if (this.answerDetail[0].type === 'pc') {
        this.currStates = 'pc'
      }
      this.disablebtnpc = true
      this.disablebtnxcx = false
    },
    // 点击面包屑1
    breadcrumbOneClick() {
      this.qusetionList = this.qusetionArr[this.route1]
      this.type = 'qusetionList'
      this.breadcrumbTwo = ''
    },
    // 外链点击过来的调用方法
    opendetail() {
      this.defaultactive = this.$route.query.x
      this.menuClick(this.$route.query.x)
      this.detailClick(this.$route.query.y)
    },
    // 搜索出的问题数组点击调用方法
    searchQuseClick(item) {
      this.defaultactive = (item.x).toString()
      this.breadcrumbOne = this.menutitle[item.x].name
      this.breadcrumbTwo = item.ques
      this.type = 'questionAnswer'
      this.answerDetail = this.answerList[item.x][item.y]
    },
    // 数组展平
    flattenOnce(arr) {
      return [].concat(...arr)
    },
    // 搜索
    searchques(searchValue) {
      console.log(searchValue)
      // 拿出问题汇总
      var allQuseArr = []
      var qusetionArr = deepClone(this.qusetionArr)
      allQuseArr = this.flattenOnce(qusetionArr)
      // 在所有问题列表中搜
      var newData = allQuseArr.filter(item => {
        if (item.ques.indexOf(searchValue) > -1) {
          return item
        }
        return newData
      })
      if (newData.length === 0) {
        this.$message({
          type: 'warning',
          message: '什么也没搜到，换个词试试吧～'
        })
      } else {
        // 搜出的所有问题
        console.log(newData)
        this.type = 'searchQusetionList'
        this.searchQusetionList = newData
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.tit{
  margin: 20px;
}
.cursor{
  cursor: pointer;
}
.blue{
  color: #3eb55d;
}
.margin{
  margin: 0 5px;
}
.el-header {
  background-color: #eceff3;
  margin: 0 auto;
  width: 100%;
  color: #333;
  line-height: 60px;
  display: flex;
  .el-input-group {
      line-height: normal;
      display: inline-table;
      width: 40%;
      border-collapse: separate;
      border-spacing: 0;
      margin: auto;
  }
}
.el-aside {
  color: #333;
}
.helpname{
  width: 200px;
  color: #ffffff;
  padding: 15px 0;
  text-align: center;
  background-color: #3eb55d;
  margin: 0 5px 0 0;
}
.el-menu-item{
  padding: 0 !important;
  background-color: #e5e5e5;
  margin: 1px 0;
  text-align: center;
}
.break{
  padding: 15px;
  background-color: #e5e5e5;
}
.el-main{
  padding: 0 5px;
}
.el-aside{
  margin: 0 5px;
}
.el-menu-item.is-active {
  background-color: #ffffff !important;
}
.qusetionList{
  border: 1px solid #e5e5e5;
  margin: 20px 0 0 20px;
}
li{
  padding: 10px 0;
}
a:visited{
  color: #0a83ea;
}
a:hover{
  color: #0a83ea;
}
.h4{
  font-size: 20px;
  color: #6BBB78;
  margin: 15px;
  padding: 10px 0;
  font-weight: bold;
  border-bottom: 1px dashed #CDCDCD;
}
.questionAnswer .item{
  padding-left: 40px;
}
.imagepc{
  width: 70%;
}
.imagexcx{
  width: 30%;
}
</style>

