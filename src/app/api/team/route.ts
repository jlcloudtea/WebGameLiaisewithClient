import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, password } = body

    if (!name || !password) {
      return NextResponse.json(
        { error: 'Team name and password are required' },
        { status: 400 }
      )
    }

    // Check if team name already exists
    const existingTeam = await db.team.findUnique({
      where: { name },
    })

    if (existingTeam) {
      return NextResponse.json(
        { error: 'Team name already exists' },
        { status: 409 }
      )
    }

    const team = await db.team.create({
      data: {
        name,
        password,
        score: 0,
      },
    })

    // Return team directly so frontend can access teamData.id
    return NextResponse.json(team, { status: 201 })
  } catch (error) {
    console.error('Error creating team:', error)
    return NextResponse.json(
      { error: 'Failed to create team' },
      { status: 500 }
    )
  }
}
