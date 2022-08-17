import { Message } from 'element-ui'
/**
 * Created by jiachenpan on 16/11/18.
 */

export function sumArray(arr) {
  var sum = 0
  for (var i = 0; i < arr.length; i++) {
    sum += arr[i]
  }
  return sum
}

export function parseTime(time, cFormat) {
  if (arguments.length === 0) {
    return null
  }
  // {y}-{m}-{d} {h}:{i}:{s}
  const format = cFormat || '{y}-{m}-{d}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if ((typeof time === 'string') && (/^[0-9]+$/.test(time))) {
      time = parseInt(time)
    }
    if ((typeof time === 'number') && (time.toString().length === 10)) {
      time = time * 1000
    }
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
    let value = formatObj[key]
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') { return ['日', '一', '二', '三', '四', '五', '六'][value] }
    if (result.length > 0 && value < 10) {
      value = '0' + value
    }
    return value || 0
  })
  return time_str
}

export function formatTime(time, option) {
  time = +time * 1000
  const d = new Date(time)
  const now = Date.now()

  const diff = (now - d) / 1000

  if (diff < 30) {
    return '刚刚'
  } else if (diff < 3600) {
    // less 1 hour
    return Math.ceil(diff / 60) + '分钟前'
  } else if (diff < 3600 * 24) {
    return Math.ceil(diff / 3600) + '小时前'
  } else if (diff < 3600 * 24 * 2) {
    return '1天前'
  }
  if (option) {
    return parseTime(time, option)
  } else {
    return (
      d.getMonth() +
      1 +
      '月' +
      d.getDate() +
      '日' +
      d.getHours() +
      '时' +
      d.getMinutes() +
      '分'
    )
  }
}

// 格式化时间
export function getQueryObject(url) {
  url = url == null ? window.location.href : url
  const search = url.substring(url.lastIndexOf('?') + 1)
  const obj = {}
  const reg = /([^?&=]+)=([^?&=]*)/g
  search.replace(reg, (rs, $1, $2) => {
    const name = decodeURIComponent($1)
    let val = decodeURIComponent($2)
    val = String(val)
    obj[name] = val
    return rs
  })
  return obj
}

/**
 * @param {Sting} input value
 * @returns {number} output value
 */
export function byteLength(str) {
  // returns the byte length of an utf8 string
  let s = str.length
  for (var i = str.length - 1; i >= 0; i--) {
    const code = str.charCodeAt(i)
    if (code > 0x7f && code <= 0x7ff) s++
    else if (code > 0x7ff && code <= 0xffff) s += 2
    if (code >= 0xDC00 && code <= 0xDFFF) i--
  }
  return s
}

export function cleanArray(actual) {
  const newArray = []
  for (let i = 0; i < actual.length; i++) {
    if (actual[i]) {
      newArray.push(actual[i])
    }
  }
  return newArray
}

export function param(json) {
  if (!json) return ''
  return cleanArray(
    Object.keys(json).map(key => {
      if (json[key] === undefined) return ''
      return encodeURIComponent(key) + '=' + encodeURIComponent(json[key])
    })
  ).join('&')
}

export function param2Obj(url) {
  const search = url.split('?')[1]
  if (!search) {
    return {}
  }
  return JSON.parse(
    '{"' +
    decodeURIComponent(search)
      .replace(/"/g, '\\"')
      .replace(/&/g, '","')
      .replace(/=/g, '":"')
      .replace(/\+/g, ' ') +
    '"}'
  )
}

export function html2Text(val) {
  const div = document.createElement('div')
  div.innerHTML = val
  return div.textContent || div.innerText
}

export function objectMerge(target, source) {
  /* Merges two  objects,
     giving the last one precedence */

  if (typeof target !== 'object') {
    target = {}
  }
  if (Array.isArray(source)) {
    return source.slice()
  }
  Object.keys(source).forEach(property => {
    const sourceProperty = source[property]
    if (typeof sourceProperty === 'object') {
      target[property] = objectMerge(target[property], sourceProperty)
    } else {
      target[property] = sourceProperty
    }
  })
  return target
}

export function toggleClass(element, className) {
  if (!element || !className) {
    return
  }
  let classString = element.className
  const nameIndex = classString.indexOf(className)
  if (nameIndex === -1) {
    classString += '' + className
  } else {
    classString =
      classString.substr(0, nameIndex) +
      classString.substr(nameIndex + className.length)
  }
  element.className = classString
}

export const pickerOptions = [
  {
    text: '今天',
    onClick(picker) {
      const end = new Date()
      const start = new Date(new Date().toDateString())
      end.setTime(start.getTime())
      picker.$emit('pick', [start, end])
    }
  },
  {
    text: '最近一周',
    onClick(picker) {
      const end = new Date(new Date().toDateString())
      const start = new Date()
      start.setTime(end.getTime() - 3600 * 1000 * 24 * 7)
      picker.$emit('pick', [start, end])
    }
  },
  {
    text: '最近一个月',
    onClick(picker) {
      const end = new Date(new Date().toDateString())
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      picker.$emit('pick', [start, end])
    }
  },
  {
    text: '最近三个月',
    onClick(picker) {
      const end = new Date(new Date().toDateString())
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
      picker.$emit('pick', [start, end])
    }
  }
]

export function getTime(type) {
  if (type === 'start') {
    return new Date().getTime() - 3600 * 1000 * 24 * 90
  } else {
    return new Date(new Date().toDateString())
  }
}

export function debounce(func, wait, immediate) {
  let timeout, args, context, timestamp, result

  const later = function() {
    // 据上一次触发时间间隔
    const last = +new Date() - timestamp

    // 上次被包装函数被调用时间间隔 last 小于设定时间间隔 wait
    if (last < wait && last > 0) {
      timeout = setTimeout(later, wait - last)
    } else {
      timeout = null
      // 如果设定为immediate===true，因为开始边界已经调用过了此处无需调用
      if (!immediate) {
        result = func.apply(context, args)
        if (!timeout) context = args = null
      }
    }
  }

  return function(...args) {
    context = this
    timestamp = +new Date()
    const callNow = immediate && !timeout
    // 如果延时不存在，重新设定延时
    if (!timeout) timeout = setTimeout(later, wait)
    if (callNow) {
      result = func.apply(context, args)
      context = args = null
    }

    return result
  }
}

/**
 * This is just a simple version of deep copy
 * Has a lot of edge cases bug
 * If you want to use a perfect deep copy, use lodash's _.cloneDeep
 */
export function deepClone(source) {
  if (!source && typeof source !== 'object') {
    throw new Error('error arguments', 'shallowClone')
  }
  const targetObj = source.constructor === Array ? [] : {}
  Object.keys(source).forEach(keys => {
    if (source[keys] && typeof source[keys] === 'object') {
      targetObj[keys] = deepClone(source[keys])
    } else {
      targetObj[keys] = source[keys]
    }
  })
  return targetObj
}

export function uniqueArr(arr) {
  return Array.from(new Set(arr))
}

export function createUniqueString() {
  const timestamp = +new Date() + ''
  const randomNum = parseInt((1 + Math.random()) * 65536) + ''
  return (+(randomNum + timestamp)).toString(32)
}

/**
 * 判断对象 是否至少有一个键的值不为空
 * @param {*} obj 只能是 对象
 */
export function objectHasAtLeastOneKeyWhoseValueIsNotNull(obj) {
  for (var key in obj) {
    if (obj[key]) { return true }
  }
  return false
}

/**
 * 判断对象 是否全部的键都没有空值
 * @param {*} obj 只能是 对象
 */
export function objectWhetherAllKeysHaveNoNullValue(obj) {
  for (var key in obj) {
    if (!obj[key]) { return false }
  }
  return true
}

/**
 * 利用时间生成唯一编号
 */
export function autoGenerateUniqueId() {
  var now = new Date()
  var year = now.getFullYear() // 年
  var month = now.getMonth() + 1 // 月
  var day = now.getDate() // 日
  var hh = now.getHours() // 时
  var mm = now.getMinutes() // 分
  var ss = now.getSeconds() // 秒
  var clock = (year - 2000).toString(36)
  if (month < 10) clock += '0'
  clock += month
  if (day < 10) clock += '0'
  clock += day
  clock += (hh * 10000 + mm * 100 + ss).toString(36)
  return (clock.toUpperCase())
}

/**
 * 判断变量 是不是空对象 空数组 。。。各种空
 */
export function isEmpty(v) {
  switch (typeof v) {
    case 'undefined':
      return true
    case 'string':
      if (v.replace(/(^[ \t\n\r]*)|([ \t\n\r]*$)/g, '').length === 0) return true
      break
    case 'boolean':
      if (!v) return true
      break
    case 'number':
      if (v === 0 || isNaN(v)) return true
      break
    case 'object':
      if (v === null || v.length === 0) return true
      for (var i in v) {
        return false
      }
      return true
  }
  return false
}

/**
 * 判断两个对象是否相等的方法
 */
export function compareObj(obj1, obj2) {
  if (Object.keys(obj1).length !== Object.keys(obj2).length) return false
  else {
    for (var key in obj1) {
      if (obj2.hasOwnProperty(key)) {
        if (!Object.is(obj1[key], obj2[key])) {
          return false
        }
      } else {
        return false
      }
    }
    return true
  }
}
/**
 *比较数据结构相同的 俩个对象哪些key发生了变化
 * @param {*} oldBean
 * @param {*} newBean
 */
export function contrastObj(newBean, oldBean) {

}

/**
 * 判断俩个对象是否键值相等 忽略内存地址
 * @param {*} a
 * @param {*} b
 */
export function isObjectValueEqual(obj1, obj2) { // 比较两个对象键值对是否相等
  var o1 = obj1 instanceof Object
  var o2 = obj2 instanceof Object
  if (!o1 || !o2) { /*  判断不是对象  */
    return obj1 === obj2
  }

  if (Object.keys(obj1).length !== Object.keys(obj2).length) {
    return false
  }

  for (var attr in obj1) {
    var t1 = obj1[attr] instanceof Object
    var t2 = obj2[attr] instanceof Object
    if (t1 && t2) {
      return isObjectValueEqual(obj1[attr], obj2[attr])
    } else if (obj1[attr] !== obj2[attr]) {
      return false
    }
  }
  return true
}

/** 用法
 * Lunar.toSolar(2016, 6, 3); 农历转化公历
 * Lunar.toLunar(2016, 7, 6); 公历转化农历
 */
export var Lunar = {
  MIN_YEAR: 1891,
  MAX_YEAR: 2100,
  lunarInfo: [
    [0, 2, 9, 21936], [6, 1, 30, 9656], [0, 2, 17, 9584], [0, 2, 6, 21168], [5, 1, 26, 43344], [0, 2, 13, 59728],
    [0, 2, 2, 27296], [3, 1, 22, 44368], [0, 2, 10, 43856], [8, 1, 30, 19304], [0, 2, 19, 19168], [0, 2, 8, 42352],
    [5, 1, 29, 21096], [0, 2, 16, 53856], [0, 2, 4, 55632], [4, 1, 25, 27304], [0, 2, 13, 22176], [0, 2, 2, 39632],
    [2, 1, 22, 19176], [0, 2, 10, 19168], [6, 1, 30, 42200], [0, 2, 18, 42192], [0, 2, 6, 53840], [5, 1, 26, 54568],
    [0, 2, 14, 46400], [0, 2, 3, 54944], [2, 1, 23, 38608], [0, 2, 11, 38320], [7, 2, 1, 18872], [0, 2, 20, 18800],
    [0, 2, 8, 42160], [5, 1, 28, 45656], [0, 2, 16, 27216], [0, 2, 5, 27968], [4, 1, 24, 44456], [0, 2, 13, 11104],
    [0, 2, 2, 38256], [2, 1, 23, 18808], [0, 2, 10, 18800], [6, 1, 30, 25776], [0, 2, 17, 54432], [0, 2, 6, 59984],
    [5, 1, 26, 27976], [0, 2, 14, 23248], [0, 2, 4, 11104], [3, 1, 24, 37744], [0, 2, 11, 37600], [7, 1, 31, 51560],
    [0, 2, 19, 51536], [0, 2, 8, 54432], [6, 1, 27, 55888], [0, 2, 15, 46416], [0, 2, 5, 22176], [4, 1, 25, 43736],
    [0, 2, 13, 9680], [0, 2, 2, 37584], [2, 1, 22, 51544], [0, 2, 10, 43344], [7, 1, 29, 46248], [0, 2, 17, 27808],
    [0, 2, 6, 46416], [5, 1, 27, 21928], [0, 2, 14, 19872], [0, 2, 3, 42416], [3, 1, 24, 21176], [0, 2, 12, 21168],
    [8, 1, 31, 43344], [0, 2, 18, 59728], [0, 2, 8, 27296], [6, 1, 28, 44368], [0, 2, 15, 43856], [0, 2, 5, 19296],
    [4, 1, 25, 42352], [0, 2, 13, 42352], [0, 2, 2, 21088], [3, 1, 21, 59696], [0, 2, 9, 55632], [7, 1, 30, 23208],
    [0, 2, 17, 22176], [0, 2, 6, 38608], [5, 1, 27, 19176], [0, 2, 15, 19152], [0, 2, 3, 42192], [4, 1, 23, 53864],
    [0, 2, 11, 53840], [8, 1, 31, 54568], [0, 2, 18, 46400], [0, 2, 7, 46752], [6, 1, 28, 38608], [0, 2, 16, 38320],
    [0, 2, 5, 18864], [4, 1, 25, 42168], [0, 2, 13, 42160], [10, 2, 2, 45656], [0, 2, 20, 27216], [0, 2, 9, 27968],
    [6, 1, 29, 44448], [0, 2, 17, 43872], [0, 2, 6, 38256], [5, 1, 27, 18808], [0, 2, 15, 18800], [0, 2, 4, 25776],
    [3, 1, 23, 27216], [0, 2, 10, 59984], [8, 1, 31, 27432], [0, 2, 19, 23232], [0, 2, 7, 43872], [5, 1, 28, 37736],
    [0, 2, 16, 37600], [0, 2, 5, 51552], [4, 1, 24, 54440], [0, 2, 12, 54432], [0, 2, 1, 55888], [2, 1, 22, 23208],
    [0, 2, 9, 22176], [7, 1, 29, 43736], [0, 2, 18, 9680], [0, 2, 7, 37584], [5, 1, 26, 51544], [0, 2, 14, 43344],
    [0, 2, 3, 46240], [4, 1, 23, 46416], [0, 2, 10, 44368], [9, 1, 31, 21928], [0, 2, 19, 19360], [0, 2, 8, 42416],
    [6, 1, 28, 21176], [0, 2, 16, 21168], [0, 2, 5, 43312], [4, 1, 25, 29864], [0, 2, 12, 27296], [0, 2, 1, 44368],
    [2, 1, 22, 19880], [0, 2, 10, 19296], [6, 1, 29, 42352], [0, 2, 17, 42208], [0, 2, 6, 53856], [5, 1, 26, 59696],
    [0, 2, 13, 54576], [0, 2, 3, 23200], [3, 1, 23, 27472], [0, 2, 11, 38608], [11, 1, 31, 19176], [0, 2, 19, 19152],
    [0, 2, 8, 42192], [6, 1, 28, 53848], [0, 2, 15, 53840], [0, 2, 4, 54560], [5, 1, 24, 55968], [0, 2, 12, 46496],
    [0, 2, 1, 22224], [2, 1, 22, 19160], [0, 2, 10, 18864], [7, 1, 30, 42168], [0, 2, 17, 42160], [0, 2, 6, 43600],
    [5, 1, 26, 46376], [0, 2, 14, 27936], [0, 2, 2, 44448], [3, 1, 23, 21936], [0, 2, 11, 37744], [8, 2, 1, 18808],
    [0, 2, 19, 18800], [0, 2, 8, 25776], [6, 1, 28, 27216], [0, 2, 15, 59984], [0, 2, 4, 27424], [4, 1, 24, 43872],
    [0, 2, 12, 43744], [0, 2, 2, 37600], [3, 1, 21, 51568], [0, 2, 9, 51552], [7, 1, 29, 54440], [0, 2, 17, 54432],
    [0, 2, 5, 55888], [5, 1, 26, 23208], [0, 2, 14, 22176], [0, 2, 3, 42704], [4, 1, 23, 21224], [0, 2, 11, 21200],
    [8, 1, 31, 43352], [0, 2, 19, 43344], [0, 2, 7, 46240], [6, 1, 27, 46416], [0, 2, 15, 44368], [0, 2, 5, 21920],
    [4, 1, 24, 42448], [0, 2, 12, 42416], [0, 2, 2, 21168], [3, 1, 22, 43320], [0, 2, 9, 26928], [7, 1, 29, 29336],
    [0, 2, 17, 27296], [0, 2, 6, 44368], [5, 1, 26, 19880], [0, 2, 14, 19296], [0, 2, 3, 42352], [4, 1, 24, 21104],
    [0, 2, 10, 53856], [8, 1, 30, 59696], [0, 2, 18, 54560], [0, 2, 7, 55968], [6, 1, 27, 27472], [0, 2, 15, 22224],
    [0, 2, 5, 19168], [4, 1, 25, 42216], [0, 2, 12, 42192], [0, 2, 1, 53584], [2, 1, 21, 55592], [0, 2, 9, 54560]
  ],
  // 是否闰年
  isLeapYear: function(year) {
    return ((year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0))
  },
  // 天干地支年
  lunarYear: function(year) {
    var gan = ['庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁', '戊', '己']
    var zhi = ['申', '酉', '戌', '亥', '子', '丑', '寅', '卯', '辰', '巳', '午', '未']
    var str = year.toString().split('')
    return gan[str[3]] + zhi[year % 12]
  },
  // 生肖年
  zodiacYear: function(year) {
    var zodiac = ['猴', '鸡', '狗', '猪', '鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊']
    return zodiac[year % 12]
  },
  // 公历月份天数
  // @param year 阳历-年
  // @param month 阳历-月
  solarMonthDays: function(year, month) {
    var FebDays = this.isLeapYear(year) ? 29 : 28
    var monthHash = ['', 31, FebDays, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    return monthHash[month]
  },
  // 农历月份天数
  lunarMonthDays: function(year, month) {
    var monthData = this.lunarMonths(year)
    return monthData[month - 1]
  },
  // 农历月份天数数组
  lunarMonths: function(year) {
    var yearData = this.lunarInfo[year - this.MIN_YEAR]
    var leapMonth = yearData[0]
    var bit = (+yearData[3]).toString(2)
    var months = []
    for (var i = 0; i < bit.length; i++) {
      months[i] = bit.substr(i, 1)
    }

    for (var k = 0, len = 16 - months.length; k < len; k++) {
      months.unshift('0')
    }

    months = months.slice(0, (leapMonth === 0 ? 12 : 13))
    // eslint-disable-next-line no-redeclare
    for (var i = 0; i < months.length; i++) {
      months[i] = +months[i] + 29
    }
    return months
  },
  // 农历每年的天数
  // @param year 农历年份
  lunarYearDays: function(year) {
    var monthArray = this.lunarYearMonths(year)
    var len = monthArray.length
    return (monthArray[len - 1] === 0 ? monthArray[len - 2] : monthArray[len - 1])
  },
  //
  lunarYearMonths: function(year) {
    var monthData = this.lunarMonths(year)
    var res = []
    var temp = 0
    var yearData = this.lunarInfo[year - this.MIN_YEAR]
    var len = (yearData[0] === 0 ? 12 : 13)
    for (var i = 0; i < len; i++) {
      temp = 0
      for (var j = 0; j <= i; j++) {
        temp += monthData[j]
      }
      res.push(temp)
    }
    return res
  },
  // 获取闰月
  // @param year 农历年份
  leapMonth: function(year) {
    var yearData = this.lunarInfo[year - this.MIN_YEAR]
    return yearData[0]
  },
  // 计算农历日期与正月初一相隔的天数
  betweenLunarDays: function(year, month, day) {
    var yearMonth = this.lunarMonths(year)
    var res = 0
    for (var i = 1; i < month; i++) {
      res += yearMonth[i - 1]
    }
    res += day - 1
    return res
  },
  // 计算2个阳历日期之间的天数
  // @param year 阳历年
  // @param month
  // @param day
  // @param l_month 阴历正月对应的阳历月份
  // @param l_day  阴历初一对应的阳历天
  betweenSolarDays: function(year, month, day, l_month, l_day) {
    var time1 = new Date(year + '-' + month + '-' + day).getTime()
    var time2 = new Date(year + '-' + l_month + '-' + l_day).getTime()
    return Math.ceil((time1 - time2) / 24 / 3600 / 1000)
  },
  // 根据距离正月初一的天数计算阴历日期
  // @param year 阳历年
  // @param between 天数
  lunarByBetween: function(year, between) {
    var lunarArray = []; var yearMonth = []; var t = 0; var e = 0; var leapMonth = 0; var m = ''
    if (between === 0) {
      t = 1
      e = 1
      m = '正月'
    } else {
      year = between > 0 ? year : (year - 1)
      yearMonth = this.lunarYearMonths(year)
      leapMonth = this.leapMonth(year)
      between = between > 0 ? between : (this.lunarYearDays(year) + between)
      for (var i = 0; i < 13; i++) {
        if (between === yearMonth[i]) {
          t = i + 2
          e = 1
          break
        } else if (between < yearMonth[i]) {
          t = i + 1
          e = between - ((yearMonth[i - 1]) ? yearMonth[i - 1] : 0) + 1
          break
        }
      }

      m = (leapMonth !== 0 && t === leapMonth + 1)
        ? ('闰'.this.chineseMonth(t - 1))
        : this.chineseMonth(((leapMonth !== 0 && leapMonth + 1 < t) ? (t - 1) : t))
    }
    lunarArray.push(year, t, e) // 年 月 日
    lunarArray.push(this.lunarYear(year),
      this.zodiacYear(year),
      m,
      this.chineseNumber(e)) // 天干地支年 生肖年 月份 日
    lunarArray.push(leapMonth) // 闰几月
    return lunarArray
  },
  // 中文月份
  chineseMonth: function(month) {
    var monthHash = ['', '正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '冬月', '腊月']
    return monthHash[month]
  },
  // 中文日期
  chineseNumber: function(num) {
    var dateHash = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十']
    var res = null
    if (num <= 10) {
      res = '初' + dateHash[num]
    } else if (num > 10 && num < 20) {
      res = '十' + dateHash[num - 10]
    } else if (num === 20) {
      res = '二十'
    } else if (num > 20 && num < 30) {
      res = '廿' + dateHash[num - 20]
    } else if (num === 30) {
      res = '三十'
    }
    return res
  },
  // 转换农历
  toLunar: function(year, month, day) {
    var yearData = this.lunarInfo[year - this.MIN_YEAR]
    if (year === this.MIN_YEAR && month <= 2 && day <= 9) {
      return [1891, 1, 1, '辛卯', '兔', '正月', '初一']
    }
    return this.lunarByBetween(year, this.betweenSolarDays(year, month, day, yearData[1], yearData[2]))
  },
  // 转换公历
  // @param year 阴历-年
  // @param month 阴历-月，闰月处理：例如如果当年闰五月，那么第二个五月就传六月，相当于阴历有13个月
  // @param date 阴历-日
  toSolar: function(year, month, day) {
    var yearData = this.lunarInfo[year - this.MIN_YEAR]
    var between = this.betweenLunarDays(year, month, day)
    var ms = new Date(year + '-' + yearData[1] + '-' + yearData[2]).getTime()
    var s = ms + between * 24 * 60 * 60 * 1000
    var d = new Date()
    d.setTime(s)
    year = d.getFullYear()
    month = d.getMonth() + 1
    day = d.getDate()
    return [year, month, day]
  }
}

// 获取当前月的第一天
export function getCurrentMonthFirst() {
  var date = new Date()
  date.setDate(1)
  return parseTime(date, '{y}-{m}-{d}')
}

// 获取当前月的最后一天
export function getCurrentMonthLast() {
  var date = new Date()
  var currentMonth = date.getMonth()
  var nextMonth = ++currentMonth
  var nextMonthFirstDay = new Date(date.getFullYear(), nextMonth, 1)
  var oneDay = 1000 * 60 * 60 * 24
  return parseTime(new Date(nextMonthFirstDay - oneDay), '{y}-{m}-{d}')
}

// 上传图片之前进行检查
export function beforeUploadIcon(file) {
  const imgType =
        file.type === 'image/jpeg' ||
        file.type === 'image/jpg' ||
        file.type === 'image/png' ||
        file.type === 'image/tiff'
  const isLt10M = file.size / 1024 / 1024 < 10

  if (!imgType) {
    Message({
      message: '上传图片只能是 jpg/jpeg/png 格式!',
      type: 'error',
      duration: 5 * 1000
    })
    return false
  }
  if (!isLt10M) {
    Message({
      message: '上传图片大小不能超过 10MB!',
      type: 'error',
      duration: 5 * 1000
    })
    return false
  }
  return true
}

// 上传excel之前检查
export function beforeUploadExcel(file) {
  var isLt1M = file.size / 1024 / 1024 < 1
  if (isLt1M) {
    return true
  }
  Message({
    message: '请不要上传大于1m的文件。',
    type: 'error',
    duration: 5 * 1000
  })
  return false
}

// 在使用js-xlsx插件来读取excel时,会将2018/10/16这种数据自动装换成48264.12584511.
// 所以需要自己手动再转换回来
export function excelTimeformatDate(numb, format = '-') {
  var utc_days = Math.floor(numb - 25569)
  var utc_value = utc_days * 86400
  // var date_info = new Date(utc_value * 1000)

  // var fractional_day = numb - Math.floor(numb) + 0.0000001

  // var total_seconds = Math.floor(86400 * fractional_day)

  // var seconds = total_seconds % 60

  // total_seconds -= seconds

  // var hours = Math.floor(total_seconds / (60 * 60))
  // var minutes = Math.floor(total_seconds / 60) % 60

  return utc_value * 1000
}
