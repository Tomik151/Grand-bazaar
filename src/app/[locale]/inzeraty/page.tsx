import { Badge, Button, Card, Group, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { db } from "@/db";
import { advert } from "@/db/schemas";
import { Link } from "@/i18n/navigation";

export default function InzeratyPage() {
  const inzeraty = db.select().from(advert).all();

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Title>Inzeraty</Title>
        <Button>Novy inzerat</Button>
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
        {inzeraty.map((inzerat) => (
          <Card key={inzerat.id} shadow="sm" padding="lg" radius="md" withBorder>
            <Stack gap="sm">
              <Group justify="space-between">
                <Text fw={700}>{inzerat.titul}</Text>
                <Badge>{inzerat.status}</Badge>
              </Group>

              <Text size="sm" c="dimmed">
                {inzerat.popis}
              </Text>

              <Group justify="space-between">
                <Badge variant="light">{inzerat.kategorie}</Badge>
                <Text fw={700}>{inzerat.cena === 0 ? "Zdarma" : `${inzerat.cena} Kc`}</Text>
              </Group>

              <Link href={`/inzeraty/${inzerat.id}`}>
                <Button variant="light" fullWidth>
                  Detail
                </Button>
              </Link>
            </Stack>
          </Card>
        ))}
      </SimpleGrid>
    </Stack>
  );
}
