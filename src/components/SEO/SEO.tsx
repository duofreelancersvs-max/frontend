import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  type?: string;
  image?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  noIndex?: boolean;
}

export const SEO = ({
  title = 'ConnectMeIndia | Hire Top Freelancers in India',
  description = 'ConnectMeIndia is the premier marketplace for hiring top talent and finding freelance jobs in India. Connect, collaborate, and build your next big project.',
  canonical,
  type = 'website',
  image = 'https://connectmeindia.com/newLogo.png',
  jsonLd,
  noIndex = false,
}: SEOProps) => {
  const siteUrl = 'https://connectmeindia.com';
  const canonicalUrl = canonical ? `${siteUrl}${canonical}` : siteUrl;

  const defaultJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'ConnectMeIndia',
    url: siteUrl,
    description,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/freelancers?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  const structuredData = jsonLd ?? defaultJsonLd;
  const jsonLdScripts = Array.isArray(structuredData) ? structuredData : [structuredData];

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      <meta name="robots" content={noIndex ? "noindex, nofollow" : "index, follow"} />

      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="ConnectMeIndia" />
      <meta property="og:locale" content="en_IN" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {jsonLdScripts.map((data, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(data)}
        </script>
      ))}
    </Helmet>
  );
};
