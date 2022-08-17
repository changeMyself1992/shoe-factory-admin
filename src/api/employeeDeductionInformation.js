/**
 * 封装 员工抵扣信息  相关api
 */
import request from '@/utils/request'

/**
 * 管理员添加员工抵扣信息
 */
export function manager_add_staff_costs(obj) {
  return request({
    url: 'staff_costs/manager_add_staff_costs',
    method: 'post',
    data: obj
  })
}

/**
 * 员工获取自己的工资抵扣统计信息
 */
export function staff_get_staff_costs_stats(obj) {
  return request({
    url: 'staff_costs/staff_get_staff_costs_stats',
    method: 'post',
    data: obj
  })
}

/**
 * 员工条件查询自己的工资抵扣记录
 */
export function staff_filter_staff_costs(obj) {
  return request({
    url: 'staff_costs/staff_filter_staff_costs',
    method: 'post',
    data: obj
  })
}

/**
 * 管理员条件查询所有人的工资抵扣记录
 */
export function manager_filter_staff_costs(obj) {
  return request({
    url: 'staff_costs/manager_filter_staff_costs',
    method: 'post',
    data: obj
  })
}

/**
 * 管理员通过员工unique_id获取工资抵扣信息
 */
export function manager_get_staff_costs_stats_by_unique_id(obj) {
  return request({
    url: 'staff_costs/manager_get_staff_costs_stats_by_unique_id',
    method: 'post',
    data: obj
  })
}

/**
 * 作废员工工资抵扣信息
 */
export function manager_delete_staff_costs_by_unique_id(obj) {
  return request({
    url: 'staff_costs/manager_delete_staff_costs_by_unique_id',
    method: 'post',
    data: obj
  })
}

