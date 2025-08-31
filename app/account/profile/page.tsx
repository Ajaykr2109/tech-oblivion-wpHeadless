import { redirect } from 'next/navigation'

import { getSessionUser } from '@/lib/auth'

import AccountProfilePage from '../../../src/app/account/profile/page'

export default async function AccountProfileWrapper() {
	const user = await getSessionUser()
	if (!user) redirect('/login?next=/account/profile')
	return <AccountProfilePage />
}
