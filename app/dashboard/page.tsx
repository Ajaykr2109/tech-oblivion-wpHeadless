import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import React from 'react'
import Link from 'next/link'

export default async function DashboardPage() {
  const host = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const cookie = (await headers()).get('cookie') || ''
  const res = await fetch(`${host}/api/auth/me`, { headers: { cookie }, cache: 'no-store' })
  if (res.status === 401) {
    redirect(`/login?next=/dashboard`)
  }
  const json = await res.json()
  const user = json.user ?? json

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Display Name</label>
            <p className="mt-1 text-sm text-gray-900">{user.displayName || user.display_name}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <p className="mt-1 text-sm text-gray-900">{user.username}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="mt-1 text-sm text-gray-900">{user.email}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">User ID</label>
            <p className="mt-1 text-sm text-gray-900">{user.id}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Roles</label>
            <p className="mt-1 text-sm text-gray-900">{(user.roles || []).join(', ') || 'subscriber'}</p>
          </div>
        </div>

        <div className="mt-6 flex space-x-3">
          <Link
            href="/"
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition duration-200 text-center"
          >
            Back to Home
          </Link>
          
          <form action="/api/auth/logout" method="POST" className="flex-1">
            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
            >
              Logout
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
