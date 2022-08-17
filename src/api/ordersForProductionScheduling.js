/**
 * 封装 订单 排产  相关api
 */
import request from '@/utils/request'

/**
 * 获取订单标签配置
 */
export function get_order_tag_names(obj) {
  return request({
    url: 'order/get_order_tag_names',
    method: 'post',
    data: obj
  })
}

/**
 * 订单标签自动补全
 */
export function order_tags_auto_complete(obj) {
  return request({
    url: 'order/order_tags_auto_complete',
    method: 'post',
    data: obj
  })
}

/**
 * 添加订单
 */
export function add_order(obj) {
  return request({
    url: 'order/add_order',
    method: 'post',
    data: obj
  })
}

/**
 * 修改订单
 */
export function edit_order_by_id(obj) {
  return request({
    url: 'order/edit_order_by_id',
    method: 'post',
    data: obj
  })
}

/**
 * 条件查询订单
 */
export function filter_order(obj) {
  return request({
    url: 'order/filter_order',
    method: 'post',
    data: obj
  })
}

/**
   * 删除订单
   */
export function delete_order_by_id(obj) {
  return request({
    url: 'order/delete_order_by_id',
    method: 'post',
    data: obj
  })
}

/**
 * 获取订单详情 通过ID
 */
export function get_order_by_id(obj) {
  return request({
    url: 'order/get_order_by_id',
    method: 'post',
    data: obj
  })
}

/**
 * 添加生产单
 */
export function add_production_note(obj) {
  return request({
    url: 'production_note/add_production_note',
    method: 'post',
    data: obj
  })
}

/**
* 获取生产单详情
*/
export function get_production_note_by_id(obj) {
  return request({
    url: 'production_note/get_production_note_by_id',
    method: 'post',
    data: obj
  })
}

/**
* 条件查询生产单
*/
export function filter_production_note(obj) {
  return request({
    url: 'production_note/filter_production_note',
    method: 'post',
    data: obj
  })
}

/**
* 删除生产单
*/
export function delete_production_note_by_id(obj) {
  return request({
    url: 'production_note/delete_production_note_by_id',
    method: 'post',
    data: obj
  })
}

/**
* 强行完成一个生产单
*/
export function finish_production_note_by_id(obj) {
  return request({
    url: 'production_note/finish_production_note_by_id',
    method: 'post',
    data: obj
  })
}

/**
* 取回进行中的生产单及其生产情况（生产进度管理页面使用）
*/
export function list_ongoing_production_notes(obj) {
  return request({
    url: 'production_control/list_ongoing_production_notes',
    method: 'post',
    data: obj
  })
}

/**
* 获取配码配置信息
*/
export function get_size_config_info(obj) {
  return request({
    url: 'order/get_size_config_info',
    method: 'post',
    data: obj
  })
}

/**
* 获取生产单打印配置信息
*/
export function get_production_note_print_config_info(obj) {
  return request({
    url: 'production_note/get_production_note_print_config_info',
    method: 'post',
    data: obj
  })
}

/**
* 编辑生产单
*/
export function edit_production_note_by_id(obj) {
  return request({
    url: 'production_note/edit_production_note_by_id',
    method: 'post',
    data: obj
  })
}

/**
* 指定时间 管理员通过员工的unique_id获得他的工资统计信息
*/
export function manager_get_staff_salary_stats_by_unique_id(obj) {
  return request({
    url: 'finance/manager_get_staff_salary_stats_by_unique_id',
    method: 'post',
    data: obj
  })
}

/**
* 指定时间 管理员通过员工的unique_id获得他的工资记录信息
*/
export function manager_get_staff_salary_records_by_unique_id(obj) {
  return request({
    url: 'finance/manager_get_staff_salary_records_by_unique_id',
    method: 'post',
    data: obj
  })
}

/**
* 指定时间 生成部门工资结算 给管理人员显示的统计数据
*/
export function generate_salary_list_for_frontend_by_process_time_range(obj) {
  return request({
    url: 'finance/generate_salary_list_for_frontend_by_process_time_range',
    method: 'post',
    data: obj
  })
}

/**
* 批量修改多个生产单的工序工资
*/
export function batch_edit_production_note_process_salary_by_ids(obj) {
  return request({
    url: 'production_note/batch_edit_production_note_process_salary_by_ids',
    method: 'post',
    data: obj,
    timeout: 20000
  })
}

/**
* 生成所有订单产品的excel数据
*/
export function generate_order_list_for_excel(obj) {
  return request({
    url: 'order/generate_order_list_for_excel',
    method: 'post',
    data: obj
  })
}

/**
* 条件查询用于结算的条目
*/
export function order_settle_filter_items(obj) {
  return request({
    url: 'order/order_settle_filter_items',
    method: 'post',
    data: obj
  })
}

/**
* 条件查询用于结算统计
*/
export function order_settle_stats(obj) {
  return request({
    url: 'order/order_settle_stats',
    method: 'post',
    data: obj
  })
}

/**
* 订单的结算状态修改
*/
export function order_settle_edit(obj) {
  return request({
    url: 'order/order_settle_edit',
    method: 'post',
    data: obj
  })
}

/**
* 指定时间 生成部门工资结算excel表格 给管理人员显示的统计数据和详细数据
*/
export function generate_salary_list_for_excel_by_process_time_range(obj) {
  return request({
    url: 'finance/generate_salary_list_for_excel_by_process_time_range',
    method: 'post',
    data: obj
  })
}

/**
* 批量删除生产单
*/
export function batch_delete_production_note_by_ids(obj) {
  return request({
    url: 'production_note/batch_delete_production_note_by_ids',
    method: 'post',
    data: obj
  })
}

/**
* 条件查询代排产的订单
*/
export function filter_need_schedule_order(obj) {
  return request({
    url: 'order/filter_need_schedule_order',
    method: 'post',
    data: obj
  })
}

/**
* 通过产品信息匹配最近此产品的结算信息
*/
export function match_recent_product_settle_info_by_product_info(obj) {
  return request({
    url: 'order/match_recent_product_settle_info_by_product_info',
    method: 'post',
    data: obj
  })
}

/**
* 获取需要确认的员工计件记录
*/
export function filter_unconfirmed_staff_record(obj) {
  return request({
    url: 'production_control/filter_unconfirmed_staff_record',
    method: 'post',
    data: obj
  })
}

/**
*  管理人员批量确认员工计件
*/
export function batch_manager_confirm_staff_record(obj) {
  return request({
    url: 'production_control/batch_manager_confirm_staff_record',
    method: 'post',
    data: obj
  })
}

/**
*  重新评估一个生产单
*/
export function review_production_note_by_id(obj) {
  return request({
    url: 'production_note/review_production_note_by_id',
    method: 'post',
    data: obj
  })
}

