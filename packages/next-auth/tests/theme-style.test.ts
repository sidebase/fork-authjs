import { renderToString } from "vue/server-renderer"
import { renderThemeStyle } from "../src/core/pages/theme-style"

describe("renderThemeStyle", () => {
  it("renders both theme colors in one style element", async () => {
    const nodes = renderThemeStyle({ brandColor: "#123456", buttonText: "#abcdef" })

    expect(nodes).toHaveLength(1)
    expect(await renderToString(nodes[0])).toBe(
      "<style>:root{--brand-color:#123456;--button-text-color:#abcdef;}</style>"
    )
  })

  it("does not interpret HTML in theme colors", async () => {
    const nodes = renderThemeStyle({
      brandColor: "</style><img src=x onerror=alert(1)>",
    })

    expect(await renderToString(nodes[0])).toBe(
      "<style>:root{--brand-color:&lt;/style&gt;&lt;img src=x onerror=alert(1)&gt;;}</style>"
    )
  })
})
