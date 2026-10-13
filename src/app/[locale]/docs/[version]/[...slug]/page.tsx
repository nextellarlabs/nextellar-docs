import { allDocs, allVersionedDocs } from 'contentlayer/generated';
import { notFound } from 'next/navigation';
import { Mdx } from '@/components/mdx-components';
import Breadcrumb from '@/components/bread-crumb';
import AutoToc from '@/components/auto-toc';
import EditThisPage from '@/components/edit-this-page';
import { format, parseISO } from 'date-fns';
import { getVersionFromPath } from '@/lib/versions';
import { Locale, LOCALES, isValidLocale } from '@/lib/i18n';

type Params = Promise<{ locale: string; version: string; slug: string[] }>;

export const generateStaticParams = async () => {
  // Generate params for all locales with unversioned docs: /{locale}/docs/...slug
  const unversionedParams = LOCALES.flatMap((locale) =>
    allDocs
      .filter((doc) => {
        const path = doc._raw.flattenedPath;
        return path !== '' && path !== 'index' && path.length > 0;
      })
      .map((doc) => {
        const slugArray = doc._raw.flattenedPath.split('/');
        return { locale, version: 'current', slug: slugArray };
      })
  );

  // Generate params for all locales with versioned docs: /{locale}/docs/v1.0.0/...slug
  const versionedParams = LOCALES.flatMap((locale) =>
    allVersionedDocs
      .filter((doc) => {
        const path = doc._raw.flattenedPath;
        return path !== '' && path !== 'index' && path.length > 0;
      })
      .map((doc) => {
        const slugArray = doc._raw.flattenedPath.split('/');
        const version = doc.version || 'current';
        return {
          locale,
          version: version === 'current' ? 'current' : `v${version}`,
          slug: slugArray,
        };
      })
  );

  return [...unversionedParams, ...versionedParams];
};

export const generateMetadata = async ({ params }: { params: Params }) => {
  const awaitedParams = await params;
  const { locale, version, slug } = awaitedParams;

  if (!isValidLocale(locale)) notFound();

  const path = slug.join('/');

  // Try to find in versioned docs first if version is specified
  let doc = null;
  if (version === 'current') {
    doc = allDocs.find((doc) => doc._raw.flattenedPath === path);
  } else {
    doc = allVersionedDocs.find(
      (doc) =>
        doc._raw.flattenedPath === path &&
        (doc.version === version.replace(/^v/, '') || doc.version === version)
    );
  }

  if (!doc) notFound();
  return {
    title: doc.title,
    description: doc.description || 'A detailed guide to the topic.',
    openGraph: {
      title: doc.title,
      description: doc.description || 'A detailed guide to the topic.',
    },
  };
};

const DocsPage = async ({ params }: { params: Params }) => {
  const awaitedParams = await params;
  const { locale, version, slug } = awaitedParams;

  if (!isValidLocale(locale)) notFound();

  const path = slug.join('/');

  // Try to find in versioned docs first if version is specified
  let doc = null;
  if (version === 'current') {
    doc = allDocs.find((doc) => doc._raw.flattenedPath === path);
  } else {
    doc = allVersionedDocs.find(
      (doc) =>
        doc._raw.flattenedPath === path &&
        (doc.version === version.replace(/^v/, '') || doc.version === version)
    );
  }

  if (!doc) notFound();

  return (
    <div className={`grid xl:grid xl:grid-cols-[1fr_270px]`}>
      <article className="overflow-auto">
        <div className="mb-8 text-center">
          <Breadcrumb path={doc.url} />
          {doc.date && (
            <time
              dateTime={doc.date}
              className="mt-2 block text-sm text-muted-foreground"
            >
              Last updated: {format(parseISO(doc.date), 'LLLL d, yyyy')}
            </time>
          )}
        </div>
        <Mdx code={doc.body.code} />
        <div className="mt-12 pt-6 border-t border-[var(--color-border)]">
          <EditThisPage filePath={doc._raw.flattenedPath} />
        </div>
      </article>

      <AutoToc />
    </div>
  );
};

export default DocsPage;
