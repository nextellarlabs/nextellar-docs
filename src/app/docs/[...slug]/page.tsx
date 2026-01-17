import { allDocs } from 'contentlayer/generated';
import { notFound } from 'next/navigation';
import { Mdx } from '@/components/mdx-components';
import Breadcrumb from '@/components/bread-crumb';
import AutoToc from '@/components/auto-toc';

type tParams = Promise<{ slug: string[] }>;

export const generateStaticParams = async () => {
  return allDocs
    .filter((doc) => {
      const path = doc._raw.flattenedPath;
      // Exclude root index.mdx (handled by /docs/page.tsx)
      // The root index has an empty flattenedPath
      return path !== '' && path !== 'index' && path.length > 0;
    })
    .map((doc) => {
      // For paths like "search-bar" create { slug: ['search-bar'] }
      // For paths like "getting-started/introduction" create { slug: ['getting-started', 'introduction'] }
      const slugArray = doc._raw.flattenedPath.split('/');
      return { slug: slugArray };
    });
};

export const generateMetadata = async ({ params }: { params: tParams }) => {
  // Join the slug array back into a path string
  const awaitedParams = await params;
  const path = awaitedParams.slug.join('/');
  const doc = allDocs.find((doc) => doc._raw.flattenedPath === path);

  if (!doc) throw new Error(`Doc not found for slug: ${path}`);
  return {
    title: doc.title,
    description: doc.description || 'A detailed guide to the topic.',
    openGraph: {
      title: doc.title,
      description: doc.description || 'A detailed guide to the topic.',
    },
  };
};

const DocsPage = async ({ params }: { params: tParams }) => {
  const awaitedParams = await params;
  // Join the slug array back into a path string
  const path = awaitedParams.slug.join('/');
  const doc = allDocs.find((doc) => doc._raw.flattenedPath === path);

  if (!doc) notFound();
  return (
    <div className={`grid xl:grid xl:grid-cols-[1fr_270px]`}>
      <article className="overflow-auto">
        <div className="mb-8 text-center">
          <Breadcrumb path={doc.url} />
          {/* {doc.date && (
            <time dateTime={doc.date} className="mb-1 text-xs text-gray-600">
              {format(parseISO(doc.date), 'LLLL d, yyyy')}
            </time>
          )}
          <h1 className="text-3xl font-bold">{doc.title}</h1> */}
        </div>
        <Mdx code={doc.body.code} />
      </article>

      <AutoToc />
    </div>
  );
};

export default DocsPage;
