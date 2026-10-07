# Graph Report - SurvivorsMobile-main  (2026-10-07)

## Corpus Check
- 232 files · ~229,992 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: .graphify-bak 1, (none) 1, .Thread 1)

## Summary
- 941 nodes · 1799 edges · 54 communities (42 shown, 12 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 121 edges (avg confidence: 0.8)
- Token cost: 758,209 input · 0 output

## Community Hubs (Navigation)
- Agent Roster & Delegation
- Skia Paint Definitions
- Render Colors & Palettes
- Entity Types & Configs
- Save Store & Meta Progression
- Coding & Context Standards
- Production Templates
- Design Skills & Frameworks
- Expo App Config
- Play Store Launch Plan
- Settings & IAP Stores
- Weapon System
- Game Screen & Audio
- Package Manifest
- Characters & Evolutions
- Game Store & Chests
- App Shell & Menu
- Doc Templates & Protocols
- Runtime Dependencies
- Game Config & Collision
- Waves & Enemy Spawning
- HUD & Post-Game UI
- Claude Hooks Settings
- Frame Draw Pipeline
- Achievements & Stats
- Ads Integration
- Tech Stack & Onboarding
- Core Loop GDD
- Initial State & Pools
- AGENTS.md Engine Rules
- Studio Collaboration Protocol
- Agent Hierarchy & Escalation
- Privacy & Data Safety
- Release & Tech Debt
- Sprint Tracking Skills
- App Icon (asset/)
- Local Setup Requirements
- TypeScript Config
- App Icon (assets/)
- Economy Design Template
- Post-Mortem & Stage Reports
- AI & Network Rules
- Narrative & Level Templates
- Favicon
- Graphify Skill
- Detect-Gaps Hook
- Session-Stop Hook
- Shader Standards
- Asset Audit
- Bug Reporting
- Hotfix Workflow
- Prototyping
- Statusline Hook

## God Nodes (most connected - your core abstractions)
1. `GameScreen()` - 24 edges
2. `react` - 23 edges
3. `GameState` - 20 edges
4. `useSaveStore` - 20 edges
5. `Lead Programmer Agent` - 19 edges
6. `Gate Check Skill` - 19 edges
7. `GameCanvas()` - 18 edges
8. `expo` - 17 edges
9. `Game Designer Agent` - 16 edges
10. `Technical Director Agent` - 16 edges

## Surprising Connections (you probably didn't know these)
- `UI Never Owns Game State Rule` --semantically_similar_to--> `Game State in useRef, zustand UI-only (10Hz sync)`  [INFERRED] [semantically similar]
  .claude/skills/team-ui/SKILL.md → AGENTS.md
- `Release Checklist Skill` --conceptually_related_to--> `Data Safety & Content Rating Draft (Play Console)`  [INFERRED]
  .claude/skills/release-checklist/SKILL.md → docs/store/data-safety.md
- `Reverse Document Skill` --conceptually_related_to--> `Core Loop GDD (reverse-documented)`  [INFERRED]
  .claude/skills/reverse-document/SKILL.md → design/gdd/core-loop.md
- `AskUserQuestion Decision Points Pattern` --implements--> `Collaboration Protocol (Question->Options->Decision->Draft->Approval)`  [INFERRED]
  .claude/skills/team-combat/SKILL.md → CLAUDE.md
- `Core Loop GDD (reverse-documented)` --conceptually_related_to--> `GDD 8 Required Sections Standard`  [INFERRED]
  design/gdd/core-loop.md → CLAUDE.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Creative Director and Department Directors** — claude_agents_creative_director, claude_agents_game_designer, claude_agents_art_director, claude_agents_audio_director, claude_agents_narrative_director [EXTRACTED 1.00]
- **Godot Specialist Team** — claude_agents_godot_specialist, claude_agents_godot_gdscript_specialist, claude_agents_godot_shader_specialist, claude_agents_godot_gdextension_specialist [EXTRACTED 1.00]
- **Live Service Operations Collaboration** — claude_agents_live_ops_designer, claude_agents_community_manager, claude_agents_analytics_engineer, claude_agents_economy_designer [INFERRED 0.85]
- **Unity Engine Specialist Team** — claude_agents_unity_specialist, claude_agents_unity_addressables_specialist, claude_agents_unity_dots_specialist, claude_agents_unity_shader_specialist, claude_agents_unity_ui_specialist [EXTRACTED 1.00]
- **Unreal Engine Specialist Team** — claude_agents_unreal_specialist, claude_agents_ue_blueprint_specialist, claude_agents_ue_gas_specialist, claude_agents_ue_replication_specialist, claude_agents_ue_umg_specialist [INFERRED 0.95]
- **Technical Director Department** — claude_agents_technical_director, claude_agents_lead_programmer, claude_agents_engine_programmer, claude_agents_network_programmer, claude_agents_performance_analyst, claude_agents_technical_artist, claude_agents_devops_engineer [EXTRACTED 1.00]
- **Git Quality Gate Hooks** — claude_docs_hooks_reference_pre_commit_code_quality, claude_docs_hooks_reference_pre_commit_design_check, claude_docs_hooks_reference_pre_push_test_gate, claude_docs_hooks_reference_post_merge_asset_validation [INFERRED 0.85]
- **Session State Persistence Flow** — claude_docs_context_management_session_state_file, claude_hooks_session_start, claude_hooks_pre_compact, claude_docs_context_management_incremental_file_writing [INFERRED 0.85]
- **Agent Delegation Governance** — claude_docs_coordination_rules_vertical_delegation, claude_docs_agent_coordination_map_organizational_hierarchy, claude_docs_agent_coordination_map_escalation_paths, claude_docs_agent_roster_three_tier_model [INFERRED 0.85]
- **Collaborative Agent Protocols (Question-Options-Decision-Draft-Approval)** — claude_docs_templates_collaborative_protocols_design_agent_protocol_design_agent_protocol, claude_docs_templates_collaborative_protocols_implementation_agent_protocol_implementation_agent_protocol, claude_docs_templates_collaborative_protocols_leadership_agent_protocol_leadership_agent_protocol, claude_docs_templates_collaborative_protocols_design_agent_protocol_ask_before_write [INFERRED 0.85]
- **Reverse-Documentation Templates (/reverse-document)** — claude_docs_templates_architecture_doc_from_code_adr_from_code_template, claude_docs_templates_concept_doc_from_prototype_concept_doc_template, claude_docs_templates_design_doc_from_implementation_design_doc_template [EXTRACTED 1.00]
- **Player Psychology Frameworks in Concept/Pillars Docs** — claude_docs_templates_game_concept_mda_framework, claude_docs_templates_game_concept_bartle_taxonomy, claude_docs_templates_game_concept_flow_state_design, claude_docs_templates_game_concept_self_determination_needs [INFERRED 0.85]
- **Path-Scoped Rules Enforced per Source Directory** — claude_rules_ai_code_ai_code_rules, claude_rules_data_files_data_file_rules, claude_rules_design_docs_design_document_rules, claude_rules_engine_code_engine_code_rules, claude_rules_gameplay_code_gameplay_code_rules, claude_rules_narrative_narrative_rules, claude_rules_network_code_network_code_rules, claude_rules_prototype_code_prototype_code_standards, claude_rules_shader_code_shader_code_standards, claude_rules_test_standards_test_standards, claude_rules_ui_code_ui_code_rules [INFERRED 0.95]
- **Production Lifecycle Templates** — claude_docs_templates_sprint_plan_sprint_plan_template, claude_docs_templates_risk_register_entry_risk_register_entry, claude_docs_templates_release_checklist_template_release_checklist, claude_docs_templates_release_notes_release_notes_template, claude_docs_templates_post_mortem_post_mortem_template, claude_docs_templates_project_stage_report_project_stage_analysis_report [INFERRED 0.85]
- **No Hardcoded Values / Data-Driven Tuning** — claude_rules_gameplay_code_data_driven_values, claude_rules_data_files_data_file_rules, claude_rules_ai_code_ai_code_rules, claude_rules_shader_code_shader_code_standards [INFERRED 0.85]
- **Design Pipeline: Brainstorm -> Map Systems -> Design System -> Design Review** — claude_skills_brainstorm_skill, claude_skills_map_systems_skill, claude_skills_design_system_skill, claude_skills_design_review_skill [EXTRACTED 1.00]
- **Phase/Release Readiness Validation** — claude_skills_gate_check_skill, claude_skills_milestone_review_skill, claude_skills_launch_checklist_skill, claude_skills_project_stage_detect_skill [INFERRED 0.85]
- **Release Communication from Git/Sprint Data** — claude_skills_changelog_skill, claude_skills_patch_notes_skill, claude_skills_changelog_skill_sprint_data [INFERRED 0.85]
- **Team orchestration skills using subagent pipelines with decision points** — claude_skills_team_audio_skill, claude_skills_team_combat_skill, claude_skills_team_level_skill, claude_skills_team_narrative_skill, claude_skills_team_polish_skill, claude_skills_team_release_skill, claude_skills_team_ui_skill [EXTRACTED 1.00]
- **Production tracking skills (sprint, retro, scope, debt)** — claude_skills_sprint_plan_skill, claude_skills_retrospective_skill, claude_skills_scope_check_skill, claude_skills_tech_debt_skill [INFERRED 0.85]
- **Play Store compliance documentation** — docs_legal_privacy_policy_privacy_policy_md, docs_legal_privacy_policy_privacy_policy_html, docs_store_data_safety_data_safety, docs_legal_privacy_policy_google_admob [INFERRED 0.85]
- **Google Play launch monetization pipeline** — production_milestones_google_play_launch_admob_monetization, production_milestones_launch_checklist_adservice, production_milestones_launch_checklist_reviverun, production_milestones_launch_checklist_remove_ads_iap, production_milestones_launch_checklist_ads_iap_critical_path [EXTRACTED 1.00]
- **Play Store compliance artifacts** — docs_store_play_store_listing, production_milestones_launch_checklist_privacy_policy, production_milestones_launch_checklist_data_safety, production_milestones_launch_checklist_target_api_35, production_milestones_launch_checklist_record_audio_permission [INFERRED 0.85]
- **Launch production planning documents** — production_milestones_google_play_launch, production_milestones_launch_checklist, production_risk_register_risks, production_sprints_sprint_01 [INFERRED 0.95]
- **Survivors-like core loop: player surrounded by swarm, auto-firing projectiles** — asset_app_icon_player_core, asset_app_icon_enemy_swarm, asset_app_icon_projectile_particles [INFERRED 0.85]

## Communities (54 total, 12 thin omitted)

### Community 0 - "Agent Roster & Delegation"
Cohesion: 0.05
Nodes (85): Accessibility Specialist Agent, Ai Programmer Agent, Analytics Engineer Agent, Art Director Agent, Audio Director Agent, Community Manager Agent, Creative Director Agent, Devops Engineer Agent (+77 more)

### Community 1 - "Skia Paint Definitions"
Cohesion: 0.03
Nodes (63): ANNOUNCE_FONT, bgGradPaint, bloodBladeGlowPaint, bloodBladePaint, BOSS_FONT, bossRingPaint1, bossRingPaint2, botVignettePaint (+55 more)

### Community 2 - "Render Colors & Palettes"
Cohesion: 0.03
Nodes (56): BIOME_COLS, BIOME_PALETTE, BOSS_RING1_COL, BOSS_RING2_COL, CHEST_BODY_BOSS_COL, CHEST_BODY_COL, CHEST_GLOW_BOSS_COL, CHEST_GLOW_COL (+48 more)

### Community 3 - "Entity Types & Configs"
Cohesion: 0.10
Nodes (26): @shopify/react-native-skia, EnemyConfig, GarlicConfig, BiomeId, ChestEntity, EnemyEntity, Entity, ParticleEntity (+18 more)

### Community 4 - "Save Store & Meta Progression"
Cohesion: 0.09
Nodes (34): @react-native-async-storage/async-storage, CHARACTERS, CharacterId, SaveStore, UPGRADE_BASE_COST, UPGRADE_INCREASE, upgradeCost(), useSaveStore (+26 more)

### Community 5 - "Coding & Context Standards"
Cohesion: 0.06
Nodes (29): World Builder Agent, Lore Consistency, CLAUDE.local.md Template, CLAUDE.local.md Personal Overrides, Coding Standards, Eight Required GDD Sections, Context Management, Session State File (production/session-state/active.md) (+21 more)

### Community 6 - "Production Templates"
Cohesion: 0.06
Nodes (26): Game Pitch Template, Pitch Risks and Mitigation, Release Quality Gates, Release Checklist Template, Release Notes Template, Risk Register Entry Template, Adaptive Music System, Mix Bus Structure (+18 more)

### Community 7 - "Design Skills & Frameworks"
Cohesion: 0.09
Nodes (34): Architecture Decision Skill, Architecture Decision Record (ADR), Balance Check Skill, Balance Data (design/balance/), Brainstorm Skill, Game Concept Document (design/gdd/game-concept.md), Game Pillars, Changelog Skill (+26 more)

### Community 8 - "Expo App Config"
Cohesion: 0.05
Nodes (37): backgroundColor, foregroundImage, monochromeImage, adaptiveIcon, package, permissions, predictiveBackGestureEnabled, versionCode (+29 more)

### Community 9 - "Play Store Launch Plan"
Cohesion: 0.10
Nodes (31): Google Play Store Listing (Ball Survive), Ball Survive (game / app), 100% Offline Play, Store Visual Assets (icon, feature graphic, screenshots), Milestone: Google Play Store Launch, AdMob Monetization (rewarded + interstitial), EAS Build (Expo Application Services), Four-Sprint Launch Plan (+23 more)

### Community 10 - "Settings & IAP Stores"
Cohesion: 0.13
Nodes (23): expo-iap, zustand, persist(), SettingsStore, useSettingsStore, RemoveAdsInfo, useRemoveAdsInfo(), getRemoveAdsPrice() (+15 more)

### Community 11 - "Weapon System"
Cohesion: 0.17
Nodes (25): spawnDamageNumber(), spawnProjectile(), CROSS_DIRS, deathAuraEffectiveRadius(), _findNearestEnemies(), garlicEffectiveRadius(), _nearBuf, _nearDistBuf (+17 more)

### Community 12 - "Game Screen & Audio"
Cohesion: 0.15
Nodes (20): GameScreen(), UpgradeType, hapticSelection(), hapticSuccess(), pauseBgMusic(), playBgMusic(), playSfx(), playSfxGemCollect() (+12 more)

### Community 13 - "Package Manifest"
Cohesion: 0.08
Nodes (23): devDependencies, @types/matter-js, @types/react, typescript, main, name, private, scripts (+15 more)

### Community 14 - "Characters & Evolutions"
Cohesion: 0.15
Nodes (19): CharacterDefinition, checkEvolution(), EVOLUTION_RECIPES, EvolutionRecipe, PASSIVE_ITEMS, PassiveItemDefinition, ALL_UPGRADES, EVOLVED_WEAPON_IDS (+11 more)

### Community 15 - "Game Store & Chests"
Cohesion: 0.17
Nodes (18): DamageNumber, GameState, UpgradeOption, useGameStore, findFreeChestSlot(), spawnChest(), tickChests(), tickDamageNumbers() (+10 more)

### Community 16 - "App Shell & Menu"
Cohesion: 0.13
Nodes (18): App(), boot(), MenuScreen(), MG, mStyles, PASSIVE_ITEM_LABELS, PLAYER_PRESETS, styles (+10 more)

### Community 17 - "Doc Templates & Protocols"
Cohesion: 0.10
Nodes (22): Available Skills (Slash Commands) Reference, Technical Preferences, Architecture Decision Record Template, ADR From Code Template (reverse-document), Art Bible Template, Changelog Template (What's New), Collaborative Protocol for Design Agents, Collaborative Protocol for Implementation Agents (+14 more)

### Community 18 - "Runtime Dependencies"
Cohesion: 0.11
Nodes (18): dependencies, expo, expo-av, expo-haptics, expo-iap, expo-image-picker, expo-keep-awake, expo-status-bar (+10 more)

### Community 19 - "Game Config & Collision"
Cohesion: 0.22
Nodes (14): CrossConfig, DeathAuraConfig, EXPLOSIVE_AOE_DAMAGE, EXPLOSIVE_AOE_RADIUS, GameConfig, LightningConfig, _activeEnemyBuf, damagePlayer() (+6 more)

### Community 20 - "Waves & Enemy Spawning"
Cohesion: 0.18
Nodes (15): BiomeId, getCurrentWave(), SpawnGroup, WaveDefinition, WAVES, EnemyType, _cellArrayPool, _cellKey() (+7 more)

### Community 21 - "HUD & Post-Game UI"
Cohesion: 0.15
Nodes (13): react, react-native, HUDOverlay(), Props, styles, formatTime(), PostGameStats(), Props (+5 more)

### Community 22 - "Claude Hooks Settings"
Cohesion: 0.13
Nodes (14): hooks, PostToolUse, PreCompact, PreToolUse, SessionStart, Stop, SubagentStart, permissions (+6 more)

### Community 23 - "Frame Draw Pipeline"
Cohesion: 0.17
Nodes (13): cachedColor(), drawBackground(), drawChests(), drawDamageNumbers(), drawEnemies(), drawFrame(), drawGrid(), drawHUD() (+5 more)

### Community 24 - "Achievements & Stats"
Cohesion: 0.19
Nodes (10): AchievementDef, ALL_ACHIEVEMENTS, checkAchievements(), CHAR_LABELS, formatDate(), formatTime(), Props, StatsScreen() (+2 more)

### Community 25 - "Ads Integration"
Cohesion: 0.31
Nodes (9): react-native-google-mobile-ads, useRewardedReady(), areAdsRemoved(), initAds(), isRewardedReady(), maybeShowInterstitial(), preloadInterstitial(), preloadRewarded() (+1 more)

### Community 26 - "Tech Stack & Onboarding"
Cohesion: 0.22
Nodes (10): Locked Tech Stack (Expo SDK 55, Skia, Reanimated 4, zustand), Audio Assets README, AUDIO_READY flag in AudioService.ts, Setup Engine Skill, Engine Decision Matrix (Godot/Unity/Unreal), Start Onboarding Skill, Onboarding Routing (A-D starting points), Team Audio Skill (+2 more)

### Community 27 - "Core Loop GDD"
Cohesion: 0.29
Nodes (8): Reverse Document Skill, Core Loop GDD (reverse-documented), Damage Formula max(1, damage - armor) + 1.2s iframes, Enemy Types (Basic, Fast, Tank, Boss), Known Issues (armor scaling vs boss, separation force), Tuning Knobs (GameConfig.ts, WaveConfig.ts, UpgradeSystem.ts), Upgrade Pool (Dagger, Fireball, Whip, passives), Wave Progression (7 waves, fractional spawn accumulator)

### Community 28 - "Initial State & Pools"
Cohesion: 0.38
Nodes (9): getCharacter(), createInitialGameState(), makeChest(), makeDamageNumber(), makeEnemy(), makeEntityPool(), makeGem(), makeParticle() (+1 more)

### Community 29 - "AGENTS.md Engine Rules"
Cohesion: 0.28
Nodes (6): Circle Collision + Spatial Grid Broad Phase, Frame Tick Order (tickWaves->...->tickCollisions), File Naming Conventions (XSystem.ts, RenderX.tsx), Performance Targets (60 FPS @50 enemies, >=50 @100), AGENTS.md Project Rules (Vampire Survivors-like mobile), Team UI Skill

### Community 30 - "Studio Collaboration Protocol"
Cohesion: 0.25
Nodes (7): Claude Code Game Studios (48-agent architecture), GDD 8 Required Sections Standard, graphify usage rules, Team Combat Skill, Team Level Skill, Team Narrative Skill, Team Polish Skill

### Community 31 - "Agent Hierarchy & Escalation"
Cohesion: 0.22
Nodes (7): Escalation Paths, Studio Organizational Hierarchy, Agent Roster, Three-Tier Agent Model (Opus/Sonnet/Haiku), Agent Coordination Rules, Quick Start Guide, Review Workflow

### Community 32 - "Privacy & Data Safety"
Cohesion: 0.36
Nodes (7): Google AdMob advertising data collection, On-device Only Data (progress, settings, avatar), Ball Survive Privacy Policy (HTML page), Ball Survive Privacy Policy (Markdown), Remove Ads IAP via Google Play Billing, Data Safety & Content Rating Draft (Play Console), IARC Content Rating (mild fantasy violence, Everyone/PEGI 3-7)

### Community 33 - "Release & Tech Debt"
Cohesion: 0.29
Nodes (6): Release Checklist Skill, Release Quality Gates (zero S1/S2, soak test), Team Release Skill, Release Go/No-Go Decision, Tech Debt Skill, Technical Debt Register (docs/tech-debt-register.md)

### Community 34 - "Sprint Tracking Skills"
Cohesion: 0.33
Nodes (5): Retrospective Skill, Velocity Trend & Estimation Accuracy, Scope Check Skill, Sprint Plan Skill, Sprint Definition of Done & 20% Buffer

### Community 35 - "App Icon (asset/)"
Cohesion: 0.60
Nodes (5): App Icon (neon survivor arena), Encircling Enemy Swarm (orange and purple circles), Neon Synthwave Space Visual Style (dark grid, glow), Central Player Orb (cyan core, concentric purple rings), Projectile Streaks and Pixel Particle Bursts

### Community 36 - "Local Setup Requirements"
Cohesion: 0.40
Nodes (5): Permission Modes (Development / Prototyping / Code Review), settings.local.json Template, Claude Code CLI, jq (hook JSON parsing dependency), Setup Requirements

### Community 37 - "TypeScript Config"
Cohesion: 0.40
Nodes (4): expo/tsconfig.base, compilerOptions, strict, extends

### Community 38 - "App Icon (assets/)"
Cohesion: 0.67
Nodes (4): App Icon (neon survivor arena), Enemy Swarm (orange and purple circles surrounding player), Neon Geometric Visual Style (dark space, grid, glow, pixel particles), Central Player Orb (cyan core with concentric purple rings)

### Community 39 - "Economy Design Template"
Cohesion: 0.50
Nodes (3): Economy Model Template, Faucets and Sinks, Pity System

### Community 41 - "AI & Network Rules"
Cohesion: 0.50
Nodes (3): AI Code Rules (src/ai), AI Update Budget 2ms/frame, Network Code Rules (src/networking)

### Community 42 - "Narrative & Level Templates"
Cohesion: 0.67
Nodes (3): Faction Design Template, Level Design Document Template, Narrative Character Sheet Template

## Ambiguous Edges - Review These
- `Technology Stack placeholders ([CHOOSE] engine)` → `Locked Tech Stack (Expo SDK 55, Skia, Reanimated 4, zustand)`  [AMBIGUOUS]
  AGENTS.md · relation: conceptually_related_to
- `Milestone: Google Play Store Launch` → `Remove Ads IAP (expo-iap, replaces react-native-iap)`  [AMBIGUOUS]
  production/milestones/google-play-launch.md · relation: conceptually_related_to

## Knowledge Gaps
- **281 isolated node(s):** `detect-gaps.sh script`, `log-agent.sh script`, `pre-compact.sh script`, `session-start.sh script`, `session-stop.sh script` (+276 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 323 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Technology Stack placeholders ([CHOOSE] engine)` and `Locked Tech Stack (Expo SDK 55, Skia, Reanimated 4, zustand)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `@shopify/react-native-skia` connect `Entity Types & Configs` to `Skia Paint Definitions`, `Render Colors & Palettes`, `Package Manifest`, `Game Store & Chests`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **What connects `detect-gaps.sh script`, `log-agent.sh script`, `pre-compact.sh script` to the rest of the system?**
  _281 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Agent Roster & Delegation` be split into smaller, more focused modules?**
  _Cohesion score 0.05128779395296752 - nodes in this community are weakly interconnected._
- **What is the exact relationship between `Milestone: Google Play Store Launch` and `Remove Ads IAP (expo-iap, replaces react-native-iap)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `react` connect `HUD & Post-Game UI` to `Entity Types & Configs`, `Save Store & Meta Progression`, `Settings & IAP Stores`, `Game Screen & Audio`, `Package Manifest`, `Game Store & Chests`, `App Shell & Menu`, `Achievements & Stats`, `Ads Integration`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Should `Skia Paint Definitions` be split into smaller, more focused modules?**
  _Cohesion score 0.030303030303030304 - nodes in this community are weakly interconnected._