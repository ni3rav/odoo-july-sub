"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { createTheme } from "@mui/material/styles"
import type {} from "@mui/x-data-grid/themeAugmentation"

// Hex equivalents of the oklch tokens in app/globals.css — MUI's palette
// computes derived shades (light/dark/contrastText) and contrast ratios by
// parsing the color value in JS, which can't resolve a CSS var() reference.
// Keep these in sync with app/globals.css's :root / .dark blocks.
const PALETTE_HEX = {
  light: {
    background: "#FDFEFF",
    card: "#FFFFFF",
    foreground: "#1E293B",
    mutedForeground: "#64748B",
    border: "#E2E8F0",
    primary: "#2563EB",
    primaryForeground: "#FFFFFF",
    accent: "#E3ECFD",
    muted: "#F1F5F9",
  },
  dark: {
    background: "#0F172A",
    card: "#111B31",
    foreground: "#F8FAFC",
    mutedForeground: "#94A3B8",
    border: "#242F3E",
    primary: "#3B82F6",
    primaryForeground: "#FFFFFF",
    accent: "#1E40AF",
    muted: "#334155",
  },
} as const

export function useDataGridTheme() {
  const { resolvedTheme } = useTheme()
  const mode = resolvedTheme === "dark" ? "dark" : "light"
  const hex = PALETTE_HEX[mode]

  return React.useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          background: {
            default: hex.background,
            paper: hex.card,
          },
          text: {
            primary: hex.foreground,
            secondary: hex.mutedForeground,
          },
          divider: hex.border,
          primary: {
            main: hex.primary,
            contrastText: hex.primaryForeground,
          },
          action: {
            hover: hex.accent,
            selected: hex.accent,
            disabledBackground: hex.muted,
            disabled: hex.mutedForeground,
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
    [mode, hex]
  )
}
