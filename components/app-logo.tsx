import Image from "next/image"
import { cn } from "@/lib/utils"

type AppLogoProps = {
  className?: string
  imageClassName?: string
  showLabel?: boolean
}

export function AppLogo({
  className,
  imageClassName,
  showLabel = true,
}: AppLogoProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 text-lg font-semibold text-primary",
        className
      )}
    >
      <div
        className={cn(
          "relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg p-0.5",
          imageClassName
        )}
      >
        <Image
          src="/light-icon-app.png"
          alt="TransitOps"
          width={48}
          height={48}
          className="size-full object-contain dark:hidden"
          priority
        />
        <Image
          src="/dark-icon-app.png"
          alt="TransitOps"
          width={48}
          height={48}
          className="hidden size-full object-contain dark:block"
          priority
        />
      </div>
      {showLabel ? <span>TransitOps</span> : null}
    </div>
  )
}
