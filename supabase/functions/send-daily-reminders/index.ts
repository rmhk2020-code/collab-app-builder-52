import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting daily reminder job...");

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Get all users with their profiles
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from("user_profiles")
      .select("user_id, weekly_exercise_goal, monthly_exercise_goal, exercises_completed_this_week, exercises_completed_this_month, fitness_plan");

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      throw profilesError;
    }

    console.log(`Found ${profiles?.length || 0} user profiles`);

    if (!profiles || profiles.length === 0) {
      return new Response(JSON.stringify({ message: "No users to notify" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    let emailsSent = 0;
    let emailsFailed = 0;

    for (const profile of profiles) {
      try {
        // Get user email from auth
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(profile.user_id);

        if (userError || !userData?.user?.email) {
          console.error(`Could not get email for user ${profile.user_id}:`, userError);
          emailsFailed++;
          continue;
        }

        const email = userData.user.email;
        const weeklyGoal = profile.weekly_exercise_goal || 5;
        const monthlyGoal = profile.monthly_exercise_goal || 20;
        const weeklyCompleted = profile.exercises_completed_this_week || 0;
        const monthlyCompleted = profile.exercises_completed_this_month || 0;
        const weeklyRemaining = Math.max(0, weeklyGoal - weeklyCompleted);
        const monthlyRemaining = Math.max(0, monthlyGoal - monthlyCompleted);
        const weeklyProgress = Math.min(100, Math.round((weeklyCompleted / weeklyGoal) * 100));
        const monthlyProgress = Math.min(100, Math.round((monthlyCompleted / monthlyGoal) * 100));

        // Get fitness goal from plan
        const fitnessGoal = profile.fitness_plan?.goal || "staying fit and healthy";

        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
              .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #2563EB, #10B981); padding: 30px; text-align: center; }
              .header h1 { color: white; margin: 0; font-size: 28px; }
              .header p { color: rgba(255,255,255,0.9); margin: 10px 0 0; }
              .content { padding: 30px; }
              .goal-card { background: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 20px; border-left: 4px solid #2563EB; }
              .goal-card h3 { margin: 0 0 10px; color: #1e293b; }
              .progress-bar { background: #e2e8f0; border-radius: 10px; height: 12px; overflow: hidden; margin: 10px 0; }
              .progress-fill { height: 100%; border-radius: 10px; transition: width 0.3s; }
              .progress-fill.weekly { background: linear-gradient(90deg, #2563EB, #3b82f6); }
              .progress-fill.monthly { background: linear-gradient(90deg, #10B981, #34d399); }
              .stats { display: flex; justify-content: space-between; color: #64748b; font-size: 14px; }
              .motivation { background: #fef3c7; border-radius: 12px; padding: 20px; text-align: center; margin-top: 20px; }
              .motivation p { margin: 0; color: #92400e; font-weight: 500; }
              .cta-button { display: inline-block; background: linear-gradient(135deg, #2563EB, #10B981); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 20px; }
              .footer { text-align: center; padding: 20px; color: #94a3b8; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>💪 Daily Fitness Reminder</h1>
                <p>Your goal: ${fitnessGoal}</p>
              </div>
              <div class="content">
                <div class="goal-card">
                  <h3>📅 Weekly Progress</h3>
                  <div class="progress-bar">
                    <div class="progress-fill weekly" style="width: ${weeklyProgress}%"></div>
                  </div>
                  <div class="stats">
                    <span>${weeklyCompleted} of ${weeklyGoal} exercises done</span>
                    <span>${weeklyRemaining} to go!</span>
                  </div>
                </div>
                
                <div class="goal-card">
                  <h3>📆 Monthly Progress</h3>
                  <div class="progress-bar">
                    <div class="progress-fill monthly" style="width: ${monthlyProgress}%"></div>
                  </div>
                  <div class="stats">
                    <span>${monthlyCompleted} of ${monthlyGoal} exercises done</span>
                    <span>${monthlyRemaining} to go!</span>
                  </div>
                </div>

                <div class="motivation">
                  <p>${getMotivationalMessage(weeklyProgress)}</p>
                </div>

                <div style="text-align: center;">
                  <a href="https://healthkinetics.app/home" class="cta-button">Start Today's Workout →</a>
                </div>
              </div>
              <div class="footer">
                <p>Slim and Smart - Your Personal Fitness Companion</p>
                <p>Stay consistent, stay healthy! 🌟</p>
              </div>
            </div>
          </body>
          </html>
        `;

        const emailResponse = await resend.emails.send({
          from: "Slim and Smart <noreply@healthkinetics.app>",
          to: [email],
          subject: `💪 ${weeklyRemaining > 0 ? `${weeklyRemaining} exercises to hit your weekly goal!` : "You crushed your weekly goal! 🎉"}`,
          html: emailHtml,
        });

        console.log(`Email sent to ${email}:`, emailResponse);
        emailsSent++;
      } catch (emailError) {
        console.error(`Failed to send email to user ${profile.user_id}:`, emailError);
        emailsFailed++;
      }
    }

    console.log(`Daily reminders complete. Sent: ${emailsSent}, Failed: ${emailsFailed}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailsSent, 
        emailsFailed,
        message: `Sent ${emailsSent} reminder emails` 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-daily-reminders:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

function getMotivationalMessage(progress: number): string {
  if (progress >= 100) {
    return "🎉 Amazing! You've crushed your weekly goal! Keep up the incredible work!";
  } else if (progress >= 75) {
    return "🔥 You're so close! Just a few more exercises to hit your goal!";
  } else if (progress >= 50) {
    return "💪 Halfway there! You're doing great, keep pushing!";
  } else if (progress >= 25) {
    return "🚀 Good start! Every workout counts - let's build momentum!";
  } else {
    return "⭐ Today is a perfect day to get moving! Your body will thank you!";
  }
}

serve(handler);
