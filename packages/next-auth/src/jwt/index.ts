import { EncryptJWT, jwtDecrypt } from "jose"
import { hkdf, randomUUID } from "node:crypto"
import { IncomingHttpHeaders } from "node:http"
import { SessionStore } from "../core/lib/cookie"
import type { JWT, JWTDecodeParams, JWTEncodeParams, JWTOptions } from "./types"
import type { LoggerInstance } from ".."

export type { DefaultJWT, JWT, JWTDecodeParams, JWTEncodeParams, JWTOptions, Secret } from "./types"

const DEFAULT_MAX_AGE = 30 * 24 * 60 * 60 // 30 days

const now = () => (Date.now() / 1000) | 0

/** Issues a JWT. By default, the JWT is encrypted using "A256GCM". */
export async function encode(params: JWTEncodeParams) {
  /** @note empty `salt` means a session token. See {@link JWTEncodeParams.salt}. */
  const { token = {}, secret, maxAge = DEFAULT_MAX_AGE, salt = "" } = params

  const encryptionSecret = await getDerivedEncryptionKey(secret, salt)
  return await new EncryptJWT(token)
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime(now() + maxAge)
    .setJti(randomUUID())
    .encrypt(encryptionSecret)
}

/** Decodes a NextAuth.js issued JWT. */
export async function decode(params: JWTDecodeParams): Promise<JWT | null> {
  /** @note empty `salt` means a session token. See {@link JWTDecodeParams.salt}. */
  const { token, secret, salt = "" } = params
  if (!token) return null
  const encryptionSecret = await getDerivedEncryptionKey(secret, salt)
  const { payload } = await jwtDecrypt(token, encryptionSecret, {
    clockTolerance: 15,
  })
  return payload
}

export interface GetTokenParams<R extends boolean = false> {
  /** The request containing the JWT either in the cookies or in the `Authorization` header. */
  req: {
    cookies: Record<string, string>
    headers: IncomingHttpHeaders
  }
  /**
   * Use secure prefix for cookie name, unless URL in `NEXTAUTH_URL` is http://
   * or not set (e.g. development or test instance) case use unprefixed name
   */
  secureCookie?: boolean
  /** If the JWT is in the cookie, what name `getToken()` should look for. */
  cookieName?: string
  /**
   * `getToken()` will return the raw JWT if this is set to `true`
   * @default false
   */
  raw?: R
  /**
   * The same `secret` used in the `NextAuth` configuration.
   * Defaults to the `NEXTAUTH_SECRET` environment variable.
   */
  secret?: string
  decode?: JWTOptions["decode"]
  logger?: LoggerInstance | Console
}

/**
 * Takes a NextAuth.js request (`req`) and returns either the NextAuth.js issued JWT's payload,
 * or the raw JWT string. We look for the JWT in the either the cookies, or the `Authorization` header.
 * [Documentation](https://next-auth.js.org/tutorials/securing-pages-and-api-routes#using-gettoken)
 */
export async function getToken<R extends boolean = false>(
  params: GetTokenParams<R>
): Promise<R extends true ? string : JWT | null> {
  const {
    req,
    secureCookie = process.env.NEXTAUTH_URL?.startsWith("https://") ??
      !!process.env.VERCEL,
    cookieName = secureCookie
      ? "__Secure-next-auth.session-token"
      : "next-auth.session-token",
    raw,
    decode: _decode = decode,
    logger = console,
    secret = process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
  } = params

  if (!req) throw new Error("Must pass `req` to JWT getToken()")

  const sessionStore = new SessionStore(
    { name: cookieName, options: { secure: secureCookie } },
    { cookies: req.cookies, headers: req.headers },
    logger
  )

  let token = sessionStore.value

  const authorizationHeader =
    req.headers instanceof Headers
      ? req.headers.get("authorization")
      : req.headers?.authorization

  if (!token && authorizationHeader?.split(" ")[0] === "Bearer") {
    const urlEncodedToken = authorizationHeader.split(" ")[1]
    token = decodeURIComponent(urlEncodedToken)
  }

  // @ts-expect-error
  if (!token) return null

  // @ts-expect-error
  if (raw) return token

  try {
    // @ts-expect-error
    return await _decode({ token, secret })
  } catch {
    // @ts-expect-error
    return null
  }
}

/**
 * Derives HKDF key
 * @see https://github.com/panva/hkdf/blob/22c5263267bc2c38e1a2ac72f484ab3c20eddce7/README.md?plain=1#L1-L21
 * @see https://github.com/nextauthjs/next-auth/blob/1a70ee8e3b9ed5be5446a221c133bc8d26157a3f/packages/next-auth/src/jwt/index.ts#L121-L132
 */
async function getDerivedEncryptionKey(
  keyMaterial: string | Buffer,
  inputSalt: string,
) {
  const ikm = normalizeIkm(keyMaterial)
  const salt = normalizeUint8Array(inputSalt, 'salt')
  const info = normalizeInfo(`NextAuth.js Generated Encryption Key${salt ? ` (${salt})` : ""}`)
  const keylen = 32 // 256 >> 3

  return await new Promise<Uint8Array>((resolve, reject) => {
    hkdf('sha256', ikm, salt, info, keylen, (err, derivedKey) => {
      if (err) {
        reject(err)
      } else {
        resolve(new Uint8Array(derivedKey))
      }
    })
  })
}
function normalizeUint8Array(input: string | Buffer, label: string) {
    if (typeof input === 'string') {
        return new TextEncoder().encode(input)
    }
    if (!(input instanceof Uint8Array)) {
        throw new TypeError(`"${label}"" must be an instance of Uint8Array or a string`)
    }
    return input
}

function normalizeIkm(input: string | Buffer): Uint8Array {
    const ikm = normalizeUint8Array(input, 'ikm')
    if (!ikm.byteLength) {
        throw new TypeError(`"ikm" must be at least one byte in length`)
    }
    return ikm
}
function normalizeInfo(input: string) {
    const info = normalizeUint8Array(input, 'info');
    if (info.byteLength > 1024) {
        throw TypeError('"info" must not contain more than 1024 bytes')
    }
    return info
}
