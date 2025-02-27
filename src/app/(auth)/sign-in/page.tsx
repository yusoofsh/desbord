import AuthForm from "@/lib/components/auth/auth-form"

export const runtime = "edge"

export default function SignInPage() {
  return <AuthForm mode="sign-in" />
}
