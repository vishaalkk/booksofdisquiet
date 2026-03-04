# Books of Disquiet

A quirky, neo-brutalist digital library archiving a personal collection of books. Built with [Eleventy (11ty)](https://www.11ty.dev/) and vanilla JavaScript.

## Features
- **Data-Driven:** Reads directly from a `books.csv` file exported from Airtable.
- **Client-Side Search & Filtering:** Instantly filter your library by Status, Language, Author, or Bookstore.
- **Neo-Retro File System:** Browse your collection through a classic collapsible directory tree.
- **Quirky Details:** Hand-drawn SVG cat doodles, randomized writer portraits on every load, and brutalist polaroid styling.

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the local development server:
   ```bash
   npm start
   ```
   This will run Eleventy in watch mode. Open `http://localhost:8080` in your browser.

## Adding New Books
Simply replace or update the `books.csv` file in the root directory. 
When you update the CSV, Eleventy will automatically rebuild the site. New authors, languages, and bookstores will automatically appear in the left-hand folder tree.

## Building for Production
To generate the static HTML/CSS/JS files:
```bash
npm run build
```
This will output the final website into the `_site/` directory.

## Deployment to GitHub Pages

Since this is a completely static site, it can be hosted for free on GitHub Pages.

1. Commit and push this repository to GitHub.
2. Go to your repository **Settings** > **Pages**.
3. Under **Build and deployment**, select **GitHub Actions**.
4. GitHub should suggest the **Eleventy** workflow. Click "Configure" and commit the workflow file. 
5. Your site will automatically build and deploy every time you push to the `main` branch!