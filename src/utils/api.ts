import axios, { AxiosRequestConfig, AxiosInstance } from 'axios'

const env = process.env

const masterConfig: AxiosRequestConfig = {
  baseURL: env.BET_URL || '',
  timeout: 15000
}

export const apiMaster: AxiosInstance = axios.create({
  ...masterConfig
})
