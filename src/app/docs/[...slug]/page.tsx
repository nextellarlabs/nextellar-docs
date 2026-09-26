import { redirect } from 'next/navigation';

type tParams = Promise<{ slug: string[] }>;

/**
 * This route catches old-style unversioned URLs like /docs/getting-started/intro
 * and redirects them to the new versioned route /docs/current/getting-started/intro
 * for consistency with the new routing structure.
 */
export const generateStaticParams = async () => {
  return [];
};

const DocsPage = async ({ params }: { params: tParams }) => {
  const awaitedParams = await params;
  const slug = awaitedParams.slug.join('/');
  // Redirect to the new versioned route with 'current' as the version
  redirect(`/docs/current/${slug}`);
};

export default DocsPage;
