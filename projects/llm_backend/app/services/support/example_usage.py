"""
Example usage of the EmailService (Gmail only)
"""

from .email_service import EmailService, send_support_email


def example_basic_usage():
    """Example of basic email sending"""
    
    # Method 1: Using the convenience function
    success = send_support_email(
        subject="Support Request",
        message="Hello, I need help with the application."
    )
    
    if success:
        print("Email sent successfully!")
    else:
        print("Failed to send email")


def example_with_service_class():
    """Example using EmailService class"""
    
    # Create email service (automatically uses Gmail)
    email_service = EmailService()
    
    # Send email
    success = email_service.send_support_email(
        subject="Bug Report",
        message="I found a bug in the system."
    )
    
    if success:
        print("Email sent successfully!")
    else:
        print("Failed to send email")


def example_with_custom_recipient():
    """Example with custom recipient email"""
    
    email_service = EmailService()
    
    success = email_service.send_email(
        subject="Feature Request",
        message="I would like to request a new feature.",
        recipient_email="custom@example.com"
    )
    
    return success


def example_with_environment_variables():
    """
    Example using environment variables for configuration.
    
    Set these environment variables in your .env file:
    - EMAIL_SENDER_EMAIL: your-email@gmail.com
    - EMAIL_SENDER_PASSWORD: your-app-password
    - SUPPORT_EMAIL_RECIPIENT: support@company.com
    """
    
    # The service will automatically use environment variables
    success = send_support_email(
        subject="General Inquiry",
        message="I have a general question about the service."
    )
    
    return success


if __name__ == "__main__":
    # These examples require proper email credentials to work
    print("Email service examples loaded.")
    print("Make sure you have set up your .env file with:")
    print("- EMAIL_SENDER_EMAIL")
    print("- EMAIL_SENDER_PASSWORD") 
    print("- SUPPORT_EMAIL_RECIPIENT")

