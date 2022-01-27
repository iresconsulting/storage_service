export default class HttpResponse {
  constructor(statusCode: number, statusMsg: string, data?: any) {
    this._statusCode = statusCode
    this._statusMsg = statusMsg
    if(data && data instanceof Array) this._data = [ ...data ]
    else if(data) this._data = { ...data }
  }

  private _statusCode: number

  private _statusMsg: string

  private _data?: any

  public get statusCode() {
    return this._statusCode
  }

  public get statusMsg() {
    return this._statusMsg
  }

  public get data() {
    return this._data
  }
}
