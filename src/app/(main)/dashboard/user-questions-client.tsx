"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Edit3, Trash2, X, Check, FileQuestion, Sparkles, MessageCircleCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { deleteUserQuestion, updateUserQuestion } from "@/actions/questions";
import { motion, AnimatePresence } from "motion/react";

type MyQuestion = {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
};

export function UserQuestionsClient({ initialQuestions }: { initialQuestions: MyQuestion[] }) {
  const [questions, setQuestions] = useState<MyQuestion[]>(initialQuestions);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const startEditing = (q: MyQuestion) => {
    setEditingId(q.id);
    setEditTitle(q.title);
    setEditDesc(q.description);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditTitle("");
    setEditDesc("");
  };

  const handleSave = async (id: string) => {
    if (!editTitle.trim() || !editDesc.trim()) {
      toast.error("Title and description are required.");
      return;
    }
    setIsSaving(true);
    const res = await updateUserQuestion(id, { title: editTitle, description: editDesc });
    if (res.status === "success") {
      setQuestions((prev) =>
        prev.map((q) => (q.id === id ? { ...q, title: editTitle, description: editDesc } : q))
      );
      toast.success("Question updated successfully.");
      cancelEditing();
    } else {
      toast.error(res.message || "Failed to update question.");
    }
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    const res = await deleteUserQuestion(id);
    if (res.status === "success") {
      setQuestions((prev) => prev.filter((q) => q.id !== id));
      toast.success("Question deleted successfully.");
    } else {
      toast.error(res.message || "Failed to delete question.");
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 relative">
      <div className="absolute top-0 right-10 -z-10 w-96 h-96 bg-primary/5 rounded-full blur-[100px]" />
      
      <div className="mb-10 flex items-center gap-3 border-b border-border/50 pb-4">
        <div className="bg-primary/10 p-2.5 rounded-xl border border-primary/20 shadow-sm">
          <MessageCircleCode className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">Your Question Vault</h2>
          <p className="text-sm text-muted-foreground font-medium">Manage and refine the knowledge you've shared.</p>
        </div>
      </div>

      {questions.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-border/70 bg-gradient-to-b from-card/30 to-card/5 py-24 text-center shadow-sm"
        >
          <div className="mb-6 relative">
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
            <div className="relative bg-background rounded-full p-6 border border-border/60 shadow-xl">
              <FileQuestion className="h-10 w-10 text-primary" />
            </div>
          </div>
          <h3 className="text-2xl font-black mb-2">No contributions yet</h3>
          <p className="max-w-md text-muted-foreground text-sm">
            You haven't added any interview questions. When you do, they will appear here as elegant knowledge cards.
          </p>
        </motion.div>
      ) : (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          <AnimatePresence>
            {questions.map((q, i) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                key={q.id}
                className="group relative break-inside-avoid overflow-hidden rounded-3xl border border-border/50 bg-card p-1 shadow-sm transition-all hover:shadow-xl hover:shadow-primary/5"
              >
                {/* Decorative glowing edge that appears on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-violet-500/20 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                
                <div className="relative h-full rounded-2xl bg-background/90 backdrop-blur-md p-6">
                  {editingId === q.id ? (
                    <motion.div 
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="flex flex-col gap-4"
                    >
                      <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-1">
                        <Sparkles className="h-3.5 w-3.5" />
                        Refining Output
                      </div>
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="Title..."
                        className="font-extrabold text-lg border-0 border-b-2 border-primary/20 rounded-none px-0 shadow-none focus-visible:ring-0 focus-visible:border-primary transition-colors"
                      />
                      <Textarea
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        placeholder="Description..."
                        className="min-h-[120px] resize-none border border-border/50 rounded-xl p-3 text-sm focus-visible:ring-1 focus-visible:ring-primary shadow-inner bg-muted/20"
                      />
                      <div className="mt-2 flex gap-2 w-full">
                        <Button
                          size="sm"
                          onClick={() => handleSave(q.id)}
                          disabled={isSaving}
                          className="flex-1 bg-foreground text-background hover:bg-foreground/90 rounded-xl"
                        >
                          <Check className="h-4 w-4 mr-2" /> Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={cancelEditing}
                          disabled={isSaving}
                          className="flex-1 rounded-xl border border-border/50"
                        >
                          <X className="h-4 w-4 mr-2" /> Cancel
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    <>
                      <div className="mb-4">
                        <div className="flex justify-between items-start gap-4 mb-3">
                          <h3 className="font-black text-xl leading-tight text-foreground/90 transition-colors group-hover:text-primary">
                            {q.title}
                          </h3>
                        </div>
                        <p className="text-sm text-muted-foreground/80 leading-relaxed">
                          {q.description}
                        </p>
                      </div>

                      <div className="mt-8 flex items-end justify-between">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                          {formatDistanceToNow(new Date(q.createdAt), { addSuffix: true })}
                        </div>
                        
                        <div className="flex items-center gap-1 opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 rounded-full border-border/50 bg-background/50 hover:bg-primary/10 hover:text-primary hover:border-primary/30 backdrop-blur-sm px-3 text-xs"
                            onClick={() => startEditing(q)}
                          >
                            <Edit3 className="h-3.5 w-3.5 mr-1.5" /> Edit
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8 rounded-full border-border/50 bg-background/50 hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/30 backdrop-blur-sm"
                            onClick={() => handleDelete(q.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
