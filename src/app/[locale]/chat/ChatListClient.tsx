"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Stack, Text, TextInput } from "@mantine/core";

export function ChatListClient() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedEmail = localStorage.getItem("bazaar_chat_email");
    if (storedEmail) {
      router.push(`/chat?email=${encodeURIComponent(storedEmail)}`);
    } else {
      setLoading(false);
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return;

    localStorage.setItem("bazaar_chat_email", cleanEmail);
    router.push(`/chat?email=${encodeURIComponent(cleanEmail)}`);
  };

  if (loading) {
    return (
      <Card padding="xl" withBorder className="market-card" style={{ textAlign: "center" }}>
        <Text fw={700} className="market-title">
          Načítání zpráv... 🏺
        </Text>
      </Card>
    );
  }

  return (
    <Card padding="xl" withBorder className="bazaar-search-card" style={{ maxWidth: 500, margin: "0 auto" }}>
      <div className="bazaar-search-header">
        <span className="bazaar-search-icon">✉️</span>
        <Text fw={700} className="bazaar-search-title">
          Moje Zprávy
        </Text>
        <Text className="bazaar-search-subtitle">
          Zadejte svůj e-mail pro zobrazení rozhovorů s prodejci a kupujícími.
        </Text>
      </div>

      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <TextInput
            label="Váš e-mail"
            placeholder="např. petr@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            type="email"
            classNames={{ input: "market-input", label: "market-input-label" }}
          />

          <Button type="submit" className="market-action-button" fullWidth style={{ height: 44 }}>
            Vstoupit do bazaru 🚪
          </Button>
        </Stack>
      </form>
    </Card>
  );
}
