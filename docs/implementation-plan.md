# Music Industry Simulator - Implementation Plan

## Table of Contents

- [Overview](#overview)
- [Economic Balance Principles & Formulas](#economic-balance-principles--formulas)
- [Current Status](#current-status)
- [Phase 0: Project Setup & Foundation](#phase-0-project-setup--foundation-complete)
- [Phase 1: Core Game Systems](#phase-1-core-game-systems-complete)
- [Phase 2: Name Generation & Content](#phase-2-name-generation--content-complete)
- [Phase 3: UI Components](#phase-3-ui-components-complete)
- [Phase 4: Advanced Systems](#phase-4-advanced-systems-not-started)
- [Phase 5: Additional UI Components](#phase-5-additional-ui-components-not-started)
- [Phase 6: Integration & Polish](#phase-6-integration--polish-not-started)
- [Phase 7: Deployment & Documentation](#phase-7-deployment--documentation)
- [Phase 8: Final Polish](#phase-8-final-polish-optional)
- [How to Use This Plan](#how-to-use-this-plan)

---

## Overview

This implementation plan breaks down the Music Industry Simulator (AI Music Idle Game) into discrete, sequential tasks that must be completed in order. Each task builds on the previous tasks and should be completed one at a time.

**This plan is designed for LINEAR execution - complete each task before moving to the next.**

---

## Economic Balance Principles & Formulas

**CRITICAL: All implementations must follow these balance rules to ensure healthy game progression.**

### Core Economic Scaling Rules

#### Tier Progression Formula
```
For all purchasables (upgrades, generators, buildings):

next_tier_cost = current_tier_cost * SCALE_FACTOR
next_tier_benefit = current_tier_benefit * SCALE_FACTOR

Where SCALE_FACTOR must be between 1.5 and 2.5
NEVER exceed 5x jump between tiers

Validation check:
assert(next_cost / current_cost <= 5.0)
assert(next_benefit / current_benefit <= 5.0)
```

#### Income Distribution Rule
```
At any progression milestone:

previous_tier_contribution = previous_tier_revenue / total_revenue
assert(previous_tier_contribution >= 0.20)

Example: If player has tier 4 generators, tier 3 generators should
still contribute 20-40% of total income
```

#### Anti-Pattern Examples
```
❌ WRONG - Cliff jump:
Tier 3: +$100/sec cost=$1,000
Tier 4: +$10,000/sec cost=$50,000  (100x benefit jump)

✓ CORRECT - Graduated scaling:
Tier 3: +$100/sec cost=$1,000
Tier 4: +$250/sec cost=$2,500
Tier 5: +$625/sec cost=$6,250  (2.5x scaling)
```

### Streaming Revenue Formula

**This is the PRIMARY income source and must remain 15-30% of total income throughout the game.**

```javascript
streaming_revenue_per_tick = (
  total_completed_songs *
  total_fans *
  BASE_STREAMING_RATE *
  platform_multiplier
)

Where:
- BASE_STREAMING_RATE: constant (e.g., 0.001 per fan per song per tick)
- platform_multiplier: 1.0 by default, increases only when player owns
  streaming platform (late game unlock)
- No exponential multipliers allowed on streaming
- This scales linearly with songs and fans ONLY
```

### Song Generation State Tracking

```javascript
State to track:
{
  total_completed_songs: integer,  // Increments on completion, never decreases
  songs_in_queue: [                // Array of pending songs
    {
      completion_time: timestamp,
      song_index: integer           // For ordering only
    }
  ]
}

On song completion:
1. total_completed_songs += 1
2. Remove completed song from songs_in_queue
3. Streaming revenue recalculates automatically next tick

IMPORTANT:
- DO NOT store per-song metadata (quality, genre, etc.)
- All bonuses apply globally to production rate
- Song upgrades affect: production speed, queue capacity
```

### Album Release Mechanics

**Albums provide burst income through one-time sales with exponential demand decay.**

#### State
```javascript
{
  active_album_batch: {
    copies_pressed: integer,
    copies_remaining: integer,
    price_per_copy: float,
    press_timestamp: timestamp,
    revenue_generated: float
  } | null,
  last_album_timestamp: timestamp
}

Constraints:
- Only 1 active album at a time
- 48-hour cooldown between releases
- Unsold copies expire after 30 days
```

#### Sales Simulation (Per Tick)
```javascript
const ALBUM_INTEREST_RATE = 0.01;        // 1% of fans buy per day at peak
const ALBUM_DEMAND_DECAY_RATE = 0.15;    // Exponential decay after week 1

// Demand curve:
if (days_since_press <= 7) {
  demand_multiplier = 1.0;  // Peak interest week 1
} else {
  days_past_peak = days_since_press - 7;
  demand_multiplier = Math.exp(-0.15 * days_past_peak);
  // Day 7: 100%, Day 14: 35%, Day 21: 12%, Day 30: 3%
}

// Sales this tick:
fan_demand_rate = total_fans * ALBUM_INTEREST_RATE * demand_multiplier;
potential_sales = fan_demand_rate * (tick_duration_seconds / 86400);
sales_this_tick = Math.min(copies_remaining, potential_sales);
revenue_this_tick = sales_this_tick * price_per_copy;
```

#### Pricing Formula
```javascript
// More expensive to press larger batches (sublinear scaling)
function calculateCopiesFromCost(cost_paid) {
  const BASE_COPIES_PER_DOLLAR = 10;
  const SCALE_PENALTY = 0.5;  // Square root scaling
  return Math.floor(BASE_COPIES_PER_DOLLAR * Math.pow(cost_paid, SCALE_PENALTY));
}

// Example: $1000 = 10k copies, $4000 = 20k copies (not 40k)

function calculateSalePrice(cost_paid, copies) {
  const production_cost_per_copy = cost_paid / copies;
  const profit_margin = 1.5;  // 50% profit if all sell
  return production_cost_per_copy * profit_margin;
}
```

### Tour Mechanics

**Tours provide temporary multipliers to ALL income sources.**

#### State
```javascript
{
  active_tour: {
    start_time: timestamp,
    end_time: timestamp,              // start_time + duration
    duration_seconds: integer,        // 30-90 days
    revenue_multiplier: float,        // 1.5-3.0x
    tier: integer
  } | null,
  last_tour_end_time: timestamp,
  tour_cooldown_seconds: integer      // 14-30 days
}

Constraints:
- Only 1 active tour at a time (NO STACKING)
- Cannot extend or modify mid-tour
- Cooldown starts after tour ends
- Cannot queue next tour
```

#### Revenue Boost Application
```javascript
function calculateTotalIncome() {
  let base_income = 0;
  base_income += streaming_revenue_per_tick;
  base_income += album_sales_this_tick;
  base_income += merch_revenue_per_tick;
  // ... other sources

  // Apply tour multiplier if active
  if (active_tour !== null && now() < active_tour.end_time) {
    return base_income * active_tour.revenue_multiplier;
  }

  return base_income;
}
```

#### Tour Cost Formula
```javascript
// Tour cost scales with fanbase (sublinear to stay profitable)
const BASE_TOUR_COST = 10000;
const FAN_COST_SCALING = 0.5;  // Square root scaling

venue_size_cost = BASE_TOUR_COST * Math.pow(total_fans / 1000, FAN_COST_SCALING);
tier_multiplier = Math.pow(1.5, tier);
duration_multiplier = duration / (30 * 86400);

total_cost = venue_size_cost * tier_multiplier * duration_multiplier;

// Net benefit: 30-50% income boost over tour duration
// Cost scales sublinearly so tours stay profitable at all scales
```

### Balance Validation Checkpoints

**Use these checks during development and testing:**

```javascript
// No single source dominates
for (const [source, revenue] of Object.entries(income_sources)) {
  const percentage = revenue / total_income;
  if (percentage > 0.60) {
    console.warn(`⚠️ ${source} provides ${percentage * 100}% - too dominant`);
  }
}

// Streaming stays relevant
const streaming_percentage = income_sources.streaming / total_income;
if (streaming_percentage < 0.15 || streaming_percentage > 0.30) {
  console.warn(`⚠️ Streaming at ${streaming_percentage * 100}% - should be 15-30%`);
}

// Previous tier contribution
const previous_tier_contribution = previous_tier_revenue / total_revenue;
if (previous_tier_contribution < 0.20) {
  console.warn(`⚠️ Previous tier only ${previous_tier_contribution * 100}% - should be 20%+`);
}
```

### Design Checklist

**When adding new income source or tier:**

- [ ] Previous tier still contributes 20%+ of total income
- [ ] New source costs 1.5-2.5x previous tier
- [ ] New source benefits 1.5-2.5x previous tier
- [ ] Player needs 2-3 income streams active simultaneously
- [ ] No single source exceeds 60% of total income
- [ ] Streaming remains 15-30% of income
- [ ] Progression speed allows mid-game mechanics to matter

### Constants Reference

```javascript
// Tune during playtesting - these are starting values:

const BASE_STREAMING_RATE = 0.001;           // Revenue per fan per song per tick
const BASE_TICK_RATE = 1.0;                  // Seconds per game tick

const ALBUM_INTEREST_RATE = 0.01;            // % of fans buying per day at peak
const ALBUM_LIFETIME_DAYS = 30;              // Days before unsold copies expire
const ALBUM_DEMAND_DECAY_RATE = 0.15;        // Exponential decay after week 1
const ALBUM_COOLDOWN_HOURS = 48;             // Hours between releases

const TOUR_MIN_DURATION_DAYS = 30;           // Shortest tour
const TOUR_MAX_DURATION_DAYS = 90;           // Longest tour
const TOUR_MIN_MULTIPLIER = 1.5;             // Weakest boost
const TOUR_MAX_MULTIPLIER = 3.0;             // Strongest boost
const TOUR_MIN_COOLDOWN_DAYS = 14;           // Min wait after tour
const TOUR_MAX_COOLDOWN_DAYS = 30;           // Max wait after tour
const BASE_TOUR_COST = 10000;                // Small venue baseline
const FAN_COST_SCALING = 0.5;                // Square root scaling

const TIER_SCALE_MIN = 1.5;                  // Minimum tier-to-tier multiplier
const TIER_SCALE_MAX = 2.5;                  // Maximum tier-to-tier multiplier
const TIER_SCALE_ABSOLUTE_MAX = 5.0;         // Never exceed this
```

### Save State Requirements

```javascript
// NO OFFLINE PROGRESS
// Game only ticks when tab is active

// Minimum save state:
{
  total_completed_songs: integer,
  songs_in_queue: [...],
  total_fans: integer,
  platform_multiplier: float,

  active_album_batch: {...} | null,
  last_album_timestamp: timestamp,

  active_tour: {...} | null,
  last_tour_end_time: timestamp,
  tour_cooldown_seconds: integer
}
```

### Centralized Configuration

**CRITICAL: All values, rates, and equations must be centrally configured from one JSON file.**

**Requirements:**

1. **Create src/lib/game/balance-config.json** containing all balance values
2. **Use descriptive naming** for all constants and formulas
3. **Group related values** by system (streaming, albums, tours, etc.)
4. **Include comments** explaining what each value affects
5. **Load at game startup** and use throughout the codebase
6. **Never hardcode magic numbers** in system files

**Example structure:**
```json
{
  "streaming": {
    "baseRate": 0.001,
    "description": "Revenue per fan per song per tick",
    "platformMultiplierDefault": 1.0,
    "minIncomePercentage": 0.15,
    "maxIncomePercentage": 0.30
  },
  "albums": {
    "interestRate": 0.01,
    "description": "Percentage of fans buying per day at peak demand",
    "lifetimeDays": 30,
    "demandDecayRate": 0.15,
    "cooldownHours": 48,
    "basecopiesPerDollar": 10,
    "scalePenalty": 0.5,
    "profitMargin": 1.5
  },
  "tours": {
    "minDurationDays": 30,
    "maxDurationDays": 90,
    "minMultiplier": 1.5,
    "maxMultiplier": 3.0,
    "minCooldownDays": 14,
    "maxCooldownDays": 30,
    "baseCost": 10000,
    "fanCostScaling": 0.5,
    "description": "Tours provide temporary multipliers to ALL income"
  },
  "tierScaling": {
    "minMultiplier": 1.5,
    "maxMultiplier": 2.5,
    "absoluteMax": 5.0,
    "previousTierMinContribution": 0.20,
    "description": "All tier progression must follow these scaling rules"
  },
  "balance": {
    "maxSingleSourcePercentage": 0.60,
    "minIncomeStreams": 2,
    "maxIncomeStreams": 3,
    "description": "Overall balance constraints"
  }
}
```

**Implementation:**
```typescript
// src/lib/game/balance-config.ts
import balanceConfigJson from './balance-config.json';

export const BALANCE_CONFIG = balanceConfigJson;

// Usage in system files:
import { BALANCE_CONFIG } from '$lib/game/balance-config';

const BASE_STREAMING_RATE = BALANCE_CONFIG.streaming.baseRate;
const ALBUM_INTEREST_RATE = BALANCE_CONFIG.albums.interestRate;
```

**Benefits:**
- Single source of truth for all balance values
- Easy to tune during playtesting without code changes
- Clear documentation of what each value affects
- Can hot-reload config during development
- Export/import config for balance testing iterations

---

## Current Status

**Phase 0: Project Setup & Foundation** ✅ **COMPLETE**
- ✅ Task 0.1: Initialize SvelteKit Project
- ✅ Task 0.2: Create TypeScript Type Definitions
- ✅ Task 0.3: Create Game Configuration Constants

**Phase 1: Core Game Systems** ✅ **COMPLETE**
- ✅ Task 1.1: Implement Game Engine & Loop
- ✅ Task 1.2: Implement Save/Load System
- ✅ Task 1.6: Create Utility Functions
- ✅ Task 1.3: Implement Song Generation System
- ✅ Task 1.4: Implement Income & Fan Systems
- ✅ Task 1.5: Implement Tech Upgrade System

**Phase 2: Name Generation & Content** ✅ **COMPLETE**
- ✅ Task 2.1: Create Word Lists for Mad-lib Names
- ✅ Task 2.2: Implement Name Generation Logic
- ✅ Task 2.3: Create Flavor Text & Content

**Phase 3: UI Components** ✅ **COMPLETE**
- ✅ Task 3.1: Create Resource Bar Component
- ✅ Task 3.2: Create Song Generator Component
- ✅ Task 3.3: Create Tech Tree Component
- ✅ Task 3.4: Create Upgrade Panel Component
- ✅ Task 3.5: Create Main Game Page Layout

**Phase 4: Advanced Systems** ⬜ **NOT STARTED**
- ⬜ Task 4.1: Implement Prestige System
- ⬜ Task 4.2: Implement Physical Album System
- ⬜ Task 4.3: Implement Tour & Concert System
- ⬜ Task 4.4: Implement Exploitation Abilities System
- ⬜ Task 4.5: Implement Monopoly & Platform Ownership
- ⬜ Task 4.6: Implement Trend Research System

**Phase 5: Additional UI Components** ⬜ **NOT STARTED**
- ⬜ Task 5.1: Create Physical Albums UI Component
- ⬜ Task 5.2: Create Tour Manager UI Component
- ⬜ Task 5.3: Create Prestige Modal Component
- ⬜ Task 5.4: Create Settings Modal Component
- ⬜ Task 5.5: Create Toast Notification Component
- ⬜ Task 5.6: Create Victory Screen Component

**Phase 6: Integration & Polish** ⬜ **NOT STARTED**
- ⬜ Task 6.1: Integrate All Systems into Game Loop
- ⬜ Task 6.2: Implement Phase Unlock System
- ⬜ Task 6.3: Add Industry Control Progress Bar
- ⬜ Task 6.4: Balance Tuning & Testing
- ⬜ Task 6.5: Write Comprehensive Test Suite

**Phase 7: Deployment & Documentation** ⬜ **NOT STARTED**
- ⬜ Task 7.1: Configure GitHub Pages Deployment
- ✅ Task 7.2: Create README Documentation (ALREADY COMPLETE)
- ⬜ Task 7.3: Create CHANGELOG

**Phase 8: Final Polish** ⬜ **OPTIONAL**
- ⬜ Task 8.1: Add Animations & Transitions
- ⬜ Task 8.2: Add Sound Effects
- ⬜ Task 8.3: Add Keyboard Shortcuts

**Total Progress:** 419 tests passing across completed phases

---

## Phase 0: Project Setup & Foundation ✅ COMPLETE

All Phase 0 tasks have been completed and verified.

### Task 0.1: Initialize SvelteKit Project ✅ COMPLETE

**Prerequisites:** None (first task)

**Status:** ✅ Complete

**Verification:**
- ✅ SvelteKit 2.47.1 initialized with Svelte 5.41.0
- ✅ TypeScript 5.9.3 configured in strict mode
- ✅ TailwindCSS 3.4.18 installed and configured
- ✅ Vitest 4.0.8 + @testing-library/svelte 5.2.8 set up
- ✅ @sveltejs/adapter-static configured for GitHub Pages
- ✅ All npm scripts working (dev, build, test, check)

### Task 0.2: Create TypeScript Type Definitions ✅ COMPLETE

**Prerequisites:** Task 0.1 must be complete

**Status:** ✅ Complete

**Verification:**
- ✅ File created: src/lib/game/types.ts (424 lines)
- ✅ All required interfaces defined (GameState, Song, Artist, Upgrade, etc.)
- ✅ No 'any' types - strict typing throughout
- ✅ Comprehensive JSDoc comments

### Task 0.3: Create Game Configuration Constants ✅ COMPLETE

**Prerequisites:** Task 0.2 must be complete

**Status:** ✅ Complete

**Verification:**
- ✅ File created: src/lib/game/config.ts (808 lines)
- ✅ All constants defined (TICK_RATE, costs, rates, upgrade definitions)
- ✅ 21 tech tier upgrades configured
- ✅ All properly typed with TypeScript interfaces

---

## Phase 1: Core Game Systems ✅ COMPLETE

**All tasks in Phase 1 have been completed.**

### Task 1.1: Implement Game Engine & Loop ✅ COMPLETE

**Prerequisites:** Phase 0 complete

**Status:** ✅ Complete

**What to do:**
Create the core game engine with tick-based loop running at 10 TPS.

1. Create src/lib/game/engine.ts with GameEngine class
2. Constructor takes GameState parameter
3. start() method initializes interval at 100ms
4. stop() method clears interval and auto-saves
5. tick() method calculates deltaTime and calls all system processors
6. Implement frame-independent logic using deltaTime
7. Add auto-save every 10 seconds
8. Write unit tests in src/lib/game/engine.test.ts

**Files to create:**
- src/lib/game/engine.ts
- src/lib/game/engine.test.ts

**Files to reference:**
- src/lib/game/types.ts
- src/lib/game/config.ts

**Success criteria:**
- Engine runs at consistent 10 TPS
- DeltaTime calculated correctly
- Can start and stop cleanly
- Unit tests pass

### Task 1.2: Implement Save/Load System ✅ COMPLETE

**Prerequisites:** Task 1.1 complete

**Status:** ✅ Complete

**What to do:**
Create localStorage-based save/load system with backup and validation.

1. Create src/lib/game/save.ts with functions:
   - saveGame(state: GameState): boolean
   - loadGame(): GameState | null
   - loadBackup(): GameState | null
   - validateSave(state: any): state is GameState
   - deleteSave(): void
   - exportSave(): string | null
   - importSave(fileContent: string): boolean
2. Always keep a backup of the previous save
3. Validate save structure before loading
4. Handle localStorage quota errors gracefully
5. Support export/import for manual backups
6. Write unit tests in src/lib/game/save.test.ts

**Files to create:**
- src/lib/game/save.ts
- src/lib/game/save.test.ts

**Success criteria:**
- Saves persist across page reloads
- Invalid saves fall back to backup
- Export creates downloadable JSON file
- Import validates before accepting
- Unit tests verify validation logic

### Task 1.6: Create Utility Functions ✅ COMPLETE

**Prerequisites:** Task 1.2 complete

**Status:** ✅ Complete

**What to do:**
Create helper utilities for formatting, calculations, and common operations.

1. Create src/lib/game/utils.ts with:
   - formatMoney(amount: number): string (handles K, M, B, T)
   - formatNumber(num: number): string
   - formatTime(seconds: number): string
   - formatDuration(ms: number): string
   - clamp(value: number, min: number, max: number): number
   - lerp(a: number, b: number, t: number): number
   - getRandomInt(min: number, max: number): number
2. Handle edge cases (negative numbers, very large numbers, etc.)
3. Write unit tests in src/lib/game/utils.test.ts

**Files to create:**
- src/lib/game/utils.ts
- src/lib/game/utils.test.ts

**Success criteria:**
- All formatters handle edge cases
- Numbers display cleanly (e.g., "$1.23M" not "$1234567")
- Unit tests cover all formatting scenarios

### Task 1.3: Implement Song Generation System ✅ COMPLETE

**Prerequisites:** Task 1.6 complete (needs utils for formatting)

**Status:** ✅ Complete

**What to do:**
Create the song generation system with queue, cost calculation, and income.

1. Create src/lib/systems/songs.ts with functions:
   - generateSong(state: GameState): Song
   - queueSongs(state: GameState, count: number): boolean
   - processSongQueue(state: GameState, deltaTime: number): void
   - calculateSongCost(state: GameState, count: number): number
   - calculateSongIncome(state: GameState): number
   - calculateFanGeneration(state: GameState): number
2. Queue system processes songs sequentially
3. Generation time based on tech tier
4. Songs become free at tech tier 2+
5. Income scales with tech tier and experience multiplier
6. Use crypto.randomUUID() for song IDs
7. Write unit tests in src/lib/systems/songs.test.ts

**Files to create:**
- src/lib/systems/songs.ts
- src/lib/systems/songs.test.ts

**Success criteria:**
- Songs queue correctly
- Cost calculation matches tech tier
- Income scales properly
- Queue processes sequentially
- Unit tests have >80% coverage

**Implementation Reference:**
See [Song Generation State Tracking](#song-generation-state-tracking) in Economic Balance Principles section for exact state structure and completion logic. Key requirements:
- Track `total_completed_songs` (increments only, never decreases)
- Track `songs_in_queue` array with completion_time and song_index
- DO NOT store per-song metadata (quality, genre, etc.)
- All bonuses apply globally to production rate

### Task 1.4: Implement Income & Fan Systems ✅ COMPLETE

**Prerequisites:** Task 1.3 complete

**Status:** ✅ Complete

**What to do:**
Create income generation and fan accumulation systems.

1. Create src/lib/systems/income.ts:
   - generateIncome(state: GameState, deltaTime: number): void
   - calculateTotalIncome(state: GameState): number
   - applyIncomeMultipliers(state: GameState, baseIncome: number): number
2. Create src/lib/systems/fans.ts:
   - generateFans(state: GameState, deltaTime: number): void
   - calculateFanGeneration(state: GameState): number
   - updatePeakFans(state: GameState): void
3. Income from songs accumulates each tick
4. Fans grow passively from songs
5. Track peak fans for prestige bonuses
6. Apply active boost multipliers
7. Write unit tests for both systems

**Files to create:**
- src/lib/systems/income.ts
- src/lib/systems/income.test.ts
- src/lib/systems/fans.ts
- src/lib/systems/fans.test.ts

**Success criteria:**
- Income accumulates correctly over time
- Fan count increases passively
- Peak fans tracked accurately
- Frame-independent calculations
- Unit tests verify calculations

**Implementation Reference:**
See [Streaming Revenue Formula](#streaming-revenue-formula) in Economic Balance Principles section. **CRITICAL requirements:**
- Formula: `streaming_revenue_per_tick = total_completed_songs * total_fans * BASE_STREAMING_RATE * platform_multiplier`
- BASE_STREAMING_RATE is a constant (e.g., 0.001)
- platform_multiplier = 1.0 by default (only increases with late-game platform ownership)
- **NO exponential multipliers allowed on streaming**
- Streaming must remain 15-30% of total income throughout the game
- Scales linearly with songs and fans ONLY

### Task 1.5: Implement Tech Upgrade System ✅ COMPLETE

**Prerequisites:** Task 1.4 complete

**Status:** ✅ Complete

**What to do:**
Create the tech tier upgrade system with 7 tiers and sub-tiers.

1. Create src/lib/systems/tech.ts:
   - purchaseTechUpgrade(state: GameState, upgradeId: string): boolean
   - canAffordUpgrade(state: GameState, upgradeId: string): boolean
   - applyTechEffects(state: GameState, upgrade: TechUpgrade): void
   - getTechUpgrades(): TechUpgrade[]
   - unlockPrestigePoints(state: GameState): void
2. Define all 7 tech tiers with 3 sub-tiers each
3. Apply effects: generation speed, income multiplier, unlock systems
4. Create src/lib/data/tech-upgrades.ts with upgrade definitions
5. Write unit tests in src/lib/systems/tech.test.ts

**Files to create:**
- src/lib/systems/tech.ts
- src/lib/data/tech-upgrades.ts
- src/lib/systems/tech.test.ts

**Success criteria:**
- All 7 tiers purchasable
- Effects apply correctly
- Sub-tiers unlock progressively
- Prestige unlocks at correct tiers
- Unit tests verify purchase logic

---

## Phase 2: Name Generation & Content ✅ COMPLETE

**All tasks in Phase 2 have been completed.**

### Task 2.1: Create Word Lists for Mad-lib Names ✅ COMPLETE

**Prerequisites:** Phase 1 complete

**Status:** ✅ Complete

**What to do:**
Create comprehensive word lists for procedurally generating song and artist names.

1. Create src/lib/data/words.ts with arrays:
   - ADJECTIVES: 50-100 adjectives (e.g., "Electric", "Midnight", "Velvet")
   - NOUNS: 50-100 nouns (e.g., "Dreams", "Thunder", "Waves")
   - PLACES: 50+ places (e.g., "Tokyo", "Paradise", "Underground")
   - VERBS: 50+ verbs (e.g., "Running", "Dancing", "Falling")
   - EMOTIONS: 50+ emotions (e.g., "Lonely", "Euphoric", "Lost")
   - COLORS: 20-30 colors (e.g., "Crimson", "Azure", "Neon")
2. Include variety: abstract, concrete, edgy, commercial, artistic
3. Export all arrays as constants

**Files to create:**
- src/lib/data/words.ts

**Success criteria:**
- 50-100 words per major category
- At least 300 total words across all categories
- Mix of serious and humorous options
- All words appropriate for game theme

### Task 2.2: Implement Name Generation Logic ✅ COMPLETE

**Prerequisites:** Task 2.1 complete

**Status:** ✅ Complete

**What to do:**
Create mad-lib style name generation for songs and artists using word lists.

1. Create src/lib/data/names.ts with:
   - generateSongName(state?: GameState): string
   - generateArtistName(): string
   - generateAlbumName(): string
2. Multiple name patterns:
   - "[Adjective] [Noun]" (e.g., "Electric Dreams")
   - "[Verb] in [Place]" (e.g., "Dancing in Tokyo")
   - "[Emotion] [Noun]" (e.g., "Lonely Nights")
   - "[Noun] of [Place]" (e.g., "Thunder of Paradise")
3. Randomly select patterns and words
4. Ensure no duplicates in recent names (cache last 100)
5. Write unit tests in src/lib/data/names.test.ts

**Files to create:**
- src/lib/data/names.ts
- src/lib/data/names.test.ts

**Success criteria:**
- Generates unique, coherent names
- Multiple pattern variations
- No duplicate names in short timeframe
- Unit tests verify pattern logic

### Task 2.3: Create Flavor Text & Content ✅ COMPLETE

**Prerequisites:** Task 2.2 complete

**Status:** ✅ Complete

**What to do:**
Create flavor text for upgrades, achievements, and game events.

1. Create src/lib/data/content.ts with:
   - Tech tier descriptions (thematic, satirical)
   - Exploitation ability descriptions
   - Phase unlock messages
   - Prestige flavor text
   - Victory screen text
   - Tutorial hints
2. Match game's satirical tone about capitalism vs art
3. Increasingly absurd at higher tiers
4. Export as typed objects

**Files to create:**
- src/lib/data/content.ts

**Success criteria:**
- All major game events have flavor text
- Tone matches game theme (satirical/absurd)
- No spelling/grammar errors

---

## Phase 3: UI Components ✅ COMPLETE

**All UI component tasks in Phase 3 have been completed.**

### Task 3.1: Create Resource Bar Component ✅ COMPLETE

**Prerequisites:** Phase 2 complete

**Status:** ✅ Complete

**What to do:**
Build the ResourceBar component to display money, songs, fans, and GPU resources.

1. Create src/lib/components/ResourceBar.svelte:
   - Props: gameState (bindable)
   - Display money, total songs, fans, GPU (if unlocked)
   - Show income per second next to money
   - Show industry control progress bar
   - Use Svelte 5 runes ($props, $derived)
   - Use TailwindCSS for styling
   - Dark theme (bg-game-bg, bg-game-panel)
   - Use icons or emojis for resources (💰, 🎵, 👥)
   - Responsive layout (stack on mobile)
2. Create src/lib/components/ResourceBar.test.ts:
   - Test rendering with different game states
   - Test that industry control bar displays correctly
   - Test GPU display when unlocked vs locked
   - Use @testing-library/svelte

**Files to create:**
- src/lib/components/ResourceBar.svelte
- src/lib/components/ResourceBar.test.ts

**Success criteria:**
- Component renders correctly
- Numbers format properly (use formatMoney, formatNumber)
- Tests have >80% coverage
- Follows Svelte 5 best practices

### Task 3.2: Create Song Generator Component ✅ COMPLETE

**Prerequisites:** Task 3.1 complete

**Status:** ✅ Complete

**What to do:**
Build the SongGenerator component for queuing songs with 1x/5x/10x/Max buttons.

1. Create src/lib/components/SongGenerator.svelte:
   - Props: gameState (bindable)
   - Show current cost per song (or "FREE")
   - Show generation time
   - Display progress bar for current song being generated
   - Show queue length
   - Buttons: 1x, 5x, 10x, Max
   - Disable buttons when can't afford
   - Use Svelte 5 syntax (onclick not on:click)
   - Progress bar animated during generation
   - Queue shows "X songs queued"
2. Create src/lib/components/SongGenerator.test.ts:
   - Test button enable/disable logic
   - Test queue display updates
   - Test cost calculation display
   - Test Max button calculates correctly

**Files to create:**
- src/lib/components/SongGenerator.svelte
- src/lib/components/SongGenerator.test.ts

**Success criteria:**
- All buttons functional
- Progress bar animates smoothly
- Tests cover user interactions
- Uses queueSongs from src/lib/systems/songs.ts

### Task 3.3: Create Tech Tree Component ✅ COMPLETE

**Prerequisites:** Task 3.2 complete

**Status:** ✅ Complete

**What to do:**
Build the TechTree component to display and purchase tech tier upgrades.

1. Create src/lib/components/TechTree.svelte:
   - Props: gameState (bindable)
   - Display all 7 tech tiers vertically
   - Show current tier highlighted
   - Show next tier cost and requirements
   - Show sub-tier upgrades for each tier
   - Purchase button (disabled if can't afford)
   - Visual progression (locked/unlocked/purchased states)
   - Vertical timeline/tree layout
   - Current tier highlighted
   - Locked tiers grayed out
   - Icons for each tier
   - Show effects on hover
2. Create src/lib/components/TechTree.test.ts:
   - Test tier display logic
   - Test purchase button states
   - Test sub-tier visibility

**Files to create:**
- src/lib/components/TechTree.svelte
- src/lib/components/TechTree.test.ts

**Success criteria:**
- Clear visual progression
- Locked tiers show requirements
- Purchase flow works correctly
- Tests cover all states

### Task 3.4: Create Upgrade Panel Component ✅ COMPLETE

**Prerequisites:** Task 3.3 complete

**Status:** ✅ Complete

**What to do:**
Build the UpgradePanel component for exploitation abilities and other upgrades.

1. Create src/lib/components/UpgradePanel.svelte:
   - Props: gameState (bindable)
   - Display unlocked exploitation abilities
   - Show activated abilities with timers
   - Purchase/activate buttons
   - Show costs and effects
   - Tab system if needed (Streaming, Physical, Concerts, etc.)
   - Active abilities show countdown timer
   - Costs scale up with use
   - Visual feedback when activated
   - Group by category
2. Create src/lib/components/UpgradePanel.test.ts:
   - Test ability activation
   - Test timer display
   - Test tab switching if implemented

**Files to create:**
- src/lib/components/UpgradePanel.svelte
- src/lib/components/UpgradePanel.test.ts

**Success criteria:**
- Abilities activate correctly
- Timers count down accurately
- Visual states clear (available/active/cooldown)
- Tests verify activation logic

### Task 3.5: Create Main Game Page Layout ✅ COMPLETE

**Prerequisites:** Task 3.4 complete

**Status:** ✅ Complete

**What to do:**
Build the main +page.svelte with game layout and component composition.

1. Create src/routes/+page.svelte:
   - Initialize gameState with $state rune
   - Load game on mount (or create new)
   - Start GameEngine on mount
   - Stop GameEngine on destroy
   - Layout: header, ResourceBar, main content grid, sidebar
   - Import all components created in Phase 3
   - Responsive layout (mobile-friendly)
   - Header: game title, artist name, settings button
   - ResourceBar: full width below header
   - Main grid: 2 columns on desktop, 1 on mobile
     - Left: SongGenerator, PhysicalAlbums, Tours (when unlocked)
     - Right: TechTree, UpgradePanel
   - Prestige button (when unlocked)
2. Create src/routes/+layout.svelte:
   - Basic HTML structure
   - Import global Tailwind styles
   - Meta tags for SEO

**Files to create:**
- src/routes/+page.svelte
- src/routes/+layout.svelte

**Success criteria:**
- Game initializes correctly
- All components render
- Game loop starts and stops properly
- Responsive design works on mobile
- State persists across reloads

---

## Phase 4: Advanced Systems ⬜ NOT STARTED

**Complete these tasks in order. Each task depends on the previous one.**

### Task 4.1: Implement Prestige System

**Prerequisites:** Phase 3 complete

**Status:** ⬜ Not Started

**What to do:**
Create the prestige system with artist reset and legacy income.

1. Create src/lib/systems/prestige.ts:
   - canPrestige(state: GameState): boolean
   - performPrestige(state: GameState): boolean
   - calculateExperienceBonus(state: GameState): number
   - calculateLegacyIncome(state: GameState): number
   - processLegacyArtists(state: GameState, deltaTime: number): void
2. When prestiging:
   - Save current artist as legacy artist
   - IMPORTANT: Legacy artist fading mechanic:
     * Keep the 2-3 most recent legacy artists active
     * When a 4th prestige occurs, the oldest legacy artist "retires"
     * Retired artists stop generating income (use array.shift())
     * This prevents infinite exponential growth
   - Legacy artists generate passive income (80% of current rate)
   - Calculate experience multiplier from peak fans
   - Cross-promotion: legacy artists slowly funnel fans to new artist
   - Reset money, songs, fans, queue
   - Keep tech upgrades and industry control
3. Prestige unlocks at tech tier milestones (3, 5, 6, 7)
4. Write unit tests in src/lib/systems/prestige.test.ts

**Files to create:**
- src/lib/systems/prestige.ts
- src/lib/systems/prestige.test.ts

**Success criteria:**
- Prestige resets correctly
- Legacy artists generate income
- Experience bonus calculates properly
- Old legacy artists fade after 3 prestiges
- Unit tests verify all calculations

### Task 4.2: Implement Physical Album System

**Prerequisites:** Task 4.1 complete

**Status:** ⬜ Not Started

**What to do:**
Create the physical album system that unlocks at phase 2.

1. Create src/lib/systems/physical.ts:
   - unlockPhysicalAlbums(state: GameState): boolean
   - releaseAlbum(state: GameState): PhysicalAlbum
   - processPhysicalAlbums(state: GameState, deltaTime: number): void
   - calculateAlbumPayout(state: GameState): number
   - generateVariants(state: GameState): number
2. Albums auto-release at song milestones (every X songs)
3. More fans = more variants (standard, deluxe, vinyl, limited)
4. One-time payouts per album
5. Can re-release old albums later
6. Unlock requirements:
   - 100 songs completed
   - 10,000 fans
   - $5,000
7. Write unit tests in src/lib/systems/physical.test.ts

**Files to create:**
- src/lib/systems/physical.ts
- src/lib/systems/physical.test.ts

**Success criteria:**
- Unlocks at correct milestone
- Albums release automatically
- Variants scale with fan count
- Payouts calculated correctly
- Unit tests verify logic

**Implementation Reference:**
See [Album Release Mechanics](#album-release-mechanics) in Economic Balance Principles section. **CRITICAL requirements:**

**State to track:**
```javascript
{
  active_album_batch: {
    copies_pressed: integer,
    copies_remaining: integer,
    price_per_copy: float,
    press_timestamp: timestamp,
    revenue_generated: float
  } | null,
  last_album_timestamp: timestamp
}
```

**Key constraints:**
- Only 1 active album batch at a time
- 48-hour cooldown between releases (ALBUM_COOLDOWN_HOURS = 48)
- Unsold copies expire after 30 days (ALBUM_LIFETIME_DAYS = 30)
- Demand curve: Week 1 at 100%, then exponential decay (Math.exp(-0.15 * days_past_peak))
- Week 2: 35%, Week 3: 12%, Week 4: 3%

**Sales formula per tick:**
```javascript
fan_demand_rate = total_fans * 0.01 * demand_multiplier;  // 1% of fans buy at peak
potential_sales = fan_demand_rate * (tick_duration_seconds / 86400);
sales_this_tick = Math.min(copies_remaining, potential_sales);
revenue_this_tick = sales_this_tick * price_per_copy;
```

**Pricing (sublinear scaling):**
```javascript
// More expensive to press larger batches
copies = Math.floor(10 * Math.pow(cost_paid, 0.5));  // Square root scaling
// Example: $1000 = 10k copies, $4000 = 20k copies (not 40k)

sale_price = (cost_paid / copies) * 1.5;  // 50% profit if all sell
```

### Task 4.3: Implement Tour & Concert System

**Prerequisites:** Task 4.2 complete

**Status:** ⬜ Not Started

**What to do:**
Create the tour and concert system that unlocks at phase 3.

1. Create src/lib/systems/tours.ts:
   - unlockTours(state: GameState): boolean
   - startTour(state: GameState, tier: number, cost: number): boolean
   - checkTourExpiration(state: GameState): void
   - calculateTourCost(tier: number, duration: number, multiplier: number): number
   - calculateTotalIncome(state: GameState): number (with tour multiplier applied)
2. Tours provide temporary multipliers to ALL income sources
3. **ONLY 1 tour active at a time** - tours cannot stack
4. Tours have duration (30-90 days) and cooldown (14-30 days)
5. Upgrade system for exploitation mechanics
6. Unlock requirements:
   - 10 physical albums released
   - 100,000 fans
   - Own Local Models (tech tier 3)
7. Write unit tests in src/lib/systems/tours.test.ts

**Files to create:**
- src/lib/systems/tours.ts
- src/lib/systems/tours.test.ts

**Success criteria:**
- Unlocks at correct milestone
- Tours boost ALL income sources with multiplier
- Only 1 tour active at a time (validation enforced)
- Tour expires after duration, cooldown starts
- Unit tests verify calculations

**Implementation Reference:**
See [Tour Mechanics](#tour-mechanics) in Economic Balance Principles section. **CRITICAL requirements:**

**State to track:**
```javascript
{
  active_tour: {
    start_time: timestamp,
    end_time: timestamp,              // start_time + duration
    duration_seconds: integer,        // 30-90 days
    revenue_multiplier: float,        // 1.5-3.0x
    tier: integer
  } | null,
  last_tour_end_time: timestamp,
  tour_cooldown_seconds: integer      // 14-30 days
}
```

**Key constraints:**
- **ONLY 1 active tour at a time - NO STACKING**
- Cannot extend or modify mid-tour
- Cannot queue next tour
- Cooldown starts after tour ends, not when purchased
- Tour multiplier applies to ALL income sources

**Revenue boost application:**
```javascript
function calculateTotalIncome() {
  let base_income = streaming + albums + merch + ...;

  if (active_tour !== null && now() < active_tour.end_time) {
    return base_income * active_tour.revenue_multiplier;
  }

  return base_income;
}
```

**Tour cost formula (sublinear scaling):**
```javascript
venue_size_cost = 10000 * Math.pow(total_fans / 1000, 0.5);  // Square root
tier_multiplier = Math.pow(1.5, tier);
duration_multiplier = duration / (30 * 86400);
total_cost = venue_size_cost * tier_multiplier * duration_multiplier;

// Net benefit: 30-50% income boost over tour duration
// Example: 1M fans, 30-day tour, 2x multiplier
//   - Revenue without tour: $25.9M
//   - Revenue with tour: $51.8M (gain: $25.9M)
//   - Tour cost: ~$10M
//   - Net profit: $15.9M (61% gain)
```

### Task 4.4: Implement Exploitation Abilities System

**Prerequisites:** Task 4.3 complete

**Status:** ⬜ Not Started

**What to do:**
Create activated exploitation abilities (bot streams, playlist placement, etc.).

1. Create src/lib/systems/exploitation.ts:
   - activateAbility(state: GameState, abilityId: string): boolean
   - processActiveBoosts(state: GameState, deltaTime: number): void
   - getAvailableAbilities(state: GameState): ExploitationAbility[]
   - calculateAbilityCost(state: GameState, abilityId: string): number
2. Define abilities from game-details.md:
   - Buy Bot Streams (income boost)
   - Pay for Playlist Placement (fan boost)
   - Social Media Campaigns (fan growth)
   - Limited Edition Variants (album payouts)
   - Scalp Own Tickets (tour income)
   - And more from Exploitation Mechanics section
3. Abilities are temporary boosts with costs that scale up
4. Multiple can be active simultaneously
5. No cooldowns, just escalating costs
6. Create src/lib/data/abilities.ts with ability definitions
7. Write unit tests in src/lib/systems/exploitation.test.ts

**Files to create:**
- src/lib/systems/exploitation.ts
- src/lib/data/abilities.ts
- src/lib/systems/exploitation.test.ts

**Success criteria:**
- Abilities activate correctly
- Boosts apply properly
- Costs scale on repeated use
- Duration tracked accurately
- Unit tests verify boost calculations

### Task 4.5: Implement Monopoly & Platform Ownership

**Prerequisites:** Task 4.4 complete

**Status:** ⬜ Not Started

**What to do:**
Create the late-game monopoly system for owning industry platforms.

1. Create src/lib/systems/monopoly.ts:
   - unlockPlatformOwnership(state: GameState): boolean
   - purchasePlatform(state: GameState, platformId: string): boolean
   - processPlatformIncome(state: GameState, deltaTime: number): void
   - calculateIndustryControl(state: GameState): number
   - updateControlProgress(state: GameState): void
2. Define platforms from game-details.md:
   - Own streaming platform
   - Control algorithm
   - Manipulate charts
   - Acquire Billboard
   - Buy the Grammys
   - Own training data/models
3. Each platform increases industry control %
4. Platforms generate massive passive income
5. Unlock requirements:
   - 50 tours completed
   - 1,000,000 fans
   - Own Your Software (tech tier 6)
6. Create src/lib/data/platforms.ts with platform definitions
7. Write unit tests in src/lib/systems/monopoly.test.ts

**Files to create:**
- src/lib/systems/monopoly.ts
- src/lib/data/platforms.ts
- src/lib/systems/monopoly.test.ts

**Success criteria:**
- Unlocks at correct milestone
- Platforms purchasable
- Industry control bar fills correctly
- Passive income scales massively
- Unit tests verify calculations

### Task 4.6: Implement Trend Research System

**Prerequisites:** Task 4.5 complete

**Status:** ⬜ Not Started

**What to do:**
Create the trend research system for genre targeting.

1. Create src/lib/systems/trends.ts:
   - researchTrend(state: GameState): boolean
   - changeTrendingGenre(state: GameState): void
   - getTrendingGenre(state: GameState): string
   - getTrendBonus(state: GameState): number
2. Costs money early game, GPU later
3. Changes current trending genre
4. Next songs generated follow trending genre
5. Trending songs attract more fans
6. Genres: pop, hip-hop, rock, electronic, indie, jazz, classical, etc.
7. Write unit tests in src/lib/systems/trends.test.ts

**Files to create:**
- src/lib/systems/trends.ts
- src/lib/systems/trends.test.ts

**Success criteria:**
- Genre changes correctly
- Trending songs get bonus fan generation
- Cost switches to GPU after unlock
- Unit tests verify trend bonuses

---

## Phase 5: Additional UI Components ⬜ NOT STARTED

**Complete these tasks in order. Each task depends on the previous one.**

### Task 5.1: Create Physical Albums UI Component

**Prerequisites:** Phase 4 complete

**Status:** ⬜ Not Started

**What to do:**
Build PhysicalAlbums component to display album releases and variants.

1. Create src/lib/components/PhysicalAlbums.svelte:
   - Props: gameState (bindable)
   - Display total albums released
   - Show recent album releases with names
   - Display variants (standard, deluxe, vinyl, limited)
   - Show next album progress (songs until next release)
   - Manual re-release button for old albums
   - Only show when: gameState.unlockedSystems.physicalAlbums === true
2. Create src/lib/components/PhysicalAlbums.test.ts:
   - Test album display
   - Test variant display based on fans
   - Test re-release button

**Files to create:**
- src/lib/components/PhysicalAlbums.svelte
- src/lib/components/PhysicalAlbums.test.ts

**Success criteria:**
- Shows when unlocked
- Displays album history
- Variants display correctly
- Tests cover rendering logic

### Task 5.2: Create Tour Manager UI Component

**Prerequisites:** Task 5.1 complete

**Status:** ⬜ Not Started

**What to do:**
Build TourManager component to display active tours and income.

1. Create src/lib/components/TourManager.svelte:
   - Props: gameState (bindable)
   - Display active tours
   - Show tour income per second
   - Button to start new tour (if capacity available)
   - List of exploitation upgrades for tours
   - Only show when: gameState.unlockedSystems.tours === true
2. Create src/lib/components/TourManager.test.ts:
   - Test tour display
   - Test start tour button logic
   - Test multiple tour display

**Files to create:**
- src/lib/components/TourManager.svelte
- src/lib/components/TourManager.test.ts

**Success criteria:**
- Active tours displayed
- Can start new tours
- Income displayed accurately
- Tests verify interactions

### Task 5.3: Create Prestige Modal Component

**Prerequisites:** Task 5.2 complete

**Status:** ⬜ Not Started

**What to do:**
Build PrestigeModal component for the "New Artist" prestige flow.

1. Create src/lib/components/PrestigeModal.svelte:
   - Props: open (boolean), onclose (function)
   - Show prestige benefits:
     - Current peak fans
     - Experience multiplier gain
     - Legacy artist income
   - Show what's kept (tech, industry control)
   - Show what's reset (money, songs, fans)
   - Confirm button (with confirmation step)
   - Cancel button
   - Modal overlay with dark backdrop
   - Clear warnings about reset
   - Highlight bonuses in green
   - Two-step confirmation to prevent accidents
2. Create src/lib/components/PrestigeModal.test.ts:
   - Test modal open/close
   - Test prestige button logic
   - Test confirmation flow

**Files to create:**
- src/lib/components/PrestigeModal.svelte
- src/lib/components/PrestigeModal.test.ts

**Success criteria:**
- Modal displays correctly
- Prestige executes on confirm
- Shows accurate bonus calculations
- Tests cover full flow

### Task 5.4: Create Settings Modal Component

**Prerequisites:** Task 5.3 complete

**Status:** ⬜ Not Started

**What to do:**
Build SettingsModal with save management and game options.

1. Create src/lib/components/SettingsModal.svelte:
   - Props: open (boolean), onclose (function)
   - Export save button (triggers download)
   - Import save button (file picker)
   - Delete save button (with confirmation)
   - Show save timestamp
   - Show game version
   - Optional: Toggle settings (animations, etc.)
   - Export creates .json file download
   - Import validates before accepting
   - Delete has confirmation dialog
   - Show last save time
2. Create src/lib/components/SettingsModal.test.ts:
   - Test export functionality
   - Test import validation
   - Test delete confirmation

**Files to create:**
- src/lib/components/SettingsModal.svelte
- src/lib/components/SettingsModal.test.ts

**Success criteria:**
- Export/import works correctly
- Delete requires confirmation
- Tests verify save operations

### Task 5.5: Create Toast Notification Component

**Prerequisites:** Task 5.4 complete

**Status:** ⬜ Not Started

**What to do:**
Build Toast component for showing temporary notifications.

1. Create src/lib/components/Toast.svelte:
   - Props: message (string), type (info/success/warning/error), duration
   - Auto-dismiss after duration (default 3s)
   - Animate in/out (slide from top or bottom)
   - Stack multiple toasts
   - Different colors for types
2. Create src/lib/stores/notifications.ts:
   - showToast(message, type, duration) function
   - Queue management for multiple toasts
3. Use cases:
   - "Album released!"
   - "Prestige available!"
   - "New tech tier unlocked!"
   - "Save exported successfully"
   - "Error: Save file invalid"

**Files to create:**
- src/lib/components/Toast.svelte
- src/lib/stores/notifications.ts

**Success criteria:**
- Toasts display and auto-dismiss
- Multiple toasts stack correctly
- Colors match message type
- Smooth animations

### Task 5.6: Create Victory Screen Component

**Prerequisites:** Task 5.5 complete

**Status:** ⬜ Not Started

**What to do:**
Build VictoryScreen component displayed when industry control reaches 100%.

1. Create src/lib/components/VictoryScreen.svelte:
   - Props: gameState (readonly)
   - Display "You Control the Music Industry"
   - Show final stats:
     - Total prestiges
     - Total songs created
     - Peak fans achieved
     - Time played
   - Show legacy artists
   - Option to continue playing
   - Option to start completely fresh
   - Full-screen overlay
   - Celebratory theme
   - Stats displayed prominently
   - Optional: Confetti animation

**Files to create:**
- src/lib/components/VictoryScreen.svelte

**Success criteria:**
- Displays when industryControl >= 100
- Stats accurate
- Can continue playing after victory
- Visually celebratory

---

## Phase 6: Integration & Polish ⬜ NOT STARTED

**Complete these tasks in order. Each task depends on the previous one.**

### Task 6.1: Integrate All Systems into Game Loop

**Prerequisites:** Phase 5 complete

**Status:** ⬜ Not Started

**What to do:**
Connect all game systems to the main game engine tick() method.

1. Update src/lib/game/engine.ts tick() method to call:
   - processSongQueue (from songs.ts)
   - generateIncome (from income.ts)
   - generateFans (from fans.ts)
   - processActiveBoosts (from exploitation.ts)
   - processPhysicalAlbums (from physical.ts)
   - processTours (from tours.ts)
   - processLegacyArtists (from prestige.ts)
   - processPlatformIncome (from monopoly.ts)
   - updateControlProgress (from monopoly.ts)
   - checkPhaseUnlocks (new function to check unlock conditions)
2. Create src/lib/systems/unlocks.ts:
   - checkPhaseUnlocks(state: GameState): void
   - checkPhysicalAlbumUnlock(state: GameState): void
   - checkTourUnlock(state: GameState): void
   - checkPlatformUnlock(state: GameState): void
   - Show toast notifications when unlocking new systems
3. Ensure all systems run in correct order
4. Verify deltaTime passed correctly
5. Test full game loop with all systems active
6. Write integration tests in src/lib/game/integration.test.ts

**Files to update:**
- src/lib/game/engine.ts

**Files to create:**
- src/lib/systems/unlocks.ts
- src/lib/game/integration.test.ts

**Success criteria:**
- All systems execute each tick
- Unlock notifications appear
- No performance issues at 10 TPS
- All systems integrated correctly
- Integration tests pass

### Task 6.2: Implement Phase Unlock System

**Prerequisites:** Task 6.1 complete

**Status:** ⬜ Not Started

**What to do:**
Create the phase progression system that unlocks features as milestones are reached.

1. Update src/lib/systems/unlocks.ts:
   - Track which phase player is in (1-5)
   - Check unlock conditions every tick
   - Set flags in state.unlockedSystems
   - Trigger toast notifications
   - Update UI to show newly unlocked features
2. Unlock conditions from game-details.md:
   - Phase 2 (Physical): 100 songs, 10k fans, $5k
   - Phase 3 (Tours): 10 albums, 100k fans, tech tier 3
   - Phase 4 (Platforms): 50 tours, 1M fans, tech tier 6
   - Phase 5 (Automation): 3+ platforms, 10M fans, tech tier 7
3. Track milestones in industry control bar

**Files to update:**
- src/lib/systems/unlocks.ts

**Success criteria:**
- Phases unlock at correct milestones
- Notifications appear on unlock
- UI updates dynamically
- Industry control increases

### Task 6.3: Add Industry Control Progress Bar

**Prerequisites:** Task 6.2 complete

**Status:** ⬜ Not Started

**What to do:**
Implement the persistent industry control progress bar that fills to 100% for victory.

1. Update src/lib/systems/monopoly.ts:
   - calculateIndustryControl(state: GameState): number
   - updateControlProgress(state: GameState): void
2. Progress fills based on:
   - Fan milestones (10k, 100k, 1M, 10M) - 2-5% each
   - Tech tier achievements (local models, own software, AI agents) - 5-10% each
   - Phase unlocks (streaming → physical → concerts → platform ownership) - 5-8% each
   - Each prestige adds a chunk - 5-10% per prestige
   - Platform ownership (streaming platform, algorithm control, Billboard, Grammys, etc.) - 3-7% each
3. Implementation notes:
   - Store industryControl as 0-100 number in GameState
   - Progress persists through prestige (never reset this value)
   - Victory modal triggers when reaching 100%
4. Reaches 100% after 3-5 prestiges (as designed)
5. Trigger victory screen at 100%
6. Update ResourceBar component to show industry control prominently

**Files to update:**
- src/lib/systems/monopoly.ts
- src/lib/components/ResourceBar.svelte

**Success criteria:**
- Progress bar visible throughout game
- Fills based on achievements
- Persists through prestige
- Victory screen at 100%
- Clear visual progression

### Task 6.4: Balance Tuning & Testing

**Prerequisites:** Task 6.3 complete

**Status:** ⬜ Not Started

**What to do:**
Perform comprehensive balance testing and tune game progression.

1. Test full playthrough from start to prestige 1
2. Verify progression timing:
   - First 5 minutes: manual generation
   - 30-60 minutes: first tech upgrade
   - 1-2 hours: first prestige
3. Adjust values in src/lib/game/config.ts:
   - Income rates (base and scaling)
   - Costs (tech tiers, abilities, platforms)
   - Unlock thresholds
   - Generation speeds
   - Fan generation rates
4. Test all systems work together:
   - Songs generate correctly
   - Income accumulates
   - Fans grow
   - Upgrades apply effects
   - Prestige resets properly
   - Victory achievable in 8-12 hours
5. Create balance report in docs/balance-report.md documenting:
   - Time to each milestone
   - Bottlenecks or pacing issues
   - Recommended adjustments

**Files to update:**
- src/lib/game/config.ts

**Files to create:**
- docs/balance-report.md

**Success criteria:**
- First prestige achievable in 1-2 hours
- Victory in 8-12 hours total
- No game-breaking exploits
- Progression feels smooth
- Balance report documented

**Implementation Reference:**
See [Balance Validation Checkpoints](#balance-validation-checkpoints), [Design Checklist](#design-checklist), and [Constants Reference](#constants-reference) in Economic Balance Principles section.

**Required validation checks during testing:**

```javascript
// 1. No single source dominates (max 60% of total income)
for (const [source, revenue] of Object.entries(income_sources)) {
  const percentage = revenue / total_income;
  if (percentage > 0.60) {
    console.warn(`⚠️ ${source} provides ${percentage * 100}% - too dominant`);
  }
}

// 2. Streaming stays relevant (15-30% of total income)
const streaming_percentage = streaming_revenue / total_income;
if (streaming_percentage < 0.15 || streaming_percentage > 0.30) {
  console.warn(`⚠️ Streaming at ${streaming_percentage * 100}% - should be 15-30%`);
}

// 3. Previous tier contributes 20%+ of total income
const previous_tier_contribution = previous_tier_revenue / total_revenue;
if (previous_tier_contribution < 0.20) {
  console.warn(`⚠️ Previous tier only ${previous_tier_contribution * 100}% - should be 20%+`);
}
```

**Balance checklist for each income source/tier:**
- [ ] Previous tier still contributes 20%+ of total income
- [ ] New source costs 1.5-2.5x previous tier (never >5x)
- [ ] New source benefits 1.5-2.5x previous tier (never >5x)
- [ ] Player needs 2-3 income streams active simultaneously
- [ ] No single source exceeds 60% of total income
- [ ] Streaming remains 15-30% of income
- [ ] Progression speed allows mid-game mechanics to matter

**Constants to tune in src/lib/game/config.ts:**
```javascript
const BASE_STREAMING_RATE = 0.001;           // Start here, adjust ±50%
const ALBUM_INTEREST_RATE = 0.01;            // 1% of fans buy at peak
const ALBUM_DEMAND_DECAY_RATE = 0.15;        // Exponential decay constant
const ALBUM_COOLDOWN_HOURS = 48;             // Hours between releases
const TOUR_MIN_MULTIPLIER = 1.5;             // Weakest boost
const TOUR_MAX_MULTIPLIER = 3.0;             // Strongest boost
const BASE_TOUR_COST = 10000;                // Small venue baseline
const TIER_SCALE_MIN = 1.5;                  // Tier-to-tier multiplier
const TIER_SCALE_MAX = 2.5;                  // Never exceed 5.0
```

### Task 6.5: Write Comprehensive Test Suite

**Prerequisites:** Task 6.4 complete

**Status:** ⬜ Not Started

**What to do:**
Create comprehensive test suite for all game systems.

1. Ensure unit tests exist for all system files:
   - src/lib/systems/songs.test.ts
   - src/lib/systems/income.test.ts
   - src/lib/systems/fans.test.ts
   - src/lib/systems/tech.test.ts
   - src/lib/systems/prestige.test.ts
   - src/lib/systems/physical.test.ts
   - src/lib/systems/tours.test.ts
   - src/lib/systems/exploitation.test.ts
   - src/lib/systems/monopoly.test.ts
   - src/lib/systems/trends.test.ts
   - src/lib/game/engine.test.ts
   - src/lib/game/save.test.ts
   - src/lib/game/utils.test.ts
2. Ensure component tests exist for all UI components
3. Create integration tests:
   - tests/integration/game-loop.test.ts
   - tests/integration/prestige-flow.test.ts
   - tests/integration/phase-progression.test.ts
4. Target >70% code coverage overall
5. Run tests with: npm test
6. Generate coverage report with: npm run test:coverage

**Success criteria:**
- >70% code coverage
- All tests pass
- No flaky tests
- Fast test execution (<30s)

---

## Phase 7: Deployment & Documentation

**Complete these tasks in order.**

### Task 7.1: Configure GitHub Pages Deployment

**Prerequisites:** Phase 6 complete

**Status:** ⬜ Not Started

**What to do:**
Set up GitHub Actions workflow to deploy to GitHub Pages.

1. Create .github/workflows/deploy.yml:
   - Trigger on push to main branch
   - Install dependencies with npm ci
   - Run tests
   - Build with npm run build
   - Deploy to GitHub Pages using actions/deploy-pages@v4
2. Verify svelte.config.js has correct base path
3. Ensure static/.nojekyll exists
4. Test deployment workflow
5. Update repository settings to enable GitHub Pages

**Files to create:**
- .github/workflows/deploy.yml

**Success criteria:**
- Workflow runs on push to main
- Tests must pass before deploy
- Build succeeds
- Site deployed to https://[username].github.io/music-industry-simulator/
- Game loads and runs correctly on GitHub Pages

### Task 7.2: Create README Documentation ✅ ALREADY COMPLETE

**Prerequisites:** Task 7.1 complete

**Status:** ✅ Complete

**Note:** README.md is already written and includes:
- ✅ Project title and description
- ✅ Game overview and gameplay
- ✅ Documentation links
- ✅ Tech stack
- ✅ Getting started instructions
- ✅ Testing commands
- ✅ Development notes
- ✅ Roadmap with checkboxes
- ✅ Feature breakdown by phase
- ✅ Contributing guidelines
- ✅ License information

No action needed.

### Task 7.3: Create CHANGELOG

**Prerequisites:** Task 7.2 complete

**Status:** ⬜ Not Started

**What to do:**
Document all major features and changes in CHANGELOG.md.

1. Create CHANGELOG.md following Keep a Changelog format:
   - Version 1.0.0 (initial release)
   - List all major features
   - Game systems implemented
   - UI components created
2. Note any known issues or future enhancements
3. Credit contributors if applicable

**Files to create:**
- CHANGELOG.md

**Success criteria:**
- Complete feature list
- Follows standard format
- Easy to read

---

## Phase 8: Final Polish (OPTIONAL)

**These tasks are optional improvements. Complete in order if desired.**

### Task 8.1: Add Animations & Transitions

**Prerequisites:** Phase 7 complete

**Status:** ⬜ Optional

**What to do:**
Add subtle animations and transitions to improve game feel.

1. Add animations:
   - Number count-up animations when income increases
   - Smooth transitions when new sections unlock
   - Particle effects when generating songs
   - Pulse animation on purchase buttons
   - Fade in/out for modals
   - Progress bar fill animations
   - Celebration animations on prestige
   - Victory screen confetti
2. Use CSS transitions and Svelte transitions:
   - svelte/transition (fade, fly, scale)
   - svelte/animate (flip, crossfade)

**Success criteria:**
- Animations smooth (60fps)
- Not distracting or annoying
- Enhance game feel
- Can be disabled in settings (optional)

### Task 8.2: Add Sound Effects

**Prerequisites:** Task 8.1 complete (or skipped)

**Status:** ⬜ Optional

**What to do:**
Add optional sound effects for key actions.

1. Add sound effects:
   - Song complete sound
   - Purchase/upgrade sound
   - Prestige sound
   - Phase unlock fanfare
   - Victory jingle
   - Income tick sound (soft, subtle)
   - Volume control in settings
   - Mute toggle
2. Use Web Audio API or HTML5 audio:
   - Small, royalty-free sound effects
   - Compressed audio files
   - Lazy load audio assets

**Success criteria:**
- Sounds enhance experience
- Can be muted
- Small file sizes (<1MB total)
- No licensing issues

### Task 8.3: Add Keyboard Shortcuts

**Prerequisites:** Task 8.2 complete (or skipped)

**Status:** ⬜ Optional

**What to do:**
Implement keyboard shortcuts for common actions.

1. Add keyboard shortcuts:
   - Spacebar: Generate 1 song
   - 1-4: Generate 1x/5x/10x/Max songs
   - P: Open prestige modal (if available)
   - S: Open settings
   - Esc: Close modals
   - Show keyboard shortcut hints in UI

**Success criteria:**
- Shortcuts work correctly
- Don't interfere with typing in inputs
- Documented in settings or help

---

## How to Use This Plan

This implementation plan is designed for **linear, sequential execution**. Follow these guidelines:

### Execution Order

1. **Complete tasks in the exact order listed**
   - Each task builds on the previous tasks
   - Do not skip ahead or work on tasks out of order
   - Prerequisites must be satisfied before starting a task

2. **One task at a time**
   - Focus on completing one full task before moving to the next
   - Do not start multiple tasks simultaneously
   - Ensure all tests pass before moving on

3. **Verify completion**
   - Each task has clear success criteria
   - Run all tests after completing a task
   - Verify the application builds and runs
   - Check that no existing functionality is broken

4. **Track your progress**
   - Update the "Current Status" section as you complete tasks
   - Mark tasks as complete with ✅
   - Document any deviations or issues in comments

### Task Structure

Each task includes:
- **Prerequisites:** What must be complete before starting
- **Status:** Current state (✅ Complete / ⬜ Not Started)
- **What to do:** Step-by-step instructions
- **Files to create:** New files to create
- **Files to update:** Existing files to modify
- **Files to reference:** Files to read for context
- **Success criteria:** How to know the task is complete

### For LLMs Following This Plan

1. **Read the entire task description** before starting
2. **Check prerequisites** - ensure all required tasks are complete
3. **Follow instructions exactly** - do not improvise or skip steps
4. **Create all specified files** - including tests
5. **Run tests after each task** - ensure all tests pass
6. **Verify the application still works** - run npm run dev and check
7. **Update task status** when complete
8. **Move to the next task** in sequence

### Important Notes

- **Do not parallelize** - tasks must be completed sequentially
- **Write tests for everything** - every system and component needs tests
- **Use existing utilities** - reference completed files for patterns
- **Follow the design document** - game-details.md is the source of truth
- **Ask for clarification** if requirements are unclear
- **Document changes** in code comments when making important decisions

### Next Task to Complete

The next task to work on is: **Task 4.1: Implement Prestige System**

Good luck building the Music Industry Simulator! 🎵
