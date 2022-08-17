/**
 * 其他工具类  相关api
 */
import request from '@/utils/request'

/**
 * 获取验证码
 */
export function generate_year_month_sequence_number(obj) {
  return request({
    url: 'utils/generate_year_month_sequence_number',
    method: 'post',
    data: obj
  })
}
