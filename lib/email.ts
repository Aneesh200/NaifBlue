import nodemailer from 'nodemailer';

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

interface OrderEmailData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  items: Array<{ name: string; quantity: number; price: number }>;
  shippingAddress: any;
  deliveryLink?: string;
}

export async function sendOrderPlacedEmail(data: OrderEmailData) {
  try {
    const itemsList = data.items
      .map(item => `  • ${item.name} x${item.quantity} - ₹${item.price.toFixed(2)}`)
      .join('\n');

    const address = data.shippingAddress;
    const fullAddress = [
      address.address_line1,
      address.address_line2,
      address.city,
      address.state,
      address.postal_code,
      address.country,
    ]
      .filter(Boolean)
      .join(', ');

    const mailOptions = {
      from: `"NaifBleu" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
      to: data.customerEmail,
      subject: `Order #${data.orderId} - Successfully Placed`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #000; color: #fff; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 20px; }
            .order-details { background-color: #fff; padding: 15px; margin: 15px 0; border-left: 4px solid #000; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .button { display: inline-block; padding: 10px 20px; background-color: #000; color: #fff; text-decoration: none; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Order Successfully Placed!</h1>
            </div>
            <div class="content">
              <p>Dear ${data.customerName},</p>
              <p>Thank you for your order! We've received your order and it's being processed.</p>
              
              <div class="order-details">
                <h3>Order Details</h3>
                <p><strong>Order ID:</strong> ${data.orderId}</p>
                <p><strong>Total Amount:</strong> ₹${data.totalAmount.toFixed(2)}</p>
                
                <h4>Items:</h4>
                <pre style="white-space: pre-wrap; font-family: Arial, sans-serif;">${itemsList}</pre>
                
                <h4>Shipping Address:</h4>
                <p>${fullAddress}</p>
              </div>
              
              <p>We'll send you another email once your order is ready for delivery.</p>
              <p>If you have any questions, please contact us at naifbleu9@gmail.com</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} NaifBleu. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Order Successfully Placed!

Dear ${data.customerName},

Thank you for your order! We've received your order and it's being processed.

Order Details:
Order ID: ${data.orderId}
Total Amount: ₹${data.totalAmount.toFixed(2)}

Items:
${itemsList}

Shipping Address:
${fullAddress}

We'll send you another email once your order is ready for delivery.

If you have any questions, please contact us at naifbleu9@gmail.com

© ${new Date().getFullYear()} NaifBleu. All rights reserved.
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Order placed email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending order placed email:', error);
    return { success: false, error };
  }
}

export async function sendOrderFulfilledEmail(data: OrderEmailData) {
  try {
    if (!data.deliveryLink) {
      throw new Error('Delivery link is required for fulfilled order email');
    }

    const itemsList = data.items
      .map(item => `  • ${item.name} x${item.quantity} - ₹${item.price.toFixed(2)}`)
      .join('\n');

    const address = data.shippingAddress;
    const fullAddress = [
      address.address_line1,
      address.address_line2,
      address.city,
      address.state,
      address.postal_code,
      address.country,
    ]
      .filter(Boolean)
      .join(', ');

    const mailOptions = {
      from: `"NaifBleu" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
      to: data.customerEmail,
      subject: `Order #${data.orderId} - Sent for Delivery`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #000; color: #fff; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 20px; }
            .order-details { background-color: #fff; padding: 15px; margin: 15px 0; border-left: 4px solid #000; }
            .delivery-link { background-color: #f0f0f0; padding: 15px; margin: 15px 0; text-align: center; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .button { display: inline-block; padding: 10px 20px; background-color: #000; color: #fff; text-decoration: none; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Your Order is on the Way!</h1>
            </div>
            <div class="content">
              <p>Dear ${data.customerName},</p>
              <p>Great news! Your order has been processed and is now on its way to you.</p>
              
              <div class="order-details">
                <h3>Order Details</h3>
                <p><strong>Order ID:</strong> ${data.orderId}</p>
                <p><strong>Total Amount:</strong> ₹${data.totalAmount.toFixed(2)}</p>
                
                <h4>Items:</h4>
                <pre style="white-space: pre-wrap; font-family: Arial, sans-serif;">${itemsList}</pre>
                
                <h4>Shipping Address:</h4>
                <p>${fullAddress}</p>
              </div>
              
              <div class="delivery-link">
                <h3>Track Your Order</h3>
                <p>You can track your order using the link below:</p>
                <a href="${data.deliveryLink}" class="button" style="color: #fff; text-decoration: none;">Track Order</a>
                <p style="margin-top: 10px; font-size: 12px; word-break: break-all;">${data.deliveryLink}</p>
              </div>
              
              <p>We hope you love your purchase! If you have any questions, please contact us at naifbleu9@gmail.com</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} NaifBleu. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Your Order is on the Way!

Dear ${data.customerName},

Great news! Your order has been processed and is now on its way to you.

Order Details:
Order ID: ${data.orderId}
Total Amount: ₹${data.totalAmount.toFixed(2)}

Items:
${itemsList}

Shipping Address:
${fullAddress}

Track Your Order:
${data.deliveryLink}

We hope you love your purchase! If you have any questions, please contact us at naifbleu9@gmail.com

© ${new Date().getFullYear()} NaifBleu. All rights reserved.
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Order fulfilled email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending order fulfilled email:', error);
    return { success: false, error };
  }
}

