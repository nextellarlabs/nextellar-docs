import Link from 'next/link';

export default function NotFound() {
  return (
    <html>
      <body className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="text-gray-600 mb-6">Page not found</p>
          <Link href="/" className="text-blue-600 hover:underline">
            Go back home
          </Link>
        </div>
      </body>
    </html>
  );
}
