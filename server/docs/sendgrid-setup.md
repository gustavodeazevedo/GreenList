# SendGrid Email Integration for GreenList

## Overview

This document explains how to set up and configure SendGrid for email delivery in the GreenList application, particularly for password reset functionality.

## Why SendGrid?

SendGrid provides a reliable, scalable email delivery service that offers:

- Higher deliverability rates than standard SMTP
- Detailed analytics and tracking
- API-based integration
- Free tier with 100 emails/day
- No need for less secure app passwords (as required by Gmail)

## Setup Instructions

### 1. Create a SendGrid Account

1. Go to [SendGrid's website](https://sendgrid.com/) and sign up for a free account
2. Verify your account and complete the onboarding process

### 2. Create an API Key

1. In your SendGrid dashboard, navigate to Settings > API Keys
2. Click "Create API Key"
3. Name your key (e.g., "GreenList Password Reset")
4. Select "Restricted Access" and ensure the key has at least "Mail Send" permissions
5. Copy the generated API key (you won't be able to see it again)

### 3. Verify a Sender Identity

1. Navigate to Settings > Sender Authentication
2. Choose either "Single Sender Verification" or "Domain Authentication" (domain is recommended for production)
3. Follow the steps to verify your email or domain

### 4. Configure Environment Variables

Add the following variables to your `.env` file:

```
SENDGRID_API_KEY=your_sendgrid_api_key
EMAIL_FROM=your_verified_sender_email
```

For production environments (like Render), add these same environment variables in your hosting platform's environment configuration.

## Testing the Integration

To test if your SendGrid integration is working:

1. Start your application
2. Use the "Forgot Password" feature with a valid email address
3. Check the email inbox for the reset link
4. Verify that you can successfully reset your password

## Troubleshooting

### Common Issues

1. **Emails not being delivered**:

   - Check if your sender email is verified
   - Verify the API key has "Mail Send" permissions
   - Check application logs for specific error messages

2. **API Key errors**:

   - Ensure the API key is correctly copied to the environment variable
   - Check if the API key is still active in SendGrid dashboard

3. **Rate limiting**:
   - Free tier has limits (100 emails/day)
   - Check SendGrid dashboard for usage statistics

### Logging

The application logs SendGrid errors to the console. Check these logs for detailed error information if emails are not being sent.

## Production Considerations

1. **Security**:

   - Never commit your API key to version control
   - Rotate API keys periodically
   - Use environment variables for all sensitive information

2. **Scaling**:

   - Monitor your email sending volume
   - Upgrade your SendGrid plan if needed

3. **Monitoring**:
   - Set up alerts for failed email deliveries
   - Regularly check SendGrid dashboard for delivery statistics

## Additional Resources

- [SendGrid API Documentation](https://docs.sendgrid.com/api-reference/how-to-use-the-sendgrid-v3-api)
- [SendGrid Node.js Library](https://github.com/sendgrid/sendgrid-nodejs)
- [Email Template Best Practices](https://sendgrid.com/blog/email-design-best-practices/)
