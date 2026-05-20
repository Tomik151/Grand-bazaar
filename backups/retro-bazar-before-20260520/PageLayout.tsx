"use client";

import { AppShell, Button, Container, Group } from "@mantine/core";
import type { PropsWithChildren } from "react";
import { PageLogo } from "@/components/layout/PageLogo";
import { Link } from "@/i18n/navigation";

const HEADER_HEIGHT = 90;
const BODY_MAX_WIDTH = 1280;

export function PageLayout({ children }: PropsWithChildren) {
  return (
    <AppShell header={{ height: HEADER_HEIGHT }} padding="md" withBorder={false}>
      <AppShell.Header px="md">
        <Container size={BODY_MAX_WIDTH} h="100%">
          <Group h="100%" align="center" justify="space-between">
            <PageLogo />
            <Button component={Link} href="/inzeraty" variant="subtle">
              Inzeraty
            </Button>
            <Button component={Link} href="/" variant="subtle">
              Domu
            </Button>
            <Button disabled>Vytvorit inzerat</Button>
          </Group>
        </Container>
      </AppShell.Header>

      <AppShell.Main>
        <Container size={BODY_MAX_WIDTH} px="md">
          {children}
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
