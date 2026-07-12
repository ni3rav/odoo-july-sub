import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

export function SafetyScore({ score }: { score: number }) {
  const filledStars = Math.round(score / 20)

  return (
    <div
      className="flex items-center gap-1"
      aria-label={`Safety score ${score} out of 100`}
    >
      <div className="flex items-center">
        {Array.from({ length: 5 }, (_, index) => (
          <Star
            key={index}
            className={cn(
              "size-3 text-muted-foreground",
              index < filledStars && "fill-primary text-primary"
            )}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">{score}</span>
    </div>
  )
}
