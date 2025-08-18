
'use client'
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, MessageSquarePlus, AlertTriangle } from "lucide-react";
import type { Issue } from "@/components/issues/issue-card";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";


async function getIssueDetails(id: string): Promise<Issue | null> {
    try {
        const response = await fetch(`/api/issues/${id}`, { cache: 'no-store' }); // Use no-store for dynamic fetching
        if (!response.ok) {
            return null;
        }
        return response.json();
    } catch (error) {
        console.error("Failed to fetch issue details:", error);
        return null;
    }
}


export default function IssueDetailPage({ params }: { params: { id: string } }) {
  const { data: issue, isLoading, error } = useQuery<Issue | null>({
    queryKey: ['issueDetails', params.id],
    queryFn: () => getIssueDetails(params.id),
  });

  if (isLoading) {
    return (
       <div className="space-y-6 md:space-y-8">
        <PageHeader title="Loading Guide..." />
        <Card className="overflow-hidden shadow-lg">
            <Skeleton className="w-full h-64 md:h-96" />
            <CardContent className="p-6 space-y-6">
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-20 w-full" />
            </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div>
        <PageHeader title="Issue Not Found" />
         <Card className="text-center p-8 border-destructive">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4"/>
            <p className="text-lg">The requested troubleshooting guide could not be found.</p>
            <p className="text-muted-foreground">It might have been moved or deleted.</p>
            <Button variant="outline" asChild className="mt-6">
              <Link href="/issues">
                <ChevronLeft className="mr-2 h-4 w-4" /> Back to All Issues
              </Link>
            </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader title={issue.title} description={issue.description} />
      
      <Card className="overflow-hidden shadow-lg">
        <div className="relative w-full h-64 md:h-96">
          <Image
            src={issue.image_url}
            alt={issue.title}
            layout="fill"
            objectFit="cover"
            data-ai-hint="technical illustration"
          />
        </div>
        <CardContent className="p-6">
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3 text-primary">Potential Causes</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              {issue.potential_causes.map((cause, index) => (
                <li key={index}>{cause}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-primary">Suggested Solutions</h2>
            <ul className="list-decimal list-inside space-y-2 text-muted-foreground">
              {issue.solutions.map((solution, index) => (
                <li key={index}>{solution}</li>
              ))}
            </ul>
          </section>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Still need help?</CardTitle>
          <CardDescription>
            If these solutions don't resolve your problem, our AI assistant might be able to provide more specific guidance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild size="lg">
            <Link href={`/troubleshoot?issue=${issue.title}`}>
              <MessageSquarePlus className="mr-2 h-5 w-5" /> Ask AI Assistant
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Button variant="outline" asChild>
        <Link href="/issues">
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to All Issues
        </Link>
      </Button>
    </div>
  );
}
