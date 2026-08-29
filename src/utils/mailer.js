const requiredEmailEnv = ['BREVO_API_KEY', 'EMAIL_FROM', 'EMAIL_TO'];
const missingEmailEnv = requiredEmailEnv.filter((key) => !process.env[key]);

console.log('Brevo API key present:', Boolean(process.env.BREVO_API_KEY));

if (missingEmailEnv.length > 0) {
  console.warn('Email config missing:', missingEmailEnv.join(', '));
}

const escapeHtml = (value) => String(value || '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

async function notifyOwner(contact) {
  const apiKey = process.env.BREVO_API_KEY;
  const fromEmail = process.env.EMAIL_FROM;
  const ownerEmail = process.env.EMAIL_TO;

  if (!apiKey || !fromEmail || !ownerEmail) {
    console.error('Missing required email env variables (BREVO_API_KEY, EMAIL_FROM, EMAIL_TO)');
    return false;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);
  const safeName = escapeHtml(contact.name);
  const safeEmail = escapeHtml(contact.email);
  const safeMessage = escapeHtml(contact.message).replace(/\n/g, '<br>');

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        sender: { name: 'Portfolio Contact Form', email: fromEmail },
        to: [{ email: ownerEmail }],
        replyTo: { email: contact.email, name: contact.name },
        subject: `New Portfolio Contact: ${safeName}`,
        textContent: `Name: ${contact.name}\nEmail: ${contact.email}\n\nMessage:\n${contact.message}`,
        htmlContent: `<h2>New Portfolio Contact Message</h2><p><strong>Name:</strong> ${safeName}</p><p><strong>Email:</strong> ${safeEmail}</p><h3>Message:</h3><p>${safeMessage}</p>`,
      }),
    });

    const responseData = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error('Brevo HTTP API error:', response.status, JSON.stringify(responseData));
      return false;
    }

    console.log('Brevo email accepted:', responseData.messageId || 'accepted');
    return true;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('Brevo HTTP request timed out after 15 seconds');
    } else {
      console.error('Brevo HTTP request failed:', error.message || error);
    }
    return false;
  } finally {
    clearTimeout(timeoutId);
  }
}

module.exports = { notifyOwner };
