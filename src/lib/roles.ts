export type Action =
  | 'read'
  | 'bookmark'
  | 'comment'
  | 'draft'
  | 'requestPublish'
  | 'publishOwn'
  | 'editOthers'
  | 'moderateComments'
  | 'seoEdit'
  | 'seoManage'
  | 'admin'

type RoleKey =
  | 'guest'
  | 'reader'
  | 'writer'
  | 'author'
  | 'editor'
  | 'publisher'
  | 'seo_specialist'
  | 'seo_lead'
  | 'admin'

export type RoleConfig = {
  allowed: Set<Action>
  messages: Partial<Record<Action, string>> & { fallback?: string }
}

export const roleConfig: Record<RoleKey, RoleConfig> = {
  guest: {
    allowed: new Set<Action>(['read']),
    messages: {
      bookmark: 'Log in to bookmark.',
      comment: 'Log in to comment.',
      draft: 'Log in to write drafts.',
      fallback: 'Please log in to use this feature.',
    },
  },
  reader: {
    allowed: new Set<Action>(['read', 'bookmark', 'comment']),
    messages: {
      draft: 'Upgrade to Writer to draft posts.',
      fallback: 'This action requires a higher role.',
    },
  },
  writer: {
    allowed: new Set<Action>(['read', 'bookmark', 'comment', 'draft', 'requestPublish']),
    messages: {
      publishOwn: 'Editors handle publishing.',
      fallback: 'Ask an editor to publish or upgrade your role.',
    },
  },
  author: {
    allowed: new Set<Action>(['read', 'bookmark', 'comment', 'draft', 'requestPublish', 'publishOwn']),
    messages: {
      editOthers: 'You can publish your own posts only.',
      fallback: 'This action is limited to editors.',
    },
  },
  editor: {
    allowed: new Set<Action>(['read', 'bookmark', 'comment', 'draft', 'requestPublish', 'publishOwn', 'editOthers', 'moderateComments']),
    messages: {
      fallback: 'You have editor access.',
    },
  },
  publisher: {
    allowed: new Set<Action>(['read', 'bookmark', 'comment', 'draft', 'requestPublish', 'publishOwn', 'editOthers', 'moderateComments']),
    messages: { fallback: 'You can approve & publish others’ posts.' },
  },
  seo_specialist: {
    allowed: new Set<Action>(['read', 'seoEdit']),
    messages: { publishOwn: 'Publishing is handled by editors.', fallback: 'SEO editing enabled.' },
  },
  seo_lead: {
    allowed: new Set<Action>(['read', 'seoEdit', 'seoManage']),
    messages: { publishOwn: 'Publishing is handled by editors.', fallback: 'SEO management enabled.' },
  },
  admin: {
    allowed: new Set<Action>(['read', 'bookmark', 'comment', 'draft', 'requestPublish', 'publishOwn', 'editOthers', 'moderateComments', 'seoEdit', 'seoManage', 'admin']),
    messages: { fallback: 'You have full access.' },
  },
}

// Map from WP roles to our RoleKey
const roleAlias: Record<string, RoleKey> = {
  anonymous: 'guest',
  guest: 'guest',
  subscriber: 'reader',
  reader: 'reader',
  contributor: 'writer',
  writer: 'writer',
  author: 'author',
  editor: 'editor',
  'seo-specialist': 'seo_specialist',
  'seo_lead': 'seo_lead',
  'seo-lead': 'seo_lead',
  administrator: 'admin',
  admin: 'admin',
  publisher: 'publisher',
}

export function normalizeRole(userRoles?: string[] | null): RoleKey {
  if (!userRoles || userRoles.length === 0) return 'guest'
  // Choose the highest-privileged role based on priority order
  const priority: RoleKey[] = ['admin','publisher','editor','author','writer','reader','seo_lead','seo_specialist','guest']
  // Normalize case before mapping; WP roles may come capitalized (e.g., 'Subscriber')
  const mapped = userRoles.map(r => roleAlias[r.toLowerCase?.() as any] || (r.toLowerCase?.() as RoleKey))
  for (const key of priority) {
    if (mapped.includes(key)) return key
  }
  return 'guest'
}

export function can(userRoles: string[] | null | undefined, action: Action): boolean {
  const role = normalizeRole(userRoles)
  return roleConfig[role].allowed.has(action)
}

export function messageFor(userRoles: string[] | null | undefined, action: Action): string {
  const role = normalizeRole(userRoles)
  const conf = roleConfig[role]
  return conf.messages[action] || conf.messages.fallback || 'Not permitted.'
}
