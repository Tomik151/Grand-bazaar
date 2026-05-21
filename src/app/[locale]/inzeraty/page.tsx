import { Badge, Button, Card, Group, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import Image from "next/image";
import { db } from "@/db";
import { advert } from "@/db/schemas";
import { getAdvertImageSrc } from "@/helpers/advert-image";
import { getAdvertStatusBadgeClassName } from "@/helpers/advert-status";
import { Link } from "@/i18n/navigation";

export default function InzeratyPage() {
  const inzeraty = db.select().from(advert).all();

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

      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xl">
        {inzeraty.map((inzerat) => {
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
