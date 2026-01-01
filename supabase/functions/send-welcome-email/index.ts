import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  name?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name }: WelcomeEmailRequest = await req.json();

    if (!email) {
      throw new Error("Email is required");
    }

    console.log("Sending welcome email to:", email);

    const displayName = name || "there";

    const emailResponse = await resend.emails.send({
      from: "Health Kinetics <noreply@healthkinetics.app>",
      to: [email],
      subject: "Welcome to Health Kinetics! 🎉",
      html: `
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
                  Welcome to Health Kinetics! 💪
                </h1>
                
                <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
                  Hey ${displayName},
                </p>
                
                <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
                  Thank you for signing up! We're thrilled to have you join our community of health-conscious individuals on their journey to a healthier lifestyle.
                </p>
                
                <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                  Here's what you can do with Health Kinetics:
                </p>
                
                <ul style="color: #374151; font-size: 16px; line-height: 1.8; margin: 0 0 24px 0; padding-left: 24px;">
                  <li><strong style="color: #10b981;">Personalized Fitness Plans</strong> - AI-powered workouts tailored to your goals</li>
                  <li><strong style="color: #10b981;">Smart Food Analysis</strong> - Scan your meals for instant nutrition info</li>
                  <li><strong style="color: #10b981;">Progress Tracking</strong> - Monitor your journey with visual charts</li>
                  <li><strong style="color: #10b981;">Health Insights</strong> - Get recommendations based on your profile</li>
                </ul>
                
                <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                  Ready to start your fitness journey? Log in and complete your personalized onboarding to get your custom fitness plan!
                </p>
                
                <div style="text-align: center; margin: 32px 0;">
                  <a href="https://healthkinetics.app/auth" 
                     style="display: inline-block; background-color: #2563eb; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                    Get Started
                  </a>
                </div>
                
                <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0; text-align: center;">
                  Questions? Just reply to this email - we're here to help!
                </p>
              </div>
              
              <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 24px;">
                © 2026 Health Kinetics. Your partner in health and fitness.
              </p>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Welcome email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending welcome email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
