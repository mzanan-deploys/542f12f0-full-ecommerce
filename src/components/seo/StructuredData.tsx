import { seoConfig } from '@/config/seo';

interface StructuredDataProps {
  type: 'organization' | 'website' | 'product' | 'breadcrumb';
  data?: any;
}

export function StructuredData({ type, data }: StructuredDataProps) {
  let structuredData: any = {};

  switch (type) {
    case 'organization':
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: seoConfig.organization.name,
        url: seoConfig.organization.url,
        logo: `${seoConfig.siteUrl}${seoConfig.organization.logo}`,
        description: seoConfig.organization.description,
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: seoConfig.organization.contactPoint.telephone,
          contactType: seoConfig.organization.contactPoint.contactType,
          email: seoConfig.organization.contactPoint.email,
        },
        sameAs: seoConfig.organization.sameAs,
      };
      break;

    case 'website':
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: seoConfig.siteName,
        url: seoConfig.siteUrl,
        description: seoConfig.defaultDescription,
        publisher: {
          '@type': 'Organization',
          name: seoConfig.organization.name,
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: `${seoConfig.siteUrl}/search?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      };
      break;

    case 'product':
      if (data) {
        structuredData = {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: data.name,
          description: data.description,
          image: data.images?.map((img: any) => img.image_url) || [],
          brand: {
            '@type': 'Brand',
            name: data.brand || seoConfig.organization.name,
          },
          offers: {
            '@type': 'Offer',
            price: data.price,
            priceCurrency: 'USD',
            availability: data.is_active ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            seller: {
              '@type': 'Organization',
              name: seoConfig.organization.name,
            },
          },
          category: data.category?.name,
        };
      }
      break;

    case 'breadcrumb':
      if (data && data.items) {
        structuredData = {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: data.items.map((item: any, index: number) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: `${seoConfig.siteUrl}${item.url}`,
          })),
        };
      }
      break;
  }

  if (Object.keys(structuredData).length === 0) {
    return null;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  );
}

export function OrganizationStructuredData() {
  return <StructuredData type="organization" />;
}

export function WebsiteStructuredData() {
  return <StructuredData type="website" />;
}

export function ProductStructuredData({ product }: { product: any }) {
  return <StructuredData type="product" data={product} />;
}

export function BreadcrumbStructuredData({ items }: { items: Array<{ name: string; url: string }> }) {
  return <StructuredData type="breadcrumb" data={{ items }} />;
} 