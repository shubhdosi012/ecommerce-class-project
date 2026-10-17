# E-Commerce Inventory Management System

A responsive e-commerce storefront and inventory-management dashboard created as a college AI-class project using **Lovable** and a modern React-based frontend workflow.

**Live demo:** https://ecommerce-inventory-management-six.vercel.app/  
**Source code:** https://github.com/shubhdosi012/ecommerce-inventory-management

> **Project status:** Student project / demonstration. The current project brief uses sample product and inventory data. Do not assume production payments, authentication, or a connected backend unless those are added and tested.

## Project preview

![Storefront hero artwork](src/assets/hero.jpg)

*This is the hero image asset used by the storefront, not a screenshot of the full application.*

## Project overview

The project explores two connected experiences:

1. **Customer storefront** — browse products and explore a shopping-style interface.
2. **Inventory management panel** — view and manage product records in a dashboard-style interface.

The goal is to practise turning a product idea into a clear, responsive web experience and to learn how frontend components, state, layouts, and data views fit together.

## Key features

### Storefront
- Responsive single-page shopping experience
- Product listing with sample product data
- Product search
- Category filtering
- Add-to-cart interactions
- Product details popup
- Contact section and footer

### Inventory dashboard
- Product inventory table
- Add product records
- Edit product details
- Delete product records
- Track displayed stock quantities
- Manage displayed product prices

**Data note:** The repository brief describes dummy/sample product and inventory data. Verify persistence behaviour before presenting this as a database-backed inventory system.

## Technology stack

- **Lovable** — AI-assisted project generation and iteration
- **React** — component-based user interface
- **TypeScript** — typed JavaScript
- **Vite / TanStack tooling** — development and build workflow
- **Tailwind CSS** — styling utilities
- **Lucide React** — icons

The exact dependencies and scripts are maintained in [package.json](package.json).

## Run locally

Prerequisites: Node.js and npm.

```bash
git clone https://github.com/shubhdosi012/ecommerce-inventory-management.git
cd ecommerce-inventory-management
npm install
npm run dev
```

Open the local URL printed by the development server.

## Useful commands

```bash
npm run dev       # Start the development server
npm run build     # Create a production build
npm run preview   # Preview the production build
npm run lint      # Run ESLint
npm test          # Run the test script
```

## Project learning outcomes

- Translating requirements into a working UI
- Building reusable React components
- Organising a frontend project
- Designing a responsive storefront and dashboard
- Implementing search, filtering and cart interactions
- Using GitHub for version control and Vercel for deployment
- Reviewing the difference between a frontend demo and a production-ready system

## Future improvements

- Connect products and stock to a persistent database
- Add secure authentication and role-based admin access
- Validate inventory changes and prevent negative stock
- Add order management and stock updates after checkout
- Add accessibility checks and automated UI tests
- Add screenshots and a short demo video
- Document any backend, API, or payment integration only after it is implemented and tested

## Academic project note

Built for learning and demonstration as part of college coursework. This README documents the intended features and known stack; it does not claim unverified production functionality.
