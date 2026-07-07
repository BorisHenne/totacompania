import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Event, Media } from '@/models';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

// Helper to check if a string is a valid MongoDB ObjectId
function isValidObjectId(str: string): boolean {
  return mongoose.Types.ObjectId.isValid(str) && str.length === 24;
}

// Helper to get CDN URL
function getCdnUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  
  const cdnUrl = '';
  if (path.startsWith('/uploads/')) {
    return cdnUrl + path;
  }
  return path;
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const upcoming = searchParams.get('upcoming') === 'true';
    const past = searchParams.get('past') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');
    const type = searchParams.get('type');

    let query: any = { published: true };

    if (upcoming) {
      // Un événement est à venir si sa date de fin (ou date de début si pas de fin) est >= aujourd'hui
      query.$or = [
        { endDate: { $gte: new Date() } },
        { endDate: { $exists: false }, date: { $gte: new Date() } }
      ];
    } else if (past) {
      // Un événement est passé si sa date de fin (ou date de début si pas de fin) est < aujourd'hui
      query.$or = [
        { endDate: { $lt: new Date() } },
        { endDate: { $exists: false }, date: { $lt: new Date() } }
      ];
    }

    if (type) {
      query.type = type;
    }

    const events = await Event.find(query)
      .sort({ date: 1 })
      .limit(limit)
      .populate('spectacleId')
      .lean();

    // Collect all media IDs that need to be resolved
    const mediaIds = new Set<string>();
    events.forEach((event: any) => {
      if (event.image && isValidObjectId(event.image)) {
        mediaIds.add(event.image);
      }
    });

    // Fetch all media documents in one query
    const mediaMap = new Map<string, string>();
    if (mediaIds.size > 0) {
      const mediaDocuments = await Media.find({
        _id: { $in: Array.from(mediaIds) }
      }).select('_id url path').lean();
      
      mediaDocuments.forEach((doc: any) => {
        const url = doc.url || doc.path || '';
        mediaMap.set(doc._id.toString(), getCdnUrl(url));
      });
    }

    // Transform events with resolved image URLs
    const formattedEvents = events.map((event: any) => {
      let imageUrl = event.image;
      if (imageUrl && isValidObjectId(imageUrl)) {
        imageUrl = mediaMap.get(imageUrl) || '';
      } else if (imageUrl) {
        imageUrl = getCdnUrl(imageUrl);
      }

      const documents = Array.isArray(event.documents)
        ? event.documents.map((d: any) => ({
            title: d.title,
            file: d.file ? getCdnUrl(d.file) : '',
          }))
        : [];

      return {
        ...event,
        date: event.date?.toISOString ? event.date.toISOString() : event.date,
        endDate: event.endDate?.toISOString ? event.endDate.toISOString() : event.endDate,
        image: imageUrl,
        documents,
      };
    });

    return NextResponse.json(formattedEvents);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}
