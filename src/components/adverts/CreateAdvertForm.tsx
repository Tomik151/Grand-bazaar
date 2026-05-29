"use client";

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
} from "@mantine/core";
import { useForm } from "@mantine/form";
import Image from "next/image";
import { useState } from "react";
import { createAdvertAction } from "@/app/[locale]/inzeraty/novy/create-action";
import { isValidCzechBankAccount } from "@/helpers/bank";

interface CreateAdvertFormProps {
  locale: string;
}

interface ZobrazenyObrazek {
  id: string;
  url: string;
  file: File;
}

export function CreateAdvertForm({ locale }: CreateAdvertFormProps) {
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<ZobrazenyObrazek[]>([]);

  // Nastavení Mantine useForm
  const form = useForm({
    initialValues: {
      titul: "",
      popis: "",
      cena: 0,
      zdarma: false,
      kategorie: "",
      status: "Dostupne",
      kontaktJmeno: "",
      kontaktEmail: "",
      heslo: "",
      bankovniUcet: "",
    },
    validate: {
      titul: (value) => (value.trim().length < 3 ? "Název věci musí mít aspoň 3 znaky" : null),
      popis: (value) => (value.trim().length < 10 ? "Popis věci musí mít aspoň 10 znaků" : null),
      kategorie: (value) => (value === "" ? "Vyberte kategorii" : null),
      cena: (value, values) =>
        !values.zdarma && Number(value) <= 0 ? "Cena musí být vyšší než 0, nebo zaškrtněte zdarma" : null,
      kontaktJmeno: (value) => (value.trim().length === 0 ? "Jméno je povinné" : null),
      kontaktEmail: (value) => (!value.includes("@") ? "Zadejte platný e-mail" : null),
      heslo: (value) => (value.trim().length < 4 ? "Heslo musí mít alespoň 4 znaky" : null),
      bankovniUcet: (value) =>
        value.trim().length > 0 && !isValidCzechBankAccount(value)
          ? "Zadejte platné číslo bankovního účtu (např. 2000123456/0800)"
          : null,
    },
  });

  // Funkce pro správu fotek
  const removeImage = (idToRemove: string) => {
    setImages((prev) => {
      // Uvolníme objekt URL z paměti prohlížeče
      const found = prev.find((img) => img.id === idToRemove);
      if (found) URL.revokeObjectURL(found.url);
      return prev.filter((img) => img.id !== idToRemove);
    });
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
      id: `${soubor.name}-${Date.now()}-${Math.random()}`,
      url: URL.createObjectURL(soubor),
      file: soubor,
    }));

    setImages((prev) => [...prev, ...noveObrazky]);
  };

  // Odeslání formuláře
  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("titul", values.titul.trim());
      formData.append("popis", values.popis.trim());
      formData.append("cena", String(values.zdarma ? 0 : Number(values.cena)));
      formData.append("kategorie", values.kategorie);
      formData.append("status", values.status);
      formData.append("kontaktJmeno", values.kontaktJmeno.trim());
      formData.append("kontaktEmail", values.kontaktEmail.trim());
      formData.append("heslo", values.heslo.trim()); // Přidáno
      formData.append("bankovniUcet", values.bankovniUcet.trim());

      // Přidáme nahrané soubory přesně v aktuálním seřazeném pořadí
      images.forEach((img) => {
        formData.append("noveObrazkySoubory", img.file);
      });

      // Spustíme serverovou akci pro uložení
      await createAdvertAction(locale, formData);
    } catch (error) {
      console.error("Chyba při zakládání inzerátu:", error);
      setLoading(false);
    }
  };

  return (
    <Card padding="xl" withBorder maw={864} w="100%" className="market-form-card">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="lg">
          <TextInput
            label="Název věci"
            placeholder="Např. koncertní kytara, horské kolo"
            classNames={{ input: "market-input", label: "market-input-label" }}
            required
            {...form.getInputProps("titul")}
          />

          <Textarea
            label="Popis"
            placeholder="Popište stav, rozměry, místo předání..."
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

          {/* INTERAKTIVNÍ SEKCE PRO SPRÁVU OBRÁZKŮ */}
          <Stack gap="xs" className="market-file-box">
            <Text fw={700} size="sm" className="market-input-label">
              Fotografie inzerátu (Seřaďte šipkami, první je úvodní fotka – max. 10 fotek)
            </Text>

            {images.length > 0 && (
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
            )}

            {/* Input pro nové soubory */}
            {images.length < 10 && (
              <Stack gap={4} mt="sm">
                <Text size="xs" fw={700} className="market-input-label">
                  Přidat obrázky ({images.length}/10):
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
              placeholder="Vaše jméno"
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

          <TextInput
            label="Heslo pro budoucí úpravu / smazání"
            placeholder="Zadejte libovolné heslo (min. 4 znaky)"
            type="password"
            required
            classNames={{ input: "market-input", label: "market-input-label" }}
            {...form.getInputProps("heslo")}
          />

          <NativeSelect
            label="Stav nabídky při založení"
            classNames={{ input: "market-input", label: "market-input-label" }}
            required
            {...form.getInputProps("status")}
          >
            <option value="Dostupne">Dostupné</option>
            <option value="Rezervovano">Rezervované</option>
            <option value="Prodano">Prodáno</option>
          </NativeSelect>

          <Text size="sm" c="dimmed">
            Platbu a předání si domluvíte přímo se zájemcem.
          </Text>

          <Group justify="flex-end">
            <Button type="submit" loading={loading} className="market-action-button" disabled={loading}>
              {loading ? "Ukládám..." : "Přidat nabídku"}
            </Button>
          </Group>
        </Stack>
      </form>
    </Card>
  );
}
