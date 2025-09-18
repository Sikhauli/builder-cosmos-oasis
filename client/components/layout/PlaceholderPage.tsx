import { ReactNode } from "react";

export function PlaceholderPage({
  title,
  children,
  description,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="container mx-auto py-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h1 className="text-sm font-semibold tracking-tight">{title}</h1>
          {description ? (
            <p className="mt-1 max-w-2xl text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </div>
      <div className="rounded-md border bg-card p-3 text-xs text-muted-foreground">
        This section is ready to implement based on your priorities. Use the chat to describe the exact data and interactions you want here and we will wire it up.
      </div>
    </div>
  );
}

export default PlaceholderPage;
