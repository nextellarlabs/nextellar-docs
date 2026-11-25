import { Metadata } from 'next';
import { docsRootMetadata } from 'config/docs-meta';
import DocsLayoutClient from './docs-layout-client';
import { getAllDocs } from '@/lib/content';

export const metadata: Metadata = docsRootMetadata;

export default async function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const docs = await getAllDocs();
  const searchData = docs.map((d) => ({
    title: d.title,
    body: { raw: d.body.raw },
    _raw: { flattenedPath: d._raw.flattenedPath },
  }));
  return (
    <DocsLayoutClient searchData={searchData}>{children}</DocsLayoutClient>
  );
}
