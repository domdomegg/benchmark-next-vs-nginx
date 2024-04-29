import { Options } from 'k6/options';
import http from 'k6/http';
import { url } from './urlToTest.js';

export const options: Options = {
  discardResponseBodies: true,
  scenarios: {
    contacts: {
      executor: 'constant-arrival-rate',
      duration: '60s',
      rate: 5000,
      preAllocatedVUs: 1000,
    },
  },
};

export default () => {
  http.get(url);
};

export function handleSummary(data: object) {
  return {
    stdout: JSON.stringify(data),
  };
}
