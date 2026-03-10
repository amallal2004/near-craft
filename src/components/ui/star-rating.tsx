import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: number;
  className?: string;
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

export function StarRating({ rating, max = 5, size = 16, className, interactive, onChange }: StarRatingProps) {
  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          size={size}
          className={cn(
            "transition-colors",
            i < Math.round(rating) ? "fill-warning text-warning" : "text-muted-foreground/30",
            interactive && "cursor-pointer hover:text-warning"
          )}
          onClick={() => interactive && onChange?.(i + 1)}
        />
      ))}
    </div>
  );
}
