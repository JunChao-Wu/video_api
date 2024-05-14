
type resultType = {
  succ: boolean;
  statusCode?: number;
  message?: string;
  errCode?: string | number;
  data?: any;
}

export class BaseController {
  constructor() {}

  makeBaseResult (): resultType {
    return {
      succ: false,
      statusCode: 502,
      message: "系统异常",
    };
  }

  makeSuccessResult (response: resultType, methodDesc: string): resultType {
    let data = null;
    if (response && response.succ) {
      data = response.data;
    }
    return {
      succ: true,
      statusCode: 200,
      message: `${methodDesc}成功!`,
      data: data,
    };
  }

  makeErrorResult (e: any, methodDesc: string): resultType {
    const errMessage = e.message || `${methodDesc}失败!`;
    const errCode = e.errCode || e.statusCode;
    return {
      succ: false,
      statusCode: 500,
      errCode,
      message: errMessage,
    };
  }

}