# Tech Oblivion Consolidation Discovery Report - Updated
*Generated: September 4, 2025*

## 🎯 Executive Summary

**Objective**: Consolidate duplicate routing trees (`app/*` vs `src/app/*`) to achieve single source of truth with `src/app/*` as canonical.

**Current State**: 
- Legacy tree (`app/*`) is winning route resolution due to Next.js priority
- Multiple duplicate components and API routes exist
- Some legacy routes have additional functionality missing in canonical

---

## 📊 Duplicate Inventory Table

| Path | Canonical? | Used-by | Importers | Route | Notes |
|------|------------|---------|-----------|-------|--------|
| **🛣️ ROUTING TREES** |
| `app/layout.tsx` | ❌ | All pages | High | `/` | Legacy root layout - currently active |
| `src/app/layout.tsx` | ✅ | Limited | Low | `/` | Canonical layout - need to migrate |
| `app/page.tsx` | ❌ | Homepage | Active | `/` | Legacy homepage |
| `src/app/page.tsx` | ✅ | Homepage | Inactive | `/` | Canonical homepage |
| **👤 PROFILE ROUTES** |
| `app/author/[slug]/page.tsx` | ✅ | User profiles | Active | `/author/:slug` | Most feature-complete |
| `app/profile/page.tsx` | ❌ | Static profile | Active | `/profile` | Simple redirect page |
| `app/user/[slug]/page.tsx` | ❌ | User profiles | Active | `/user/:slug` | Duplicate functionality |
| `app/wp/users/[slug]/page.tsx` | ❌ | User profiles | Active | `/wp/users/:slug` | Legacy WP-style routing |
| **🔐 AUTH & ACCOUNT** |
| `app/login/page.tsx` | ❌ | Auth | Active | `/login` | Legacy login |
| `src/app/login/page.tsx` | ✅ | Auth | Inactive | `/login` | Canonical login |
| `app/account/*` | ❌ | User settings | Active | `/account/*` | Legacy account pages |
| `src/app/account/*` | ✅ | User settings | Inactive | `/account/*` | Canonical account pages |
| **⚙️ ADMIN & EDITOR** |
| `app/admin/layout.tsx` | ❌ | Admin interface | Active | `/admin/*` | Legacy admin |
| `src/app/admin/layout.tsx` | ✅ | Admin interface | Inactive | `/admin/*` | Canonical admin |
| `app/editor/*` | ❌ | Content editing | Active | `/editor/*` | Legacy editor |
| `src/app/editor/*` | ✅ | Content editing | Inactive | `/editor/*` | Canonical editor |
| **📝 CONTENT ROUTES** |
| `app/blog/*` | ❌ | Blog posts | Active | `/blog/*` | Legacy blog routing |
| `app/blogs/*` | ❌ | Blog posts | Active | `/blogs/*` | Alternative blog routing |
| **🔌 API ROUTES** |
| `app/api/*` | ❌ | All API calls | High | `/api/*` | Legacy API - currently winning |
| `src/app/api/*` | ✅ | All API calls | Medium | `/api/*` | Canonical API implementations |
| **🧩 COMPONENT DUPLICATES** |
| `src/components/reader-toolbar.tsx` | ✅ | Blog posts | 1 | N/A | Enhanced unified toolbar |
| `src/components/reader-toolbar-portal.tsx` | ✅ | Blog posts | 1 | N/A | Portal wrapper |
| `src/components/floating-actions.tsx` | ❌ | None found | 0 | N/A | Legacy - appears unused |
| `src/components/toc/TableOfContents.tsx` | ✅ | Blog posts | 1 | N/A | Canonical TOC |
| `src/components/toc-list.tsx` | ❌ | None found | 0 | N/A | Legacy TOC - unused |
| `src/components/post/PostActionsMenu.tsx` | ✅ | Post pages | 1 | N/A | Canonical post actions |
| `src/components/post-actions.tsx` | ❌ | None found | 0 | N/A | Legacy - unused |
| **⚙️ CONFIG DUPLICATES** |
| `tailwind.config.ts` | ✅ | Build system | 1 | N/A | TypeScript config - preferred |
| `tailwind.config.js` | ❌ | Build system | 1 | N/A | JavaScript config - legacy |
| `eslint.config.mjs` | ✅ | Linting | 1 | N/A | Modern flat config |
| `middleware.ts` | ✅ | Next.js | 1 | N/A | Active middleware |
| `middleware.ts.disabled` | ❌ | None | 0 | N/A | Disabled backup |

---

## 🛣️ Route Collision Report

### ⚠️ Critical Conflicts (Next.js resolves `app/*` first):

1. **Root Application**
   - `app/layout.tsx` ← **WINNING** (legacy)
   - `src/app/layout.tsx` ← Should be canonical

2. **Homepage**
   - `app/page.tsx` ← **WINNING** (legacy)
   - `src/app/page.tsx` ← Should be canonical

3. **Authentication**
   - `app/login/page.tsx` ← **WINNING** (legacy)
   - `src/app/login/page.tsx` ← Should be canonical

4. **Account Management**
   - `app/account/*` ← **WINNING** (legacy)
   - `src/app/account/*` ← Should be canonical

5. **Admin Interface**
   - `app/admin/*` ← **WINNING** (legacy)
   - `src/app/admin/*` ← Should be canonical

6. **Content Editor**
   - `app/editor/*` ← **WINNING** (legacy)  
   - `src/app/editor/*` ← Should be canonical

### 📍 Profile Route Confusion:
- `/author/[slug]` ✅ (canonical - full featured)
- `/profile` ❌ (static redirect - needs dynamic mapping)
- `/user/[slug]` ❌ (duplicate of author)
- `/wp/users/[slug]` ❌ (legacy WordPress-style)

---

## 🔌 API Route Analysis

Most `app/api/*` routes are currently winning but many just re-export from `src/app/api/*`. Key findings:

### Missing Handlers in Canonical:
*Need detailed analysis of HTTP verbs per route*

### High-Risk API Routes:
- Authentication endpoints
- Media upload/management
- User management APIs
- WordPress proxy routes

---

## 📈 Import Graph Analysis

### 🟢 Actively Used (High Migration Priority):
- `ReaderToolbarPortal` → Used in blog post layouts
- `PostActionsMenu` → Used in post components
- `TableOfContents` → Used in blog post layouts
- Admin layouts → Used across admin interface

### 🔴 Unused (Safe to Remove):
- `floating-actions.tsx` → No active imports found
- `post-actions.tsx` → No active imports found  
- `toc-list.tsx` → No active imports found

### ⚠️ Needs Investigation:
- Legacy component imports from `app/*` tree
- Cross-dependencies between trees

---

## 🎯 Consolidation Plan

### Phase 0: Pre-Migration Setup ✅
- [x] Create feature branch: `feat/consolidate-src-app-parity`
- [x] Complete discovery analysis
- [ ] Set up parity test suite

### Phase 1: Choose Canonical & Plan Redirects
**Canonical Tree**: `src/app/*`

**Redirect Rules for `next.config.ts`:**
```typescript
// Profile route redirects
{
  source: '/user/:slug',
  destination: '/author/:slug',
  permanent: false // 308
},
{
  source: '/wp/users/:slug',
  destination: '/author/:slug', 
  permanent: false
},
{
  source: '/blogs/:path*',
  destination: '/blog/:path*',
  permanent: false
}
```

**Middleware Redirect:**
```typescript
// /profile → /author/[my-slug] (requires session lookup)
if (pathname === '/profile') {
  const user = await getServerSession()
  if (user?.slug) {
    return NextResponse.redirect(`/author/${user.slug}`)
  }
  return NextResponse.redirect('/login')
}
```

### Phase 2: Feature Parity Tests
Create automated tests to verify:
- [ ] Navbar behavior (logged in/out states)
- [ ] Single toolbar mounting (no duplicates)
- [ ] TOC functionality (scroll, highlighting)
- [ ] Post actions (edit permissions, sharing)
- [ ] Bookmarks page functionality
- [ ] Author profile completeness
- [ ] Editor route access control
- [ ] Code block rendering

### Phase 3: Migrate Missing Behavior
- [ ] Port missing API handlers
- [ ] Ensure ReaderToolbarPortal compatibility
- [ ] Replace role checks with @/lib/permissions
- [ ] Verify toolbar uniqueness

### Phase 4: Safe Removal (3 commits)
**Commit 1 - Stop Usage:**
- [ ] Update imports to use `src/app/*`
- [ ] Verify single toolbar rendering

**Commit 2 - Wire Redirects:**
- [ ] Add `next.config.ts` redirects
- [ ] Add middleware profile redirect
- [ ] Run typecheck + parity tests

**Commit 3 - Remove Legacy:**
- [ ] Delete `app/*` directory
- [ ] Delete unused components
- [ ] Delete duplicate configs
- [ ] Generate final diff report

### Phase 5: One-Truth Permissions
- [ ] Standardize on @/lib/permissions
- [ ] Unit test permission matrix
- [ ] Verify consistent session handling

### Phase 6: Final Verification
- [ ] Re-run parity tests → all green
- [ ] Lighthouse a11y ≥ 95
- [ ] Generate PR artifacts

---

## ⚠️ Risk Assessment

### 🔴 High Risk:
- **Route resolution changes**: All current routes resolve to legacy tree
- **API route changes**: External integrations may break
- **Session handling**: Profile redirects need server-side session access

### 🟡 Medium Risk:
- **Component imports**: Need to update all import paths
- **Admin workflow**: Editor access patterns may change
- **Build configuration**: Config file changes need testing

### 🟢 Low Risk:
- **Unused component removal**: No active dependencies
- **Config consolidation**: Well-tested patterns

---

## 📋 Next Steps

1. ✅ **Discovery Complete** - Comprehensive inventory done
2. ⏳ **Create Parity Tests** - Automated verification
3. ⏳ **Migrate Missing Features** - Port API handlers, components
4. ⏳ **Implement Redirects** - URL compatibility
5. ⏳ **Execute Removal** - Clean up legacy files
6. ⏳ **Verify & Document** - Final validation

---

## 🎁 Expected Deliverables

### Pull Request Artifacts:
- ✅ **Parity Matrix** - Before/after functionality comparison
- 🔀 **Redirects Working** - URL redirect verification
- 🗺️ **Route Map** - No duplicate routes
- 🧰 **Single Toolbar Proof** - DOM query shows only one toolbar
- 🧪 **CI Logs** - All tests passing
- 🧾 **Final Diff Summary** - File-by-file changes

### Success Criteria:
- ✅ No user-visible feature loss
- ✅ Only one app tree: `src/app/*`
- ✅ Only one toolbar + TOC component used
- ✅ Profile/author/editor/bookmarks match spec
- ✅ Legacy routes 308-redirect to canonical
- ✅ Clear rollback path documented
