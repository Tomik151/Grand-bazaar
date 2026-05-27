"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button, Card, Divider, Group, Stack, Text, TextInput } from "@mantine/core";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { sendChatMessage } from "../actions";

interface MessageData {
  id: number;
  senderEmail: string;
  text: string;
  createdAt: number;
}

interface AdvertData {
  id: number;
  titul: string;
  cena: number;
  kategorie: string;
  status: string;
  kontaktEmail: string;
  kontaktJmeno: string;
  obrazek: string | null;
}

interface ChatRoomClientProps {
  advert: AdvertData;
  buyerEmail: string;
  buyerName: string;
  messages: MessageData[];
}

export function ChatRoomClient({ advert, buyerEmail, buyerName, messages }: ChatRoomClientProps) {
  const router = useRouter();
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [inputEmail, setInputEmail] = useState("");
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Zjistíme aktivního uživatele z localStorage
  useEffect(() => {
    const storedEmail = localStorage.getItem("bazaar_chat_email")?.trim().toLowerCase() || "";
    if (storedEmail === buyerEmail.toLowerCase() || storedEmail === advert.kontaktEmail.toLowerCase()) {
      setCurrentUserEmail(storedEmail);
    }
  }, [buyerEmail, advert.kontaktEmail]);

  // 2. Automatický scroll dolů při načtení a nových zprávách
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentUserEmail]);

  // 3. Automatické obnovování chatu (polling) každé 3 sekundy, pokud je karta aktivní
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        router.refresh();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [router]);

  // 3. Zpracování zadání e-mailu (pokud není uložen)
  const handleJoinChat = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = inputEmail.trim().toLowerCase();
    if (cleanEmail === buyerEmail.toLowerCase() || cleanEmail === advert.kontaktEmail.toLowerCase()) {
      localStorage.setItem("bazaar_chat_email", cleanEmail);
      setCurrentUserEmail(cleanEmail);
    } else {
      alert("Tento e-mail nepatří žádnému z účastníků této konverzace!");
    }
  };

  // 4. Odeslání zprávy
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || sending || !currentUserEmail) return;
    setSending(true);

    const messageToSend = replyText.trim();
    setReplyText(""); // vymažeme input okamžitě pro lepší odezvu

    try {
      const formData = new FormData();
      formData.append("advertId", String(advert.id));
      formData.append("buyerEmail", buyerEmail);
      formData.append("buyerName", buyerName);
      formData.append("senderEmail", currentUserEmail);
      formData.append("text", messageToSend);

      await sendChatMessage(formData);
    } catch (err) {
      console.error("Chyba při odesílání:", err);
      alert("Zprávu se nepodařilo odeslat.");
      setReplyText(messageToSend); // vrátíme text zpět v případě chyby
    } finally {
      setSending(false);
    }
  };

  // 5. Pokud uživatel není identifikován, ukážeme ověřovací formulář
  if (!currentUserEmail) {
    return (
      <Card padding="xl" withBorder className="bazaar-search-card" style={{ maxWidth: 500, margin: "0 auto" }}>
        <div className="bazaar-search-header">
          <span className="bazaar-search-icon">🏺</span>
          <Text fw={700} className="bazaar-search-title">
            Vstup do chatu
          </Text>
          <Text className="bazaar-search-subtitle">
            Tento rozhovor je soukromý mezi zájemcem <strong>{buyerName}</strong> a prodejcem{" "}
            <strong>{advert.kontaktJmeno}</strong>.
          </Text>
        </div>

        <form onSubmit={handleJoinChat}>
          <Stack gap="md">
            <TextInput
              label="Zadejte svůj e-mail pro ověření identity"
              placeholder="např. alena@example.com"
              value={inputEmail}
              onChange={(e) => setInputEmail(e.target.value)}
              required
              type="email"
              classNames={{ input: "market-input", label: "market-input-label" }}
            />

            <Button type="submit" className="market-action-button" fullWidth style={{ height: 44 }}>
              Vstoupit do chatu 💬
            </Button>
          </Stack>
        </form>
      </Card>
    );
  }

  const isMeSeller = currentUserEmail === advert.kontaktEmail.toLowerCase();
  const interlocutorName = isMeSeller ? buyerName : advert.kontaktJmeno;
  const interlocutorEmail = isMeSeller ? buyerEmail : advert.kontaktEmail;

  return (
    <Stack gap="md" className="market-page">
      {/* Horní info lišta chatu */}
      <Link href="/chat">
        <Button variant="subtle" className="market-back-button">
          ◀ Zpět na moje zprávy
        </Button>
      </Link>

      {/* Mini-karta inzerátu */}
      <Card padding="md" withBorder className="market-card">
        <Group justify="space-between" wrap="nowrap" align="center">
          <Group gap="sm" wrap="nowrap">
            <span style={{ fontSize: 24 }}>🏺</span>
            <Stack gap={0}>
              <Text fw={700} size="md" style={{ fontFamily: "monospace", color: "var(--bazaar-ink)" }}>
                Chat o zboží: {advert.titul}
              </Text>
              <Text size="xs" style={{ fontFamily: "monospace" }}>
                Chat s:{" "}
                <strong>
                  {interlocutorName} ({interlocutorEmail})
                </strong>
              </Text>
            </Stack>
          </Group>

          <Group gap="xs">
            <Badge variant="filled" className="market-category-badge">
              Cena: {advert.cena === 0 ? "Zdarma" : `${advert.cena} Kč`}
            </Badge>
            <Link href={`/inzeraty/${advert.id}`}>
              <Button size="xs" variant="outline" className="market-card-button">
                Zobrazit inzerát 🔍
              </Button>
            </Link>
          </Group>
        </Group>
      </Card>

      {/* Hlavní okno chatu */}
      <div className="bazaar-chat-container">
        <div className="bazaar-chat-header">
          <Text size="sm">
            Právě si dopisujete o inzerátu <strong>{advert.titul}</strong>
          </Text>
          <Badge color="red" size="sm" variant="outline">
            {isMeSeller ? "Jsem Prodejce" : "Jsem Kupující"}
          </Badge>
        </div>

        {/* Seznam zpráv */}
        <div className="bazaar-chat-messages">
          {messages.length === 0 ? (
            <Text c="dimmed" style={{ textAlign: "center", margin: "auto", fontFamily: "monospace" }}>
              Zatím žádné zprávy. Napište první zprávu níže!
            </Text>
          ) : (
            messages.map((msg) => {
              const isMsgFromMe = msg.senderEmail.toLowerCase() === currentUserEmail.toLowerCase();
              return (
                <div key={msg.id} className={`chat-bubble ${isMsgFromMe ? "chat-bubble-me" : "chat-bubble-other"}`}>
                  <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                    {msg.text}
                  </Text>
                  <div className="chat-meta">
                    <span>{isMsgFromMe ? "Já" : interlocutorName}</span>
                    <span>
                      {new Date(msg.createdAt).toLocaleTimeString("cs-CZ", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input box */}
        <div className="bazaar-chat-input-area">
          <form onSubmit={handleSendMessage}>
            <Group gap="sm" wrap="nowrap" align="flex-end">
              <TextInput
                placeholder={`Napište zprávu pro ${interlocutorName}...`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                required
                style={{ flex: 1 }}
                classNames={{ input: "market-input" }}
                disabled={sending}
              />
              <Button type="submit" className="market-action-button" loading={sending} style={{ height: 36 }}>
                Poslat 🚀
              </Button>
            </Group>
          </form>
        </div>
      </div>
    </Stack>
  );
}
