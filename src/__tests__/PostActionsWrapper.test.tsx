import { render, screen, waitFor } from '@testing-library/react'
import PostActionsWrapper from '../components/post/PostActionsWrapper'
import { getSessionUser } from '../lib/auth'
import { canEditPost } from '../lib/permissions'

// Mock the dependencies
jest.mock('../lib/auth', () => ({
  getSessionUser: jest.fn()
}))

jest.mock('../lib/permissions', () => ({
  canEditPost: jest.fn()
}))

jest.mock('../components/post/PostActionsMenu', () => {
  return function MockPostActionsMenu({ user, showEdit, onEdit, post }: any) {
    return (
      <div data-testid="post-actions-menu">
        <span data-testid="user-id">{user?.id || 'no-user'}</span>
        <span data-testid="show-edit">{showEdit ? 'can-edit' : 'cannot-edit'}</span>
        <button onClick={onEdit} data-testid="edit-button">Edit</button>
      </div>
    )
  }
})

const mockGetSessionUser = getSessionUser as jest.MockedFunction<typeof getSessionUser>
const mockCanEditPost = canEditPost as jest.MockedFunction<typeof canEditPost>

const testPost = {
  id: 1,
  slug: 'test-post',
  title: 'Test Post',
  authorId: 3
}

describe('PostActionsWrapper', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders without user when not authenticated', async () => {
    mockGetSessionUser.mockResolvedValue(null)
    mockCanEditPost.mockReturnValue(false)

    render(<PostActionsWrapper postId={testPost.id} slug={testPost.slug} title={testPost.title} authorId={testPost.authorId} />)

    await waitFor(() => {
      expect(screen.getByTestId('user-id')).toHaveTextContent('no-user')
      expect(screen.getByTestId('show-edit')).toHaveTextContent('cannot-edit')
    })
  })

  it('renders with user when authenticated', async () => {
    const mockUser = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      roles: ['author']
    }

    mockGetSessionUser.mockResolvedValue(mockUser)
    mockCanEditPost.mockReturnValue(false)

    render(<PostActionsWrapper postId={testPost.id} slug={testPost.slug} title={testPost.title} authorId={testPost.authorId} />)

    await waitFor(() => {
      expect(screen.getByTestId('user-id')).toHaveTextContent('1')
      expect(screen.getByTestId('show-edit')).toHaveTextContent('cannot-edit')
    })
  })

  it('shows edit button when user can edit post', async () => {
    const mockUser = {
      id: 3,
      username: 'author',
      email: 'author@example.com',
      roles: ['author'],
      wpUserId: 3
    }

    mockGetSessionUser.mockResolvedValue(mockUser)
    mockCanEditPost.mockReturnValue(true)

    render(<PostActionsWrapper postId={testPost.id} slug={testPost.slug} title={testPost.title} authorId={testPost.authorId} />)

    await waitFor(() => {
      expect(screen.getByTestId('user-id')).toHaveTextContent('3')
      expect(screen.getByTestId('show-edit')).toHaveTextContent('can-edit')
    })
  })

  it('handles authentication errors gracefully', async () => {
    mockGetSessionUser.mockRejectedValue(new Error('Auth error'))
    mockCanEditPost.mockReturnValue(false)

    render(<PostActionsWrapper postId={testPost.id} slug={testPost.slug} title={testPost.title} authorId={testPost.authorId} />)

    await waitFor(() => {
      expect(screen.getByTestId('user-id')).toHaveTextContent('no-user')
      expect(screen.getByTestId('show-edit')).toHaveTextContent('cannot-edit')
    })
  })
})
