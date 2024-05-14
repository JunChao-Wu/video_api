import { Injectable } from '@nestjs/common';
import { db_video } from "../../utils/db_client/db_video";


@Injectable()
export class UsersService {
  #users;
  constructor () {
    this.#users = db_video.user;
  }

  async findById (userId: number) {
    const result = await this.#users.findFirst({
      where: {
        user_id: userId
      },
      select: {
        user_id: true,
        user_name: true,
        user_role_id: true,
        user_email: true,
        timezone: true,
      }
    });
    return result;
  }

  async findByIds (userIds: number[]) {
    const result = await this.#users.findMany({
      where: {
        user_id: {
          in: userIds
        }
      },
      select: {
        user_id: true,
        user_name: true,
        user_role_id: true,
        user_email: true,
        timezone: true,
      }
    });
    return result;
  }

  async findByName (name: string, password: string) {
    const result= await this.#users.findFirst({
      select: {
        // id: true,
        user_id: true,
        user_name: true,
        user_email: true,
      },
      where: {
        user_name: name,
        user_password: password,
      }
    });
    return result;
  }
}
