import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Simple query to keep the Neon database active
    await db.$queryRaw`SELECT 1`
    return NextResponse.json({ status: 'ok', timestamp: new Date().toISOString() })
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json({ status: 'error', message: 'Database connection failed' }, { status: 500 })
  }
}
