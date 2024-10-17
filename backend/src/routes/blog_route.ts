import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { decode, sign, verify } from "hono/jwt";

const app = new Hono<{
  Bindings: { DATABASE_URL: string; JWT_SECRET: string };
}>();

app.use("/*", async (c, next) => {
  const header = c.req.header("authorization") || "";
  const token = header.split(" ")[1];
  const response = await verify(token, c.env.JWT_SECRET);

  if (response.id) {
    return next();
  } else {
    c.status(401);
    return c.json({ error: "Unauthorized" });
  }
});

//Routes
app.post("/", async (c) => {
  const body = await c.req.json();
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const blog = await prisma.post.create({
    data: {
      title: body.title,
      content: body.content,
      authorId: "1",
    },
  });
  return c.json({ post: blog }, 201);
});
// update blog
app.put("/", async (c) => {
  const body = await c.req.json();
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const updatedBlog = await prisma.post.update({
      where: { id: body.id, authorId: "1" },
      data: {
        title: body.title,
        content: body.content,
      },
    });
    return c.json({ updatedblog: updatedBlog });
  } catch (error) {
    c.json({ message: "Blog doesn't exists" }, 404);
  }
});
// get blog with id
app.get("/", async (c) => {
  const body = await c.req.json();
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const blogs = prisma.post.findFirst({
      where: { id: body.id },
    });
    return c.json({ blog: blogs });
  } catch (error) {
    c.json({ message: "Blogs not found" });
  }
});
// get all blogs
app.get("/bulk", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const getAllBlogs = prisma.post.findMany();
  return c.json({ blog: getAllBlogs });
});

export default app;
