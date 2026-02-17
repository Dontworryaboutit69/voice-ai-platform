import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ agentId: string }> }
) {
  const { agentId } = await params;
  return NextResponse.json({
    message: 'Simple test route works!',
    agentId: agentId
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ agentId: string }> }
) {
  const { agentId } = await params;
  const body = await request.json();
  return NextResponse.json({
    message: 'Simple POST test route works!',
    agentId: agentId,
    body: body
  });
}
