
'use client' 

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {

  useEffect(() => {
    // Log the error to the console
    console.error("Application Error:", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-theme(spacing.32))] bg-background p-4">
        <Card className="w-full max-w-lg shadow-2xl border-destructive">
            <CardHeader>
                <div className="flex flex-col items-center text-center">
                    <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
                    <CardTitle className="text-2xl text-destructive">Application Error</CardTitle>
                    <CardDescription className="mt-2">
                        We're sorry, but something went wrong.
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent className="text-center">
                <p className="text-muted-foreground mb-6">
                    An unexpected error has occurred. Please try again, and if the problem persists, feel free to contact support.
                </p>
                <Button onClick={() => reset()} size="lg">
                    Try Again
                </Button>
                 <details className="mt-6 text-left text-xs text-muted-foreground bg-muted/50 p-2 rounded-md">
                    <summary className="cursor-pointer">Error Details</summary>
                    <p className="mt-2 break-all">{error.message}</p>
                </details>
            </CardContent>
        </Card>
    </div>
  )
}
