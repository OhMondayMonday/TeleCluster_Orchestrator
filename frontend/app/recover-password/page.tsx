import { RecoverPasswordForm } from "@/components/auth/recover-password-form"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function RecoverPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="w-full max-w-md">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>
        <div className="flex items-center gap-3 mb-8">
          <Image src="/logo.png" alt="PUCP" width={48} height={48} className="rounded-full" />
          <h1 className="text-xl font-bold">PUCP Cloud</h1>
        </div>
        <RecoverPasswordForm />
      </div>
    </div>
  )
}
