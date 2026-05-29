"use client";

import { Button } from "@mantine/core";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ChatPersisterProps {
  email: string;
}

export function ChatPersister({ email }: ChatPersisterProps) {
  const router = useRouter();

  useEffect(() => {
    const cleanEmail = email.trim().toLowerCase();
    localStorage.setItem("bazaar_chat_email", cleanEmail);
    // biome-ignore lint/suspicious/noDocumentCookie: needed for server actions
    document.cookie = `bazaar_chat_email=${encodeURIComponent(cleanEmail)}; path=/; max-age=31536000; SameSite=Lax`;
  }, [email]);

  const handleLogout = () => {
    localStorage.removeItem("bazaar_chat_email");
    // biome-ignore lint/suspicious/noDocumentCookie: needed for server actions
    document.cookie = "bazaar_chat_email=; path=/; max-age=0";
    router.push("/chat");
  };

  return (
    <Button variant="outline" className="market-delete-button" onClick={handleLogout}>
      Odhlásit se (změnit e-mail) 🚪
    </Button>
  );
}
