from decimal import Decimal

from app.schemas.ticket import TicketValidationResult


def validate_ticket_mock(ticket_number: str, amount: Decimal) -> TicketValidationResult:
    normalized_ticket_number = ticket_number.strip().upper()

    if normalized_ticket_number == "USADO":
        return TicketValidationResult(
            status="used",
            message="El ticket ya fue usado.",
            ticket_number=ticket_number,
            amount=amount,
        )

    if normalized_ticket_number == "INVALIDO":
        return TicketValidationResult(
            status="invalid",
            message="El ticket no es valido.",
            ticket_number=ticket_number,
            amount=amount,
        )

    return TicketValidationResult(
        status="ok",
        message="Ticket validado correctamente.",
        ticket_number=ticket_number,
        amount=amount,
    )


def validate_ticket_db(ticket_number: str, amount: Decimal) -> TicketValidationResult:
    raise NotImplementedError("La validacion contra BBDD se implementara en una fase futura.")
