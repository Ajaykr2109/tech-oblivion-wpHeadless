# Editor Picks Feature

This feature allows administrators to manually select and manage posts that appear as "Editor's Picks" on the home page.

## Features

- **Admin Interface**: Manage editor picks from the admin dashboard in the Posts section
- **Home Page Display**: Selected posts are prominently featured on the home page
- **Fallback System**: If no editor picks are set, the latest posts are shown as fallback
- **Role-Based Access**: Only users with editor+ permissions can manage editor picks

## How to Use

### Setting Editor Picks

1. **Access Admin Dashboard**
   - Navigate to `/admin/posts`
   - Must be logged in with `editor`, `seo_editor`, `seo_manager`, or `administrator` role

2. **Enter Editor Picks Mode**
   - Click the "Manage Editor Picks" button in the top-right corner
   - The interface will switch to editor picks management mode

3. **Select Posts**
   - Click on any post row in the table to toggle its editor pick status
   - Selected posts will show a "✓ Featured" status
   - You can select up to 6 posts as editor picks

4. **Exit Editor Picks Mode**
   - Click "Exit Editor Picks" to return to normal posts management
   - Changes are saved automatically when you toggle posts

### Viewing Editor Picks

- **Home Page**: Visit the home page and scroll to the "Editor's Picks" section
- **Fallback**: If no editor picks are set, the section shows the 3 latest posts

## Technical Implementation

### API Endpoints

- `GET /api/admin/editor-picks` - Get current editor picks
- `POST /api/admin/editor-picks` - Update editor picks

### Components

- `EditorPicksFeed` - Specialized feed component for editor picks
- `PostsManagement` - Enhanced admin interface with editor picks management

### Data Storage

Editor picks are stored in the local `site-settings.json` file as an array of post IDs:

```json
{
  "siteTitle": "Tech Oblivion",
  "siteUrl": "http://localhost:3000",
  "editorPicks": [123, 456, 789]
}
```

### Permissions

The following roles can manage editor picks:
- `administrator`
- `editor` 
- `seo_editor`
- `seo_manager`

## Testing

1. **Test Admin Interface**
   - Log in as an editor/admin
   - Navigate to `/admin/posts`
   - Toggle editor picks mode and select/deselect posts

2. **Test Home Page Display**
   - Set some editor picks in admin
   - Visit the home page and verify they appear in "Editor's Picks" section
   - Clear all editor picks and verify fallback posts are shown

3. **Test Permissions**
   - Try accessing `/api/admin/editor-picks` without proper permissions
   - Should receive 401/403 errors

## Troubleshooting

- **Posts not appearing**: Check that selected posts are published (not drafts)
- **Permission errors**: Verify user has editor+ role permissions
- **Fallback not working**: Check that `getPosts()` function is working properly
- **Admin interface not loading**: Check console for API errors

## Future Enhancements

- Drag-and-drop reordering of editor picks
- Preview mode to see how picks will look on home page
- Analytics on editor picks performance
- Scheduled editor picks with automatic rotation