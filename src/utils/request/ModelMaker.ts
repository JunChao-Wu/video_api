import { dataRoleObj } from './ValidateUtil'

const paramType = {
  integer: 'integer',
  float: 'float',
  string: 'string',
  array: 'array',
  object: 'object',
  boolean: 'boolean',
  uint8array: 'uint8array',
  arraybuffer: 'arraybuffer',
}

function getType(data: any): string {
  // ts中Object key值的类型不是string 需要显示定义后才能使用索引
  const typeMap: {
    [key: string]: string
  } = {
    '[object Object]': 'object',
    '[object Function]': 'function',
    '[object Array]': 'array',
    '[object Number]': 'number',
    '[object String]': 'string',
    '[object Null]': 'null',
    '[object Undefined]': 'undefined',
    '[object Boolean]': 'boolean',
    '[object Uint8Array]': 'uint8array',
    '[object ArrayBuffer]': 'arraybuffer',
  }
  const type: string = Object.prototype.toString.call(data)

  return typeMap[type].toLocaleLowerCase()
}

interface regexObj {
  regex: string
  errMsg: string
}
interface compareToObj {
  attrName: string
  compareKey: string
}
export interface roleObj {
  type?: string
  required?: boolean
  desc?: string
  emu?: Array<any>
  regex?: regexObj
  min?: number
  max?: number
  compareTo?: compareToObj
  trim?: boolean
  defaultTo?: any
  child?: dataRoleObj
}

export class ModelMaker {
  role: roleObj
  constructor() {
    this.role = {}
  }

  // ModelMaker 构造j校验对象必须通过keys()返回
  keys() {
    return this.role
  }

  integer() {
    this.role.type = paramType.integer
    return this
  }

  float() {
    this.role.type = paramType.float
    return this
  }

  string() {
    this.role.type = paramType.string
    return this
  }

  array() {
    this.role.type = paramType.array
    return this
  }

  uint8array() {
    this.role.type = paramType.uint8array
    return this
  }

  arraybuffer() {
    this.role.type = paramType.arraybuffer
    return this
  }

  object() {
    this.role.type = paramType.object
    return this
  }

  boolean() {
    this.role.type = paramType.boolean
    return this
  }

  /**
   * 是否必传参数
   * @param {boolean} isRequired
   */
  required(isRequired: boolean = true) {
    this.role.required = !!isRequired
    return this
  }

  /**
   * 参数描述
   * @param {String} desc
   */
  des(desc: string) {
    this.role.desc = desc + ''
    return this
  }

  /**
   * 参数值限制
   * @param {Array} limitArr
   * @returns
   */
  emu(limitArr: Array<any> = []) {
    if (!limitArr || limitArr.length <= 0) {
      return this
    }
    if (this.role.type) {
      for (let i = 0; i < limitArr.length; i++) {
        const limitEl = limitArr[i]
        if (getType(limitEl) !== this.role.type) {
          throw new Error('emu存在限制值不符合该校验的类型限制')
        }
      }
    }
    this.role.emu = limitArr
    return this
  }

  /**
   * 正则
   * @param {String} regex
   * @param {String} errMsg
   */
  regex(regex: string, errMsg: string = '{des}输入错误') {
    this.role.regex = {
      regex,
      errMsg,
    }
    return this
  }

  /**
   * 最小值或长度
   * @param {Number} min
   */
  min(min: number) {
    if (min !== null) {
      this.role.min = min
    }
    return this
  }

  /**
   * 最大值或长度
   * @param {Number} max
   */
  max(max: number) {
    if (max !== null) {
      this.role.max = max
    }
    return this
  }

  /**
   *
   * @param {String} attrName
   * @param {String} compareKey lt: 需要小于  gt: 需要大于   equal: 等于  lte: 需要小于等于  gte: 需要大于等于
   */
  compareTo(attrName: string, compareKey: string) {
    this.role.compareTo = {
      attrName,
      compareKey,
    }
    return this
  }

  /**
   * 去除空格
   */
  trim() {
    this.role.trim = true
    return this
  }

  /**
   * 空的时候的默认值
   * @param {*} _default
   */
  defaultTo(_default: any) {
    this.role.defaultTo = _default
    return this
  }

  /**
   * 复杂结构的子参数
   * @param {Object} childRole
   */
  child(childRole: object) {
    this.role.child = childRole
    return this
  }
}
