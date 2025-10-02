import { LoginForm } from "@/components/auth/login-form"
import Image from "next/image"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex bg-[#032058]">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="relative z-10 flex flex-col justify-center px-16 max-w-2xl">
          <div className="flex items-center gap-3 mb-12">
            <Image src="/logo.png" alt="PUCP" width={60} height={60} className="rounded-full" />
            <div>
              <h1 className="text-2xl font-bold text-balance text-white">PUCP Cloud Orchestrator</h1>
              <p className="text-sm text-white/80">Private Cloud Management Platform</p>
            </div>
          </div>
          <h2 className="text-5xl font-bold mb-6 text-balance leading-tight text-white">
            Orchestrate your cloud infrastructure with precision
          </h2>
          <p className="text-xl text-white/90 text-pretty">
            Manage virtual machine slices across Linux and OpenStack clusters with automated deployment and resource
            optimization.
          </p>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <Image src="/logo.png" alt="PUCP" width={48} height={48} className="rounded-full" />
            <h1 className="text-xl font-bold text-white">PUCP Cloud</h1>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
