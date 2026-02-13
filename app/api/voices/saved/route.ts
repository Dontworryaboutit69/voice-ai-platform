import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';

// Get user's saved voices
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const organizationId = searchParams.get('organization_id');

    if (!organizationId) {
      return NextResponse.json(
        { success: false, error: 'Missing organization_id' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('custom_voices')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching saved voices:', error);

      // If table doesn't exist, return empty array instead of error
      if (error.code === 'PGRST205') {
        console.warn('custom_voices table does not exist - migration needed');
        return NextResponse.json({
          success: true,
          voices: [],
          grouped: { cloned: [], favorites: [], all: [] },
          total: 0
        });
      }

      return NextResponse.json(
        { success: false, error: 'Failed to fetch saved voices' },
        { status: 500 }
      );
    }

    // Group by type
    const grouped = {
      cloned: data.filter(v => v.is_cloned),
      favorites: data.filter(v => v.is_favorite && !v.is_cloned),
      all: data
    };

    return NextResponse.json({
      success: true,
      voices: data,
      grouped: grouped,
      total: data.length
    });

  } catch (error: any) {
    console.error('Error in GET saved voices:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Save a voice to user's library
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      organization_id,
      voice_id,
      voice_name,
      provider,
      gender,
      accent,
      age,
      language,
      use_case,
      preview_audio_url
    } = body;

    if (!organization_id || !voice_id || !voice_name || !provider) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('custom_voices')
      .insert({
        organization_id,
        voice_id,
        voice_name,
        provider,
        gender,
        accent,
        age,
        language,
        use_case,
        preview_audio_url,
        is_favorite: true
      })
      .select()
      .single();

    if (error) {
      // Check if already exists
      if (error.code === '23505') {
        return NextResponse.json(
          { success: false, error: 'Voice already saved' },
          { status: 409 }
        );
      }

      console.error('Error saving voice:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to save voice' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      voice: data
    });

  } catch (error: any) {
    console.error('Error in POST saved voice:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Delete a saved voice
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const voiceId = searchParams.get('voice_id');
    const organizationId = searchParams.get('organization_id');

    if (!voiceId || !organizationId) {
      return NextResponse.json(
        { success: false, error: 'Missing voice_id or organization_id' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const { error } = await supabase
      .from('custom_voices')
      .delete()
      .eq('voice_id', voiceId)
      .eq('organization_id', organizationId);

    if (error) {
      console.error('Error deleting voice:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete voice' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Voice deleted successfully'
    });

  } catch (error: any) {
    console.error('Error in DELETE saved voice:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
