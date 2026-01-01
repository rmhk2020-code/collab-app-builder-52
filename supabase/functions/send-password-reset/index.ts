import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Store codes temporarily (in production, use Redis or database)
const resetCodes = new Map<string, { code: string; expires: number }>();

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
    console.log("Processing reset for email:", email);

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create Supabase admin client to check if user exists
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Check if user exists
    const { data: users, error: userError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (userError) {
      console.error("Error checking user:", userError);
      return new Response(
        JSON.stringify({ error: "Failed to verify user" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const userExists = users.users.some(u => u.email === email);
    
    if (!userExists) {
      console.log("User not found:", email);
      return new Response(
        JSON.stringify({ error: "No account found with this email address. Please sign up first." }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store the code
    resetCodes.set(email, { code, expires });
    console.log("Generated reset code for:", email);

    // Send email with code
    const emailResponse = await resend.emails.send({
      from: "Health Kinetics <onboarding@resend.dev>",
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

    return new Response(
      JSON.stringify({ success: true, code, message: "Reset code sent to your email" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-password-reset:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
