# Comments and Profile Filtering Fixes

## Issues Fixed

### 1. Comments API Filtering by Post ID
**Problem**: Comments were loading all comments instead of filtering by specific post ID.

**Root Cause**: 
- WordPress MU proxy (`fe-auth/proxy.php`) was not properly forwarding query parameters
- WordPress REST API expects `post` parameter as array format `post[]`

**Fixes Applied**:
1. Enhanced MU proxy to properly forward query parameters from Next.js
2. Updated comments API route to convert single `post` parameter to array format (`post[]`)
3. Enhanced WordPress `rest_comment_query` filter to handle both array and single post parameters
4. Added debug logging to track parameter passing

### 2. User Profile Posts/Comments Filtering
**Problem**: User profile pages were loading all posts/comments instead of filtering by author.

**Root Cause**:
- WordPress REST API expects `author` parameter as array format `author[]`
- Missing query parameter handling in WordPress filters

**Fixes Applied**:
1. Enhanced WordPress `rest_comment_query` filter to handle `author` parameter correctly
2. Added `rest_post_query` filter to ensure proper author filtering for posts
3. Updated posts API route to convert single `author` parameter to array format (`author[]`)

## Files Modified

### WordPress MU Plugins
- `wp-fe/mu-plugins/fe-auth/proxy.php` - Enhanced query parameter forwarding
- `wp-fe/mu-plugins/fe-auth/rest-fields.php` - Added post/comment filtering enhancements

### Next.js API Routes  
- `src/app/api/wp/comments/route.ts` - Enhanced parameter handling and debugging
- `src/app/api/wp/posts/route.ts` - Added author parameter array conversion

## Testing Instructions

### Comments Filtering Test
1. Open any blog post page (e.g., `/blog/[slug]`)
2. Check browser console for comments API logs
3. Verify only comments for that post are loaded
4. Check that `post` parameter is properly passed and converted to array format

### Profile Posts/Comments Test
1. Open any user profile page (e.g., `/profile/[username]`)
2. Verify only posts by that author are shown in the Posts tab
3. Verify only comments by that author are shown in the Comments tab
4. Check that `author` parameter is properly filtered

### Expected Log Output
```
Comments API: post parameter received: [POST_ID]
Comments API: Converted post param to array format
Comments API: Using proxy with URL: [PROXY_URL]
Comments API: Proxy returned [COUNT] comments
Posts API: Converted author param to array format
```

## Impact
- **Performance**: Dramatically reduced data transfer by loading only relevant comments/posts
- **User Experience**: Faster page loads, especially for blogs with many comments
- **Scalability**: Reduced server load by eliminating unnecessary data queries
- **Data Accuracy**: Ensures users only see content relevant to the current context

## Rollback Plan
If issues arise, revert the following:
1. `proxy.php` - Remove query parameter forwarding enhancements
2. `rest-fields.php` - Remove post/comment filtering enhancements  
3. API routes - Remove parameter conversion logic

The fixes are backwards-compatible and should not break existing functionality.