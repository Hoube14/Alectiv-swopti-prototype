export default [
  {
    id: 'glassType',
    title: 'Välj glastyp',
    showBackButton: false,
    backStep: null,
    options: [
      {
        title: "Enkelslipade glas",
        description: "Glas som korrigerar ett synfel - avstånd eller nära.",
        imageSrc: "/images/Enkelslipad.png",
        priceKey: 'glass_single',
        nextStep: 'tintSelection'

      },
      {
        title: "Progressiva glas",
        description: "Glas med flera styrkor. Korrigerar synfel för avstånd och nära",
        imageSrc: "/images/Progressiva.png",
        priceKey: 'glass_progressive',
        nextStep: 'tintSelection'
      },
      {
        title: "Glas utan styrka",
        description: "Helt utan styrka. I nästa steg väljer du till exempel blåljusglas eller solglas.",
        imageSrc: "/images/Enkelslipad.png",
        priceKey: 'glass_single',
        nextStep: 'tinteSelection'

      },
      {
        title: "Terminalglas",
        description: "Enkelslipade glas avsedda för jobb framför datorn. Ger extra läs-styrka.",
        imageSrc: "/images/Terminal.png",
        nextStep: 'specialoption'

      }
    ]
  },
  {
    id: 'tintSelection',
    title: 'Välj toning',
    showBackButton: true,
    backStep: 'glassType',
    options: [
      {
        title: "Ofärgade glas",
        description: "I nästa steg kan du lägga till blåljusfilter som tillval.",
        imageSrc: "/images/Ofargade.png",
        priceKey: 'tint_none',
        nextStep: 'glass'
      },
      {
        title: "Solglas",
        description: "Välj färg och om du vill ha polariserade glas i nästa steg.",
        imageSrc: "/images/Solglas.png",
      },
      {
        title: "Heltonade glas",
        description: "Välj mellan 12-65% toning i nästa steg.",
        imageSrc: "/images/Heltonade.png",
      },
      {
        title: "Gradalttonade glas",
        description: "Tonas successivt - Mörkare upptill, ljusare nedtill.",
        imageSrc: "/images/Gradaltonade.png",
        priceKey: 'tint_gradient'
      },
      {
        title: "Färgskiftande glas",
        description: "Klara inomhus - mörknar i solen.",
        imageSrc: "/images/Fargskiftande.gif",
      }
    ]
  },
  {
    id: 'glass',
    title: 'Välj glas',
    showBackButton: true,
    backStep: 'tintSelection',
    options: [
      {
        title: "Enkelslipade glas - ofärgade",
        imageSrc: "/images/Enkelslipad.png",
        nextStep: 'frame'
      },
      {
        title: "Enkelslipade glas - blåljusfiltrerande",
        imageSrc: "/images/blafilter.webp",
        nextStep: 'frame'
      }
    ]
  },
  {
    id: 'frame',
    title: 'Välj båge',
    showBackButton: true,
    backStep: 'glass',
    options: [
      {
        title: "Standard båge",
        description: "Standard båge med lätt design.",
        priceKey: 'frame_basic',
        nextStep: "usage"
      },
      {
        title: "Premium båge",
        description: "Lyxig design med premium material",
        priceKey: 'frame_premium',
        nextStep: "usage"
      }
    ]
  },
  {
    id: 'usage',
    title: 'Hur ska du använda din glasögon?',
    showBackButton: true,
    backStep: 'frame',
    options: [
      {
        title: "Avstånd / Allround",
        description: "Bra i vardagen (t.ex. bilkörning, tv). Välj detta för glasögon som används hela dagen.",
        nextStep: 'summary'
      }
    ]
  },
  {
    id: 'summary',
    title: 'sammanfattning',
    showBackButton: true,
    backStep: 'usage'
  }
]
