import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AuthEmailPayload {
  user: {
    email: string;
    user_metadata?: {
      name?: string;
      full_name?: string;
    };
  };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type: string;
    site_url: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: AuthEmailPayload = await req.json();
    const { user, email_data } = payload;

    console.log("Auth email request:", email_data.email_action_type, "for", user.email);

    const userName = user.user_metadata?.name || user.user_metadata?.full_name || "there";
    const { token_hash, redirect_to, email_action_type, site_url } = email_data;

    // Build the verification/action URL
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || site_url;
    const actionUrl = `${supabaseUrl}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`;

    let subject = "";
    let htmlContent = "";

    switch (email_action_type) {
      case "signup":
      case "email":
        subject = "Confirm your Health Kinetics account";
        htmlContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
              <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                <div style="background-color: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <h1 style="color: #2563eb; font-size: 28px; margin: 0 0 20px 0; text-align: center;">
                    Confirm Your Email 📧
                  </h1>
                  
                  <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
                    Hey ${userName},
                  </p>
                  
                  <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                    Thanks for signing up for Health Kinetics! Please confirm your email address by clicking the button below.
                  </p>
                  
                  <div style="text-align: center; margin: 32px 0;">
                    <a href="${actionUrl}" 
                       style="display: inline-block; background-color: #2563eb; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      Confirm Email Address
                    </a>
                  </div>
                  
                  <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0; text-align: center;">
                    If you didn't create an account, you can safely ignore this email.
                  </p>
                  
                  <p style="color: #9ca3af; font-size: 12px; line-height: 1.6; margin: 16px 0 0 0; text-align: center;">
                    This link expires in 24 hours.
                  </p>
                </div>
                
                <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 24px;">
                  © 2026 Health Kinetics. Your partner in health and fitness.
                </p>
              </div>
            </body>
          </html>
        `;
        break;

      case "recovery":
      case "reset_password":
        subject = "Reset your Health Kinetics password";
        htmlContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
              <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                <div style="background-color: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <h1 style="color: #2563eb; font-size: 28px; margin: 0 0 20px 0; text-align: center;">
                    Reset Your Password 🔐
                  </h1>
                  
                  <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
                    Hey ${userName},
                  </p>
                  
                  <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                    We received a request to reset your password. Click the button below to choose a new password.
                  </p>
                  
                  <div style="text-align: center; margin: 32px 0;">
                    <a href="${actionUrl}" 
                       style="display: inline-block; background-color: #2563eb; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      Reset Password
                    </a>
                  </div>
                  
                  <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0; text-align: center;">
                    If you didn't request a password reset, you can safely ignore this email.
                  </p>
                  
                  <p style="color: #9ca3af; font-size: 12px; line-height: 1.6; margin: 16px 0 0 0; text-align: center;">
                    This link expires in 1 hour.
                  </p>
                </div>
                
                <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 24px;">
                  © 2026 Health Kinetics. Your partner in health and fitness.
                </p>
              </div>
            </body>
          </html>
        `;
        break;

      case "magiclink":
        subject = "Your Health Kinetics login link";
        htmlContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
              <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                <div style="background-color: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <h1 style="color: #2563eb; font-size: 28px; margin: 0 0 20px 0; text-align: center;">
                    Your Login Link ✨
                  </h1>
                  
                  <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
                    Hey ${userName},
                  </p>
                  
                  <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                    Click the button below to log in to your Health Kinetics account.
                  </p>
                  
                  <div style="text-align: center; margin: 32px 0;">
                    <a href="${actionUrl}" 
                       style="display: inline-block; background-color: #2563eb; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      Log In to Health Kinetics
                    </a>
                  </div>
                  
                  <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0; text-align: center;">
                    If you didn't request this link, you can safely ignore this email.
                  </p>
                  
                  <p style="color: #9ca3af; font-size: 12px; line-height: 1.6; margin: 16px 0 0 0; text-align: center;">
                    This link expires in 1 hour.
                  </p>
                </div>
                
                <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 24px;">
                  © 2026 Health Kinetics. Your partner in health and fitness.
                </p>
              </div>
            </body>
          </html>
        `;
        break;

      case "email_change":
        subject = "Confirm your new email address";
        htmlContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
              <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                <div style="background-color: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <h1 style="color: #2563eb; font-size: 28px; margin: 0 0 20px 0; text-align: center;">
                    Confirm Email Change 📧
                  </h1>
                  
                  <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
                    Hey ${userName},
                  </p>
                  
                  <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                    Please confirm your new email address by clicking the button below.
                  </p>
                  
                  <div style="text-align: center; margin: 32px 0;">
                    <a href="${actionUrl}" 
                       style="display: inline-block; background-color: #2563eb; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      Confirm New Email
                    </a>
                  </div>
                  
                  <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0; text-align: center;">
                    If you didn't request this change, please contact support immediately.
                  </p>
                </div>
                
                <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 24px;">
                  © 2026 Health Kinetics. Your partner in health and fitness.
                </p>
              </div>
            </body>
          </html>
        `;
        break;

      default:
        subject = "Health Kinetics - Action Required";
        htmlContent = `
          <!DOCTYPE html>
          <html>
            <body style="margin: 0; padding: 20px; font-family: sans-serif;">
              <p>Click the link below to complete your action:</p>
              <a href="${actionUrl}">Complete Action</a>
            </body>
          </html>
        `;
    }

    const emailResponse = await resend.emails.send({
      from: "Health Kinetics <noreply@healthkinetics.app>",
      to: [user.email],
      subject,
      html: htmlContent,
    });

    console.log("Auth email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending auth email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
