import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { answers, questions, feedback, summary } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Check if all questions were skipped
    const allSkipped = questions.every((_: string, i: number) => !answers[i] || answers[i] === null);
    
    if (allSkipped && !feedback) {
      // Return a general fitness plan for users who skipped all questions
      console.log("All questions skipped - returning general fitness plan");
      const generalPlan = {
        goal: "Build a sustainable fitness routine that improves overall health, energy levels, and well-being",
        weeklyPlan: "Start with 3 workout days per week (e.g., Monday, Wednesday, Friday) with rest days in between. This balanced approach allows for proper recovery while building consistency.",
        workoutStyle: "A balanced mix of cardio (walking, cycling, or swimming), strength training (bodyweight exercises or light weights), and flexibility work (stretching or yoga). This well-rounded approach ensures overall fitness development.",
        stayingConsistent: "Start small with just 15-20 minute sessions, schedule workouts like appointments, find activities you enjoy, celebrate small wins, and remember that any movement is better than no movement. Build habits gradually.",
        duration: "Begin with 20-30 minute sessions and gradually increase to 45-60 minutes as your fitness improves",
        progression: "Week 1-2: Focus on building the habit with light, enjoyable movement. Week 3-4: Gradually increase duration and intensity. Listen to your body and adjust as needed.",
      };
      return new Response(JSON.stringify({ plan: generalPlan }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build the user context from answers
    const userContext = questions
      .map((q: string, i: number) => {
        const answer = answers[i];
        return `${q}\nAnswer: ${answer || "Skipped"}`;
      })
      .join("\n\n");

    let feedbackContext = "";
    if (feedback) {
      feedbackContext = `\n\nUser feedback on previous plan: ${feedback}\n\nPlease adjust the plan according to this feedback.`;
    }

    const systemPrompt = `You are a supportive, encouraging fitness coach creating personalized fitness plans. 
Your tone should be friendly, calm, and motivating - never shaming or using extreme fitness language.
Focus on consistency, progress, and feeling good.

Important guidelines:
- Avoid medical diagnoses or prescriptions
- If injuries or pain are mentioned, suggest gentle alternatives and general caution
- Keep language age-appropriate and positive
- Make the user feel understood and supported
- Create realistic, achievable plans
- Include specific workout types that match their goals (e.g., "strength training", "cardio", "HIIT", "yoga", "swimming")

Respond with a JSON object containing these exact fields:
{
  "goal": "A personalized statement of their primary fitness goal",
  "weeklyPlan": "Specific weekly workout frequency and structure based on their availability",
  "workoutStyle": "Recommended workout types based on their preferences and goals (be specific: mention types like strength, cardio, flexibility, etc.)",
  "stayingConsistent": "Personalized tips for overcoming their specific consistency challenges",
  "duration": "Recommended session duration based on their time availability",
  "progression": "A 4-week progression plan that's beginner-friendly"
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Based on the following user responses, create a personalized fitness plan:\n\n${userContext}${feedbackContext}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON from the response
    let plan;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        plan = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      plan = {
        goal: answers[0] || "Improve overall fitness and well-being",
        weeklyPlan: "Start with 3 workout days per week, with rest days in between for recovery.",
        workoutStyle: "A balanced mix of cardio and strength training, adjusted to your comfort level.",
        stayingConsistent: "Start small, celebrate every workout, and remember that some movement is always better than none.",
        duration: "30-45 minutes per session",
        progression: "Week 1-2: Build the habit with lighter workouts. Week 3-4: Gradually increase intensity as you feel ready.",
      };
    }

    console.log("Generated fitness plan:", plan);

    return new Response(JSON.stringify({ plan }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating fitness plan:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
