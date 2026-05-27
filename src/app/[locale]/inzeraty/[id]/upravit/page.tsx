import { Button, Stack } from "@mantine/core";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { EditAdvertForm } from "@/components/adverts/EditAdvertForm";
import { db } from "@/db";
import { advert } from "@/db/schemas";
import { Link } from "@/i18n/navigation";

interface RouteParams {
  id: string;
  locale: string;
}

export default async function UpravitInzeratPage({ params }: { params: Promise<RouteParams> }) {
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
    <Stack gap="xs" className="market-page">
      <Link href={`/inzeraty/${inzerat.id}`} style={{ width: "fit-content" }}>
        <Button variant="subtle" className="market-back-button">
          Zpět na detail
        </Button>
      </Link>
      {/* Vykreslíme interaktivní formulář a předáme mu data inzerátu a locale */}
      <EditAdvertForm inzerat={inzerat} locale={locale} />
    </Stack>
  );
}
