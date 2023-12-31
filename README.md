# pw-retropgf3-categorize

Process RetroPGF3 applications to produce a list of categories with applications to be used by Pairwise.

## Pre-requisites

Copy `.env.example` to `.env` and fill in your OpenAI api key.

## Usage

```
npm i
npm start
```

## Process overview

- Fetch metadata files related to applications
- Identify false/noise/spam applications
- Identify wrongly marked INDIVIDUAL/PROJECT applications
- Generate application category suggestions
- Generate master category lists based on suggestions
- Arrange applications into categories

After running through the steps above, the following fields have been added to the application metadata files:

### `pwIsFlagged`

`true/false`

The application is flagged if it breaks the rules of the grants program:

- No promises of future impact or deliverables.
- No false claims about contributions, past impact, funding, or grants.
- No hateful content or discrimination.
- No malicious content harming or deceiving badgeholders.
- No fraud, impersonation, or false affiliations. The grant owner must be directly linked to the project.
- No advertising, including token sales or NFT drops.
- No bribery or vote buying.
- Must relate to Optimism and meet contribution criteria (at least 1 hour of impactful activity). Note: User interactions on OP Mainnet or other OP chains in the - Superchain aren't eligible for RetroPGF 3.
- No spam, irrelevant answers, plagiarized content, or non-English applications.

### `pwFlaggedReason`

The reason why the application is marked as noise.

Example output:

```
│
◆  Identifying noise applications
◆  Processing 20 / 371
│
◆  Application: Apple
◆  Reason: The application is noise because the website URL and contribution links provided are not legitimate websites, indicating this could be fake or spam.
│
◆  Processing 24 / 371
│
◆  Application: hsynus
◆  Reason: The application is noise because the description of contribution and impact is repetitive and lacks specific details, indicating it might be auto-generated or spam.
│
◆  Processing 38 / 371
│
◆  Application: Kosmo
◆  Reason: This application is noise because the descriptions of the applicant's contributions and their impact are not specific and simply repeated the word "Optimism."
│
```

### `pwApplicationTypeChecked`

`true/false`

The application type has been checked to be marked correctly as INDIVIDUAL or PROJECT.

Example output:

```
│
◆  Application: Apple
◆  Reason: NO, the application should be categorized as "PROJECT" because the contribution description and impact description indicate that the work is being done by a collective or organization, not a single individual.
│
◆  Processing 29 / 371
│
◆  Application: Vtcking
◆  Reason: NO, it is not correctly categorized. The application should be categorized as "INDIVIDUAL" as they use terms such as "I" and "me".
│
◆  Processing 35 / 371
│
◆  Application: Vku
◆  Reason: NO, the application uses first person language like "For me," suggesting it's coming from an individual and not a group or project. Even though they provided a GitHub link and a website, the nature of the application and the language used suggests it is an individual.
│
```

### `pwCategorySuggestions`

A comma-separated list of suggested categories for the application.

Example output:

```
│
◆  Tokenization Platforms, Governance Tokens, End User Experience and Adoption
│
◆  Decentralized Finance (DeFi), Developer Ecosystem, End User Experience and Adoption, Collective Governance, Operational Stack (OP Stack)
│
```

### `pwCategory`: category

The category the application has been assigned to.
