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
  Textarea,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState } from "react";
import { updateAdvertAction } from "@/app/[locale]/inzeraty/[id]/upravit/edit-action";
import type { Advert } from "@/db/schemas";
import { Link } from "@/i18n/navigation";

interface EditAdvertFormProps {
  inzerat: Advert;
}
export function EditAdvertForm({ inzerat }: EditAdvertFormProps) {
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  // 1. Nastavení Mantine useForm - předvyplnění hodnot a pravidla validace
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
    },
    validate: {
      titul: (value) => (value.trim().length < 3 ? "Název věci musí mít aspoň 3 znaky" : null),
      popis: (value) => (value.trim().length < 10 ? "Popis věci musí mít aspoň 10 znaků" : null),
      cena: (value, values) =>
        !values.zdarma && Number(value) <= 0 ? "Cena musí být vyšší než 0, nebo zaškrtni zdarma" : null,
      kontaktJmeno: (value) => (value.trim().length === 0 ? "Jméno je povinné" : null),
      kontaktEmail: (value) => (!value.includes("@") ? "Zadej platný e-mail" : null),
    },
  });
  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    setSuccess(false);
    try {
      // Zavoláme serverovou akci pro uložení
      await updateAdvertAction(inzerat.id, {
        titul: values.titul.trim(),
        popis: values.popis.trim(),
        cena: values.zdarma ? 0 : Number(values.cena),
        kategorie: values.kategorie,
        status: values.status,
        kontaktJmeno: values.kontaktJmeno.trim(),
        kontaktEmail: values.kontaktEmail.trim(),
      });
      setSuccess(true); // Zobrazíme Alert o úspěchu
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
          {/* Mantine Alert pro potvrzení změny */}
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
            minRows={4}
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
            <option value="Zahrada">Zahrada</option>
            <option value="Nabytek">Nábytek</option>
            <option value="Knihy">Knihy</option>
            <option value="Ostatni">Ostatní</option>
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
          <Group justify="flex-end">
            <Button type="submit" className="market-action-button" loading={loading}>
              Uložit změny
            </Button>
          </Group>
        </Stack>
      </form>
    </Card>
  );
}
