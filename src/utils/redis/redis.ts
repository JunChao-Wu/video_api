import { BASE_COMMON, REDIS_KEY_COMMON } from "src/common/common";
import { BaseRedis, clientOptionsType } from "./BaseRedis";

const redisOptions: clientOptionsType = {
  name: "client",
  userName: BASE_COMMON.redis.userName,
  password: BASE_COMMON.redis.password,
  host: BASE_COMMON.redis.host,
  port: BASE_COMMON.redis.port,
  db_index: BASE_COMMON.redis.db,
}

class Redis extends BaseRedis {
  constructor() {
    super()
  }

  setKey(key: string, value: string, expiredTime?: number) {
    return this.client.set(key, value, {
      EX: expiredTime,
    })
  }

  getKey(key: string) {
    return this.client.get(key);
  }

  setCache (key: string, value: any) {
    const cacheVal = JSON.stringify(value);
    return this.setKey(key, cacheVal, REDIS_KEY_COMMON.cacheExpireTime);
  }

  async getCache (key: string) {
    let res = await this.getKey(key);
    if (res) {
      res = JSON.parse(res)
    }
    return res;
  }

  deleteKey (key: string) {
    return this.client.del(key);
  }

  async eval(script: string, options: {keys: string[], arguments: any[]}) {
    return await this.client.eval(script, options);
  }

}

export interface RedisInterface extends Redis {}

export const _redis: RedisInterface = Redis.init(Redis, redisOptions)
