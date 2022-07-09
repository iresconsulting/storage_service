import moment from "moment"
import Logger from "~/src/utils/logger"

export function isRowsExist(rows: Array<any> | undefined): boolean {
  if (rows) {
    return true
  }
  return false
}

export function genDateNowWithoutLocalOffset(): string {
  return moment(Logger.LOG_TIMEZONE).toISOString(false)
}

export function genDateNowWithLocalOffset(): string {
  return moment(Logger.LOG_TIMEZONE).toISOString(true)
}

export function arrToPgArr(arr: Array<any>): string {
  const arrToStr = JSON.stringify(arr)
  let arrToPgArr = arrToStr.replace('[', '{')
  arrToPgArr = arrToPgArr.replace(']', '}')
  arrToPgArr = arrToPgArr.replaceAll(':', ',')
  return arrToPgArr
}

export function arrItemToPgArrItem(item: any): string {
  const toStr = JSON.stringify(item)
  let arrItemToPgArrItem = toStr.replaceAll(':', ',')
  return arrItemToPgArrItem
}

export function pgArrToArr(pgArr: string): Array<any> {
  let res = pgArr.replace("{", "[");
  res = res.replace("}", "]");
  return JSON.parse(res)  //[1, 2, 3, 4]r
  // const match = pgArr.match(/[\w.-]+/g)
  // if (match) {
  //   return match.map(Number)
  // }
  // return []
}

export function pgArrToArr2(pgArr: Array<Array<string>>): Array<any> {
  return pgArr.map((item: Array<string>) => {
    const obj: { [index: string]: any } = {}
    if (item.length >= 2) {
      for (let i = 0; i < item.length; i += 2) {
        obj[item[i]] = item[i + 1]
      }
    }
    return obj
  })
}
