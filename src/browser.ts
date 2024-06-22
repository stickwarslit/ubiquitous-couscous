import _ from 'lodash';
import puppeteer, { Browser, Page } from 'puppeteer';

/**
 * Browser bootstrapping adapted from
 * https://medium.com/@rudyard_55741/improve-nestjs-cold-starts-on-lambda-with-rxjs-5dde21675e54
 */

let bootstrapped = false;

async function bootstrap(): Promise<Browser> {
	if (bootstrapped) {
		throw new Error('Puppeteer already bootstrapped');
	}
	bootstrapped = true;
	console.log('COLD START: Initializing Puppeteer');

	console.log('Starting chromium instance...');
	const browser = await puppeteer.launch({
        headless: true,
		args: [
			'--hide-scrollbars',
			'--disable-web-security',
			'--disable-dev-shm-usage',
			'--no-sandbox',
		],
	});
	console.log('Chromium started');

	return browser;
}

// Do not wait for lambdaHandler to be called before bootstraping Puppeteer
const browserPromise = bootstrap();
browserPromise.catch((err) => {
	console.error('Failed to bootstrap Puppeteer', err);
	process.exit(1);
});

type PuppeteerRequests = {
	pending: string[];
	finished: string[];
	failed: string[];
};

async function createPage(browser: Browser) {
	const page = await browser.newPage();

	await page.setViewport({
		// width and height don't matter, but they're required for this function
		width: 800,
		height: 600,

		// High DPI screenshots
		deviceScaleFactor: 2,
	});

	// Log all requests so we know what failed
	await page.setRequestInterception(true);

	const requests: PuppeteerRequests = {
		pending: [],
		finished: [],
		failed: [],
	};

	page.on('request', (request) => {
		const url = request.url();

		// Hack to block all LaunchDarkly requests because they cause Puppeteer to
		// hang if LaunchDarkly is not in offline mode
		//
		// TODO: Change project boards to use an HTML template instead of a URL
		if (url.includes('launchdarkly') || url.includes('clarity.ms')) {
			void request.abort();
			return;
		}

		requests.pending.push(url);

		void request.continue();
	});

	page.on('requestfinished', (request) => {
		const url = request.url();

		requests.finished.push(url);
		_.pull(requests.pending, url);
	});

	page.on('requestfailed', (request) => {
		const url = request.url();

		requests.failed.push(url);
		_.pull(requests.pending, url);
	});

	return { page, requests };
}

function logIssues(requests: PuppeteerRequests) {
	if (requests.failed.length || requests.pending.length) {
		if (requests.failed.length) {
			console.warn({ requests: requests.failed }, 'Some page requests failed');
		}

		if (requests.pending.length) {
			console.warn(
				{ requests: requests.pending },
				'Some page requests never finished'
			);
		}
	} else {
		console.info('All page requests succeeded');
	}
}

export async function withPage<T>(callback: (page: Page) => Promise<T>) {
	const browser = await browserPromise;
	const { page, requests } = await createPage(browser);
	try {
		return await callback(page);
	} finally {
		// Intentionally not catching an error.
		// The caller should decide how to handle errors.
		logIssues(requests);
		await page.close();
	}
}

export async function closeBrowser() {
	return browserPromise
		.then((browser) => browser.close())
		.then(() => process.exit(0))
		.catch((err) => {
			console.error('Failed to close browser', err);
			process.exit(1);
		});
}
