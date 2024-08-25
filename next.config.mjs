/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // 以下の行を追加
    compiler: {
        styledComponents: true,
    },
    // cz-shortcut-listen 属性を無視するように設定
    experimental: {
        excludeDefaultMomentLocales: true,
    },
}

export default nextConfig;
