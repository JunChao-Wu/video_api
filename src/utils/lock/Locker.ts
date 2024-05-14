import { sleep } from "../jsUtils/jsUtils";
import { RedisInterface, _redis } from "../redis/redis";
import { generateLockKey } from "./impl/generateLockKey";

export class Locker {
  #retryTimes: number;
  #key: string;
  #requestId: string;
  #redis: RedisInterface;
  constructor(options: {key: string, requestId: string}) {
    this.#retryTimes = 5;
    this.#key = options.key;
    this.#requestId = options.requestId;
    this.#redis = _redis;
  }

  async lock(seconds = 30) {
    if (!this.#key) {
      return;
    }
    let times = this.#retryTimes;
    const lockKey = generateLockKey(this.#key);
    const lockScript = `
      if redis.call('EXISTS', KEYS[1]) == 1 and redis.call('HEXISTS', KEYS[1], ARGV[1]) == 0
        then return 1
      else
        redis.call('HINCRBY', KEYS[1], ARGV[1], 1)
        redis.call('EXPIRE', KEYS[1], ARGV[2])
        return 0
      end
    `;
    while (
      await this.#redis.eval(lockScript, {
        keys:  [lockKey],
        arguments: [this.#requestId, seconds + ""],
      })
    ) {
      if (times === 0) {
        throw new Error("write Lock failed");
      }
      await sleep(2);
      --times;
    }
    console.log("🚀 ~ Locker ~ lock ~ 建锁了:")
  }

  async unLock() {
    if (!this.#key) {
      return;
    }
    const unLockScript = `
    if redis.call('HEXISTS', KEYS[1], ARGV[1]) == 1 and redis.call('HGET', KEYS[1], ARGV[1]) > '1'
      then
      redis.call('HINCRBY', KEYS[1], ARGV[1], -1)
      return 1
    end
    if redis.call('HGET', KEYS[1], ARGV[1]) == '1'
      then
      redis.call('DEL', KEYS[1])
      return 1
    end
    `;
    await this.#redis.eval(unLockScript, {
      keys: [this.#key],
      arguments: [this.#requestId],
    });
    console.log("🚀 ~ Locker ~ unLock ~ 解锁了:")
  }
}
