'use client';

import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export default function SignUpForm() {
  const handleSignup = () => {
    window.location.href = '/api/auth/login?screen_hint=signup';
  };

  const handleGoogleSignup = () => {
    window.location.href = '/api/auth/login?connection=google-oauth2&screen_hint=signup';
  };

  return (
    <div className="flex w-full items-center justify-center bg-background p-8">
      <div className="mx-auto flex w-full max-w-[400px] flex-col justify-center space-y-6">
        <div className="flex flex-col space-y-2 text-left">
          <h1 className="text-3xl font-bold tracking-tight">
            Create an account
          </h1>
          <p className="text-sm text-muted-foreground">
            Get started with AceCPAs
          </p>
        </div>

        <div className="grid gap-6">
          <Button onClick={handleSignup} className="w-full">
            Sign Up with Auth0 <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              OR CONTINUE WITH
            </span>
          </div>
        </div>

        <Button variant="outline" type="button" onClick={handleGoogleSignup} className="w-full gap-2">
          {/* <GoogleLogo /> */}
          Sign up with Google
        </Button>

        <div className="text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-4">
          © 2026 AceCPAs. All rights reserved.
        </p>
      </div>
    </div>
  )
}
