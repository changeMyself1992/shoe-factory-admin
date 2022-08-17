/**
 * 封装 登录登出   相关api
 */
import request from '@/utils/request'

/**
 * 获取验证码
 */
export function request_verification_message(obj) {
  return request({
    url: 'verification_token/request_verification_message',
    method: 'post',
    data: obj
  })
}

/**
* 验证验证码信息(登录)
*/
export function check_verification_message(obj) {
  return request({
    url: 'verification_token/check_verification_message',
    method: 'post',
    data: obj
  })
}

/**
* 生成login token
*/
export function generate_login_token(obj) {
  return request({
    url: 'verification_token/generate_login_token',
    method: 'post',
    data: obj
  })
}

/**
 * 登陆后绑定企业信息
 */
export function bind_company_after_login(obj) {
  return request({
    url: 'verification_token/bind_company_after_login',
    method: 'post',
    data: obj
  })
}

/**
 * 登录后获取用户信息
 */
export function get_user_info_by_login_token(obj) {
  return request({
    url: 'verification_token/get_user_info_by_login_token',
    method: 'post',
    data: obj
  })
}

/**
 * 生成用于扫码登录的二维码信息
 */
export function generate_qrcode_info_by_login(obj) {
  return request({
    url: 'verification_token/generate_qrcode_info_by_login',
    method: 'post',
    data: obj
  })
}

/**
 * 通过qrcode_token检查login_token
 */
export function retrieve_login_token_by_qrcode_token(obj) {
  return request({
    url: 'verification_token/retrieve_login_token_by_qrcode_token',
    method: 'post',
    data: obj
  })
}
