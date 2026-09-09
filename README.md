# Café Bloom

A complete, premium café brand website — *"Where every cup tells a story."* Built as a fully static, frontend-only site with HTML5, CSS3 and vanilla JavaScript. No frameworks, no backend, no build step: open `index.html` and it works.

## 🌐 Live Website

**[Visit Café Bloom](https://tanjimapinke.github.io/cafe-bloom/)**

> Explore the live Café Bloom website hosted with GitHub Pages.

## Features

- Five fully designed pages: Home, Menu, About, Gallery, Reservation
- Responsive layout tested from 375px mobile up to 1440px+ desktop
- Sticky, blurring navbar with a smooth mobile drawer
- Light / dark mode toggle with saved preference
- Menu with category filtering and live search
- Shopping cart drawer with quantity controls and persistent storage
- Wishlist / favorites with heart animation, saved across visits
- Customer review carousel with dots and autoplay
- Gallery with category filters and a keyboard-accessible lightbox
- Reservation form with real-time validation and a confirmation modal
- Animated statistic counters on the About page
- Toast notifications for cart, favorites, newsletter and reservation actions
- Scroll-reveal animations via `IntersectionObserver`, with `prefers-reduced-motion` respected throughout
- Semantic HTML, labeled form fields, visible focus states and ARIA labels

## Technologies

- HTML5
- CSS3 (custom properties, Grid, Flexbox, CSS columns for the masonry gallery)
- Vanilla JavaScript (ES6+, `localStorage`, `IntersectionObserver`)
- Google Fonts — Playfair Display & Poppins
- Font Awesome (via CDN)

## Pages

| Page | File |
|---|---|
| Home | `index.html` |
| Menu | `menu.html` |
| About | `about.html` |
| Gallery | `gallery.html` |
| Reservation | `reservation.html` |

## Interactive Features

- **Cart** — add, adjust quantity, remove, and see a live subtotal; persisted in `localStorage`
- **Wishlist** — heart any menu item; persisted in `localStorage`
- **Search** — quick search in the navbar plus a dedicated live search on the Menu page
- **Filtering** — category filters on both the Menu and Gallery pages
- **Dark mode** — toggle in the navbar, remembered across pages and sessions
- **Reservation validation** — name, email, phone, date (no past dates), time and guest count
- **Gallery lightbox** — full-screen viewer with previous/next and keyboard arrows
- **Review slider** — dot navigation, arrow controls, and autoplay that pauses on hover
- **LocalStorage** — used for cart, favorites and theme preference

## Project Structure

```
cafe-bloom/
├── index.html
├── menu.html
├── reservation.html
├── about.html
├── gallery.html
├── css/
│   ├── style.css        (global styles, shared across every page)
│   ├── menu.css
│   ├── reservation.css
│   └── gallery.css
├── js/
│   ├── app.js            (navbar, theme, cart, favorites, toasts, reveal, homepage + gallery/lightbox)
│   ├── menu.js            (menu data, filtering, search)
│   └── reservation.js     (form validation, confirmation modal)
└── README.md
```

> Note: images are loaded from public Unsplash and Pravatar URLs so the project runs immediately with no local assets required. Swap them for local files under an `images/` folder (`images/coffee/`, `images/food/`, `images/gallery/`) if you'd like to self-host.

## How to Run

No build tools or server are required.

1. Download or clone the project folder.
2. Double-click `index.html` to open it directly in your browser, **or**
3. In VS Code, install the "Live Server" extension, right-click `index.html`, and choose **Open with Live Server** for auto-reload while editing.

## Testing Checklist

- Click through every navbar link and footer link on every page
- Resize the browser (or use DevTools device toolbar) at 375px, 768px, 1024px and 1440px
- Toggle dark mode and confirm it persists after a refresh and across pages
- On the Menu page, filter by category and search by name
- Add items to the cart, adjust quantities, remove an item, and refresh to confirm persistence
- Heart a few items and confirm the favorites badge and state persist
- Submit the Reservation form with missing/invalid fields to see validation, then with valid data to see the confirmation modal (date cannot be in the past)
- Open the Gallery lightbox, navigate with the on-screen arrows and the keyboard arrow keys
- Subscribe to the newsletter with an invalid and then a valid email

## Deployment (GitHub Pages)

1. Push the `cafe-bloom` folder to a GitHub repository (the contents of this folder should sit at the repo root, or in a `/docs` folder — either works).
2. In the repository, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to "Deploy from a branch".
4. Choose the branch (e.g. `main`) and the folder (`/root` or `/docs`), then save.
5. GitHub will publish the site at `https://<your-username>.github.io/<repo-name>/` within a minute or two.

## Notes

This is a frontend-only demo. The cart checkout button and the reservation form do not connect to any real payment system, email service, or database — all data lives in the browser's `localStorage` and is cleared if you clear your browser data.
