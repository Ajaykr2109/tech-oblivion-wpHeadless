import { redirect } from 'next/navigation'

import { getSessionUser } from '@/lib/auth'

import AccountAvatarPage from '../../../src/app/account/avatar/page'

export default async function AccountAvatarWrapper() {
	const user = await getSessionUser()
	if (!user) redirect('/login?next=/account/avatar')
	return <AccountAvatarPage />
}
