from decimal import Decimal, InvalidOperation

from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status

from app.core.config import get_settings
from app.schemas.ticket import TicketValidationResult
from app.services.ticket_service import validate_ticket_mock

router = APIRouter(prefix="/tickets", tags=["tickets"])

ALLOWED_CONTENT_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
}


async def validate_upload_file(ticket_file: UploadFile | None) -> None:
    settings = get_settings()

    if ticket_file is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Selecciona un archivo del ticket.",
        )

    if ticket_file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El archivo debe ser JPG, PNG, WEBP o PDF.",
        )

    size = 0
    while chunk := await ticket_file.read(1024 * 1024):
        size += len(chunk)
        if size > settings.max_upload_size_bytes:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"El archivo no puede superar los {settings.max_upload_size_mb} MB.",
            )

    await ticket_file.seek(0)


def parse_amount(amount: str) -> Decimal:
    cleaned_amount = amount.strip()
    normalized_amount = (
        cleaned_amount.replace(".", "").replace(",", ".")
        if "," in cleaned_amount
        else cleaned_amount
    )

    try:
        parsed_amount = Decimal(normalized_amount)
    except (InvalidOperation, AttributeError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El importe no es valido.",
        ) from None

    if parsed_amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El importe debe ser mayor que cero.",
        )

    return parsed_amount


@router.post("/upload", response_model=TicketValidationResult)
async def upload_ticket(
    ticket_file: UploadFile | None = File(None),
    ticket_number: str = Form(""),
    amount: str = Form(""),
) -> TicketValidationResult:
    cleaned_ticket_number = ticket_number.strip()
    if not cleaned_ticket_number:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El numero de ticket es obligatorio.",
        )

    parsed_amount = parse_amount(amount)
    await validate_upload_file(ticket_file)

    result = validate_ticket_mock(cleaned_ticket_number, parsed_amount)

    if result.status == "used":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=result.message,
        )

    if result.status == "invalid":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=result.message,
        )

    return result
