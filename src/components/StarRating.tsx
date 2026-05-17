import { Star } from "lucide-react";

export function StarRating({
  value,
  onChange,
  size = 16,
  readOnly = true,
}: {
  value: number;
  onChange?: (v: number) => void;
  size?: number;
  readOnly?: boolean;
}) {
  return (
    <div className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= Math.round(value);
        return (
          <button
            key={n}
            type="button"
            disabled={readOnly}
            onClick={() => onChange?.(n)}
            className={readOnly ? "cursor-default" : "cursor-pointer transition-transform hover:scale-110"}
            aria-label={`${n} bintang`}
          >
            <Star
              size={size}
              className={filled ? "fill-amber-400 stroke-amber-400" : "stroke-muted-foreground/40"}
            />
          </button>
        );
      })}
    </div>
  );
}
