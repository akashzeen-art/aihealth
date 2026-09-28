import { LOCAL_DISCLAIMERS } from '../local/disclaimers'
import { withApi, type ApiCallOptions } from './apiClient'
import type { DisclaimerResponse } from '../types'

export async function getDisclaimers(options?: ApiCallOptions): Promise<DisclaimerResponse> {
  return withApi(() => LOCAL_DISCLAIMERS, {
    delayMs: options?.delayMs ?? 60,
    signal: options?.signal,
  })
}
