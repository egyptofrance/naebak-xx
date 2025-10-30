import { withContentCollections } from "@content-collections/next";
import createWithBundleAnalyzer from "@next/bundle-analyzer";
// import { withSentryConfig } from "@sentry/nextjs";
import { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { PHASE_DEVELOPMENT_SERVER } from "next/dist/shared/lib/constants";

const withNextIntl = createNextIntlPlugin();

const withBundleAnalyzer = createWithBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
  openAnalyzer:
    process.env.ANALYZE === "true" && process.env.OPEN_ANALYZER === "true",
});

export default async function config(
  phase: string,
  defaults: { defaultConfig: NextConfig },
) {
  const nextConfig: NextConfig = {
    pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
    images: {
      remotePatterns: [
        {
          protocol: "https",
          hostname: "placehold.co",
          port: "",
          pathname: "/**",
        },
        {
          protocol: "http",
          hostname: "localhost",
          port: "",
          pathname: "/**",
        },
        {
          protocol: "http",
          hostname: "localhost",
          port: "3000",
          pathname: "/**",
        },
        {
          protocol: "http",
          hostname: "localhost",
          port: "54321",
          pathname: "/**",
        },
        {
          protocol: "https",
          hostname: "*.supabase.co",
          port: "",
          pathname: "/**",
        },
        {
          protocol: "https",
          hostname: "*.supabase.com",
          port: "",
          pathname: "/**",
        },
        {
          protocol: "https",
          hostname: "*.gravatar.com",
          port: "",
          pathname: "/**",
        },
        {
          protocol: "https",
          hostname: "images.unsplash.com",
          port: "",
          pathname: "/**",
        },
        {
          protocol: "https",
          hostname: "github.com",
          port: "",
          pathname: "/**",
        },
        {
          protocol: "https",
          hostname: "oaidalleapiprodscus.blob.core.windows.net",
          port: "",
          pathname: "/**",
        },
      ],
      // تحسينات الصور
      formats: ["image/avif", "image/webp"],
      minimumCacheTTL: 60,
      deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
      imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    },

    reactStrictMode: true,
    
    // تحسينات الأداء
    compress: true,
    poweredByHeader: false,
    
    // تحسين Bundle
    swcMinify: true,
    
    // تحسين Production Build
    productionBrowserSourceMaps: false,
    
    turbo: {
      rules: {
        "*.svg": {
          loaders: ["@svgr/webpack"],
          as: "*.js",
        },
      },
    },
    
    experimental: {
      authInterrupts: true,
      // تحسين الأداء
      optimizePackageImports: [
        "@/components",
        "@/utils",
        "lucide-react",
        "@radix-ui/react-icons",
      ],
      // تحسين Server Actions
      serverActions: {
        bodySizeLimit: "2mb",
      },
    },
    
    eslint: {
      ignoreDuringBuilds: true,
    },
    
    // Webpack optimizations
    webpack: (config, { dev, isServer }) => {
      // تحسين Production Build
      if (!dev && !isServer) {
        config.optimization = {
          ...config.optimization,
          moduleIds: "deterministic",
          runtimeChunk: "single",
          splitChunks: {
            chunks: "all",
            cacheGroups: {
              default: false,
              vendors: false,
              // Vendor chunk
              vendor: {
                name: "vendor",
                chunks: "all",
                test: /node_modules/,
                priority: 20,
              },
              // Common chunk
              common: {
                name: "common",
                minChunks: 2,
                chunks: "all",
                priority: 10,
                reuseExistingChunk: true,
                enforce: true,
              },
              // React/Next.js chunk
              framework: {
                name: "framework",
                test: /[\\/]node_modules[\\/](react|react-dom|next)[\\/]/,
                priority: 40,
                enforce: true,
              },
              // UI Libraries chunk
              ui: {
                name: "ui",
                test: /[\\/]node_modules[\\/](@radix-ui|lucide-react|framer-motion|react-spring)[\\/]/,
                priority: 30,
                enforce: true,
              },
            },
          },
        };
      }
      
      return config;
    },
  };
  
  if (phase === PHASE_DEVELOPMENT_SERVER) {
    // If you want to use sentry, uncomment the following line
    // nextConfig.sentry = {
    //   hideSourceMaps: false,
    // };
    nextConfig.logging = {
      fetches: {
        fullUrl: true,
      },
    };
  }

  const modifiedConfig = await withContentCollections(
    withBundleAnalyzer(withNextIntl(nextConfig)),
  );

  // If you want to use sentry, uncomment the following line
  // return withSentryConfig(modifiedConfig);
  return modifiedConfig;
}
