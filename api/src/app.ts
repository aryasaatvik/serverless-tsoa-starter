import Koa from "koa";
import Router from "@koa/router";
import bodyParser from "koa-bodyparser";
import { RegisterRoutes } from "./routes/routes";
import session from "koa-session";

const app = new Koa();
const router = new Router();

app.keys = [process.env.COOKIE_SIGNING_KEY!];

const SESSION_CONFIG = {
  key: "session",
  maxAge: 86400000,
  httpOnly: true,
  signed: true,
  overwrite: true,
};

app.use(session(SESSION_CONFIG, app));

// Use body parser to read sent json payloads
app.use(bodyParser());

RegisterRoutes(router);

app.use(router.routes()).use(router.allowedMethods());

export { app };