"use client";

import { Checkbox, Group, TextInput } from "@mantine/core";
import { useState } from "react";

export function AdvertPriceInput() {
  const [isFree, setIsFree] = useState(false);
  const [price, setPrice] = useState("0");

  return (
    <Group align="end" gap="lg">
      <TextInput
        name="cena"
        label="Cena"
        type="number"
        min={0}
        value={isFree ? "0" : price}
        onChange={(event) => setPrice(event.currentTarget.value)}
        disabled={isFree}
        rightSection="Kc"
        w={400}
        classNames={{ input: "market-input", label: "market-input-label" }}
      />
      <Checkbox
        name="zdarma"
        label="Nabidka je zdarma"
        checked={isFree}
        onChange={(event) => setIsFree(event.currentTarget.checked)}
        mb={10}
      />
    </Group>
  );
}
