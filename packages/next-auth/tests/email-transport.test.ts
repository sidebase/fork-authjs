/** @jest-environment node */
import EmailProvider from "../src/providers/email"

it("sends a verification email with Nodemailer 10's built-in JSON transport", async () => {
  const provider = EmailProvider({ server: { jsonTransport: true } })

  await expect(
    provider.sendVerificationRequest({
      identifier: "recipient@example.com",
      url: "https://example.com/api/auth/callback/email?token=test",
      expires: new Date(Date.now() + 60_000),
      provider: { ...provider, server: { jsonTransport: true } },
      token: "test",
      theme: { brandColor: "#123456" },
    })
  ).resolves.toBeUndefined()
})
