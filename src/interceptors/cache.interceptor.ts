import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, of, tap } from 'rxjs';
import { processKey } from 'src/service/redis/impl/keyGenerator';
// import { RedisService } from 'src/service/redis/redis.service';
import { _redis } from 'src/utils/redis/redis';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  #cacheName: string;
  #addUser: boolean | undefined;
  constructor(
    cacheName: string,
    addUser?: boolean,
    // private readonly redisService: RedisService
  ) {
    this.#cacheName = cacheName;
    this.#addUser = !!addUser;
  }
  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    console.log("🚀 ~ : try use cache")
    const [req] = context.getArgs();
    const param = req.method === "POST" ? req.body : req.query;
    const cacheKey = processKey(param, this.#cacheName, this.#addUser)
    // const cache = await this.redisService.getCache(cacheKey);
    const cache = await _redis.getCache(cacheKey);
    if (!cache) {
      return next.handle().pipe(tap(data => {
        if (data.succ && data.statusCode === 200) {
          console.log("🚀 ~ CacheInterceptor ~ intercept ~ 存cache:")
          // this.redisService.setCache(cacheKey, data.data);
          _redis.setCache(cacheKey, data.data);
        }
      }));
    } else {
      console.log("🚀 ~ CacheInterceptor ~ intercept ~ 用cache:")
      return of(makeCacheResult(cache))
    }
  }
}

function makeCacheResult (data: any) {
  return {
    succ: true,
    statusCode: 200,
    message: "查询成功",
    data: data
  }
}
