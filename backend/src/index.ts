import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { decode, sign, verify } from "hono/jwt";
import bcrypt from "bcryptjs";
import userRouter from "./routes/user_route";
import blogRouter from "./routes/blog_route";
// import { env } from "hono/adapter";
const app = new Hono<{
  Bindings: { DATABASE_URL: string; JWT_SECRET: string };
}>();
app.route("/api/v1/user/", userRouter);
app.route("/api/v1/blog/", blogRouter);

// middleware

// app.get("/", (c) => {
//   return c.text("Hello Hono!");
// });



export default app;
