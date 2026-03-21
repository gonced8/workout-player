import { readFileSync } from 'fs'
import { defineConfig } from 'vite'

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'))

/**
 * Public base path for production builds.
 * - Set VITE_BASE=/ for a custom domain at the site root (e.g. workout.goncaloraposo.com).
 * - Otherwise, on GitHub Actions, GITHUB_REPOSITORY yields /repo-name/ for *.github.io/<repo>/.
 * - Repos named *.github.io use base / at the domain root.
 * - Local `npm run build` uses / unless you set GITHUB_REPOSITORY or VITE_BASE.
 */
function publicBase(): string {
  const explicit = process.env.VITE_BASE
  if (explicit !== undefined && explicit !== '') {
    const withSlash = explicit.endsWith('/') ? explicit : `${explicit}/`
    return withSlash.startsWith('/') ? withSlash : `/${withSlash}`
  }

  const repo = process.env.GITHUB_REPOSITORY?.split('/')[1]
  if (!repo) return '/'
  if (repo.endsWith('.github.io')) return '/'
  return `/${repo}/`
}

export default defineConfig({
  base: publicBase(),
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  build: {
    outDir: 'dist',
  },
})
