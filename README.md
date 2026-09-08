# Welcome to your Lovable project

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Open your project in the [Lovable editor](https://lovable.dev) and keep building.

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: connect the project to GitHub and every change made in Lovable is committed straight to your repository.
- **Full ownership**: this code is yours. Push to your repository and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS

## Interactive Skeleton

Run locally:

```bash
bun install
bun run dev   # http://localhost:8080
```

File structure:

```
src/data/bones.ts                        bone metadata + SVG geometry (single source of truth)
src/data/clinical.ts                     clinical record types for future medical data
src/components/skeleton/Bone.tsx         reusable, stateless <Bone /> (one <path> per bone)
src/components/skeleton/Skeleton.tsx     region groups; left side is a mirrored group
src/components/skeleton/SkeletonViewer.tsx  zoom / pan / tooltip wrapper
src/components/skeleton/useBoneSelection.ts selection state hook (multi-select + toggle)
src/routes/index.tsx                     example usage: search, region filter, selected list
```

Example usage:

```tsx
const { selectedIds, toggle } = useBoneSelection();

<SkeletonViewer
  selectedIds={selectedIds}
  disabledIds={[]}
  onBoneClick={(bone) => toggle(bone.id)}   // { id, name, region, side, category }
/>;
```
