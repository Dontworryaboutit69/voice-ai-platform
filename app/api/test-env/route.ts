import { NextResponse } from 'next/server';

export async function GET() {
  const retellKey = process.env.RETELL_API_KEY;
  
  return NextResponse.json({
    hasRetellKey: !!retellKey,
    keyPrefix: retellKey?.substring(0, 8) + '...',
    keyLength: retellKey?.length || 0
  });
}
