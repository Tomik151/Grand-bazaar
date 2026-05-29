"use client";

import { Button, Card, Stack, Text, Textarea, TextInput } from "@mantine/core";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { sendChatMessage } from "../actions";

interface StartChatClientProps {
  advertId: number;
  advertTitle: string;
  sellerEmail: string;
}

export function StartChatClient({ advertId, advertTitle }: StartChatClientProps) {
  const router = useRouter();
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedEmail = localStorage.getItem("bazaar_chat_email");
    const storedName = localStorage.getItem("bazaar_chat_name");
    if (storedEmail) setBuyerEmail(storedEmail);
    if (storedName) setBuyerName(storedName);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    const cleanEmail = buyerEmail.trim().toLowerCase();
    const cleanName = buyerName.trim();
    const cleanMessage = message.trim();

    if (!cleanEmail || !cleanName || !cleanMessage) {
      setLoading(false);
      return;
    }

    try {
      // Uložíme jméno a e-mail do localStorage pro příště
      localStorage.setItem("bazaar_chat_email", cleanEmail);
      localStorage.setItem("bazaar_chat_name", cleanName);
      // biome-ignore lint/suspicious/noDocumentCookie: needed for server actions
      document.cookie = `bazaar_chat_email=${encodeURIComponent(cleanEmail)}; path=/; max-age=31536000; SameSite=Lax`;

      const formData = new FormData();
      formData.append("advertId", String(advertId));
      formData.append("buyerEmail", cleanEmail);
      formData.append("buyerName", cleanName);
      formData.append("senderEmail", cleanEmail);
      formData.append("text", cleanMessage);

      await sendChatMessage(formData);

      // Přesměrujeme do vytvořeného chatu
      router.push(`/chat/${advertId}?buyerEmail=${encodeURIComponent(cleanEmail)}`);
    } catch (err) {
      console.error("Chyba při odesílání zprávy:", err);
      alert("Nepodařilo se poslat zprávu. Zkontrolujte prosím připojení.");
      setLoading(false);
    }
  };

  return (
    <Card padding="xl" withBorder className="bazaar-search-card" style={{ maxWidth: 600, margin: "0 auto" }}>
      <div className="bazaar-search-header">
        <span className="bazaar-search-icon">🏺</span>
        <Text fw={700} className="bazaar-search-title">
          Zpráva prodejci
        </Text>
        <Text className="bazaar-search-subtitle">
          Chcete smlouvat o ceně nebo domluvit předání zboží <strong>{advertTitle}</strong>?
        </Text>
      </div>

      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <TextInput
            label="Vaše jméno"
            placeholder="např. Jan Novák"
            value={buyerName}
            onChange={(e) => setBuyerName(e.target.value)}
            required
            classNames={{ input: "market-input", label: "market-input-label" }}
          />

          <TextInput
            label="Váš e-mail"
            placeholder="např. jan.novak@example.com"
            value={buyerEmail}
            onChange={(e) => setBuyerEmail(e.target.value)}
            required
            type="email"
            classNames={{ input: "market-input", label: "market-input-label" }}
          />

          <Textarea
            label="Zpráva pro prodejce"
            placeholder="Ahoj, mám velký zájem o toto zboží. Je ještě k dispozici?"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={4}
            classNames={{ input: "market-input", label: "market-input-label" }}
          />

          <Button type="submit" className="market-action-button" fullWidth loading={loading} style={{ height: 44 }}>
            Odeslat první zprávu ✉️
          </Button>
        </Stack>
      </form>
    </Card>
  );
}
