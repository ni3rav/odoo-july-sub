"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { createTheme } from "@mui/material/styles"
import type {} from "@mui/x-data-grid/themeAugmentation"

export function useDataGridTheme() {
  const { resolvedTheme } = useTheme()
  const mode = resolvedTheme === "dark" ? "dark" : "light"

  return React.useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          background: {
            default: "var(--background)",
            paper: "var(--card)",
          },
          text: {
            primary: "var(--foreground)",
            secondary: "var(--muted-foreground)",
          },
          divider: "var(--border)",
          primary: {
            main: "var(--primary)",
            contrastText: "var(--primary-foreground)",
          },
          action: {
            hover: "var(--accent)",
            selected: "var(--accent)",
            disabledBackground: "var(--muted)",
            disabled: "var(--muted-foreground)",
          },
        },
        shape: { borderRadius: 0 },
        typography: {
          fontFamily: "var(--font-sans)",
          fontSize: 13,
        },
        components: {
          MuiDataGrid: {
            styleOverrides: {
              root: {
                border: "1px solid var(--border)",
                borderRadius: 0,
                backgroundColor: "var(--card)",
                color: "var(--foreground)",
              },
              columnHeaders: {
                backgroundColor: "var(--muted)",
                borderBottom: "1px solid var(--border)",
              },
              columnHeader: {
                "&:focus, &:focus-within": {
                  outline: "none",
                },
              },
              footerContainer: {
                borderTop: "1px solid var(--border)",
                backgroundColor: "var(--card)",
              },
              row: {
                "&:hover": {
                  backgroundColor: "var(--accent)",
                },
              },
              cell: {
                borderBottom: "1px solid var(--border)",
                "&:focus, &:focus-within": {
                  outline: "none",
                },
              },
              overlay: {
                backgroundColor: "var(--card)",
              },
            },
          },
        },
      }),
    [mode]
  )
}
