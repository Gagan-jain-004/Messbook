import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <SignIn
        appearance={{
          variables: {
            colorPrimary: "#10b981",
            colorBackground: "#0a0a0a",
            colorForeground: "#e5e2e1",
            colorBorder: "#262626",
          },
          elements: {
            card: "premium-border rounded-xl shadow-2xl",
            socialButtonsBlockButton: "border border-border hover:bg-surface-low text-white",
            headerTitle: "text-white font-bold",
            headerSubtitle: "text-muted-foreground",
            formButtonPrimary: "bg-secondary text-secondary-foreground hover:opacity-90 transition-opacity",
            footerActionText: "text-muted-foreground",
            footerActionLink: "text-secondary hover:underline",
          },
        }}
      />
    </div>
  );
}
