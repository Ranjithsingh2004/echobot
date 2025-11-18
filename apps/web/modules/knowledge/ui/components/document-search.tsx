"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { toast } from "sonner";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Spinner } from "@workspace/ui/components/spinner";
import { Search, FileText } from "lucide-react";
import { Badge } from "@workspace/ui/components/badge";

/**
 * Document Search Component
 * Uses RAG to search knowledge base semantically
 */
export const DocumentSearch = () => {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const searchKnowledgeBase = useAction(api.private.ragIntegration.searchKnowledgeBase);

  const handleSearch = async () => {
    if (!query.trim()) {
      toast.error("Please enter a search query");
      return;
    }

    setSearching(true);

    try {
      const searchResults = await searchKnowledgeBase({
        query,
        limit: 5,
      });

      setResults(searchResults);

      if (searchResults.length === 0) {
        toast.info("No results found");
      }
    } catch (error: any) {
      console.error("Search error:", error);
      toast.error(error.message || "Failed to search knowledge base");
    } finally {
      setSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Search Knowledge Base
        </CardTitle>
        <CardDescription>
          Use semantic search to find relevant documents in your knowledge base
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="flex gap-2">
          <Input
            placeholder="What are you looking for?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={searching}
          />
          <Button onClick={handleSearch} disabled={searching || !query.trim()}>
            {searching ? <Spinner className="h-4 w-4" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>

        {/* Search Results */}
        {results.length > 0 && (
          <div className="space-y-3 mt-4">
            <h4 className="text-sm font-medium">Search Results</h4>
            {results.map((result) => (
              <div
                key={result._id}
                className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <h5 className="font-medium truncate">{result.title}</h5>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {(result.score * 100).toFixed(1)}% match
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {result.content.substring(0, 150)}...
                </p>
                <p className="text-xs text-muted-foreground mt-2">{result.fileName}</p>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!searching && results.length === 0 && query && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No results found. Try a different search term.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
