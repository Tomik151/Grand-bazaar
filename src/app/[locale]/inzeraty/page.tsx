import { Badge, Button, Card, Checkbox, Group, Select, SimpleGrid, Stack, Text, TextInput } from "@mantine/core";
import Image from "next/image";
import { db } from "@/db";
import { advert } from "@/db/schemas";
import { getAdvertImageSources } from "@/helpers/advert-image";
import { getAdvertStatusBadgeClassName } from "@/helpers/advert-status";
import { Link } from "@/i18n/navigation";

function normalizeValue(value: string | null | undefined): string {
  if (!value) return "";
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

interface RouteParams {
  locale: string;
}

interface SearchParams {
  q?: string;
  kategorie?: string;
  stav?: string;
  zdarma?: string;
  page?: string;
}

export default async function InzeratyPage({
  params,
  searchParams,
}: {
  params: Promise<RouteParams>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale } = await params;

  // 1. Načtení všech parametrů z URL adresy
  const { q, kategorie, stav, zdarma, page } = await searchParams;
  const currentPage = Number(page ?? "1");
  const LIMIT = 9;
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
  // 3. Výpočet stránkování (Pagination)
  const totalCount = filteredInzeraty.length;
  const totalPages = Math.ceil(totalCount / LIMIT);

  // Zamezíme tomu, aby byla stránka mimo rozsah (např. menší než 1 nebo větší než celkový počet stránek)
  const activePage = Math.min(Math.max(1, currentPage), Math.max(1, totalPages));

  const startIndex = (activePage - 1) * LIMIT;

  // .slice(od, do) vysekne ze všech inzerátů pouze těch 9 pro naši aktuální stránku
  const paginatedInzeraty = filteredInzeraty.slice(startIndex, startIndex + LIMIT);

  // Pomocná funkce, která vygeneruje odkaz na jinou stránku a ponechá aktivní filtry
  const getPageLink = (pageNumber: number) => {
    const paramsObj = new URLSearchParams();
    if (q) paramsObj.set("q", String(q));
    if (kategorie) paramsObj.set("kategorie", String(kategorie));
    if (stav) paramsObj.set("stav", String(stav));
    if (zdarma) paramsObj.set("zdarma", String(zdarma));
    paramsObj.set("page", String(pageNumber));
    return `/inzeraty?${paramsObj.toString()}`;
  };
  return (
    <Stack gap="xl" className="market-page">
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
                  { label: "Hudba", value: "Hudba" },
                  { label: "Knihy", value: "Knihy" },
                  { label: "Nábytek", value: "Nabytek" },
                  { label: "Oblečení", value: "Obleceni" },
                  { label: "Ostatní", value: "Ostatni" },
                  { label: "Služby", value: "Sluzby" },
                  { label: "Sport", value: "Sport" },
                  { label: "Vstupenky", value: "Vstupenky" },
                  { label: "Zahrada", value: "Zahrada" },
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
        {paginatedInzeraty.map((inzerat) => {
          const imageSources = getAdvertImageSources(inzerat.obrazek);
          const imageSrc = imageSources.length > 0 ? imageSources[0] : null;

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

      {/* Ovládací panel stránkování */}
      {totalPages > 1 && (
        <div className="bazaar-pagination-wrapper">
          <div className="bazaar-pagination-group">
            {/* Tlačítko PŘEDCHOZÍ */}
            {activePage > 1 ? (
              <Link href={getPageLink(activePage - 1)} className="bazaar-pagination-btn">
                ◀ Předchozí
              </Link>
            ) : (
              <button type="button" disabled className="bazaar-pagination-btn">
                ◀ Předchozí
              </button>
            )}

            {/* Číselná řada stránek */}
            {Array.from({ length: totalPages }, (_, i) => {
              const pageNum = i + 1;
              const isActive = pageNum === activePage;
              return (
                <Link
                  key={pageNum}
                  href={getPageLink(pageNum)}
                  className={`bazaar-pagination-btn ${isActive ? "active" : ""}`}
                >
                  {pageNum}
                </Link>
              );
            })}

            {/* Tlačítko DALŠÍ */}
            {activePage < totalPages ? (
              <Link href={getPageLink(activePage + 1)} className="bazaar-pagination-btn">
                Další ▶
              </Link>
            ) : (
              <button type="button" disabled className="bazaar-pagination-btn">
                Další ▶
              </button>
            )}
          </div>
        </div>
      )}
    </Stack>
  );
}
