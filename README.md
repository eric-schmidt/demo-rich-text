# Rich Text Demo

A Next.js-based demo showcasing how to render Contentful Rich Text fields -- using both REST and GraphQL APIs.

## Key Files

- REST-based example: `app/blog/rest/[slug]/page.tsx`.
- GraphQL-based example: `app/blog/graphql/[slug]/page.tsx`.

## Getting Started

1. Clone this repo.
2. Using a blank space, import the example content model + content via `contentful space import --space-id [YOUR SPACE ID] --environment-id [YOUR ENVIRONMENT ID] --content-file space-export.json`.
3. Copy `.env.example` and rename to `.env.local`.
4. Add your Contentful Space ID, Environment ID, and Delivery API key to `.env.local`.
5. Install dependencies via `npm install`.
6. Run the development server via `npm run dev`.
7. Test out REST-based page by navigating to http://localhost:3000/blog/rest/[ENTRY SLUG].
8. Test out GraphQL-based page by navigating to https://localhost:3000/blog/graphql/[ENTRY SLUG].
