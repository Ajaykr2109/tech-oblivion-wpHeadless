import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

import { verifySession, type SessionClaims } from '@/lib/jwt'
import { getSettings, updateSettings } from '@/lib/settings'

// GET /api/admin/editor-picks - Get current editor picks
export async function GET() {
  // Verify authentication and permissions
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(process.env.SESSION_COOKIE_NAME ?? 'session')
  
  if (!sessionCookie?.value) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let claims: SessionClaims
  try {
    claims = (await verifySession(sessionCookie.value)) as SessionClaims
  } catch {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
  }

  // Check if user has admin permissions (editor+ can manage editor picks)
  const roles = claims.roles || []
  const canManageEditorPicks = roles.some((role: string) => 
    ['administrator', 'editor', 'seo_editor', 'seo_manager'].includes(role)
  )
  
  if (!canManageEditorPicks) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  try {
    const settings = await getSettings()
    const editorPicks = settings.editorPicks || []
    
    return NextResponse.json({ editorPicks })
  } catch (error) {
    console.error('Error fetching editor picks:', error)
    return NextResponse.json({ error: 'Failed to fetch editor picks' }, { status: 500 })
  }
}

// POST /api/admin/editor-picks - Update editor picks
export async function POST(req: NextRequest) {
  // Verify authentication and permissions
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(process.env.SESSION_COOKIE_NAME ?? 'session')
  
  if (!sessionCookie?.value) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let claims: SessionClaims
  try {
    claims = (await verifySession(sessionCookie.value)) as SessionClaims
  } catch {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
  }

  // Check if user has admin permissions (editor+ can manage editor picks)
  const roles = claims.roles || []
  const canManageEditorPicks = roles.some((role: string) => 
    ['administrator', 'editor', 'seo_editor', 'seo_manager'].includes(role)
  )
  
  if (!canManageEditorPicks) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { editorPicks } = body

    // Validate the input
    if (!Array.isArray(editorPicks)) {
      return NextResponse.json({ error: 'editorPicks must be an array' }, { status: 400 })
    }

    // Validate each post ID is a number
    const validPicks = editorPicks.filter(id => typeof id === 'number' && id > 0)
    
    if (validPicks.length !== editorPicks.length) {
      return NextResponse.json({ error: 'All editor picks must be valid post IDs' }, { status: 400 })
    }

    // Limit to maximum 6 editor picks
    if (validPicks.length > 6) {
      return NextResponse.json({ error: 'Maximum 6 editor picks allowed' }, { status: 400 })
    }

    // Update settings
    await updateSettings({ editorPicks: validPicks })
    
    return NextResponse.json({ 
      success: true, 
      editorPicks: validPicks,
      message: `Updated ${validPicks.length} editor picks successfully`
    })
  } catch (error) {
    console.error('Error updating editor picks:', error)
    return NextResponse.json({ error: 'Failed to update editor picks' }, { status: 500 })
  }
}