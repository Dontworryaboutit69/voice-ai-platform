import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY || ''
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch voices from ElevenLabs');
    }

    const data = await response.json();
    const voices = data.voices || [];

    // Filter for English/Spanish voices only (not too restrictive on use case)
    const filteredVoices = voices.filter((voice: any) => {
      const labels = voice.labels || {};
      const language = labels.language?.toLowerCase() || '';
      const accent = labels.accent?.toLowerCase() || '';

      // Accept English (en), Spanish (es), or American accent
      const isEnglishOrSpanish =
        language === 'en' ||
        language === 'es' ||
        language.includes('english') ||
        language.includes('spanish') ||
        accent.includes('american') ||
        accent.includes('british') ||
        accent.includes('australian');

      return isEnglishOrSpanish;
    });

    // Transform to our format
    const formattedVoices = filteredVoices.map((voice: any) => ({
      voice_id: voice.voice_id,
      voice_name: voice.name,
      provider: 'elevenlabs',
      gender: voice.labels?.gender || null,
      accent: voice.labels?.accent || voice.labels?.language || null,
      age: voice.labels?.age || null,
      language: voice.labels?.language || 'English',
      use_case: voice.labels?.use_case || 'conversational',
      preview_audio_url: voice.preview_url || null,
      description: voice.labels?.description || null,
      category: voice.category || 'general'
    }));

    return NextResponse.json({
      success: true,
      voices: formattedVoices,
      total: formattedVoices.length
    });

  } catch (error: any) {
    console.error('Error fetching ElevenLabs voices:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch voices' },
      { status: 500 }
    );
  }
}
