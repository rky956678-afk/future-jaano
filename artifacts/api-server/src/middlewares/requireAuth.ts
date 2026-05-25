import { type Request, type Response, type NextFunction } from "express";
import { getAuth } from "@clerk/express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = getAuth(req);
  if (!auth.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    // Get or create user record
    let user = await db.select().from(usersTable).where(eq(usersTable.clerkId, auth.userId)).limit(1);

    if (user.length === 0) {
      // Create user from Clerk session data
      const sessionClaims = auth.sessionClaims as Record<string, unknown> | null;
      const email = (sessionClaims?.email as string) || `${auth.userId}@unknown.com`;
      const name = (sessionClaims?.name as string) || (sessionClaims?.username as string) || "User";

      const [newUser] = await db.insert(usersTable).values({
        clerkId: auth.userId,
        email,
        name,
        language: "en",
        isPremium: false,
        isAdmin: false,
      }).returning();

      (req as Request & { dbUser: typeof usersTable.$inferSelect }).dbUser = newUser;
    } else {
      (req as Request & { dbUser: typeof usersTable.$inferSelect }).dbUser = user[0];
    }

    next();
  } catch (err) {
    req.log.error({ err }, "Error in requireAuth");
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const dbUser = (req as Request & { dbUser: typeof usersTable.$inferSelect }).dbUser;
  if (!dbUser?.isAdmin) {
    res.status(403).json({ error: "Admin access required" });
    return;
  }
  next();
}
