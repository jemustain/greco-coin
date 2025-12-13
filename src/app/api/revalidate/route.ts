/**
 * T033: Cache Revalidation API Endpoint
 * 
 * Provides an endpoint for triggering cache invalidation after data updates.
 * Can be called by automated update scripts or manually by admins.
 * 
 * Usage:
 *   POST /api/revalidate
 *   Body: { secret: "...", tags: ["commodity-gold"] }
 *   or   { secret: "...", path: "/" }
 */

import { revalidateTag, revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Verify secret token (should be set in environment variables)
    const secret = body.secret;
    const expectedSecret = process.env.REVALIDATION_SECRET || 'dev-secret-change-in-production';
    
    if (secret !== expectedSecret) {
      return NextResponse.json(
        { error: 'Invalid secret token' },
        { status: 401 }
      );
    }
    
    // Revalidate by tag(s)
    if (body.tags && Array.isArray(body.tags)) {
      for (const tag of body.tags) {
        revalidateTag(tag);
        console.log(`✅ Revalidated cache tag: ${tag}`);
      }
      
      return NextResponse.json({
        revalidated: true,
        type: 'tags',
        tags: body.tags,
        timestamp: new Date().toISOString(),
      });
    }
    
    // Revalidate by path
    if (body.path) {
      revalidatePath(body.path);
      console.log(`✅ Revalidated path: ${body.path}`);
      
      return NextResponse.json({
        revalidated: true,
        type: 'path',
        path: body.path,
        timestamp: new Date().toISOString(),
      });
    }
    
    // Invalid request
    return NextResponse.json(
      { error: 'Must provide either "tags" or "path" parameter' },
      { status: 400 }
    );
    
  } catch (error) {
    console.error('Cache revalidation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to revalidate cache',
        message: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// OPTIONS for CORS preflight
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        'Allow': 'POST, OPTIONS',
      },
    }
  );
}
