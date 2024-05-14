
import * as jwt from 'jsonwebtoken';
import { tokenCommon } from 'src/common/common'
import { _redis } from '../redis/redis' 

export class Token {
  private expiredTime: number
  private secretKey: string
  private redis;
  constructor(options?: optionsType) {
    this.expiredTime = options?.expiredTime || tokenCommon.expiredTime;
    this.secretKey = options?.secretKey || tokenCommon.sercetKey;
    this.redis = _redis;
  }

  async issueToken(payload: payloadType) {
    payload!.iat = Math.floor(Date.now() / 1000) + this.expiredTime;
    const token = jwt.sign(payload, this.secretKey);
    await this.redis.setKey(token, JSON.stringify(payload), this.expiredTime);
    payload.action = "refresh";
    const refreshToken = jwt.sign(JSON.parse(JSON.stringify(payload)), this.secretKey)
    await this.redis.setKey(refreshToken, JSON.stringify(payload), this.expiredTime * 280 * 7)
    return {
      token,
      refreshToken,
    };
  }

  async extraToken(payload: payloadType) {
    const expiredTime = this.expiredTime / 5;
    payload!.iat = Math.floor(Date.now() / 1000) + expiredTime;
    payload.action = "extra";
    const token = jwt.sign(payload, this.secretKey);
    await this.redis.setKey(token, JSON.stringify(payload), this.expiredTime / 5)
    return token;
  }

  verifyToken(token: string): Promise<unknown> | void {
    if (!token) {
      return;
    }
    return new Promise(async (resolve) => {
      try {
        const payload = await this.redis.getKey(token);
        if (!payload) {
          console.log("token not exist!");
          resolve({})
        }
        console.log("token exist!");
        resolve(JSON.parse(payload as string))
      } catch (error) {
        const _payload = await this._verifyToken(token);
        console.log("token not exist! and jwt verify!");
        resolve(_payload);
      }
    })
  }

  private _verifyToken(token: string) {
    return new Promise((resolve, reject) => {
      jwt.verify(token, this.secretKey, (err, payload) => {
        if (err) {
          console.log("verify token faild");
          reject(err);
        }
        console.log("verify token success");
        resolve(payload);
        this.redis.setKey(token, JSON.stringify(payload), this.expiredTime)
      });
    })
  }

  refreshToken (rt: string): Promise<{token: string, refreshToken: string}> {
    return new Promise(async (resolve, reject) => {
      const payload = await this.verifyToken(rt) as payloadType;
      console.log("🚀 ~ Token ~ returnnewPromise ~ payload:", payload)
      if (!payload) {
        reject("----------------无权限------------------")
      }
      if (payload.action && payload.action === "refresh") {
        const tokens = await this.issueToken(payload);
        resolve(tokens);
      } else {
        reject("----------------无权限------------------")
      }
    })
  }
}

type optionsType = {
  expiredTime: number;
  secretKey: string;
}

export type payloadType = {
  userId?: string | number;
  iat?: number;
  action?: "refresh" | "extra"
}
