"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@mantine/core";

interface ChatPersisterProps {
  email: string;
}

export function ChatPersister({ email }: ChatPersisterProps) {
  const router = useRouter();

  useEffect(() => {
    localStorage.setItem("bazaar_chat_email", email.trim().toLowerCase());
  }, [email]);

  const handleLogout = () => {
    localStorage.removeItem("bazaar_chat_email");
    router.push("/chat");
  };

  return (
    <Button variant="outline" className="market-delete-button" onClick={handleLogout}>
      Odhlásit se (změnit e-mail) 🚪
    </Button>
  );
}
