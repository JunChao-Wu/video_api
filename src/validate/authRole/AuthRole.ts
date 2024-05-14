import { dataRoleObj } from '../../utils/request/ValidateUtil'
import { ModelMaker, roleObj } from '../../utils/request/ModelMaker'

export class AuthRole {
  static get login(): dataRoleObj {
    return {
      targetRole: {
        userName: AuthModel.userName,
        password: AuthModel.password,
      },
      isReturn: true,
    }
  }
  static get refreshToken(): dataRoleObj {
    return {
      targetRole: {
        rt: AuthModel.rt,
      },
      isReturn: true,
    }
  }
}

class AuthModel {
  static get rt(): roleObj {
    return new ModelMaker().string().required().keys()
  }
  static get userName(): roleObj {
    return new ModelMaker().string().required().keys()
  }
  static get password(): roleObj {
    return new ModelMaker().string().required().keys()
  }
}