import moment from 'moment-timezone'
import cron from 'node-cron'
import { v4 as uuidv4 } from 'uuid'
import Logger from '../logger'

interface InitOptions {
  invokeOnInitialization?: boolean
  identifier?: string
  isAsync?: boolean
}

interface InvokeOptions {
  replaceStoredArgs?: boolean
}

export default class Scheduler {
  constructor(
    interval: string = '* * * * *',
    task: any = () => { },
    taskParameters: any | any[] = undefined,
    { invokeOnInitialization = false, identifier = uuidv4(), isAsync = false }: InitOptions
  ) {
    this._task = task
    this._taskParameter = taskParameters
    this._interval = interval
    this._isAsync = isAsync

    const timeLog = moment.tz('Asia/Taipei').toISOString()
    this._initTimeLog = timeLog

    if (identifier !== undefined) {
      this._identifier = `${timeLog}_${identifier}`
    } else {
      this._identifier = `${timeLog}_${uuidv4()}`
    }

    if (invokeOnInitialization) {
      this.invokeTaskWithParamsCheck()
    }

    this.generateJob()
  }

  private _interval: string = ''

  private _task: (args?: any) => Promise<any> | any

  private _taskParameter: any[] | any

  private _identifier: string

  private _initTimeLog: string

  private _isAsync: boolean

  public get task() {
    return this._task.valueOf()
  }

  public get interval() {
    return this._interval
  }

  public get identifier() {
    return this._identifier
  }

  public get initializedTime() {
    return this._initTimeLog
  }

  private static async runWithAsyncAssumption(isAsync: boolean, func: (args?: any) => Promise<any> | any, args?: any | any[]) {
    if (isAsync) {
      if (args instanceof Array) {
        await func.call(null, [...args])
      } else {
        await func.call(null, args)
      }
    } else {
      if (args instanceof Array) {
        func.call(null, [...args])
      } else {
        func.call(null, args)
      }
    }
  }

  private async invokeTaskWithParamsCheck() {
    await Scheduler.runWithAsyncAssumption(this._isAsync, this._task, this._taskParameter)
  }

  private async invokeTaskWithReplacingParamsCheck(args: any | any[]) {
    await Scheduler.runWithAsyncAssumption(this._isAsync, this._task, args)
  }

  private generateJob() {
    if (this._isAsync) {
      cron.schedule(this.interval, async () => {
        await this.invokeTaskWithParamsCheck()
      })
    } else {
      cron.schedule(this.interval, () => {
        this.invokeTaskWithParamsCheck()
      })
    }
    Logger.generateTimeLog({
      label: Logger.Labels.JOB,
      message: `${this.identifier} has initialized on... ${this._initTimeLog}`
    })
  }

  public async invokeTask(replacingArgs: any | any[], { replaceStoredArgs }: InvokeOptions) {
    if (replaceStoredArgs && replacingArgs instanceof Array) {
      this._taskParameter = [...replacingArgs]
    } else if (replaceStoredArgs && replacingArgs) {
      this._taskParameter = replacingArgs
    } else if (replaceStoredArgs) {
      this._taskParameter = null
    }

    if (replacingArgs) {
      await this.invokeTaskWithReplacingParamsCheck(replacingArgs)
    } else {
      await this.invokeTaskWithParamsCheck()
    }
  }
}
