import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

export default function SignUpForm() {
  return (
    <div className="flex w-full items-center justify-center bg-background p-8">
      <div className="mx-auto flex w-full max-w-[400px] flex-col justify-center space-y-6">
        <div className="flex flex-col space-y-2 text-left">
          <h1 className="text-3xl font-bold tracking-tight">
            Create an account
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your information to get started with AceCPAs
          </p>
        </div>

        <div className="grid gap-6">
          {/* Name Fields Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="first-name">FIRST NAME</Label>
              <Input id="first-name" placeholder="John" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="last-name">LAST NAME</Label>
              <Input id="last-name" placeholder="Doe" required />
            </div>
          </div>

          {/* Email Field */}
          <div className="grid gap-2">
            <Label htmlFor="email">EMAIL ADDRESS</Label>
            <Input
              id="email"
              placeholder="name@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              required
            />
          </div>

          {/* Password Field */}
          <div className="grid gap-2">
            <Label htmlFor="password">PASSWORD</Label>
            <Input id="password" type="password" placeholder="••••••••" />
            <p className="text-[0.8rem] text-muted-foreground">
              Must be at least 8 characters
            </p>
          </div>

          {/* Terms Checkbox */}
          <div className="flex items-start space-x-2">
            <Checkbox id="terms" className="mt-1" />
            <Label
              htmlFor="terms"
              className="text-sm font-normal leading-tight peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I agree to the{" "}
              <Link
                href="/terms"
                className="font-medium text-primary hover:underline"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="font-medium text-primary hover:underline"
              >
                Privacy Policy
              </Link>
              .
            </Label>
          </div>

          <Button className="w-full">
            Create Account <ArrowRight className="ml-2 h-4 w-4" />
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

        <Button variant="outline" type="button" className="w-full gap-2">
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