import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/auth'
import AccountCentral from '../../src/app/account/page'

export default async function AccountPageWrapper() {
	const user = await getSessionUser()
	if (!user) redirect('/login?next=/account')
	return <AccountCentral />
}
