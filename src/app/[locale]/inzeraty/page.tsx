import { Badge, Button, Card, Checkbox, Group, Select, SimpleGrid, Stack, Text, TextInput, Title } from "@mantine/core";
import Image from "next/image";
import { db } from "@/db";
import { advert } from "@/db/schemas";
import { getAdvertImageSrc } from "@/helpers/advert-image";
import { getAdvertStatusBadgeClassName } from "@/helpers/advert-status";
import { Link } from "@/i18n/navigation";

function normalizeValue(value: string | null | undefined): string {
  if (!value) return "";
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export default async function InzeratyPage({ params, searchParams }: PageProps<"/[locale]/inzeraty">) {
  const { locale } = await params;

  // 1. Načtení všech parametrů z URL adresy
  const { q, kategorie, stav, zdarma } = await searchParams;
  const searchQuery = String(q ?? "")
    .trim()
    .toLowerCase();
  const selectedKategorie = String(kategorie ?? "");
  const selectedStav = String(stav ?? "");
  const onlyZdarma = zdarma === "true";

  const inzeraty = db.select().from(advert).all();

  // 2. Filtrování inzerátů na základě vybraných hodnot
  const filteredInzeraty = inzeraty.filter((inzerat) => {
    const title = inzerat.titul.toLowerCase();
    const description = inzerat.popis.toLowerCase();

    const matchesSearch = title.includes(searchQuery) || description.includes(searchQuery);
    const matchesKategorie =
      !selectedKategorie || normalizeValue(inzerat.kategorie) === normalizeValue(selectedKategorie);
    const matchesStav = !selectedStav || normalizeValue(inzerat.status) === normalizeValue(selectedStav);
    const matchesZdarma = !onlyZdarma || inzerat.cena === 0;

    return matchesSearch && matchesKategorie && matchesStav && matchesZdarma;
  });

  return (
    <Stack gap="xl" className="market-page">
      <Group justify="space-between" align="flex-end" className="market-heading">
        <div>
          <Text className="market-kicker">Istanbul modem bazaar</Text>
          <Title className="market-title">Trziste</Title>
        </div>
        <Link href="/inzeraty/novy">
          <Button className="market-action-button">Pridat zbozi</Button>
        </Link>
      </Group>

      {/* Turecký Retro Bazar vyhledávací box s filtry */}
      <div className="bazaar-search-card">
        <div className="bazaar-search-header">
          <div className="bazaar-search-title-group">
            <span className="bazaar-search-icon">🏺</span>
            <Text fw={700} className="bazaar-search-title">
              Velký Bazar – Vyhledávání
            </Text>
            <span className="bazaar-search-icon">🏺</span>
          </div>
          <Text className="bazaar-search-subtitle">
            „Smlouvejte s rozumem, nakupujte s láskou! Nejlepší orientální kousky na jednom místě.“
          </Text>
        </div>

        <form action={`/${locale}/inzeraty`} className="bazaar-search-form">
          <Stack gap="md">
            <div className="bazaar-search-row">
              <TextInput
                name="q"
                placeholder="🔍 Hledej koření, koberce, čaj, elektroniku..."
                defaultValue={searchQuery}
                className="bazaar-search-input-wrapper"
                styles={{
                  input: {
                    height: 48,
                    fontSize: 16,
                    fontFamily: '"Courier New", "Lucida Console", monospace',
                    fontWeight: 700,
                    paddingLeft: 14,
                  },
                }}
                classNames={{ input: "market-input" }}
              />
              <Button type="submit" className="market-action-button bazaar-search-button">
                Najít zboží (Ara!)
              </Button>
            </div>

            {/* Filtry pro kategorii, stav a věci zdarma */}
            <Group grow align="flex-end" gap="sm">
              <Select
                name="kategorie"
                label="Kategorie"
                placeholder="Všechny kategorie"
                defaultValue={selectedKategorie}
                data={[
                  { label: "Domácnost", value: "Domacnost" },
                  { label: "Elektronika", value: "Elektronika" },
                  { label: "Zahrada", value: "Zahrada" },
                  { label: "Nábytek", value: "Nabytek" },
                  { label: "Knihy", value: "Knihy" },
                  { label: "Ostatní", value: "Ostatni" },
                ]}
                clearable
                classNames={{ input: "market-input", label: "market-input-label" }}
              />

              <Select
                name="stav"
                label="Stav"
                placeholder="Jakýkoliv stav"
                defaultValue={selectedStav}
                data={[
                  { label: "Dostupné", value: "Dostupne" },
                  { label: "Rezervováno", value: "Rezervovano" },
                  { label: "Prodáno", value: "Prodano" },
                ]}
                clearable
                classNames={{ input: "market-input", label: "market-input-label" }}
              />

              <div style={{ paddingBottom: 10 }}>
                <Checkbox
                  name="zdarma"
                  value="true"
                  label="Pouze věci zdarma"
                  defaultChecked={onlyZdarma}
                  color="var(--bazaar-red)"
                  styles={{
                    label: {
                      fontFamily: '"Courier New", "Lucida Console", monospace',
                      fontWeight: 700,
                      color: "var(--bazaar-ink)",
                    },
                  }}
                />
              </div>
            </Group>
          </Stack>
        </form>
      </div>

      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xl">
        {filteredInzeraty.map((inzerat) => {
          const imageSrc = getAdvertImageSrc(inzerat.obrazek);

          return (
            <Card key={inzerat.id} padding="lg" withBorder h="100%" className="market-card">
              {imageSrc ? (
                <Image className="market-card-image" src={imageSrc} alt={inzerat.titul} width={400} height={240} />
              ) : null}

              <Stack gap="sm" h="100%" mt="sm" className="market-card-body">
                <div className="market-card-header">
                  <Text fw={700} className="market-card-title">
                    {inzerat.titul}
                  </Text>
                  <Badge variant="filled" className={getAdvertStatusBadgeClassName(inzerat.status)}>
                    {inzerat.status}
                  </Badge>
                </div>

                <Text lineClamp={3} className="market-card-description">
                  {inzerat.popis}
                </Text>

                <Group justify="space-between" align="center" className="market-card-meta">
                  <Badge variant="filled" className="market-category-badge">
                    {inzerat.kategorie}
                  </Badge>
                  <Text fw={700} className="market-price">
                    {inzerat.cena === 0 ? "Zdarma" : `${inzerat.cena} Kc`}
                  </Text>
                </Group>

                <div className="market-card-spacer" />

                <Link href={`/inzeraty/${inzerat.id}`}>
                  <Button variant="light" fullWidth className="market-card-button">
                    Detail
                  </Button>
                </Link>
              </Stack>
            </Card>
          );
        })}
      </SimpleGrid>
    </Stack>
  );
}
