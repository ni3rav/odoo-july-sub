import type { FieldValues, Path, UseFormSetError } from "react-hook-form"

type Issue = { path: PropertyKey[]; message: string }

export function formatZodIssues(issues: Issue[]) {
  return issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("\n")
}

export function parseZodIssuesMessage(message: string) {
  return message
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .flatMap((line) => {
      const colonIndex = line.indexOf(": ")
      if (colonIndex === -1) {
        return []
      }

      const field = line.slice(0, colonIndex)
      const fieldMessage = line.slice(colonIndex + 2)

      if (!field || !fieldMessage) {
        return []
      }

      return [{ field, message: fieldMessage }]
    })
}

export function applyFormErrorsFromMessage<T extends FieldValues>(
  message: string,
  setError: UseFormSetError<T>
) {
  const issues = parseZodIssuesMessage(message)

  for (const issue of issues) {
    setError(issue.field as Path<T>, {
      type: "server",
      message: issue.message,
    })
  }

  return issues.length > 0
}
