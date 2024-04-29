/* eslint-disable no-await-in-loop */
import { performance } from 'perf_hooks';
import puppeteer from 'puppeteer';
import { url } from './urlToTest';

const ITERATIONS = 500;

export const runPuppeteerBenchmark = async () => {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch();

  // Avoid weird first load shenanigans
  const firstLoadPage = await browser.newPage();
  await firstLoadPage.goto(url, { waitUntil: 'load' });

  const timings: number[] = [];
  for (let i = 0; i < ITERATIONS; i++) {
    const page = await browser.newPage();
    page.setCacheEnabled(false);

    const before = performance.now();
    await page.goto(url, { waitUntil: 'load' });
    const after = performance.now();
    timings.push(after - before);
    process.stdout.write(`${i + 1}/${ITERATIONS} (${(100 * ((i + 1) / ITERATIONS)).toFixed(0)}%)\r`);
  }

  await browser.close();

  const { mean, median, quantileSeq } = await import('mathjs');
  return {
    load_passes: ITERATIONS,
    load_avg: mean(timings),
    load_med: median(timings),
    load_p90: quantileSeq(timings, 0.90) as number,
    load_p95: quantileSeq(timings, 0.95) as number,
  };
};
