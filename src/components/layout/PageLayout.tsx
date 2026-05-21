"use client";

import { AppShell, Button, Container, Group } from "@mantine/core";
import Image from "next/image";
import type { PropsWithChildren } from "react";
import { PageLogo } from "@/components/layout/PageLogo";
import { Link } from "@/i18n/navigation";

const HEADER_HEIGHT = 154;
const BODY_MAX_WIDTH = 1280;

const LEFT_DECORATIONS = [
  { src: "/decorations/pixel-cay.png", label: "Cay" },
  { src: "/decorations/pixel-nazar.png", label: "Nazar" },
  { src: "/decorations/pixel-baklava.png", label: "Baklava" },
];

const RIGHT_DECORATIONS = [
  { src: "/decorations/pixel-simit.png", label: "Simit" },
  { src: "/decorations/pixel-kebab.png", label: "Kebab" },
  { src: "/decorations/pixel-kilim.png", label: "Kilim" },
];

export function PageLayout({ children }: PropsWithChildren) {
  return (
    <AppShell header={{ height: HEADER_HEIGHT }} padding="md" withBorder={false} className="bazaar-shell">
      <AppShell.Header px="md" className="bazaar-header">
        <Container size={BODY_MAX_WIDTH} h="100%" className="bazaar-header-inner">
          <Group h="72px" align="center" justify="space-between" wrap="nowrap">
            <div className="bazaar-brand">
              <PageLogo />
            </div>

            <div className="bazaar-main-title">
              <span>Grand</span>
              <span>Bazaar</span>
            </div>

            <Group gap="xs" className="bazaar-nav">
              <Button component={Link} href="/" variant="subtle" className="bazaar-nav-button">
                Domu
              </Button>
              <Button component={Link} href="/inzeraty" variant="subtle" className="bazaar-nav-button">
                Trziste
              </Button>
              <Button component={Link} href="/inzeraty/novy" className="bazaar-nav-button bazaar-nav-button-primary">
                Pridat zbozi
              </Button>
            </Group>
          </Group>

          <div className="bazaar-ticker" aria-hidden="true">
            <span>
              *** GRAND PAZAR *** CAY HOT *** NAZAR ONLINE *** KILIM MODE *** PAZARLIK FRIENDLY *** BAKLAVA BONUS ***
              GRAND PAZAR *** CAY HOT *** NAZAR ONLINE *** KILIM MODE *** PAZARLIK FRIENDLY *** BAKLAVA BONUS ***
            </span>
          </div>

          <div className="bazaar-charms" aria-hidden="true">
            <span>CAY</span>
            <span>NAZAR</span>
            <span>KILIM</span>
            <span>BAKLAVA</span>
            <span>SIMIT</span>
            <span>KEBAB</span>
            <span>LOKUM</span>
            <span>PAZARLIK</span>
          </div>

          <Image
            src="/decorations/yellow-firework-a.gif"
            alt=""
            className="pixel-firework pixel-firework-left"
            width={64}
            height={64}
            unoptimized
          />
          <Image
            src="/decorations/yellow-firework-b.gif"
            alt=""
            className="pixel-firework pixel-firework-right"
            width={64}
            height={64}
            unoptimized
          />
        </Container>
      </AppShell.Header>

      <AppShell.Main className="bazaar-main">
        <Container size={BODY_MAX_WIDTH} px="md">
          {children}
        </Container>
      </AppShell.Main>

      <div className="bazaar-side-decor bazaar-side-decor-left" aria-hidden="true">
        {LEFT_DECORATIONS.map((item) => (
          <div className="bazaar-decor-token" key={item.label}>
            <Image src={item.src} alt="" width={32} height={32} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      <div className="bazaar-side-decor bazaar-side-decor-right" aria-hidden="true">
        {RIGHT_DECORATIONS.map((item) => (
          <div className="bazaar-decor-token" key={item.label}>
            <Image src={item.src} alt="" width={32} height={32} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      <Image src="/decorations/nyan-cat.gif" alt="" className="nyan-cat" width={122} height={56} unoptimized />
    </AppShell>
  );
}
