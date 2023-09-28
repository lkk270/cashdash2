/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['res.cloudinary.com', 'utfs.io'],
  },

  webpack: (config) => {
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      bufferutil: 'commonjs bufferutil',
    });
    config.resolve.alias['phaser3spectorjs'] = false;
    return config;
  },

  // webpack: (config, { isServer }) => {
  //   if (!isServer) {
  //     config.resolve.fallback = {
  //       fs: false, // add this line
  //       ...config.resolve.fallback,
  //     };

  //     config.resolve.alias['phaser3spectorjs'] = true;
  //   }

  //   return config;
  // },
};

module.exports = nextConfig;
