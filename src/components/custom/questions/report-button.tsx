"use client";

import { ShieldAlert } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { reportQuestion } from "@/actions/questions";

export function ReportButton({ questionId, showText = false }: { questionId: string; showText?: boolean }) {
  const [isReporting, setIsReporting] = useState(false);
  const [open, setOpen] = useState(false);

  const handleReport = async (e: React.MouseEvent) => {
    e.preventDefault(); 
    setIsReporting(true);
    const res = await reportQuestion(questionId);
    
    if (res.status === "success") {
      toast.success(res.message);
    } else {
      toast.error(res.message || "Failed to report question");
    }
    setIsReporting(false);
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size={showText ? "default" : "icon"}
          className={
            showText
              ? "h-8 rounded-full border-rose-200 bg-rose-50/50 px-4 text-xs font-bold tracking-tight text-rose-600 shadow-sm transition-all hover:bg-rose-100 hover:text-rose-700"
              : "h-8 w-8 rounded-full text-muted-foreground hover:bg-rose-50 hover:text-rose-600 transition-colors"
          }
          title="Report spam"
        >
          <ShieldAlert className={showText ? "mr-1.5 h-3.5 w-3.5" : "h-4 w-4"} />
          {showText && "Report Spam"}
        </Button>
      </AlertDialogTrigger>
      
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-rose-600">
            <ShieldAlert className="h-5 w-5" />
            Report this question?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to flag this question as spam or irrelevant? 
            If a question receives enough reports, it will be automatically hidden from the platform.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleReport}
            className="bg-rose-600 hover:bg-rose-700 text-white"
          >
            {isReporting ? "Reporting..." : "Yes, Report It"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
