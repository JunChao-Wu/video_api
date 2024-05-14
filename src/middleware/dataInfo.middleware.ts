import { Request, Response, NextFunction } from "express";
import { baseRole } from "../validate/baseRole_d";
import { v4 as uuidv4 } from "uuid";
import { Injectable, NestMiddleware } from "@nestjs/common";
import { RedisService } from "src/service/redis/redis.service";
import { minCacheKeyGenerator } from "src/service/redis/impl/keyGenerator";
import { UsersService } from "src/service/db_video/users.service";

@Injectable()
export class DataInfoMiddleware implements NestMiddleware {
  constructor(
    private readonly redisService: RedisService,
    private readonly usersService: UsersService,

  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    console.log('🚀 ~ DataInfoMiddleware...');
    const param: baseRole = req.method === "GET" ? req.query : req.body;
    const header = req.headers;
    const ip = req.ip;
    param.http = {
      ip: ip,
      // header: header
    }
  
    if (header.user) {
      const cacheKey = minCacheKeyGenerator(header.user + "")
      // 先拿缓存
      let user: any = await this.redisService.getCache(cacheKey);
      if (!user) {
        // 没就查库
        user = await this.usersService.findById(+header.user)
        this.redisService.setCache(cacheKey, user)
      }
      if (!user) {
        throw new Error("用户信息错误")
      }
      param.user = {
        id: user?.user_id,
        name: user?.user_name,
        email: user?.user_email,
        authId: user?.user_role_id,
        timezone: user?.timezone,
      }
    }
    param.requestId = uuidv4().replace(/-/g, "");
    next();
  }
}
