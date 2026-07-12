type Issue = { path: PropertyKey[]; message: string }

export function formatZodIssues(issues: Issue[]) {
  return issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("\n")
}
