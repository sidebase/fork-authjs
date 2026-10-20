import { h } from "vue"
import type { Theme } from "../.."
import type { InternalUrl } from "../../utils/parse-url"
import { renderThemeStyle } from "./theme-style"

interface VerifyRequestPageProps {
  url: InternalUrl
  theme: Theme
}

export default function VerifyRequestPage(props: VerifyRequestPageProps) {
  const { url, theme } = props

  return h("div", { class: "verify-request" }, [
    ...renderThemeStyle(theme, /* buttonText = */ false),

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
