import { ColorSchemeScript, mantineHtmlProps } from "@mantine/core";
import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s | Blogic",
    default: "Blogic",
  },
};

interface Props {
  children: ReactNode;
}

export default async function RootLayout({ children }: Props) {
  const locale = await getLocale();

  return (
    <html lang={locale} {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
      </head>
      <body>{children}</body>
    </html>
  );
}
