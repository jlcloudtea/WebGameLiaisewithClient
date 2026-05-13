import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// Auto-cleanup: delete all game data older than 90 days (3 months)
// Called weekly by cron-job.org to keep the database clean
const CLEANUP_OLDER_THAN_DAYS = 90

export async function GET(request: NextRequest) {
  try {
    // Verify secret key to prevent unauthorized cleanup
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    const secretKey = process.env.CLEANUP_SECRET || 'scope-creep-cleanup-2025'

    if (token !== secretKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - CLEANUP_OLDER_THAN_DAYS)

    // Delete in correct order (child tables first due to foreign keys)

    // 1. Delete old PlayerDocuments
    const deletedDocs = await db.playerDocument.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
      },
    })

    // 2. Delete old ClientMessages
    const deletedMessages = await db.clientMessage.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
      },
    })

    // 3. Delete old GameSessions (only those with no remaining children)
    const deletedSessions = await db.gameSession.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
        documents: { none: {} },
        messages: { none: {} },
      },
    })

    // 4. Delete Teams that have no remaining sessions
    const deletedTeams = await db.team.deleteMany({
      where: {
        sessions: { none: {} },
      },
    })

    const result = {
      status: 'ok',
      cutoffDate: cutoffDate.toISOString(),
      olderThanDays: CLEANUP_OLDER_THAN_DAYS,
      deleted: {
        playerDocuments: deletedDocs.count,
        clientMessages: deletedMessages.count,
        gameSessions: deletedSessions.count,
        teams: deletedTeams.count,
      },
      timestamp: new Date().toISOString(),
    }

    console.log('🧹 Cleanup completed:', JSON.stringify(result))
    return NextResponse.json(result)
  } catch (error) {
    console.error('Cleanup failed:', error)
    return NextResponse.json({ status: 'error', message: 'Cleanup failed' }, { status: 500 })
  }
}
