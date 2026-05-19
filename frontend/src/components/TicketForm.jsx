import { useEffect, useMemo, useState } from "react";
import { FileText, Image, Loader2, Send, UploadCloud } from "lucide-react";
import { uploadTicket } from "../api/ticketsApi.js";
import { extractTicketData } from "../ocr/extractTicketData.js";
import { canRunOcr, readTicketText } from "../ocr/ocrService.js";
import StatusMessage from "./StatusMessage.jsx";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

function formatFileSize(bytes) {
  if (!bytes) {
    return "0 KB";
  }

  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function getFileValidationError(file) {
  if (!file) {
    return "Selecciona un archivo del ticket.";
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return "El archivo debe ser JPG, PNG, WEBP o PDF.";
  }

  if (file.size > MAX_FILE_SIZE) {
    return "El archivo no puede superar los 5 MB.";
  }

  return "";
}

function normalizeAmountInput(value) {
  const trimmedValue = value.trim();

  return trimmedValue.includes(",")
    ? trimmedValue.replace(/\./g, "").replace(",", ".")
    : trimmedValue;
}

export default function TicketForm() {
  const [ticketFile, setTicketFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [ticketNumber, setTicketNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("info");
  const [apiResponse, setApiResponse] = useState(null);
  const [isReadingOcr, setIsReadingOcr] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileError = useMemo(() => getFileValidationError(ticketFile), [ticketFile]);
  const isImage = ticketFile?.type?.startsWith("image/");

  useEffect(() => {
    if (!ticketFile || !isImage) {
      setPreviewUrl("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(ticketFile);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [ticketFile, isImage]);

  async function handleFileChange(event) {
    const file = event.target.files?.[0] || null;
    setTicketFile(file);
    setApiResponse(null);

    const validationError = getFileValidationError(file);
    if (validationError) {
      setStatusType("error");
      setStatusMessage(validationError);
      return;
    }

    if (!canRunOcr(file)) {
      setStatusType("info");
      setStatusMessage(
        "El OCR inicial solo procesa imagenes. Puedes introducir los datos del PDF manualmente.",
      );
      return;
    }

    setIsReadingOcr(true);
    setStatusType("info");
    setStatusMessage("Leyendo ticket con OCR...");

    try {
      const text = await readTicketText(file);
      const extracted = extractTicketData(text);

      if (extracted.ticketNumber) {
        setTicketNumber(extracted.ticketNumber);
      }

      if (extracted.amount) {
        setAmount(extracted.amount);
      }

      if (extracted.ticketNumber && extracted.amount) {
        setStatusType("success");
        setStatusMessage("Datos detectados. Revisalos antes de enviar.");
      } else {
        setStatusType("warning");
        setStatusMessage(
          "No se pudieron detectar todos los datos. Puedes introducirlos manualmente.",
        );
      }
    } catch (error) {
      setStatusType("warning");
      setStatusMessage(
        "No se pudo leer el ticket con OCR. Introduce los datos manualmente.",
      );
    } finally {
      setIsReadingOcr(false);
    }
  }

  function validateForm() {
    const validationError = getFileValidationError(ticketFile);
    if (validationError) {
      return validationError;
    }

    if (!ticketNumber.trim()) {
      return "El numero de ticket es obligatorio.";
    }

    const parsedAmount = Number.parseFloat(normalizeAmountInput(amount));
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return "El importe debe ser un numero mayor que cero.";
    }

    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setApiResponse(null);

    const validationError = validateForm();
    if (validationError) {
      setStatusType("error");
      setStatusMessage(validationError);
      return;
    }

    setIsSubmitting(true);
    setStatusType("info");
    setStatusMessage("Enviando ticket...");

    try {
      const response = await uploadTicket({
        ticketFile,
        ticketNumber: ticketNumber.trim(),
        amount: normalizeAmountInput(amount),
      });

      setApiResponse(response);
      setStatusType("success");
      setStatusMessage(response.message || "Ticket validado correctamente.");
    } catch (error) {
      setStatusType("error");
      setStatusMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const isBusy = isReadingOcr || isSubmitting;

  return (
    <section className="form-shell" aria-label="Formulario de validacion">
      <form className="ticket-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="upload-panel">
            <label className="upload-box" htmlFor="ticket-file">
              <UploadCloud aria-hidden="true" size={32} />
              <span>Seleccionar ticket</span>
              <small>JPG, PNG, WEBP o PDF. Maximo 5 MB.</small>
            </label>
            <input
              id="ticket-file"
              name="ticket-file"
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
              onChange={handleFileChange}
            />

            {ticketFile && (
              <div className="file-summary">
                {isImage ? (
                  <Image aria-hidden="true" size={20} />
                ) : (
                  <FileText aria-hidden="true" size={20} />
                )}
                <div>
                  <strong>{ticketFile.name}</strong>
                  <span>{formatFileSize(ticketFile.size)}</span>
                </div>
              </div>
            )}

            <div className="preview-panel">
              {previewUrl ? (
                <img src={previewUrl} alt="Vista previa del ticket" />
              ) : (
                <p>
                  {ticketFile
                    ? "Vista previa no disponible para este archivo."
                    : "La vista previa aparecera aqui si subes una imagen."}
                </p>
              )}
            </div>
          </div>

          <div className="fields-panel">
            <div className="field-group">
              <label htmlFor="ticket-number">Numero de ticket</label>
              <input
                id="ticket-number"
                type="text"
                value={ticketNumber}
                onChange={(event) => setTicketNumber(event.target.value)}
                placeholder="Ej. ABC12345"
                autoComplete="off"
              />
            </div>

            <div className="field-group">
              <label htmlFor="amount">Importe</label>
              <div className="amount-input">
                <input
                  id="amount"
                  type="text"
                  inputMode="decimal"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="Ej. 24,90"
                  autoComplete="off"
                />
                <span>EUR</span>
              </div>
            </div>

            <button
              className="submit-button"
              type="submit"
              disabled={isBusy || Boolean(fileError)}
            >
              {isBusy ? (
                <Loader2 className="spin" aria-hidden="true" size={18} />
              ) : (
                <Send aria-hidden="true" size={18} />
              )}
              {isSubmitting ? "Enviando..." : "Enviar ticket"}
            </button>

            <StatusMessage message={statusMessage} type={statusType} />

            {apiResponse && (
              <div className="api-response" aria-label="Respuesta de la API">
                <strong>Respuesta de la API</strong>
                <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>
      </form>
    </section>
  );
}
