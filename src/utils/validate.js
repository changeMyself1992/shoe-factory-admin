import { isEmpty } from '@/utils'

/**
 * 正则检测通用文件
 */
export function isvalidUsername(str) {
  const valid_map = ['admin']
  return valid_map.indexOf(str.trim()) >= 0
}

export function isExternal(path) {
  return /^(https?:|mailto:|tel:)/.test(path)
}

/* 合法uri*/
export function validURL(url) {
  const reg = /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/
  return reg.test(url)
}

/* 小写字母*/
export function validLowerCase(str) {
  const reg = /^[a-z]+$/
  return reg.test(str)
}

/* 大写字母*/
export function validUpperCase(str) {
  const reg = /^[A-Z]+$/
  return reg.test(str)
}

/* 大小写字母*/
export function validAlphabets(str) {
  const reg = /^[A-Za-z]+$/
  return reg.test(str)
}

/**
 * validate email
 * @param email
 * @returns {boolean}
 */
export function validEmail(email) {
  const re = /^(([^<>()\[\]\\.,;:\S@"]+(\.[^<>()\[\]\\.,;:\S@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return re.test(email)
}

/**
 * 合法手机号
 * @param {*} str
 */
export function isValidPhone(str) {
  return /^1[3456789]\d{9}$/.test(str)
}
export const 验证手机号 = (rule, value, callback) => {
  if (!value || !isValidPhone(value)) {
    callback(new Error('请输入正确得手机号'))
  } else {
    callback()
  }
}
export const 验证非必选手机号 = (rule, value, callback) => {
  if (!isEmpty(value) && !isValidPhone(value)) {
    callback(new Error('请输入正确得手机号'))
  } else {
    callback()
  }
}

/**
 * 验证座机
 * @param {*} str
 * 025-85951313
 */
export function isValidSpecialPlane(str) {
  return /0\d{2,3}-\d{7,8}/.test(str)
}
export const 验证电话 = (rule, value, callback) => {
  if (!isValidPhone(value) && !isValidSpecialPlane(value) && value !== '') {
    callback(new Error('请输入正确得手机号或者座机'))
  } else {
    callback()
  }
}

/**
 * 合法的验证码
 * @param {*} str
 */
export function validatePhoneCode(str) {
  return /^[0-9]{4}$/.test(str)
}
export const 验证验证码 = (rule, value, callback) => {
  if (!validatePhoneCode(value)) {
    callback(new Error('验证码必须是4位数字'))
  } else {
    callback()
  }
}

/**
 * 验证角色名字
 */
export function validateRoleInput(str) {
  if (!str) return false
  return /^[\S]{1,8}$/.test(str)
}

export function validateOrderId(str) {
  if (!str) return false
  return /^[\S]{1,16}$/.test(str)
}
export const 验证订单编号 = (rule, value, callback) => {
  if (!validateOrderId(value)) {
    callback(new Error('字符不要超过16位'))
  } else {
    callback()
  }
}
export const 验证产品编号 = (rule, value, callback) => {
  if (!validateOrderId(value)) {
    callback(new Error('字符不要超过16位'))
  } else {
    callback()
  }
}
export const 验证颜色 = (rule, value, callback) => {
  if (!validateOrderId(value)) {
    callback(new Error('字符不要超过16位'))
  } else {
    callback()
  }
}
export const 验证物料编号 = (rule, value, callback) => {
  if (!validateOrderId(value)) {
    callback(new Error('字符不要超过16位'))
  } else {
    callback()
  }
}

export function validateOrderName(str) {
  if (!str) return false
  return /^[\S]{1,10}$/.test(str)
}
export const 验证订单名称 = (rule, value, callback) => {
  if (!validateOrderName(value)) {
    callback(new Error('字符太长了！！'))
  } else {
    callback()
  }
}
export const 验证物料名称 = (rule, value, callback) => {
  if (!validateOrderName(value)) {
    callback(new Error('字符太长了！！'))
  } else {
    callback()
  }
}
export const 验证供应商名称 = (rule, value, callback) => {
  if (!validateOrderName(value)) {
    callback(new Error('字符太长了！！'))
  } else {
    callback()
  }
}

export function validateCustomerName(str) {
  if (!str) return false
  return /^[\S]{1}.{0,15}[\S]{1}$/.test(str)
}
export const 验证客户名称 = (rule, value, callback) => {
  if (!validateCustomerName(value)) {
    callback(new Error('字符限制1-17位'))
  } else {
    callback()
  }
}
export const 验证工序名称 = (rule, value, callback) => {
  if (!validateCustomerName(value)) {
    callback(new Error('字符限制1-17位，开头结尾不能有空白！'))
  } else {
    callback()
  }
}
export const 验证部位名称 = (rule, value, callback) => {
  if (!validateCustomerName(value)) {
    callback(new Error('字符限制1-17位，开头结尾不能有空白！'))
  } else {
    callback()
  }
}
export const 验证姓名 = (rule, value, callback) => {
  if (!validateCustomerName(value)) {
    callback(new Error('姓名错误'))
  } else {
    callback()
  }
}
export const 验证账户开户姓名 = (rule, value, callback) => {
  if (!isEmpty(value) && !validateCustomerName(value)) {
    callback(new Error('姓名错误'))
  } else {
    callback()
  }
}
export const 验证开户行 = (rule, value, callback) => {
  if (!isEmpty(value) && !validateCustomerName(value)) {
    callback(new Error('银行账户限制10位，不能空白符开头'))
  } else {
    callback()
  }
}
export const 验证单位 = (rule, value, callback) => {
  if (!value || value.length > 3) {
    callback(new Error('请输入单位 例如: 尺'))
  } else {
    callback()
  }
}

export function validateOrderNote(str) {
  if (!str) return false
  return /^[\S]{1}.{0,80}$/.test(str)
}
export const 验证订单备注 = (rule, value, callback) => {
  if (!validateOrderNote(value)) {
    callback(new Error('字符不要超过80位'))
  } else {
    callback()
  }
}
export const 验证产品备注 = (rule, value, callback) => {
  if (!validateOrderNote(value)) {
    callback(new Error('字符不要超过80位'))
  } else {
    callback()
  }
}
export const 验证生产单备注 = (rule, value, callback) => {
  if (!validateOrderNote(value)) {
    callback(new Error('字符不要超过80位'))
  } else {
    callback()
  }
}
export const 验证供应商说明 = (rule, value, callback) => {
  if (!validateOrderNote(value)) {
    callback(new Error('字符不要超过80位'))
  } else {
    callback()
  }
}

export const 验证订单状态 = (rule, value, callback) => {
  if (value !== '新订单' && value !== '已排产' && value !== '已完成') {
    callback(new Error('错误的订单状态'))
  } else {
    callback()
  }
}

export const 验证订单上传图片列表 = (rule, value, callback) => {
  if (!Array.isArray(value) || value.length > 2) {
    callback(new Error('上传图片列表 必须是数组,并且长度小于等于2'))
  } else {
    callback()
  }
}

export const 验证负责工序 = (rule, value, callback) => {
  if (!Array.isArray(value) || value.length === 0) {
    callback(new Error('至少要负责一个工序'))
  } else {
    callback()
  }
}

export const 验证产品图片列表 = (rule, value, callback) => {
  if (!Array.isArray(value) || value.length >= 0 && value.length < 2) {
    callback(new Error('图片列表数组,必须大于等于0小于2'))
  } else {
    callback()
  }
}

export const 验证已排产生产单列表 = (rule, value, callback) => {
  if (!Array.isArray(value)) {
    callback(new Error('已排产生产单列表必须是数组'))
  } else {
    callback()
  }
}

export function validateProductOrderId(str) {
  if (!str) return false
  return /^[\S]{1,14}$/.test(str)
}
export const 验证生产单编号 = (rule, value, callback) => {
  if (!validateProductOrderId(value)) {
    callback(new Error('字符不要超过14位'))
  } else {
    callback()
  }
}

export function validateIdNumber(str) {
  if (!str) return false
  return /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(str)
}
export const 验证身份证号 = (rule, value, callback) => {
  if (!isEmpty(value) && !validateIdNumber(value)) {
    callback(new Error('请输入正确的身份证'))
  } else {
    callback()
  }
}

export function validateAddress(str) {
  if (!str) return false
  return /^.{0,50}$/.test(str)
}
export const 验证地址 = (rule, value, callback) => {
  if (!isEmpty(value) && !validateAddress(value)) {
    callback(new Error('地址控制在50个字符以内'))
  } else {
    callback()
  }
}

export function validateBankAccount(str) {
  if (!str) return false
  return /^([A-Za-z0-9]|[\s]){10,30}$/.test(str)
}
export const 验证银行账号 = (rule, value, callback) => {
  if (!isEmpty(value) && !validateBankAccount(value)) {
    callback(new Error('输入正确的银行账号/卡号'))
  } else {
    callback()
  }
}

export const 验证银行卡照片 = (rule, value, callback) => {
  if (!isEmpty(value) && !validURL(value)) {
    callback(new Error('请上传银行卡照片！'))
  } else {
    callback()
  }
}

export const 验证工作状态 = (rule, value, callback) => {
  if (value !== '在职' && value !== '离职' && value !== '请假' && value !== '开除' && value !== '待确认') {
    callback(new Error('必须选择工作状态！'))
  } else {
    callback()
  }
}

/**
 * 合法的number
 * 验证是否是整数和小数（包括正负）
 * @param {*} str
 */
export function validateNumber(str) {
  return /^((-?[0-9]+|0)\.([0-9]{1,2})$)|^[1-9]+[0-9]*$/.test(str)
}
export const 验证数量 = (rule, value, callback) => {
  if (!validateNumber(value) || Number(value) <= 0) {
    callback(new Error('只能是大于0的整数或小数'))
  } else {
    callback()
  }
}
export const 验证正整数和正浮点数 = (rule, value, callback) => {
  if (Number(value) < 0) {
    callback(new Error('要求大于等于0'))
  } else {
    callback()
  }
}

export const 验证供应商价格 = (rule, value, callback) => {
  if (!parseFloat(value) || !parseInt(value)) {
    callback(new Error('请输入数字类型'))
  } else {
    callback()
  }
}

export const 验证管理角色 = (rule, value, callback) => {
  if (isEmpty(value)) {
    callback(new Error('管理角色必选'))
  } else {
    callback()
  }
}

export const 验证性别 = (rule, value, callback) => {
  if (isEmpty(value)) {
    callback(new Error('性别是必选项'))
  } else {
    callback()
  }
}
