# Razorpay Integration Setup Guide

This guide will help you set up Razorpay payment gateway integration for your NaifBleu e-commerce application.

## Prerequisites

1. A Razorpay account (Sign up at [https://razorpay.com](https://razorpay.com))
2. Access to your Razorpay Dashboard

## Step 1: Get Your Razorpay API Keys

1. **Login to Razorpay Dashboard**
   - Go to [https://dashboard.razorpay.com](https://dashboard.razorpay.com)
   - Login with your credentials

2. **Navigate to API Keys**
   - Go to Settings → API Keys
   - Or directly visit: [https://dashboard.razorpay.com/app/keys](https://dashboard.razorpay.com/app/keys)

3. **Generate API Keys**
   - Click on "Generate Test Keys" for testing (or "Generate Live Keys" for production)
   - You'll get:
     - **Key ID** (starts with `rzp_test_` for test mode or `rzp_live_` for live mode)
     - **Key Secret** (keep this confidential)

## Step 2: Configure Environment Variables

Create or update your `.env` or `.env.local` file in the root of your project:

```bash
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID_HERE
RAZORPAY_KEY_SECRET=YOUR_KEY_SECRET_HERE
```

### Example:
```bash
# Test Mode (for development)
RAZORPAY_KEY_ID=rzp_test_1234567890abcd
RAZORPAY_KEY_SECRET=AbCdEfGhIjKlMnOpQrStUvWxYz123456

# Live Mode (for production)
# RAZORPAY_KEY_ID=rzp_live_1234567890abcd
# RAZORPAY_KEY_SECRET=AbCdEfGhIjKlMnOpQrStUvWxYz123456
```

⚠️ **Important Security Notes:**
- **Never commit** your `.env` file to version control
- Keep your **Key Secret** confidential
- Use test keys during development
- Switch to live keys only in production

## Step 3: Test the Integration

### Test Mode
In test mode, you can use these test card details:

**Test Card Numbers:**
- **Success:** 4111 1111 1111 1111
- **Failure:** 4111 1111 1111 1112

**Test Card Details:**
- Any future expiry date (e.g., 12/25)
- Any CVV (e.g., 123)
- Any cardholder name

### UPI Test IDs:
- **Success:** success@razorpay
- **Failure:** failure@razorpay

### Netbanking:
- Select any bank and it will show a success/failure page in test mode

## Step 4: Webhook Configuration (Optional but Recommended)

Webhooks allow Razorpay to notify your application about payment events.

1. **Go to Webhooks Section**
   - Navigate to Settings → Webhooks
   - Or visit: [https://dashboard.razorpay.com/app/webhooks](https://dashboard.razorpay.com/app/webhooks)

2. **Create a Webhook**
   - Click "Add New Webhook"
   - Enter your webhook URL: `https://yourdomain.com/api/payment/webhook`
   - Select events to listen to:
     - `payment.authorized`
     - `payment.failed`
     - `payment.captured`
     - `order.paid`
   - Copy the webhook secret

3. **Add Webhook Secret to Environment Variables**
```bash
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
```

## Step 5: Enable Payment Methods

1. Go to Settings → Payment Methods
2. Enable the payment methods you want to support:
   - Cards (Credit/Debit)
   - UPI
   - Netbanking
   - Wallets
   - EMI
   - etc.

## Step 6: Configure Payment Capture

By default, payments are auto-captured. You can configure this in:
- Settings → Payment Capture

**Options:**
- **Automatic:** Payment is captured immediately after authorization (default)
- **Manual:** You need to manually capture the payment within 5 days

## Step 7: Go Live Checklist

Before switching to live mode:

1. ✅ Complete KYC verification in Razorpay Dashboard
2. ✅ Add bank account details for settlements
3. ✅ Test all payment flows thoroughly in test mode
4. ✅ Set up webhooks
5. ✅ Review and configure payment methods
6. ✅ Update environment variables with live keys
7. ✅ Enable HTTPS on your domain
8. ✅ Review Razorpay's terms and conditions

## Payment Flow

1. **User adds items to cart** → Proceeds to checkout
2. **User fills shipping details** → Clicks "Proceed to Payment"
3. **Order is created** in database with `pending` status
4. **Razorpay order is created** via API
5. **Razorpay Checkout modal opens** → User completes payment
6. **Payment verification** happens on backend
7. **Order status updated** to `processing` on successful payment
8. **User redirected** to success page

## API Endpoints

### Create Razorpay Order
- **Endpoint:** `POST /api/payment`
- **Purpose:** Creates a Razorpay order
- **Request Body:**
```json
{
  "amount": 1000,
  "order_id": "uuid-of-order",
  "currency": "INR"
}
```

### Verify Payment
- **Endpoint:** `PUT /api/payment`
- **Purpose:** Verifies payment signature
- **Request Body:**
```json
{
  "razorpay_payment_id": "pay_xxx",
  "razorpay_order_id": "order_xxx",
  "razorpay_signature": "signature_xxx",
  "order_id": "uuid-of-order"
}
```

### Record Payment Failure
- **Endpoint:** `PATCH /api/payment`
- **Purpose:** Records when payment fails or is cancelled
- **Request Body:**
```json
{
  "order_id": "uuid-of-order",
  "error_description": "Payment cancelled by user"
}
```

## Troubleshooting

### Common Issues:

1. **"Payment system is loading..."**
   - Ensure Razorpay script is loaded
   - Check browser console for errors
   - Verify internet connection

2. **"Failed to create payment"**
   - Verify API keys are correct
   - Check that order exists in database
   - Review server logs

3. **"Payment verification failed"**
   - Ensure webhook secret is correct
   - Check signature validation logic
   - Verify order_id matches

4. **Payment succeeds but order status not updated**
   - Check webhook configuration
   - Verify database connection
   - Review server logs for errors

## Testing Checklist

- [ ] Payment with test card success
- [ ] Payment with test card failure
- [ ] UPI payment
- [ ] Payment cancellation
- [ ] Order status updates correctly
- [ ] Success page displays payment details
- [ ] Email notifications (if configured)
- [ ] Webhook handling (if configured)

## Support

### Razorpay Support:
- **Email:** support@razorpay.com
- **Phone:** +91-80-6190-9787
- **Documentation:** [https://razorpay.com/docs](https://razorpay.com/docs)
- **API Reference:** [https://razorpay.com/docs/api](https://razorpay.com/docs/api)

### Application Support:
- Check the server logs for detailed error messages
- Review the browser console for client-side errors
- Ensure all environment variables are set correctly

## Security Best Practices

1. **Never expose your Key Secret**
   - Keep it in environment variables
   - Don't commit to version control
   - Don't send to frontend

2. **Always verify payment signatures**
   - Don't trust client-side payment status
   - Always verify on backend
   - Use webhook for additional verification

3. **Use HTTPS in production**
   - Razorpay requires HTTPS for live mode
   - Protects sensitive payment data

4. **Implement rate limiting**
   - Prevent API abuse
   - Add request throttling

5. **Log all transactions**
   - Keep audit trail
   - Monitor for suspicious activity

## Additional Resources

- [Razorpay Checkout Documentation](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/)
- [Payment Verification](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/verify-payment-signature/)
- [Test Cards and Credentials](https://razorpay.com/docs/payments/payments/test-card-details/)
- [Webhooks Guide](https://razorpay.com/docs/webhooks/)

---

**Last Updated:** January 7, 2026

