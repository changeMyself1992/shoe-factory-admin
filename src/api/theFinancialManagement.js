/**
 * 封装 财务管理   相关api
 */
import request from '@/utils/request'

/**
 * 通过生产单获取人员工资列表
 */
export function generate_salary_list_by_production_note_unique_ids(obj) {
  return request({
    url: 'finance/generate_salary_list_by_production_note_unique_ids',
    method: 'post',
    data: obj
  })
}

/**
 * 通过采购单获取供应商应付价格
 */
export function generate_supplier_settlement_by_purchase_note_unique_ids(obj) {
  return request({
    url: 'finance/generate_supplier_settlement_by_purchase_note_unique_ids',
    method: 'post',
    data: obj
  })
}

/**
 * 指定时间 生成工资结算在网页端或者小程序端给管理人员显示的统计数据和详细数据
 */
export function generate_salary_list_for_frontend_by_time_range(obj) {
  return request({
    url: 'finance/generate_salary_list_for_frontend_by_time_range',
    method: 'post',
    data: obj
  })
}

/**
 * 指定时间 生成工资结算excel表格 给管理人员显示的统计数据和详细数据
 */
export function generate_salary_list_for_excel_by_time_range(obj) {
  return request({
    url: 'finance/generate_salary_list_for_excel_by_time_range',
    method: 'post',
    data: obj
  })
}
