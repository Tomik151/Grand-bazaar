import { Alert, Badge, Button, Card, Divider, Group, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import Image from "next/image";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { advert } from "@/db/schemas";
import { getAdvertImageSrc } from "@/helpers/advert-image";
import { getAdvertStatusBadgeClassName } from "@/helpers/advert-status";
import { Link } from "@/i18n/navigation";

async function updateAdvertStatus(formData: FormData) {
  "use server";

  const id = Number(formData.get("id"));
  const status = String(formData.get("status") ?? "");

  if (!Number.isInteger(id)) {
    return;
  }

  if (!["Dostupne", "Rezervovano", "Prodano"].includes(status)) {
    return;
  }

  db.update(advert).set({ status }).where(eq(advert.id, id)).run();

  revalidatePath("/[locale]/inzeraty/[id]", "page");
  revalidatePath("/[locale]/inzeraty", "page");
}

export default async function InzeratDetailPage({ params }: PageProps<"/[locale]/inzeraty/[id]">) {
  const { id } = await params;
  const advertId = Number(id);

  if (!Number.isInteger(advertId)) {
    notFound();
  }

  const inzerat = db.select().from(advert).where(eq(advert.id, advertId)).get();

  if (!inzerat) {
    notFound();
  }

  const imageSrc = getAdvertImageSrc(inzerat.obrazek);

  return (
    <Stack gap="lg" className="market-page">
      <Link href="/inzeraty">
        <Button variant="subtle" className="market-back-button">
          Zpet na trziste
        </Button>
      </Link>

      <Card padding="lg" withBorder className="market-detail-card">
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
          {imageSrc ? (
            <Image className="market-detail-image" src={imageSrc} alt={inzerat.titul} width={520} height={360} />
          ) : null}

          <Stack gap="md" className="market-detail-panel">
            <Group justify="space-between" align="center">
              <Title order={1} className="market-title">
                {inzerat.titul}
              </Title>
              <Group gap="sm">
                <Badge variant="filled" className={getAdvertStatusBadgeClassName(inzerat.status)}>
                  {inzerat.status}
                </Badge>
                <Link href={`/inzeraty/${inzerat.id}/upravit`}>
                  <Button variant="outline" className="market-card-button">
                    Upravit
                  </Button>
                </Link>
              </Group>
            </Group>

            <Divider className="market-divider" />

            <Stack gap="xs">
              <Text size="sm" className="market-label">
                Popis
              </Text>
              <Text className="market-detail-text">{inzerat.popis}</Text>
            </Stack>

            <Divider className="market-divider" />

            <Stack gap="xs">
              <Text size="sm" className="market-label">
                Kontakt
              </Text>
              <Text className="market-detail-text">{inzerat.kontaktJmeno}</Text>
              <Text className="market-detail-text">{inzerat.kontaktEmail}</Text>
            </Stack>

            <Divider className="market-divider" />

            <Group justify="space-between" align="flex-start">
              <Stack gap={4}>
                <Text size="sm" className="market-label">
                  Kategorie
                </Text>
                <Badge variant="filled" className="market-category-badge">
                  {inzerat.kategorie}
                </Badge>
              </Stack>

              <Stack gap={4} align="flex-end">
                <Text size="sm" className="market-label">
                  Cena
                </Text>
                <Text fw={700} className="market-price">
                  {inzerat.cena === 0 ? "Zdarma" : `${inzerat.cena} Kc`}
                </Text>
              </Stack>
            </Group>

            {inzerat.cena > 0 ? (
              <>
                <Divider className="market-divider" />
                <Card withBorder padding="md" className="market-qr-payment-card">
                  <Stack gap="xs">
                    <Text size="sm" className="market-label" style={{ color: "var(--bazaar-ink)", fontWeight: 700 }}>
                      QR Platba (Příspěvek prodejci) 🏺
                    </Text>

                    <Group gap="md" align="center" wrap="nowrap">
                      <Image
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                          `SPD*1.0*ACC:CZ5608000000002000123456*AM:${inzerat.cena.toFixed(
                            2,
                          )}*CC:CZK*MSG:Inzerat_${inzerat.id}`,
                        )}`}
                        alt="QR kód pro platbu"
                        width={120}
                        height={120}
                        style={{
                          border: "3px solid var(--bazaar-ink)",
                          boxShadow: "3px 3px 0 var(--bazaar-shadow)",
                        }}
                      />

                      <Stack gap={4}>
                        <Text size="sm" fw={700} className="market-label" style={{ color: "var(--bazaar-red)" }}>
                          Naskenuj a zaplať 📱
                        </Text>
                        <Text size="xs" style={{ lineHeight: 1.4, fontFamily: "monospace", fontWeight: 600 }}>
                          Tento QR kód je plně funkční standardní CZ QR platba!
                        </Text>
                        <Text size="xs" style={{ lineHeight: 1.3, fontFamily: "monospace", fontWeight: 500 }}>
                          <strong>Účet:</strong> 2000123456/0800
                          <br />
                          <strong>Částka:</strong> {inzerat.cena} Kč
                          <br />
                          <strong>Zpráva:</strong> Inzerat_{inzerat.id}
                        </Text>
                      </Stack>
                    </Group>

                    <Alert
                      color="orange"
                      title="Důležité upozornění"
                      styles={{
                        root: {
                          border: "2px solid var(--bazaar-ink)",
                          borderRadius: 0,
                          background: "#fffbf0",
                          marginTop: 8,
                        },
                        title: {
                          fontFamily: '"Courier New", monospace',
                          fontWeight: 700,
                          color: "var(--bazaar-ink)",
                        },
                      }}
                    >
                      <Text size="xs" style={{ fontFamily: "monospace", fontWeight: 600 }}>
                        Bazar nezprostředkovává platby. Tento QR kód slouží k usnadnění platby mezi uživateli. Všechny
                        transakce si kupující a prodávající řeší sami.
                      </Text>
                    </Alert>
                  </Stack>
                </Card>
              </>
            ) : null}

            <Divider className="market-divider" />

            <Stack gap="xs">
              <Text size="sm" className="market-label">
                Zmenit stav
              </Text>

              <Group>
                <form action={updateAdvertStatus}>
                  <input type="hidden" name="id" value={inzerat.id} />
                  <input type="hidden" name="status" value="Rezervovano" />
                  <Button type="submit" className="market-card-button">
                    Rezervovat
                  </Button>
                </form>

                <form action={updateAdvertStatus}>
                  <input type="hidden" name="id" value={inzerat.id} />
                  <input type="hidden" name="status" value="Prodano" />
                  <Button type="submit" className="market-action-button">
                    Prodano
                  </Button>
                </form>
              </Group>
            </Stack>
          </Stack>
        </SimpleGrid>
      </Card>
    </Stack>
  );
}
