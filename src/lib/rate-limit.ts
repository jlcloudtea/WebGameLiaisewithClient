/**
 * Simple in-memory rate limiter for Vercel serverless functions.
 *
 * Each Vercel function invocation gets its own memory, so this won't
 * persist across invocations — but it still helps against rapid-fire
 * attacks within a single cold start lifecycle.
 *
 * For robust production rate limiting, consider Upstash Redis.
 */

const requestMap = new Map<string, { count: number; resetAt: number }>()

const MAX_REQUESTS = 5
const WINDOW_MS = 60_000 // 1 minute

export function checkRateLimit(key: string): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now()
  const entry = requestMap.get(key)

  if (!entry || now > entry.resetAt) {
    requestMap.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return { allowed: true, retryAfterMs: 0 }
  }

  if (entry.count >= MAX_REQUESTS) {
    return { allowed: false, retryAfterMs: entry.resetAt - now }
  }

  entry.count++
  return { allowed: true, retryAfterMs: 0 }
}

// Maximum records allowed in the database to prevent abuse
const MAX_TEAMS = 200
const MAX_GAME_SESSIONS = 1000

export async function checkDbLimits(): Promise<{ allowed: boolean; reason?: string }> {
  const teamCount = await db.team.count()
  if (teamCount >= MAX_TEAMS) {
    return { allowed: false, reason: 'Maximum number of teams reached. Please contact the administrator.' }
  }

  const sessionCount = await db.gameSession.count()
  if (sessionCount >= MAX_GAME_SESSIONS) {
    return { allowed: false, reason: 'Maximum number of game sessions reached. Please contact the administrator.' }
  }

  return { allowed: true }
}

// Lazy import to avoid circular deps
import { db } from '@/lib/db'
