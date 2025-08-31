import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
import os
from pathlib import Path

# Try to load .env file if python-dotenv is available
try:
    from dotenv import load_dotenv
    # Load .env file from project root
    project_root = Path(__file__).parent.parent.parent.parent
    env_path = project_root / ".env"
    if env_path.exists():
        load_dotenv(env_path)
except ImportError:
    # python-dotenv not installed, continue without it
    pass


class EmailService:
    """Service for sending emails via Gmail SMTP"""
    
    def __init__(self):
        """Initialize the email service with Gmail configuration"""
        self.smtp_server = "smtp.gmail.com"
        self.smtp_port = 587
        
    def send_email(
        self, 
        subject: str, 
        message: str,
        recipient_email: Optional[str] = None
    ) -> bool:
        """
        Send an email using Gmail SMTP
        
        Args:
            subject: Subject line of the email
            message: Body content of the email
            recipient_email: Email address of the recipient (if None, uses environment variable)
            
        Returns:
            bool: True if email sent successfully, False otherwise
        """
        try:
            # Get credentials from environment variables
            sender_email = os.getenv("EMAIL_SENDER_EMAIL")
            sender_password = os.getenv("EMAIL_SENDER_PASSWORD")
            
            if not sender_email:
                raise ValueError("EMAIL_SENDER_EMAIL environment variable not set")
            if not sender_password:
                raise ValueError("EMAIL_SENDER_PASSWORD environment variable not set")
            
            # Get recipient email from parameter or environment variable
            if recipient_email is None:
                recipient_email = os.getenv("SUPPORT_EMAIL_RECIPIENT")
                if not recipient_email:
                    raise ValueError("No recipient email specified and SUPPORT_EMAIL_RECIPIENT environment variable not set")
            
            # Create message
            msg = MIMEMultipart()
            msg['From'] = sender_email
            msg['To'] = recipient_email
            msg['Subject'] = subject
            
            # Add message body
            msg.attach(MIMEText(message, 'plain'))
            
            # Create SMTP session
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()  # Enable TLS
                server.login(sender_email, sender_password)
                
                # Send email
                text = msg.as_string()
                server.sendmail(sender_email, recipient_email, text)
                
            return True
            
        except Exception as e:
            print(f"Error sending email: {str(e)}")
            return False
    
    def send_support_email(
        self, 
        subject: str, 
        message: str
    ) -> bool:
        """
        Send a support email to the configured support email address
        
        Args:
            subject: Subject line of the email
            message: Body content of the email
            
        Returns:
            bool: True if email sent successfully, False otherwise
        """
        return self.send_email(subject, message)


# Convenience function for quick email sending
def send_support_email(subject: str, message: str) -> bool:
    """
    Quick function to send a support email
    
    Args:
        subject: Subject line of the email
        message: Body content of the email
        
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    email_service = EmailService()
    return email_service.send_support_email(subject, message)
