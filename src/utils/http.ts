export default class HttpResponse {
  constructor(statusCode: number, statusMsg: string, data?: any) {
    this.statusCode = statusCode
    this.statusMsg = statusMsg
    if (data && data instanceof Array) this.data = [ ...data ]
    else if (data) this.data = { ...data }
  }

  private statusCode: number

  private statusMsg: string

  private data?: any
}
