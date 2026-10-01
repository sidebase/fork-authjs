import { h, type VNodeChild } from "vue"
import type { Theme } from "../.."
import type { InternalUrl } from "../../utils/parse-url"

/**
 * The following errors are passed as error query parameters to the default or overridden error page.
 *
 * Documentation: https://next-auth.js.org/configuration/pages#error-page
 */
export type ErrorType =
  | "default"
  | "configuration"
  | "accessdenied"
  | "verification"

export interface ErrorProps {
  url?: InternalUrl
  theme?: Theme
  error?: ErrorType
}

interface ErrorView {
  status: number
  heading: string
  message: () => VNodeChild
  signin?: () => VNodeChild
}

/** Renders an error page. */
export default function ErrorPage(props: ErrorProps) {
  const { url, error = "default", theme } = props
  const signinPageUrl = `${url}/signin`

  const errors: Record<ErrorType, ErrorView> = {
    default: {
      status: 200,
      heading: "Error",
      message: () => h("p", [
        h(
          "a",
          {
            class: "site",
            href: url?.origin,
          },
          url?.host,
        ),
      ]),
    },

    configuration: {
      status: 500,
      heading: "Server error",
      message: () => h("div", [
        h("p", "There is a problem with the server configuration."),
        h("p", "Check the server logs for more information."),
      ]),
    },

    accessdenied: {
      status: 403,
      heading: "Access Denied",
      message: () => h("div", [
        h("p", "You do not have permission to sign in."),
        h("p", [
          h(
            "a",
            {
              class: "button",
              href: signinPageUrl,
            },
            "Sign in"
          ),
        ]),
      ]),
    },

    verification: {
      status: 403,
      heading: "Unable to sign in",
      message: () => h("div", [
        h("p", "The sign in link is no longer valid."),
        h("p", "It may have been used already or it may have expired."),
      ]),
      signin: () => h(
        "a",
        {
          class: "button",
          href: signinPageUrl,
        },
        "Sign in"
      ),
    },
  }

  const key = error.toLowerCase() as ErrorType
  const { status, heading, message, signin } = errors[key] ?? errors.default

  return {
    status,
    html: h("div", { class: "error" }, [
      theme?.brandColor
        ? h("style", {
            innerHTML: `
:root {
  --brand-color: ${theme.brandColor};
}
          `.trim(),
          })
        : null,

      h("div", { class: "card" }, [
        theme?.logo
          ? h("img", {
              src: theme.logo,
              alt: "Logo",
              class: "logo",
            })
          : null,

        h("h1", heading),
        h("div", { class: "message" }, [message()]),
        signin ? signin() : null,
      ]),
    ]),
  }
}
