/**
 * 封装 进度管理   相关api
 */
import request from '@/utils/request'

/**
 * 为管理人员计件接口生产输入数据
 */
export function generate_manager_record_count_input(obj) {
  return request({
    url: 'production_control/generate_manager_record_count_input',
    method: 'post',
    data: obj
  })
}

/**
 * 管理员计件接口
 */
export function manager_record_count(obj) {
  return request({
    url: 'production_control/manager_record_count',
    method: 'post',
    data: obj
  })
}

/**
* 管理人员确认员工计件
*/
export function manager_confirm_staff_record(obj) {
  return request({
    url: 'production_control/manager_confirm_staff_record',
    method: 'post',
    data: obj
  })
}

/**
* 通过提交排产产品信息 获取排产产品工序最近的对应信息缓存信息 用于自动填充
*/
export function match_recent_production_note_process_info_by_product_info(obj) {
  return request({
    url: 'production_note/match_recent_production_note_process_info_by_product_info',
    method: 'post',
    data: obj
  })
}
