import { Button, Group, Stack, Text, Title } from "@mantine/core";
import { CreateAdvertForm } from "@/components/adverts/CreateAdvertForm";
import { Link } from "@/i18n/navigation";

interface RouteParams {
  locale: string;
}

export default async function NovyInzeratPage({ params }: { params: Promise<RouteParams> }) {
  const { locale } = await params;

  return (
    <Stack gap="xl" className="market-page">
      <Group justify="space-between" align="center">
        <div>
          <Text className="market-kicker">New stall permit</Text>
          <Title order={1} className="market-title">
            Přidat nabídku
          </Title>
        </div>

        <Link href="/inzeraty">
          <Button variant="subtle" className="market-back-button">
            Zpět
          </Button>
        </Link>
      </Group>

      <CreateAdvertForm locale={locale} />
    </Stack>
  );
}
