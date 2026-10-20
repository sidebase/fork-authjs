import { h } from "vue"
import type { Theme } from "../.."
import type { InternalUrl } from "../../utils/parse-url"
import { renderThemeStyle } from "./theme-style"

export interface SignoutProps {
  url: InternalUrl
  csrfToken: string
  theme: Theme
}

export default function SignoutPage(props: SignoutProps) {
  const { url, csrfToken, theme } = props

  return h("div", { class: "signout" }, [
    ...renderThemeStyle(theme, /* buttonText = */ true),

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
