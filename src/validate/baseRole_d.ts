

// 包含的就是白名单的属性结构
export interface baseRole {
  http?: {
    ip?: string;
    header?: object;
  };
  user?: userType,
  requestId: string,
}

type userType = {
  id?: number,
  name?: string,
  email?: string,
  authId?: number,
  timezone?: number,
}