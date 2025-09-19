export type UserRef = {
  id?: number
  name: string
  slug?: string
  avatar?: string
}

export type CommentStatus = 'approved' | 'hold' | 'spam' | 'trash' | 'unapproved' | 'deleted'

export type CommentModel = {
  id: number | string
  postId: number
  parentId?: number
  author: UserRef
  content: string
  createdAt: string
  status?: CommentStatus
  replies?: CommentModel[]
  repliesLoaded?: boolean
  replyCount?: number
  likes?: number
  likedByMe?: boolean
  edited?: boolean
}

export type SortMode = 'new' | 'old' | 'mostLiked' | 'mostReplied'

export type CommentsState = {
  postId: number
  items: CommentModel[]
  loading: boolean
  error?: string | null
  page: number
  pageSize: number
  hasMore: boolean
  expanded: Set<string | number>
  selected: Set<string | number> // admin bulk
  sort: SortMode
  query: string
}

export type CommentsActions = {
  loadInitial: () => Promise<void>
  loadMoreTop: () => Promise<void>
  toggleExpand: (id: string | number) => Promise<void>
  prefetchReplies: (id: string | number) => void
  submitComment: (content: string, parentId?: number) => Promise<void>
  editComment: (id: string | number, content: string) => Promise<boolean>
  deleteOwnComment: (id: string | number) => Promise<boolean>
  markSpam: (id: string | number) => Promise<boolean>
  moderate: (id: string | number, action: 'approve'|'unapprove'|'restore'|'trash') => Promise<boolean>
  vote: (id: string | number, like: boolean) => Promise<void>
  setSort: (s: SortMode) => void
  setQuery: (q: string) => void
  // Admin
  toggleSelect: (id: string | number) => void
  clearSelection: () => void
  bulkAction: (action: 'approve'|'unapprove'|'spam'|'trash'|'restore'|'delete') => Promise<void>
}

export type CommentsContextValue = CommentsState & CommentsActions
