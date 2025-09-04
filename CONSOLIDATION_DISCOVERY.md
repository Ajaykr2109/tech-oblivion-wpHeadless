# Tech Oblivion Consolidation Discovery Report

Generated: September 4, 2025

## 📊 **Duplicate Inventory Table**

| **Path** | **Canonical?** | **Used-by** | **Importers** | **Route** | **Notes** |
|----------|----------------|-------------|---------------|-----------|-----------|
| **ROUTING TREES** |
| `app/*` | ❌ | Multiple | High | Various | Legacy tree - superseded by src/app/* |
| `src/app/*` | ✅ | Limited | Medium | Various | Canonical tree |
| **API ROUTES** |
| `app/api/*` | ❌ | Active | High | `/api/*` | Legacy - most re-export from src/app/api/* |
| `src/app/api/*` | ✅ | Active | High | `/api/*` | Canonical implementations |
| **READER TOOLBARS** |
| `src/components/reader-toolbar.tsx` | ✅ | Blog posts | 1 | N/A | Enhanced unified toolbar |
| `src/components/reader-toolbar-portal.tsx` | ✅ | Blog posts | 1 | N/A | Portal wrapper for toolbar |
| **FLOATING ACTIONS** |
| `src/components/floating-actions.tsx` | ❌ | None? | 0 | N/A | Potentially unused - need verification |
| **TOC COMPONENTS** |
| `src/components/toc/TableOfContents.tsx` | ✅ | Blog posts | 1 | N/A | Canonical TOC |
| `src/components/toc-list.tsx` | ❌ | None found | 0 | N/A | Legacy - likely unused |
| **POST ACTIONS** |
| `src/components/post/PostActionsMenu.tsx` | ✅ | Post wrapper | 1 | N/A | Canonical post actions |
| `src/components/post/PostActionsWrapper.tsx` | ✅ | Blog posts | 1 | N/A | Wrapper for post actions |
| `src/components/post-actions.tsx` | ❌ | None found | 0 | N/A | Legacy - likely unused |
| **PROFILE ROUTES** |
| `app/author/[slug]/page.tsx` | ✅ | Active | Unknown | `/author/[slug]` | Canonical author profiles |
| `app/profile/page.tsx` | ❌ | Limited | Unknown | `/profile` | Static profile page |
| `app/user/[slug]/page.tsx` | ❌ | Limited | Unknown | `/user/[slug]` | Duplicate user profiles |
| `app/wp/users/[slug]/page.tsx` | ❌ | Limited | Unknown | `/wp/users/[slug]` | Duplicate user profiles |
| **ADMIN/EDITOR ROUTES** |
| `src/app/admin/layout.tsx` | ✅ | Admin pages | 1 | `/admin/*` | Canonical admin layout |
| `src/app/editor/*` | ✅ | Editor pages | Multiple | `/editor/*` | Canonical editor routes |
| `app/admin/layout.tsx` | ❌ | Admin pages | 1 | `/admin/*` | Legacy admin layout |
| **CONFIG FILES** |
| `tailwind.config.ts` | ✅ | Build | 1 | N/A | TypeScript config - preferred |
| `tailwind.config.js` | ❌ | Build | 1 | N/A | JS config - legacy |
| `eslint.config.mjs` | ✅ | Linting | 1 | N/A | Modern flat config |
| `middleware.ts` | ✅ | Next.js | 1 | N/A | Active middleware |
| `middleware.ts.disabled` | ❌ | None | 0 | N/A | Disabled backup |

## 🛣️ **Route Collision Report**

### Current Route Conflicts:
1. **Profile Routes**: 
   - `/author/[slug]` ✅ (canonical - full featured)
   - `/profile` ❌ (static placeholder)
   - `/user/[slug]` ❌ (duplicate functionality)
   - `/wp/users/[slug]` ❌ (duplicate functionality)

2. **API Routes**: Multiple implementations exist, legacy in `app/api/*` mostly re-export from `src/app/api/*`

3. **Admin Routes**: Both `app/admin/*` and `src/app/admin/*` exist

### Route Resolution Priority:
Next.js currently resolves routes from `app/*` first, then `src/app/*`. The legacy tree is winning in most cases.

## 📈 **Import Graph Analysis**

### High-Impact Components (need careful migration):
- `ReaderToolbarPortal` - Used in blog post pages
- `PostActionsWrapper` - Used in blog post pages  
- `TableOfContents` - Used in blog post pages
- Admin layouts - Used across admin interface

### Low-Impact/Unused Components (safe to remove):
- `floating-actions.tsx` - No active imports found
- `post-actions.tsx` - No active imports found
- `toc-list.tsx` - No active imports found

### API Route Dependencies:
- Most `app/api/*` routes re-export from `src/app/api/*`
- Some have additional handlers (DELETE, etc.) in legacy tree
- Need to merge functionality before removing legacy routes

## 🎯 **Consolidation Strategy**

### Phase 1: Choose Canonical & Plan Redirects
- **Canonical Tree**: `src/app/*` 
- **Profile Route**: `/author/[slug]` (most feature-complete)
- **API Routes**: `src/app/api/*` (canonical implementations)

### Phase 2: Redirect Rules Needed
```typescript
// next.config.ts redirects
{
  source: '/profile/:path*',
  destination: '/author/:path*', // Need to map to actual user slug
  permanent: false // 308
},
{
  source: '/user/:slug',
  destination: '/author/:slug',
  permanent: false
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

### Phase 3: Feature Parity Requirements
- Ensure `src/app/admin/*` has all functionality from `app/admin/*`
- Merge any missing API handlers from legacy routes
- Verify all toolbar/TOC functionality is in canonical components

### Phase 4: Safe Removal Plan
1. Stop rendering legacy components (commit 1)
2. Add redirects (commit 2)  
3. Remove legacy files (commit 3)

## ⚠️ **Risk Assessment**

### High Risk:
- API route changes could break external integrations
- Profile route changes affect user bookmarks/links

### Medium Risk: 
- Admin interface changes could affect editor workflow
- Component changes could affect blog post UX

### Low Risk:
- Config file changes (well-tested)
- Unused component removal

## 📋 **Next Steps**

1. ✅ Discovery complete
2. ⏳ Create feature parity tests
3. ⏳ Migrate missing functionality  
4. ⏳ Implement redirects
5. ⏳ Remove legacy files
6. ⏳ Verify consolidation
