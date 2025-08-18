
"use client";
import { PageHeader } from "@/components/shared/page-header";
import { IssueCard, type Issue } from "@/components/issues/issue-card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const fetchIssues = async (): Promise<Issue[]> => {
    const response = await fetch('/api/issues');
    if (!response.ok) {
        throw new Error('Failed to fetch issues');
    }
    return response.json();
};

export default function IssuesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: issues = [], isLoading, error } = useQuery<Issue[]>({
    queryKey: ['issues'],
    queryFn: fetchIssues,
  });

  const filteredIssues = issues.filter(issue =>
    issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    issue.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        title="Common Troubleshooting Guides"
        description="Find solutions to frequently encountered sensor and device issues."
      />
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input 
            type="search" 
            placeholder="Search issues..." 
            className="pl-10 w-full md:w-1/2 lg:w-1/3"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      {isLoading ? (
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
                <CardSkeleton key={i} />
            ))}
        </div>
      ) : error ? (
        <p className="text-center text-destructive py-8">Failed to load troubleshooting guides. Please try again later.</p>
      ) : filteredIssues.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIssues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-8">No common issues found. Try a different search term.</p>
      )}
    </div>
  );
}


function CardSkeleton() {
    return (
        <div className="flex flex-col h-full shadow-lg border rounded-lg overflow-hidden">
            <Skeleton className="w-full h-48" />
            <div className="p-6 space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
            </div>
            <div className="p-6 pt-0 mt-auto">
                <Skeleton className="h-10 w-full" />
            </div>
        </div>
    )
}
