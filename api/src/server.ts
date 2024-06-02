// src/server.ts
import { resolve } from "path";
import dotenv from "dotenv";

// load environment variables
dotenv.config({
  path: resolve(__dirname, "../.env.local"),
});

import { app } from "./app";

const port = process.env.PORT

app.listen(port, () =>
  console.log(`app listening at http://localhost:${port} 🚀`)
);