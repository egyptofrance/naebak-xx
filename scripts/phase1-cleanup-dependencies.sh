#!/bin/bash

# Phase 1: Cleanup Dependencies Script
# This script removes unused packages safely

set -e  # Exit on error

echo "🚀 Starting Phase 1: Dependencies Cleanup"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Backup package.json
echo "📦 Creating backup of package.json..."
cp package.json package.json.backup
print_success "Backup created: package.json.backup"
echo ""

# Remove unused UI libraries
echo "🎨 Removing unused UI libraries..."
pnpm remove @headlessui/react @headlessui/tailwindcss @tremor/react @remixicon/react || print_warning "Some UI packages not found"
print_success "UI libraries removed"
echo ""

# Remove duplicate/alternative libraries
echo "🔄 Removing duplicate libraries..."
pnpm remove openai-edge lodash.uniqby next-mdx-remote jwt-decode || print_warning "Some duplicate packages not found"
print_success "Duplicate libraries removed"
echo ""

# Remove unnecessary libraries
echo "🗑️  Removing unnecessary libraries..."
pnpm remove checkbox react-confetti react-confetti-explosion html2canvas jspdf react-copy-to-clipboard || print_warning "Some packages not found"
pnpm remove markdown-to-jsx micro negotiator string-similarity tippy.js || print_warning "Some packages not found"
print_success "Unnecessary libraries removed"
echo ""

# Remove dev tools from dependencies (will add back to devDependencies if needed)
echo "🛠️  Removing dev tools from dependencies..."
pnpm remove autoprefixer postcss tailwindcss-cli tw-animate-css || print_warning "Some dev tools not found"
pnpm remove concurrently cross-env env-cmd || print_warning "Some build tools not found"
print_success "Dev tools removed from dependencies"
echo ""

# Remove unused build tools
echo "🏗️  Removing unused build tools..."
pnpm remove @svgr/webpack @tailwindcss/forms @tailwindcss/postcss || print_warning "Some build tools not found"
print_success "Build tools removed"
echo ""

# Remove unused analytics/monitoring
echo "📊 Removing unused analytics..."
pnpm remove @vercel/analytics @unkey/nextjs posthog-node || print_warning "Some analytics packages not found"
print_success "Analytics packages removed"
echo ""

# Remove unused utilities
echo "🔧 Removing unused utilities..."
pnpm remove emittery encoding form-data formidable || print_warning "Some utilities not found"
pnpm remove import-in-the-middle jose jsdom node-gyp-build || print_warning "Some utilities not found"
pnpm remove p-memoize qs require-in-the-middle strip-ansi unist-util-visit || print_warning "Some utilities not found"
print_success "Utilities removed"
echo ""

# Remove unused MDX/documentation tools
echo "📝 Removing unused MDX tools..."
pnpm remove @mdx-js/loader @mdx-js/react @microflash/rehype-slugify fumadocs-mdx || print_warning "Some MDX tools not found"
pnpm remove rehype-autolink-headings rehype-parse rehype-pretty-code rehype-slug rehype-toc || print_warning "Some rehype tools not found"
pnpm remove remark-frontmatter remark-mdx-frontmatter remark-toc || print_warning "Some remark tools not found"
print_success "MDX tools removed"
echo ""

# Remove unused content management
echo "📚 Removing unused content management..."
pnpm remove @content-collections/cli @formatjs/intl-localematcher || print_warning "Some content tools not found"
print_success "Content management tools removed"
echo ""

# Remove unused Tiptap extensions
echo "✏️  Removing unused Tiptap extensions..."
pnpm remove @tiptap/suggestion tiptap-markdown || print_warning "Some Tiptap extensions not found"
print_success "Tiptap extensions removed"
echo ""

# Remove other unused packages
echo "🧹 Removing other unused packages..."
pnpm remove d3-scale events web-vitals || print_warning "Some packages not found"
pnpm remove @ai-sdk/openai || print_warning "AI SDK not found"
pnpm remove @mantine/hooks || print_warning "Mantine hooks not found"
pnpm remove inbucket-js-client || print_warning "Inbucket client not found"
print_success "Other packages removed"
echo ""

# Move @faker-js/faker to devDependencies if it exists
echo "🔄 Moving @faker-js/faker to devDependencies..."
if grep -q "@faker-js/faker" package.json; then
    pnpm remove @faker-js/faker
    pnpm add -D @faker-js/faker
    print_success "@faker-js/faker moved to devDependencies"
else
    print_warning "@faker-js/faker not found"
fi
echo ""

# Move @testing-library/react to devDependencies if it exists
echo "🔄 Moving @testing-library/react to devDependencies..."
if grep -q "@testing-library/react" package.json; then
    pnpm remove @testing-library/react
    pnpm add -D @testing-library/react
    print_success "@testing-library/react moved to devDependencies"
else
    print_warning "@testing-library/react not found"
fi
echo ""

echo "=========================================="
print_success "Phase 1 completed successfully!"
echo ""
echo "📊 Summary:"
echo "  - Unused packages removed"
echo "  - Dev dependencies moved to devDependencies"
echo "  - Backup saved: package.json.backup"
echo ""
echo "🧪 Next steps:"
echo "  1. Run: pnpm install"
echo "  2. Run: pnpm dev"
echo "  3. Test the application thoroughly"
echo "  4. If everything works: git add . && git commit -m 'chore: remove unused dependencies'"
echo "  5. If something breaks: cp package.json.backup package.json && pnpm install"
echo ""
