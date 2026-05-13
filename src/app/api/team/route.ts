import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, checkDbLimits } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    // Rate limit: max 5 team creations per IP per minute
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const { allowed, retryAfterMs } = checkRateLimit(`team:${ip}`)
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment and try again.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) } }
      )
    }

    // Database size limit: prevent flooding
    const dbCheck = await checkDbLimits()
    if (!dbCheck.allowed) {
      return NextResponse.json({ error: dbCheck.reason }, { status: 503 })
    }

    const body = await request.json()
    const { name } = body

    // Input validation
    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Team name is required' },
        { status: 400 }
      )
    }

    // Sanitize: trim and limit length
    const sanitizedName = name.trim().slice(0, 50)

    if (sanitizedName.length < 2) {
      return NextResponse.json(
        { error: 'Team name must be at least 2 characters' },
        { status: 400 }
      )
    }

    // Block obvious spam patterns
    if (/^(test|spam|asdf|qwerty|aaa+|bbb+|xxx+|000+)$/i.test(sanitizedName)) {
      return NextResponse.json(
        { error: 'Please choose a more meaningful team name' },
        { status: 400 }
      )
    }

    // Check if team name already exists
    const existingTeam = await db.team.findUnique({
      where: { name: sanitizedName },
    })

    if (existingTeam) {
      return NextResponse.json(
        { error: 'Team name already exists' },
        { status: 409 }
      )
    }

    // Auto-generate a random password (not required from user)
    const autoPassword = Math.random().toString(36).slice(2, 10)

    const team = await db.team.create({
      data: {
        name: sanitizedName,
        password: autoPassword,
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
