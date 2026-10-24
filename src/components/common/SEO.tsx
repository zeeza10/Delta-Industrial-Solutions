/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  noIndex?: boolean;
  ogType?: 'website' | 'article' | 'product';
  ogImage?: string;
  structuredData?: Record<string, any> | Array<Record<string, any>>;
}

const SITE_NAME = 'Delta Industrial Solutions';
const DEFAULT_TITLE = 'Delta Industrial Solutions | Industrial Electrical & B2B Procurement';
const DEFAULT_DESCRIPTION = 'Professional industrial electrical e-commerce and B2B procurement platform for contractors, engineers, and facility managers.';
const DEFAULT_IMAGE = '/src/assets/images/homepage_hero_industrial_1792851605594.jpg';

export const SEO: React.FC<SEOProps> = ({
  title,
  description = DEFAULT_DESCRIPTION,
  canonical,
  noIndex = false,
  ogType = 'website',
  ogImage = DEFAULT_IMAGE,
  structuredData,
}) => {
  const location = useLocation();

  useEffect(() => {
    // 1. Update document title
    const fullTitle = title 
      ? (title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`)
      : DEFAULT_TITLE;
    document.title = fullTitle;

    // Helper to update or create meta tags
    const setMetaTag = (attributeName: string, attributeValue: string, content: string) => {
      let element = document.querySelector(`meta[${attributeName}="${attributeValue}"]`) as HTMLMetaElement;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attributeName, attributeValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 2. Standard description
    setMetaTag('name', 'description', description);

    // 3. Robots tag (noindex, nofollow for admin / account pages)
    if (noIndex) {
      setMetaTag('name', 'robots', 'noindex, nofollow');
    } else {
      setMetaTag('name', 'robots', 'index, follow');
    }

    // 4. Open Graph tags
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://ais-dev-kwjgku6zrubg63qgirlk7t-437051685915.asia-east1.run.app';
    const currentUrl = canonical || `${origin}${location.pathname}${location.search}`;
    const absoluteImage = ogImage.startsWith('http') ? ogImage : `${origin}${ogImage}`;

    setMetaTag('property', 'og:site_name', SITE_NAME);
    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:url', currentUrl);
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:image', absoluteImage);

    // 5. Twitter Card tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', fullTitle);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', absoluteImage);

    // 6. Canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', currentUrl);

    // 7. Structured Data (JSON-LD)
    const scriptId = 'seo-structured-data';
    let scriptElement = document.getElementById(scriptId) as HTMLScriptElement;

    if (structuredData) {
      if (!scriptElement) {
        scriptElement = document.createElement('script');
        scriptElement.id = scriptId;
        scriptElement.type = 'application/ld+json';
        document.head.appendChild(scriptElement);
      }
      scriptElement.textContent = JSON.stringify(structuredData);
    } else if (scriptElement) {
      scriptElement.remove();
    }

    return () => {
      // Clean up structured data on unmount if appropriate
    };
  }, [title, description, canonical, noIndex, ogType, ogImage, structuredData, location.pathname, location.search]);

  return null;
};
