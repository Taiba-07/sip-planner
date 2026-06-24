'use client'
import { useSession, signIn, signOut } from "next-auth/react"

export default function AuthButton() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <div className="text-sm text-gray-400">...</div>
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-3 ml-auto">
        <span className="text-sm text-gray-600">
          {session.user.name}
        </span>
        <button
          onClick={() => signOut()}
          className="text-sm text-gray-600 hover:text-emerald-600 transition-colors"
        >
          Sign out
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => signIn("google")}
      className="text-sm bg-emerald-600 text-white px-4 py-1.5 rounded-lg
                 hover:bg-emerald-700 transition-colors ml-auto"
    >
      Sign in
    </button>
  )
}