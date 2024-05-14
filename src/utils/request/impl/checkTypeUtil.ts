import { regexList } from "src/utils/regexList";
import { roleObj, paramType, ParamType } from "../ModelMaker";
import { ErrorCodeModel } from "./validateErrorCode";
import { CreateError } from "./CreateError";

// 检查类型
// 检查integer, float, array的min,max范围
// 返回integer,float,boolean的值
export function checkTypeAndValue(value: any, paramRole: roleObj, paramName: string) {
  try {
    switch (paramRole.type) {
      case paramType.integer:
        if (value && !isInteger(value)) {
          throw new CreateError({
            code: ErrorCodeModel[10031].code,
            message: ErrorCodeModel[10031].desc,
            columnName: paramName,
            value
          })
        }
        if (value && isInteger(value)) {
          checkMinMaxLimit(value, paramRole, paramName, paramType.integer);
          return parseInt(value, 10);
        }
        break;
      case paramType.float:
        if (value && !isFloat(value)) {
          throw new CreateError({
            code: ErrorCodeModel[10031].code,
            message: ErrorCodeModel[10031].desc,
            columnName: paramName,
            value
          })
        }
        if (value && isFloat(value)) {
          checkMinMaxLimit(value, paramRole, paramName, paramType.float);
          return parseFloat(value);
        }
        break;
      case paramType.boolean:
        if (!isBoolean(value)) {
          throw new CreateError({
            code: ErrorCodeModel[10031].code,
            message: ErrorCodeModel[10031].desc,
            columnName: paramName,
            value
          })
        }
        if(isBoolean(value)) {
          return JSON.parse(value);
        }
        break;
      case paramType.object:
        if (!isObject(value)) {
          throw new CreateError({
            code: ErrorCodeModel[10031].code,
            message: ErrorCodeModel[10031].desc,
            columnName: paramName,
            value
          })
        }
        break;
      case paramType.array:
        if (!isArray(value)) {
          throw new CreateError({
            code: ErrorCodeModel[10031].code,
            message: ErrorCodeModel[10031].desc,
            columnName: paramName,
            value
          })
        }
        if (isArray(value)) {
          checkMinMaxLimit(value, paramRole, paramName, paramType.array);
        }
        break;
      case paramType.arraybuffer:
        if (!isArrayBuffer(value)) {
          throw new CreateError({
            code: ErrorCodeModel[10031].code,
            message: ErrorCodeModel[10031].desc,
            columnName: paramName,
            value
          })
        }
        break;
      case paramType.uint8array:
        if (!isUint8array(value)) {
          throw new CreateError({
            code: ErrorCodeModel[10031].code,
            message: ErrorCodeModel[10031].desc,
            columnName: paramName,
            value
          })
        }
        break;
    
      default:
        // 默认都走字符
        if (value !== null && value !== undefined && typeof value !== "string") {
          throw new CreateError({
            code: ErrorCodeModel[10031].code,
            message: ErrorCodeModel[10031].desc,
            columnName: paramName,
            value
          })
        }
        if (value) {
          checkMinMaxLimit(value, paramRole, paramName, paramType.string);
        }
        break;
    }
  } catch (error) {
    
  }

}

function checkMinMaxLimit(value: any, paramRole: roleObj, paramName: string, type: ParamType) {
  let compareVal = value;
  if (type === paramType.array || type === paramType.string) {
    compareVal = value.length;
  }
  if (paramRole.min !== null && compareVal < (paramRole.min as number)) {
    throw new CreateError({
      code: ErrorCodeModel[10040].code,
      message: ErrorCodeModel[10040].desc,
      columnName: paramName,
      value
    })
  }
  if (paramRole.max !== null && compareVal > (paramRole.max as number)) {
    throw new CreateError({
      code: ErrorCodeModel[10050].code,
      message: ErrorCodeModel[10050].desc,
      columnName: paramName,
      value
    })
  }
}


/******************/
const normalTypeMap = {
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
} as const;
const typeList = Object.values(normalTypeMap)
type TypeList = typeof typeList[number]

export function getType(value: any): TypeList | ParamType {
  const _typeMap: {
    [key: string]: TypeList | ParamType
  } = normalTypeMap
  if (value == null) {
    return value === undefined ? _typeMap['[object Undefined]'] : _typeMap['[object Null]'];
  }
  let typeRes = _typeMap[toString.call(value)];
  if (typeRes === 'number') {
    typeRes = isInteger(value) ? paramType.integer : paramType.float;
  }
  return typeRes;
}

function isInteger(value: any) {
  return new RegExp(regexList.isInteger).test(value);
}

function isFloat(value: any) {
  return new RegExp(regexList.isFloat).test(value);
}

function isBoolean(value: any) {
  if (typeof value == "string") {
    return ["true", "false"].includes(value);
  } else {
    return (value === true || value === false);
  }
}

function isObject(value: any) {
  if (!(typeof value === 'object' && value !== null) || getType(value) !== paramType.object) {
    return false;
  }
  if (Object.getPrototypeOf(value) === null) {
    return true;
  }
  let proto = value;
  while (Object.getPrototypeOf(proto) !== null) {
      proto = Object.getPrototypeOf(proto);
  }
  return Object.getPrototypeOf(value) === proto;
}

function isArray(value: any) {
  return Array.isArray(value)
}

function isArrayBuffer(value: any) {
  return getType(value) === paramType.arraybuffer;
}

function isUint8array(value: any) {
  return getType(value) === paramType.uint8array;
}

