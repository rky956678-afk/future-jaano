import { Router } from "express";
import { db, blogPostsTable } from "@workspace/db";
import { eq, desc, and, sql, type SQL } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middlewares/requireAuth";

const router = Router();

// GET /api/blog/posts/trending
router.get("/blog/posts/trending", async (req, res) => {
  try {
    const posts = await db.select().from(blogPostsTable)
      .where(eq(blogPostsTable.isPublished, true))
      .orderBy(desc(blogPostsTable.viewCount))
      .limit(5);
    res.json(posts.map(formatPost));
  } catch (err) {
    req.log.error({ err }, "Error getting trending posts");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/blog/posts
router.get("/blog/posts", async (req, res) => {
  try {
    const { category, lang, page = "1", limit: limitStr = "10" } = req.query as Record<string, string>;
    const page_num = parseInt(page);
    const limit = parseInt(limitStr);
    const offset = (page_num - 1) * limit;

    const conditions: SQL[] = [eq(blogPostsTable.isPublished, true)];
    if (category) conditions.push(eq(blogPostsTable.category, category));
    if (lang) conditions.push(eq(blogPostsTable.language, lang));
    const whereClause = and(...conditions);

    const posts = await db.select().from(blogPostsTable)
      .where(whereClause)
      .orderBy(desc(blogPostsTable.publishedAt))
      .limit(limit)
      .offset(offset);

    const [{ total }] = await db.select({ total: sql<number>`count(*)` }).from(blogPostsTable).where(whereClause);

    res.json({
      posts: posts.map(formatPost),
      total: Number(total),
      page: page_num,
      limit,
    });
  } catch (err) {
    req.log.error({ err }, "Error getting blog posts");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/blog/posts
router.post("/blog/posts", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { title, slug, excerpt, content, category, author, imageUrl, tags, language, isPublished } = req.body;

    if (!title || !slug || !excerpt || !content || !category || !author) {
      res.status(400).json({ error: "title, slug, excerpt, content, category, author are required" });
      return;
    }

    const [post] = await db.insert(blogPostsTable).values({
      title, slug, excerpt, content, category, author,
      imageUrl, tags, language: language || "en",
      isPublished: isPublished || false,
      publishedAt: isPublished ? new Date() : null,
    }).returning();

    res.status(201).json(formatPost(post));
  } catch (err) {
    req.log.error({ err }, "Error creating blog post");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/blog/posts/:slug
router.get("/blog/posts/:slug", async (req, res) => {
  try {
    const slug = req.params["slug"] as string;
    const [post] = await db.select().from(blogPostsTable).where(eq(blogPostsTable.slug, slug));
    if (!post) { res.status(404).json({ error: "Not found" }); return; }
    // Increment view count
    await db.update(blogPostsTable).set({ viewCount: post.viewCount + 1 }).where(eq(blogPostsTable.id, post.id));
    res.json(formatPost({ ...post, viewCount: post.viewCount + 1 }));
  } catch (err) {
    req.log.error({ err }, "Error getting blog post");
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/blog/posts/:slug
router.patch("/blog/posts/:slug", requireAuth, requireAdmin, async (req, res) => {
  try {
    const slug = req.params["slug"] as string;
    const { title, excerpt, content, category, imageUrl, tags, isPublished } = req.body;
    const [post] = await db.update(blogPostsTable)
      .set({
        ...(title && { title }), ...(excerpt && { excerpt }), ...(content && { content }),
        ...(category && { category }), ...(imageUrl !== undefined && { imageUrl }),
        ...(tags !== undefined && { tags }), ...(isPublished !== undefined && { isPublished }),
        ...(isPublished === true && { publishedAt: new Date() }),
      })
      .where(eq(blogPostsTable.slug, slug))
      .returning();
    if (!post) { res.status(404).json({ error: "Not found" }); return; }
    res.json(formatPost(post));
  } catch (err) {
    req.log.error({ err }, "Error updating blog post");
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/blog/posts/:slug
router.delete("/blog/posts/:slug", requireAuth, requireAdmin, async (req, res) => {
  try {
    await db.delete(blogPostsTable).where(eq(blogPostsTable.slug, req.params["slug"] as string));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Error deleting blog post");
    res.status(500).json({ error: "Internal server error" });
  }
});

function formatPost(post: typeof blogPostsTable.$inferSelect) {
  return {
    id: post.id, title: post.title, slug: post.slug, excerpt: post.excerpt,
    content: post.content, category: post.category, author: post.author,
    imageUrl: post.imageUrl ?? null, tags: post.tags ?? null,
    viewCount: post.viewCount, language: post.language, isPublished: post.isPublished,
    publishedAt: post.publishedAt ? post.publishedAt.toISOString() : new Date().toISOString(),
    createdAt: post.createdAt.toISOString(),
  };
}

export default router;
