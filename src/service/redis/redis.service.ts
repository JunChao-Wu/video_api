import { Injectable } from '@nestjs/common';
import { _redis, RedisInterface } from 'src/utils/redis/redis';
import { REDIS_KEY_COMMON } from 'src/common/common';

@Injectable()
export class RedisService {
  private redis: RedisInterface
  constructor() {
    this.redis = _redis;
  }

  eval(script: string, options: {keys: string[], arguments: string[]}) {
    return this.redis.eval(script, options);
  }

  setKey(key: string, value: string) {
    return this.redis.setKey(key, value);
  }

  getKey(key: string) {
    return this.redis.getKey(key);
  }
  
  deleteKey (key: string) {
    return this.redis.deleteKey(key);
  }

  setCache (key: string, value: any) {
    const cacheVal = JSON.stringify(value);
    return this.redis.setKey(key, cacheVal, REDIS_KEY_COMMON.cacheExpireTime);
  }

  async getCache (key: string) {
    let res = await this.redis.getKey(key);
    if (res) {
      res = JSON.parse(res)
    }
    return res;
  }

  async removeCache (key: string) {
    console.log("🚀 ~ RedisService ~ removeCache ~ key:", key)
    const script = `
      local total = 0
      local cursor = 0
      local total = 0
      local key = KEYS[1]
      local limit = ARGV[1]

      repeat
        local res = redis.call('scan', cursor, 'match', key, 'COUNT', limit)
        if(res ~= nil and #res >= 0) then 
          redis.replicate_commands()
          cursor = tonumber(res[1])
          local ks = res[2]
          total = #ks
          for i=1,total,1 do
            local k = tostring(ks[i])
            redis.call('del', k)
          end
        end
      until (cursor <= 0)
      return total
    `;
    await this.redis.eval(script, {
      keys: [key],
      arguments: ["1000"]
    })
  }

}

