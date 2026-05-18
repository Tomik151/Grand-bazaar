import { Badge, Button, Card, Group, SimpleGrid, Stack, Text, Title } from "@mantine/core";

const inzeraty = [
  {
    id: 1,
    nazev: "Detska zidle",
    popis: "Zachovala detska zidle vhodna ke stolu.",
    cena: 300,
    kategorie: "Detske veci",
    stav: "Dostupne",
  },
  {
    id: 2,
    nazev: "Starsi monitor",
    popis: "Funkcni monitor vhodny jako druha obrazovka.",
    cena: 0,
    kategorie: "Elektronika",
    stav: "Dostupne",
  },
  {
    id: 3,
    nazev: "Krabice knih",
    popis: "Mix starsich knih, vhodne k dalsimu cteni.",
    cena: 0,
    kategorie: "Knihy",
    stav: "Rezervovano",
  },
];

export default function InzeratyPage() {
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
                <Text fw={700}>{inzerat.nazev}</Text>
                <Badge>{inzerat.stav}</Badge>
              </Group>

              <Text size="sm" c="dimmed">
                {inzerat.popis}
              </Text>

              <Group justify="space-between">
                <Badge variant="light">{inzerat.kategorie}</Badge>
                <Text fw={700}>{inzerat.cena === 0 ? "Zdarma" : `${inzerat.cena} Kc`}</Text>
              </Group>

              <Button variant="light">Detail</Button>
            </Stack>
          </Card>
        ))}
      </SimpleGrid>
    </Stack>
  );
}
