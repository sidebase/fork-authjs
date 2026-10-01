import { h, type VNode } from "vue"
import type { Theme } from "../.."
import type { InternalUrl } from "../../utils/parse-url"

export interface SignoutProps {
  url: InternalUrl
  csrfToken: string
  theme: Theme
}

function renderThemeStyle(theme: Theme): VNode[] {
  const nodes: VNode[] = []

  if (theme.brandColor) {
    nodes.push(
      h("style", {
        innerHTML: `
:root {
  --brand-color: ${theme.brandColor};
}
        `.trim(),
      })
    )
  }

  if (theme.buttonText) {
    nodes.push(
      h("style", {
        innerHTML: `
:root {
  --button-text-color: ${theme.buttonText};
}
        `.trim(),
      })
    )
  }

  return nodes
}

export default function SignoutPage(props: SignoutProps) {
  const { url, csrfToken, theme } = props

  return h("div", { class: "signout" }, [
    ...renderThemeStyle(theme),

    h("div", { class: "card" }, [
      theme.logo
        ? h("img", {
            src: theme.logo,
            alt: "Logo",
            class: "logo",
          })
        : null,

      h("h1", "Signout"),
      h("p", "Are you sure you want to sign out?"),

      h("form", { action: `${url}/signout`, method: "POST" }, [
        h("input", {
          type: "hidden",
          name: "csrfToken",
          value: csrfToken,
        }),
        h(
          "button",
          {
            id: "submitButton",
            type: "submit",
          },
          "Sign out"
        ),
      ]),
    ]),
  ])
}
