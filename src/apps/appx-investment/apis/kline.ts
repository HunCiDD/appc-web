import { investmentRequest } from '@/apps/appx-investment/utils/request'
import type { KLineData } from '@/apps/appx-investment/types/kline'

const BASE_URL = '/v1/investment'

enum API_URL {
  KLINE_DATA = `${BASE_URL}/kline`,
}

export const klineApi = {
  // 获取K线数据
  getKLineData: (params: {
    symbol: string;
    startTime: string;
    endTime: string;
    interval: string
  }) =>
    investmentRequest.get<KLineData[]>(API_URL.KLINE_DATA, params),
}