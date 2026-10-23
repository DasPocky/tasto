import type { ApiError, ApiResponse, LeaderboardSort, PerformanceDto, PerformanceSummary, TestDto } from './api-types'
import type { KeyEvent } from './typing'

const API_BASE = `${import.meta.env.BASE_URL}api`

export class ApiRequestError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { 'content-type': 'application/json', ...init?.headers },
  })
  const body = (await res.json().catch(() => null)) as ApiResponse<T> | ApiError | null
  if (!res.ok || !body || 'error' in body) {
    throw new ApiRequestError(body && 'error' in body ? body.error : `Fehler ${res.status}`, res.status)
  }
  return body.data
}

export const api = {
  createTest: () => request<TestDto>('/tests', { method: 'POST' }),
  submitPerformance: (testId: string, events: KeyEvent[]) =>
    request<{ id: string }>(`/tests/${testId}/performances`, { method: 'POST', body: JSON.stringify({ events }) }),
  performance: (id: string) => request<PerformanceDto>(`/performances/${id}`),
  leaderboard: (sort: LeaderboardSort, limit = 20) =>
    request<PerformanceSummary[]>(`/performances?sort=${sort}&limit=${limit}`),
}
