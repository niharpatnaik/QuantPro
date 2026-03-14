import { Resend } from "resend";

let connectionSettings: any;

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? "repl " + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
    ? "depl " + process.env.WEB_REPL_RENEWAL
    : null;

  if (!xReplitToken) throw new Error("X-Replit-Token not found for repl/depl");

  connectionSettings = await fetch(
    "https://" + hostname + "/api/v2/connection?include_secrets=true&connector_names=resend",
    {
      headers: {
        Accept: "application/json",
        "X-Replit-Token": xReplitToken,
      },
    }
  )
    .then((res) => res.json())
    .then((data) => data.items?.[0]);

  if (!connectionSettings?.settings?.api_key) {
    throw new Error("Resend not connected");
  }
  return connectionSettings.settings.api_key as string;
}

// WARNING: Never cache this client — tokens expire.
async function getUncachableResendClient() {
  const apiKey = await getCredentials();
  return new Resend(apiKey);
}

const FROM = "QuantPro <hello@quantpro.us>";

export async function sendWelcomeEmail(to: string, firstName: string): Promise<void> {
  try {
    const resend = await getUncachableResendClient();
    const name = firstName || "there";

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to QuantPro</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Arial,sans-serif;color:#e5e7eb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="padding:0 0 32px 0;" align="center">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#22c55e;border-radius:10px;width:40px;height:40px;text-align:center;vertical-align:middle;">
                    <span style="color:#000;font-size:20px;font-weight:900;font-family:monospace;line-height:40px;display:block;">&gt;_</span>
                  </td>
                  <td style="padding-left:12px;">
                    <span style="font-size:24px;font-weight:800;color:#fff;letter-spacing:-0.5px;">QuantPro</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#111827;border:1px solid #1f2937;border-radius:16px;padding:48px 40px;">

              <!-- Greeting -->
              <p style="font-size:28px;font-weight:800;color:#fff;margin:0 0 8px 0;line-height:1.2;">
                Welcome aboard, ${name}! 🚀
              </p>
              <p style="font-size:16px;color:#9ca3af;margin:0 0 32px 0;line-height:1.6;">
                You've just joined a community of elite quantitative finance professionals. Your journey to mastering quant finance starts now.
              </p>

              <!-- Divider -->
              <hr style="border:none;border-top:1px solid #1f2937;margin:0 0 32px 0;" />

              <!-- Career section -->
              <p style="font-size:18px;font-weight:700;color:#22c55e;margin:0 0 12px 0;">
                The Career Edge You've Been Looking For
              </p>
              <p style="font-size:15px;color:#9ca3af;line-height:1.7;margin:0 0 24px 0;">
                QuantPro isn't just practice — it's your competitive advantage. The challenges you'll solve here mirror real problems faced at top hedge funds, prop trading firms, and asset managers. Every submission sharpens the skills that hiring managers at <strong style="color:#e5e7eb;">Two Sigma, Citadel, Jane Street, and Goldman Sachs</strong> are actively looking for.
              </p>
              <p style="font-size:15px;color:#9ca3af;line-height:1.7;margin:0 0 32px 0;">
                Candidates who practice structured quant problems consistently outperform in technical interviews. QuantPro gives you the reps, the feedback, and the confidence to walk into any interview room ready.
              </p>

              <!-- Free badge -->
              <table cellpadding="0" cellspacing="0" style="margin:0 0 32px 0;">
                <tr>
                  <td style="background:#052e16;border:1px solid #166534;border-radius:8px;padding:16px 20px;">
                    <p style="margin:0;font-size:15px;font-weight:700;color:#22c55e;">
                      🎁 100% Free — For a Limited Time
                    </p>
                    <p style="margin:8px 0 0 0;font-size:14px;color:#86efac;line-height:1.6;">
                      Full access to all 60 challenges across Beginner, Practitioner, and Expert levels is completely free right now. We're building fast and want your feedback as we grow. Lock in your spot before we introduce premium tiers.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Challenges section -->
              <p style="font-size:18px;font-weight:700;color:#fff;margin:0 0 12px 0;">
                60 Challenges Today. Many More Coming.
              </p>
              <p style="font-size:15px;color:#9ca3af;line-height:1.7;margin:0 0 24px 0;">
                We've launched with 60 carefully crafted challenges across five tracks — <strong style="color:#e5e7eb;">Alpha Generation, Risk Management, Execution, Portfolio Optimization, and Data Engineering</strong>. But 60 is just the beginning.
              </p>
              <p style="font-size:15px;color:#9ca3af;line-height:1.7;margin:0 0 32px 0;">
                Our team is actively working to expand the library with new challenges every week, including firm-specific problem sets, live market data challenges, and team competitions. You'll be the first to know when they drop.
              </p>

              <!-- Tracks -->
              <table cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 32px 0;">
                <tr>
                  <td width="48%" style="background:#0f172a;border:1px solid #1e3a5f;border-radius:8px;padding:14px 16px;vertical-align:top;">
                    <p style="margin:0 0 4px 0;font-size:13px;font-weight:700;color:#60a5fa;">📈 Alpha Generation</p>
                    <p style="margin:0;font-size:12px;color:#6b7280;">Momentum, signals, factor models</p>
                  </td>
                  <td width="4%"></td>
                  <td width="48%" style="background:#0f172a;border:1px solid #1e3a5f;border-radius:8px;padding:14px 16px;vertical-align:top;">
                    <p style="margin:0 0 4px 0;font-size:13px;font-weight:700;color:#a78bfa;">🛡️ Risk Management</p>
                    <p style="margin:0;font-size:12px;color:#6b7280;">VaR, Greeks, stress testing</p>
                  </td>
                </tr>
                <tr><td colspan="3" style="height:12px;"></td></tr>
                <tr>
                  <td width="48%" style="background:#0f172a;border:1px solid #1e3a5f;border-radius:8px;padding:14px 16px;vertical-align:top;">
                    <p style="margin:0 0 4px 0;font-size:13px;font-weight:700;color:#34d399;">⚡ Execution</p>
                    <p style="margin:0;font-size:12px;color:#6b7280;">TWAP, VWAP, market making</p>
                  </td>
                  <td width="4%"></td>
                  <td width="48%" style="background:#0f172a;border:1px solid #1e3a5f;border-radius:8px;padding:14px 16px;vertical-align:top;">
                    <p style="margin:0 0 4px 0;font-size:13px;font-weight:700;color:#fbbf24;">📊 Portfolio Optimization</p>
                    <p style="margin:0;font-size:12px;color:#6b7280;">Mean-variance, Sharpe, Kelly</p>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="https://quantpro.us/challenges" style="display:inline-block;background:#22c55e;color:#000;font-weight:800;font-size:16px;text-decoration:none;padding:16px 40px;border-radius:100px;letter-spacing:-0.3px;">
                      Start Your First Challenge →
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:32px 0 0 0;" align="center">
              <p style="font-size:13px;color:#4b5563;margin:0 0 12px 0;">
                Have thoughts or questions? We'd love to hear from you —<br />
                <a href="https://quantpro.us/challenges" style="color:#22c55e;text-decoration:none;font-weight:600;">share your feedback directly in QuantPro →</a>
              </p>
              <p style="font-size:12px;color:#374151;margin:0;">
                © 2026 QuantPro · <a href="https://quantpro.us" style="color:#4b5563;text-decoration:none;">quantpro.us</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    await resend.emails.send({
      from: FROM,
      to,
      subject: "Welcome to QuantPro — Your Quant Journey Starts Now 🚀",
      html,
    });

    console.log(`[email] Welcome email sent to ${to}`);
  } catch (err: any) {
    console.error(`[email] Failed to send welcome email to ${to}:`, err.message);
  }
}
