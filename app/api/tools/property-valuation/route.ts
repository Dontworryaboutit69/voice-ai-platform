import { NextRequest, NextResponse } from 'next/server';

const RENTCAST_API_KEY = process.env.RENTCAST_API_KEY || '';

// Parse address into components
function parseAddress(fullAddress: string) {
  // Expected format: "123 Main St, Austin, TX, 78701" or "123 Main Street Austin Texas 78701"
  const cleaned = fullAddress.replace(/\s+/g, ' ').trim();

  // Try to extract zip code (5 digits)
  const zipMatch = cleaned.match(/\b(\d{5})\b/);
  const zipCode = zipMatch ? zipMatch[1] : '';

  // Split by comma or find state abbreviation
  const parts = cleaned.split(',').map(p => p.trim());

  let address = '';
  let city = '';
  let state = '';

  if (parts.length >= 3) {
    // Format: "123 Main St, Austin, TX 78701"
    address = parts[0];
    city = parts[1];
    const stateZip = parts[2];
    const stateMatch = stateZip.match(/\b([A-Z]{2})\b/);
    state = stateMatch ? stateMatch[1] : '';
  } else {
    // Try to extract from single string
    const stateMatch = cleaned.match(/\b([A-Z]{2})\b/);
    state = stateMatch ? stateMatch[1] : '';

    // Everything before state is address + city
    if (state) {
      const beforeState = cleaned.substring(0, cleaned.indexOf(state)).trim();
      const addressParts = beforeState.split(' ');

      // Last 1-2 words before state are likely the city
      if (addressParts.length > 2) {
        city = addressParts.slice(-2).join(' ');
        address = addressParts.slice(0, -2).join(' ');
      } else {
        address = beforeState;
      }
    } else {
      address = cleaned.replace(zipCode, '').trim();
    }
  }

  return { address, city, state, zipCode };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address: fullAddress } = body;

    if (!fullAddress) {
      return NextResponse.json(
        { success: false, error: 'Address is required' },
        { status: 400 }
      );
    }

    if (!RENTCAST_API_KEY) {
      console.error('RENTCAST_API_KEY not configured');
      return NextResponse.json({
        success: false,
        message: 'Property valuation feature is not configured. Please add RENTCAST_API_KEY to environment variables.',
        error: true
      });
    }

    // Parse the address
    const { address, city, state, zipCode } = parseAddress(fullAddress);

    console.log('Calling RentCast API with:', { address, city, state, zipCode });

    // Build RentCast API URL with query parameters
    const params = new URLSearchParams();
    if (address) params.append('address', address);
    if (city) params.append('city', city);
    if (state) params.append('state', state);
    if (zipCode) params.append('zipCode', zipCode);

    const apiUrl = `https://api.rentcast.io/v1/avm/value?${params.toString()}`;
    console.log('RentCast API URL:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'X-Api-Key': RENTCAST_API_KEY,
        'accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('RentCast API error:', response.status, errorText);

      return NextResponse.json({
        success: false,
        message: `I'm having trouble getting valuation data for that address. Please make sure you provide the complete address including street, city, state, and zip code. For example: "123 Main Street, Austin, TX, 78701"`,
        error: true,
        details: errorText
      });
    }

    const data = await response.json();
    console.log('RentCast response:', JSON.stringify(data, null, 2));

    // Extract value from RentCast response
    const estimatedValue = data.price || data.value;

    if (!estimatedValue) {
      return NextResponse.json({
        success: false,
        message: "I couldn't find a valuation for that property. The address might not be in our database, or there might not be enough comparable sales data available.",
        error: true
      });
    }

    // Format the response
    const priceFormatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(estimatedValue);

    const lowEstimate = data.priceRangeLow || Math.round(estimatedValue * 0.9);
    const highEstimate = data.priceRangeHigh || Math.round(estimatedValue * 1.1);

    const message = `Based on current market data, the property at ${fullAddress} is estimated to be worth approximately ${priceFormatted}. The valuation range is between ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(lowEstimate)} and ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(highEstimate)}. This estimate is based on recent comparable sales in the area and current market conditions.`;

    return NextResponse.json({
      success: true,
      valuation: {
        price: estimatedValue,
        priceFormatted: priceFormatted,
        priceRangeLow: lowEstimate,
        priceRangeHigh: highEstimate,
        address: fullAddress,
        latitude: data.latitude,
        longitude: data.longitude
      },
      message: message
    });

  } catch (error: any) {
    console.error('Error in property valuation:', error);

    return NextResponse.json({
      success: false,
      message: "I'm experiencing a technical issue retrieving the property valuation right now. Please try again in a moment, or I can connect you with a real estate professional who can help.",
      error: true,
      details: error.message
    });
  }
}
