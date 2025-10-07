# 🚀 AsterLaunch Deployment Guide

This guide covers deploying AsterLaunch to production environments.

## 📋 Prerequisites

### Development Environment
- Node.js 18+ and npm/yarn
- Rust 1.70+ and Cargo
- Solana CLI 1.16+
- Anchor CLI 0.30+
- Git

### Production Requirements
- Domain name and SSL certificate
- Solana RPC endpoint (Helius, QuickNode, or Alchemy)
- CDN for static assets (optional but recommended)
- Monitoring and analytics setup

## 🏗️ Frontend Deployment

### 1. Build Optimization
```bash
cd astra-wallet

# Install dependencies
npm install

# Build for production
npm run build

# Preview build locally
npm run preview
```

### 2. Environment Configuration
Create `.env.production`:
```bash
VITE_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
VITE_PROGRAM_ID=ASTRLaunchProgramId11111111111111111111111
VITE_PLATFORM_CONFIG=YourPlatformConfigPublicKey
VITE_TREASURY_WALLET=YourTreasuryWalletPublicKey
```

### 3. Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel --prod
```

**Vercel Configuration** (`vercel.json`):
```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### 4. Netlify Deployment
```bash
# Build and deploy
npm run build
netlify deploy --prod --dir=dist
```

**Netlify Configuration** (`netlify.toml`):
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 5. Custom Server Deployment
```bash
# Build the application
npm run build

# Serve with nginx, Apache, or Node.js server
# Example nginx config:
server {
    listen 80;
    server_name asterlaunch.com;
    
    location / {
        root /var/www/asterlaunch/dist;
        try_files $uri $uri/ /index.html;
    }
}
```

## 🔗 Smart Contract Deployment

### 1. Mainnet Preparation
```bash
cd contracts

# Set Solana to mainnet
solana config set --url mainnet-beta

# Create new keypair for program (or use existing)
solana-keygen new --outfile ./deploy-keypair.json

# Fund the deployment wallet
# Transfer SOL to the deployment wallet for deployment costs
```

### 2. Program Deployment
```bash
# Build the program
anchor build

# Deploy to mainnet
anchor deploy --provider.cluster mainnet --provider.wallet ./deploy-keypair.json

# Verify deployment
solana program show <PROGRAM_ID>
```

### 3. Initialize Platform
```bash
# Create initialization script
anchor run initialize-mainnet
```

**Initialization Script** (`scripts/initialize-mainnet.ts`):
```typescript
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Asterlaunch } from "../target/types/asterlaunch";

async function initializePlatform() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Asterlaunch as Program<Asterlaunch>;
  
  const treasuryWallet = new anchor.web3.PublicKey("YOUR_TREASURY_WALLET");
  const graduationThreshold = new anchor.BN(69000 * 1e9); // $69K in lamports
  
  await program.methods
    .initializePlatform(treasuryWallet, graduationThreshold)
    .rpc();
    
  console.log("Platform initialized successfully!");
}

initializePlatform();
```

## 🔧 Configuration Management

### 1. Environment Variables
```bash
# Frontend (.env.production)
VITE_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
VITE_PROGRAM_ID=ASTRLaunchProgramId11111111111111111111111
VITE_PLATFORM_CONFIG=YourPlatformConfigPublicKey
VITE_TREASURY_WALLET=YourTreasuryWalletPublicKey
VITE_ANALYTICS_ID=your-analytics-id
VITE_SENTRY_DSN=your-sentry-dsn

# Smart Contract (Anchor.toml)
[programs.mainnet]
asterlaunch = "ASTRLaunchProgramId11111111111111111111111"

[provider]
cluster = "Mainnet"
wallet = "~/.config/solana/id.json"
```

### 2. Security Configuration
```typescript
// src/config/production.ts
export const PRODUCTION_CONFIG = {
  SOLANA_RPC_URL: process.env.VITE_SOLANA_RPC_URL!,
  PROGRAM_ID: new PublicKey(process.env.VITE_PROGRAM_ID!),
  PLATFORM_CONFIG: new PublicKey(process.env.VITE_PLATFORM_CONFIG!),
  TREASURY_WALLET: new PublicKey(process.env.VITE_TREASURY_WALLET!),
  
  // Security settings
  MAX_SLIPPAGE: 5, // 5%
  MAX_TOKEN_NAME_LENGTH: 32,
  MAX_TOKEN_SYMBOL_LENGTH: 10,
  MAX_DESCRIPTION_LENGTH: 200,
  MAX_IMAGE_SIZE: 2 * 1024 * 1024, // 2MB
  
  // Rate limiting
  RATE_LIMIT_REQUESTS: 100,
  RATE_LIMIT_WINDOW: 60 * 1000, // 1 minute
};
```

## 📊 Monitoring & Analytics

### 1. Application Monitoring
```bash
# Install Sentry for error tracking
npm install @sentry/react @sentry/tracing
```

```typescript
// src/monitoring/sentry.ts
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  integrations: [
    new BrowserTracing(),
  ],
  tracesSampleRate: 1.0,
  environment: "production",
});
```

### 2. Performance Monitoring
```typescript
// src/monitoring/performance.ts
export const trackPerformance = (metric: string, value: number) => {
  // Send to your analytics service
  gtag('event', 'timing_complete', {
    name: metric,
    value: Math.round(value)
  });
};

// Track key metrics
trackPerformance('token_creation_time', creationTime);
trackPerformance('trade_execution_time', tradeTime);
trackPerformance('page_load_time', loadTime);
```

### 3. Business Metrics
```typescript
// src/analytics/business.ts
export const trackBusinessMetric = (event: string, properties: any) => {
  // Track important business events
  analytics.track(event, {
    ...properties,
    timestamp: Date.now(),
    user_wallet: wallet.publicKey?.toString(),
  });
};

// Example usage
trackBusinessMetric('token_created', {
  token_name: tokenName,
  token_symbol: tokenSymbol,
  creation_fee: 0.02,
});

trackBusinessMetric('trade_executed', {
  token_symbol: tokenSymbol,
  trade_type: 'buy',
  sol_amount: solAmount,
  token_amount: tokenAmount,
});
```

## 🔒 Security Checklist

### Frontend Security
- [ ] All environment variables properly configured
- [ ] Content Security Policy (CSP) headers set
- [ ] HTTPS enforced with proper SSL certificate
- [ ] Input validation on all forms
- [ ] XSS protection enabled
- [ ] Rate limiting implemented
- [ ] Error messages don't leak sensitive information

### Smart Contract Security
- [ ] Program deployed with proper authority
- [ ] All instruction handlers have proper access controls
- [ ] Overflow protection enabled in Cargo.toml
- [ ] Program upgrade authority properly managed
- [ ] Treasury wallet secured with multisig
- [ ] Emergency pause functionality implemented

### Infrastructure Security
- [ ] RPC endpoints from trusted providers
- [ ] API keys properly secured
- [ ] Database connections encrypted
- [ ] Regular security updates applied
- [ ] Monitoring and alerting configured
- [ ] Backup and recovery procedures tested

## 🚀 Go-Live Checklist

### Pre-Launch
- [ ] All tests passing (frontend and contracts)
- [ ] Security audit completed
- [ ] Performance testing completed
- [ ] Load testing completed
- [ ] Monitoring and alerting configured
- [ ] Documentation updated
- [ ] Team training completed

### Launch Day
- [ ] Deploy smart contracts to mainnet
- [ ] Initialize platform configuration
- [ ] Deploy frontend to production
- [ ] Update DNS records
- [ ] Enable monitoring
- [ ] Announce launch
- [ ] Monitor for issues

### Post-Launch
- [ ] Monitor error rates and performance
- [ ] Track business metrics
- [ ] Gather user feedback
- [ ] Plan iterative improvements
- [ ] Scale infrastructure as needed

## 📈 Scaling Considerations

### Performance Optimization
- Implement CDN for static assets
- Use Redis for caching frequently accessed data
- Optimize database queries
- Implement connection pooling
- Use load balancers for high availability

### Infrastructure Scaling
- Auto-scaling groups for web servers
- Database read replicas
- Microservices architecture for complex features
- Message queues for background processing
- Container orchestration with Kubernetes

## 🆘 Troubleshooting

### Common Issues
1. **RPC Rate Limiting**: Use multiple RPC endpoints with failover
2. **Transaction Failures**: Implement retry logic with exponential backoff
3. **Wallet Connection Issues**: Handle all wallet adapter edge cases
4. **High Gas Fees**: Implement dynamic fee estimation
5. **Network Congestion**: Queue transactions and retry

### Emergency Procedures
1. **Circuit Breaker**: Implement emergency pause functionality
2. **Rollback Plan**: Keep previous deployment ready for quick rollback
3. **Communication Plan**: Prepared messages for users during incidents
4. **Escalation Path**: Clear escalation procedures for critical issues

---

**🎯 Ready to Launch!**

Following this deployment guide ensures AsterLaunch is production-ready with proper security, monitoring, and scalability measures in place.