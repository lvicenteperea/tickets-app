from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict


class TicketValidationResult(BaseModel):
    model_config = ConfigDict(json_encoders={Decimal: float})

    status: Literal["ok", "used", "invalid"]
    message: str
    ticket_number: str
    amount: Decimal
