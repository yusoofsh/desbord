import AuthForm from "@/lib/components/auth/auth-form"

export const runtime = "edge"

export default function SignUpPage() {
  return <AuthForm mode="sign-up" />
}
