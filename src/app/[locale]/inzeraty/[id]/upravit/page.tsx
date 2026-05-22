import { Button, Group, Stack, Text, Title } from "@mantine/core";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { EditAdvertForm } from "@/components/adverts/EditAdvertForm";
import { db } from "@/db";
import { advert } from "@/db/schemas";
import { Link } from "@/i18n/navigation";

export default async function UpravitInzeratPage({ params }: PageProps<"/[locale]/inzeraty/[id]/upravit">) {
  const { id, locale } = await params;
  const advertId = Number(id);

  if (!Number.isInteger(advertId)) {
    notFound();
  }

  const inzerat = db.select().from(advert).where(eq(advert.id, advertId)).get();

  if (!inzerat) {
    notFound();
  }

  return (
    <Stack gap="xl" className="market-page">
      <Group justify="space-between" align="center">
        <div>
          <Text className="market-kicker">Edit stall license</Text>
          <Title order={1} className="market-title">
            Upravit nabídku
          </Title>
        </div>
        <Link href={`/inzeraty/${inzerat.id}`}>
          <Button variant="subtle" className="market-back-button">
            Zpět na detail
          </Button>
        </Link>
      </Group>
      {/* Vykreslíme interaktivní formulář a předáme mu data inzerátu a locale */}
      <EditAdvertForm inzerat={inzerat} locale={locale} />
    </Stack>
  );
}
