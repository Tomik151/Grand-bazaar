/**
 * Převede český formát bankovního účtu na mezinárodní formát IBAN.
 * Podporované formáty:
 * - 2000123456/0800
 * - 19-123456/0100
 * - CZ6408000000002000123456 (již hotový IBAN)
 */
export function convertCzechAccountToIban(accountStr: string): string | null {
  const cleaned = accountStr.replace(/\s+/g, "");

  // Pokud už je to platný český IBAN
  if (/^CZ\d{22}$/i.test(cleaned)) {
    return cleaned.toUpperCase();
  }

  // Regulární výraz pro český formát: [předčíslí-]číslo_účtu/kód_banky
  const match = cleaned.match(/^(?:(\d{1,6})-)?(\d{1,10})\/(\d{4})$/);
  if (!match) {
    return null;
  }

  const prefix = match[1] || "0";
  const accountNumber = match[2];
  const bankCode = match[3];

  const paddedPrefix = prefix.padStart(6, "0");
  const paddedNumber = accountNumber.padStart(10, "0");
  const bban = `${bankCode}${paddedPrefix}${paddedNumber}`;

  // Kód země CZ -> C=12, Z=35. Doplníme "00" na konec pro výpočet kontrolního součtu.
  const numericString = `${bban}123500`;

  try {
    const remainder = Number(BigInt(numericString) % 97n);
    const checkDigits = 98 - remainder;
    const paddedCheckDigits = String(checkDigits).padStart(2, "0");

    return `CZ${paddedCheckDigits}${bban}`;
  } catch {
    return null;
  }
}

/**
 * Validuje, zda je zadaný řetězec platným českým číslem účtu nebo platným IBANem.
 */
export function isValidCzechBankAccount(accountStr: string): boolean {
  return convertCzechAccountToIban(accountStr) !== null;
}
