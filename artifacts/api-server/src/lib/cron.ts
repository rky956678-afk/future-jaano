import cron from "node-cron";
import { db, pushSubscriptionsTable, usersTable } from "@workspace/db";
import { eq, and, ne, or, isNull, sql } from "drizzle-orm";
import { isPushConfigured, sendPush } from "./webPush";
import { logger } from "./logger";

let started = false;

function buildPayload(language: string | null, sign: string | null) {
  const isHindi = language === "hi";

  return {
    title: isHindi ? "आज का भविष्यफल" : "Today’s Horoscope",
    body: sign
      ? isHindi
        ? `${sign} राशि के लिए आज का दैनिक संदेश तैयार है।`
        : `Your daily message for ${sign} is ready.`
      : isHindi
        ? "आपका दैनिक ज्योतिष संदेश तैयार है।"
        : "Your daily astrology message is ready.",
    url: "/",
    tag: "daily-horoscope"
  };
}

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
    minute: ist.getUTCMinutes()
  };
}

async function runOnce(): Promise<void> {
  if (!isPushConfigured()) return;

  const { dateKey, hour, minute } = istNow();
  const nowTotal = hour * 60 + minute;

  try {
    const dueSubs = await db
      .select()
      .from(pushSubscriptionsTable)
      .where(
        and(
          eq(pushSubscriptionsTable.enabled, true),
          or(
            isNull(pushSubscriptionsTable.lastSentDate),
            ne(pushSubscriptionsTable.lastSentDate, dateKey)
          ),
          sql`(${pushSubscriptionsTable.hour} * 60 + ${pushSubscriptionsTable.minute}) <= ${nowTotal}`
        )
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
        payload
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

  cron.schedule("* * * * *", () => {
    void runOnce();
  });

  logger.info("Push cron: started (every minute, IST-aware)");
}
