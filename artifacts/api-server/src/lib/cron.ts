import cron from "node-cron";
import { db, pushSubscriptionsTable, usersTable } from "@workspace/db";
import { eq, and, ne, or, isNull, sql } from "drizzle-orm";
import { isPushConfigured, sendPush } from "./webPush";
import { logger } from "./logger";
import { buildPayload } from "../routes/push";

let started = false;

function istNow(): { dateKey: string; hour: number; minute: number } {
  const now = new Date();
  const istMs = now.getTime() + 5.5 * 60 * 60 * 1000;
  const ist = new Date(istMs);
  const y = ist.getUTCFullYear();
  const m = String(ist.getUTCMonth() + 1).padStart(2, "0");
  const d = String(ist.getUTCDate()).padStart(2, "0");
  return {
    dateKey: `${y}-${m}-${d}`,
    hour: ist.getUTCHours(),
    minute: ist.getUTCMinutes(),
  };
}

async function runOnce(): Promise<void> {
  if (!isPushConfigured()) return;

  const { dateKey, hour, minute } = istNow();
  const nowTotal = hour * 60 + minute;

  try {
    // Catch-up window: pick all enabled subs whose scheduled IST time has
    // already passed today and haven't been sent yet. This way a server
    // restart at 7:00 still delivers when the server is back up at 7:03.
    // Bound by current IST minute-of-day so we never send "tomorrow's"
    // message early.
    const dueSubs = await db
      .select()
      .from(pushSubscriptionsTable)
      .where(
        and(
          eq(pushSubscriptionsTable.enabled, true),
          or(
            isNull(pushSubscriptionsTable.lastSentDate),
            ne(pushSubscriptionsTable.lastSentDate, dateKey),
          ),
          sql`(${pushSubscriptionsTable.hour} * 60 + ${pushSubscriptionsTable.minute}) <= ${nowTotal}`,
        ),
      );

    if (dueSubs.length === 0) return;

    logger.info({ count: dueSubs.length, hour, minute }, "Push cron: dispatching morning pushes");

    for (const sub of dueSubs) {
      if (sub.lastSentDate === dateKey) continue;

      const [user] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, sub.userId))
        .limit(1);

      const sign = user?.zodiacSign ?? null;
      const payload = buildPayload(sub.language, sign);
      const result = await sendPush(
        { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
        payload,
      );

      if (result.ok) {
        await db
          .update(pushSubscriptionsTable)
          .set({ lastSentDate: dateKey })
          .where(eq(pushSubscriptionsTable.endpoint, sub.endpoint));
      } else if (result.expired) {
        await db
          .delete(pushSubscriptionsTable)
          .where(eq(pushSubscriptionsTable.endpoint, sub.endpoint));
      }
    }
  } catch (err) {
    logger.error({ err }, "Push cron run failed");
  }
}

export function startPushCron(): void {
  if (started) return;
  started = true;
  // Every minute at the top of the minute. Each subscription has its own
  // preferred (hour, minute) so we only dispatch to those matching now.
  cron.schedule("* * * * *", () => { void runOnce(); });
  logger.info("Push cron: started (every minute, IST-aware)");
}
