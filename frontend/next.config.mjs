/** @type {import('next').NextConfig} */
const nextConfig = {
  // 🟢 បន្ថែមបន្ទាត់នេះ ដើម្បីប្រាប់ Next.js ថា យើងអនុញ្ញាតឱ្យប្រើ Turbopack ដោយគ្មាន config ពិសេស
  turbopack: {},

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        buffer: false,
      };
    }
    return config;
  },
};

export default nextConfig;