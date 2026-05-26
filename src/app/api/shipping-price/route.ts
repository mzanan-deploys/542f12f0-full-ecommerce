import { NextRequest, NextResponse } from 'next/server';
import { getShippingPriceForCountry } from '@/app/admin/shipping-prices/page';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export async function GET(request: NextRequest) {
  try {
    const country = request.nextUrl.searchParams.get('country');

    if (!country) {
      return NextResponse.json(
        { error: 'Country parameter is required' },
        { status: 400 }
      );
    }

    const price = await getShippingPriceForCountry(country);

    return NextResponse.json(
      { price }, 
      { 
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=1800'
        }
      }
    );
  } catch (error) {
    console.error('Error fetching shipping price:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shipping price' },
      { status: 500 }
    );
  }
} 