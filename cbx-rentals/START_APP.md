# How to Start the CBX Rentals App

Since I cannot maintain a long-running server process, you need to start it manually:

## Option 1: Using Terminal

1. Open a new Terminal window
2. Navigate to the project:
   ```bash
   cd /Users/keithkabza/work/CBXRentals/cbx-rentals
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Option 2: Using the start script

```bash
cd /Users/keithkabza/work/CBXRentals/cbx-rentals
./start.sh
```

## The app will be available at:

### http://localhost:5555

## Login Credentials:
- **Username**: cbxadmin
- **Password**: CBX2025$ecure

## If the server still doesn't work:

1. Try killing all Node processes:
   ```bash
   pkill -f node
   ```

2. Check if the port is in use:
   ```bash
   lsof -i :5555
   ```

3. Try running with npx directly:
   ```bash
   cd /Users/keithkabza/work/CBXRentals/cbx-rentals
   npx vite --port 5555
   ```

## What you should see:
- Styled login page (not black and white)
- After login: Dashboard with cards
- Working attendees table without flashing

The CSS issues have been fixed by downgrading to Tailwind v3.