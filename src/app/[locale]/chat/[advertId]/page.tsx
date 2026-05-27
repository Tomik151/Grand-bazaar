import { and, asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { advert, chatMessage } from "@/db/schemas";
import { ChatRoomClient } from "./ChatRoomClient";
import { StartChatClient } from "./StartChatClient";

interface RouteParams {
  advertId: string;
}

interface SearchParams {
  buyerEmail?: string;
}

export default async function ChatPage({
  params,
  searchParams,
}: {
  params: Promise<RouteParams>;
  searchParams: Promise<SearchParams>;
}) {
  const { advertId } = await params;
  const { buyerEmail } = await searchParams;

  const id = Number(advertId);
  if (!Number.isInteger(id)) {
    notFound();
  }

  // Načteme inzerát z databáze
  const inzerat = db.select().from(advert).where(eq(advert.id, id)).get();

  if (!inzerat) {
    notFound();
  }

  // Pokud není zadán e-mail kupujícího, znamená to, že chceme začít nový chat
  if (!buyerEmail) {
    return <StartChatClient advertId={inzerat.id} advertTitle={inzerat.titul} sellerEmail={inzerat.kontaktEmail} />;
  }

  const cleanBuyerEmail = buyerEmail.trim().toLowerCase();

  // Načteme všechny zprávy v této konverzaci, seřazené podle času vzestupně
  const messages = db
    .select()
    .from(chatMessage)
    .where(and(eq(chatMessage.advertId, id), eq(chatMessage.buyerEmail, cleanBuyerEmail)))
    .orderBy(asc(chatMessage.createdAt))
    .all();

  // Zjistíme jméno kupujícího z první dostupné zprávy (nebo použijeme výchozí)
  const firstMessage = messages[0];
  const buyerName = firstMessage ? firstMessage.buyerName : "Zájemce";

  return (
    <ChatRoomClient
      advert={{
        id: inzerat.id,
        titul: inzerat.titul,
        cena: inzerat.cena,
        kategorie: inzerat.kategorie,
        status: inzerat.status,
        kontaktEmail: inzerat.kontaktEmail,
        kontaktJmeno: inzerat.kontaktJmeno,
        obrazek: inzerat.obrazek,
      }}
      buyerEmail={cleanBuyerEmail}
      buyerName={buyerName}
      messages={messages.map((m) => ({
        id: m.id,
        senderEmail: m.senderEmail,
        text: m.text,
        createdAt: m.createdAt,
      }))}
    />
  );
}
