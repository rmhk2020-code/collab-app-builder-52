import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { itemName, itemType, description } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "API key not configured" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!itemName || !itemType) {
      return new Response(
        JSON.stringify({ error: "itemName and itemType are required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating video for ${itemType}: ${itemName}`);

    // Generate a detailed video description prompt
    const videoPrompt = itemType === 'exercise'
      ? `Professional fitness trainer demonstrating "${itemName}" exercise with proper form, showing starting position and movement pattern. ${description || ''} Clean gym or studio setting with good lighting.`
      : `Chef preparing "${itemName}" in a professional kitchen. Showing ingredients and cooking process step by step. ${description || ''} Clean, well-lit kitchen with fresh ingredients visible.`;

    // Use Lovable AI to generate a video URL/thumbnail
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a helpful assistant that generates realistic video search queries and descriptions for fitness and cooking content.`
          },
          {
            role: 'user',
            content: `Generate a detailed description for a ${itemType === 'exercise' ? 'fitness demonstration' : 'cooking tutorial'} video about "${itemName}". 
            
Include:
1. A brief title
2. Key visual elements that would be shown
3. Step-by-step description of what happens in the video
4. Estimated duration (15-30 seconds)

Format as JSON:
{
  "title": "string",
  "visualElements": ["string"],
  "steps": ["string"],
  "duration": number,
  "searchQuery": "string for finding similar stock video"
}`
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      
      // Return fallback data
      return new Response(
        JSON.stringify({
          title: itemName,
          visualElements: [`${itemType === 'exercise' ? 'Trainer demonstrating' : 'Chef preparing'} ${itemName}`],
          steps: [`Watch the ${itemType === 'exercise' ? 'demonstration' : 'preparation'} of ${itemName}`],
          duration: 20,
          searchQuery: `${itemName} ${itemType === 'exercise' ? 'exercise tutorial' : 'recipe cooking'}`,
          videoUrl: null,
          isFallback: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    // Parse the JSON response
    let videoData;
    try {
      // Extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        videoData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      videoData = {
        title: itemName,
        visualElements: [`${itemType === 'exercise' ? 'Trainer demonstrating' : 'Chef preparing'} ${itemName}`],
        steps: [`Watch the ${itemType === 'exercise' ? 'demonstration' : 'preparation'} of ${itemName}`],
        duration: 20,
        searchQuery: `${itemName} ${itemType === 'exercise' ? 'exercise tutorial' : 'recipe cooking'}`
      };
    }

    console.log(`Generated video data for ${itemName}`);

    return new Response(
      JSON.stringify({
        ...videoData,
        itemName,
        itemType,
        generatedAt: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-item-video function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
