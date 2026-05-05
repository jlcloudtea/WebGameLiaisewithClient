import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { teamId } = body

    if (!teamId) {
      return NextResponse.json(
        { error: 'Team ID is required' },
        { status: 400 }
      )
    }

    // Verify team exists
    const team = await db.team.findUnique({
      where: { id: teamId },
    })

    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      )
    }

    // Check if team already has an active (incomplete) session
    const activeSession = await db.gameSession.findFirst({
      where: {
        teamId,
        isComplete: false,
      },
    })

    if (activeSession) {
      return NextResponse.json(
        { error: 'Team already has an active game session' },
        { status: 409 }
      )
    }

    // Create the game session with all 5 client messages
    const gameSession = await db.gameSession.create({
      data: {
        currentRound: 1,
        isComplete: false,
        teamId,
        messages: {
          create: [
            {
              content:
                "We need new computers and a camera system ASAP. Let's do this!",
              round: 1,
              isVerbalTrap: false,
            },
            {
              content:
                "Hey, by the way, since you're doing the cameras, can you add a mic to the entrance? Also, we might need a couple of extra power boards. It's just a small thing, right?",
              round: 2,
              isVerbalTrap: true,
            },
            {
              content: "Looks good, you can start the work now.",
              round: 3,
              isVerbalTrap: true,
            },
            {
              content:
                "Just drop off the equipment, we know how to use iPads, we'll figure the rest out.",
              round: 4,
              isVerbalTrap: true,
            },
            {
              content:
                "The system is installed! How will our staff know how to use it?",
              round: 5,
              isVerbalTrap: false,
            },
          ],
        },
      },
      include: {
        messages: true,
        documents: true,
      },
    })

    // Return the session directly so frontend can access gameData.id
    return NextResponse.json(gameSession, { status: 201 })
  } catch (error) {
    console.error('Error starting game:', error)
    return NextResponse.json(
      { error: 'Failed to start game' },
      { status: 500 }
    )
  }
}
