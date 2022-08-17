/**
 * 封装 供应商   相关api
 */
import request from '@/utils/request'

/**
 * 获取供应商标签配置
 */
export function get_supplier_tag_names(obj) {
  return request({
    url: 'supplier/get_supplier_tag_names',
    method: 'post',
    data: obj
  })
}

/**
 * 供应商标签自动补全
 */
export function supplier_tags_auto_complete(obj) {
  return request({
    url: 'supplier/supplier_tags_auto_complete',
    method: 'post',
    data: obj
  })
}

/**
 * 条件查询供应商信息
 */
export function filter_supplier(obj) {
  return request({
    url: 'supplier/filter_supplier',
    method: 'post',
    data: obj
  })
}
/**
 * 查询系统内所有的供应商
 */
export function filter_suplier_all(obj) {
  return request({
    url: 'supplier/filter_suplier_all',
    method: 'post',
    data: obj
  })
}

/**
 * 为产品的物料选择供应商，提供名字直接补全
 */
export function auto_complete_supplier_for_product_material(obj) {
  return request({
    url: 'supplier/auto_complete_supplier_for_product_material',
    method: 'post',
    data: obj
  })
}

/**
 * 添加供应商
 */
export function add_supplier(obj) {
  return request({
    url: 'supplier/add_supplier',
    method: 'post',
    data: obj
  })
}

/**
 * 编辑供应商信息
 */
export function edit_supplier_by_id(obj) {
  return request({
    url: 'supplier/edit_supplier_by_id',
    method: 'post',
    data: obj
  })
}

/**
 * 删除供应商信息
 */
export function delete_supplier_transaction_by_id(obj) {
  return request({
    url: 'supplier/delete_supplier_transaction_by_id',
    method: 'post',
    data: obj
  })
}

/**
 * 确认删除作废供应商送货单
 */
export function confirm_delete_supplier_transaction_by_id(obj) {
  return request({
    url: 'supplier/confirm_delete_supplier_transaction_by_id',
    method: 'post',
    data: obj
  })
}

/**
 * 供应商供货单详情信息
 */
export function get_supplier_transaction_by_id(obj) {
  return request({
    url: 'supplier/get_supplier_transaction_by_id',
    method: 'post',
    data: obj
  })
}

/**
 * 点击确认供应商供货单
 */
export function confirm_supplier_transaction_by_id(obj) {
  return request({
    url: 'supplier/confirm_supplier_transaction_by_id',
    method: 'post',
    data: obj
  })
}

/**
 * 获取供应商送货单录入微信跳转二维码
 */
export function generate_wx_qr_code(obj) {
  return request({
    url: 'supplier/generate_wx_qr_code',
    method: 'post',
    data: obj
  })
}

/**
 * 条件查询供应商送货单
 */
export function filter_supplier_transactions(obj) {
  return request({
    url: 'supplier/filter_supplier_transactions',
    method: 'post',
    data: obj
  })
}

/**
 * 修改供应商送货单
 */
export function edit_supplier_transaction_by_id(obj) {
  return request({
    url: 'supplier/edit_supplier_transaction_by_id',
    method: 'post',
    data: obj
  })
}

/**
 * 批量确认供应商货单信息
 */
export function batch_confirm_supplier_transaction_by_ids(obj) {
  return request({
    url: 'supplier/batch_confirm_supplier_transaction_by_ids',
    method: 'post',
    data: obj
  })
}

/**
 * 批量结算货单信息
 */
export function batch_settle_supplier_transaction_by_ids(obj) {
  return request({
    url: 'supplier/batch_settle_supplier_transaction_by_ids',
    method: 'post',
    data: obj
  })
}

/**
 * 结算供应商货单
 */
export function settle_supplier_transaction_by_id(obj) {
  return request({
    url: 'supplier/settle_supplier_transaction_by_id',
    method: 'post',
    data: obj
  })
}

/**
 * 获取该供应商的报价单
 */
export function filter_supplier_quotations(obj) {
  return request({
    url: 'supplier/filter_supplier_quotations',
    method: 'post',
    data: obj
  })
}

/**
 * 获得供应商详情
 */
export function get_supplier_by_id(obj) {
  return request({
    url: 'supplier/get_supplier_by_id',
    method: 'post',
    data: obj
  })
}

/**
 * 根据报价单id获取供应商该报价单的信息
 */
export function get_supplier_quotation_by_id(obj) {
  return request({
    url: 'supplier/get_supplier_quotation_by_id',
    method: 'post',
    data: obj
  })
}

/**
 * 通过关键字匹配6条最近供货的供应商信息列表
 */
export function check_supplier_info_by_key_word(obj) {
  return request({
    url: 'supplier/check_supplier_info_by_key_word',
    method: 'post',
    data: obj
  })
}

/**
 * 生成供应商送货单结算信息统计汇总数据列表
 */
export function generate_supplier_settlement_stats_summary_list(obj) {
  return request({
    url: 'supplier/generate_supplier_settlement_stats_summary_list',
    method: 'post',
    data: obj
  })
}
/**
 * 通过关键字获取匹配最新的6条报价单信息
 */
export function get_supplier_quotation_info_by_key_word(obj) {
  return request({
    url: 'supplier/get_supplier_quotation_info_by_key_word',
    method: 'post',
    data: obj
  })
}

/**
 * 添加新的供应商送货单
 */
export function add_supplier_transaction(obj) {
  return request({
    url: 'supplier/add_supplier_transaction',
    method: 'post',
    data: obj
  })
}
// 退货相关
/**
 * 返回可以退回的商品
 */
export function return_goods_list(obj) {
  return request({
    url: 'supplier/return_goods_list',
    method: 'post',
    data: obj
  })
}

/**
 * 生成退货单
 */
export function add_return_goods_note(obj) {
  return request({
    url: 'supplier/add_return_goods_note',
    method: 'post',
    data: obj
  })
}

/**
 * 工厂 确认退货单
 */
export function confirm_refund_transaction_by_id(obj) {
  return request({
    url: 'supplier/confirm_refund_transaction_by_id',
    method: 'post',
    data: obj
  })
}

/**
 * 作废退货单
 */
export function delete_refund_transaction_by_id(obj) {
  return request({
    url: 'supplier/delete_refund_transaction_by_id',
    method: 'post',
    data: obj
  })
}

/**
 * 工厂端添加现结单
 */
export function add_cash_supplier_transaction(obj) {
  return request({
    url: 'supplier/add_cash_supplier_transaction',
    method: 'post',
    data: obj
  })
}

/**
 * 工厂端结算现结单
 */
export function settle_cash_supplier_transaction(obj) {
  return request({
    url: 'supplier/settle_cash_supplier_transaction',
    method: 'post',
    data: obj
  })
}

/**
 * 作废现结单
 */
export function delete_cash_supplier_transaction_by_id(obj) {
  return request({
    url: 'supplier/delete_cash_supplier_transaction_by_id',
    method: 'post',
    data: obj
  })
}

/**
 * 工厂生成关联二维码
 */
export function generate_unified_match_qr_code(obj) {
  return request({
    url: 'supplier/generate_unified_match_qr_code',
    method: 'post',
    data: obj
  })
}

/**
 * 工厂关联供应商
 */
export function relate_company_to_supplier(obj) {
  return request({
    url: 'supplier/relate_company_to_supplier',
    method: 'post',
    data: obj
  })
}
