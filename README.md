# Brew & Bite — E-Cafe Management System
### Azure Practical Project

A simple cafe management system with:
- **Frontend**: HTML/CSS/JavaScript (single page)
- **Backend**: Node.js + Express REST API
- **Database**: MySQL (Azure Database for MySQL Flexible Server)

Features: manage menu items, categories, customers, and orders (with order items, totals, and status tracking).

---

## 1. Project Structure

```
ecafe/
├── backend/
│   ├── config/db.js          # DB connection (uses env vars)
│   ├── routes/
│   │   ├── menuRoutes.js
│   │   ├── customerRoutes.js
│   │   ├── orderRoutes.js
│   │   └── categoryRoutes.js
│   ├── server.js             # Express app entry point
│   ├── package.json
│   ├── .env.example
│   └── web.config             # only needed for Azure Windows hosting
├── frontend/
│   └── index.html             # single-page UI (menu/orders/customers)
├── database/
│   └── schema.sql              # tables + sample data
└── .github/workflows/azure-deploy.yml   # optional CI/CD
```

---

## 2. Run Locally First (recommended before deploying)

### a) Set up MySQL locally
```bash
mysql -u root -p < database/schema.sql
```

### b) Configure backend
```bash
cd backend
cp .env.example .env
# edit .env with your local DB credentials
npm install
npm start
```
Backend runs at `http://localhost:5000`.

### c) Run frontend
Just open `frontend/index.html` in a browser (or serve it with any static server).
It's already pointed at `http://localhost:5000/api`.

Test that menu items / customers / orders load and that you can add/delete records.

---

## 3. Deploy to Azure

### Step 1 — Create a Resource Group
```bash
az group create --name ecafe-rg --location eastus
```

### Step 2 — Create Azure Database for MySQL Flexible Server
```bash
az mysql flexible-server create \
  --resource-group ecafe-rg \
  --name ecafe-mysql-server \
  --admin-user ecafeadmin \
  --admin-password "YourStrongPassword123!" \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --storage-size 32 \
  --version 8.0
```

Allow Azure services (and your backend App Service) to connect:
```bash
az mysql flexible-server firewall-rule create \
  --resource-group ecafe-rg \
  --name ecafe-mysql-server \
  --rule-name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

Create the database and load the schema:
```bash
mysql -h ecafe-mysql-server.mysql.database.azure.com \
  -u ecafeadmin -p < database/schema.sql
```

### Step 3 — Create App Service for the backend
```bash
az appservice plan create \
  --name ecafe-plan \
  --resource-group ecafe-rg \
  --sku B1 \
  --is-linux

az webapp create \
  --resource-group ecafe-rg \
  --plan ecafe-plan \
  --name YOUR-UNIQUE-APP-NAME \
  --runtime "NODE:20-lts"
```

### Step 4 — Configure environment variables (Application Settings)
Go to **Azure Portal → App Service → Configuration → Application settings**, or via CLI:
```bash
az webapp config appsettings set \
  --resource-group ecafe-rg \
  --name YOUR-UNIQUE-APP-NAME \
  --settings \
    DB_HOST="ecafe-mysql-server.mysql.database.azure.com" \
    DB_USER="ecafeadmin" \
    DB_PASSWORD="YourStrongPassword123!" \
    DB_NAME="ecafe_db" \
    DB_PORT="3306" \
    DB_SSL="true"
```

### Step 5 — Deploy backend code
From inside the `backend/` folder:
```bash
cd backend
az webapp up \
  --name YOUR-UNIQUE-APP-NAME \
  --resource-group ecafe-rg \
  --runtime "NODE:20-lts"
```

Your API will now be live at:
```
https://YOUR-UNIQUE-APP-NAME.azurewebsites.net/api/menu
```

### Step 6 — Point the frontend at your live backend
In `frontend/index.html`, change:
```js
const API_BASE = "http://localhost:5000/api";
```
to:
```js
const API_BASE = "https://YOUR-UNIQUE-APP-NAME.azurewebsites.net/api";
```

### Step 7 — Host the frontend (pick one)
**Option A — Azure Static Web Apps**
```bash
az staticwebapp create \
  --name ecafe-frontend \
  --resource-group ecafe-rg \
  --location eastus2 \
  --source frontend
```

**Option B — Just open `index.html` locally** for a quick demo (fine for a practical/viva — you don't strictly need to host the frontend on Azure too, just the backend + database, unless your assignment requires it).

---

## 4. API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/menu | List all menu items |
| POST | /api/menu | Add menu item |
| PUT | /api/menu/:id | Update menu item |
| DELETE | /api/menu/:id | Delete menu item |
| GET | /api/categories | List categories |
| POST | /api/categories | Add category |
| GET | /api/customers | List customers |
| POST | /api/customers | Add customer |
| PUT | /api/customers/:id | Update customer |
| DELETE | /api/customers/:id | Delete customer |
| GET | /api/orders | List orders |
| GET | /api/orders/:id | Get order + items |
| POST | /api/orders | Place new order |
| PUT | /api/orders/:id/status | Update order status |
| DELETE | /api/orders/:id | Delete order |

---

## 5. Notes for the Practical / Viva

- The **separation of frontend/backend/database** maps directly onto a typical 3-tier Azure architecture: **Static Web App / Blob → App Service → Azure Database for MySQL**.
- `config/db.js` reads credentials from environment variables — this is exactly how Azure App Service expects secrets to be supplied (via *Application Settings*, never hardcoded).
- The order placement endpoint demonstrates a **transaction** (begin/commit/rollback) across two tables (`orders`, `order_items`), which is good to mention if asked about data integrity.
- `DB_SSL=true` is required because Azure Database for MySQL Flexible Server enforces SSL connections by default.
