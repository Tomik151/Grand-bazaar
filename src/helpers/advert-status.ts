export function getAdvertStatusBadgeClassName(status: string) {
  const normalizedStatus = status
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

  if (normalizedStatus === "prodano") {
    return "market-status-badge market-status-badge-sold";
  }

  if (normalizedStatus === "rezervovano") {
    return "market-status-badge market-status-badge-reserved";
  }

  return "market-status-badge market-status-badge-available";
}
