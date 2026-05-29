import { mantineHtmlProps } from "@mantine/core";
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
        <script data-mantine-script="true">
          {`try {
  var _colorScheme = window.localStorage.getItem("mantine-color-scheme-value");
  var colorScheme = _colorScheme === "light" || _colorScheme === "dark" || _colorScheme === "auto" ? _colorScheme : "light";
  var computedColorScheme = colorScheme !== "auto" ? colorScheme : window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  document.documentElement.setAttribute("data-mantine-color-scheme", computedColorScheme);
} catch (e) {}`}
        </script>
      </head>
      <body>{children}</body>
    </html>
  );
}
