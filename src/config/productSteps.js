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
        nextStep: 'glass'

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
        imageSrc: "/images/Ofargade.png",
        priceKey: 'tint_none',
        nextStep: 'glass'
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
    id: 'colorSelection',
    title: 'Välj färg',
    showBackButton: true,
    backStep: null,
    options: [
      {
        title: "Grå",
        imageSrc: "/images/Enkelslipad.png",
        nextStep: 'frame',
      },
      {
        title: "Grön",
        imageSrc: "/images/Gron.png",
        nextStep: 'frame',
      },
      {
        title: "Brun",
        imageSrc: "/images/Brun.png",
        nextStep: 'frame',
      },
      {
        title: "Blå",
        imageSrc: "/images/Bla.png",
        nextStep: 'frame',
      }
    ]
  },
  {
    id: 'glass',
    title: 'Välj glas',
    showBackButton: true,
    backStep: null,
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
      },
    ]
  },
  {
    id: 'frame',
    title: 'Välj båge',
    showBackButton: true,
    backStep: null,
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
    backStep: null,
    options: [
      {
        title: "Avstånd / Allround",
        description: "Bra i vardagen (t.ex. bilkörning, tv). Välj detta för glasögon som används hela dagen.",
        nextStep: 'prescription'
      },
      {
        title: "Läsavstånd",
        description: "Endast nära håll (t.ex. läsa en bok). Kräver en ADD (närstyrka) i ditt recept",
        nextStep: 'prescription'
      },
      {
        title: "Vet ej",
        description: "välj detta om du är osäker. Vi kollar på ditt recept och återkopplar till dig",
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
        title: 'Maila senare',
        description: 'Maila senare',
        nextStep: 'summary'
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
