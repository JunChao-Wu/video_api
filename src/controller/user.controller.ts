import { Controller, Post } from '@nestjs/common'

import { BASE_ROUTE, API } from '../routes/Routes'
import { Validate } from 'src/decorator/validate.decorator'
import { UserRole } from "../validate/userRole/UserRole";
import * as userRole_d from "../validate/userRole/userRole_d";
import { BaseController } from './impl/base.controller';

import { UsersService } from "../service/db_video/users.service";
import { TokenService } from 'src/service/token.service';
import { sha256 } from '../utils/cryptoUtil';


@Controller(BASE_ROUTE.user)
export class UserController extends BaseController {
  constructor(
    private usersService: UsersService,
    private tokenService: TokenService,
  ) {
    super()
  }

  @Post(API.user.login_post)
  async login (@Validate(UserRole.login) reqClone: userRole_d.login): Promise<object> {
    const { userName, password } = reqClone;
    const _password = sha256(sha256(password));
    let result = this.makeBaseResult();
    try {
      const user = await this.usersService.findByName(userName, _password);
      if (!user) {
        throw new Error("登录失败")
      }
      const tokens = await this.tokenService.issueToken({
        userId: user!.user_id + "",
      })
      result = this.makeSuccessResult({ succ: true, data: {
        id: user.user_id,
        email: user.user_email,
        userName: user.user_name,
        ...tokens
      }}, "login");
    } catch (error) {
      result = this.makeErrorResult(error, "login");
    }
    return result;
  }
}