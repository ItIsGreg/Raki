#!/usr/bin/env python3
"""
Test script for the email service
Run this to test if your email service is working correctly
"""

import os
import sys
from pathlib import Path

# Add the app directory to Python path (now we're inside app/services/support)
app_dir = Path(__file__).parent.parent.parent
sys.path.insert(0, str(app_dir))

from services.support.email_service import EmailService, send_support_email


def test_email_service():
    """Test the email service with a simple message"""
    
    print("🧪 Testing Email Service...")
    print("=" * 50)
    
    # Check if environment variables are set
    sender_email = os.getenv("EMAIL_SENDER_EMAIL")
    sender_password = os.getenv("EMAIL_SENDER_PASSWORD")
    recipient_email = os.getenv("SUPPORT_EMAIL_RECIPIENT")
    
    print(f"📧 Sender Email: {'✅ Set' if sender_email else '❌ Not Set'}")
    print(f"🔑 Sender Password: {'✅ Set' if sender_password else '❌ Not Set'}")
    print(f"📬 Recipient Email: {'✅ Set' if recipient_email else '❌ Not Set'}")
    print()
    
    if not all([sender_email, sender_password, recipient_email]):
        print("❌ Missing environment variables!")
        print("Please set up your .env file with:")
        print("  EMAIL_SENDER_EMAIL=your-email@gmail.com")
        print("  EMAIL_SENDER_PASSWORD=your-app-password")
        print("  SUPPORT_EMAIL_RECIPIENT=support@company.com")
        return False
    
    # Test 1: Using the convenience function
    print("🔄 Test 1: Testing convenience function...")
    try:
        success = send_support_email(
            subject="🧪 Test Email - Internal Testing",
            message="This is a test email to verify the email service is working correctly.\n\nSent from the internal test script."
        )
        
        if success:
            print("✅ Test 1 PASSED: Email sent successfully!")
        else:
            print("❌ Test 1 FAILED: Email sending failed")
            return False
            
    except Exception as e:
        print(f"❌ Test 1 ERROR: {str(e)}")
        return False
    
    # Test 2: Using the EmailService class
    print("\n🔄 Test 2: Testing EmailService class...")
    try:
        email_service = EmailService()
        success = email_service.send_support_email(
            subject="🧪 Test Email 2 - Service Class",
            message="This is the second test email using the EmailService class.\n\nSent from the internal test script."
        )
        
        if success:
            print("✅ Test 2 PASSED: Email sent successfully!")
        else:
            print("❌ Test 2 FAILED: Email sending failed")
            return False
            
    except Exception as e:
        print(f"❌ Test 2 ERROR: {str(e)}")
        return False
    
    print("\n🎉 All tests passed! Email service is working correctly.")
    print("📧 Check your recipient email for the test messages.")
    return True


def test_with_custom_recipient():
    """Test sending to a custom recipient"""
    
    print("\n🔄 Test 3: Testing custom recipient...")
    
    # You can change this to test with a different email
    custom_recipient = input("Enter a custom recipient email (or press Enter to skip): ").strip()
    
    if not custom_recipient:
        print("⏭️ Skipping custom recipient test")
        return True
    
    try:
        email_service = EmailService()
        success = email_service.send_email(
            subject="🧪 Test Email - Custom Recipient",
            message="This is a test email sent to a custom recipient.\n\nSent from the internal test script.",
            recipient_email=custom_recipient
        )
        
        if success:
            print("✅ Test 3 PASSED: Email sent to custom recipient!")
        else:
            print("❌ Test 3 FAILED: Email sending failed")
            return False
            
    except Exception as e:
        print(f"❌ Test 3 ERROR: {str(e)}")
        return False
    
    return True


if __name__ == "__main__":
    print("🚀 Email Service Internal Testing")
    print("=" * 50)
    
    # Run basic tests
    if test_email_service():
        # Ask if user wants to test custom recipient
        test_with_custom_recipient()
    
    print("\n🏁 Testing completed!")
