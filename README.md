# benchmark-next-vs-nginx

Benchmarking the performance of the Next.js server against nginx for static content.

[Read the full blog article](https://adamjones.me/blog/benchmark-next-vs-nginx/).

## Usage

1. Install Git and Node.js
2. Clone the repository
3. Install dependencies with `npm install`, and [install k6](https://grafana.com/docs/k6/latest/set-up/install-k6/)
4. Run the benchmark with `URL_TO_TEST=http://localhost:8080/path-here/ npm start`
5. View results in [`results.csv`](./results.csv)
