import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';
import fs from 'fs';
import path from 'path';

export async function POST() {
  try {
    const supabase = createServiceClient();

    // Read the framework SQL file
    const filePath = path.join(process.cwd(), 'supabase', 'update-framework.sql');
    const frameworkContent = fs.readFileSync(filePath, 'utf8');

    // Extract the instructions content between $$
    const match = frameworkContent.match(/instructions = \$\$([\s\S]*?)\$\$/);

    if (!match) {
      return NextResponse.json({
        success: false,
        error: 'Could not parse framework content'
      }, { status: 400 });
    }

    const instructions = match[1].trim();

    // Update the framework
    const { error } = await supabase
      .from('framework_instructions')
      .update({ instructions })
      .eq('name', 'retell_voice_ai_framework');

    if (error) {
      console.error('Error updating framework:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    console.log('✅ Framework updated successfully!');

    return NextResponse.json({
      success: true,
      message: 'Framework updated successfully'
    });

  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}
