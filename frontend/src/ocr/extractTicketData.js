const TICKET_PATTERNS = [
  /(?:n[.\sºo]*\s*)?(?:ticket|recibo|factura|referencia|ref)[\s:#-]*([A-Z0-9][A-Z0-9/-]{2,})/i,
  /(?:operacion|transaccion)[\s:#-]*([A-Z0-9][A-Z0-9/-]{2,})/i,
];

const AMOUNT_PATTERNS = [
  /(?:total|importe|a\s*pagar|pagado)[\s:=-]*([0-9]+(?:[.,][0-9]{1,2})?)/i,
  /([0-9]+(?:[.,][0-9]{1,2})?)\s*(?:eur|euro|euros|\u20ac)/i,
];

function normalizeAmount(value) {
  if (!value) {
    return "";
  }

  const normalized = value.replace(/\./g, "").replace(",", ".");
  const parsed = Number.parseFloat(normalized);

  if (!Number.isFinite(parsed)) {
    return "";
  }

  return parsed.toFixed(2);
}

function findFirstMatch(text, patterns) {
  for (const pattern of patterns) {
    const match = text.match(pattern);

    if (match?.[1]) {
      return match[1].trim();
    }
  }

  return "";
}

export function extractTicketData(text) {
  const normalizedText = text.replace(/\s+/g, " ").trim();

  return {
    ticketNumber: findFirstMatch(normalizedText, TICKET_PATTERNS),
    amount: normalizeAmount(findFirstMatch(normalizedText, AMOUNT_PATTERNS)),
  };
}
