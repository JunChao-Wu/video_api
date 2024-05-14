import { dataRoleObj } from '../../utils/request/ValidateUtil'
import { ModelMaker, roleObj } from '../../utils/request/ModelMaker'

export class UserRole {
  static get login(): dataRoleObj {
    return {
      targetRole: {
        userName: UserModel.userName,
        password: UserModel.password,
      },
      isReturn: true,
    }
  }
}

class UserModel {
  static get userName(): roleObj {
    return new ModelMaker().string().required().keys()
  }
  static get password(): roleObj {
    return new ModelMaker().string().required().keys()
  }
}