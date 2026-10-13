import { redirect } from 'next/navigation';

type Params = Promise<{ locale: string }>;

export default async function DocsIndexPage({ params }: { params: Params }) {
  const { locale } = await params;
  redirect(`/${locale}/docs/getting-started/introduction`);
}
