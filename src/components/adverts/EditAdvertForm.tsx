"use client";

import {
  Alert,
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
} from "@mantine/core";
import { useForm } from "@mantine/form";
import Image from "next/image";
import { useState } from "react";
import { deleteAdvertAction, updateAdvertAction } from "@/app/[locale]/inzeraty/[id]/upravit/edit-action";
import type { Advert } from "@/db/schemas";
import { getAdvertImageSources } from "@/helpers/advert-image";
import { isValidCzechBankAccount } from "@/helpers/bank";
import { Link } from "@/i18n/navigation";

interface EditAdvertFormProps {
  inzerat: Advert;
  locale: string;
}

interface ZobrazenyObrazek {
  id: string;
  url: string;
  typ: "stary" | "novy";
  file?: File;
}

export function EditAdvertForm({ inzerat, locale }: EditAdvertFormProps) {
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // 1. Inicializujeme stav pro obrázky (sjednotíme je pod jednotnou strukturu)
  const [images, setImages] = useState<ZobrazenyObrazek[]>(() => {
    const stareCesty = getAdvertImageSources(inzerat.obrazek);
    return stareCesty.map((cesta, index) => ({
      id: `stary-${index}-${cesta}`,
      url: cesta,
      typ: "stary",
    }));
  });

  const handleDelete = async () => {
    const potvrdit = window.confirm("Opravdu chcete smazat tento inzerát?");
    if (!potvrdit) return;

    setDeleting(true);
    try {
      await deleteAdvertAction(inzerat.id, locale);
    } catch (error) {
      console.error("Chyba při mazání:", error);
      setDeleting(false);
    }
  };

  // 2. Nastavení Mantine useForm
  const form = useForm({
    initialValues: {
      titul: inzerat.titul,
      popis: inzerat.popis,
      cena: inzerat.cena,
      zdarma: inzerat.cena === 0,
      kategorie: inzerat.kategorie,
      status: inzerat.status,
      kontaktJmeno: inzerat.kontaktJmeno,
      kontaktEmail: inzerat.kontaktEmail,
      bankovniUcet: inzerat.bankovniUcet || "",
    },
    validate: {
      titul: (value) => (value.trim().length < 3 ? "Název věci musí mít aspoň 3 znaky" : null),
      popis: (value) => (value.trim().length < 10 ? "Popis věci musí mít aspoň 10 znaků" : null),
      cena: (value, values) =>
        !values.zdarma && Number(value) <= 0 ? "Cena musí být vyšší než 0, nebo zaškrtni zdarma" : null,
      kontaktJmeno: (value) => (value.trim().length === 0 ? "Jméno je povinné" : null),
      kontaktEmail: (value) => (!value.includes("@") ? "Zadej platný e-mail" : null),
      bankovniUcet: (value) =>
        value.trim().length > 0 && !isValidCzechBankAccount(value)
          ? "Zadejte platné číslo bankovního účtu (např. 2000123456/0800)"
          : null,
    },
  });

  // 3. Klientské funkce pro správu fotek
  const removeImage = (idToRemove: string) => {
    setImages((prev) => prev.filter((img) => img.id !== idToRemove));
  };

  const moveImage = (index: number, direction: "left" | "right") => {
    const targetIndex = direction === "left" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const updated = [...images];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    setImages(updated);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vybraneSoubory = Array.from(e.target.files || []);
    const volnePozice = 10 - images.length;
    const souboryKPridani = vybraneSoubory.slice(0, volnePozice);

    const noveObrazky: ZobrazenyObrazek[] = souboryKPridani.map((soubor) => ({
      id: `novy-${soubor.name}-${Date.now()}-${Math.random()}`,
      url: URL.createObjectURL(soubor),
      typ: "novy",
      file: soubor,
    }));

    setImages((prev) => [...prev, ...noveObrazky]);
  };

  // 4. Odeslání formuláře (Sestavení FormData)
  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    setSuccess(false);
    try {
      const formData = new FormData();
      formData.append("titul", values.titul.trim());
      formData.append("popis", values.popis.trim());
      formData.append("cena", String(values.zdarma ? 0 : Number(values.cena)));
      formData.append("kategorie", values.kategorie);
      formData.append("status", values.status);
      formData.append("kontaktJmeno", values.kontaktJmeno.trim());
      formData.append("kontaktEmail", values.kontaktEmail.trim());
      formData.append("bankovniUcet", values.bankovniUcet.trim());

      // Získáme pole zbylých starých obrázků
      const stareCesty = images.filter((img) => img.typ === "stary").map((img) => img.url);
      formData.append("stareCestyJson", JSON.stringify(stareCesty));

      // Přidáme nové soubory přesně v aktuálním pořadí
      images.forEach((img) => {
        if (img.typ === "novy" && img.file) {
          formData.append("noveObrazkySoubory", img.file);
        }
      });

      await updateAdvertAction(inzerat.id, locale, formData);
      setSuccess(true);
    } catch (error) {
      console.error("Chyba při ukládání:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card padding="xl" withBorder maw={864} w="100%" className="market-form-card">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="lg">
          {success && (
            <Alert title="Úspěch! 🏺" color="teal" withCloseButton onClose={() => setSuccess(false)}>
              Změny byly úspěšně uloženy do bazaru. Můžeš se vrátit zpět na{" "}
              <Link
                href={`/inzeraty/${inzerat.id}`}
                style={{ textDecoration: "underline", color: "inherit", fontWeight: 700 }}
              >
                detail inzerátu
              </Link>
              .
            </Alert>
          )}

          <TextInput
            label="Název věci"
            placeholder="Např. perský koberec"
            classNames={{ input: "market-input", label: "market-input-label" }}
            required
            {...form.getInputProps("titul")}
          />

          <Textarea
            label="Popis"
            placeholder="Popiš stav věci, rozměry..."
            autosize
            minRows={6}
            maxRows={15}
            classNames={{ input: "market-input", label: "market-input-label" }}
            required
            {...form.getInputProps("popis")}
          />

          <NativeSelect
            label="Kategorie"
            classNames={{ input: "market-input", label: "market-input-label" }}
            required
            {...form.getInputProps("kategorie")}
          >
            <option value="">Vyber kategorii</option>
            <option value="Domacnost">Domácnost</option>
            <option value="Elektronika">Elektronika</option>
            <option value="Hudba">Hudba</option>
            <option value="Knihy">Knihy</option>
            <option value="Nabytek">Nábytek</option>
            <option value="Obleceni">Oblečení</option>
            <option value="Ostatni">Ostatní</option>
            <option value="Sluzby">Služby</option>
            <option value="Sport">Sport</option>
            <option value="Vstupenky">Vstupenky</option>
            <option value="Zahrada">Zahrada</option>
          </NativeSelect>

          <Group align="end" gap="lg">
            <TextInput
              label="Cena"
              type="number"
              min={0}
              disabled={form.values.zdarma}
              rightSection="Kč"
              w={400}
              classNames={{ input: "market-input", label: "market-input-label" }}
              required={!form.values.zdarma}
              {...form.getInputProps("cena")}
            />
            <Checkbox
              label="Nabídka je zdarma"
              mb={10}
              checked={form.values.zdarma}
              onChange={(event) => {
                form.setFieldValue("zdarma", event.currentTarget.checked);
                if (event.currentTarget.checked) {
                  form.setFieldValue("cena", 0);
                }
              }}
            />
          </Group>

          <TextInput
            label="Číslo bankovního účtu pro QR platby (volitelné)"
            placeholder="Např. 2000123456/0800"
            classNames={{ input: "market-input", label: "market-input-label" }}
            {...form.getInputProps("bankovniUcet")}
          />

          {/* SEKCE PRO SPRÁVU OBRÁZKŮ */}
          <Stack gap="xs" className="market-file-box">
            <Text fw={700} size="sm" className="market-input-label">
              Správa obrázků (Seřaďte šipkami, první je úvodní fotka)
            </Text>

            <Group gap="md" wrap="wrap">
              {images.map((img, idx) => (
                <div
                  key={img.id}
                  style={{
                    position: "relative",
                    border: "2px solid var(--bazaar-ink)",
                    padding: "4px",
                    background: "#ffffff",
                    boxShadow: "2px 2px 0 rgba(0,0,0,0.15)",
                  }}
                >
                  <Image src={img.url} alt="" width={80} height={80} style={{ objectFit: "cover" }} />

                  {/* Tlačítko smazat */}
                  <button
                    type="button"
                    onClick={() => removeImage(img.id)}
                    style={{
                      position: "absolute",
                      top: "-8px",
                      right: "-8px",
                      background: "var(--bazaar-red)",
                      color: "#ffffff",
                      border: "2px solid var(--bazaar-ink)",
                      cursor: "pointer",
                      fontWeight: "bold",
                      padding: "1px 5px",
                      fontSize: "10px",
                    }}
                  >
                    ❌
                  </button>

                  {/* Šipky posunu */}
                  <Group gap={6} justify="center" mt={6}>
                    <button
                      type="button"
                      className="bazaar-image-nav-btn"
                      disabled={idx === 0}
                      onClick={() => moveImage(idx, "left")}
                    >
                      ◀
                    </button>
                    <button
                      type="button"
                      className="bazaar-image-nav-btn"
                      disabled={idx === images.length - 1}
                      onClick={() => moveImage(idx, "right")}
                    >
                      ▶
                    </button>
                  </Group>
                </div>
              ))}
            </Group>

            {/* Input pro nové soubory */}
            {images.length < 10 && (
              <Stack gap={4} mt="sm">
                <Text size="xs" fw={700} className="market-input-label">
                  Přidat další obrázky:
                </Text>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="market-file-input"
                  onChange={handleFileChange}
                />
              </Stack>
            )}
          </Stack>

          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <TextInput
              label="Jméno kontaktu"
              placeholder="Tvoje jméno"
              classNames={{ input: "market-input", label: "market-input-label" }}
              required
              {...form.getInputProps("kontaktJmeno")}
            />
            <TextInput
              label="E-mail"
              type="email"
              placeholder="jmeno@example.com"
              classNames={{ input: "market-input", label: "market-input-label" }}
              required
              {...form.getInputProps("kontaktEmail")}
            />
          </SimpleGrid>

          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <NativeSelect
              label="Stav nabídky"
              classNames={{ input: "market-input", label: "market-input-label" }}
              required
              {...form.getInputProps("status")}
            >
              <option value="Dostupne">Dostupné</option>
              <option value="Rezervovano">Rezervováno</option>
              <option value="Prodano">Prodáno</option>
            </NativeSelect>
          </SimpleGrid>

          <Group justify="space-between" align="center">
            <Button type="button" className="market-delete-button" onClick={handleDelete} loading={deleting} h={42}>
              Smazat inzerát ❌
            </Button>
            <Button type="submit" className="market-action-button" loading={loading} h={42}>
              Uložit změny
            </Button>
          </Group>
        </Stack>
      </form>
    </Card>
  );
}
