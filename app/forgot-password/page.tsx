export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-center text-3xl font-extrabold text-gray-900">Reset your password</h1>
          <p className="mt-2 text-center text-sm text-gray-600">Enter your email and we’ll send reset instructions</p>
          <form className="mt-8 space-y-6">
            <input className="w-full border rounded p-2" placeholder="Email" type="email" />
            <button className="w-full bg-primary text-primary-foreground px-4 py-2 rounded" type="button">Send reset link</button>
          </form>
        </div>
      </div>
    </div>
  )
}
