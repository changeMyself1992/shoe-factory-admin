import request from '@/utils/request'

export function check_exception_408_status(obj) {
  return request({
    url: 'production_note/check_exception_408_status',
    method: 'post',
    data: obj
  })
}

export function check_exception_500_status(obj) {
  return request({
    url: 'production_note/check_exception_500_status',
    method: 'post',
    data: obj
  })
}
