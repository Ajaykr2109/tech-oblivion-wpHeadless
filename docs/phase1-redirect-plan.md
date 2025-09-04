# Phase 1: Redirect Rules and Route Planning

## Profile Route Strategy

### Current Routes:
- `/author/[slug]` ✅ (canonical - most feature complete)
- `/profile` ❌ (static page - needs dynamic mapping) 
- `/user/[slug]` ❌ (duplicate of author)
- `/wp/users/[slug]` ❌ (legacy WordPress style)

### Planned Redirects:

#### Static Redirects (next.config.ts):
```typescript
async redirects() {
  return [
    // Profile route duplicates → canonical author route
    {
      source: '/user/:slug',
      destination: '/author/:slug',
      permanent: false // 308 temporary redirect
    },
    {
      source: '/wp/users/:slug', 
      destination: '/author/:slug',
      permanent: false
    },
    // Blog routing consolidation
    {
      source: '/blogs/:path*',
      destination: '/blog/:path*',
      permanent: false
    },
    // Existing editor redirects (keep)
    { 
      source: '/editor/new', 
      destination: '/editor/new', 
      permanent: false 
    },
    { 
      source: '/editor/:id', 
      destination: '/editor/:id', 
      permanent: false 
    },
  ]
}
```

#### Dynamic Redirect (middleware.ts):
```typescript
// Handle /profile → /author/[my-slug] with session lookup
if (pathname === '/profile') {
  const sessionCookie = process.env.SESSION_COOKIE_NAME ?? 'session'
  const token = req.cookies.get(sessionCookie)?.value
  
  if (!token) {
    // Not logged in - redirect to login
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('next', '/profile')
    return NextResponse.redirect(loginUrl)
  }
  
  try {
    const claims = await verifySession(token) as {
      slug?: string
      username?: string
      [key: string]: unknown
    }
    
    const userSlug = claims.slug || claims.username
    if (userSlug) {
      // Redirect to user's author page
      return NextResponse.redirect(new URL(`/author/${userSlug}`, req.url))
    } else {
      // No user slug found - redirect to login
      return NextResponse.redirect(new URL('/login', req.url))
    }
  } catch (error) {
    // Invalid session - redirect to login
    return NextResponse.redirect(new URL('/login', req.url))
  }
}
```

## Route Priority Analysis

### Next.js Resolution Order:
1. `app/` directory routes (currently winning)
2. `src/app/` directory routes (canonical target)

### Critical Conflicts to Resolve:

#### Root Level:
- `app/layout.tsx` vs `src/app/layout.tsx`
- `app/page.tsx` vs `src/app/page.tsx`

#### Authentication:
- `app/login/page.tsx` vs `src/app/login/page.tsx`

#### Account Management:
- `app/account/*` vs `src/app/account/*`

#### Admin Interface:
- `app/admin/*` vs `src/app/admin/*`

#### Content Editor:
- `app/editor/*` vs `src/app/editor/*`

## Migration Strategy

### Phase 1A: Implement Redirects (No Deletes)
1. Add redirect rules to next.config.ts
2. Add profile redirect to middleware.ts
3. Test redirect functionality

### Phase 1B: Route Dry-Run Test
```bash
# Test planned redirects locally
curl -I http://localhost:3000/user/test-user
# Should return: 308 → /author/test-user

curl -I http://localhost:3000/wp/users/test-user  
# Should return: 308 → /author/test-user

curl -I http://localhost:3000/blogs/sample-post
# Should return: 308 → /blog/sample-post

# Test dynamic profile redirect (requires session)
curl -I -b "session=valid_token" http://localhost:3000/profile
# Should return: 308 → /author/[user-slug]
```

### Phase 1C: Verify Session Helper Exists
- ✅ `verifySession()` function exists in middleware
- ✅ Session handling is working
- ⚠️ Need to verify user slug/username in JWT claims

## Next Steps for Phase 2

1. **Feature Parity Tests**: Create automated checks
2. **Component Analysis**: Identify import dependencies
3. **API Route Mapping**: Analyze missing handlers
4. **Permission Consolidation**: Ensure single source of truth

## Risk Mitigation

### Low Risk Changes:
- Static redirects (well-tested pattern)
- Profile dynamic redirect (isolated logic)

### Testing Required:
- Session token structure (slug/username field)
- Redirect loop prevention
- SEO impact of 308 redirects

### Rollback Plan:
- Remove redirect rules from next.config.ts
- Remove profile redirect from middleware.ts
- Routes fall back to current behavior
