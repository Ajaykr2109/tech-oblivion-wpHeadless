import { 
  canEditPost, 
  canDeletePost, 
  canCreatePost, 
  canUploadMedia, 
  canModerateComments,
  isAdmin,
  isEditor,
  isAuthor
} from '../lib/permissions'
import type { User } from '../lib/auth'

// Test fixtures
const adminUser: User = {
  id: 1,
  username: 'admin',
  email: 'admin@test.com',
  roles: ['administrator']
}

const editorUser: User = {
  id: 2,
  username: 'editor',
  email: 'editor@test.com',
  roles: ['editor']
}

const authorUser: User = {
  id: 3,
  username: 'author',
  email: 'author@test.com',
  roles: ['author'],
  wpUserId: 3
}

const contributorUser: User = {
  id: 4,
  username: 'contributor',
  email: 'contributor@test.com',
  roles: ['contributor']
}

const subscriberUser: User = {
  id: 5,
  username: 'subscriber',
  email: 'subscriber@test.com',
  roles: ['subscriber']
}

const testPost = {
  id: 1,
  author_id: 3 // Owned by authorUser
}

const otherPost = {
  id: 2,
  author_id: 99 // Not owned by any test user
}

describe('permissions', () => {
  describe('canEditPost', () => {
    it('allows administrator to edit any post', () => {
      expect(canEditPost(adminUser, testPost)).toBe(true)
      expect(canEditPost(adminUser, otherPost)).toBe(true)
    })

    it('allows editor to edit any post', () => {
      expect(canEditPost(editorUser, testPost)).toBe(true)
      expect(canEditPost(editorUser, otherPost)).toBe(true)
    })

    it('allows author to edit own posts only', () => {
      expect(canEditPost(authorUser, testPost)).toBe(true)
      expect(canEditPost(authorUser, otherPost)).toBe(false)
    })

    it('denies contributor access to edit posts', () => {
      expect(canEditPost(contributorUser, testPost)).toBe(false)
      expect(canEditPost(contributorUser, otherPost)).toBe(false)
    })

    it('denies subscriber access to edit posts', () => {
      expect(canEditPost(subscriberUser, testPost)).toBe(false)
    })

    it('denies access to unauthenticated users', () => {
      expect(canEditPost(null, testPost)).toBe(false)
    })
  })

  describe('canDeletePost', () => {
    it('allows only administrator to delete posts', () => {
      expect(canDeletePost(adminUser, testPost)).toBe(true)
      expect(canDeletePost(editorUser, testPost)).toBe(false)
      expect(canDeletePost(authorUser, testPost)).toBe(false)
      expect(canDeletePost(contributorUser, testPost)).toBe(false)
      expect(canDeletePost(subscriberUser, testPost)).toBe(false)
      expect(canDeletePost(null, testPost)).toBe(false)
    })
  })

  describe('canCreatePost', () => {
    it('allows contributor and above to create posts', () => {
      expect(canCreatePost(adminUser)).toBe(true)
      expect(canCreatePost(editorUser)).toBe(true)
      expect(canCreatePost(authorUser)).toBe(true)
      expect(canCreatePost(contributorUser)).toBe(true)
    })

    it('denies subscriber from creating posts', () => {
      expect(canCreatePost(subscriberUser)).toBe(false)
    })

    it('denies unauthenticated users from creating posts', () => {
      expect(canCreatePost(null)).toBe(false)
    })
  })

  describe('canUploadMedia', () => {
    it('allows author and above to upload media', () => {
      expect(canUploadMedia(adminUser)).toBe(true)
      expect(canUploadMedia(editorUser)).toBe(true)
      expect(canUploadMedia(authorUser)).toBe(true)
    })

    it('denies contributor and below from uploading media', () => {
      expect(canUploadMedia(contributorUser)).toBe(false)
      expect(canUploadMedia(subscriberUser)).toBe(false)
    })

    it('denies unauthenticated users from uploading media', () => {
      expect(canUploadMedia(null)).toBe(false)
    })
  })

  describe('canModerateComments', () => {
    it('allows editor and administrator to moderate comments', () => {
      expect(canModerateComments(adminUser)).toBe(true)
      expect(canModerateComments(editorUser)).toBe(true)
    })

    it('denies author and below from moderating comments', () => {
      expect(canModerateComments(authorUser)).toBe(false)
      expect(canModerateComments(contributorUser)).toBe(false)
      expect(canModerateComments(subscriberUser)).toBe(false)
    })

    it('denies unauthenticated users from moderating comments', () => {
      expect(canModerateComments(null)).toBe(false)
    })
  })

  describe('role helpers', () => {
    it('correctly identifies admin users', () => {
      expect(isAdmin(adminUser)).toBe(true)
      expect(isAdmin(editorUser)).toBe(false)
      expect(isAdmin(authorUser)).toBe(false)
      expect(isAdmin(null)).toBe(false)
    })

    it('correctly identifies editor-level users', () => {
      expect(isEditor(adminUser)).toBe(true)
      expect(isEditor(editorUser)).toBe(true)
      expect(isEditor(authorUser)).toBe(false)
      expect(isEditor(null)).toBe(false)
    })

    it('correctly identifies author-level users', () => {
      expect(isAuthor(adminUser)).toBe(true)
      expect(isAuthor(editorUser)).toBe(true)
      expect(isAuthor(authorUser)).toBe(true)
      expect(isAuthor(contributorUser)).toBe(false)
      expect(isAuthor(null)).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('handles users with empty roles array', () => {
      const userWithoutRoles: User = {
        id: 6,
        username: 'noroles',
        email: 'noroles@test.com',
        roles: []
      }
      
      expect(canEditPost(userWithoutRoles, testPost)).toBe(false)
      expect(canCreatePost(userWithoutRoles)).toBe(false)
      expect(isAdmin(userWithoutRoles)).toBe(false)
    })

    it('handles users with undefined/null-like roles', () => {
      const userWithUndefinedRoles: User = {
        id: 7,
        username: 'undefroles',
        email: 'undefroles@test.com',
        roles: undefined as any // Force undefined to test edge case
      }
      
      expect(canEditPost(userWithUndefinedRoles, testPost)).toBe(false)
      expect(canCreatePost(userWithUndefinedRoles)).toBe(false)
      expect(isAdmin(userWithUndefinedRoles)).toBe(false)
    })

    it('handles posts with missing author information', () => {
      const postWithoutAuthor = { id: 3 }
      expect(canEditPost(authorUser, postWithoutAuthor)).toBe(false)
    })

    it('handles SEO roles correctly', () => {
      const seoEditorUser: User = {
        id: 8,
        username: 'seoeditor',
        email: 'seoeditor@test.com',
        roles: ['seo_editor']
      }

      const seoManagerUser: User = {
        id: 9,
        username: 'seomanager',
        email: 'seomanager@test.com',
        roles: ['seo_manager']
      }

      expect(canEditPost(seoEditorUser, testPost)).toBe(true)
      expect(canEditPost(seoManagerUser, testPost)).toBe(true)
      expect(canCreatePost(seoEditorUser)).toBe(true)
      expect(canUploadMedia(seoEditorUser)).toBe(true)
    })
  })
})
