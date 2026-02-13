import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';

// GET /api/optimize/[optimizationId]
// Get optimization details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ optimizationId: string }> }
) {
  try {
    const { optimizationId } = await params;

    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from('agent_optimizations')
      .select(`
        *,
        agent:agents(*),
        proposed_version:prompt_versions!agent_optimizations_proposed_prompt_version_id_fkey(*),
        control_version:prompt_versions!agent_optimizations_ab_test_control_version_id_fkey(*),
        ab_test:ab_tests(*)
      `)
      .eq('id', optimizationId)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { success: false, error: 'Optimization not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      optimization: data
    });

  } catch (error: any) {
    console.error('Error fetching optimization:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/optimize/[optimizationId]
// Update optimization with custom feedback
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ optimizationId: string }> }
) {
  try {
    const { optimizationId } = await params;
    const body = await request.json();
    const { customFeedback, customPromptChanges } = body;

    const supabase = createServiceClient();

    // Get existing optimization
    const { data: existing } = await supabase
      .from('agent_optimizations')
      .select('*')
      .eq('id', optimizationId)
      .single();

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Optimization not found' },
        { status: 404 }
      );
    }

    const updates: any = {
      user_feedback: customFeedback
    };

    // If user provided custom prompt changes, create new version
    if (customPromptChanges) {
      const { data: newVersion, error: versionError } = await supabase
        .from('prompt_versions')
        .insert({
          agent_id: existing.agent_id,
          version_number: existing.proposed_version?.version_number + 1 || 1,
          compiled_prompt: customPromptChanges,
          generation_method: 'user_edited',
          parent_version_id: existing.proposed_prompt_version_id,
          change_summary: 'User customized auto-optimization'
        })
        .select()
        .single();

      if (versionError) {
        return NextResponse.json(
          { success: false, error: 'Failed to create custom version' },
          { status: 500 }
        );
      }

      updates.proposed_prompt_version_id = newVersion.id;
      updates.proposed_prompt_changes = customPromptChanges;
    }

    const { data, error } = await supabase
      .from('agent_optimizations')
      .update(updates)
      .eq('id', optimizationId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Failed to update optimization' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      optimization: data
    });

  } catch (error: any) {
    console.error('Error updating optimization:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
