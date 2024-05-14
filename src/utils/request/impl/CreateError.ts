/**
 * 错误类型自定义
 * @param {*} option
 */
interface optionObj {
  code: number | string
  message: string
  value: unknown
  columnName: string
}

export class CreateError extends Error {
  code: number | string
  errCode: number | string
  value: unknown
  columnName: string
  constructor(option: optionObj) {
    super()
    this.code = option.code
    this.errCode = option.code
    this.message = option.message
    this.value = option.value
    this.columnName = option.columnName
    console.log("🚀 ~ CreateError ~ constructor ~ this:", this)
  }
}