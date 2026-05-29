"use server";

import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { advert } from "@/db/schemas";
import { isAdvertOwner } from "@/helpers/auth";

function createSafeImageFileName(originalName: string) {
  const extension = extname(originalName).toLowerCase() || ".jpg";
  const safeBaseName =
    basename(originalName, extension)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase() || "obrazek";

  return `${safeBaseName}-${randomUUID()}${extension}`;
}

// Pomocná serverová funkce pro bezpečné uložení jednoho souboru na disk
async function saveSingleImage(file: File) {
  if (file.size === 0) return null;
  const uploadDir = join(process.cwd(), "public", "inzeraty");

  // Vytvoříme unikátní, bezpečný název souboru bez mezer a speciálních znaků
  const fileName = createSafeImageFileName(file.name);
  const filePath = join(uploadDir, fileName);

  const fileBuffer = Buffer.from(await file.arrayBuffer());
  await mkdir(uploadDir, { recursive: true });
  await writeFile(filePath, fileBuffer);

  return `/inzeraty/${fileName}`;
}

export async function updateAdvertAction(id: number, locale: string, formData: FormData) {
  const record = db.select().from(advert).where(eq(advert.id, id)).get();
  if (!record) {
    throw new Error("Inzerát nenalezen.");
  }
  // Serverová kontrola hesla z cookies
  const hasAccess = await isAdvertOwner(id, record.heslo);
  if (!hasAccess) {
    throw new Error("Neautorizovaný přístup - nejste vlastníkem inzerátu.");
  }
  // A. Vytáhneme textové hodnoty z FormData
  const titul = String(formData.get("titul") ?? "").trim();
  const popis = String(formData.get("popis") ?? "").trim();
  const cena = Number(formData.get("cena") ?? 0);
  const kategorie = String(formData.get("kategorie") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();
  const kontaktJmeno = String(formData.get("kontaktJmeno") ?? "").trim();
  const kontaktEmail = String(formData.get("kontaktEmail") ?? "").trim();
  const bankovniUcet = String(formData.get("bankovniUcet") ?? "").trim() || null;

  // B. Načteme seznam zachovaných starých obrázků (JSON pole)
  const stareCestyJson = String(formData.get("stareCestyJson") ?? "[]");
  const stareCesty: string[] = JSON.parse(stareCestyJson);

  // C. Získáme a uložíme nově nahrané soubory na disk
  const noveSoubory = formData.getAll("noveObrazkySoubory") as File[];
  const noveUlozeneCesty: string[] = [];

  for (const file of noveSoubory) {
    const ulozenaCesta = await saveSingleImage(file);
    if (ulozenaCesta) {
      noveUlozeneCesty.push(ulozenaCesta);
    }
  }

  // D. Sloučíme staré a nové cesty do jednoho výsledného pole
  const finalniPoleObrazku = [...stareCesty, ...noveUlozeneCesty];

  // E. Aktualizujeme inzerát v SQLite databázi
  db.update(advert)
    .set({
      titul,
      popis,
      cena,
      kategorie,
      status,
      kontaktJmeno,
      kontaktEmail,
      bankovniUcet,
      obrazek: finalniPoleObrazku.length > 0 ? JSON.stringify(finalniPoleObrazku) : null,
    })
    .where(eq(advert.id, id))
    .run();

  // F. Vymažeme mezipaměť (cache), aby se změny ihned promítly na webu
  revalidatePath(`/${locale}/inzeraty/${id}`);
  revalidatePath(`/${locale}/inzeraty`);
}

// Serverová akce pro smazání inzerátu
export async function deleteAdvertAction(id: number, locale: string) {
  const record = db.select().from(advert).where(eq(advert.id, id)).get();
  if (!record) {
    throw new Error("Inzerát nenalezen.");
  }
  // Serverová kontrola hesla z cookies
  const hasAccess = await isAdvertOwner(id, record.heslo);
  if (!hasAccess) {
    throw new Error("Neautorizovaný přístup - nejste vlastníkem inzerátu.");
  }
  db.delete(advert).where(eq(advert.id, id)).run();
  revalidatePath("/[locale]/inzeraty", "page");
  redirect(`/${locale}/inzeraty`);
}

// Serverová akce pro změnu stavu inzerátu
export async function updateAdvertStatus(formData: FormData) {
  const id = Number(formData.get("id"));
  const status = String(formData.get("status") ?? "");

  if (!Number.isInteger(id)) {
    return;
  }

  if (!["Dostupne", "Rezervovano", "Prodano"].includes(status)) {
    return;
  }

  const record = db.select().from(advert).where(eq(advert.id, id)).get();
  if (!record) return;

  // Serverová kontrola hesla z cookies
  const hasAccess = await isAdvertOwner(id, record.heslo);
  if (!hasAccess) {
    throw new Error("Neautorizovaný přístup.");
  }

  db.update(advert).set({ status }).where(eq(advert.id, id)).run();

  revalidatePath("/[locale]/inzeraty/[id]", "page");
  revalidatePath("/[locale]/inzeraty", "page");
}

// Serverová akce pro ověření a uložení hesla inzerátu do cookies
export async function authorizeAdvertPasswordAction(
  advertId: number,
  heslo: string,
): Promise<{ success: boolean; error?: string }> {
  const record = db.select().from(advert).where(eq(advert.id, advertId)).get();
  if (!record) {
    return { success: false, error: "Inzerát nebyl nalezen." };
  }

  if (heslo.trim() !== record.heslo) {
    return { success: false, error: "Zadané heslo je nesprávné." };
  }

  // Bezpečný zápis cookie na serveru
  const cookieStore = await cookies();
  const existingCookie = cookieStore.get("bazaar_keys")?.value || "";
  const parts = existingCookie ? existingCookie.split(",") : [];

  const filteredParts = parts.filter((p) => !p.startsWith(`${advertId}:`));
  filteredParts.push(`${advertId}:${encodeURIComponent(heslo.trim())}`);

  cookieStore.set("bazaar_keys", filteredParts.join(","), {
    path: "/",
    maxAge: 31536000,
    sameSite: "lax",
    httpOnly: true, // Zamezí klientskému JS v přístupu ke cookie
  });

  return { success: true };
}
