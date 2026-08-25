# Andrew the Coder - Personal Website

This is the source code for my personal website and blog, [andrewthecoder.com](https://andrewthecoder.com). It's built with [Astro](https://astro.build) and serves as a place to share my thoughts on software development, web technologies, and other interests.

## ✨ Features

- **Blog:** Posts written in Markdown/MDX.
- **Frameworks:** Built with Astro, using Svelte components.
- **Deployment:** Automatically deployed via GitHub Actions.
- **Syndication:** RSS feed available at `/rss.xml`.
- **SEO:** Sitemap and OpenGraph data for better search engine visibility.
- **UI:** Dark mode support.

## 🚀 Getting Started

To run this project locally, follow these steps:

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/andrewthecodertx/andrewthecoder.com.git
    cd andrewthecoder.com
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Start the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at [http://localhost:4321](http://localhost:4321).

## 🧞 Available Scripts

| Command           | Action                                       |
| :---------------- | :------------------------------------------- |
| `npm install`     | Installs dependencies                        |
| `npm run dev`     | Starts local dev server at `localhost:4321`  |
| `npm run build`   | Build your production site to `./dist/`      |
| `npm run preview` | Preview your build locally, before deploying |

## 📁 Project Structure

- `src/pages/`: Contains all the pages and routes for the website.
- `src/layouts/`: Base layout components for pages.
- `src/components/`: Reusable UI components (Astro & Svelte).
- `src/data/`: Content collections for blog posts and authors.
- `src/styles/`: Global CSS styles.
- `public/`: Static assets like images and fonts.

## CI/CD

This project uses a GitHub Actions workflow defined in `.github/workflows/deploy.yml` to automatically build and deploy the site to production.

## License

MIT, see [LICENSE](LICENSE).

## Contributing

PRs welcome. Please open an issue first for major changes.
