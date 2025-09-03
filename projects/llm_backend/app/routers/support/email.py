from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.support import send_support_email

router = APIRouter(prefix="/email", tags=["email"])


class EmailRequest(BaseModel):
    subject: str
    message: str


class EmailResponse(BaseModel):
    success: bool
    message: str


@router.post("/send", response_model=EmailResponse)
async def send_support_email_endpoint(email_request: EmailRequest):
    """
    Send a support email to the configured support email address
    
    - **subject**: Subject line of the email
    - **message**: Body content of the email
    """
    try:
        success = send_support_email(
            subject=email_request.subject,
            message=email_request.message
        )
        
        if success:
            return EmailResponse(
                success=True,
                message="Email sent successfully to support team"
            )
        else:
            raise HTTPException(
                status_code=500,
                detail="Failed to send email"
            )
            
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error sending email: {str(e)}"
        )


@router.get("/health", response_model=dict)
async def email_health_check():
    """
    Health check endpoint for email service
    """
    return {
        "status": "healthy",
        "service": "email",
        "available": True
    }
