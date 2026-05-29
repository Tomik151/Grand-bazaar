import { Badge, Button, Card, Divider, Group, SimpleGrid, Stack, Text } from "@mantine/core";
import { eq, or, sql } from "drizzle-orm";
import Image from "next/image";
import { db } from "@/db";
import { advert, chatMessage } from "@/db/schemas";
import { getAdvertImageSources } from "@/helpers/advert-image";
import { Link } from "@/i18n/navigation";
import { ChatListClient } from "./ChatListClient";
import { ChatPersister } from "./ChatPersister";
import { DeleteChatButton } from "./DeleteChatButton";

interface SearchParams {
  email?: string;
}

export default async function ChatListPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { email } = await searchParams;

  if (!email) {
    return <ChatListClient />;
  }

  const cleanEmail = email.trim().toLowerCase();

  // Načteme všechny zprávy, kde figuruje náš e-mail jako kupující nebo prodejce inzerátu
  const messages = db
    .select({
      message: chatMessage,
      advert: {
        id: advert.id,
        titul: advert.titul,
        kontaktEmail: advert.kontaktEmail,
        kontaktJmeno: advert.kontaktJmeno,
        obrazek: advert.obrazek,
      },
    })
    .from(chatMessage)
    .innerJoin(advert, eq(chatMessage.advertId, advert.id))
    .where(
      or(eq(sql`lower(${chatMessage.buyerEmail})`, cleanEmail), eq(sql`lower(${advert.kontaktEmail})`, cleanEmail)),
    )
    .all();

  // Seskupíme zprávy podle konverzací (inzerat.id + buyerEmail)
  interface GroupedChat {
    advertId: number;
    buyerEmail: string;
    buyerName: string;
    advertTitle: string;
    advertImage: string | null;
    otherName: string;
    otherEmail: string;
    latestText: string;
    latestTime: number;
    isMeSeller: boolean;
  }

  const chatsMap = new Map<string, GroupedChat>();

  for (const row of messages) {
    const key = `${row.message.advertId}_${row.message.buyerEmail}`;
    const isMeSeller = cleanEmail === row.advert.kontaktEmail.toLowerCase();

    const otherName = isMeSeller ? row.message.buyerName : row.advert.kontaktJmeno;
    const otherEmail = isMeSeller ? row.message.buyerEmail : row.advert.kontaktEmail;

    const existing = chatsMap.get(key);
    if (!existing || row.message.createdAt > existing.latestTime) {
      chatsMap.set(key, {
        advertId: row.message.advertId,
        buyerEmail: row.message.buyerEmail,
        buyerName: row.message.buyerName,
        advertTitle: row.advert.titul,
        advertImage: row.advert.obrazek,
        otherName,
        otherEmail,
        latestText: row.message.text,
        latestTime: row.message.createdAt,
        isMeSeller,
      });
    }
  }

  const activeChats = Array.from(chatsMap.values()).sort((a, b) => b.latestTime - a.latestTime);

  const formattedTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("cs-CZ", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Stack gap="xl" className="market-page">
      <div className="bazaar-search-card">
        <div
          className="bazaar-search-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "none",
            paddingBottom: 0,
          }}
        >
          <div className="bazaar-search-title-group">
            <span className="bazaar-search-icon">🏺</span>
            <Text fw={700} className="bazaar-search-title">
              Moje zprávy – Aktivní chaty
            </Text>
            <span className="bazaar-search-icon">🏺</span>
          </div>
          <ChatPersister email={cleanEmail} />
        </div>
        <Text className="bazaar-search-subtitle" style={{ textAlign: "center", marginTop: 8 }}>
          Přihlášen jako: <strong>{cleanEmail}</strong>
        </Text>
      </div>

      {activeChats.length === 0 ? (
        <Card padding="xl" withBorder className="market-card" style={{ textAlign: "center" }}>
          <Text size="lg" fw={700} style={{ fontFamily: "monospace" }}>
            Zatím zde nemáš žádné rozhovory. 🏺
          </Text>
          <Text size="sm" style={{ fontFamily: "monospace", marginTop: 8 }}>
            Když napíšeš prodejci na tržišti nebo ti někdo napíše na tvůj inzerát, uvidíš rozhovor zde!
          </Text>
        </Card>
      ) : (
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
          {activeChats.map((chat) => {
            const imageSources = getAdvertImageSources(chat.advertImage);
            const imageSrc = imageSources.length > 0 ? imageSources[0] : null;

            return (
              <Card key={`${chat.advertId}_${chat.buyerEmail}`} padding="lg" withBorder className="market-card">
                <Group wrap="nowrap" gap="md" align="flex-start">
                  {imageSrc ? (
                    <Image
                      src={imageSrc}
                      alt={chat.advertTitle}
                      width={100}
                      height={100}
                      style={{
                        border: "2px solid var(--bazaar-ink)",
                        objectFit: "cover",
                        imageRendering: "auto",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 100,
                        height: 100,
                        border: "2px solid var(--bazaar-ink)",
                        background:
                          "repeating-linear-gradient(45deg, rgba(33,19,13,0.1) 0 8px, transparent 8px 16px), #fffdf0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 24,
                      }}
                    >
                      🏺
                    </div>
                  )}

                  <Stack gap="xs" style={{ flex: 1, minWidth: 0 }}>
                    <Group justify="space-between" wrap="nowrap">
                      <Text fw={700} lineClamp={1} size="lg" style={{ fontFamily: "monospace" }}>
                        {chat.advertTitle}
                      </Text>
                      <Badge variant="filled" className="market-category-badge">
                        {chat.isMeSeller ? "Prodejce" : "Kupující"}
                      </Badge>
                    </Group>

                    <Divider className="market-divider" style={{ borderStyle: "dashed" }} />

                    <Text size="xs" style={{ fontFamily: "monospace", fontWeight: 700 }}>
                      Kontakt: {chat.otherName} ({chat.otherEmail})
                    </Text>

                    <Card
                      padding="xs"
                      withBorder
                      style={{
                        background: chat.isMeSeller ? "rgba(255, 212, 71, 0.15)" : "rgba(24, 183, 201, 0.1)",
                        borderStyle: "dashed",
                        borderRadius: 0,
                      }}
                    >
                      <Text size="sm" lineClamp={2} style={{ fontStyle: "italic" }}>
                        {chat.latestText}
                      </Text>
                    </Card>

                    <Group justify="space-between" align="center" mt="xs">
                      <Text size="xs" c="dimmed" style={{ fontFamily: "monospace" }}>
                        {formattedTime(chat.latestTime)}
                      </Text>

                      <Group gap="xs">
                        {chat.isMeSeller && <DeleteChatButton advertId={chat.advertId} buyerEmail={chat.buyerEmail} />}
                        <Link href={`/chat/${chat.advertId}?buyerEmail=${chat.buyerEmail}`}>
                          <Button size="xs" className="market-card-button">
                            Otevřít chat 💬
                          </Button>
                        </Link>
                      </Group>
                    </Group>
                  </Stack>
                </Group>
              </Card>
            );
          })}
        </SimpleGrid>
      )}
    </Stack>
  );
}
