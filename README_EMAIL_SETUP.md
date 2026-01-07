# Email Service Setup Guide

## For Production Use

### Option 1: SendGrid (Recommended for Production)

1. Sign up at https://sendgrid.com
2. Create an API Key
3. Add to Render environment variables:
   ```
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASS=your-sendgrid-api-key
   SMTP_FROM=noreply@yourdomain.com
   SMTP_SECURE=false
   ```

### Option 2: AWS SES (Amazon)

1. Set up AWS SES
2. Get SMTP credentials
3. Add to Render environment variables:
   ```
   SMTP_HOST=email-smtp.region.amazonaws.com
   SMTP_PORT=587
   SMTP_USER=your-smtp-username
   SMTP_PASS=your-smtp-password
   SMTP_FROM=noreply@yourdomain.com
   SMTP_SECURE=false
   ```

### Option 3: Mailgun

1. Sign up at https://mailgun.com
2. Get SMTP credentials
3. Add to Render environment variables:
   ```
   SMTP_HOST=smtp.mailgun.org
   SMTP_PORT=587
   SMTP_USER=your-mailgun-username
   SMTP_PASS=your-mailgun-password
   SMTP_FROM=noreply@yourdomain.com
   SMTP_SECURE=false
   ```

### Option 4: Gmail (Not Recommended for Production)

Gmail has strict limits and may block connections from cloud services.

If you must use Gmail:
1. Enable 2-Step Verification
2. Generate App Password
3. Add to Render environment variables:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   SMTP_FROM=your-email@gmail.com
   SMTP_SECURE=false
   ```

## Testing Email Service

After setting up, test by:
1. Trying to register a new account
2. Check if OTP email is received
3. Check Render logs for email sending status

## Troubleshooting

- **Connection Timeout**: Check firewall settings, use professional email service
- **Authentication Failed**: Verify SMTP credentials
- **Email Not Received**: Check spam folder, verify SMTP_FROM address

