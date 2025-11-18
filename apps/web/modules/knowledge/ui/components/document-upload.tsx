"use client";

import { useState, useRef } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { toast } from "sonner";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Progress } from "@workspace/ui/components/progress";
import { Spinner } from "@workspace/ui/components/spinner";
import { Upload, FileText } from "lucide-react";
import { SUPPORTED_FILE_TYPES, MAX_FILE_SIZE } from "../../lib/validation";

/**
 * Document Upload Component
 * Handles file upload with progress indication
 * Supports PDF, TXT, MD, and DOC files
 */
export const DocumentUpload = ({ onUploadComplete }: { onUploadComplete?: () => void }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateUploadUrl = useMutation(api.private.knowledgeBase.generateUploadUrl);
  const createDocument = useMutation(api.private.knowledgeBase.create);
  const generateEmbedding = useAction(api.private.ragIntegration.generateEmbedding);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    // Validate file type
    if (!SUPPORTED_FILE_TYPES.includes(file.type as any)) {
      toast.error("File type not supported. Please upload PDF, TXT, MD, or DOC files.");
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`);
      return;
    }

    setSelectedFile(file);
  };

  const extractTextFromFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const text = e.target?.result as string;
        resolve(text);
      };

      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };

      // For now, only handle text files
      // For PDF and DOC, you'd need additional libraries
      if (file.type === "text/plain" || file.type === "text/markdown") {
        reader.readAsText(file);
      } else {
        // For PDF/DOC, return placeholder
        // In production, use libraries like pdf.js or mammoth.js
        resolve("[Content extraction not implemented for this file type]");
      }
    });
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Step 1: Generate upload URL (10%)
      setUploadProgress(10);
      const uploadUrl = await generateUploadUrl();

      // Step 2: Upload file to storage (50%)
      setUploadProgress(20);
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": selectedFile.type },
        body: selectedFile,
      });

      if (!result.ok) {
        throw new Error("Failed to upload file");
      }

      const { storageId } = await result.json();
      setUploadProgress(50);

      // Step 3: Extract text content (70%)
      const content = await extractTextFromFile(selectedFile);
      setUploadProgress(70);

      // Step 4: Create document record (80%)
      const documentId = await createDocument({
        title: selectedFile.name.replace(/\.[^/.]+$/, ""), // Remove file extension
        content,
        mimeType: selectedFile.type,
        fileName: selectedFile.name,
        storageId,
      });

      setUploadProgress(85);

      // Step 5: Generate embeddings (100%)
      await generateEmbedding({ documentId });
      setUploadProgress(100);

      toast.success("Document uploaded successfully!");

      // Reset state
      setSelectedFile(null);
      setUploadProgress(0);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Notify parent component
      onUploadComplete?.();
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Knowledge Base Document
        </CardTitle>
        <CardDescription>
          Upload documents to enhance your AI support with relevant context. Supports PDF, TXT, MD, and DOC files.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Input */}
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept={SUPPORTED_FILE_TYPES.join(",")}
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              asChild
            >
              <span>
                <FileText className="mr-2 h-4 w-4" />
                {selectedFile ? selectedFile.name : "Choose File"}
              </span>
            </Button>
          </label>
        </div>

        {/* Selected File Info */}
        {selectedFile && (
          <div className="text-sm text-muted-foreground">
            <p>Size: {(selectedFile.size / 1024).toFixed(2)} KB</p>
            <p>Type: {selectedFile.type}</p>
          </div>
        )}

        {/* Upload Progress */}
        {uploading && (
          <div className="space-y-2">
            <Progress value={uploadProgress} className="w-full" />
            <p className="text-sm text-muted-foreground text-center">
              {uploadProgress < 50 && "Uploading file..."}
              {uploadProgress >= 50 && uploadProgress < 70 && "Extracting content..."}
              {uploadProgress >= 70 && uploadProgress < 85 && "Creating document..."}
              {uploadProgress >= 85 && "Generating embeddings..."}
            </p>
          </div>
        )}

        {/* Upload Button */}
        <Button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className="w-full"
        >
          {uploading ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Document
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
