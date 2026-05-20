import { Badge, Button, Card, Group, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import Image from "next/image";
import { db } from "@/db";
import { advert } from "@/db/schemas";
import { getAdvertImageSrc } from "@/helpers/advert-image";
import { Link } from "@/i18n/navigation";

export default function InzeratyPage() {
  const inzeraty = db.select().from(advert).all();

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Title>Inzeraty</Title>
        <Link href="/inzeraty/novy">
          <Button>Novy inzerat</Button>
        </Link>
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
        {inzeraty.map((inzerat) => {
          const imageSrc = getAdvertImageSrc(inzerat.obrazek);

          return (
            <Card key={inzerat.id} shadow="sm" padding="lg" radius="md" withBorder h="100%">
              {imageSrc ? (
                <Image
                  src={imageSrc}
                  alt={inzerat.titul}
                  width={400}
                  height={240}
                  style={{
                    width: "100%",
                    height: 180,
                    objectFit: "cover",
                    borderRadius: 8,
                  }}
                />
              ) : null}

              <Stack gap="sm" h="100%" mt="sm">
                <Group justify="space-between">
                  <Text fw={700}>{inzerat.titul}</Text>
                  <Badge>{inzerat.status}</Badge>
                </Group>

                <Text size="sm" c="dimmed" lineClamp={3} mih={60}>
                  {inzerat.popis}
                </Text>

                <Group justify="space-between">
                  <Badge variant="light">{inzerat.kategorie}</Badge>
                  <Text fw={700}>{inzerat.cena === 0 ? "Zdarma" : `${inzerat.cena} Kc`}</Text>
                </Group>

                <div style={{ flex: 1 }} />

                <Link href={`/inzeraty/${inzerat.id}`}>
                  <Button variant="light" fullWidth>
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
