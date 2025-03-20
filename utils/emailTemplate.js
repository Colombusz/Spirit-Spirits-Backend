
export const VERIFICATION_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Verify Your Email</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello,</p>
    <p>Thank you for signing up! Your verification code is:</p>
    <div style="text-align: center; margin: 30px 0;">
      <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4CAF50;">{verificationCode}</span>
    </div>
    <p>Enter this code on the verification page to complete your registration.</p>
    <p>This code will expire in 15 minutes for security reasons.</p>
    <p>If you didn't create an account with us, please ignore this email.</p>
    <p>Best regards,<br>Spirit & Spirits</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`;

export const ORDER_DETAILS_TEMPLATE = (order) => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Order Details</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        border: 1px solid #ddd;
        border-radius: 8px;
        background: #f9f9f9;
      }
      .header {
        text-align: center;
        margin-bottom: 20px;
      }
      .order-details, .figurine-details {
        margin-bottom: 20px;
      }
      .order-details h2, .figurine-details h3 {
        color: #333;
      }
      .figurine {
        margin: 10px 0;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 8px;
        background: #fff;
      }
      .figurine img {
        max-width: 100px;
        display: block;
        margin-bottom: 10px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Your Order Details</h1>
        <p>Thank you <strong> ${order.username || "User"} </strong> for shopping with us! Here are your order details:</p>
      </div>
      <div class="order-details">
        <h2>Order Summary</h2>
        <p><strong>Order ID:</strong> ${order?._id || "N/A"}</p>
        <p><strong>Shipping Address:</strong> ${order?.shippingAddress || "N/A"}</p>
        <p><strong>Payment Method:</strong> ${order?.paymentMethod || "N/A"}</p>
        <p><strong>Shipping Price:</strong> $${order?.shippingPrice || 0}</p>
        <p><strong>Total Price:</strong> $${order?.totalPrice || 0}</p>
        <p><strong>Status:</strong> ${order?.status || "N/A"}</p>
        <p><strong>Order Date:</strong> ${
          order?.createdAt ? new Date(order.createdAt).toLocaleString() : "N/A"
        }</p>
      </div>
      <div class="figurine-details">
        <h3>Items in Your Order</h3>
        ${
          order?.orderItems?.length
            ? order.orderItems
                .map(
                  (item) => `
          <div class="figurine">
            <p><strong>Figurine:</strong> ${
              item?.figurineDetails?.name || "N/A"
            }</p>
            <p><strong>Description:</strong> ${
              item?.figurineDetails?.description || "N/A"
            }</p>
            <p><strong>Price:</strong> $${item?.figurineDetails?.price || 0}</p>
            <p><strong>Quantity:</strong> ${item?.qty || 0}</p>
            ${
              item?.figurineDetails?.images?.[0]?.url
                ? `<img src="${item.figurineDetails.images[0].url}" alt="${
                    item.figurineDetails.name || "Figurine Image"
                  }" />`
                : ""
            }
          </div>`
                )
                .join("")
            : "<p>No items in this order.</p>"
        }
      </div>
    </div>
  </body>
</html>
`;
















export const PASSWORD_RESET_SUCCESS_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Successful</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Password Reset Successful</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello,</p>
    <p>We're writing to confirm that your password has been successfully reset.</p>
    <div style="text-align: center; margin: 30px 0;">
      <div style="background-color: #4CAF50; color: white; width: 50px; height: 50px; line-height: 50px; border-radius: 50%; display: inline-block; font-size: 30px;">
        ✓
      </div>
    </div>
    <p>If you did not initiate this password reset, please contact our support team immediately.</p>
    <p>For security reasons, we recommend that you:</p>
    <ul>
      <li>Use a strong, unique password</li>
      <li>Enable two-factor authentication if available</li>
      <li>Avoid using the same password across multiple sites</li>
    </ul>
    <p>Thank you for helping us keep your account secure.</p>
    <p>Best regards,<br>Spirit & Spirits</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`;

export const PASSWORD_RESET_REQUEST_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Password Reset</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello,</p>
    <p>We received a request to reset your password. If you didn't make this request, please ignore this email.</p>
    <p>To reset your password, click the button below:</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="{resetURL}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
    </div>
    <p>This link will expire in 1 hour for security reasons.</p>
    <p>Best regards,<br>Your App Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`;


export const WELCOME_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Welcome to Spirit & Spirits Liquors</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
      }
      .container {
        max-width: 600px;
        margin: 50px auto;
        background-color: #ffffff;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        overflow: hidden;
      }
      .header {
        background-color: #4caf50;
        color: white;
        text-align: center;
        padding: 20px;
        font-size: 24px;
      }
      .content {
        padding: 30px;
        text-align: center;
      }
      .content h2 {
        margin-top: 0;
      }
      .content p {
        font-size: 16px;
        color: #555;
        line-height: 1.6;
      }
      .btn {
        display: inline-block;
        margin-top: 20px;
        padding: 15px 30px;
        background-color: #4caf50;
        color: white;
        text-decoration: none;
        font-size: 18px;
        border-radius: 5px;
        transition: background-color 0.3s;
      }
      .btn:hover {
        background-color: #45a049;
      }
      .footer {
        text-align: center;
        padding: 15px;
        background-color: #eee;
        font-size: 14px;
        color: #777;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        Welcome to Spirit & Spirits, {name}!
      </div>
      <div class="content">
        <h2>We are excited to have you on board!</h2>
        <p>
          Explore a wide range of high-quality figurines to meet all your needs. 
          Start browsing now and take advantage of our latest offers!
        </p>
        <a href="{href}" class="btn">Click to Go to Home Page</a>
      </div>
      <div class="footer">
        &copy; 2024 Spirit & Spirits. All rights reserved.
      </div>
    </div>
  </body>
</html>
`;