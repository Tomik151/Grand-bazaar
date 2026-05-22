"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { advert } from "@/db/schemas";

export async function updateAdvertAction(
  id: number,
  data: {
    titul: string;
    popis: string;
    cena: number;
    kategorie: string;
    status: string;
    kontaktJmeno: string;
    kontaktEmail: string;
  },
) {
  db.update(advert)
    .set({
      titul: data.titul,
      popis: data.popis,
      cena: data.cena,
      kategorie: data.kategorie,
      status: data.status,
      kontaktJmeno: data.kontaktJmeno,
      kontaktEmail: data.kontaktEmail,
    })
    .where(eq(advert.id, id))
    .run();

  revalidatePath("/[locale]/inzeraty/[id]", "page");
  revalidatePath("/[locale]/inzeraty", "page");
}
