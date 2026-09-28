export default async function run(page) {
  const events = [];
  page.on('pageerror', (error) => events.push({ type: 'pageerror', message: error.message, stack: error.stack }));
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') {
      events.push({ type: message.type(), text: message.text() });
    }
  });
  page.on('requestfailed', (request) => events.push({ type: 'requestfailed', url: request.url(), error: request.failure()?.errorText }));
  page.on('response', (response) => {
    if (response.url().includes('/api/v1/')) events.push({ type: 'api', status: response.status(), url: response.url() });
  });
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3000);
  return {
    title: await page.title(),
    body: await page.locator('body').innerText(),
    root: await page.locator('#root').innerHTML(),
    events,
  };
}