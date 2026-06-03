# CalcMaster Pro

CalcMaster Pro is a production-quality, responsive calculator suite built with HTML5, CSS3, Vanilla JavaScript, Node.js APIs, and optional MySQL history storage. It combines standard, scientific, health, finance, currency, unit conversion, number system, percentage, CGPA, and settings tools in a premium dashboard layout.

## Features

- Dashboard layout with left sidebar navigation and a right content workspace.
- Modern dark glassmorphism theme using `#0F172A` and `#1E293B`, plus an accessible light mode.
- Standard calculator with addition, subtraction, multiplication, division, percentage, decimals, delete, clear, sign toggle, keyboard support, invalid operator prevention, and divide-by-zero handling.
- Scientific calculator with parentheses, π, e, x², x³, xʸ, √x, ⁿ√x, factorial, absolute value, log, ln, 10ˣ, eˣ, trigonometry, degree/radian modes, and memory controls.
- BMI, age, percentage, CGPA, binary/decimal/octal/hex converters, EMI, SIP, compound interest, and unit converters.
- Currency converter with a Node.js exchange-rate API route, server-side caching, search, swap, and history support.
- History panel with search, clear, export to CSV, localStorage fallback, and MySQL persistence when environment variables are configured.
- Responsive desktop, tablet, and mobile layout with sidebar slide animation and card fade animation.

## Folder Structure

```text
CalcMaster-Pro/
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── app.js
│   ├── calculators.js
│   ├── converters.js
│   └── history.js
├── assets/
├── api/
│   ├── history.js
│   └── rates.js
├── server/
│   ├── app.js
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── currencyController.js
│   │   └── historyController.js
│   ├── routes/
│   │   ├── currencyRoutes.js
│   │   └── historyRoutes.js
│   └── services/
│       ├── currencyService.js
│       └── historyService.js
├── database/
│   ├── queries.sql
│   └── schema.sql
├── package.json
└── vercel.json
```

## Local Development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Optional MySQL setup:

   ```bash
   mysql -u root -p < database/schema.sql
   ```

3. Create `.env` if you want MySQL persistence:

   ```env
   MYSQL_HOST=localhost
   MYSQL_PORT=3306
   MYSQL_USER=root
   MYSQL_PASSWORD=your_password
   MYSQL_DATABASE=calcmaster_pro
   EXCHANGE_RATE_API_URL=https://api.exchangerate-api.com/v4/latest/USD
   ```

4. Start the Node.js server:

   ```bash
   npm start
   ```

5. Open `http://localhost:3000`.

## Vercel Deployment

1. Push this repository to GitHub.
2. Import the project in Vercel.
3. Add MySQL environment variables in **Project Settings → Environment Variables**. For production, use a cloud MySQL provider such as PlanetScale, Aiven, Railway, or AWS RDS.
4. Deploy. The `api/history.js` and `api/rates.js` serverless entries route to the Node.js application, and `vercel.json` serves the static frontend.

## Database

Run `database/schema.sql` to create the `calculation_history` table. Reusable SQL statements live in `database/queries.sql`.
