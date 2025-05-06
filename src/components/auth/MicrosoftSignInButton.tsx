import { Button } from "@/components/ui/button";

interface MicrosoftSignInButtonProps {
  mode: "signin" | "signup";
}

export function MicrosoftSignInButton({ mode }: MicrosoftSignInButtonProps) {
  return (
    <Button variant="outline" className="w-full">
      <img src="/microsoft.svg" alt="Microsoft" className="mr-2 h-4 w-4" />
      {mode === "signin" ? "Connect with Microsoft" : "Sign up with Microsoft"}
    </Button>
  );
} 