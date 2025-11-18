# Knowledge Base & RAG Integration

## Overview

The Knowledge Base module implements a complete Retrieval-Augmented Generation (RAG) system for enhancing AI support with organization-specific context. Documents uploaded to the knowledge base are automatically indexed using embeddings and can be semantically searched to provide relevant context to customer support queries.

## Features

### Document Management
- **Upload**: Support for PDF, TXT, MD, and DOC files (up to 10MB)
- **Storage**: Files stored in Convex storage with metadata in database
- **Organization Scoped**: Each organization has isolated knowledge base
- **CRUD Operations**: Create, read, update, and delete documents

### RAG Integration
- **Embeddings Generation**: Automatic generation using OpenAI text-embedding-3-small
- **Vector Search**: Semantic search using Convex vector indexes
- **Context Retrieval**: Intelligent context extraction for AI responses
- **Similarity Scoring**: Results ranked by relevance

### UI Components
- **Document Upload**: Drag-and-drop with progress tracking
- **Document List**: View, rename, delete, and regenerate embeddings
- **Semantic Search**: Test RAG search capabilities
- **Tabs Interface**: Clean organization of features

## File Structure

```
packages/backend/convex/
├── schema.ts                          # Database schema with vector index
├── private/
│   ├── knowledgeBase.ts              # CRUD operations
│   ├── rag.ts                        # RAG and embeddings logic
│   └── widgetIntegration.ts          # Widget context integration

apps/web/modules/knowledge/
├── lib/
│   └── validation.ts                 # Zod schemas
├── ui/
│   ├── components/
│   │   ├── document-upload.tsx       # File upload with progress
│   │   ├── document-list.tsx         # Document management
│   │   └── document-search.tsx       # RAG search interface
│   └── views/
│       └── knowledge-base-view.tsx   # Main view
└── README.md                         # This file
```

## Database Schema

### knowledgeBase Table

```typescript
{
  organizationId: string,           // Organization identifier
  title: string,                    // Document title
  content: string,                  // Extracted text content
  mimeType: string,                 // File MIME type
  fileName: string,                 // Original filename
  embedUrl: string?,                // Optional external URL
  storageId: Id<"_storage">?,       // Convex storage reference
  embedding: number[]?,             // 1536-dim vector
  createdAt: number,                // Timestamp
  updatedAt: number?                // Last update timestamp
}
```

### Indexes
- `by_organization_id`: Filter by organization
- `by_created_at`: Sort by creation date
- `by_embedding`: Vector index for semantic search (1536 dimensions)

## Backend API

### Queries

#### `knowledgeBase.getAll()`
Get all documents for current organization, sorted by creation date.

#### `knowledgeBase.getOne({ documentId })`
Get single document by ID with ownership verification.

#### `knowledgeBase.getFileUrl({ storageId })`
Get temporary download URL for stored file.

#### `rag.hasEmbedding({ documentId })`
Check if document has generated embeddings.

### Mutations

#### `knowledgeBase.create({ title, content, mimeType, fileName, embedUrl?, storageId? })`
Create new knowledge base document.

#### `knowledgeBase.update({ documentId, title?, content? })`
Update document metadata. Clears embeddings if content changes.

#### `knowledgeBase.remove({ documentId })`
Delete document and associated storage file.

#### `knowledgeBase.generateUploadUrl()`
Generate URL for uploading files to Convex storage.

### Actions

#### `rag.generateEmbedding({ documentId })`
Generate and store embeddings for document content using OpenAI.

#### `rag.searchKnowledgeBase({ query, limit? })`
Semantic search across knowledge base. Returns ranked results.

#### `rag.getContextForQuery({ query, maxTokens? })`
Get relevant context for AI agent. Returns formatted context and sources.

#### `widgetIntegration.getAugmentedResponse({ query, conversationHistory? })`
Get AI response augmented with knowledge base context.

## Usage Examples

### Upload Document

```typescript
import { useMutation, useAction } from "convex/react";
import { api } from "@workspace/backend/_generated/api";

const generateUploadUrl = useMutation(api.private.knowledgeBase.generateUploadUrl);
const createDocument = useMutation(api.private.knowledgeBase.create);
const generateEmbedding = useAction(api.private.rag.generateEmbedding);

// 1. Generate upload URL
const uploadUrl = await generateUploadUrl();

// 2. Upload file
const response = await fetch(uploadUrl, {
  method: "POST",
  body: file,
});
const { storageId } = await response.json();

// 3. Create document
const documentId = await createDocument({
  title: "Product Manual",
  content: extractedText,
  mimeType: "application/pdf",
  fileName: "manual.pdf",
  storageId,
});

// 4. Generate embeddings
await generateEmbedding({ documentId });
```

### Search Knowledge Base

```typescript
import { useAction } from "convex/react";
import { api } from "@workspace/backend/_generated/api";

const search = useAction(api.private.rag.searchKnowledgeBase);

const results = await search({
  query: "How do I reset my password?",
  limit: 5,
});

// results = [{ _id, title, content, score, ... }]
```

### Get Context for AI

```typescript
import { useAction } from "convex/react";
import { api } from "@workspace/backend/_generated/api";

const getContext = useAction(api.private.rag.getContextForQuery);

const { context, sources } = await getContext({
  query: "Tell me about pricing",
  maxTokens: 2000,
});

// Use context to augment AI prompt
const systemMessage = `You are a support assistant. Use this context: ${context}`;
```

## Environment Variables

Required environment variables:

```
OPENAI_API_KEY=sk-...           # For embeddings and AI responses
```

## Permissions

All operations require:
- Valid authentication (Clerk)
- Organization membership
- Operations are scoped to organization

## Limitations

### Current Implementation
- Text extraction only for TXT and MD files
- PDF and DOC content extraction requires additional libraries
- Max file size: 10MB
- Vector dimensions: 1536 (OpenAI text-embedding-3-small)

### Production Considerations
- Add proper PDF parsing (pdf.js)
- Add DOC parsing (mammoth.js)
- Implement chunking for large documents
- Add rate limiting for embeddings generation
- Cache frequently accessed contexts
- Monitor embedding costs
- Add batch processing for multiple uploads

## Testing

1. **Upload Test**: Upload sample documents in different formats
2. **Search Test**: Test semantic search with various queries
3. **Context Test**: Verify AI responses use knowledge base context
4. **Permissions Test**: Ensure organization isolation
5. **Edge Cases**: Empty files, large files, special characters

## Future Enhancements

- [ ] Batch upload support
- [ ] Document versioning
- [ ] Folder organization
- [ ] Collaborative editing
- [ ] Advanced filtering
- [ ] Analytics dashboard
- [ ] Multi-language support
- [ ] Custom embedding models
- [ ] Hybrid search (keyword + semantic)
- [ ] Document summarization
