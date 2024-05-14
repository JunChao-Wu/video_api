import { Controller, Get, Post, UnauthorizedException, UseGuards } from '@nestjs/common'

import { BASE_ROUTE, API } from '../routes/Routes'
import { Validate } from 'src/decorator/validate.decorator'
import { UserRole } from "../validate/userRole/UserRole";
import * as userRole_d from "../validate/userRole/userRole_d";
import { BaseController } from './impl/base.controller';
import { UsersService } from "../service/db_video/users.service";
import { TokenService } from 'src/service/token.service';
import { sha256 } from '../utils/cryptoUtil';
import { AuthGuard } from 'src/guards/auth.guard';
import { AuthRole } from 'src/validate/authRole/AuthRole';
import { refreshToken } from 'src/validate/authRole/authRole_d';
import { baseRole } from 'src/validate/baseRole_d';


@Controller(BASE_ROUTE.auth)
export class AuthController extends BaseController {
  constructor(
    private usersService: UsersService,
    private tokenService: TokenService,
  ) {
    super()
  }
  @Post(API.auth.login_post)
  async login (@Validate(UserRole.login) reqClone: userRole_d.login): Promise<object> {
    const { userName, password } = reqClone;
    console.log("🚀 ~ AuthController ~ login ~ reqClone:", reqClone)
    const _password = sha256(sha256(password));
    let result = this.makeBaseResult();
    try {
      const user = await this.usersService.findByName(userName, _password);
      if (!user) {
        throw new Error("登录失败")
      }
      const tokens = await this.tokenService.issueToken({
        userId: (user?.user_id || "") + "",
      })

      result = this.makeSuccessResult({ succ: true, data: {
        id: user?.user_id,
        email: user?.user_email,
        userName: user?.user_name,
        ...tokens
      }}, "login");
    } catch (error) {
      result = this.makeErrorResult(error, "login");
    }
    return result;
  }

  
  @UseGuards(AuthGuard)
  @Get(API.auth.token_get)
  async getToken (): Promise<object> {
    const token = await this.tokenService.getToken({})
    return {
      success: true,
      data: {
        token
      },
      code: 200,
    }
  }
  
  @Get(API.auth.refresh_get)
  async refreshToken(@Validate(AuthRole.refreshToken) reqClone: refreshToken) {
    let result = this.makeBaseResult();
    try {
      if (reqClone.rt) {
        const tokens = await this.tokenService.refreshToken(reqClone.rt)
        result = this.makeSuccessResult({succ: true, data: {
          ...tokens
        }}, "rt")
      } else {
        throw new UnauthorizedException();
      }
    } catch (error) {
      result = this.makeErrorResult({errorCode: 401, errMessage: "无权限"}, "rt");
    }
    return result;
  }
  
  @UseGuards(AuthGuard)
  @Get(API.auth.checkRole_get)
  async checkUserRole(@Validate() reqClone: baseRole) {
    console.log("🚀 ~ AuthController ~ checkUserRole ~ reqClone:", reqClone)
    let result = this.makeBaseResult();
    try {
      // 现在只需要判断authId是不是id=1
      if (reqClone.user && reqClone.user?.authId && reqClone.user?.authId === 1) {
        result = this.makeSuccessResult({succ: true, data: {
          pass: true
        }}, "checkUserRole");
      }
    } catch (error) {
      result = this.makeErrorResult(error, "rt");
    }
    return result;
  }
}