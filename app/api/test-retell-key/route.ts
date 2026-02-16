import { NextResponse } from 'next/server';

export async function GET() {
  const key = process.env.RETELL_API_KEY || '';

  return NextResponse.json({
    hasKey: !!key,
    keyLength: key.length,
    startsWithKey: key.startsWith('key_'),
    firstChars: key.substring(0, 10),
    hasQuotes: key.includes('"'),
    hasNewline: key.includes('\n'),
    trimmedLength: key.trim().length,
    raw: JSON.stringify(key)
  });
}
