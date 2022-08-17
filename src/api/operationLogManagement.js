/**
 * 操作日志  相关api
 */
import request from '@/utils/request'

/**
 * 获取某条日志操作记录详情
 */
export function get_operation_log_by_id(obj) {
  return request({
    url: 'operation_log/get_operation_log_by_id',
    method: 'post',
    data: obj
  })
}

/**
 * 获取所有操作记录日志
 */
export function filter_operation_log(obj) {
  return request({
    url: 'operation_log/filter_operation_log',
    method: 'post',
    data: obj
  })
}

