import { h, type VNode } from "vue"
import type { Theme } from "../types"

export function renderThemeStyle(
  theme: Theme | undefined,
  buttonText = true
): VNode[] {
  const declarations: string[] = []

  if (theme?.brandColor) {
    declarations.push(`--brand-color:${theme.brandColor};`)
  }

  if (buttonText && theme?.buttonText) {
    declarations.push(`--button-text-color:${theme.buttonText};`)
  }

  return declarations.length > 0
    // Text children are HTML-escaped by Vue SSR; innerHTML would allow a color to close <style>.
    ? [h("style", `:root{${declarations.join("")}}`)]
    : []
}
