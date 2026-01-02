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
    const { prompt, type, duration } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Generating ${type} video for:`, prompt);

    // Build a detailed prompt for the video generation
    let videoPrompt = "";
    
    if (type === "exercise") {
      videoPrompt = `Create a detailed fitness exercise demonstration video script for: ${prompt}. 
        The video should show a person performing the exercise with:
        - Clear starting position
        - Proper form throughout the movement  
        - Smooth, controlled tempo
        - Safety cues and breathing instructions
        Professional gym or home workout setting with good lighting.
        Duration: approximately ${duration || 30} seconds.`;
    } else if (type === "food") {
      videoPrompt = `Create a detailed cooking/food preparation video script for: ${prompt}. 
        The video should show:
        - Ingredients laid out with labels
        - Step-by-step preparation techniques
        - Cooking methods with timing
        - Plating and presentation
        - Nutritional tips during preparation
        Clean, professional kitchen setting with natural lighting.
        Include sound descriptions: sizzling, chopping, mixing sounds.
        Duration: approximately ${duration || 30} seconds.`;
    } else {
      videoPrompt = prompt;
    }

    // Generate video script with detailed scenes
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a professional video production script writer for fitness and nutrition content.
            Create detailed, engaging video scripts that describe what should be shown and heard.
            
            Format your response as JSON with this exact structure:
            {
              "title": "Video title",
              "description": "Brief 1-2 sentence description",
              "duration_seconds": number (total duration),
              "scenes": [
                {
                  "timestamp": "0:00-0:05",
                  "description": "Detailed visual description of what's happening",
                  "audio": "Sound effects and any narration",
                  "keyPoints": ["Important point 1", "Important point 2"]
                }
              ],
              "thumbnailDescription": "Description for generating a thumbnail image"
            }
            
            Create 4-6 scenes that flow naturally. Include realistic audio/sound descriptions.
            For exercise videos: include form cues, breathing instructions, common mistakes to avoid.
            For food videos: include cooking sounds (sizzling, chopping), ingredient tips, nutritional facts.`
          },
          {
            role: "user",
            content: videoPrompt
          }
        ],
      }),
    });

    if (!response.ok) {
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
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    console.log("AI response received:", content);

    // Parse the JSON response
    let videoScript;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        videoScript = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Create a fallback script
      const isExercise = type === "exercise";
      videoScript = {
        title: isExercise ? "Exercise Demonstration" : "Food Preparation Guide",
        description: prompt,
        duration_seconds: duration || 30,
        scenes: [
          {
            timestamp: "0:00-0:08",
            description: isExercise ? "Starting position demonstration with proper form setup" : "Ingredients overview with nutritional information",
            audio: isExercise ? "Upbeat background music starts" : "Gentle cooking ambiance, knife on cutting board",
            keyPoints: [isExercise ? "Feet shoulder-width apart" : "Fresh, quality ingredients", isExercise ? "Core engaged" : "Prep all ingredients first"]
          },
          {
            timestamp: "0:08-0:16",
            description: isExercise ? "Main movement execution with controlled tempo" : "Primary preparation and cooking steps",
            audio: isExercise ? "Rhythmic breathing, 'Inhale... exhale'" : "Sizzling sounds, ingredients cooking",
            keyPoints: [isExercise ? "Full range of motion" : "Medium heat for best results", isExercise ? "Breathe steadily" : "Stir occasionally"]
          },
          {
            timestamp: "0:16-0:24",
            description: isExercise ? "Common mistakes to avoid with correction" : "Finishing touches and seasoning",
            audio: isExercise ? "Coach voice: 'Keep your back straight'" : "Salt and pepper shaking, taste testing",
            keyPoints: [isExercise ? "Don't rush the movement" : "Season to taste", isExercise ? "Quality over quantity" : "Let flavors develop"]
          },
          {
            timestamp: "0:24-0:30",
            description: isExercise ? "Final rep and cool down position" : "Plating and final presentation",
            audio: isExercise ? "Music fades, 'Great job!'" : "Plate being set down, 'Enjoy your meal!'",
            keyPoints: [isExercise ? "Stretch after exercise" : "Garnish for presentation", isExercise ? "Stay hydrated" : "Serve immediately"]
          }
        ],
        thumbnailDescription: isExercise 
          ? `Professional fitness trainer demonstrating ${prompt}, gym setting`
          : `Beautifully prepared ${prompt} on a white plate, kitchen background`
      };
    }

    // Generate a thumbnail image for the video
    const thumbnailResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: `Generate a high-quality, professional thumbnail image for a ${type === "exercise" ? "fitness exercise" : "cooking and food preparation"} video. 
            Subject: ${videoScript.thumbnailDescription || prompt}
            Style: Bright, well-lit, professional photography quality. 
            ${type === "exercise" ? "Show action and movement, athletic person in workout clothes" : "Show appetizing food with steam or fresh ingredients visible"}.
            High resolution, clean composition.`
          }
        ],
        modalities: ["image", "text"]
      }),
    });

    let thumbnailUrl = null;
    if (thumbnailResponse.ok) {
      const thumbnailData = await thumbnailResponse.json();
      const thumbnailImage = thumbnailData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      if (thumbnailImage) {
        thumbnailUrl = thumbnailImage;
      }
    }

    return new Response(JSON.stringify({
      videoScript,
      thumbnailUrl,
      type,
      generatedAt: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating video:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
