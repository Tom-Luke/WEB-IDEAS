(function(){
  const org = {
    "@context": "https://schema.org",
    "@type": "HealthClub",
    "name": "TerraFlow Pilates",
    "url": "https://terraflow.example/",
    "logo": "https://terraflow.example/assets/img/brand-mark.svg",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "123 Willow Lane, Suite 2",
      "addressLocality": "Eucalypt District",
      "addressRegion": "",
      "postalCode": "",
      "addressCountry": "US"
    },
    "sameAs": [
      "https://www.instagram.com/terraflow",
      "https://www.facebook.com/terraflow"
    ],
    "description": "A boutique Pilates studio rooted in warm minimalism and natural sophistication.",
    "telephone": "+1-555-0100",
    "image": [
      "https://terraflow.example/assets/img/brand-mark.svg"
    ]
  };
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(org);
  document.head.appendChild(script);
})();
