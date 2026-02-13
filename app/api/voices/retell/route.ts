import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://api.retellai.com/list-voices', {
      headers: {
        'Authorization': `Bearer ${process.env.RETELL_API_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch voices from Retell');
    }

    const voices = await response.json();

    // Filter for conversational voices in English and Spanish
    const filteredVoices = voices.filter((voice: any) => {
      const accent = voice.accent?.toLowerCase() || '';
      const isEnglishOrSpanish =
        accent.includes('american') ||
        accent.includes('english') ||
        accent.includes('spanish');

      return isEnglishOrSpanish;
    });

    // Group by provider
    const grouped = filteredVoices.reduce((acc: any, voice: any) => {
      const provider = voice.provider || 'other';
      if (!acc[provider]) {
        acc[provider] = [];
      }
      acc[provider].push(voice);
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      voices: filteredVoices,
      grouped: grouped,
      total: filteredVoices.length
    });

  } catch (error: any) {
    console.error('Error fetching Retell voices:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch voices' },
      { status: 500 }
    );
  }
}
