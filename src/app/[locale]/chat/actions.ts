"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { db } from "@/db";
import { advert, chatMessage } from "@/db/schemas";

export async function deleteConversation(advertId: number, buyerEmail: string) {
  // A. Načteme přihlášený e-mail z cookies
  const cookieStore = await cookies();
  const rawEmail = cookieStore.get("bazaar_chat_email")?.value || "";
  const loggedInEmail = rawEmail.trim().toLowerCase();

  // B. Zkontrolujeme, zda inzerát patří přihlášenému prodejci
  const record = db.select().from(advert).where(eq(advert.id, advertId)).get();
  if (!record || record.kontaktEmail.toLowerCase() !== loggedInEmail) {
    throw new Error("Neautorizovaný přístup - nejste prodejcem tohoto inzerátu.");
  }

  // C. Smažeme všechny zprávy v konverzaci
  db.delete(chatMessage)
    .where(and(eq(chatMessage.advertId, advertId), eq(chatMessage.buyerEmail, buyerEmail)))
    .run();

  revalidatePath("/[locale]/chat", "layout");
}

export async function sendChatMessage(formData: FormData) {
  const advertId = Number(formData.get("advertId"));
  const buyerEmail = String(formData.get("buyerEmail") ?? "")
    .trim()
    .toLowerCase();
  const buyerName = String(formData.get("buyerName") ?? "").trim();
  const senderEmail = String(formData.get("senderEmail") ?? "")
    .trim()
    .toLowerCase();
  const messageText = String(formData.get("text") ?? "").trim();

  if (!advertId || !buyerEmail || !buyerName || !senderEmail || !messageText) {
    throw new Error("Všechna pole musí být vyplněna!");
  }

  db.insert(chatMessage)
    .values({
      advertId,
      buyerEmail,
      buyerName,
      senderEmail,
      text: messageText,
      createdAt: Date.now(),
    })
    .run();

  revalidatePath("/[locale]/chat", "layout");
}
