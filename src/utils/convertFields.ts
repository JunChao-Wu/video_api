import { SERIES_COMMON, VIDEOS_COMMON } from "src/common/common";
import { _lodash } from "./_lodash";

const keyReflectMap = {
  videos: VIDEOS_COMMON.keyReflect,
  series: SERIES_COMMON.keyReflect
} as const;
type KeyType = keyof typeof keyReflectMap

/**
 * 处理返回给前端的数据
 * @param datas 
 * @param key 
 * @returns 
 */
export function convertFields<T> (datas: T | T[], key: KeyType): any {
  let resultList: any[] = [];
  let result = {}
  const keyReflect = keyReflectMap[key]
  if (Array.isArray(datas)) {
    resultList = datas.map((data) => {
      return _lodash.mapKeys(data as object, function(v, k: keyof typeof keyReflect) {
        return keyReflect[k] ? keyReflect[k] : k;
      })
    })
  } else {
    result = _lodash.mapKeys(datas as object, function(v, k: keyof typeof keyReflect) {
      return keyReflect[k] ? keyReflect[k] : k;
    })
  }
  return Array.isArray(datas) ? resultList : result;
}


export function convertDBFields (result: {[key:string]: any}, config: any, type: KeyType) {
  const invertReflect = _lodash.invert(keyReflectMap[type])
  _lodash.mapKeys(config, function(v, k) {
    if (!invertReflect[k] || v === null || v === undefined) {
      return;
    }
    result[invertReflect[k]] = v;
  })
  return;
}
