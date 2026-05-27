"use server";

import { db } from "@/db";
import { chatMessage } from "@/db/schemas";
import { revalidatePath } from "next/cache";

export async function sendChatMessage(formData: FormData) {
  const advertId = Number(formData.get("advertId"));
  const buyerEmail = String(formData.get("buyerEmail") ?? "").trim();
  const buyerName = String(formData.get("buyerName") ?? "").trim();
  const senderEmail = String(formData.get("senderEmail") ?? "").trim();
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
