import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Media } from '@/models';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const media = await Media.findById(id);
    if (!media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    const mediaUrl = media.url || media.path || '';
    if (!mediaUrl) {
      return NextResponse.json({ error: 'Media URL not found' }, { status: 404 });
    }

    if (mediaUrl.startsWith('http://') || mediaUrl.startsWith('https://')) {
      return NextResponse.redirect(mediaUrl, 301);
    }

    // Build absolute URL using the Host header
    const host = request.headers.get('host') || 'totacompania.fr';
    const proto = request.headers.get('x-forwarded-proto') || 'https';
    const path = mediaUrl.startsWith('/') ? mediaUrl : '/' + mediaUrl;
    return NextResponse.redirect(`${proto}://${host}${path}`, 301);
  } catch (error) {
    console.error('Error fetching media:', error);
    return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 });
  }
}
