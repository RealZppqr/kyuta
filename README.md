# Kyuta - Enterprise Discord Bot

<div align="center">

![Kyuta Logo](https://via.placeholder.com/200x200/7289da/ffffff?text=KYUTA)

**A next-generation Discord bot built for scale**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)
[![Eris](https://img.shields.io/badge/Eris-0.17+-purple.svg)](https://github.com/abalabahaha/eris)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

*Developed by [RealZppqr](https://github.com/RealZppqr)*

</div>

## 🚀 Overview

**Kyuta** is a high-performance, enterprise-grade Discord bot engineered to handle millions of servers and users simultaneously. Built with modern TypeScript, ESM modules, and the lightning-fast Eris library, Kyuta represents the pinnacle of Discord bot architecture.

### Why Kyuta?

- **🏗️ Enterprise Architecture**: Designed from the ground up for massive scale
- **⚡ Lightning Performance**: Optimized for minimal latency and maximum throughput  
- **🧩 Modular Design**: Clean, maintainable codebase with separation of concerns
- **🔧 TypeScript Native**: Full type safety with advanced TypeScript features
- **🌐 ESM First**: Modern JavaScript modules for better tree-shaking and performance
- **📊 Rich Presence System**: Dynamic, engaging user experiences
- **🛡️ Advanced Moderation**: Comprehensive moderation suite with intelligent logging
- **🔄 Auto-Sharding**: Intelligent shard management for optimal resource utilization

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [Commands](#-commands)
- [Sharding & Performance](#-sharding--performance)
- [Rich Presence System](#-rich-presence-system)
- [Moderation System](#-moderation-system)
- [Development](#-development)
- [Deployment](#-deployment)
- [API Reference](#-api-reference)
- [Contributing](#-contributing)

## ✨ Features

### Core Capabilities

- **🎯 Multi-Server Management**: Handle millions of Discord servers simultaneously
- **👥 User Scalability**: Support for unlimited concurrent users
- **🔄 Dynamic Sharding**: Automatic shard scaling based on server load
- **💾 Persistent Storage**: MongoDB integration with optimized queries
- **⚡ Redis Caching**: Sub-millisecond response times with intelligent caching
- **🛡️ Advanced Security**: Role-based permissions with hierarchy validation
- **📊 Analytics Dashboard**: Real-time performance metrics and insights
- **🌍 Global Commands**: Slash commands with localization support

### Technical Excellence

\`\`\`typescript
// Advanced TypeScript generics for type-safe command handling
interface CommandExecutor<T extends CommandContext = CommandContext> {
  execute(context: T): Promise<CommandResult<T['responseType']>>
}

// Conditional types for dynamic command validation
type ValidateCommand<T> = T extends { permissions: infer P }
  ? P extends readonly Permission[]
    ? CommandWithPermissions<T, P>
    : never
  : BaseCommand<T>
\`\`\`

## 🏗️ Architecture

Kyuta follows a sophisticated microservice-inspired architecture optimized for Discord's unique challenges:

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                        Kyuta Core                           │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Gateway   │  │   Shards    │  │   Command Router    │  │
│  │   Manager   │  │   Manager   │  │                     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Event     │  │   Cache     │  │   Database          │  │
│  │   System    │  │   Layer     │  │   Abstraction       │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  MongoDB    │  │    Redis    │  │   Metrics           │  │
│  │  Cluster    │  │   Cluster   │  │   Collection        │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
\`\`\`

### Advanced TypeScript Implementation

\`\`\`typescript
// Sophisticated event system with type inference
class EventEmitter<TEvents extends Record<string, any[]>> {
  private listeners = new Map<keyof TEvents, Set<(...args: any[]) => void>>()

  on<K extends keyof TEvents>(
    event: K,
    listener: (...args: TEvents[K]) => void | Promise<void>
  ): this {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(listener)
    return this
  }

  emit<K extends keyof TEvents>(event: K, ...args: TEvents[K]): boolean {
    const eventListeners = this.listeners.get(event)
    if (!eventListeners) return false

    for (const listener of eventListeners) {
      try {
        const result = listener(...args)
        if (result instanceof Promise) {
          result.catch(error => this.handleError(error, event))
        }
      } catch (error) {
        this.handleError(error, event)
      }
    }
    return true
  }
}

// Usage in Kyuta's event system
interface KyutaEvents {
  'command:executed': [CommandContext, CommandResult]
  'shard:ready': [number, ShardInfo]
  'guild:joined': [Guild, ShardInfo]
  'moderation:action': [ModerationAction, User, Guild]
}

const kyutaEvents = new EventEmitter<KyutaEvents>()
\`\`\`

## 🛠️ Installation

### Prerequisites

- **Node.js**: 18.17.0 or higher (LTS recommended)
- **MongoDB**: 6.0+ (Replica set for production)
- **Redis**: 7.0+ (Cluster mode for scale)
- **Docker**: 24.0+ (optional but recommended)
- **TypeScript**: 5.3+ (for development)

### Quick Start (Local Development)

\`\`\`bash
# Clone Kyuta repository
git clone https://github.com/RealZppqr/kyuta-discord-bot.git
cd kyuta-discord-bot

# Install dependencies with exact versions
npm ci

# Copy environment template
cp .env.example .env

# Configure your environment (see Configuration section)
nano .env

# Build TypeScript with advanced optimizations
npm run build:production

# Start development server with hot reload
npm run dev
\`\`\`

### Production Installation

\`\`\`bash
# Install with production optimizations
NODE_ENV=production npm ci --omit=dev

# Build with maximum optimizations
npm run build:production

# Start with PM2 for process management
npm install -g pm2
pm2 start ecosystem.config.js
\`\`\`

### Docker Installation (Recommended)

#### Option 1: Docker Compose (Full Stack)

\`\`\`yaml
# docker-compose.production.yml
version: '3.8'

services:
  kyuta:
    build:
      context: .
      dockerfile: Dockerfile.production
      args:
        NODE_ENV: production
    environment:
      - DISCORD_TOKEN=\${DISCORD_TOKEN}
      - CLIENT_ID=\${CLIENT_ID}
      - MONGO_URI=mongodb://mongo-primary:27017,mongo-secondary:27017/kyuta?replicaSet=rs0
      - REDIS_URL=redis://redis-cluster:6379
      - SHARD_COUNT=auto
      - NODE_ENV=production
    depends_on:
      - mongo-primary
      - redis-cluster
    deploy:
      replicas: 3
      resources:
        limits:
          memory: 2G
          cpus: '1.0'
        reservations:
          memory: 1G
          cpus: '0.5'
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "node", "dist/health-check.js"]
      interval: 30s
      timeout: 10s
      retries: 3

  mongo-primary:
    image: mongo:7
    command: mongod --replSet rs0 --bind_ip_all
    volumes:
      - mongo_primary_data:/data/db
    environment:
      MONGO_INITDB_ROOT_USERNAME: kyuta
      MONGO_INITDB_ROOT_PASSWORD: \${MONGO_PASSWORD}

  mongo-secondary:
    image: mongo:7
    command: mongod --replSet rs0 --bind_ip_all
    volumes:
      - mongo_secondary_data:/data/db
    depends_on:
      - mongo-primary

  redis-cluster:
    image: redis:7-alpine
    command: redis-server --appendonly yes --cluster-enabled yes
    volumes:
      - redis_data:/data

volumes:
  mongo_primary_data:
  mongo_secondary_data:
  redis_data:
\`\`\`

\`\`\`bash
# Deploy production stack
docker-compose -f docker-compose.production.yml up -d

# Scale bot instances
docker-compose -f docker-compose.production.yml up -d --scale kyuta=5
\`\`\`

#### Option 2: Kubernetes Deployment

\`\`\`yaml
# k8s/kyuta-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kyuta-bot
  labels:
    app: kyuta
spec:
  replicas: 10
  selector:
    matchLabels:
      app: kyuta
  template:
    metadata:
      labels:
        app: kyuta
    spec:
      containers:
      - name: kyuta
        image: realzppqr/kyuta:latest
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
        env:
        - name: DISCORD_TOKEN
          valueFrom:
            secretKeyRef:
              name: kyuta-secrets
              key: discord-token
        - name: SHARD_COUNT
          value: "auto"
        - name: CLUSTER_ID
          valueFrom:
            fieldRef:
              fieldPath: metadata.name
\`\`\`

## ⚙️ Configuration

### Environment Variables

\`\`\`bash
# .env.production
# Discord Configuration
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_application_id_here
GUILD_ID=your_test_guild_id  # Optional: for guild-specific commands

# Database Configuration
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/kyuta?retryWrites=true&w=majority
REDIS_URL=rediss://user:pass@redis-cluster.example.com:6380

# Bot Configuration
PREFIX=k!
NODE_ENV=production
LOG_LEVEL=info

# Sharding Configuration
SHARD_COUNT=auto              # auto, or specific number
SHARDS_PER_CLUSTER=5         # Shards per process
MAX_CLUSTERS=20              # Maximum cluster processes

# Performance Tuning
CACHE_TTL=3600               # Cache TTL in seconds
MAX_CONCURRENT_COMMANDS=100  # Max concurrent command executions
RATE_LIMIT_WINDOW=60000     # Rate limit window in ms
RATE_LIMIT_MAX=50           # Max requests per window

# Feature Flags
ENABLE_ANALYTICS=true
ENABLE_RICH_PRESENCE=true
ENABLE_AUTO_MODERATION=true
ENABLE_SLASH_COMMANDS=true

# Monitoring
METRICS_PORT=9090
HEALTH_CHECK_PORT=8080
PROMETHEUS_ENABLED=true
\`\`\`

### Advanced Configuration

\`\`\`typescript
// src/config/advanced.ts
export interface KyutaConfig {
  readonly discord: {
    readonly token: string
    readonly clientId: string
    readonly intents: readonly GatewayIntentBits[]
    readonly presence: {
      readonly activities: readonly ActivityOptions[]
      readonly status: PresenceStatusData
      readonly updateInterval: number
    }
  }
  readonly database: {
    readonly mongodb: {
      readonly uri: string
      readonly options: MongoClientOptions
      readonly collections: Record<string, CollectionConfig>
    }
    readonly redis: {
      readonly url: string
      readonly options: RedisOptions
      readonly keyPrefix: string
    }
  }
  readonly sharding: {
    readonly mode: 'auto' | 'manual'
    readonly count: number | 'auto'
    readonly shardsPerCluster: number
    readonly respawnTimeout: number
  }
  readonly performance: {
    readonly maxConcurrentCommands: number
    readonly commandTimeout: number
    readonly cacheStrategy: CacheStrategy
    readonly rateLimiting: RateLimitConfig
  }
}

// Type-safe configuration loading with validation
export const loadConfig = (): KyutaConfig => {
  const config = {
    discord: {
      token: requireEnv('DISCORD_TOKEN'),
      clientId: requireEnv('CLIENT_ID'),
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent
      ] as const,
      presence: {
        activities: [{
          name: 'over {guilds} servers',
          type: ActivityType.Watching
        }],
        status: 'online' as const,
        updateInterval: 300000 // 5 minutes
      }
    },
    // ... rest of configuration
  } satisfies KyutaConfig

  return validateConfig(config)
}
\`\`\`

## 🎮 Usage

### Basic Commands

\`\`\`bash
# Prefix commands (legacy support)
k!ping                    # Check bot latency
k!help                    # Show command list
k!userinfo @user          # Get user information
k!serverinfo              # Get server statistics

# Slash commands (primary interface)
/ping                     # Modern ping command
/userinfo user:@someone   # Enhanced user info with rich embeds
/ban user:@user reason:"Spam"  # Advanced moderation
\`\`\`

### Advanced Usage Examples

\`\`\`typescript
// Custom command with advanced TypeScript features
@Command({
  name: 'analytics',
  description: 'Advanced server analytics',
  permissions: ['ManageGuild'],
  cooldown: 30,
  options: [{
    name: 'timeframe',
    description: 'Analytics timeframe',
    type: ApplicationCommandOptionType.String,
    choices: [
      { name: '24 Hours', value: '24h' },
      { name: '7 Days', value: '7d' },
      { name: '30 Days', value: '30d' }
    ]
  }]
})
export class AnalyticsCommand implements SlashCommandExecutor {
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const timeframe = interaction.options.getString('timeframe', true)
    
    // Type-safe analytics data retrieval
    const analytics = await this.analyticsService.getGuildAnalytics(
      interaction.guildId!,
      timeframe as AnalyticsTimeframe
    )

    // Rich embed with dynamic charts
    const embed = new EmbedBuilder()
      .setTitle('📊 Server Analytics')
      .setDescription(\`Analytics for the past \${timeframe}\`)
      .addFields([
        {
          name: '👥 Active Members',
          value: analytics.activeMembers.toLocaleString(),
          inline: true
        },
        {
          name: '💬 Messages Sent',
          value: analytics.messageCount.toLocaleString(),
          inline: true
        },
        {
          name: '📈 Growth Rate',
          value: \`\${analytics.growthRate > 0 ? '+' : ''}\${analytics.growthRate}%\`,
          inline: true
        }
      ])
      .setImage(analytics.chartUrl)
      .setColor(analytics.growthRate > 0 ? Colors.Green : Colors.Red)

    await interaction.reply({ embeds: [embed] })
  }
}
\`\`\`

## 🎯 Commands

### General Commands

#### `/ping` - Latency Check
\`\`\`typescript
// Advanced ping with detailed metrics
const pingEmbed = new EmbedBuilder()
  .setTitle('🏓 Pong!')
  .addFields([
    {
      name: '📡 WebSocket Latency',
      value: \`\${client.ws.ping}ms\`,
      inline: true
    },
    {
      name: '🔄 API Latency',
      value: \`\${Date.now() - interaction.createdTimestamp}ms\`,
      inline: true
    },
    {
      name: '💾 Database Latency',
      value: \`\${await measureDatabaseLatency()}ms\`,
      inline: true
    },
    {
      name: '🧠 Memory Usage',
      value: \`\${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB\`,
      inline: true
    },
    {
      name: '⚡ Uptime',
      value: formatUptime(process.uptime()),
      inline: true
    },
    {
      name: '🔢 Shard',
      value: \`\${interaction.guild?.shardId ?? 0}/\${client.shard?.count ?? 1}\`,
      inline: true
    }
  ])
  .setColor(getLatencyColor(client.ws.ping))
  .setTimestamp()
\`\`\`

#### `/userinfo` - Enhanced User Information
\`\`\`typescript
// Rich user information with advanced features
const userEmbed = new EmbedBuilder()
  .setTitle(\`👤 \${user.displayName}\`)
  .setThumbnail(user.displayAvatarURL({ size: 256 }))
  .addFields([
    {
      name: '🆔 User ID',
      value: \`\\\`\${user.id}\\\`\`,
      inline: true
    },
    {
      name: '📅 Account Created',
      value: \`<t:\${Math.floor(user.createdTimestamp / 1000)}:F>\`,
      inline: true
    },
    {
      name: '🎭 Roles',
      value: member.roles.cache
        .filter(role => role.id !== guild.id)
        .sort((a, b) => b.position - a.position)
        .map(role => role.toString())
        .slice(0, 10)
        .join(', ') || 'No roles',
      inline: false
    },
    {
      name: '🏆 Permissions',
      value: getKeyPermissions(member.permissions).join(', ') || 'None',
      inline: false
    }
  ])
  .setColor(member.displayHexColor || Colors.Blurple)
\`\`\`

### Moderation Commands

#### `/ban` - Advanced Ban System
\`\`\`typescript
@Command({
  name: 'ban',
  description: 'Ban a user with advanced options',
  permissions: ['BanMembers'],
  options: [
    {
      name: 'user',
      description: 'User to ban',
      type: ApplicationCommandOptionType.User,
      required: true
    },
    {
      name: 'reason',
      description: 'Reason for ban',
      type: ApplicationCommandOptionType.String,
      maxLength: 512
    },
    {
      name: 'delete_messages',
      description: 'Delete messages from last X days',
      type: ApplicationCommandOptionType.Integer,
      choices: [
        { name: 'None', value: 0 },
        { name: '1 Day', value: 1 },
        { name: '7 Days', value: 7 }
      ]
    },
    {
      name: 'duration',
      description: 'Temporary ban duration (e.g., 1d, 1w, 1m)',
      type: ApplicationCommandOptionType.String
    }
  ]
})
export class BanCommand implements SlashCommandExecutor {
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const user = interaction.options.getUser('user', true)
    const reason = interaction.options.getString('reason') ?? 'No reason provided'
    const deleteMessages = interaction.options.getInteger('delete_messages') ?? 0
    const duration = interaction.options.getString('duration')

    // Advanced permission and hierarchy checks
    const validationResult = await this.validateBanAction(interaction, user)
    if (!validationResult.success) {
      return interaction.reply({
        content: validationResult.error,
        ephemeral: true
      })
    }

    // Execute ban with comprehensive logging
    const banResult = await this.moderationService.banUser({
      guild: interaction.guild!,
      user,
      moderator: interaction.user,
      reason,
      deleteMessageDays: deleteMessages,
      duration: duration ? parseDuration(duration) : null
    })

    // Rich response with case information
    const embed = new EmbedBuilder()
      .setTitle('🔨 User Banned')
      .setDescription(\`**\${user.tag}** has been banned from the server.\`)
      .addFields([
        {
          name: '👤 User',
          value: \`\${user.tag} (\\\`\${user.id}\\\`)\`,
          inline: true
        },
        {
          name: '👮 Moderator',
          value: interaction.user.tag,
          inline: true
        },
        {
          name: '📋 Case ID',
          value: \`#\${banResult.caseId}\`,
          inline: true
        },
        {
          name: '📝 Reason',
          value: reason,
          inline: false
        }
      ])
      .setColor(Colors.Red)
      .setTimestamp()

    if (duration) {
      embed.addFields({
        name: '⏰ Duration',
        value: formatDuration(parseDuration(duration)),
        inline: true
      })
    }

    await interaction.reply({ embeds: [embed] })
  }
}
\`\`\`

#### `/timeout` - Sophisticated Timeout System
\`\`\`typescript
// Advanced timeout with smart duration parsing
const timeoutDuration = parseDuration(durationString) // "1h30m" -> 5400000ms

const timeoutEmbed = new EmbedBuilder()
  .setTitle('🔇 User Timed Out')
  .setDescription(\`**\${user.tag}** has been timed out.\`)
  .addFields([
    {
      name: '⏱️ Duration',
      value: formatDuration(timeoutDuration),
      inline: true
    },
    {
      name: '🔚 Ends',
      value: \`<t:\${Math.floor((Date.now() + timeoutDuration) / 1000)}:R>\`,
      inline: true
    },
    {
      name: '📝 Reason',
      value: reason,
      inline: false
    }
  ])
  .setColor(Colors.Orange)
\`\`\`

## 🚀 Sharding & Performance

### Intelligent Auto-Sharding

Kyuta implements a sophisticated sharding system that automatically scales based on server load and Discord's recommendations:

\`\`\`typescript
// src/core/ShardManager.ts
export class KyutaShardManager extends ShardingManager {
  private readonly performanceMetrics = new Map<number, ShardMetrics>()
  private readonly loadBalancer = new ShardLoadBalancer()

  constructor(file: string, options: KyutaShardingOptions) {
    super(file, {
      ...options,
      totalShards: options.totalShards === 'auto' 
        ? await this.calculateOptimalShardCount()
        : options.totalShards
    })

    this.setupPerformanceMonitoring()
    this.setupAutoScaling()
  }

  private async calculateOptimalShardCount(): Promise<number> {
    // Get recommended shard count from Discord
    const gateway = await this.client.fetchGatewayBot()
    const recommended = gateway.shards
    
    // Calculate based on current guild count and growth projections
    const currentGuilds = await this.getCurrentGuildCount()
    const projectedGuilds = await this.projectGuildGrowth()
    
    // Factor in system resources and performance targets
    const systemCapacity = await this.assessSystemCapacity()
    
    return Math.max(
      recommended,
      Math.ceil(projectedGuilds / 2500), // 2500 guilds per shard target
      Math.ceil(systemCapacity.maxShards * 0.8) // 80% of system capacity
    )
  }

  private setupAutoScaling(): void {
    setInterval(async () => {
      const metrics = await this.gatherShardMetrics()
      const scalingDecision = this.loadBalancer.analyzeScalingNeeds(metrics)
      
      if (scalingDecision.shouldScale) {
        await this.executeScalingAction(scalingDecision)
      }
    }, 300000) // Check every 5 minutes
  }

  private async executeScalingAction(decision: ScalingDecision): Promise<void> {
    switch (decision.action) {
      case 'scale_up':
        await this.addShards(decision.shardCount)
        break
      case 'scale_down':
        await this.removeShards(decision.shardIds)
        break
      case 'rebalance':
        await this.rebalanceShards(decision.rebalanceMap)
        break
    }
  }
}

// Advanced shard metrics collection
interface ShardMetrics {
  readonly shardId: number
  readonly guildCount: number
  readonly userCount: number
  readonly memoryUsage: number
  readonly cpuUsage: number
  readonly latency: number
  readonly commandsPerMinute: number
  readonly eventsPerMinute: number
  readonly errorRate: number
}

// Predictive load balancing
class ShardLoadBalancer {
  private readonly mlModel = new ShardLoadPredictionModel()

  analyzeScalingNeeds(metrics: ShardMetrics[]): ScalingDecision {
    const predictions = this.mlModel.predict(metrics)
    const currentLoad = this.calculateAverageLoad(metrics)
    const projectedLoad = this.projectLoad(predictions)

    if (projectedLoad > 0.85) {
      return {
        action: 'scale_up',
        shardCount: Math.ceil((projectedLoad - 0.7) * metrics.length),
        confidence: predictions.confidence
      }
    }

    if (currentLoad < 0.3 && metrics.length > 1) {
      return {
        action: 'scale_down',
        shardIds: this.identifyUnderutilizedShards(metrics),
        confidence: predictions.confidence
      }
    }

    return { action: 'maintain', confidence: predictions.confidence }
  }
}
\`\`\`

### Performance Optimization

\`\`\`typescript
// Advanced caching strategy with intelligent invalidation
class KyutaCacheManager {
  private readonly l1Cache = new Map<string, CacheEntry>() // Memory cache
  private readonly l2Cache: Redis // Redis cache
  private readonly l3Cache: MongoDB // Database cache

  async get<T>(key: string, options?: CacheOptions): Promise<T | null> {
    // L1 Cache (Memory) - Fastest
    const l1Result = this.l1Cache.get(key)
    if (l1Result && !this.isExpired(l1Result)) {
      this.updateAccessMetrics(key, 'l1_hit')
      return l1Result.value as T
    }

    // L2 Cache (Redis) - Fast
    const l2Result = await this.l2Cache.get(key)
    if (l2Result) {
      const parsed = JSON.parse(l2Result) as CacheEntry
      if (!this.isExpired(parsed)) {
        this.l1Cache.set(key, parsed) // Promote to L1
        this.updateAccessMetrics(key, 'l2_hit')
        return parsed.value as T
      }
    }

    // L3 Cache (Database) - Fallback
    if (options?.fallbackToDatabase) {
      const dbResult = await this.fetchFromDatabase<T>(key)
      if (dbResult) {
        await this.setMultiLevel(key, dbResult, options.ttl)
        this.updateAccessMetrics(key, 'l3_hit')
        return dbResult
      }
    }

    this.updateAccessMetrics(key, 'miss')
    return null
  }

  private async setMultiLevel<T>(
    key: string, 
    value: T, 
    ttl: number = 3600
  ): Promise<void> {
    const entry: CacheEntry = {
      value,
      timestamp: Date.now(),
      ttl: ttl * 1000
    }

    // Set in all cache levels
    this.l1Cache.set(key, entry)
    await this.l2Cache.setex(key, ttl, JSON.stringify(entry))
    
    // Optional: Store in database for persistence
    if (ttl > 86400) { // Cache for more than 24 hours
      await this.l3Cache.collection('cache').updateOne(
        { _id: key },
        { $set: { value, expiresAt: new Date(Date.now() + ttl * 1000) } },
        { upsert: true }
      )
    }
  }
}
\`\`\`

## 🎨 Rich Presence System

Kyuta features a dynamic rich presence system that adapts to server activity and user engagement:

\`\`\`typescript
// src/features/presence/PresenceManager.ts
export class KyutaPresenceManager {
  private readonly presenceTemplates: PresenceTemplate[] = [
    {
      type: ActivityType.Watching,
      name: 'over {guilds:,} servers',
      condition: () => true,
      weight: 1
    },
    {
      type: ActivityType.Listening,
      name: 'to {users:,} users',
      condition: (stats) => stats.users > 100000,
      weight: 2
    },
    {
      type: ActivityType.Playing,
      name: 'with {commands:,} commands today',
      condition: (stats) => stats.commandsToday > 1000,
      weight: 3
    },
    {
      type: ActivityType.Competing,
      name: 'in {events:,} events/min',
      condition: (stats) => stats.eventsPerMinute > 100,
      weight: 1
    }
  ]

  private currentPresenceIndex = 0
  private readonly updateInterval = 300000 // 5 minutes
  private readonly statsCollector = new StatsCollector()

  async start(): Promise<void> {
    // Initial presence
    await this.updatePresence()

    // Schedule regular updates
    setInterval(() => this.updatePresence(), this.updateInterval)

    // React to significant events
    this.setupEventReactivePresence()
  }

  private async updatePresence(): Promise<void> {
    const stats = await this.statsCollector.getCurrentStats()
    const availableTemplates = this.presenceTemplates.filter(
      template => template.condition(stats)
    )

    if (availableTemplates.length === 0) return

    // Weighted random selection
    const template = this.selectWeightedRandom(availableTemplates)
    const activity = await this.renderPresenceTemplate(template, stats)

    // Update across all shards
    await this.client.shard?.broadcastEval((client, activity) => {
      client.user?.setPresence({
        activities: [activity],
        status: this.determineOptimalStatus(stats)
      })
    }, activity)
  }

  private async renderPresenceTemplate(
    template: PresenceTemplate,
    stats: BotStats
  ): Promise<ActivityOptions> {
    const name = template.name.replace(/\{(\w+)(?::([^}]+))?\}/g, (match, key, format) => {
      const value = stats[key as keyof BotStats]
      return this.formatStatValue(value, format)
    })

    return {
      type: template.type,
      name,
      url: template.url
    }
  }

  private setupEventReactivePresence(): void {
    // React to milestone events
    this.client.on('guildCreate', async (guild) => {
      if (this.client.guilds.cache.size % 1000 === 0) {
        await this.showMilestonePresence('guilds', this.client.guilds.cache.size)
      }
    })

    // React to high activity periods
    this.statsCollector.on('highActivity', async (stats) => {
      await this.showActivityPresence(stats)
    })
  }

  private async showMilestonePresence(type: string, count: number): Promise<void> {
    const milestoneActivity: ActivityOptions = {
      type: ActivityType.Celebrating,
      name: \`\${count:,} \${type} milestone! 🎉\`
    }

    await this.client.user?.setPresence({
      activities: [milestoneActivity],
      status: 'online'
    })

    // Revert after 5 minutes
    setTimeout(() => this.updatePresence(), 300000)
  }
}

// Advanced stats collection with real-time metrics
class StatsCollector extends EventEmitter {
  private readonly metrics = new Map<string, number>()
  private readonly rollingAverages = new Map<string, RollingAverage>()

  async getCurrentStats(): Promise<BotStats> {
    const [guilds, users, channels] = await Promise.all([
      this.client.shard?.fetchClientValues('guilds.cache.size'),
      this.client.shard?.fetchClientValues('users.cache.size'),
      this.client.shard?.fetchClientValues('channels.cache.size')
    ])

    return {
      guilds: guilds?.reduce((a, b) => a + b, 0) ?? 0,
      users: users?.reduce((a, b) => a + b, 0) ?? 0,
      channels: channels?.reduce((a, b) => a + b, 0) ?? 0,
      commandsToday: await this.getCommandsToday(),
      eventsPerMinute: this.rollingAverages.get('events')?.current ?? 0,
      memoryUsage: process.memoryUsage().heapUsed,
      uptime: process.uptime()
    }
  }
}
\`\`\`

## 🛡️ Moderation System

### Advanced Permission System

\`\`\`typescript
// Sophisticated permission checking with context awareness
class PermissionValidator {
  static async validateModerationAction(
    action: ModerationAction,
    context: ModerationContext
  ): Promise<ValidationResult> {
    const checks = [
      this.checkBasicPermissions(action, context),
      this.checkRoleHierarchy(action, context),
      this.checkTargetImmunity(action, context),
      this.checkActionLimits(action, context),
      this.checkGuildSettings(action, context)
    ]

    const results = await Promise.all(checks)
    const failures = results.filter(result => !result.success)

    if (failures.length > 0) {
      return {
        success: false,
        error: failures[0].error,
        code: failures[0].code
      }
    }

    return { success: true }
  }

  private static async checkRoleHierarchy(
    action: ModerationAction,
    context: ModerationContext
  ): Promise<ValidationResult> {
    const { moderator, target, guild } = context

    const moderatorMember = await guild.members.fetch(moderator.id)
    const targetMember = await guild.members.fetch(target.id).catch(() => null)

    if (!targetMember) return { success: true } // User not in guild

    const moderatorHighestRole = moderatorMember.roles.highest
    const targetHighestRole = targetMember.roles.highest

    if (targetHighestRole.position >= moderatorHighestRole.position) {
      return {
        success: false,
        error: 'Cannot moderate users with equal or higher roles',
        code: 'HIERARCHY_VIOLATION'
      }
    }

    return { success: true }
  }
}

// Comprehensive moderation logging
class ModerationLogger {
  async logAction(action: ModerationAction): Promise<ModerationCase> {
    const caseData: ModerationCase = {
      id: await this.generateCaseId(),
      guildId: action.guild.id,
      type: action.type,
      userId: action.target.id,
      moderatorId: action.moderator.id,
      reason: action.reason,
      evidence: action.evidence,
      timestamp: new Date(),
      duration: action.duration,
      metadata: {
        shardId: action.guild.shardId,
        channelId: action.channel?.id,
        messageId: action.message?.id,
        automod: action.automated ?? false
      }
    }

    // Store in database
    await this.database.collection('moderationCases').insertOne(caseData)

    // Send to moderation log channel
    await this.sendToModerationLog(action.guild, caseData)

    // Update user infraction count
    await this.updateUserInfractions(action.target.id, action.guild.id)

    // Trigger webhooks/integrations
    await this.triggerModerationWebhooks(caseData)

    return caseData
  }

  private async sendToModerationLog(
    guild: Guild,
    caseData: ModerationCase
  ): Promise<void> {
    const logChannel = await this.getGuildLogChannel(guild.id)
    if (!logChannel) return

    const embed = new EmbedBuilder()
      .setTitle(\`📋 Case #\${caseData.id} | \${this.formatActionType(caseData.type)}\`)
      .addFields([
        {
          name: '�� User',
          value: \`<@\${caseData.userId}> (\\\`\${caseData.userId}\\\`)\`,
          inline: true
        },
        {
          name: '👮 Moderator',
          value: \`<@\${caseData.moderatorId}>\`,
          inline: true
        },
        {
          name: '📝 Reason',
          value: caseData.reason || 'No reason provided',
          inline: false
        }
      ])
      .setColor(this.getActionColor(caseData.type))
      .setTimestamp(caseData.timestamp)

    if (caseData.duration) {
      embed.addFields({
        name: '⏰ Duration',
        value: formatDuration(caseData.duration),
        inline: true
      })
    }

    await logChannel.send({ embeds: [embed] })
  }
}
\`\`\`

### Auto-Moderation System

\`\`\`typescript
// AI-powered auto-moderation with machine learning
class AutoModerationEngine {
  private readonly toxicityDetector = new ToxicityDetector()
  private readonly spamDetector = new SpamDetector()
  private readonly raidDetector = new RaidDetector()

  async analyzeMessage(message: Message): Promise<ModerationDecision> {
    const analyses = await Promise.all([
      this.toxicityDetector.analyze(message),
      this.spamDetector.analyze(message),
      this.checkBlacklist(message),
      this.checkRateLimit(message)
    ])

    const highestSeverity = Math.max(...analyses.map(a => a.severity))
    const actions = analyses.flatMap(a => a.suggestedActions)

    if (highestSeverity >= 0.8) {
      return {
        action: 'ban',
        reason: 'Automatic: High toxicity detected',
        confidence: highestSeverity,
        evidence: analyses
      }
    }

    if (highestSeverity >= 0.6) {
      return {
        action: 'timeout',
        duration: 3600000, // 1 hour
        reason: 'Automatic: Moderate violation detected',
        confidence: highestSeverity,
        evidence: analyses
      }
    }

    if (highestSeverity >= 0.4) {
      return {
        action: 'warn',
        reason: 'Automatic: Minor violation detected',
        confidence: highestSeverity,
        evidence: analyses
      }
    }

    return { action: 'none', confidence: 1 - highestSeverity }
  }
}
\`\`\`

## 🔧 Development

### Setting Up Development Environment

\`\`\`bash
# Clone with development branch
git clone -b develop https://github.com/RealZppqr/kyuta-discord-bot.git
cd kyuta-discord-bot

# Install development dependencies
npm install

# Set up pre-commit hooks
npm run prepare

# Start development environment
npm run dev:full  # Starts bot, database, and monitoring
\`\`\`

### Advanced TypeScript Features

\`\`\`typescript
// Conditional types for command validation
type CommandPermissions<T> = T extends { permissions: infer P }
  ? P extends readonly Permission[]
    ? P[number]
    : never
  : never

// Template literal types for dynamic command names
type CommandName = \`\${string}Command\`
type EventName = \`\${string}Event\`

// Advanced decorator system
function Command<T extends CommandOptions>(options: T) {
  return function <U extends Constructor<SlashCommandExecutor>>(target: U) {
    const metadata: CommandMetadata<T> = {
      ...options,
      executor: target,
      timestamp: Date.now()
    }
    
    Reflect.defineMetadata('command', metadata, target)
    return target
  }
}

// Type-safe event system with branded types
interface BrandedEvent<T extends string> {
  readonly __brand: T
}

type KyutaEventMap = {
  'ready': BrandedEvent<'ready'> & { shardId: number }
  'guildCreate': BrandedEvent<'guildCreate'> & { guild: Guild }
  'commandExecute': BrandedEvent<'commandExecute'> & { 
    command: string
    user: User
    duration: number
  }
}

// Advanced error handling with discriminated unions
type CommandResult<T = unknown> = 
  | { success: true; data: T }
  | { success: false; error: CommandError }

type CommandError = 
  | { type: 'PERMISSION_DENIED'; permission: Permission }
  | { type: 'COOLDOWN_ACTIVE'; remainingTime: number }
  | { type: 'VALIDATION_FAILED'; field: string; message: string }
  | { type: 'INTERNAL_ERROR'; cause: Error }
\`\`\`

### Testing Framework

\`\`\`typescript
// Comprehensive testing with mocked Discord environment
describe('KyutaBot', () => {
  let bot: KyutaBot
  let mockClient: MockClient
  let testGuild: MockGuild

  beforeEach(async () => {
    mockClient = new MockClient()
    testGuild = mockClient.createGuild({
      id: '123456789',
      name: 'Test Guild',
      memberCount: 1000
    })
    
    bot = new KyutaBot({
      client: mockClient,
      config: testConfig
    })
    
    await bot.initialize()
  })

  describe('Command Execution', () => {
    it('should execute ping command with correct metrics', async () => {
      const interaction = testGuild.createSlashCommandInteraction({
        commandName: 'ping',
        user: testGuild.createUser({ id: '987654321' })
      })

      const result = await bot.executeCommand(interaction)

      expect(result.success).toBe(true)
      expect(result.data.embeds[0].fields).toContainEqual(
        expect.objectContaining({
          name: '📡 WebSocket Latency',
          value: expect.stringMatching(/\d+ms/)
        })
      )
    })

    it('should handle permission validation correctly', async () => {
      const interaction = testGuild.createSlashCommandInteraction({
        commandName: 'ban',
        user: testGuild.createUser({ 
          id: '111111111',
          permissions: [] // No permissions
        }),
        options: [
          { name: 'user', value: '222222222' },
          { name: 'reason', value: 'Test ban' }
        ]
      })

      const result = await bot.executeCommand(interaction)

      expect(result.success).toBe(false)
      expect(result.error.type).toBe('PERMISSION_DENIED')
    })
  })

  describe('Auto-Moderation', () => {
    it('should detect and handle toxic messages', async () => {
      const message = testGuild.createMessage({
        content: 'This is a toxic message with bad words',
        author: testGuild.createUser({ id: '333333333' })
      })

      const decision = await bot.autoMod.analyzeMessage(message)

      expect(decision.action).toBe('timeout')
      expect(decision.confidence).toBeGreaterThan(0.6)
    })
  })
})
\`\`\`

## 🚀 Deployment

### Production Deployment Checklist

- [ ] **Environment Configuration**
  - [ ] All environment variables set
  - [ ] Database connections tested
  - [ ] Redis cluster configured
  - [ ] SSL certificates installed

- [ ] **Security Hardening**
  - [ ] Bot token rotated
  - [ ] Database credentials secured
  - [ ] Network policies configured
  - [ ] Rate limiting enabled

- [ ] **Performance Optimization**
  - [ ] Shard count optimized
  - [ ] Cache strategies configured
  - [ ] Database indexes created
  - [ ] Memory limits set

- [ ] **Monitoring Setup**
  - [ ] Prometheus metrics enabled
  - [ ] Grafana dashboards configured
  - [ ] Alert rules defined
  - [ ] Log aggregation setup

### Kubernetes Deployment

\`\`\`yaml
# k8s/kyuta-production.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: kyuta-production
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kyuta-bot
  namespace: kyuta-production
spec:
  replicas: 5
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 2
      maxUnavailable: 1
  selector:
    matchLabels:
      app: kyuta-bot
  template:
    metadata:
      labels:
        app: kyuta-bot
    spec:
      containers:
      - name: kyuta
        image: realzppqr/kyuta:v2.1.0
        resources:
          requests:
            memory: "2Gi"
            cpu: "1000m"
          limits:
            memory: "4Gi"
            cpu: "2000m"
        env:
        - name: DISCORD_TOKEN
          valueFrom:
            secretKeyRef:
              name: kyuta-secrets
              key: discord-token
        - name: SHARD_COUNT
          value: "auto"
        - name: CLUSTER_ID
          valueFrom:
            fieldRef:
              fieldPath: metadata.name
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: kyuta-service
  namespace: kyuta-production
spec:
  selector:
    app: kyuta-bot
  ports:
  - name: metrics
    port: 9090
    targetPort: 9090
  - name: health
    port: 8080
    targetPort: 8080
\`\`\`

### Monitoring and Observability

\`\`\`typescript
// Advanced metrics collection with Prometheus
class KyutaMetrics {
  private readonly registry = new Registry()
  
  // Command metrics
  private readonly commandCounter = new Counter({
    name: 'kyuta_commands_total',
    help: 'Total number of commands executed',
    labelNames: ['command', 'guild', 'shard', 'status'],
    registers: [this.registry]
  })

  private readonly commandDuration = new Histogram({
    name: 'kyuta_command_duration_seconds',
    help: 'Command execution duration',
    labelNames: ['command', 'shard'],
    buckets: [0.1, 0.5, 1, 2, 5, 10],
    registers: [this.registry]
  })

  // System metrics
  private readonly memoryUsage = new Gauge({
    name: 'kyuta_memory_usage_bytes',
    help: 'Memory usage in bytes',
    labelNames: ['type'],
    registers: [this.registry]
  })

  private readonly guildCount = new Gauge({
    name: 'kyuta_guilds_total',
    help: 'Total number of guilds',
    labelNames: ['shard'],
    registers: [this.registry]
  })

  recordCommand(command: string, guild: string, shard: number, status: string): void {
    this.commandCounter.inc({ command, guild, shard: shard.toString(), status })
  }

  recordCommandDuration(command: string, shard: number, duration: number): void {
    this.commandDuration.observe({ command, shard: shard.toString() }, duration)
  }

  updateSystemMetrics(): void {
    const memUsage = process.memoryUsage()
    this.memoryUsage.set({ type: 'heap_used' }, memUsage.heapUsed)
    this.memoryUsage.set({ type: 'heap_total' }, memUsage.heapTotal)
    this.memoryUsage.set({ type: 'external' }, memUsage.external)
    this.memoryUsage.set({ type: 'rss' }, memUsage.rss)
  }

  getMetrics(): string {
    return this.registry.metrics()
  }
}
\`\`\`

## 📚 API Reference

### Core Classes

#### `KyutaBot`
Main bot class that orchestrates all components.

\`\`\`typescript
class KyutaBot {
  constructor(options: KyutaBotOptions)
  
  async initialize(): Promise<void>
  async start(): Promise<void>
  async shutdown(): Promise<void>
  
  // Command system
  registerCommand(command: Command): void
  executeCommand(interaction: CommandInteraction): Promise<CommandResult>
  
  // Event system
  on<K extends keyof KyutaEvents>(event: K, listener: (...args: KyutaEvents[K]) => void): this
  emit<K extends keyof KyutaEvents>(event: K, ...args: KyutaEvents[K]): boolean
}
\`\`\`

#### `CommandExecutor`
Base interface for all command implementations.

\`\`\`typescript
interface CommandExecutor {
  execute(interaction: CommandInteraction): Promise<CommandResult>
}

interface SlashCommandExecutor extends CommandExecutor {
  execute(interaction: ChatInputCommandInteraction): Promise<CommandResult>
}

interface ContextMenuExecutor extends CommandExecutor {
  execute(interaction: ContextMenuCommandInteraction): Promise<CommandResult>
}
\`\`\`

### Utility Functions

\`\`\`typescript
// Duration parsing and formatting
function parseDuration(input: string): number
function formatDuration(ms: number): string

// Permission utilities
function hasPermission(member: GuildMember, permission: Permission): boolean
function getHighestRole(member: GuildMember): Role

// Embed builders
function createSuccessEmbed(title: string, description?: string): EmbedBuilder
function createErrorEmbed(error: string, details?: string): EmbedBuilder
function createInfoEmbed(title: string, description?: string): EmbedBuilder
\`\`\`

## 🤝 Contributing

We welcome contributions to Kyuta! Please follow our contribution guidelines:

### Development Workflow

1. **Fork the repository**
   \`\`\`bash
   git clone https://github.com/YourUsername/kyuta-discord-bot.git
   cd kyuta-discord-bot
   git remote add upstream https://github.com/RealZppqr/kyuta-discord-bot.git
   \`\`\`

2. **Create a feature branch**
   \`\`\`bash
   git checkout -b feature/amazing-new-feature
   \`\`\`

3. **Make your changes**
   - Follow TypeScript best practices
   - Add comprehensive tests
   - Update documentation
   - Follow the existing code style

4. **Test your changes**
   \`\`\`bash
   npm run test
   npm run lint
   npm run type-check
   \`\`\`

5. **Submit a pull request**
   - Provide a clear description
   - Reference any related issues
   - Include screenshots if applicable

### Code Style Guidelines

- Use TypeScript strict mode
- Follow ESLint configuration
- Use meaningful variable names
- Add JSDoc comments for public APIs
- Prefer composition over inheritance
- Use async/await over Promises
- Handle errors gracefully

### Commit Message Format

\`\`\`
type(scope): description

[optional body]

[optional footer]
\`\`\`

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## 📄 License

MIT License

Copyright (c) 2024 RealZppqr

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

<div align="center">

**Built with ❤️ by [RealZppqr](https://github.com/RealZppqr)**

*Kyuta - Scaling Discord communities worldwide*

</div>
