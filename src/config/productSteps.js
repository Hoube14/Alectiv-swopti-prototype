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
        title: 'Lägg till manuellt / bifoga recept',
        description: 'Fyll i dina styrkor från receptet nedan, eller bifoga ett recept.',
        imageSrc: '/images/Manuellt.png',
        nextStep: null,
        opensManualForm: true
      },
      {
        title: 'Maila in senare',
        description: 'Skicka in ditt recept via e-post när du är redo.',
        imageSrc: '/images/MailaSenare.png',
        nextStep: null
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
        recommendMinSphere: 2,
        recommendMaxSphere: 4
      },
      {
        title: 'Glas 1.67',
        description: 'Tunnare glas vid medelhöga och höga styrkor. Rekommenderas för styrkor från cirka 4 och uppåt.',
        imageSrc: '/images/Glas167.png',
        priceKey: 'lens_1_67',
        nextStep: 'treatment',
        recommendMinSphere: 4,
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
        title: 'Fullständig behandling',
        description: 'Anti-reflex, repskydd och antistatisk behandling ingår i alla glas.',
        imageSrc: '/images/Standardbehandling.png',
        nextStep: null,
        priceKey: 'treatment_standard'
      },
      {
        title: 'Blåljusfilter',
        description: 'Skärmar mot blått ljus. Fullständig behandling ingår alltid — med blåljusfilter får glaset en blå restreflex.',
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
        title: "Färgade glas",
        description: "Välj typ av toning – helfärg, gradal, heltoning eller polariserad – och sedan färg.",
        imageSrc: "/images/Solglas.png",
        nextStep: 'coloredGlassType'
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
    id: 'coloredGlassType',
    title: 'Välj typ av färgade glas',
    showBackButton: true,
    backStep: null,
    options: [
      {
        title: "Helfärg",
        description: "Enhetlig färg över hela glaset. Välj färg i nästa steg.",
        imageSrc: "/images/Heltonade.png",
        nextStep: 'colorSelection'
      },
      {
        title: "Gradal",
        description: "Tonas successivt – mörkare upptill, ljusare nedtill.",
        imageSrc: "/images/Gradaltonade.png",
        nextStep: 'gradientTintSelection'
      },
      {
        title: "Heltoning",
        description: "Enhetlig toning. Välj 12%, 20% eller 65% i nästa steg.",
        imageSrc: "/images/Heltonade.png",
        nextStep: 'solidTintSelection'
      },
      {
        title: "Polariserad",
        description: "Reducerar reflexer och bländning. Välj färg i nästa steg.",
        imageSrc: "/images/Solglas.png",
        nextStep: 'colorSelection',
        priceKey: 'sunglass_polarized'
      }
    ]
  },
  {
    id: 'solidTintSelection',
    title: 'Välj heltoning',
    showBackButton: true,
    backStep: null,
    options: [
      {
        title: "12% toning",
        description: "Lätt toning, passar för ljusare miljöer.",
        imageSrc: "/images/Heltonade.png",
        nextStep: 'colorSelection',
        priceKey: 'tint_12percent'
      },
      {
        title: "20% toning",
        description: "Mellanmörk toning, balanserad för de flesta miljöer.",
        imageSrc: "/images/Heltonade.png",
        nextStep: 'colorSelection',
        priceKey: 'tint_20percent'
      },
      {
        title: "65% toning",
        description: "Kraftig toning, för ljusstarka miljöer.",
        imageSrc: "/images/Heltonade.png",
        nextStep: 'colorSelection',
        priceKey: 'tint_65percent'
      }
    ]
  },
  {
    id: 'gradientTintSelection',
    title: 'Välj gradal toning',
    showBackButton: true,
    backStep: null,
    options: [
      {
        title: "Gradal toning 25-10",
        description: "25% tonat upptill, 10% nedtill.",
        imageSrc: "/images/Gradaltonade.png",
        nextStep: 'colorSelection',
        priceKey: 'tint_gradient_25_10',
        internalIdByColor: {
          Brun: '2BR',
          Grå: '2GR',
          Grön: '2GN',
          Blå: '2BL'
        }
      },
      {
        title: "Gradal toning 75-10",
        description: "75% tonat upptill, 10% nedtill.",
        imageSrc: "/images/Gradaltonade.png",
        nextStep: 'colorSelection',
        priceKey: 'tint_gradient_75_10',
        internalIdByColor: {
          Brun: '7BR',
          Grå: '7GR',
          Grön: '7GN',
          Blå: '7BL'
        }
      },
      {
        title: "Gradal toning 85-40",
        description: "85% tonat upptill, 40% nedtill.",
        imageSrc: "/images/Gradaltonade.png",
        nextStep: 'colorSelection',
        priceKey: 'tint_gradient_85_40',
        internalIdByColor: {
          Brun: '8BR',
          Grå: '8GR',
          Grön: '8GN',
          Blå: '8BL'
        }
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
    id: 'darknessSelection',
    title: 'Välj mörkhet',
    showBackButton: true,
    backStep: null,
    options: [
      {
        title: "12% mörkhet",
        description: "Lätt toning.",
        imageSrc: "/images/Heltonade.png",
        nextStep: 'summary',
        priceKey: 'tint_12percent',
        internalIdByColor: {
          Grå: 'GR1',
          Grön: 'GN1',
          Blå: 'BL1',
          Brun: 'BR1'
        }
      },
      {
        title: "20% mörkhet",
        description: "Mellanmörk toning.",
        imageSrc: "/images/Heltonade.png",
        nextStep: 'summary',
        priceKey: 'tint_20percent',
        internalIdByColor: {
          Grå: 'GR2',
          Grön: 'GN2',
          Blå: 'BL2',
          Brun: 'BR2'
        }
      },
      {
        title: "65% mörkhet",
        description: "Kraftig toning.",
        imageSrc: "/images/Heltonade.png",
        nextStep: 'summary',
        priceKey: 'tint_65percent',
        internalIdByColor: {
          Grå: 'GR6',
          Grön: 'GN6',
          Blå: 'BL6',
          Brun: 'BR6'
        }
      },
      {
        title: "75% mörkhet",
        description: "Mycket mörk toning.",
        imageSrc: "/images/Gradaltonade.png",
        nextStep: 'summary',
        priceKey: 'tint_75percent',
        internalIdByColor: {
          Grå: 'GR7',
          Grön: 'GN7',
          Blå: 'BL7',
          Brun: 'BR7'
        }
      },
      {
        title: "85% mörkhet",
        description: "Standard för solglas (rekommenderas).",
        imageSrc: "/images/Gradaltonade.png",
        nextStep: 'summary',
        priceKey: 'tint_85percent',
        internalIdByColor: {
          Grå: 'GR8',
          Grön: 'GN8',
          Blå: 'BL8',
          Brun: 'BR8'
        }
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