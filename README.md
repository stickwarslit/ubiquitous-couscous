# ubiquitous-couscous

Simple TypeScript script for scraping circle data from VOM@S (ボーマス) and VOPARA (ボーパラ) official listings.

## Prerequisites

Have a version of [Bun](https://bun.sh) and [Node](https://nodejs.org) installed. (Node is required to run the prisma CLI, used for managing the SQLite DB).

Then, run the following commands to get the environment setup correctly:

```bash
bun install
bunx prisma db push
```

## Running

```bash
bun dev
```

The final results will be included in `output.xlsx` in the project's root directory.
