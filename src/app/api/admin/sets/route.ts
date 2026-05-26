import { NextRequest, NextResponse } from 'next/server';
import { getAdminSetsList } from '@/lib/queries/setQueries.server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderBy = (searchParams.get('orderBy') as 'name' | 'created_at' | 'id' | 'updated_at' | 'is_active' | 'type' | 'description' | 'slug' | 'layout_type' | 'show_title_on_home') || 'created_at';
    const orderAsc = searchParams.get('orderAsc') === 'true';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined;
    const name = searchParams.get('name') || undefined;
    const type = searchParams.get('type') || undefined;
    const is_active = searchParams.get('is_active') !== null ? searchParams.get('is_active') === 'true' : undefined;

    const params = {
      orderBy,
      orderAsc,
      limit,
      offset,
      filters: {
        name,
        type,
        is_active,
      },
    };

    const result = await getAdminSetsList(params);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in /api/admin/sets:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 