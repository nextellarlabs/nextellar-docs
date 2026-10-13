import { loadVersionsMetadata } from '@/lib/versions';

export async function GET() {
  try {
    const versions = await loadVersionsMetadata();
    return Response.json(versions);
  } catch (error) {
    console.error('Error loading versions:', error);
    return Response.json([], { status: 200 });
  }
}
