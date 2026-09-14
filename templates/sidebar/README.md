# GPUIX Kit sidebar starter

Requires Bun 1.4.2 and macOS ARM64 (validated platform). GPUIX 0.7.0 / React 19.2.4 are pinned.

```sh
bun install
bun run dev
```

Release archives include a frozen lockfile and vendored UIKit tarball; use `bun install --frozen-lockfile` there. Source templates install the same version from GitHub Release.

Edit `src/app.tsx` to build your application. All components import from `@mirai/gpuix-kit`; state, persistence and service adapters belong to the consuming application. `UIKitProvider` supplies light/dark colors and `AppShell` hosts overlays.

[Component handbook](https://github.com/leyugod/GPUIX-Kit/blob/main/docs/components/index.md) · [Quick start](https://github.com/leyugod/GPUIX-Kit/blob/main/docs/getting-started.md)
