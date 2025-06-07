/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // 处理 WebSocket 相关的警告
    if (isServer) {
      config.externals.push({
        'ws': 'commonjs ws',
        'bufferutil': 'commonjs bufferutil',
        'utf-8-validate': 'commonjs utf-8-validate',
      });
    }
    
    // 忽略特定的模块解析警告
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
    };
    
    return config;
  },
  
  // 处理服务器组件外部包
  serverExternalPackages: ['@supabase/supabase-js'],
  
  // 忽略构建时的特定警告
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  }
}

module.exports = nextConfig
