
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Reset Your Password</CardTitle>
          <CardDescription>
            Open a ticket on our Discord to get your password reset.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground text-center">
              For security and faster support, we handle password resets via our community Discord. Click below and open a ticket.
            </p>
            <a
              href="https://discord.gg/gMz8jgA9SC"
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button className="w-full" size="lg">
                Join Discord & Open a Ticket
              </Button>
            </a>
          </div>
          <div className="mt-4 text-center text-sm">
            <Link href="/login" className="underline text-muted-foreground hover:text-foreground">
              Back to login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
