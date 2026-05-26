"use client";
import { Button, Group, Stack, Text } from "@mantine/core";
import Image from "next/image";
import { useState } from "react";

interface ImageCarouselProps {
  images: string[];
  alt: string;
}
export function ImageCarousel({ images, alt }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (images.length === 0) return null;

  return (
    <Stack gap="sm">
      {/* Hlavní velký obrázek */}
      <Image
        src={images[currentIndex]}
        alt={`${alt} - obrázek ${currentIndex + 1}`}
        width={520}
        height={360}
        priority={currentIndex === 0}
        style={{ width: "100%", height: "auto", maxHeight: "400px", objectFit: "contain" }}
        className="market-detail-image"
      />
      {/* Ovládací šipky - zobrazí se pouze, pokud je fotek více než jedna */}
      {images.length > 1 && (
        <Stack gap="xs">
          <Group justify="space-between" align="center">
            <Button
              variant="subtle"
              className="market-card-button"
              onClick={() => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
            >
              ◀ Předchozí
            </Button>
            <Text fw={700} style={{ fontFamily: "monospace" }}>
              {currentIndex + 1} / {images.length}
            </Text>
            <Button
              variant="subtle"
              className="market-card-button"
              onClick={() => setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
            >
              Další ▶
            </Button>
          </Group>
          {/* Malé miniatury (Thumbnails) pod obrázkem */}
          <Group gap="xs" justify="center">
            {images.map((img, idx) => (
              <Image
                key={img}
                src={img}
                alt=""
                width={56}
                height={56}
                onClick={() => setCurrentIndex(idx)}
                style={{
                  cursor: "pointer",
                  border: currentIndex === idx ? "3px solid var(--bazaar-red)" : "2px solid var(--bazaar-ink)",
                  opacity: currentIndex === idx ? 1 : 0.6,
                  objectFit: "cover",
                  imageRendering: "auto",
                }}
              />
            ))}
          </Group>
        </Stack>
      )}
    </Stack>
  );
}
