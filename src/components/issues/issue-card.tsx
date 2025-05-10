import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface Issue {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  potentialCauses: string[];
  solutions: string[];
}

interface IssueCardProps {
  issue: Issue;
}

export function IssueCard({ issue }: IssueCardProps) {
  return (
    <Card className="flex flex-col h-full shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      <div className="relative w-full h-48">
        <Image
          src={issue.imageUrl}
          alt={issue.title}
          layout="fill"
          objectFit="cover"
          data-ai-hint="technical diagram"
        />
      </div>
      <CardHeader>
        <CardTitle className="text-xl">{issue.title}</CardTitle>
        <CardDescription className="line-clamp-3">{issue.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div>
          <h4 className="font-semibold mb-1 text-sm">Potential Causes:</h4>
          <ul className="list-disc list-inside text-xs text-muted-foreground space-y-0.5">
            {issue.potentialCauses.slice(0, 2).map((cause, index) => (
              <li key={index} className="truncate">{cause}</li>
            ))}
            {issue.potentialCauses.length > 2 && <li className="text-xs">...and more</li>}
          </ul>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" asChild>
          <Link href={`/issues/${issue.id}`}>
            View Details <ChevronRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
