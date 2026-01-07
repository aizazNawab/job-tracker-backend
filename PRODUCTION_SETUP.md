# Production Setup Guide

## Email Service Setup (Required for Production)

### Step 1: Get a Domain
- Purchase a domain from GoDaddy, Namecheap, Google Domains, etc.
- Example: `yourcompany.com` or `jobtracker.com`

### Step 2: Verify Domain in Resend

1. **Go to Resend Dashboard:**
   - Visit: https://resend.com/domains
   - Click "Add Domain"
   - Enter your domain (e.g., `yourcompany.com`)

2. **Add DNS Records:**
   - Resend will provide DNS records to add
   - Go to your domain registrar's DNS settings
   - Add the provided records (usually SPF, DKIM, DMARC)
   - Wait for verification (5-30 minutes)

3. **Verify Domain:**
   - Once DNS records are added, Resend will verify automatically
   - You'll see "Verified" status in Resend dashboard

### Step 3: Configure Environment Variables

**On Render (Production):**
1. Go to your Render backend service
2. Click "Environment" tab
3. Add/Update these variables:

```
RESEND_API_KEY=re_GXp2Fagw_N1SWZZNYz8eztiPWnDkS8CEV
RESEND_FROM=noreply@yourcompany.com
```

Replace `yourcompany.com` with your actual verified domain.

**Local Development (.env file):**
```env
RESEND_API_KEY=re_GXp2Fagw_N1SWZZNYz8eztiPWnDkS8CEV
RESEND_FROM=noreply@yourcompany.com
```

### Step 4: Test Email Sending

1. Restart your server
2. Try registering a new account
3. Check if OTP email is received
4. Check Resend dashboard logs for any errors

## Alternative: SendGrid Setup

If you prefer SendGrid:

1. **Sign up:** https://sendgrid.com
2. **Create API Key:** Settings → API Keys → Create API Key
3. **Verify Sender:** Settings → Sender Authentication → Verify Single Sender
4. **Add to Render:**
   ```
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASS=your-sendgrid-api-key
   SMTP_FROM=noreply@yourcompany.com
   ```

## Important Notes

- **Never use Gmail/Yahoo for production** - They block automated emails
- **Always verify your domain** - Required for production
- **Test before going live** - Send test emails to verify everything works
- **Monitor email logs** - Check Resend/SendGrid dashboard regularly

## Troubleshooting

- **Emails not sending:** Check domain verification status
- **Emails in spam:** Verify SPF/DKIM records are correct
- **403 errors:** Domain not verified or wrong sender address
- **Connection timeout:** Check firewall/network settings

