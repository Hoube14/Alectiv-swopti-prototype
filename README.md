# Glasses Product Selector

A Vue application for selecting and ordering glasses with dynamic pricing and Stripe integration.

## How to Run the Project Locally

### Prerequisites
- Node.js
- npm

### Installation and Setup

1. Navigate to the project directory
```bash
cd alectiv-prototype
```

2. Install dependencies
```bash
npm install
```

3. Install Stripe server dependencies (first time only)
```bash
cd stripe-server && npm install && cd ..
```

4. Configure Stripe (first time only). Copy the example env file and add your [Stripe test key](https://dashboard.stripe.com/apikeys):
```bash
cp stripe-server/.env.example stripe-server/.env
# Edit stripe-server/.env and set STRIPE_SECRET_KEY=sk_test_...
```

5. Start the app (Vite + Stripe server run together)
```bash
npm run dev
```

The app runs at `http://localhost:5173` and the Stripe API at `http://localhost:3001`. Both start from the same command.

## Project Structure
```
src/
├── components/          # Reusable components
│   ├── Card.vue        # Product selection cards
│   ├── ProgressBar.vue # Dynamic progress indicator
│   └── ShoppingCart.vue # Shopping cart with price summary
├── views/              # Main views
│   ├── Selectionpage.vue # Dynamic view for all steps
│   └── SummaryPage.vue   # Order summary
├── config/
│   └── productSteps.js # Configuration for all steps and options
├── stores/
│   └── orderStore.js   # Pinia store (order, navigation, store selection)
├── App.vue             # Root component
└── main.js             # Entry point

stripe-server/
└── server.js           # Express server for Stripe Checkout
```

## How the Widget Loads on an External Site

**NOTE: This is a work in progress (WIP) and not fully implemented yet.**

The goal was to make the application available as an embeddable widget for integration on external websites. Work included:

- Using Web Components (Custom Elements API)
- Shadow DOM for style isolation
- Vite configuration to build a standalone widget bundle

**Technical challenges remaining:**
- Shadow DOM style injection with Tailwind CSS
- Proper CSS bundling and loading in widget context
- Maintaining dual functionality (standalone app + embeddable widget)


## How Fake JSON is Used (API/Backend)

The project uses a combination of static JSON data and a backend server:

### Static Product Data (`products.json`)
- Contains store data with different currencies (SEK/EUR)
- Price modifiers for different glass types and options
- Default values for tax and shipping

### Step Configuration (`productSteps.js`)
- Defines all steps in the configurator
- Each step contains options with prices and navigation
- Data-driven approach for easy maintenance and extension

### Backend (Express + Stripe)
- Node.js Express server on port 3001
- Creates Stripe Checkout sessions with dynamic prices

**API Endpoint:**
```
POST http://localhost:3001/create-checkout
Body: { amount: [total price] }
Response: { url: [Stripe Checkout URL] }
```

## What I Would Improve in the future

### Future Improvements
- Complete the embeddable widget implementation
- Add precsription input with form validation
- Implement persistent cart (localStorage or probably database)
- Improve mobile responsiveness
- Better styling
- More robust and safe code in general
- Look for better/simpler ways to write the code

## Tech Stack

- **Frontend**: Vue.js 3 (Composition API), Tailwind CSS v4
- **Backend**: Node.js, Express
- **Payment**: Stripe Checkout
- **Build Tool**: Vite
- **State Management**: Pinia

## Architecture Decisions

### State Management
Using Pinia for shared state (order, navigation, store selection, pricing). The main store is `stores/orderStore.js`, used in `App.vue`, `Selectionpage.vue`, and `SummaryPage.vue`.

### Configuration-Driven Design
All product steps and options are defined in `productSteps.js`, making it easy to add or modify the product flow without changing component code.

### Component Reusability
The `Selectionpage.vue` component is reused for all selection steps, receiving step configuration as props for maximum flexibility.

### Dynamic Pricing
Prices update in real-time based on store selection, with support for multiple currencies and price modifiers.