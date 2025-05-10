"use client";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit3, Trash2, Search, Image as ImageIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from 'react';
import type { Issue } from "@/components/issues/issue-card"; // Re-using the type

const initialMockIssues: Issue[] = [
  {
    id: "1",
    title: "Sensor Offline",
    description: "The sensor is not reporting any data to the dashboard.",
    imageUrl: "https://picsum.photos/seed/offline/80/60",
    potentialCauses: ["Power supply issue", "Network connectivity problem"],
    solutions: ["Check power cable.", "Verify Wi-Fi/GSM connection."],
  },
  {
    id: "2",
    title: "Inaccurate Temperature",
    description: "Temperature values are consistently off.",
    imageUrl: "https://picsum.photos/seed/temp/80/60",
    potentialCauses: ["Sensor miscalibration", "Sensor placement issue"],
    solutions: ["Recalibrate sensor.", "Relocate sensor."],
  },
];


export default function AdminManageIssuesPage() {
  const [issues, setIssues] = useState<Issue[]>(initialMockIssues);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentIssue, setCurrentIssue] = useState<Partial<Issue> | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddNew = () => {
    setCurrentIssue({});
    setIsModalOpen(true);
  };

  const handleEdit = (issue: Issue) => {
    setCurrentIssue(issue);
    setIsModalOpen(true);
  };
  
  const handleDelete = (issueId: string) => {
    // Add confirmation dialog in real app
    setIssues(issues.filter(issue => issue.id !== issueId));
  };

  const handleSaveIssue = () => {
    // In a real app, this would involve an API call
    if (currentIssue) {
      if (currentIssue.id) { // Editing existing
        setIssues(issues.map(iss => iss.id === currentIssue!.id ? currentIssue as Issue : iss));
      } else { // Adding new
        const newIssue = { ...currentIssue, id: `iss_${Date.now()}` } as Issue;
        // Ensure default empty arrays if not provided
        newIssue.potentialCauses = newIssue.potentialCauses || [];
        newIssue.solutions = newIssue.solutions || [];
        newIssue.imageUrl = newIssue.imageUrl || 'https://picsum.photos/seed/newissue/80/60';
        setIssues([...issues, newIssue]);
      }
    }
    setIsModalOpen(false);
    setCurrentIssue(null);
  };

  const filteredIssues = issues.filter(issue => 
    issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    issue.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        title="Manage Common Issues"
        description="Add, edit, or remove troubleshooting guides for common device problems."
      >
        <Button onClick={handleAddNew}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Issue
        </Button>
      </PageHeader>

      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 md:grow-0">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search issues..."
            className="w-full rounded-lg bg-background pl-8 md:w-[300px] lg:w-[400px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredIssues.map((issue) => (
              <TableRow key={issue.id}>
                <TableCell>
                  <Image
                    src={issue.imageUrl}
                    alt={issue.title}
                    width={64}
                    height={48}
                    className="rounded aspect-[4/3] object-cover"
                    data-ai-hint="device issue"
                  />
                </TableCell>
                <TableCell className="font-medium">{issue.title}</TableCell>
                <TableCell className="max-w-xs truncate">{issue.description}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(issue)} className="mr-2">
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(issue.id)} className="text-red-500 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
             {filteredIssues.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24">
                  No issues found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{currentIssue?.id ? "Edit Issue" : "Add New Issue"}</DialogTitle>
            <DialogDescription>
              Fill in the details for the troubleshooting guide. Click save when you&apos;re done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">Title</Label>
              <Input id="title" value={currentIssue?.title || ''} onChange={(e) => setCurrentIssue({...currentIssue, title: e.target.value})} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">Description</Label>
              <Textarea id="description" value={currentIssue?.description || ''} onChange={(e) => setCurrentIssue({...currentIssue, description: e.target.value})} className="col-span-3 min-h-[80px]" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="imageUrl" className="text-right">Image URL</Label>
              <Input id="imageUrl" value={currentIssue?.imageUrl || ''} onChange={(e) => setCurrentIssue({...currentIssue, imageUrl: e.target.value})} className="col-span-3" placeholder="https://picsum.photos/seed/example/600/400"/>
            </div>
            {/* Basic image upload placeholder */}
            <div className="grid grid-cols-4 items-center gap-4">
               <Label htmlFor="imageUpload" className="text-right self-start pt-2">Upload Image</Label>
               <div className="col-span-3">
                <Input id="imageUpload" type="file" className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"/>
                <p className="text-xs text-muted-foreground mt-1">Alternatively, provide an Image URL above.</p>
               </div>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="potentialCauses" className="text-right pt-2">Potential Causes</Label>
              <Textarea id="potentialCauses" value={currentIssue?.potentialCauses?.join('\n') || ''} onChange={(e) => setCurrentIssue({...currentIssue, potentialCauses: e.target.value.split('\n')})} className="col-span-3 min-h-[80px]" placeholder="One cause per line"/>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="solutions" className="text-right pt-2">Solutions</Label>
              <Textarea id="solutions" value={currentIssue?.solutions?.join('\n') || ''} onChange={(e) => setCurrentIssue({...currentIssue, solutions: e.target.value.split('\n')})} className="col-span-3 min-h-[80px]" placeholder="One solution per line"/>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="button" onClick={handleSaveIssue}>Save Issue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
