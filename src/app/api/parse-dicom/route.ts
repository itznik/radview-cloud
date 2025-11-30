import { NextRequest, NextResponse } from 'next/server';
import * as dicomParser from 'dicom-parser';

// This forces the API to run dynamically since we are fetching external data
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    console.log(`🔍 Parsing DICOM Header from: ${url}`);

    // 1. Fetch only the first 65KB (65536 bytes) of the file
    // This contains the metadata but stops before the heavy pixel data
    const response = await fetch(url, {
      headers: {
        Range: 'bytes=0-65536', 
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }

    // 2. Convert to Byte Array for the parser
    const arrayBuffer = await response.arrayBuffer();
    const byteArray = new Uint8Array(arrayBuffer);

    // 3. Parse the DICOM tags
    // dataset represents the map of Tag -> Value
    const dataset = dicomParser.parseDicom(byteArray);

    // 4. Helper to safely extract strings
    const getValue = (tag: string) => {
      try {
        return dataset.string(tag) || 'Unknown';
      } catch (e) {
        return 'Unknown';
      }
    };

    // 5. Extract specific medical tags
    // Tags are hexadecimal: Group + Element
    const metadata = {
      patientName: getValue('x00100010'), // (0010,0010) Patient's Name
      patientId: getValue('x00100020'),   // (0010,0020) Patient ID
      studyDate: getValue('x00080020'),   // (0008,0020) Study Date
      modality: getValue('x00080060'),    // (0008,0060) Modality (CT, MR)
      institution: getValue('x00080080'), // (0008,0080) Institution Name
      manufacturer: getValue('x00080070'), // (0008,0070) Manufacturer
    };

    return NextResponse.json({ success: true, metadata });

  } catch (error: any) {
    console.error('❌ DICOM Parse Error:', error);
    return NextResponse.json(
      { error: 'Failed to parse DICOM', details: error.message },
      { status: 500 }
    );
  }
}
