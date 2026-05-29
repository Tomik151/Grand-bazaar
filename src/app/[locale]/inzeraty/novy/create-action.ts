"use server";

import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { advert } from "@/db/schemas";

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

export async function createAdvertAction(locale: string, formData: FormData) {
  // A. Vytáhneme textové hodnoty z FormData
  const titul = String(formData.get("titul") ?? "").trim();
  const popis = String(formData.get("popis") ?? "").trim();
  const cena = Number(formData.get("cena") ?? 0);
  const kategorie = String(formData.get("kategorie") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();
  const kontaktJmeno = String(formData.get("kontaktJmeno") ?? "").trim();
  const kontaktEmail = String(formData.get("kontaktEmail") ?? "").trim();
  const heslo = String(formData.get("heslo") ?? "").trim();
  const bankovniUcet = String(formData.get("bankovniUcet") ?? "").trim() || null;

  // B. Získáme a uložíme nově nahrané soubory na disk v pořadí, v jakém byly seřazené
  const noveSoubory = formData.getAll("noveObrazkySoubory") as File[];
  const noveUlozeneCesty: string[] = [];

  for (const file of noveSoubory) {
    const ulozenaCesta = await saveSingleImage(file);
    if (ulozenaCesta) {
      noveUlozeneCesty.push(ulozenaCesta);
    }
  }

  // C. Aktualizujeme inzerát v SQLite databázi
  const result = db
    .insert(advert)
    .values({
      titul,
      popis,
      cena,
      kategorie,
      status,
      kontaktJmeno,
      kontaktEmail,
      heslo,
      bankovniUcet,
      obrazek: noveUlozeneCesty.length > 0 ? JSON.stringify(noveUlozeneCesty) : null,
    })
    .run();

  const newId = result.lastInsertRowid;

  // D. Automatické udělení vlastnictví zapsáním do serverové cookie
  const cookieStore = await cookies();
  const existingCookie = cookieStore.get("bazaar_keys")?.value || "";
  const parts = existingCookie ? existingCookie.split(",") : [];
  parts.push(`${newId}:${encodeURIComponent(heslo)}`);

  cookieStore.set("bazaar_keys", parts.join(","), {
    path: "/",
    maxAge: 31536000,
    sameSite: "lax",
  });

  // E. Vymažeme mezipaměť a přesměrujeme zpět na přehled
  revalidatePath(`/${locale}/inzeraty`);
  redirect(`/${locale}/inzeraty`);
}
