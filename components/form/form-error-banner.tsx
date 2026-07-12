"use client"

type FormErrorBannerProps = {
  message: string | null
}

export function FormErrorBanner({ message }: FormErrorBannerProps) {
  if (!message) {
    return null
  }

  return (
    <div
      className="rounded-md bg-destructive/10 p-3 text-sm text-destructive"
      role="alert"
    >
      {message}
    </div>
  )
}
