/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: process.env.SITE_URL || 'https://docs.nextellar.dev',
    generateRobotsTxt: true,
    generateIndexSitemap: false,
    exclude: ['/api/*', '/_next/*', '/admin/*'],
    robotsTxtOptions: {
        policies: [
            {
                userAgent: '*',
                allow: '/',
            },
            {
                userAgent: '*',
                disallow: ['/api/', '/_next/', '/admin/'],
            },
        ],
        additionalSitemaps: [
            'https://docs.nextellar.dev/sitemap.xml',
        ],
    },
    transform: async (config, path) => {
        // Custom priority for important pages
        const priorities = {
            '/': 1.0,
            '/getting-started': 0.9,
            '/getting-started/installation': 0.9,
            '/getting-started/quick-start': 0.9,
            '/cli': 0.8,
            '/hooks': 0.8,
        };

        return {
            loc: path,
            changefreq: path === '/' ? 'daily' : 'weekly',
            priority: priorities[path] || 0.7,
            lastmod: new Date().toISOString(),
        };
    },
};
