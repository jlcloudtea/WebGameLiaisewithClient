import { db } from '../src/lib/db'

/**
 * Seed script for "Scope Creep & Paper Trails"
 * 
 * This script populates the database with the 'Bark & Byte' dog daycare scenario.
 * The game teaches ICT students how to manage client requirements and avoid common traps.
 * 
 * SCORING GUIDE PER ROUND:
 * 
 * Round 1 - Initial Request:
 *   CORRECT: Document 'service' and 'timeframe' in a Confirmation document.
 *   Students should capture WHAT the client wants and WHEN they want it.
 *   Award 10 points if both fields are present.
 * 
 * Round 2 - Verbal Trap (Scope Creep):
 *   CORRECT: Recognize the scope creep (mic, power boards) and document them
 *   in an Additional/Amendment document. They should ALSO amend the original document.
 *   Award 5 points for documenting the new items.
 *   Deduct 10 points if they didn't update the original (amendOriginal must be true).
 *   LESSON: Never accept verbal additions without documentation. Always amend originals.
 * 
 * Round 3 - Verbal Approval Trap:
 *   CORRECT: Recognize that verbal approval is NOT sufficient. Generate a proper
 *   Approval document with 'standard', 'price', 'time', and 'ongoing' fields.
 *   Award 20 points if all four fields are documented.
 *   Deduct 15 points if they accepted verbal approval (writtenApproval must be false).
 *   LESSON: Verbal approvals are not legally binding. Always get written sign-off.
 * 
 * Round 4 - Training Skip Trap:
 *   CORRECT: Recognize that skipping training is a trap. Document a Training plan
 *   with at least one training type selected and support details.
 *   Award 15 points if at least one training checkbox is selected and support details provided.
 *   Deduct 10 points if no training types are selected.
 *   LESSON: Never skip training delivery - it's part of professional service.
 * 
 * Round 5 - User Documentation:
 *   CORRECT: Provide user documentation. Select documentation types and add specifics.
 *   Award 15 points if at least one doc type is selected and specifics are provided.
 *   LESSON: Always provide user documentation for handover.
 */

const ROUND_MESSAGES = [
  {
    round: 1,
    content: "We need new computers and a camera system ASAP. Let's do this!",
    isVerbalTrap: false,
    // Correct response: Document service (computers + camera system) and timeframe (ASAP/specific date)
  },
  {
    round: 2,
    content: "Hey, by the way, since you're doing the cameras, can you add a mic to the entrance? Also, we might need a couple of extra power boards. It's just a small thing, right?",
    isVerbalTrap: true,
    // Correct response: Document the mic & power boards as additions, AND amend the original document
    // This is a classic scope creep trap - the client tries to add items verbally
  },
  {
    round: 3,
    content: "Looks good, you can start the work now.",
    isVerbalTrap: true,
    // Correct response: Do NOT accept verbal approval. Generate a formal Approval document.
    // The client is giving verbal approval, which is not legally binding
  },
  {
    round: 4,
    content: "Just drop off the equipment, we know how to use iPads, we'll figure the rest out.",
    isVerbalTrap: true,
    // Correct response: Do NOT skip training. Create a Training document.
    // The client wants to skip training - this is a trap to avoid professional responsibility
  },
  {
    round: 5,
    content: "The system is installed! How will our staff know how to use it?",
    isVerbalTrap: false,
    // Correct response: Provide User Documentation. Select documentation types and add specifics.
    // This is not a trap - the client genuinely needs documentation
  },
]

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing data
  await db.playerDocument.deleteMany()
  await db.clientMessage.deleteMany()
  await db.gameSession.deleteMany()
  await db.team.deleteMany()

  // Create a demo team
  const demoTeam = await db.team.create({
    data: {
      name: 'Demo Team',
      password: 'demo123',
      score: 0,
    },
  })

  // Create a game session for the demo team
  const gameSession = await db.gameSession.create({
    data: {
      currentRound: 1,
      isComplete: false,
      teamId: demoTeam.id,
    },
  })

  // Insert all round messages
  for (const msg of ROUND_MESSAGES) {
    await db.clientMessage.create({
      data: {
        content: msg.content,
        round: msg.round,
        isVerbalTrap: msg.isVerbalTrap,
        gameSessionId: gameSession.id,
      },
    })
  }

  console.log(`✅ Created team: ${demoTeam.name} (id: ${demoTeam.id})`)
  console.log(`✅ Created game session (id: ${gameSession.id})`)
  console.log(`✅ Inserted ${ROUND_MESSAGES.length} client messages`)
  console.log('🎉 Seeding complete!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
