/**
 * 封装 客户  相关api
 */
import request from '@/utils/request'

/**
 * 获取客户标签配置
 */
export function get_client_tag_names(obj) {
  return request({
    url: 'client/get_client_tag_names',
    method: 'post',
    data: obj
  })
}

/**
   * 客户标签自动补全
   */
export function client_tags_auto_complete(obj) {
  return request({
    url: 'client/client_tags_auto_complete',
    method: 'post',
    data: obj
  })
}

/**
   * 添加客户信息
   */
export function add_client(obj) {
  return request({
    url: 'client/add_client',
    method: 'post',
    data: obj
  })
}

/**
   * 条件查询客户信息
   */
export function filter_client(obj) {
  return request({
    url: 'client/filter_client',
    method: 'post',
    data: obj
  })
}

/**
   * 删除客户信息
   */
export function delete_client_by_id(obj) {
  return request({
    url: 'client/delete_client_by_id',
    method: 'post',
    data: obj
  })
}
/**
   * 修改客户信息
   */
export function edit_client_by_id(obj) {
  return request({
    url: 'client/edit_client_by_id',
    method: 'post',
    data: obj
  })
}
