# pw-retropgf3-categorize

Process RetroPGF3 applications to produce a list of categories with applications to be used by Pairwise.

Process overview:

- Fetch metadata files related to applications
- Identify false/noise/spam applications
- Identify wrongly marked INDIVIDUAL/PROJECT applications
- Generate application category suggestions
- Generate master category lists based on suggestions
- Arrange applications into categories

After running through the steps above, the following fields have been added to the application metadata files:

### `pwIsNoise`

`true/false`

The application is determined to be noise based on the text in the application. Examples of noise applications are:

- Project description is super vague
- Project description is super short
- Project description contains dummy text
- Project URLs are not valid

### `pwNoiseReason`

The reason why the application is marked as noise.

### `pwApplicationTypeChecked`

`true/false`

The application type has been checked to be marked correctly as INDIVIDUAL or PROJECT.

### `pwCategorySuggestions`

A comma-separated list of suggested categories for the application.

### `pwCategory`: category

The category the application has been assigned to.

## Usage

```
npm i
npm start
```
