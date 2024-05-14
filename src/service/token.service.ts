import { Injectable } from '@nestjs/common';

import { Token, payloadType } from 'src/utils/token/webToken'; 

@Injectable()
export class TokenService {
  private tokenGenerator;
  constructor(
  ) {
    this.tokenGenerator = new Token();
  }

  async issueToken(payload: payloadType) {
    const tokens = await this.tokenGenerator.issueToken(payload);
    return tokens;
  }

  async verifyToken(token: string) {
    const payload = await this.tokenGenerator.verifyToken(token);
    return payload;
  }

  async refreshToken (rt: string) {
    const tokens = await this.tokenGenerator.refreshToken(rt);
    return tokens;
  }

  async getToken(payload: payloadType) {
    const token = await this.tokenGenerator.extraToken(payload);
    return token;
  }

}

