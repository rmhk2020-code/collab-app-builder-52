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
      videoPrompt = `Professional fitness demonstration video: ${prompt}. 
        Show a person performing the exercise with proper form, clear movements, and appropriate pacing. 
        The video should be educational and demonstrate correct technique.
        High quality, well-lit gym or home workout setting.`;
    } else if (type === "food_preparation") {
      videoPrompt = `Professional cooking demonstration video: ${prompt}. 
        Show the food preparation process step by step, including ingredient handling and cooking techniques.
        Clean, well-lit kitchen setting with professional presentation.
        Focus on the key preparation steps.`;
    } else {
      videoPrompt = prompt;
    }

    // Use Lovable AI gateway for video generation via the Gemini model
    // Note: If Gemini doesn't support video, we'll generate a descriptive response
    // that could be used with an external video generation API
    
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
            content: `You are a video script generator for fitness and nutrition content. 
            Create a detailed video script that describes what should be shown frame by frame.
            Format your response as JSON with the following structure:
            {
              "title": "Video title",
              "description": "Brief description",
              "duration_seconds": number,
              "scenes": [
                {
                  "timestamp": "0:00-0:05",
                  "description": "What's happening in this scene",
                  "keyPoints": ["point1", "point2"]
                }
              ],
              "thumbnailDescription": "Description for a thumbnail image"
            }`
          },
          {
            role: "user",
            content: `Create a video script for: ${videoPrompt}. Duration should be approximately ${duration || 30} seconds.`
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
      videoScript = {
        title: `${type === "exercise" ? "Exercise" : "Preparation"} Guide`,
        description: prompt,
        duration_seconds: duration || 30,
        scenes: [
          {
            timestamp: "0:00-0:30",
            description: prompt,
            keyPoints: ["Follow along with the demonstration"]
          }
        ],
        thumbnailDescription: prompt
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
            content: `Generate a professional thumbnail image for a ${type === "exercise" ? "fitness exercise" : "cooking"} video: ${videoScript.thumbnailDescription || prompt}. 
            Make it visually appealing and representative of the content. High quality, well-composed shot.`
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
