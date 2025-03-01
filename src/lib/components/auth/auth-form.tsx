"use client"

import { signInAction, signUpAction } from "@/app/(auth)/actions"
import { Button } from "@/lib/components/button"
import { lusitana } from "@/lib/utils/fonts"
import { ArrowRightIcon } from "@heroicons/react/20/solid"
import {
  AtSymbolIcon,
  ExclamationCircleIcon,
  KeyIcon,
  UserIcon,
} from "@heroicons/react/24/outline"
import Link from "next/link"
import { useActionState } from "react"

type AuthFormProps = {
  mode: "sign-in" | "sign-up"
}

export default function AuthForm({ mode }: AuthFormProps) {
  const [state, action, isPending] = useActionState(
    mode === "sign-in" ? signInAction : signUpAction,
    undefined,
  )

  return (
    <form action={action} className="space-y-3">
      <div className="flex-1 rounded-lg bg-gray-50 px-6 pt-8 pb-4">
        <h1 className={`${lusitana.className} mb-3 text-2xl`}>
          {mode === "sign-in"
            ? "Please sign in to continue."
            : "Please sign up to continue."}
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          {mode === "sign-in" ? (
            <>
              Don&#39;t have an account?{" "}
              <Link href="/sign-up" className="text-blue-500 hover:underline">
                Sign up here
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link href="/sign-in" className="text-blue-500 hover:underline">
                Sign in here
              </Link>
            </>
          )}
        </p>
        <div className="w-full">
          {mode === "sign-up" && (
            <div>
              <label
                className="mt-5 mb-3 block text-xs font-medium text-gray-900"
                htmlFor="username"
              >
                Username
              </label>
              <div className="relative">
                <input
                  className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                  id="username"
                  type="text"
                  name="username"
                  placeholder="Enter your username"
                  required
                />
                <UserIcon className="pointer-events-none absolute top-1/2 left-3 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
              </div>
            </div>
          )}
          <div className="mt-4">
            <label
              className="mt-5 mb-3 block text-xs font-medium text-gray-900"
              htmlFor="email"
            >
              Email
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                id="email"
                type="email"
                name="email"
                placeholder="Enter your email address"
                required
              />
              <AtSymbolIcon className="pointer-events-none absolute top-1/2 left-3 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>
          <div className="mt-4">
            <label
              className="mt-5 mb-3 block text-xs font-medium text-gray-900"
              htmlFor="password"
            >
              Password
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                id="password"
                type="password"
                name="password"
                placeholder="Enter password"
                minLength={mode === "sign-up" ? 6 : undefined}
                required
              />
              <KeyIcon className="pointer-events-none absolute top-1/2 left-3 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>
        </div>
        <Button className="mt-4 w-full" aria-disabled={isPending}>
          {mode === "sign-in" ? "Sign In" : "Sign Up"}{" "}
          <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
        </Button>
        <div
          className="flex h-8 items-end space-x-1"
          aria-live="polite"
          aria-atomic="true"
        >
          {state && (
            <>
              <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
              <p className="text-sm text-red-500">{state}</p>
            </>
          )}
        </div>
      </div>
    </form>
  )
}
