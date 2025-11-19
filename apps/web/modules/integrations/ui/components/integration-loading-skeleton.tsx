import { Card, CardContent, CardFooter, CardHeader } from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";

/**
 * Loading skeleton for integration cards
 * Displays while data is being fetched
 */
export const IntegrationLoadingSkeleton = () => {
  return (
    <Card className="h-full">
      <CardHeader className="space-y-4">
        <div className="flex items-start gap-4">
          <Skeleton className="size-12 shrink-0 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-5 w-20" />
          </div>
        </div>
        <Skeleton className="h-10 w-full" />
      </CardHeader>

      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-16" />
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </CardContent>

      <CardFooter className="flex-col gap-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-9 w-full" />
      </CardFooter>
    </Card>
  );
};

/**
 * Grid of loading skeletons
 */
export const IntegrationLoadingGrid = ({ count = 4 }: { count?: number }) => {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <IntegrationLoadingSkeleton key={index} />
      ))}
    </div>
  );
};
