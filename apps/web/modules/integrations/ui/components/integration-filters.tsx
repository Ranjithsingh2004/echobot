"use client";

import { Button } from "@workspace/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { FilterIcon } from "lucide-react";
import { INTEGRATION_CATEGORIES, type IntegrationCategory } from "../../constants";

interface IntegrationFiltersProps {
  selectedCategory: IntegrationCategory;
  onCategoryChange: (category: IntegrationCategory) => void;
  showConnectedOnly: boolean;
  onShowConnectedOnlyChange: (show: boolean) => void;
  connectedCount?: number;
}

/**
 * Filter component for integrations
 * Provides category tabs and additional filter options
 */
export const IntegrationFilters = ({
  selectedCategory,
  onCategoryChange,
  showConnectedOnly,
  onShowConnectedOnlyChange,
  connectedCount = 0,
}: IntegrationFiltersProps) => {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Category tabs - hidden on mobile, shown on desktop */}
      <div className="hidden md:block">
        <Tabs
          value={selectedCategory}
          onValueChange={(value: string) =>
            onCategoryChange(value as IntegrationCategory)
          }
        >
          <TabsList className="flex-wrap">
            {INTEGRATION_CATEGORIES.map((category) => {
              const Icon = category.icon;
              return (
                <TabsTrigger
                  key={category.value}
                  value={category.value}
                  className="gap-2"
                >
                  <Icon className="size-4" />
                  <span className="hidden lg:inline">{category.label}</span>
                  <span className="lg:hidden">
                    {category.label
                      .replace("Integrations", "")
                      .replace("All ", "All")
                      .trim()}
                  </span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
      </div>

      {/* Mobile dropdown for categories */}
      <div className="md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full gap-2">
              <FilterIcon className="size-4" />
              {
                INTEGRATION_CATEGORIES.find(
                  (c) => c.value === selectedCategory
                )?.label
              }
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
            <DropdownMenuSeparator />

            {INTEGRATION_CATEGORIES.map((category) => {
              const Icon = category.icon;
              return (
                <DropdownMenuItem
                  key={category.value}
                  onClick={() => onCategoryChange(category.value)}
                  className="gap-2"
                >
                  <Icon className="size-4" />
                  {category.label}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Additional filters */}
      <div className="flex items-center gap-2">
        <Button
          variant={showConnectedOnly ? "default" : "outline"}
          size="sm"
          onClick={() => onShowConnectedOnlyChange(!showConnectedOnly)}
          className="gap-2"
        >
          <FilterIcon className="size-4" />
          Connected Only
          {connectedCount > 0 && (
            <span className="ml-1 rounded-full bg-background px-2 py-0.5 text-xs text-foreground">
              {connectedCount}
            </span>
          )}
        </Button>
      </div>
    </div>
  );
};
