"use client";

import { useState } from "react";
import { DocumentUpload } from "../components/document-upload";
import { DocumentList } from "../components/document-list";
import { DocumentSearch } from "../components/document-search";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";

/**
 * Knowledge Base View
 * Main page component for managing organization's knowledge base
 * Includes document upload, list management, and semantic search
 */
export const KnowledgeBaseView = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUploadComplete = () => {
    // Trigger a re-render to refresh the document list
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
        <p className="text-muted-foreground mt-2">
          Manage your organization's knowledge base to enhance AI support with relevant context
        </p>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="documents" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="search">Search</TabsTrigger>
        </TabsList>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <DocumentList key={refreshKey} />
        </TabsContent>

        {/* Upload Tab */}
        <TabsContent value="upload" className="space-y-6">
          <DocumentUpload onUploadComplete={handleUploadComplete} />

          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-medium mb-2">How it works</h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Upload documents in PDF, TXT, MD, or DOC format (max 10MB)</li>
              <li>Content is automatically extracted and indexed</li>
              <li>AI generates embeddings for semantic search</li>
              <li>Documents become available to your support widget instantly</li>
            </ul>
          </div>
        </TabsContent>

        {/* Search Tab */}
        <TabsContent value="search" className="space-y-6">
          <DocumentSearch />

          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-medium mb-2">About Semantic Search</h3>
            <p className="text-sm text-muted-foreground">
              Our AI-powered search understands the meaning of your query, not just keywords.
              It finds relevant documents even if they don't contain the exact words you searched for.
              The match percentage indicates how relevant each result is to your query.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
