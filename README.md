# FitJourney Tracker

Build a complete, polished Fitness Tracker web app for CodeAlpha Internship Task 3 using React, TypeScript, Tailwind CSS, Lucide icons, and Recharts.

Key features:
1. Dashboard: Today's fitness summary with metric cards for total steps, water intake, calories burned, and workout duration. Progress bars against daily goals (steps, water, calories, workout minutes) with customizable goals. Weekly progress bar/area chart showing the last 7 days.
2. Daily Activity Logging: Validated form to record steps, water, calories burned, and active duration. Quick increment buttons for easy entry (e.g., +250ml water, +1,000 steps).
3. Workout Tracker: Full CRUD (add, view, edit, delete) for workouts with workout type, duration in minutes, date, and notes. Filterable list with friendly empty states.
4. Progress Tracking: Weekly and daily progress visualization using charts and breakdown stats.
5. LocalStorage: Persist all activity logs, workouts, and goal settings in browser LocalStorage so data remains after refresh. Pre-load tasteful demo data on first load with an option to reset or clear.
6. Design: Responsive mobile-friendly dashboard, clean modern fitness aesthetic, smooth micro-interactions, and clear validation feedback. No external API or authentication required.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/11e20ee8-71fb-4a48-ac86-48178a7582b8).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
