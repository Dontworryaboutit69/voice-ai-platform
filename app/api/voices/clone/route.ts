import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const voiceName = formData.get('name') as string;
    const organizationId = formData.get('organization_id') as string;
    const description = formData.get('description') as string || '';

    if (!audioFile || !voiceName || !organizationId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (audioFile.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ['audio/wav', 'audio/mpeg', 'audio/mp4', 'audio/x-m4a'];
    if (!validTypes.includes(audioFile.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Must be WAV, MP3, or M4A' },
        { status: 400 }
      );
    }

    // Create FormData for ElevenLabs
    const elevenlabsFormData = new FormData();
    elevenlabsFormData.append('name', voiceName);
    elevenlabsFormData.append('files', audioFile);
    if (description) {
      elevenlabsFormData.append('description', description);
    }

    // Clone voice via ElevenLabs API
    const response = await fetch('https://api.elevenlabs.io/v1/voices/add', {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY || ''
      },
      body: elevenlabsFormData
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('ElevenLabs API error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to clone voice' },
        { status: 500 }
      );
    }

    const clonedVoice = await response.json();

    // Save to our database
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('custom_voices')
      .insert({
        organization_id: organizationId,
        voice_id: clonedVoice.voice_id,
        voice_name: voiceName,
        provider: 'elevenlabs',
        is_cloned: true,
        cloning_status: 'ready',
        preview_audio_url: clonedVoice.preview_url || null,
        language: 'English', // Default, can be customized
        use_case: 'conversational'
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to save voice to database' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      voice: data,
      elevenlabs_data: clonedVoice
    });

  } catch (error: any) {
    console.error('Error cloning voice:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to clone voice' },
      { status: 500 }
    );
  }
}
