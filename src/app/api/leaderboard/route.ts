import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Fetch all completed game sessions with their teams
    const completedSessions = await db.gameSession.findMany({
      where: { isComplete: true },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            score: true,
          },
        },
      },
    })

    // Map to leaderboard entries and sort by score descending
    // Return as an array directly so frontend can iterate
    const leaderboard = completedSessions
      .map((session) => ({
        teamId: session.team.id,
        teamName: session.team.name,
        score: session.team.score,
        completedAt: session.updatedAt,
      }))
      .sort((a, b) => b.score - a.score)

    return NextResponse.json(leaderboard)
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }
}
