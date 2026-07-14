# Redeemers International School

React frontend with a small PHP + JSON news/admin backend.

## Run on XAMPP

1. Build the React site:

```bash
npm install
npm run build
```

2. Create a folder inside XAMPP:

```bash
mkdir -p /opt/lampp/htdocs/wins/redeemers
```

3. Copy the built frontend:

```bash
cp -a dist/. /opt/lampp/htdocs/wins/redeemers/
```

4. Copy the PHP backend and data folder:

```bash
cp -a api data /opt/lampp/htdocs/wins/redeemers/
```

5. Make the data folder writable:

```bash
chmod 777 /opt/lampp/htdocs/wins/redeemers/data
chmod 666 /opt/lampp/htdocs/wins/redeemers/data/news.json
```

6. Open the site:

```txt
http://localhost/wins/redeemers/
```

Admin page:

```txt
http://localhost/wins/redeemers/admin_login
```

Before using the admin page, set an admin password hash in `api/config.php`.

Generate a hash with:

```bash
php -r "echo password_hash('your_password_here', PASSWORD_BCRYPT);"
```
