// 白名单配置项

// 注意白名单的属性必须唯一且不为请求参数,
// 通常是由中间件处理的后续业务用到的常用数据

// 有新的需要就往数组添加
export const whiteListConfig: string[] = ["http", "user", "requestId"]
