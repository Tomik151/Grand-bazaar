import { cookies } from "next/headers";

// Přečte uložená oprávnění z cookies a vrátí mapu { [id_inzeratu]: heslo }
export async function getAuthorizedAdverts(): Promise<Record<number, string>> {
  const cookieStore = await cookies();
  const rawCookie = cookieStore.get("bazaar_keys")?.value || "";
  const keys: Record<number, string> = {};

  if (!rawCookie) return keys;

  // Formát cookie: "12:heslo123,45:mojeheslo"
  const parts = rawCookie.split(",");
  for (const part of parts) {
    const [idStr, password] = part.split(":");
    if (idStr && password) {
      const id = Number(idStr);
      if (Number.isInteger(id)) {
        keys[id] = decodeURIComponent(password);
      }
    }
  }

  return keys;
}

// Zkontroluje, zda heslo z cookies souhlasí s heslem inzerátu v databázi
export async function isAdvertOwner(advertId: number, dbPassword?: string | null): Promise<boolean> {
  if (!dbPassword) return false;
  const authorized = await getAuthorizedAdverts();
  return authorized[advertId] === dbPassword;
}
