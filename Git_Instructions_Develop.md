Option B: 
========
GitHub Pages (Free, Developer-friendly)
Create a GitHub account → New repository (e.g., olivers-dream)
Upload the entire Study_Portal folder contents to the repo
Go to Settings → Pages → Source: main branch
Set your custom domain in the same settings page
Add a CNAME record in your domain's DNS pointing to yourusername.github.io

================================================================================================

GitHub org creation can't be done via the CLI — it must be done through the browser. Here are the quick steps:

Create the Organization (2 minutes)
Go to https://github.com/account/organizations/new?plan=free
Organization name: olivers-dream
Contact email: your email
Choose Free plan → Create
Skip the "Add members" step

================================================================================================

Create the repo olivers-dream.github.io under the org
Push all the code
Enable GitHub Pages
Your site will be live at olivers-dream.github.io

================================================================================================

cd Study_Portal && git add -A && git commit -m "Update" && git push orgorigin main

================================================================================================

Future Improvement Suggestions
Priority	Suggestion	Impact
High	Search bar — instant chapter search across all subjects	Saves navigation time
High	Print-friendly mode — CSS @media print rules for clean chapter printouts	Offline revision sheets
High	Progress sync — export/import localStorage as JSON file (backup)	Prevents data loss
Medium	Dark/Light toggle — add a theme switcher	Eye comfort during day study
Medium	Spaced repetition — track chapter revision dates, show "due for review" alerts	Science-backed retention
Medium	Quick quiz mode — timed MCQ mini-tests from each chapter's practice section	Exam simulation
Low	Pomodoro timer — 25-min study + 5-min break timer built into each chapter	Focus management
Low	Notes section — per-chapter editable notes saved to localStorage	Personal annotations
Low	Accessibility — keyboard navigation, larger text option, high-contrast mode	Inclusivity
Low	PWA (Progressive Web App) — add manifest.json + service worker for app-like install on phone	Mobile access

================================================================================================
