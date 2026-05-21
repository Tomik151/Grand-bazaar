import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import {
  Button,
  Card,
  Checkbox,
  Group,
  NativeSelect,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { advert } from "@/db/schemas";
import { Link } from "@/i18n/navigation";

export const runtime = "nodejs";

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

async function saveAdvertImage(value: FormDataEntryValue | null) {
  if (!(value instanceof File) || value.size === 0) {
    return null;
  }

  if (!value.type.startsWith("image/")) {
    return null;
  }

  const uploadDir = join(process.cwd(), "public", "inzeraty");
  const fileName = createSafeImageFileName(value.name);
  const filePath = join(uploadDir, fileName);
  const fileBuffer = Buffer.from(await value.arrayBuffer());

  await mkdir(uploadDir, { recursive: true });
  await writeFile(filePath, fileBuffer);

  return `/inzeraty/${fileName}`;
}

async function createAdvert(formData: FormData) {
  "use server";

  const titul = String(formData.get("titul") ?? "").trim();
  const popis = String(formData.get("popis") ?? "").trim();
  const rawCena = Number(formData.get("cena") ?? 0);
  const isZdarma = formData.get("zdarma") === "on";
  const kategorie = String(formData.get("kategorie") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();
  const kontaktJmeno = String(formData.get("kontaktJmeno") ?? "").trim();
  const kontaktEmail = String(formData.get("kontaktEmail") ?? "").trim();
  const obrazek = await saveAdvertImage(formData.get("obrazekSoubor"));

  db.insert(advert)
    .values({
      titul,
      popis,
      cena: isZdarma ? 0 : rawCena,
      kategorie,
      status,
      kontaktJmeno,
      kontaktEmail,
      obrazek,
    })
    .run();

  redirect("/inzeraty");
}

export default function NovyInzeratPage() {
  return (
    <Stack gap="xl" className="market-page">
      <Group justify="space-between" align="center">
        <div>
          <Text className="market-kicker">New stall permit</Text>
          <Title order={1} className="market-title">
            Pridat nabidku
          </Title>
        </div>

        <Link href="/inzeraty">
          <Button variant="subtle" className="market-back-button">
            Zpet
          </Button>
        </Link>
      </Group>

      <Card padding="xl" withBorder maw={864} w="100%" className="market-form-card">
        <form action={createAdvert}>
          <Stack gap="lg">
            <TextInput
              name="titul"
              label="Nazev veci"
              placeholder="Napr. konferencni stolek"
              classNames={{ input: "market-input", label: "market-input-label" }}
              required
            />

            <Textarea
              name="popis"
              label="Popis"
              placeholder="Popis stav, rozmery, misto predani..."
              minRows={4}
              classNames={{ input: "market-input", label: "market-input-label" }}
              required
            />

            <NativeSelect
              name="kategorie"
              label="Kategorie"
              classNames={{ input: "market-input", label: "market-input-label" }}
              required
            >
              <option value="">Vyber kategorii</option>
              <option value="Domacnost">Domacnost</option>
              <option value="Elektronika">Elektronika</option>
              <option value="Zahrada">Zahrada</option>
              <option value="Nabytek">Nabytek</option>
              <option value="Knihy">Knihy</option>
              <option value="Ostatni">Ostatni</option>
            </NativeSelect>

            <Group align="end" gap="lg">
              <TextInput
                name="cena"
                label="Cena"
                type="number"
                min={0}
                defaultValue={0}
                rightSection="Kc"
                w={400}
                classNames={{ input: "market-input", label: "market-input-label" }}
              />
              <Checkbox name="zdarma" label="Nabidka je zdarma" mb={10} />
            </Group>

            <SimpleGrid cols={{ base: 1, sm: 2 }}>
              <TextInput
                name="kontaktJmeno"
                label="Jmeno kontaktu"
                placeholder="Tvoje jmeno"
                classNames={{ input: "market-input", label: "market-input-label" }}
                required
              />

              <TextInput
                name="kontaktEmail"
                label="E-mail"
                type="email"
                placeholder="jmeno@example.com"
                classNames={{ input: "market-input", label: "market-input-label" }}
                required
              />
            </SimpleGrid>

            <SimpleGrid cols={{ base: 1, sm: 2 }}>
              <NativeSelect
                name="status"
                label="Stav nabidky"
                defaultValue="Dostupne"
                classNames={{ input: "market-input", label: "market-input-label" }}
                required
              >
                <option value="Dostupne">Dostupne</option>
                <option value="Rezervovano">Rezervovano</option>
                <option value="Prodano">Prodano</option>
              </NativeSelect>

              <Stack gap={6} className="market-file-box">
                <Text fw={500} size="sm" className="market-input-label">
                  Obrazek
                </Text>
                <input type="file" name="obrazekSoubor" accept="image/*" className="market-file-input" />
                <Text size="xs" c="dimmed">
                  Vyber obrazek z pocitace. Aplikace ho ulozi do public/inzeraty.
                </Text>
              </Stack>
            </SimpleGrid>

            <Text size="sm" c="dimmed">
              Platbu a predani si domluvis primo se zajemcem.
            </Text>

            <Group justify="flex-end">
              <Button type="submit" className="market-action-button">
                Pridat nabidku
              </Button>
            </Group>
          </Stack>
        </form>
      </Card>
    </Stack>
  );
}
