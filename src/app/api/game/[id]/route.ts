import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const gameSession = await db.gameSession.findUnique({
      where: { id },
      include: {
        messages: true,
        documents: true,
        team: {
          select: {
            id: true,
            name: true,
            score: true,
          },
        },
      },
    })

    if (!gameSession) {
      return NextResponse.json(
        { error: 'Game session not found' },
        { status: 404 }
      )
    }

    // Return the full game session object so the frontend can access
    // .messages, .documents, .currentRound, .isComplete directly
    return NextResponse.json(gameSession)
  } catch (error) {
    console.error('Error fetching game state:', error)
    return NextResponse.json(
      { error: 'Failed to fetch game state' },
      { status: 500 }
    )
  }
}
