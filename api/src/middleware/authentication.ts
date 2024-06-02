import WorkOS from "@workos-inc/node";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { Request as KRequest } from "koa";

const clientId = process.env.WORKOS_CLIENT_ID!;

const workos = new WorkOS(process.env.WORKOS_API_KEY);

const JWKS = createRemoteJWKSet(
  new URL(workos.userManagement.getJwksUrl(clientId)),
);

async function verifyToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, JWKS);
    return true;
  } catch (error) {
    console.warn("Error verifying token: ", error, "\ntoken: ", token);
    return false;
  }
}

function getSessionFromCookie(req: KRequest): any {
  const cookie = req.ctx.cookies.get("session");

  if (cookie) {
    const decoded = Buffer.from(cookie, "base64").toString("utf-8");
    return JSON.parse(decoded);
  }
}

function getSessionFromHeader(req: KRequest): any {
  const authHeader = req.ctx.get("Authorization");
  const token = authHeader?.split(" ")[1];
  if (token) {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    return JSON.parse(decoded);
  }
}

export async function koaAuthentication(req: KRequest, securityName: string, scopes: string[]): Promise<void> {
  let session = await getSessionFromCookie(req);
  if (!session) {
    session = getSessionFromHeader(req);
    req.ctx.session = session;
  }
  const token = session?.accessToken;

  if ((!token) && securityName === "jwt") {
    return Promise.reject(new Error("Unauthorized"));
  }

  console.log("scopes", scopes)

  const hasValidToken = await verifyToken(token);

  if (hasValidToken) {
    return Promise.resolve();
  }

  try {
    const { accessToken, refreshToken } = await workos.userManagement.authenticateWithRefreshToken({
      clientId,
      refreshToken: session.refreshToken,
    });

    req.ctx.session = {
      ...session,
      accessToken,
      refreshToken,
    };

  } catch (error) {
    console.error("Error refreshing token: ", error);
    req.ctx.session = null;
    req.ctx.cookies.set("session", null);
    return Promise.reject(new Error("Unauthorized"));
  }
  return Promise.resolve();
}