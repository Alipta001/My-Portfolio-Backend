// src/services/emailService.js

const requiredEmailEnv = [
  "BREVO_API_KEY",
  "EMAIL_FROM",
  "EMAIL_TO",
];

const missingEmailEnv = requiredEmailEnv.filter(
  (key) => !process.env[key]
);

console.log(
  "Brevo API key present:",
  Boolean(process.env.BREVO_API_KEY)
);

if (missingEmailEnv.length > 0) {
  console.warn(
    "⚠️ Email config missing:",
    missingEmailEnv.join(", ")
  );
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function notifyOwner(contact) {
  const apiKey = process.env.BREVO_API_KEY?.trim();
  const fromEmail = process.env.EMAIL_FROM?.trim();
  const ownerEmail = process.env.EMAIL_TO?.trim();

  // ==========================================
  // ENV VALIDATION
  // ==========================================

  if (!apiKey || !fromEmail || !ownerEmail) {
    console.error(
      "❌ Missing required email environment variables"
    );

    console.error({
      BREVO_API_KEY: Boolean(apiKey),
      EMAIL_FROM: Boolean(fromEmail),
      EMAIL_TO: Boolean(ownerEmail),
    });

    return {
      success: false,
      error: "Missing email configuration",
    };
  }

  // ==========================================
  // SAFE HTML
  // ==========================================

  const safeName = escapeHtml(contact.name);

  const safeEmail = escapeHtml(contact.email);

  const safeMessage = escapeHtml(
    contact.message
  ).replace(/\n/g, "<br>");

  // ==========================================
  // TIMEOUT
  // ==========================================

  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 15000);

  try {
    console.log(
      "📧 Sending email using Brevo HTTP API..."
    );

    // ==========================================
    // BREVO REQUEST
    // ==========================================

    const response = await fetch(
      "https://api.brevo.com/v3/smtp/email",
      {
        method: "POST",

        signal: controller.signal,

        headers: {
          accept: "application/json",

          "Content-Type": "application/json",

          "api-key": apiKey,
        },

        body: JSON.stringify({
          sender: {
            name: "Alipta Portfolio",
            email: fromEmail,
          },

          to: [
            {
              name: "Alipta",
              email: ownerEmail,
            },
          ],

          replyTo: {
            name: contact.name,
            email: contact.email,
          },

          subject: `New Portfolio Contact: ${contact.name}`,

          textContent: `
New Portfolio Contact Message

Name: ${contact.name}

Email: ${contact.email}

Message:
${contact.message}
          `,

          htmlContent: `
<!DOCTYPE html>

<html>

<body>

  <h2>📩 New Portfolio Contact Message</h2>

  <p>
    <strong>Name:</strong>
    ${safeName}
  </p>

  <p>
    <strong>Email:</strong>
    ${safeEmail}
  </p>

  <hr />

  <h3>Message</h3>

  <p>
    ${safeMessage}
  </p>

</body>

</html>
          `,
        }),
      }
    );

    // ==========================================
    // RESPONSE
    // ==========================================

    const responseText = await response.text();

    let responseData = {};

    try {
      responseData = responseText
        ? JSON.parse(responseText)
        : {};
    } catch {
      responseData = {
        raw: responseText,
      };
    }

    console.log(
      "📧 Brevo response status:",
      response.status
    );

    console.log(
      "📧 Brevo response:",
      JSON.stringify(responseData)
    );

    // ==========================================
    // BREVO ERROR
    // ==========================================

    if (!response.ok) {
      console.error(
        "❌ Brevo rejected the email request"
      );

      return {
        success: false,
        status: response.status,
        error: responseData,
      };
    }

    // ==========================================
    // SUCCESS
    // ==========================================

    console.log(
      "✅ Brevo accepted the email"
    );

    console.log(
      "📨 Message ID:",
      responseData.messageId
    );

    return {
      success: true,
      messageId: responseData.messageId,
    };

  } catch (error) {

    if (error.name === "AbortError") {
      console.error(
        "❌ Brevo API request timed out after 15 seconds"
      );

      return {
        success: false,
        error: "Request timed out",
      };
    }

    console.error(
      "❌ Brevo API request failed:",
      error.message
    );

    return {
      success: false,
      error: error.message,
    };

  } finally {

    clearTimeout(timeoutId);

  }
}

module.exports = {
  notifyOwner,
};