import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ error: 'temp route disabled' }, { status: 404 })
}
