/* eslint-disable no-console */
import { exec } from 'child_process';
import { writeFile } from 'fs/promises';
import { promisify } from 'util';
import { runPuppeteerBenchmark } from './pupeteer-benchmark';

const main = async () => {
  console.log('Running puppeteer benchmark...');
  const puppeteerResults = await runPuppeteerBenchmark();

  console.log('Running k6 benchmark...');
  const command = 'k6 run --quiet ./dist/k6-benchmark.js 2> /dev/null';
  const { stdout } = await promisify(exec)(command);
  const k6Results: {
    metrics: {
      'iterations': { values: { count: number } }
      'http_req_failed': { values: { passes: number, fails: number } }
      'http_req_duration': { values: { med: number, avg: number, 'p(90)': number, 'p(95)': number } }
    }
  } = JSON.parse(stdout);

  console.log('Outputting results to results.csv...');
  const csvOutput = toCsvString({
    load_passes: puppeteerResults.load_passes,
    load_avg: puppeteerResults.load_avg,
    load_med: puppeteerResults.load_med,
    load_p90: puppeteerResults.load_p90,
    load_p95: puppeteerResults.load_p95,

    // Passes and fails are the opposite way around because k6 is insane:
    // https://community.grafana.com/t/http-req-failed-reporting-passes-as-failures/94807/3
    req_passes: k6Results.metrics.http_req_failed.values.fails,
    req_duration_avg: k6Results.metrics.http_req_duration.values.avg,
    req_duration_median: k6Results.metrics.http_req_duration.values.med,
    req_duration_p90: k6Results.metrics.http_req_duration.values['p(90)'],
    req_duration_p95: k6Results.metrics.http_req_duration.values['p(95)'],
  });
  await writeFile('results.csv', csvOutput, { encoding: 'utf-8' });
};

/**
 * Convert to a simple CSV string
 * NB: does not handle escaping
 * @example toCsvString({ k1: "val", k2: 23 }) == "k1,k2\nval,23"
 */
const toCsvString = (data: Record<string, string | number>): string => {
  const keys: string[] = [];
  const values: (string | number)[] = [];
  Object.entries(data).forEach(([key, value]) => {
    keys.push(key);
    values.push(value);
  });
  return `${keys.join(',')}\n${values.join(',')}`;
};

main();
