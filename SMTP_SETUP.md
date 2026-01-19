# SMTP Email Configuration

This document explains how to configure SMTP for order notification emails in NaifBleu.

## Overview

The application now sends automated emails for:
1. **Order Placed** - When payment is successful
2. **Order Fulfilled** - When warehouse marks order as sent for delivery (with tracking link)

## Order Status Flow

The application uses three order statuses:
- **placed**: Initial order creation
- **successful**: Payment completed successfully (triggers "Order Placed" email)
- **fulfilled**: Warehouse sent for delivery (triggers "Fulfilled" email with tracking link)

## Required Environment Variables

Add these variables to your `.env` file:

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=your-email@gmail.com
```

## SMTP Provider Setup

### Gmail (Recommended for Testing)

1. Enable 2-Step Verification on your Google Account
2. Go to [App Passwords](https://myaccount.google.com/apppasswords)
3. Generate a new app password for "Mail"
4. Use these settings:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-16-character-app-password
   ```

### SendGrid

1. Sign up at [SendGrid](https://sendgrid.com/)
2. Create an API key
3. Use these settings:
   ```
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=apikey
   SMTP_PASSWORD=your-sendgrid-api-key
   ```

### Mailgun

1. Sign up at [Mailgun](https://www.mailgun.com/)
2. Get your SMTP credentials
3. Use these settings:
   ```
   SMTP_HOST=smtp.mailgun.org
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-mailgun-smtp-username
   SMTP_PASSWORD=your-mailgun-smtp-password
   ```

### Amazon SES

1. Sign up for AWS SES
2. Verify your sending domain/email
3. Get SMTP credentials
4. Use these settings:
   ```
   SMTP_HOST=email-smtp.us-east-1.amazonaws.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-ses-smtp-username
   SMTP_PASSWORD=your-ses-smtp-password
   ```

## Email Templates

### Order Placed Email
- Sent when: Payment is successfully verified
- Contains:
  - Order ID
  - Customer name
  - Items ordered
  - Total amount
  - Shipping address

### Order Fulfilled Email
- Sent when: Warehouse clicks "Send for Delivery" and adds tracking link
- Contains:
  - Order ID
  - Customer name
  - Items ordered
  - Total amount
  - Shipping address
  - **Delivery tracking link**

## Warehouse Dashboard Usage

1. Navigate to `/dashboard/warehouse`
2. Find orders with status "placed" or "successful"
3. Click "Send for Delivery" button
4. Enter the delivery tracking link in the dialog
5. Click "Send for Delivery" to:
   - Update order status to "fulfilled"
   - Save the tracking link
   - Send email to customer with tracking link

## Testing

1. Create a test order through the checkout flow
2. Complete payment with Razorpay
3. Check that "Order Placed" email is received
4. Log in as warehouse staff
5. Mark the order for delivery with a tracking link
6. Check that "Order Fulfilled" email is received with the tracking link

## Troubleshooting

### Emails Not Sending

1. Check SMTP credentials in `.env`
2. Verify SMTP host and port are correct
3. Check server logs for error messages
4. Ensure firewall allows outbound connections on port 587

### Gmail-Specific Issues

- Make sure 2-Step Verification is enabled
- Use App Password, not your regular password
- Check "Less secure app access" if using regular password (not recommended)

### Email Going to Spam

- Configure SPF, DKIM, and DMARC records for your domain
- Use a dedicated email service provider
- Warm up your sending reputation gradually

## Production Recommendations

1. **Use a dedicated email service** (SendGrid, Mailgun, AWS SES)
2. **Set up proper DNS records** (SPF, DKIM, DMARC)
3. **Monitor email delivery** and bounce rates
4. **Implement email queue** for high volume
5. **Add retry logic** for failed sends
6. **Store email logs** for auditing

## Security Notes

- Never commit `.env` file with real credentials
- Use app-specific passwords for Gmail
- Rotate SMTP credentials regularly
- Use TLS/SSL for email transmission
- Store credentials securely in production

## Files Modified

- `/lib/email.ts` - Email service with SMTP configuration
- `/app/api/payment/route.ts` - Sends "Order Placed" email
- `/app/api/warehouse/orders/[id]/status/route.ts` - Sends "Fulfilled" email
- `/app/dashboard/warehouse/page.tsx` - Warehouse UI with tracking link dialog
- `/prisma/schema.prisma` - Added `delivery_link` field to Order model

## Status Tracking

Orders now show in customer portal with three statuses:
- **Placed**: Order created, awaiting payment
- **Successful**: Payment confirmed
- **Fulfilled**: Sent for delivery with tracking

Status progression is tracked in the OrderStatusLog table for audit purposes.

