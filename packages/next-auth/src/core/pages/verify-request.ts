import { h, type VNode } from "vue"
import type { Theme } from "../.."
import type { InternalUrl } from "../../utils/parse-url"

interface VerifyRequestPageProps {
  url: InternalUrl
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

  return nodes
}

export default function VerifyRequestPage(props: VerifyRequestPageProps) {
  const { url, theme } = props

  return h("div", { class: "verify-request" }, [
    ...renderThemeStyle(theme),

    h("div", { class: "card" }, [
      theme.logo
        ? h("img", {
            src: theme.logo,
            alt: "Logo",
            class: "logo",
          })
        : null,

      h("h1", "Check your email"),
      h("p", "A sign in link has been sent to your email address."),
      h("p", [
        h(
          "a",
          {
            class: "site",
            href: url.origin,
          },
          url.host
        ),
      ]),
    ]),
  ])
}
