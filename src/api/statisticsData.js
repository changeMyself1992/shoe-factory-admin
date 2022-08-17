/**
 * 封装 客户  相关api
 */
import request from '@/utils/request'

// 日收益
export function get_day_profits(data) {
  return request({
    url: 'statistics_data/get_day_profits',
    method: 'post',
    data
  })
}

// 月收益
export function get_month_profits(data) {
  return request({
    url: 'statistics_data/get_month_profits',
    method: 'post',
    data
  })
}

// 年收益
export function get_year_profits(data) {
  return request({
    url: 'statistics_data/get_year_profits',
    method: 'post',
    data
  })
}

// 日生产订单(近7天)(日更新)
export function get_product_note(data) {
  return request({
    url: 'statistics_data/get_product_note',
    method: 'post',
    data
  })
}

// 月生产订单(近半年)
export function get_month_product_note(data) {
  return request({
    url: 'statistics_data/get_month_product_note',
    method: 'post',
    data
  })
}

// 年生产订单(近两年)
export function get_year_product_note(data) {
  return request({
    url: 'statistics_data/get_year_product_note',
    method: 'post',
    data
  })
}

// 日销售订单(近7天,近半年)(日更新,月更新)
export function get_order_data(data) {
  return request({
    url: 'statistics_data/get_order_data',
    method: 'post',
    data
  })
}

// 年销售订单(近2年)(年更新)
export function get_year_order_data(data) {
  return request({
    url: 'statistics_data/get_year_order_data',
    method: 'post',
    data
  })
}

// 当本月热销产品(月更新)
export function get_month_sell_products(data) {
  return request({
    url: 'statistics_data/get_month_sell_products',
    method: 'post',
    data
  })
}

// 客户统计(月更新)
export function get_month_customer_data(data) {
  return request({
    url: 'statistics_data/get_month_customer_data',
    method: 'post',
    data
  })
}

// 日采购供应数据(日更新)
export function get_day_supplier_purchases(data) {
  return request({
    url: 'statistics_data/get_day_supplier_purchases',
    method: 'post',
    data
  })
}

// 近半年来采购供应数据(月更新)
export function get_month_supplier_purchases(data) {
  return request({
    url: 'statistics_data/get_month_supplier_purchases',
    method: 'post',
    data
  })
}

// 近两年采购供应数据(年更新)
export function get_years_supplier_purchases(data) {
  return request({
    url: 'statistics_data/get_years_supplier_purchases',
    method: 'post',
    data
  })
}

// 月供应商结算(月更新)
export function get_month_supplier_statements(data) {
  return request({
    url: 'statistics_data/get_month_supplier_statements',
    method: 'post',
    data
  })
}

