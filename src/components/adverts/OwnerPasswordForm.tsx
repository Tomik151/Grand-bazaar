"use client";

import { Button, Card, Stack, Text, TextInput } from "@mantine/core";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authorizeAdvertPasswordAction } from "@/app/[locale]/inzeraty/[id]/upravit/edit-action"; // Import serverové akce

interface OwnerPasswordFormProps {
  advertId: number;
}

export function OwnerPasswordForm({ advertId }: OwnerPasswordFormProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Volání bezpečné serverové akce
      const result = await authorizeAdvertPasswordAction(advertId, password);
      if (!result.success) {
        setError(result.error || "Chyba při ověřování.");
        setLoading(false);
        return;
      }

      // Vše proběhlo v pořádku, server zapsal cookie, stačí obnovit stránku
      router.refresh();
    } catch {
      setError("Nastala neočekávaná chyba.");
      setLoading(false);
    }
  };

  return (
    <Card
      padding="md"
      withBorder
      style={{ border: "2px dashed var(--bazaar-ink)", background: "#fff8dc", borderRadius: 0 }}
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="xs">
          <Text size="sm" fw={700} style={{ fontFamily: "monospace" }}>
            🔑 Správa inzerátu (Prodejce)
          </Text>
          <Text size="xs" style={{ fontFamily: "monospace" }}>
            Tento inzerát je chráněn heslem. Pro úpravu nebo změnu stavu zadejte heslo zvolené při vytvoření:
          </Text>
          <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
            <TextInput
              placeholder="Heslo k inzerátu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              type="password"
              style={{ flexGrow: 1 }}
              classNames={{ input: "market-input" }}
              error={error}
              disabled={loading}
            />
            <Button type="submit" className="market-action-button" style={{ height: "40px" }} loading={loading}>
              Odemknout
            </Button>
          </div>
        </Stack>
      </form>
    </Card>
  );
}
