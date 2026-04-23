# 🚀 Formulix - התקנת חיבור חי ל-DB

מדריך זה יעזור לך להעלות את המערכת לענן עם **חיבור חי למסד נתונים**.

## 📋 ארכיטקטורה

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Azure SQL     │────▶│  Formulix API   │────▶│   Dashboard     │
│   Database      │     │  (Azure App)    │     │   (Vercel)      │
│                 │     │                 │     │                 │
│  1M רשומות      │     │  /api/summary   │     │  React + Live   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

## שלב 1: יצירת Azure SQL Database (חינמי לשנה הראשונה!)

### 1.1 כניסה ל-Azure Portal
פתח: https://portal.azure.com

### 1.2 צור SQL Database
1. לחץ **"Create a resource"** → חפש **"SQL Database"**
2. הגדרות:
   - **Database name**: `FormulixDB`
   - **Server**: צור שרת חדש
     - **Server name**: `formulix-server` (או שם ייחודי)
     - **Location**: `West Europe` או הקרוב אליך
     - **Authentication**: SQL Authentication
       - **Admin login**: `formulixadmin`
       - **Password**: בחר סיסמה חזקה
   - **Compute + storage**: לחץ "Configure database" → **Basic** (חינמי לשנה)
3. לחץ **"Review + create"** → **"Create"**

### 1.3 פתח גישה לפיירוול
1. עבור ל-Database שיצרת
2. **"Set server firewall"** (בתפריט העליון)
3. הוסף **"Add your client IP"**
4. הוסף **"Allow Azure services"** → **Save**

### 1.4 קבל את Connection String
1. ב-Database → **"Connection strings"**
2. העתק את ה-**ADO.NET** connection string
3. יראה ככה:
```
Server=tcp:formulix-server.database.windows.net,1433;Initial Catalog=FormulixDB;Persist Security Info=False;User ID=formulixadmin;Password={your_password};MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;
```

---

## שלב 2: העלאת הנתונים לענן

### 2.1 התקן SSMS או Azure Data Studio
הורד: https://docs.microsoft.com/en-us/sql/ssms/download-sql-server-management-studio-ssms

### 2.2 התחבר ל-Azure SQL
פתח SSMS → **Connect to Server**:
- **Server name**: `formulix-server.database.windows.net`
- **Authentication**: SQL Server Authentication
- **Login**: `formulixadmin`
- **Password**: הסיסמה שבחרת

### 2.3 הרץ את קבצי ה-SQL
פתח וביצע את הקבצים בסדר הזה:
1. `DB/FormulixCreate.sql` - יוצר את המבנה ו-1M רשומות
2. `DB/AddComplexFormulas.sql` - נוסחאות מורכבות

**הערה**: פקודת `USE Formulix` צריכה להשתנות ל-`USE FormulixDB` (שם ה-DB בענן)

---

## שלב 3: העלאת ה-API ל-Azure App Service

### 3.1 התקן Azure CLI
```powershell
winget install Microsoft.AzureCLI
```

### 3.2 התחבר ל-Azure
```powershell
az login
```

### 3.3 צור App Service
```powershell
# צור Resource Group (אם אין)
az group create --name formulix-rg --location westeurope

# צור App Service Plan (חינמי)
az appservice plan create --name formulix-plan --resource-group formulix-rg --sku F1 --is-linux

# צור Web App
az webapp create --name formulix-api --resource-group formulix-rg --plan formulix-plan --runtime "DOTNETCORE:10.0"
```

### 3.4 הגדר את Connection String
```powershell
az webapp config connection-string set --name formulix-api --resource-group formulix-rg --connection-string-type SQLAzure --settings "FORMULIX_DB_CONNECTION=Server=tcp:formulix-server.database.windows.net,1433;Initial Catalog=FormulixDB;User ID=formulixadmin;Password=YOUR_PASSWORD;Encrypt=True;TrustServerCertificate=False;"
```

### 3.5 פרסם את ה-API
```powershell
cd src/Formulix/Formulix.API
dotnet publish -c Release -o ./publish
Compress-Archive -Path ./publish/* -DestinationPath api.zip -Force
az webapp deployment source config-zip --name formulix-api --resource-group formulix-rg --src api.zip
```

### 3.6 בדוק ש-API עובד
פתח בדפדפן: `https://formulix-api.azurewebsites.net/api/health`
צריך לקבל: `{"status":"ok","timestamp":"..."}`

---

## שלב 4: העלאת הדשבורד ל-Vercel

### 4.1 צור קובץ .env
```bash
cd dashboard
copy .env.example .env
```

ערוך את `.env`:
```
VITE_API_URL=https://formulix-api.azurewebsites.net
```

### 4.2 Build הדשבורד
```powershell
npm run build
```

### 4.3 העלה ל-Vercel
```powershell
npx vercel --prod
```

כשישאלו על Environment Variables:
- `VITE_API_URL` = `https://formulix-api.azurewebsites.net`

---

## שלב 5: הרץ את ה-Benchmarks

### 5.1 עדכן Connection Strings בקוד
ב-`src/Formulix/Formulix.Shared/DbSettings.cs`, עדכן:
```csharp
public static string ConnectionString =>
    Environment.GetEnvironmentVariable("FORMULIX_DB_CONNECTION") 
    ?? "Server=tcp:formulix-server.database.windows.net,1433;...";
```

### 5.2 הרץ את המנועים
```powershell
dotnet run --project src/Formulix/Formulix.SqlDynamic
dotnet run --project src/Formulix/Formulix.RoslynRunner
dotnet run --project src/Formulix/Formulix.AITranslator
python python/formulix_sympy/runner.py
```

---

## 🎉 סיום

כעת יש לך:
- ✅ **Azure SQL Database** עם מיליון רשומות
- ✅ **API** שמחזיר נתונים חיים מה-DB
- ✅ **Dashboard** שמתחבר ל-API ומציג נתונים בזמן אמת
- ✅ **Auto-refresh** כל 30 שניות

שלח לבודקים את הקישור: `https://your-project.vercel.app`

---

## 🔧 פתרון בעיות

### API מחזיר שגיאה
1. בדוק Firewall ב-Azure SQL
2. בדוק Connection String
3. בדוק Logs: `az webapp log tail --name formulix-api --resource-group formulix-rg`

### Dashboard לא מתחבר
1. בדוק CORS ב-API
2. בדוק VITE_API_URL ב-Vercel
3. בדוק Console בדפדפן (F12)
