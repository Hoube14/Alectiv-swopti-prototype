export default [
  {
    id: 'glassType',
    title: 'Välj glastyp',
    showBackButton: false,
    backStep: null,
    options: [
      {
        title: "Enkelslipade glas / glas utan styrka",
        description: "Glas som korrigerar ett synfel - avstånd eller nära.",
        imageSrc: "/images/Enkelslipad.png",
        priceKey: 'glass_single',
        nextStep: 'usage'
      },
      {
        title: "Progressiva glas",
        description: "Glas med flera styrkor. Korrigerar synfel för avstånd och nära",
        imageSrc: "/images/Progressiva.png",
        priceKey: 'glass_progressive',
        nextStep: 'prescription'
      }
    ]
  },
  {
    id: 'prescription',
    title: 'Lägg till dina styrkor',
    showBackButton: true,
    backStep: null,
    options: [
      {
        title: 'Lägg till manuellt',
        description: 'Fyll i dina styrkor från receptet nedan.',
        imageSrc: '/images/Manuellt.png',
        nextStep: null,
        opensManualForm: true
      },
      {
        title: 'Maila in senare',
        description: 'Skicka in ditt recept via e-post när du är redo.',
        imageSrc: '/images/MailaSenare.png',
        nextStep: null
      },
      {
        title: 'Ladda upp recept',
        description: 'Ladda upp en bild eller PDF av ditt recept (PNG, JPG eller PDF).',
        imageSrc: '/images/LaddaUppRecept.png',
        nextStep: null,
        opensUpload: true
      }
    ]
  },
  {
    id: 'lensBrand',
    title: 'Välj glasmärke',
    showBackButton: true,
    backStep: null,
    options: [
      {
        title: 'Våra egna glasmärken',
        description: 'Välj från vårt eget sortiment av glas.',
        imageSrc: '/images/VaraEgnaGlasmarken.png',
        nextStep: 'lensRecommendation'
      },
      {
        title: 'Känt märke (t.ex. Rodenstock)',
        description: 'Premium-glas från etablerade märken som Rodenstock.',
        imageSrc: '/images/KantMarke.png',
        nextStep: 'lensRecommendation'
      }
    ]
  },
  {
    id: 'lensRecommendation',
    title: 'Vi rekommenderar detta glaset',
    showBackButton: true,
    backStep: null,
    options: [
      {
        title: 'Glas 1.6',
        description: 'Tunnare och lättare glas. Rekommenderas för styrkor cirka 2 till 4.',
        imageSrc: '/images/Glas16.png',
        priceKey: 'lens_1_6',
        nextStep: 'treatment',
        minSphereToShow: 0,
        recommendMinSphere: 2,
        recommendMaxSphere: 4
      },
      {
        title: 'Glas 1.67',
        description: 'Tunnare glas vid medelhöga styrkor. Rekommenderas för styrkor cirka 4 till 6.',
        imageSrc: '/images/Glas167.png',
        priceKey: 'lens_1_67',
        nextStep: 'treatment',
        minSphereToShow: 0,
        recommendMinSphere: 4,
        recommendMaxSphere: 6
      },
      {
        title: 'Glas 1.74',
        description: 'Tunnaste glasen vid höga styrkor. Rekommenderas för styrkor över 6.',
        imageSrc: '/images/Glas174.png',
        priceKey: 'lens_1_74',
        nextStep: 'treatment',
        minSphereToShow: 6,
        recommendMinSphere: 6,
        recommendMaxSphere: Infinity
      }
    ]
  },
  {
    id: 'treatment',
    title: 'Behandling',
    showBackButton: true,
    backStep: null,
    options: [
      {
        title: 'Standardbehandling',
        description: 'Anti-reflex, respkydd och antistatisk behandling.',
        imageSrc: '/images/Standardbehandling.png',
        nextStep: 'tintSelection',
        priceKey: 'treatment_standard'
      },
      {
        title: 'Standardbehandling + blåljusfilter',
        description: 'Anti-reflex, respkydd, antistatisk behandling samt blåljusfilter som skärmar mot blått ljus.',
        imageSrc: '/images/Blaljusfilter.png',
        nextStep: 'tintSelection',
        priceKey: 'treatment_blue_light'
      }
    ]
  },
  {
    id: 'tintSelection',
    title: 'Välj toning',
    showBackButton: true,
    backStep: null,
    options: [
      {
        title: "Ofärgade glas",
        description: "I nästa steg kan du lägga till blåljusfilter som tillval.",
        imageSrc: "/images/Enkelslipad.png",
        priceKey: 'tint_none',
        nextStep: 'summary'
      },
      {
        title: "Solglas",
        description: "Välj färg och om du vill ha polariserade glas i nästa steg.",
        imageSrc: "/images/Solglas.png",
        nextStep: 'sunglassType'
      },
      {
        title: "Heltonade glas",
        description: "Välj mellan 12-65% toning i nästa steg.",
        imageSrc: "/images/Heltonade.png",
        nextStep: "solidTintSelection"
      },
      {
        title: "Gradalttonade glas",
        description: "Tonas successivt - Mörkare upptill, ljusare nedtill.",
        imageSrc: "/images/Gradaltonade.png",
        priceKey: 'tint_gradient',
        nextStep: 'gradientTintSelection'
      },
      {
        title: "Färgskiftande glas",
        description: "Klara inomhus - mörknar i solen.",
        imageSrc: "/images/Fargskiftande-light.png",
        imageSrcDark: "/images/Fargskiftande-dark.png",
        nextStep: 'photochromicColorSelection'
      }
    ]
  },
  {
    id: 'sunglassType',
    title: 'Välj solglas typ',
    showBackButton: true,
    backStep: null,
    options: [
      {
        title: "Enkelslipade solglas - ej polariserade",
        description: "Standard solglas utan polarisering.",
        imageSrc: "/images/Solglas.png",
        nextStep: 'colorSelection',
        priceKey: 'sunglass_basic',
        prevStep: 'sunglassType'
      },
      {
        title: "Enkelslipade solglas - polariserade",
        description: "Polariserade glas som reducerar reflexer och bländning.",
        imageSrc: "/images/Solglas.png",
        nextStep: 'colorSelection',
        priceKey: 'sunglass_polarized',
        prevStep: 'sunglassType'
      }
    ]
  },
  {
    id: 'solidTintSelection',
    title: 'Välj toning',
    showBackButton: true,
    backStep: null,
    options: [
      {
        title: "Enkelslipade glas - 12% heltoning",
        description: "Lätt toning, passar för ljusare miljöer.",
        imageSrc: "/images/Heltonade.png",
        nextStep: 'colorSelection',
        priceKey: 'tint_12percent',
        prevStep: 'heltonadePercent'
      },
      {
        title: "Enkelslipade glas - 20% heltoning",
        description: "Mellanmörk toning, balanserad för de flesta miljöer.",
        imageSrc: "/images/Heltonade.png",
        nextStep: 'colorSelection',
        priceKey: 'tint_20percent',
        prevStep: 'heltonadePercent'
      },
      {
        title: "Enkelslipade glas - 65% heltoning",
        description: "Kraftig toning, för ljusstarka miljöer.",
        imageSrc: "/images/Heltonade.png",
        nextStep: 'colorSelection',
        priceKey: 'tint_65percent',
        prevStep: 'heltonadePercent'
      }
    ]
  },
  {
    id: 'gradientTintSelection',
    title: 'Välj gradienttoning',
    showBackButton: true,
    backStep: null,
    options: [
      {
        title: "Enkelslipade glas - gradal toning 25-10",
        description: "25% tonat upptill, 10% nedtill.",
        imageSrc: "/images/Gradaltonade.png",
        nextStep: 'colorSelection',
        priceKey: 'tint_gradient_25_10'
      },
      {
        title: "Enkelslipade glas - gradal toning 75-10",
        description: "75% tonat upptill, 10% nedtill.",
        imageSrc: "/images/Gradaltonade.png",
        nextStep: 'colorSelection',
        priceKey: 'tint_gradient_75_10'
      },
      {
        title: "Enkelslipade glas - gradal toning 85-40",
        description: "85% tonat upptill, 40% nedtill.",
        imageSrc: "/images/Gradaltonade.png",
        nextStep: 'colorSelection',
        priceKey: 'tint_gradient_85_40'
      }
    ]
  },
  {
    id: 'photochromicColorSelection',
    title: 'Välj färg för färgskiftande glas',
    showBackButton: true,
    backStep: null,
    options: [
      {
        title: "Svarta",
        description: "Klara inomhus - mörknar i solen.",
        imageSrc: "/images/Fargskiftande-light.png",
        imageSrcDark: "/images/Fargskiftande-svart.png",
        nextStep: 'summary',
        priceKey: 'photochromic_black'
      },
      {
        title: "Gröna",
        description: "Klara inomhus - mörknar i solen.",
        imageSrc: "/images/Fargskiftande-light.png",
        imageSrcDark: "/images/Fargskiftande-gron.png",
        nextStep: 'summary',
        priceKey: 'photochromic_green'
      },
      {
        title: "Bruna",
        description: "Klara inomhus - mörknar i solen.",
        imageSrc: "/images/Fargskiftande-light.png",
        imageSrcDark: "/images/Fargskiftande-brun.png",
        nextStep: 'summary',
        priceKey: 'photochromic_brown'
      },
      {
        title: "Blåa",
        description: "Klara inomhus - mörknar i solen.",
        imageSrc: "/images/Fargskiftande-light.png",
        imageSrcDark: "/images/Fargskiftande-bla.png",
        nextStep: 'summary',
        priceKey: 'photochromic_blue'
      }
    ]
  },
  {
    id: 'colorSelection',
    title: 'Välj färg',
    showBackButton: true,
    backStep: null,
    options: [
      {
        title: "Grå",
        imageSrc: "/images/Gra.png",
        nextStep: 'summary',
      },
      {
        title: "Grön",
        imageSrc: "/images/Gron.png",
        nextStep: 'summary',
      },
      {
        title: "Brun",
        imageSrc: "/images/Brun.png",
        nextStep: 'summary',
      },
      {
        title: "Blå",
        imageSrc: "/images/Bla.png",
        nextStep: 'summary',
      }
    ]
  },
  {
    id: 'usage',
    title: 'Hur ska du använda din glasögon?',
    showBackButton: true,
    backStep: null,
    options: [
      {
        title: "Avstånd / Allround",
        description: "Bra i vardagen (t.ex. bilkörning, tv). Välj detta för glasögon som används hela dagen.",
        nextStep: null
      },
      {
        title: "Läsavstånd",
        description: "Endast nära håll (t.ex. läsa en bok). Kräver en ADD (närstyrka) i ditt recept",
        nextStep: null
      },
      {
        title: 'Utan styrkor',
        description: 'Jag behöver inte styrkor – t.ex. solglas utan styrka.',
        imageSrc: '/images/UtanStyrkor.png',
        nextStep: 'lensBrand',
        skipsPrescription: true
      }
    ]
  },
  {
    id: 'summary',
    title: 'sammanfattning',
    showBackButton: true,
    backStep: null
  }
]