import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";

const VisuallyHidden = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { asChild?: boolean }>(
  ({ className, children, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "div";

    return (
      <Comp
        ref={ref}
        className={cn(
          "absolute left-[-9999px] top-[-9999px] overflow-hidden",
          "h-px w-px",
          "whitespace-nowrap",
          className
        )}
        {...props}
      >
        {children}
      </Comp>
    );
  }
);

VisuallyHidden.displayName = "VisuallyHidden";

export { VisuallyHidden };
