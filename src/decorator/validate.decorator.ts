import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { ValidateUtil, dataRoleObj } from '../utils/request/ValidateUtil'

// 该装饰器目的在于代替@Body和@Param, 用于根据role配置校验并返回请求参数
export const Validate: any = createParamDecorator((role: dataRoleObj = {isReturn: true, targetRole: {}}, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest()
  const method = request.method
  const param = method === 'GET' ? request.query : request.body || {}
  return ValidateUtil.validate(param, role)
})
