# Email Service

This module provides email sending functionality for the LLM backend application using Gmail SMTP, specifically designed for sending support emails.

## Features

- Send emails via Gmail SMTP with TLS support
- Automatic credential loading from environment variables
- Simple API with minimal configuration
- Error handling and logging

## Quick Start

### Basic Usage

```python
from app.services.support import send_support_email

# Send a support email
success = send_support_email(
    subject="Support Request",
    message="Hello, I need help with the application."
)

if success:
    print("Email sent successfully!")
else:
    print("Failed to send email")
```

### Using EmailService Class

```python
from app.services.support import EmailService

# Create email service (automatically uses Gmail)
email_service = EmailService()

# Send email
success = email_service.send_support_email(
    subject="Bug Report",
    message="I found a bug in the system."
)
```

## Configuration

### Secure Storage Methods

**⚠️ IMPORTANT: Never commit email passwords to version control!**

#### Method 1: Environment Variables (Recommended)

**For Development:**
1. Copy `env_template.txt` content to a new file named `.env`
2. Fill in your actual credentials
3. The `.env` file is already in `.gitignore`

**For Production:**
Set system environment variables in your deployment environment.

### Environment Variables

Set these environment variables in your `.env` file:

```bash
# Sender credentials
EMAIL_SENDER_EMAIL=your-email@gmail.com
EMAIL_SENDER_PASSWORD=your-app-password

# Support email recipient (where support emails will be sent)
SUPPORT_EMAIL_RECIPIENT=support@company.com
```

## Gmail Setup

To use Gmail, you'll need to:

1. Enable 2-factor authentication on your Google account
2. Generate an "App Password" (not your regular password)
3. Use the app password in the `EMAIL_SENDER_PASSWORD` environment variable

## Security Notes

- Never hardcode email passwords in your code
- Use environment variables or secure configuration management
- The service uses TLS encryption by default
- Credentials are automatically loaded from `.env` file

## Error Handling

The service returns `True` on success and `False` on failure. Errors are logged to the console. For production use, consider implementing proper logging.

## Example Use Cases

- Support ticket submissions
- Bug reports
- Feature requests
- System notifications
- User feedback collection

## Dependencies

- Python standard library (`smtplib`, `email`)
- Optional: `python-dotenv` for `.env` file support

## Testing

To test the email service:

1. Set up your email credentials in `.env` file
2. Run the example usage file
3. Check your recipient email for the test message

```python
from app.services.support.example_usage import example_basic_usage

example_basic_usage()
```
