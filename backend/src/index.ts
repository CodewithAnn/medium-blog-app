import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { decode, sign, verify } from "hono/jwt";
import bcrypt from "bcryptjs";
// import { env } from "hono/adapter";
const app = new Hono<{
  Bindings: { DATABASE_URL: string; JWT_SECRET: string };
}>();

// app.get("/", (c) => {
//   return c.text("Hello Hono!");
// });

app.post("/api/v1/signup", async (c) => {
  // return c.text("signup route");
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  // signup route
  /// body
  const body = await c.req.json();
  console.log(body);
  // hashing the password
  const hashedPassword = bcrypt.hashSync(body.password, 10);
  console.log("JWT_TOKEN:", c.env.JWT_SECRET);
  const user = await prisma.user.create({
    data: {
      email: body.email,
      password: hashedPassword,
    },
  });

  // generate jwt token
  const token = await sign({ id: user.id }, c.env.JWT_SECRET);
  // return response
  return c.json({ user: user, jwt: token });
});
app.post("/api/v1/signIn", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  // body
  const body = await c.req.json();
  // destructure body
  const { email, password } = body;

  // findUser
  const user = await prisma.user.findUnique({
    where: { email: email },
  });
  if (!user) {
    return c.json({ message: "user not found" }, 404);
  }
  const registerUser = user;
  // compare password
  const isMatch = await bcrypt.compare(password, registerUser.password);
  return c.json({ message: "log in successfully", registerUser });
});
app.post("/api/v1/blog", (c) => {
  return c.text("create blog here route");
});
app.put("/api/v1/blog", (c) => {
  return c.text("update blog here route");
});
app.get("/api/v1/blog", (c) => {
  return c.text("get you blogs here route");
});

export default app;
