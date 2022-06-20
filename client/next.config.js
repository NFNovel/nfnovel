/** @type {import('next').NextConfig} */
const nextConfig = {
  // NOTE: fix for LockExistsError: Lock already being held for file: ipfs/repo.lock
  // turn this to false
  // i dont get it but it causes everything to load twice which triggers an issue with IPFS repo lock...
  reactStrictMode: false,
  experimental: {
    externalDir: true,
  }
}

module.exports = nextConfig
