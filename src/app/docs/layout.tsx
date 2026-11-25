import { Metadata } from 'next';
import { docsRootMetadata } from 'config/docs-meta';
import DocsLayoutClient from './docs-layout-client';

export const metadata: Metadata = docsRootMetadata;

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DocsLayoutClient>{children}</DocsLayoutClient>;
}
