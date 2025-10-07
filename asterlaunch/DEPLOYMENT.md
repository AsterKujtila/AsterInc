# 🚀 AsterLaunch Deployment Guide

This guide walks you through deploying AsterLaunch to production.

## 📋 Pre-Deployment Checklist

### Smart Contract
- [ ] All tests passing (`cargo test`)
- [ ] Security audit completed
- [ ] Bonding curve parameters finalized
- [ ] Fee structure confirmed
- [ ] Graduation threshold set
- [ ] Program optimized (`cargo build-bpf --release`)

### Frontend
- [ ] Environment variables configured
- [ ] RPC endpoint selected (mainnet)
- [ ] Program ID updated
- [ ] Images and assets optimized
- [ ] Build successful (`npm run build`)
- [ ] SEO metadata added

### Infrastructure
- [ ] Domain name registered
- [ ] SSL certificate obtained
- [ ] CDN configured
- [ ] Monitoring setup
- [ ] Backup strategy defined

## 🔧 Smart Contract Deployment

### Step 1: Prepare Deployment Wallet

```bash
# Create new keypair for deployment (or use existing)
solana-keygen new --outfile ~/.config/solana/asterlaunch-deployer.json

# Check balance
solana balance

# Fund wallet (mainnet requires real SOL)
# Devnet: solana airdrop 2
# Mainnet: Transfer SOL from exchange
```

### Step 2: Build Program

```bash
cd solana-program

# Build optimized program
cargo build-bpf --release

# Verify build
ls -lh target/deploy/asterlaunch_program.so

# Should be < 200KB for cost efficiency
```

### Step 3: Deploy to Devnet (Testing)

```bash
# Configure for devnet
solana config set --url devnet
solana config set --keypair ~/.config/solana/asterlaunch-deployer.json

# Deploy
solana program deploy target/deploy/asterlaunch_program.so

# Save the Program ID!
# Example output: Program Id: 7vK8X9uJmJ...
```

### Step 4: Test on Devnet

```bash
# Update frontend .env with devnet Program ID
echo "NEXT_PUBLIC_ASTERLAUNCH_PROGRAM_ID=YourDevnetProgramId" > .env.local
echo "NEXT_PUBLIC_SOLANA_NETWORK=devnet" >> .env.local

# Test all features:
# 1. Create a test token
# 2. Buy tokens
# 3. Sell tokens
# 4. Test graduation (if possible)
```

### Step 5: Deploy to Mainnet

```bash
# ⚠️ CRITICAL: Only after thorough testing!

# Configure for mainnet
solana config set --url mainnet-beta

# Check balance (deployment costs ~2-5 SOL)
solana balance

# Deploy
solana program deploy target/deploy/asterlaunch_program.so

# Save the MAINNET Program ID!
```

### Step 6: Initialize Platform

```bash
# Create initialization transaction
# This sets up the platform config account

# Using Solana CLI:
solana program invoke <PROGRAM_ID> \
  --instruction-data <ENCODED_INIT_DATA> \
  --accounts <ACCOUNT_LIST>

# Or use custom script (recommended)
# See: scripts/initialize-platform.ts
```

## 🌐 Frontend Deployment

### Option A: Vercel (Recommended)

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel --prod

# 4. Set environment variables in Vercel dashboard:
# - NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
# - NEXT_PUBLIC_SOLANA_RPC_URL=https://your-rpc.com
# - NEXT_PUBLIC_ASTERLAUNCH_PROGRAM_ID=YourMainnetProgramId
```

### Option B: Custom VPS

```bash
# 1. Build production bundle
npm run build

# 2. Copy to server
scp -r .next/ package.json next.config.mjs user@your-server:/var/www/asterlaunch/

# 3. SSH into server
ssh user@your-server

# 4. Install dependencies and start
cd /var/www/asterlaunch
npm install --production
npm start

# 5. Setup Nginx reverse proxy (port 3000 -> 80/443)
# 6. Configure SSL with Let's Encrypt
```

### Option C: Docker

```dockerfile
# Create Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]
```

```bash
# Build and run
docker build -t asterlaunch .
docker run -p 3000:3000 -e NEXT_PUBLIC_PROGRAM_ID=YourProgramId asterlaunch
```

## 🔒 Security Post-Deployment

### 1. Transfer Program Upgrade Authority

```bash
# Transfer to multisig or burn (permanent)
solana program set-upgrade-authority <PROGRAM_ID> \
  --new-upgrade-authority <MULTISIG_ADDRESS>

# Or disable upgrades permanently (⚠️ irreversible!)
solana program set-upgrade-authority <PROGRAM_ID> --final
```

### 2. Setup Monitoring

```typescript
// Setup alerts for:
- Large transactions (> 100 SOL)
- Unusual trading patterns
- Smart contract errors
- Failed transactions spike
- Platform treasury balance
```

### 3. Rate Limiting

```typescript
// Implement rate limiting on frontend
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

## 📊 Post-Launch Checklist

### Immediate (First 24 Hours)
- [ ] Monitor smart contract interactions
- [ ] Watch for unusual transactions
- [ ] Check error logs
- [ ] Verify fee collection
- [ ] Test wallet connections
- [ ] Monitor website performance

### Short-Term (First Week)
- [ ] Collect user feedback
- [ ] Monitor gas/transaction costs
- [ ] Analyze token creation patterns
- [ ] Check graduation mechanism
- [ ] Review trading volumes
- [ ] Optimize RPC usage

### Ongoing
- [ ] Weekly security reviews
- [ ] Monthly platform statistics
- [ ] User growth tracking
- [ ] Feature requests log
- [ ] Performance optimization
- [ ] Community management

## 🐛 Troubleshooting

### Program Deployment Fails

```bash
# Error: Insufficient funds
# Solution: Add more SOL to deployer wallet

# Error: Account already exists
# Solution: Use --upgrade flag
solana program deploy --upgrade-authority <KEYPAIR> target/deploy/asterlaunch_program.so

# Error: Program too large
# Solution: Optimize program size
cargo build-bpf --release -- -C opt-level=z
```

### Frontend Build Fails

```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build

# Check for TypeScript errors
npm run lint
```

### RPC Connection Issues

```typescript
// Use fallback RPC endpoints
const endpoints = [
  'https://api.mainnet-beta.solana.com',
  'https://solana-api.projectserum.com',
  'https://your-custom-rpc.com',
];

// Implement retry logic
async function connectWithRetry(endpoints) {
  for (const endpoint of endpoints) {
    try {
      const connection = new Connection(endpoint);
      await connection.getSlot();
      return connection;
    } catch (e) {
      console.log(`Failed to connect to ${endpoint}, trying next...`);
    }
  }
  throw new Error('All RPC endpoints failed');
}
```

## 📈 Performance Optimization

### Smart Contract
```bash
# Optimize program size
cargo build-bpf --release -- -C opt-level=z -C lto=fat

# Minimize compute units
# - Reduce account iterations
# - Use efficient data structures
# - Minimize CPI calls
```

### Frontend
```typescript
// Enable Next.js optimizations
module.exports = {
  swcMinify: true,
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};

// Use SWR for data fetching
import useSWR from 'swr';

const { data } = useSWR('/api/tokens', fetcher, {
  refreshInterval: 5000,
  revalidateOnFocus: false,
});
```

## 🌟 Production Recommendations

### RPC Providers (Choose One)
- **QuickNode**: Reliable, fast, paid
- **Alchemy**: Good free tier, scalable
- **Triton**: Solana-specific, optimized
- **Helius**: Advanced features, WebSocket support
- **GenesysGo**: Community-focused

### Infrastructure
- **CDN**: Cloudflare for global distribution
- **Database**: PostgreSQL for analytics (optional)
- **Caching**: Redis for rate limiting
- **Monitoring**: Datadog or New Relic
- **Error Tracking**: Sentry

### Security Services
- **Audit**: CertiK, Quantstamp, or Trail of Bits
- **Bug Bounty**: Immunefi or HackerOne
- **Insurance**: Consider protocol insurance

## 📞 Support & Maintenance

### Emergency Contacts
- Lead Developer: [Your Contact]
- Security Team: [Security Contact]
- Infrastructure: [DevOps Contact]

### Emergency Procedures

**Smart Contract Exploit**:
1. Pause trading (if pause functionality exists)
2. Notify security team
3. Assess damage
4. Prepare fix
5. Communicate with users

**Frontend Downtime**:
1. Check hosting provider status
2. Verify RPC endpoints
3. Check DNS configuration
4. Restore from backup if needed

**Database Issues**:
1. Check connection pool
2. Verify credentials
3. Monitor query performance
4. Scale resources if needed

---

## 🎉 Launch Announcement Template

```markdown
🚀 AsterLaunch is now LIVE on Solana!

Launch your meme coin in seconds with:
✅ Instant bonding curve deployment
✅ Guaranteed liquidity
✅ Automatic DEX graduation at $69K
✅ Fair launch - no pre-mines

Try it now: https://asterlaunch.io

Built with ❤️ on Solana
```

---

**Remember**: Always test thoroughly on devnet before mainnet deployment!