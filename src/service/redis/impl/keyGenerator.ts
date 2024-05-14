import * as _ from 'lodash';
import { sha256 } from "src/utils/cryptoUtil";


export function minCacheKeyGenerator(mainKey: string | number): string {
  return `cache:user:${sha256(JSON.stringify(mainKey))}`
}

export function processKey(param: any, cacheName: string, addUserId: boolean = false) {
  console.log("🚀 ~ processKey ~ param:", param)
  const cacheKeyList = ["cache"];
  const _param = _.cloneDeep(param);
  if (cacheName) {
    cacheKeyList.push(cacheName);
  }
  if (addUserId && param && param.user && param.user.id) {
    cacheKeyList.push(String(param.user.id));
  }
  delete _param.requestId;
  delete _param.http;
  delete _param.user;
  cacheKeyList.push(sha256(JSON.stringify(_param)))
  return cacheKeyList.join(":");
}


export function processRemoveKey (cacheName: string) {
  const cacheKeyList = ["cache"];
  if (cacheName) {
    cacheKeyList.push(cacheName);
  }
  //这个是生成模糊删除的key
  cacheKeyList.push("*");
  return cacheKeyList.join(":");
}