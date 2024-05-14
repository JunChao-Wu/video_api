import { compareKeyMap, paramType, roleObj } from './ModelMaker'
import { checkTypeAndValue, getType } from './impl/checkTypeUtil';
import { CreateError } from './impl/CreateError';
import { ErrorCodeModel } from './impl/validateErrorCode';
import { whiteListConfig } from './whiteList'
import * as _ from 'lodash';

interface _dataRole {
  // isReturn 为false则只进行校验, true会校验并只返回校验内容
  isReturn?: boolean
  // key 为受校验属性
  targetRole?: {[key: string]: roleObj}
}
export type dataRoleObj = Readonly<_dataRole>;

export class ValidateUtil {
  static validate<T>(_originData: T, dataRole: dataRoleObj): unknown {
    const result: {[key: string]: unknown} = {}
    if (!dataRole || !_originData) {
      return;
    }
    const originData = _.cloneDeep(_originData) as any;

    const targetRole = dataRole.targetRole || {}
    for (const paramName in targetRole) {
      if (Object.hasOwnProperty.call(targetRole, paramName)) {
        const paramRole = targetRole[paramName]

        // 是否必传
        if (paramRole.required && (originData[paramName] === null || originData[paramName] === undefined)) {
          throw new CreateError({
            code: 'xxxxx',
            message: `${paramName}必传`,
            value: originData[paramName],
            columnName: paramName,
          })
        }

        // 验证参数类型type 和 参数范围min,max
        const formatVal = checkTypeAndValue(originData[paramName], paramRole, paramName);
        if (formatVal !== null && formatVal !== undefined) {
          originData[paramName] = formatVal
        }

        // 参数值限制
        if (
          paramRole.emu &&
          paramRole.emu.length > 0 &&
          originData[paramName] !== null &&
          !paramRole.emu.includes(originData[paramName])
        ) {
          throw new CreateError({
            code: ErrorCodeModel[10021].code,
            message: ErrorCodeModel[10021].desc,
            value: originData[paramName],
            columnName: paramName,
          })
        }

        // 正则匹配结果
        if (paramRole.regex && originData[paramName] !== null) {
          const regx = new RegExp(paramRole.regex.regex)
          let isPass = true
          if (
            paramType.string === getType(originData[paramName]) ||
            paramType.float === getType(originData[paramName]) ||
            paramType.integer === getType(originData[paramName])
          ) {
            isPass = isPass && regx.test(originData[paramName])
          }
          if (getType(originData[paramName]) === paramType.array) {
            for (let i = 0; i < originData[paramName].length; i++) {
              const el = originData[paramName][i]
              isPass = isPass && regx.test(el)
            }
          }
          if (!isPass) {
            throw new CreateError({
              code: ErrorCodeModel[10060].code,
              message: ErrorCodeModel[10060].desc,
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
            case compareKeyMap.lt:
              if (!(_current < _target)) {
                errCode = ErrorCodeModel[10080].code
              }
              break
            case compareKeyMap.gt:
              if (!(_current > _target)) {
                errCode = ErrorCodeModel[10080].code
              }
              break
            case compareKeyMap.equal:
              if (_current !== _target) {
                errCode = ErrorCodeModel[10080].code
              }
              break
            case compareKeyMap.lte:
              if (!(_current <= _target)) {
                errCode = ErrorCodeModel[10080].code
              }
              break
            case compareKeyMap.gte:
              if (!(_current >= _target)) {
                errCode = ErrorCodeModel[10080].code
              }
              break
            default:
              break
          }
          if (errCode) {
            throw new CreateError({
              code: errCode,
              message: ErrorCodeModel[10080].desc,
              value: originData[paramName],
              columnName: paramName,
            })
          }
        }

        // 去除首尾空格
        if (paramRole.trim) {
          getType(originData[paramName]) === paramType.string &&
            (originData[paramName] = originData[paramName].trim())
        }

        // 空的时候的默认值
        if (paramRole.defaultTo !== null && originData[paramName] === null) {
          originData[paramName] = paramRole.defaultTo
        }

        // 复杂结构的子参数
        if (paramRole.child && originData[paramName] !== null) {
          const _type = getType(originData[paramName])
          if (_type === paramType.object) {
            this.validate(originData[paramName], paramRole.child)
          }
          if (_type === paramType.array && originData[paramName].length > 0) {
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
