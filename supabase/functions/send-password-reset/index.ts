import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ResetRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Password reset request received");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: ResetRequest = await req.json();
    console.log("Processing reset request");

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Check if user exists (but don't reveal this to the client)
    const { data: users, error: userError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (userError) {
      console.error("Error checking user:", userError);
      // Return generic success message to prevent enumeration
      return new Response(
        JSON.stringify({ success: true, message: "If an account exists with this email, a reset code has been sent." }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const userExists = users.users.some(u => u.email === email);
    
    // SECURITY: Always return the same response whether user exists or not
    // This prevents account enumeration attacks
    if (!userExists) {
      console.log("User not found, returning generic message");
      return new Response(
        JSON.stringify({ success: true, message: "If an account exists with this email, a reset code has been sent." }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

    // Store the code in database for persistence across function restarts
    // First, delete any existing codes for this email
    await supabaseAdmin
      .from('password_reset_codes')
      .delete()
      .eq('email', email);

    // Insert new code
    const { error: insertError } = await supabaseAdmin
      .from('password_reset_codes')
      .insert({
        email,
        code,
        expires_at: expiresAt
      });

    if (insertError) {
      console.error("Error storing reset code:", insertError);
      return new Response(
        JSON.stringify({ success: true, message: "If an account exists with this email, a reset code has been sent." }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Generated reset code for user");

    // Send email with code
    const emailResponse = await resend.emails.send({
      from: "Health Kinetics <noreply@healthkinetics.app>",
      to: [email],
      subject: "Password Reset Code - Health Kinetics",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb; margin: 0; padding: 20px; }
              .container { max-width: 480px; margin: 0 auto; background: white; border-radius: 12px; padding: 32px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
              .logo { text-align: center; margin-bottom: 24px; }
              .code { font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 24px 0; color: #2563eb; }
              .text { color: #6b7280; font-size: 14px; line-height: 1.6; }
              .footer { margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 12px; text-align: center; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="logo">
                <h1 style="color: #2563eb; margin: 0;">Health Kinetics</h1>
              </div>
              <h2 style="color: #111827; margin-bottom: 16px;">Password Reset Request</h2>
              <p class="text">You requested to reset your password. Use the code below to complete the process:</p>
              <div class="code">${code}</div>
              <p class="text">This code will expire in 10 minutes.</p>
              <p class="text">If you didn't request this, please ignore this email.</p>
              <div class="footer">
                <p>© 2026 Health Kinetics. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    // SECURITY: Do not return the code in the response - only send via email
    return new Response(
      JSON.stringify({ success: true, message: "If an account exists with this email, a reset code has been sent." }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-password-reset:", error);
    // Return generic message even on error to prevent enumeration
    return new Response(
      JSON.stringify({ success: true, message: "If an account exists with this email, a reset code has been sent." }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
