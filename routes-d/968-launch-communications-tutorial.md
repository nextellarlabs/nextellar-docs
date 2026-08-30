# Issue #968 — Build a complete Stellar dApp launch communications tutorial

Working draft for the docs change requested in issue #968.

## Planned doc location

- `docs/guides/launch-communications.mdx`

## Scope

- Explain the announcement channels available to Stellar dApp teams
- Cover the messaging cadence from pre-launch through post-launch
- Note what to say at each stage (what users care about, what investors care about)
- Provide a small copy template for the most common messages
- Match the existing MDX frontmatter and writing style

## Sections

### Announcement Channels
- Stellar Community Forum / Discord
- Twitter/X, Farcaster
- Email list
- In-app notification (for beta users)
- Product Hunt / Hacker News

### Messaging Cadence
- T-4 weeks: teaser / waitlist
- T-1 week: feature preview
- Launch day: main announcement
- T+1 week: lessons-learned post

### Copy Templates
- Waitlist tweet
- Discord announcement
- Launch blog post outline

## Acceptance Criteria
- Builds with `pnpm build:content` without errors
- Internal links pass `pnpm check:links`
