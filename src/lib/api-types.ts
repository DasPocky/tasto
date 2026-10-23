// Gemeinsame Typen für Frontend und Worker-API.

import type { KeyEvent } from './typing'

export interface ApiResponse<T> {
  data: T
}

export interface ApiError {
  error: string
}

export interface TestDto {
  id: string
  language: string
  /** Dauer in Sekunden */
  period: number
  text: string
}

export interface PerformanceSummary {
  id: string
  score: number
  wpm: number
  cpm: number
  accuracy: number
  fixed: number
  createdAt: number
}

export interface PerformanceDto extends PerformanceSummary {
  test: TestDto
  events: KeyEvent[]
}

export type LeaderboardSort = 'top' | 'latest'
