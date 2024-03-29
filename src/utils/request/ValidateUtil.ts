import { roleObj } from './ModelMaker'
import { whiteListConfig } from './whiteList'

export interface dataRoleObj {
  // isReturn 为false则只进行校验, true会校验并只返回校验内容
  isReturn?: boolean
  // key 为受校验属性
  targetRole?: {[key: string]: roleObj}
}

export class ValidateUtil {
  static validate(_originData: any, dataRole: dataRoleObj): any {
    const result: {[key: string]: any} = {}
    if (!dataRole || !_originData) {
      return;
    }
    const originData = deepClone(_originData)

    const targetRole = dataRole.targetRole || {}
    for (const paramName in targetRole) {
      if (Object.hasOwnProperty.call(targetRole, paramName)) {
        const paramRole = targetRole[paramName]

        // 是否必传
        if (paramRole.required && originData[paramName] === null) {
          throw new CreateError({
            code: 'xxxxx',
            message: `${paramName}必传`,
            value: originData[paramName],
            columnName: paramName,
          })
        }

        // 验证参数类型
        if (
          paramRole.type &&
          originData[paramName] !== null &&
          getType(originData[paramName]) !== paramRole.type
          ) {
          throw new CreateError({
            code: 'xxxxx',
            message: '验证参数类型',
            value: originData[paramName],
            columnName: paramName,
          })
        }

        // 参数值限制
        if (
          paramRole.emu &&
          paramRole.emu.length > 0 &&
          originData[paramName] !== null &&
          !paramRole.emu.includes(originData[paramName])
        ) {
          throw new CreateError({
            code: 'xxxxx',
            message: '参数值限制',
            value: originData[paramName],
            columnName: paramName,
          })
        }

        // 正则匹配结果
        if (paramRole.regex && originData[paramName] !== null) {
          const regx = new RegExp(paramRole.regex.regex)
          let isPass = true
          if (
            ['string', 'float', 'integer'].includes(
              getType(originData[paramName])
            )
          ) {
            isPass = isPass && regx.test(originData[paramName])
          }
          if (getType(originData[paramName]) === 'array') {
            for (let i = 0; i < originData[paramName].length; i++) {
              const el = originData[paramName][i]
              isPass = isPass && regx.test(el)
            }
          }
          if (!isPass) {
            throw new CreateError({
              code: 'xxxxx',
              message: '正则匹配结果',
              value: originData[paramName],
              columnName: paramName,
            })
          }
        }

        // 最小值
        if (
          typeof paramRole.min === 'number' &&
          originData[paramName] !== null
        ) {
          if (
            getType(originData[paramName]) === 'string' &&
            originData[paramName].length < paramRole.min
          ) {
            throw new CreateError({
              code: 'xxxxx',
              message: '最小值',
              value: originData[paramName],
              columnName: paramName,
            })
          }
          if (
            ['integer', 'float'].includes(getType(originData[paramName])) &&
            originData[paramName] < paramRole.min
          ) {
            throw new CreateError({
              code: 'xxxxx',
              message: '最小值',
              value: originData[paramName],
              columnName: paramName,
            })
          }
        }

        // 最大值
        if (
          typeof paramRole.max === 'number' &&
          originData[paramName] !== null
        ) {
          if (
            getType(originData[paramName]) === 'string' &&
            originData[paramName].length > paramRole.max
          ) {
            throw new CreateError({
              code: 'xxxxx',
              message: '最大值',
              value: originData[paramName],
              columnName: paramName,
            })
          }
          if (
            ['integer', 'float'].includes(getType(originData[paramName])) &&
            originData[paramName] > paramRole.max
          ) {
            throw new CreateError({
              code: 'xxxxx',
              message: '最大值',
              value: originData[paramName],
              columnName: paramName,
            })
          }
        }

        // 参数间对比
        if (
          paramRole.compareTo &&
          originData[paramName] !== null &&
          ['float', 'integer'].includes(getType(originData[paramName]))
        ) {
          const _current = originData[paramName]
          const _target = originData[paramRole.compareTo.attrName]
          const compareKey = paramRole.compareTo.compareKey
          let errCode = null
          switch (compareKey) {
            case 'lt':
              if (!(_current < _target)) {
                errCode = ''
              }
              break

            case 'gt':
              if (!(_current > _target)) {
                errCode = ''
              }
              break

            case 'equal':
              if (_current !== _target) {
                errCode = ''
              }
              break

            case 'lte':
              if (!(_current <= _target)) {
                errCode = ''
              }
              break

            case 'gte':
              if (!(_current >= _target)) {
                errCode = ''
              }
              break

            default:
              break
          }
          if (errCode) {
            throw new CreateError({
              code: errCode,
              message: '参数间对比',
              value: originData[paramName],
              columnName: paramName,
            })
          }
        }

        // 去除首尾空格
        if (paramRole.trim) {
          getType(originData[paramName]) === 'string' &&
            (originData[paramName] = originData[paramName].trim())
        }

        // 空的时候的默认值
        if (paramRole.defaultTo !== null && originData[paramName] === null) {
          originData[paramName] = paramRole.defaultTo
        }

        // 复杂结构的子参数
        if (paramRole.child && originData[paramName] !== null) {
          const _type = getType(originData[paramName])
          if (_type === 'object') {
            this.validate(originData[paramName], paramRole.child)
          }
          if (_type === 'array' && originData[paramName].length > 0) {
            for (let i = 0; i < originData[paramName].length; i++) {
              const el = originData[paramName][i]
              this.validate(el, paramRole.child)
            }
          }
        }
      }
      result[paramName] = originData[paramName]
    }

    if (dataRole.isReturn) {
      // 添加白名单的属性
      for (let i = 0; i < whiteListConfig.length; i++) {
        const el = whiteListConfig[i]
        result[el] = originData[el]
      }
      // 只返回校验的数据
      return result
    } else {
      return _originData
    }
  }
}

/**
 * 错误类型自定义
 * @param {*} option
 */
interface optionObj {
  code: number | string
  message: string
  value: any
  columnName: string
}

class CreateError extends Error {
  code: number | string
  errCode: number | string
  value: any
  columnName: string
  constructor(option: optionObj) {
    super()
    this.code = option.code
    this.errCode = option.code
    this.message = option.message
    this.value = option.value
    this.columnName = option.columnName
  }
}

function getType(data: any): string {
  interface typeMapObj {
    [key: string]: string
  }
  const typeMap: typeMapObj = {
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
  let type = Object.prototype.toString.call(data)
  type = typeMap[type].toLocaleLowerCase()
  if (type === 'number') {
    // 整数
    const intRegx = new RegExp(/^-?[1-9]\d*$/, 'i')
    // 浮点数
    const floatRegx = new RegExp(
      /^-?([1-9]\d*\.\d+|0\.\d*[1-9]\d*|\d+\.\d+)$/,
      'i'
    )
    if (floatRegx.test(data)) {
      type = 'float'
    } else if (intRegx.test(data)) {
      type = 'integer'
    }
  }
  return type
}

function deepClone(target: any) {
  let result: any = null
  if (getType(target) === 'object') {
    result = {}
    for (const key in target) {
      if (Object.hasOwnProperty.call(target, key)) {
        const value = target[key]
        result[key] = value
      }
    }
  }
  if (getType(target) === 'array') {
    result = new Array(target.length).fill(0)
    for (let i = 0; i < target.length; i++) {
      const el = target[i]
      result[i] = el
    }
  }
  return result || target
}
