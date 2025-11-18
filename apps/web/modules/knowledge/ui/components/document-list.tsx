"use client";

import { useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Id } from "@workspace/backend/convex/_generated/dataModel";
import { toast } from "sonner";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Spinner } from "@workspace/ui/components/spinner";
import { FileText, Trash2, Edit2, Sparkles, Download } from "lucide-react";
import { Badge } from "@workspace/ui/components/badge";

/**
 * Document List Component
 * Displays all knowledge base documents for the organization
 * Supports delete, rename, and re-generate embeddings
 */
export const DocumentList = () => {
  const documents = useQuery(api.private.knowledgeBase.getAll);
  const removeDocument = useMutation(api.private.knowledgeBase.remove);
  const updateDocument = useMutation(api.private.knowledgeBase.update);
  const generateEmbedding = useAction(api.private.ragIntegration.generateEmbedding);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Id<"knowledgeBase"> | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [processingDoc, setProcessingDoc] = useState<Id<"knowledgeBase"> | null>(null);

  const handleDelete = async () => {
    if (!selectedDocument) return;

    try {
      await removeDocument({ documentId: selectedDocument });
      toast.success("Document deleted successfully");
      setDeleteDialogOpen(false);
      setSelectedDocument(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete document");
    }
  };

  const handleRename = async () => {
    if (!selectedDocument || !newTitle.trim()) return;

    try {
      await updateDocument({
        documentId: selectedDocument,
        title: newTitle,
      });
      toast.success("Document renamed successfully");
      setRenameDialogOpen(false);
      setSelectedDocument(null);
      setNewTitle("");
    } catch (error: any) {
      toast.error(error.message || "Failed to rename document");
    }
  };

  const handleRegenerateEmbedding = async (documentId: Id<"knowledgeBase">) => {
    setProcessingDoc(documentId);

    try {
      await generateEmbedding({ documentId });
      toast.success("Embeddings regenerated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to regenerate embeddings");
    } finally {
      setProcessingDoc(null);
    }
  };

  const openDeleteDialog = (documentId: Id<"knowledgeBase">) => {
    setSelectedDocument(documentId);
    setDeleteDialogOpen(true);
  };

  const openRenameDialog = (documentId: Id<"knowledgeBase">, currentTitle: string) => {
    setSelectedDocument(documentId);
    setNewTitle(currentTitle);
    setRenameDialogOpen(true);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes("pdf")) return "📄";
    if (mimeType.includes("text")) return "📝";
    if (mimeType.includes("word")) return "📃";
    return "📄";
  };

  // Loading state
  if (documents === undefined) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-12">
          <Spinner className="h-8 w-8" />
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (documents.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No documents yet</h3>
          <p className="text-muted-foreground text-sm">
            Upload your first document to start building your knowledge base
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Knowledge Base Documents</CardTitle>
          <CardDescription>
            {documents.length} document{documents.length !== 1 ? "s" : ""} in your knowledge base
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {documents.map((doc) => (
              <div
                key={doc._id}
                className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start gap-3 flex-1">
                  <span className="text-2xl">{getFileIcon(doc.mimeType)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium truncate">{doc.title}</h4>
                      {doc.embedding && (
                        <Badge variant="secondary" className="text-xs">
                          <Sparkles className="h-3 w-3 mr-1" />
                          Indexed
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{doc.fileName}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Uploaded {formatDate(doc.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openRenameDialog(doc._id, doc.title)}
                    disabled={processingDoc === doc._id}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRegenerateEmbedding(doc._id)}
                    disabled={processingDoc === doc._id}
                  >
                    {processingDoc === doc._id ? (
                      <Spinner className="h-4 w-4" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openDeleteDialog(doc._id)}
                    disabled={processingDoc === doc._id}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this document? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Document</DialogTitle>
            <DialogDescription>Enter a new title for this document</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Document title"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRename} disabled={!newTitle.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
