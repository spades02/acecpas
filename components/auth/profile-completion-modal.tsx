"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { createClient } from "@supabase/supabase-js"

export function ProfileCompletionModal() {
    console.log("ProfileCompletionModal: Component checking in...");
    const { profile, refetch, isLoading } = useAuth()
    const [isOpen, setIsOpen] = useState(false)
    const [fullName, setFullName] = useState("")
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (isLoading || !profile) return

        // 1. Is name missing?
        const missingName = !profile.full_name || profile.full_name.trim() === '';

        // 2. Or does it look like an email? (Simple heuristic: has '@' or matches email field)
        const isEmailName = profile.full_name && (
            profile.full_name.includes('@') ||
            (profile.email && profile.full_name === profile.email)
        );

        if (missingName || isEmailName) {
            console.log('ProfileCompletionModal: Opening modal due to missing/email name', {
                missingName,
                isEmailName,
                fullName: profile.full_name
            });
            setIsOpen(true)

            // If it is an email-name, we want them to change it.
            // We pre-fill it so they see what it currently is.
            if (profile.full_name) {
                setFullName(profile.full_name)
            }
        } else {
            console.log('ProfileCompletionModal: Name is valid, not opening.', { fullName: profile.full_name });
        }
    }, [profile, isLoading])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!fullName.trim() || !profile) return

        setSaving(true)
        try {
            const res = await fetch('/api/user/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ full_name: fullName.trim() })
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Failed to update')
            }

            await refetch()
            setIsOpen(false)
            toast.success("Profile updated!")
        } catch (error) {
            console.error(error)
            toast.error("Failed to update profile")
        } finally {
            setSaving(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            // Prevent closing if we still need a valid name
            if (!open && (!fullName.trim() || fullName.includes('@'))) {
                return;
            }
            setIsOpen(open);
        }}>
            <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e: Event) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>Complete Your Profile</DialogTitle>
                    <DialogDescription>
                        Please enter your full name (First Last) to continue.<br />
                        This helps your team identify you on the platform.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="e.g. John Doe"
                                autoFocus
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={!fullName.trim() || saving}>
                            {saving ? "Saving..." : "Save & Continue"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
