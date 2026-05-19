import { Badge, Button, Card, Divider, Group, Stack, Text, Title } from "@mantine/core";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { advert } from "@/db/schemas";
import { Link } from "@/i18n/navigation";

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

  return (
    <Stack gap="lg">
      <Link href="/inzeraty">
        <Button variant="subtle">Zpet na inzeraty</Button>
      </Link>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="md">
          <Group justify="space-between">
            <Title order={1}>{inzerat.titul}</Title>
            <Badge>{inzerat.status}</Badge>
          </Group>

          <Divider />

          <Stack gap="xs">
            <Text size="sm" c="dimmed">
              Popis
            </Text>
            <Text>{inzerat.popis}</Text>
          </Stack>

          <Divider />

          <Group justify="space-between">
            <Stack gap={4}>
              <Text size="sm" c="dimmed">
                Kategorie
              </Text>
              <Badge variant="light">{inzerat.kategorie}</Badge>
            </Stack>

            <Stack gap={4} align="flex-end">
              <Text size="sm" c="dimmed">
                Cena
              </Text>
              <Text fw={700}>{inzerat.cena === 0 ? "Zdarma" : `${inzerat.cena} Kc`}</Text>
            </Stack>
          </Group>
        </Stack>
      </Card>
    </Stack>
  );
}
