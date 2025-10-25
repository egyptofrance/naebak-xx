import Script from 'next/script';

export function SchemaOrg() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "نائبك",
    "url": "https://naebak.com",
    "logo": "https://naebak.com/logo-green.png",
    "description": "المنصة الأولى التي تربط النواب بأبناء دوائرهم، توثق إنجازاتهم، وتبني سيرتهم الذاتية الحقيقية أمام الشعب",
    "foundingDate": "2024",
    "foundingLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "EG",
        "addressLocality": "مصر"
      }
    },
    "sameAs": [
      "https://www.facebook.com/naebak",
      "https://twitter.com/naebak"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer support",
      "url": "https://naebak.com/ar/contact"
    }
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "نائبك",
    "url": "https://naebak.com",
    "description": "المنصة الأولى للنواب في مصر",
    "inLanguage": "ar",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://naebak.com/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <>
      <Script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <Script
        id="website-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema),
        }}
      />
    </>
  );
}

