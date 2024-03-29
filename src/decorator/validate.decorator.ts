import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { ValidateUtil } from '../utils/request/ValidateUtil'

// 该装饰器目的在于代替@Body和@Param, 用于根据role配置校验并返回请求参数
export const Validate = createParamDecorator((role, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest()
  const method = request.method
  const param = method === 'POST' ? request.body : request.params || {}
  return ValidateUtil.validate(param, role)
})
