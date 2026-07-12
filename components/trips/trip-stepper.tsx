import { cn } from "@/lib/utils"
import type { TripStatus } from "@/db/schema/constants"
import { Check } from "lucide-react"

const STEPS = [
  { key: "Draft", label: "Draft" },
  { key: "Dispatched", label: "Dispatched" },
  { key: "InTransit", label: "In Transit" },
  { key: "Completed", label: "Completed" },
] as const

type TripStepperProps = {
  status: TripStatus
}

function getActiveIndex(status: TripStatus) {
  if (status === "Cancelled") {
    return -1
  }
  return STEPS.findIndex((step) => step.key === status)
}

export function TripStepper({ status }: TripStepperProps) {
  const activeIndex = getActiveIndex(status)

  return (
    <ol className="grid gap-4 md:grid-cols-4">
      {STEPS.map((step, index) => {
        const isComplete = activeIndex > index
        const isCurrent = activeIndex === index
        const isUpcoming = activeIndex >= 0 && index > activeIndex

        return (
          <li
            key={step.key}
            className={cn(
              "flex items-center gap-3 rounded-lg border border-border bg-card p-3",
              isCurrent && "border-primary bg-primary/5",
              isComplete && "border-primary/20"
            )}
          >
            <div
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-background text-xs font-semibold text-muted-foreground",
                isComplete &&
                  "border-primary bg-primary text-primary-foreground",
                isCurrent && "border-primary text-primary"
              )}
            >
              {isComplete ? <Check className="size-4" /> : index + 1}
            </div>
            <div className="min-w-0">
              <p
                className={cn(
                  "text-xs font-semibold text-foreground",
                  isUpcoming && "text-muted-foreground"
                )}
              >
                {step.label}
              </p>
              {isCurrent && (
                <p className="text-xs text-primary">Current stage</p>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
