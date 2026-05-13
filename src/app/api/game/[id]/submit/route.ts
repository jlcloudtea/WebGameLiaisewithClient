import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/rate-limit'

interface RoundScore {
  scoreEarned: number
  feedback: string
}

function scoreRound1(content: Record<string, unknown>): RoundScore {
  let score = 0
  const feedbackParts: string[] = []

  const hasService = 'service' in content && String(content.service).trim() !== ''
  const hasTimeframe = 'timeframe' in content && String(content.timeframe).trim() !== ''

  if (hasService && hasTimeframe) {
    score = 10
    feedbackParts.push('Great job! You documented both the service scope and timeframe.')
  } else {
    if (!hasService) {
      score -= 5
      feedbackParts.push('Missing service description. Always clearly document what services are agreed upon.')
    }
    if (!hasTimeframe) {
      score -= 5
      feedbackParts.push('Missing timeframe. Always document project timelines in a confirmation document.')
    }
  }

  return { scoreEarned: score, feedback: feedbackParts.join(' ') }
}

function scoreRound2(content: Record<string, unknown>): RoundScore {
  let score = 0
  const feedbackParts: string[] = []

  const hasAdditionalRequirements =
    'additionalRequirements' in content &&
    String(content.additionalRequirements).trim() !== ''

  const hasAmendOriginal =
    'amendOriginal' in content && content.amendOriginal === true

  if (hasAdditionalRequirements) {
    score += 5
    feedbackParts.push('Good! You documented the additional requirements from the client.')
  } else {
    feedbackParts.push('You missed documenting the additional requirements. Scope changes must be recorded.')
  }

  if (hasAmendOriginal) {
    feedbackParts.push('Smart move amending the original document to reflect the changes.')
  } else {
    score -= 10
    feedbackParts.push(
      'Critical mistake! You did not amend the original document. Scope creep must be documented, and original documents MUST be updated to reflect changes.'
    )
  }

  return { scoreEarned: score, feedback: feedbackParts.join(' ') }
}

function scoreRound3(content: Record<string, unknown>): RoundScore {
  let score = 0
  const feedbackParts: string[] = []

  const hasStandard = 'standard' in content && String(content.standard).trim() !== ''
  const hasPrice = 'price' in content && String(content.price).trim() !== ''
  const hasTime = 'time' in content && String(content.time).trim() !== ''
  const hasOngoing = 'ongoing' in content && String(content.ongoing).trim() !== ''
  const hasWrittenApproval =
    'writtenApproval' in content && content.writtenApproval === true

  const allFieldsPresent = hasStandard && hasPrice && hasTime && hasOngoing

  if (allFieldsPresent) {
    score += 20
    feedbackParts.push('Excellent! Your approval document covers all the key areas: standard, price, time, and ongoing costs.')
  } else {
    const missing: string[] = []
    if (!hasStandard) missing.push('standard')
    if (!hasPrice) missing.push('price')
    if (!hasTime) missing.push('time')
    if (!hasOngoing) missing.push('ongoing costs')
    feedbackParts.push(`Missing key approval fields: ${missing.join(', ')}. An approval document should be comprehensive.`)
  }

  if (hasWrittenApproval) {
    feedbackParts.push('Well done insisting on written approval!')
  } else {
    score -= 15
    feedbackParts.push(
      'Critical error! You accepted verbal approval. Verbal approvals are NOT sufficient — always get written sign-off before proceeding.'
    )
  }

  return { scoreEarned: score, feedback: feedbackParts.join(' ') }
}

function scoreRound4(content: Record<string, unknown>): RoundScore {
  let score = 0
  const feedbackParts: string[] = []

  const trainingTypes = Array.isArray(content.trainingTypes)
    ? content.trainingTypes
    : []
  const hasSupportDetails =
    'supportDetails' in content && String(content.supportDetails).trim() !== ''

  if (trainingTypes.length > 0 && hasSupportDetails) {
    score += 15
    feedbackParts.push('Great! You included training types and support details. Training is essential for successful adoption.')
  } else {
    if (trainingTypes.length === 0) {
      score -= 10
      feedbackParts.push('No training types selected! Never skip training — it is critical for user adoption and risk mitigation.')
    }
    if (!hasSupportDetails) {
      feedbackParts.push('Missing support details. Always document what ongoing support will be provided.')
    }
  }

  return { scoreEarned: score, feedback: feedbackParts.join(' ') }
}

function scoreRound5(content: Record<string, unknown>): RoundScore {
  let score = 0
  const feedbackParts: string[] = []

  const documentationTypes = Array.isArray(content.documentationTypes)
    ? content.documentationTypes
    : []
  const hasSpecifics =
    'specifics' in content && String(content.specifics).trim() !== ''

  if (documentationTypes.length > 0 && hasSpecifics) {
    score += 15
    feedbackParts.push('Excellent! You provided user documentation with specific details. This ensures staff can effectively use the system.')
  } else {
    if (documentationTypes.length === 0) {
      feedbackParts.push('No documentation types selected. Always provide user documentation — it is essential for long-term success.')
    }
    if (!hasSpecifics) {
      feedbackParts.push('Missing specifics in documentation. Generic documentation is rarely helpful — be specific.')
    }
  }

  return { scoreEarned: score, feedback: feedbackParts.join(' ') }
}

const scoringFunctions: Record<number, (content: Record<string, unknown>) => RoundScore> = {
  1: scoreRound1,
  2: scoreRound2,
  3: scoreRound3,
  4: scoreRound4,
  5: scoreRound5,
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limit: max 5 submissions per IP per minute
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const { allowed, retryAfterMs } = checkRateLimit(`submit:${ip}`)
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment and try again.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) } }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { documentType, content } = body

    if (!documentType || content === undefined) {
      return NextResponse.json(
        { error: 'Document type and content are required' },
        { status: 400 }
      )
    }

    // Fetch the game session
    const gameSession = await db.gameSession.findUnique({
      where: { id },
      include: { team: true },
    })

    if (!gameSession) {
      return NextResponse.json(
        { error: 'Game session not found' },
        { status: 404 }
      )
    }

    if (gameSession.isComplete) {
      return NextResponse.json(
        { error: 'Game session is already complete' },
        { status: 400 }
      )
    }

    const currentRound = gameSession.currentRound

    // Parse content if it's a string (frontend sends JSON.stringify(content))
    let parsedContent: Record<string, unknown>
    if (typeof content === 'string') {
      try {
        parsedContent = JSON.parse(content)
      } catch {
        parsedContent = {}
      }
    } else {
      parsedContent = content as Record<string, unknown>
    }

    // Score the submission
    const scoringFn = scoringFunctions[currentRound]
    if (!scoringFn) {
      return NextResponse.json(
        { error: 'Invalid round' },
        { status: 400 }
      )
    }

    const { scoreEarned, feedback } = scoringFn(parsedContent)

    // Create the PlayerDocument record
    const playerDocument = await db.playerDocument.create({
      data: {
        documentType,
        content: typeof content === 'string' ? content : JSON.stringify(content),
        roundSubmitted: currentRound,
        scoreEarned,
        feedback,
        gameSessionId: id,
      },
    })

    // Update team's cumulative score
    const newTeamScore = gameSession.team.score + scoreEarned
    await db.team.update({
      where: { id: gameSession.teamId },
      data: { score: newTeamScore },
    })

    // Update game session: advance round or complete the game
    if (currentRound < 5) {
      await db.gameSession.update({
        where: { id },
        data: { currentRound: currentRound + 1 },
      })
    } else {
      await db.gameSession.update({
        where: { id },
        data: { isComplete: true },
      })
    }

    // Fetch updated game state with all relations
    const updatedSession = await db.gameSession.findUnique({
      where: { id },
      include: {
        messages: true,
        documents: true,
      },
    })

    // Return in the shape the frontend expects: { document, gameSession }
    return NextResponse.json({
      document: playerDocument,
      gameSession: updatedSession,
    })
  } catch (error) {
    console.error('Error submitting document:', error)
    return NextResponse.json(
      { error: 'Failed to submit document' },
      { status: 500 }
    )
  }
}
