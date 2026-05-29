"use client";

import { Button } from "@mantine/core";
import { useState } from "react";
import { deleteConversation } from "./actions";

interface DeleteChatButtonProps {
  advertId: number;
  buyerEmail: string;
}

export function DeleteChatButton({ advertId, buyerEmail }: DeleteChatButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Opravdu chcete smazat celý tento chat? Tato akce je nevratná.")) {
      return;
    }

    setLoading(true);
    try {
      await deleteConversation(advertId, buyerEmail);
    } catch (error) {
      console.error("Chyba při mazání chatu:", error);
      alert("Nepodařilo se smazat chat.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      size="xs"
      className="market-delete-button"
      style={{ paddingInline: "8px" }}
      onClick={handleDelete}
      loading={loading}
    >
      Smazat ❌
    </Button>
  );
}
