/**
 * 封装 人员及权限管理  相关api
 */
import request from '@/utils/request'

/**
 * 获取管理角色详细信息
 */
export function get_role_authority_by_id(obj) {
  return request({
    url: 'role_authority/get_role_authority_by_id',
    method: 'post',
    data: obj
  })
}

/**
 * 通过id获取用户信息
 * @param {*} token
 */
export function get_user_by_id(obj) {
  return request({
    url: 'user/get_user_by_id',
    method: 'post',
    data: obj
  })
}

/**
 * 添加员工
 * @param {*} token
 */
export function add_user(obj) {
  return request({
    url: 'user/add_user',
    method: 'post',
    data: obj
  })
}

/**
 * 通过id编辑员工
 * @param {*} token
 */
export function edit_user_by_id(obj) {
  return request({
    url: 'user/edit_user_by_id',
    method: 'post',
    data: obj
  })
}

/**
 * 条件查询管理角色
 */
export function filter_role_authority(obj) {
  return request({
    url: 'role_authority/filter_role_authority',
    method: 'post',
    data: obj
  })
}

/**
   * 编辑角色权限
   */
export function edit_role_authority_by_id(obj) {
  return request({
    url: 'role_authority/edit_role_authority_by_id',
    method: 'post',
    data: obj
  })
}

/**
 * 添加角色
 */
export function add_role_authority(obj) {
  return request({
    url: 'role_authority/add_role_authority',
    method: 'post',
    data: obj
  })
}

/**
 * delete角色
 */
export function delete_role_authority_by_id(obj) {
  return request({
    url: 'role_authority/delete_role_authority_by_id',
    method: 'post',
    data: obj
  })
}

/**
 * 条件查询人员信息
 */
export function filter_user(obj) {
  return request({
    url: 'user/filter_user',
    method: 'post',
    data: obj
  })
}

/**
 * 删除人员信息
 */
export function delete_user_by_id(obj) {
  return request({
    url: 'user/delete_user_by_id',
    method: 'post',
    data: obj
  })
}
