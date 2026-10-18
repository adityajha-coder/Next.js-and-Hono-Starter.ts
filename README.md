# Next.js + Hono Starter (Template)

This is a Full-Stack project setup with  Next.js, TypeScript, Shadcn and Hono.

---

## Quick Start

### 1. Create your project

```bash
# Using GitHub CLI
gh repo create my-app --template adityajha-coder/Next.js-and-Hono-Starter.ts --clone

# Or standard clone
git clone https://github.com/adityajha-coder/Next.js-and-Hono-Starter.ts.git my-app
cd my-app
```

### 2. Install and run

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```text
server/          # Hono backend routes and RPC entrypoint
src/
  app/           # Next.js App Router & API bridge (api/[[...route]])
  components/ui/ # shadcn/ui components
  lib/           # Hono RPC client (honoClient.ts) & utils
```

---

## Scripts

- `pnpm dev` — Start development server
- `pnpm build` — Build production bundle
- `pnpm type-check` — Run TypeScript compiler check
- `pnpm lint` — Run ESLint
