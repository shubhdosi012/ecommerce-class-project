# E-Commerce Inventory Management

A college AI-class project built with **Lovable** to explore an e-commerce storefront and an inventory-management interface.

- **Live demo:** https://ecommerce-inventory-management-six.vercel.app/
- **Source code:** https://github.com/shubhdosi012/ecommerce-class-project

## Project overview

The project brings together two frontend experiences:

1. **Storefront:** browse sample products and explore shopping interactions.
2. **Inventory panel:** view and manage product records in a dashboard-style interface.

This is a student demonstration project. Product and cart changes are saved in the current browser's localStorage on that device; they are not shared with a server or another browser. The project does not include real authentication, payment processing, server-side orders, or a persistent database. The contact form is a UI demo and does not send messages.

## Features

### Storefront
- Responsive product listing
- Product search and category filtering
- Product detail dialog
- Add-to-cart interactions
- Product sections and a clearly labelled demo contact form

### Inventory interface
- Product table
- Add, edit, and remove product records
- Display prices and stock quantities

## Technology

- **Lovable:** AI-assisted generation and iteration
- **React and TypeScript:** user interface
- **Vite / TanStack:** development and build tooling
- **Tailwind CSS:** styling
- **Lucide React:** icons

See [package.json](package.json) for the current dependencies and scripts.

## Run locally

Prerequisites: Node.js and Bun (the repository includes `bun.lock`).

```bash
git clone https://github.com/shubhdosi012/ecommerce-class-project.git
cd ecommerce-class-project
bun install
bun run dev
```

## Useful commands

```bash
bun run dev       # Start the development server
bun run lint      # Check code style and common issues
bun run test      # Run automated tests
bun run build     # Build the production bundle
bun run preview   # Preview the production build
```

## Learning outcomes

- Turning requirements into a user interface
- Working with reusable React components
- Building search, filtering, and cart interactions
- Organising a frontend codebase
- Using GitHub and Vercel during project development
- Understanding the difference between a frontend prototype and a production application

## Next improvements

- Keep lint, automated tests, and the production build passing in GitHub Actions
- Add real screenshots of the running application
- Add a backend only if secure authentication, payments, orders, or shared inventory are needed
- Continue testing stock and price boundaries
- Add accessibility and responsive-layout checks

## Academic context

Built with Lovable for college AI-class learning and demonstration. Features and integrations should be described as production-ready only after they have been verified.
