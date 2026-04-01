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
        imageSrc: "/images/Enkelslipadeung.png",
        priceKey: 'glass_single',
        nextStep: 'usage'
      },
      {
        title: "Progressiva glas",
        description: "Glas med flera styrkor. Korrigerar synfel för avstånd och nära",
        imageSrc: "/images/Progressivaaldre.png",
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
        imageSrc: '/images/VaraEgnaGlasmarken.jpg',
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
        description: 'Tunnare och lättare glas.',
        infoTitle: 'Glas 1.6 – bra att veta',
        infoText:
          "Vad siffrorna betyder\n- 1.6 = brytningsindex (hur mycket materialet böjer ljus)\n\nTjocklek och estetik\n- Bra standardval\n- 1.67 kan bli märkbart tunnare vid högre styrkor\n\nVikt\n- Beror mest på styrka och bågens storlek\n\nBågens storlek spelar roll\n- Större båge = tjockare glas\n- Mindre båge kan göra stor skillnad\n\nPlus vs minus\n- Minus: ofta tjockare kant\n- Plus: ofta tjockare i mitten\n\nSmart rekommendation\n- Välj 1.6 om du vill ha ett starkt pris/prestanda‑val vid lägre–medelhöga styrkor\n\nBegränsningar\n- Vissa tillval/kombinationer kan vara begränsade beroende på sortiment",
        imageSrc: '/images/Glas16.png',
        priceKey: 'lens_1_6',
        nextStep: 'treatment',
        recommendMinSphere: 2,
        recommendMaxSphere: 4
      },
      {
        title: 'Glas 1.67',
        description: 'Ännu tunnare och lättare glas.',
        infoTitle: 'Glas 1.67 – bra att veta',
        infoText:
          "Vad siffrorna betyder\n- 1.67 = brytningsindex (högre index kan ge tunnare glas)\n\nTjocklek och estetik\n- Ofta valt för att minska synlig tjocklek (kant/centrum)\n\nVikt\n- Beror mest på styrka och bågens storlek\n- Tunnare glas kan upplevas smidigare\n\nBågens storlek spelar roll\n- Stor båge + hög styrka = mer tjocklek\n- 1.67 hjälper, men mindre båge kan hjälpa ännu mer\n\nPlus vs minus\n- Minus: ofta tjockare kant\n- Plus: ofta tjockare i mitten\n\nSmart rekommendation\n- Välj 1.67 om du vill prioritera tunnhet/estetik vid medelhöga–höga styrkor\n\nBegränsningar\n- Vissa tillval kan vara begränsade beroende på sortiment – vi guidar dig om något inte går att kombinera",
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
        imageSrc: '/images/FullstandingBehandling.png',
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
        imageSrc: "/images/ofargadlens.png",
        priceKey: 'tint_none',
        nextStep: 'summary'
      },
      {
        title: "Färgade glas",
        description: "Välj typ av toning – helfärg, gradal, heltoning eller polariserad – och sedan färg.",
        imageSrc: "/images/fargadlens.png",
        nextStep: 'coloredGlassType'
      },
      {
        title: "Färgskiftande glas",
        description: "Klara inomhus – mörknar i UV‑ljus.",
        infoTitle: "Så fungerar färgskiftande glas",
        infoText:
          "Fotokromatiska glas är klara inomhus och mörknar av UV‑strålning. Mörkhet och hur snabbt de skiftar påverkas av temperatur – i kyla blir de oftast mörkare och i värme skiftar de ofta långsammare. Bakom vindruta (där mycket UV filtreras bort) kan effekten bli svagare.",
        imageSrc: "/images/ofargadlens.png",
        imageSrcDark: "/images/ofargadlens.png",
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
        imageSrc: "/images/fargadlens.png",
        nextStep: 'solidColorCategory'
      },
      {
        title: "Gradal",
        description: "Tonas successivt – mörkare upptill, ljusare nedtill.",
        imageSrc: "/images/lens-brown-25-10.png",
        nextStep: 'gradientColorCategory'
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
        imageSrc: "/images/lens-solid-brown-85.png",
        nextStep: 'colorSelection',
        priceKey: 'sunglass_polarized'
      }
    ]
  },
  {
    id: 'gradientColorCategory',
    title: 'Välj färgkategori',
    showBackButton: true,
    backStep: null,
    options: [
      {
        title: 'Standardfärger',
        description: 'Välj mellan våra vanligaste färger.',
        imageSrc: '/images/lens-brown-85-40.png',
        nextStep: 'gradientTintSelection'
      },
      {
        title: 'Modefärger',
        description: 'Välj mellan säsongens nyheter.',
        badgeText: 'Nyhet',
        imageSrc: '/images/lens-fashion-lagoon-80-10.png',
        nextStep: 'gradientFashionSelection'
      }
    ]
  },
  {
    id: 'gradientFashionSelection',
    title: 'Välj modefärg',
    showBackButton: true,
    backStep: null,
    options: [
      {
        title: 'Lagoon 80-10%',
        description: '80% tonat upptill och 10% nedtill.',
        imageSrc: '/images/lens-fashion-lagoon-80-10.png',
        nextStep: 'summary',
        internalColorId: 'G72'
      },
      {
        title: 'Oak 80-10%',
        description: '80% tonat upptill och 10% nedtill.',
        imageSrc: '/images/lens-fashion-oak-80-10.png',
        nextStep: 'summary',
        internalColorId: 'G71'
      },
      {
        title: 'Grape 80-10%',
        description: '80% tonat upptill och 10% nedtill.',
        imageSrc: '/images/lens-fashion-grape-80-10.png',
        nextStep: 'summary',
        internalColorId: 'G70'
      },
      {
        title: 'Beach 45-20%',
        description: '45% tonat upptill och 20% nedtill.',
        imageSrc: '/images/lens-fashion-beach-45-20.png',
        nextStep: 'summary',
        internalColorId: 'G73'
      },
      {
        title: 'Violet 65-20%',
        description: '65% tonat upptill och 20% nedtill.',
        imageSrc: '/images/lens-fashion-violet-65-20.png',
        nextStep: 'summary',
        internalColorId: 'G74'
      },
      {
        title: 'Cherry 85-30%',
        description: '85% tonat upptill och 30% nedtill.',
        imageSrc: '/images/lens-fashion-cherry-85-30.png',
        nextStep: 'summary',
        internalColorId: 'G75'
      }
    ]
  },
  {
    id: 'solidColorCategory',
    title: 'Välj färgkategori',
    showBackButton: true,
    backStep: null,
    options: [
      {
        title: 'Standardfärger',
        description: 'Välj mellan våra vanligaste färger.',
        imageSrc: '/images/lens-solid-grey-85.png',
        nextStep: 'colorSelection'
      },
      {
        title: 'Modefärger',
        description: 'Välj mellan säsongens nyheter.',
        badgeText: 'Nyhet',
        imageSrc: '/images/lens-fashion-lagoon-70.png',
        nextStep: 'fashionColorSelection'
      }
    ]
  },
  {
    id: 'fashionColorSelection',
    title: 'Välj modefärg',
    showBackButton: true,
    backStep: null,
    options: [
      { title: 'Lagoon 70%', imageSrc: '/images/lens-fashion-lagoon-70.png', nextStep: 'summary', internalColorId: 'F72' },
      { title: 'Oak 70%', imageSrc: '/images/lens-fashion-oak-70.png', nextStep: 'summary', internalColorId: 'F71' },
      { title: 'Grape 70%', imageSrc: '/images/lens-fashion-grape-70.png', nextStep: 'summary', internalColorId: 'F70' },
      { title: 'Ocean 73%', imageSrc: '/images/lens-fashion-ocean-73.png', nextStep: 'summary', internalColorId: 'F78' },
      { title: 'Berry 55%', imageSrc: '/images/lens-fashion-berry-55.png', nextStep: 'summary', internalColorId: 'F79' },
      { title: 'Rose 30%', imageSrc: '/images/lens-fashion-rose-30.png', nextStep: 'summary', internalColorId: 'F93' },
      { title: 'Peach 30%', imageSrc: '/images/lens-fashion-peach-30.png', nextStep: 'summary', internalColorId: 'F81' },
      { title: 'Sky 25%', imageSrc: '/images/lens-fashion-sky-25.png', nextStep: 'summary', internalColorId: 'F80' },
      { title: 'Lime 37%', imageSrc: '/images/lens-fashion-lime-37.png', nextStep: 'summary', internalColorId: 'F97' }
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
        priceKey: 'tint_12percent',
        internalIdByColor: {
          Brun: 'HT1BR',
          Grå: 'HT1GR',
          Grön: 'HT1GN',
          Blå: 'HT1BL'
        }
      },
      {
        title: "20% toning",
        description: "Mellanmörk toning, balanserad för de flesta miljöer.",
        imageSrc: "/images/Heltonade.png",
        nextStep: 'colorSelection',
        priceKey: 'tint_20percent',
        internalIdByColor: {
          Brun: 'HT2BR',
          Grå: 'HT2GR',
          Grön: 'HT2GN',
          Blå: 'HT2BL'
        }
      },
      {
        title: "65% toning",
        description: "Kraftig toning, för ljusstarka miljöer.",
        imageSrc: "/images/Heltonade.png",
        nextStep: 'colorSelection',
        priceKey: 'tint_65percent',
        internalIdByColor: {
          Brun: 'HT6BR',
          Grå: 'HT6GR',
          Grön: 'HT6GN',
          Blå: 'HT6BL'
        }
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
        imageSrc: "/images/lens-grey-25-10.png",
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
        imageSrc: "/images/lens-grey-75-10.png",
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
        imageSrc: "/images/lens-grey-85-40.png",
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
    infoTitle: "Så fungerar färgskiftande glas",
    infoText:
      "Fotokromatiska glas är klara inomhus och mörknar av UV‑strålning. Mörkhet och hur snabbt de skiftar påverkas av temperatur – i kyla blir de oftast mörkare och i värme skiftar de ofta långsammare. Bakom vindruta (där mycket UV filtreras bort) kan effekten bli svagare.",
    options: [
      {
        title: "Grå 8-88%",
        description: "Klara inomhus – mörknar i UV‑ljus.",
        imageSrc: "/images/ofargadlens.png",
        imageSrcDark: "/images/lens-photochromic-smokey-grey-8-88.png",
        nextStep: 'summary',
        priceKey: 'photochromic_black',
        internalColorId: 'Y3'
      },
      {
        title: "Grön 8-88%",
        description: "Klara inomhus – mörknar i UV‑ljus.",
        imageSrc: "/images/ofargadlens.png",
        imageSrcDark: "/images/lens-photochromic-pilot-green-8-88.png",
        nextStep: 'summary',
        priceKey: 'photochromic_green',
        internalColorId: 'N3'
      },
      {
        title: "Brun 8-88%",
        description: "Klara inomhus – mörknar i UV‑ljus.",
        imageSrc: "/images/ofargadlens.png",
        imageSrcDark: "/images/lens-photochromic-chestnut-brown-8-88.png",
        nextStep: 'summary',
        priceKey: 'photochromic_brown',
        internalColorId: 'B3'
      },
      {
        title: "Blå 8-88%",
        description: "Klara inomhus – mörknar i UV‑ljus.",
        imageSrc: "/images/ofargadlens.png",
        imageSrcDark: "/images/lens-photochromic-steel-blue-8-88.png",
        nextStep: 'summary',
        priceKey: 'photochromic_blue',
        internalColorId: 'L3'
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
        title: "Brun",
        imageSrc: "/images/lens-solid-brown-85.png",
        nextStep: 'summary',
      },
      {
        title: "Grå",
        imageSrc: "/images/lens-solid-grey-85.png",
        nextStep: 'summary',
      },
      {
        title: "Grön",
        imageSrc: "/images/lens-solid-green-85.png",
        nextStep: 'summary',
      },
      {
        title: "Blå",
        imageSrc: "/images/lens-solid-blue-85.png",
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
        imageSrcByColor: {
          Brun: "/images/lens-solid-brown-12.png",
          Grå: "/images/lens-solid-grey-12.png",
          Grön: "/images/lens-solid-green-12.png",
          Blå: "/images/lens-solid-blue-12.png"
        },
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
        imageSrcByColor: {
          Brun: "/images/lens-solid-brown-20.png",
          Grå: "/images/lens-solid-grey-20.png",
          Grön: "/images/lens-solid-green-20.png",
          Blå: "/images/lens-solid-blue-20.png"
        },
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
        imageSrcByColor: {
          Brun: "/images/lens-solid-brown-65.png",
          Grå: "/images/lens-solid-grey-65.png",
          Grön: "/images/lens-solid-green-65.png",
          Blå: "/images/lens-solid-blue-65.png"
        },
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
        imageSrc: "/images/Heltonade.png",
        imageSrcByColor: {
          Brun: "/images/lens-solid-brown-75.png",
          Grå: "/images/lens-solid-grey-75.png",
          Grön: "/images/lens-solid-green-75.png",
          Blå: "/images/lens-solid-blue-75.png"
        },
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
        imageSrc: "/images/Heltonade.png",
        imageSrcByColor: {
          Brun: "/images/lens-solid-brown-85.png",
          Grå: "/images/lens-solid-grey-85.png",
          Grön: "/images/lens-solid-green-85.png",
          Blå: "/images/lens-solid-blue-85.png"
        },
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
        imageSrc: '',
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