# gpuixKit

A reusable native React UIKit for GPUIX, with Darwin-inspired light and dark themes. The first open-source delivery is **0.19.0**. The package is `@mirai/gpuix-kit`; it exposes TypeScript/TSX source for Bun.

This project provides components, pure interaction models and injectable adapter interfaces. Applications own their data, authentication, persistence, network requests and business services.

## Quick start

Requires Bun 1.4.2 and the fixed GPUIX 0.7.0 packages. Native release tests run in a macOS arm64 graphical session.

```sh
bun install --frozen-lockfile
bun run dev:catalog
bun run dev:table-prefs
bun run dev:sidebars
bun run check
```

For another project, copy packages/uikit into a Bun Workspace, or install the locally generated package:

```sh
bun run pack
# From your consuming project:
bun add /absolute/path/mirai-gpuix-kit-0.19.0.tgz
bun add @gpuix/react@0.7.0 react@19.2.4
```

Set TypeScript `jsx: "react-jsx"`, `jsxImportSource: "@gpuix/react"` and `moduleResolution: "Bundler"`. There is no DOM/CSS runtime and no React DOM dependency. The package has not been published to npm.

The component mapping covers 30 base, 37 application and 18 marketing categories. See [mapping](docs/untitled-ui-coverage.md) and [native contracts](packages/uikit/docs/catalog-completion.md). Local validation passed: 178 pure tests, 57 native scripts, a real macOS window, an independent package consumer and the extracted source archive. The repository is [leyugod/GPUIX-Kit](https://github.com/leyugod/GPUIX-Kit). Check Actions for remote CI results.

## Documentation

- [中文说明](README.md)
- [First-release inventory and limitations](docs/releases/0.19.0.md)
- [Package API and usage](packages/uikit/README.md)
- [Table preferences](packages/uikit/docs/table-preferences.md)
- [Host adapter contracts](packages/uikit/docs/host-adapter.md)
- [Contributing](CONTRIBUTING.md) · [Release process](docs/releasing.md)
- [MIT license](LICENSE) · [Third-party notices](THIRD_PARTY_NOTICES.md)

The release is a bounded component library, not a full macOS framework replacement. Virtualization, drag/drop, native system services, full AX/IME support and Windows/Linux native verification are not claimed. Injectable host ports return unsupported until an application supplies an implementation. Existing components and examples retain their documented limits.
