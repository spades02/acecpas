"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BackButtonProps {
  fallbackRoute?: string;
  label?: string;
}

export function BackButton({ 
  fallbackRoute = "/deals", 
  label = "Back" 
}: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    // Check if there is a history to go back to
    if (window.history.length > 1) {
      router.back();
    } else {
      // If the user opened this page directly (new tab), go to the fallback
      router.push(fallbackRoute);
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className="pl-0 mb-4 gap-2 text-muted-foreground hover:text-foreground"
      onClick={handleBack}
    >
      <ArrowLeft className="w-4 h-4" />
      {label}
    </Button>
  );
}