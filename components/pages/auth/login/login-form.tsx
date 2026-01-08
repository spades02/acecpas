import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ArrowRight } from "lucide-react"
import Link from 'next/link'

function LoginForm() {
  return (
    <div className="flex items-center justify-center bg-background p-8">
          <div className="mx-auto flex w-full max-w-[400px] flex-col justify-center space-y-6">
            <div className="flex flex-col space-y-2 text-left">
              <h1 className="text-3xl font-bold tracking-tight">Welcome Back</h1>
              <p className="text-sm text-muted-foreground">
                Sign in to continue to AceCPAs
              </p>
            </div>
            
            <div className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">EMAIL ADDRESS</Label>
                <Input
                  id="email"
                  placeholder="name@example.com"
                  type="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  defaultValue="demo@acecpas.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">PASSWORD</Label>
                <Input id="password" type="password" placeholder="••••••••" />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember" />
                  <Label htmlFor="remember" className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Remember me
                  </Label>
                </div>
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
  
              <Button className="w-full">
                Sign In <ArrowRight className="ml-2 h-4 w-4" />
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
              {/* <GoogleIcon /> */}
              Sign in with Google
            </Button>
            
            <div className="text-center text-sm">
              Don't have an account?{" "}
              <Link href="/signup" className="font-semibold text-primary hover:underline">
                Create one
              </Link>
            </div>
  
            <p className="text-center text-sm text-muted-foreground mt-8">
              © 2026 AceCPAs. All rights reserved.
            </p>
          </div>
        </div>
  )
}

export default LoginForm