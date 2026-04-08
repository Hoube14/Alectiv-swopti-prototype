# Glasses Product Selector

A Vue application for selecting and ordering glasses with dynamic pricing and Mollie payment integration (via the host site).

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

3. Start the app
```bash
npm run dev
```

The app runs at `http://localhost:5173`. For checkout to work when not embedded, the host must provide a create-payment URL (e.g. when embedded in GlasOnline/WordPress the theme injects the Mollie endpoint).

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
│   └── orderStore.js   # Pinia store (order, navigation, pricing)
├── App.vue             # Root component
└── main.js             # Entry point
```

## How the Widget Loads on an External Site

The Vue app can run both locally (standalone) and as an embedded widget on an external site (e.g. GlasOnline/WordPress).

**Build and deploy:**  
Run `npm run build` and copy the `dist/` output to the host site's static asset directory (e.g. `resources/product-selector/` in the GlasOnline theme). The build produces `product-selector.js`, `product-selector.css`, and chunk files. Use `npm run build:wp` to build and copy into the GlasOnline theme in one step.

**On the host site:**  
The host page includes a mount point `<div id="product-selector-app" class="product-selector-root"></div>`. When the product-selector script and stylesheet are loaded, the Vue app mounts on `#product-selector-app` and runs as usual. The host injects the payment API URL via a global such as `glasonlineProductSelector.createCheckoutUrl` (e.g. the WordPress REST endpoint for Mollie create-payment) so the app knows where to send the checkout request.

**Conditional loading:**  
Assets are only enqueued when the widget or shortcode is actually used (e.g. shortcode in post content or widget in a sidebar), so the script does not load on every page.


## How Fake JSON is Used (API/Backend)

The project uses a combination of static JSON data and a backend provided by the host:

### Static Product Data (`products.json`)
- Single store config with SEK currency
- Price modifiers for different glass types and options
- Default values for tax and shipping

### Step Configuration (`productSteps.js`)
- Defines all steps in the configurator
- Each step contains options with prices and navigation
- Data-driven approach for easy maintenance and extension

### Backend (WordPress theme / Mollie)
- When embedded in GlasOnline, the theme exposes a REST endpoint for creating a Mollie payment.
- The app POSTs amount, currency, redirectUrl, and cancelUrl; the server returns a checkout URL.

**API shape (Mollie create-payment):**
```
POST [createCheckoutUrl from host]
Body: { amount, currency, redirectUrl?, cancelUrl? }
Response: { checkoutUrl: [Mollie checkout URL] }
```

## What I Would Improve in the future

### Future Improvements
- Improve mobile responsiveness

## Tech Stack

- **Frontend**: Vue.js 3 (Composition API), Tailwind CSS v4
- **Payment**: Mollie (via host site, e.g. WordPress theme)
- **Build Tool**: Vite
- **State Management**: Pinia

## Architecture Decisions

### State Management
Using Pinia for shared state (order, navigation, pricing). The main store is `stores/orderStore.js`, used in `App.vue`, `Selectionpage.vue`, and `SummaryPage.vue`.

### Configuration-Driven Design
All product steps and options are defined in `productSteps.js`, making it easy to add or modify the product flow without changing component code.

### Component Reusability
The `Selectionpage.vue` component is reused for all selection steps, receiving step configuration as props for maximum flexibility.

### Dynamic Pricing
Prices update in real-time; all prices are in SEK with configurable price modifiers.
