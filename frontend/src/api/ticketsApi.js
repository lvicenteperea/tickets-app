const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function parseApiResponse(response) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return text ? { detail: text } : {};
}

export async function uploadTicket({ ticketFile, ticketNumber, amount }) {
  const formData = new FormData();
  formData.append("ticket_file", ticketFile);
  formData.append("ticket_number", ticketNumber);
  formData.append("amount", amount);

  const response = await fetch(`${API_URL}/tickets/upload`, {
    method: "POST",
    body: formData,
  });

  const data = await parseApiResponse(response);

  if (!response.ok) {
    const message =
      typeof data.detail === "string"
        ? data.detail
        : "No se pudo validar el ticket. Revisa los datos e intentalo de nuevo.";
    throw new Error(message);
  }

  return data;
}
