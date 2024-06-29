# ubiquitous-couscous

Simple TypeScript script for scraping circle data from VOM@S (ボーマス) and VOPARA (ボーパラ) official listings.

## Prerequisites

Have a version of [Bun](https://bun.sh) and [Node](https://nodejs.org) installed. (Node is required to run the prisma CLI, used for managing the SQLite DB).

Then, run the following commands to get the environment setup correctly:

```bash
bun install
bunx prisma db push
```

**NOTE**: This script also depends on [Puppeteer](https://pptr.dev/) for the actual web page loading and scraping. Puppeteer requires chrome to be installed in the system. This should be setup properly when running `bun install`, but if you're in a non-standard environment (ie using WSL2 like me), check the [Puppeteer troubleshooting](https://pptr.dev/troubleshooting) page.

## Running

```bash
bun dev
```

The final results will be included in `output.xlsx` in the project's root directory.

## Good things to know

1. The script persists intermediate data (ie Raw HTML, unformatted Circle info) to a SQLite DB. This means, should the script fail at some point while running, running the script again will check the DB if the given task is already done, meaning work won't be done twice on subsequent runs.
2. The VOM@S site has IP-based rate-limiting, meaning that the script will likely fail after hitting a few VOM@S pages. This can be overcome by using a VPN to mask your IP or simply waiting for your IP to cooldown from their web server (the rate-limit warning page says it takes 1 day before you can get access again, but I haven't tested this myself).
