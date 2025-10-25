const nextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true,
    ppr: true
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com"
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      }
    ]
  }
};

export default nextConfig;
