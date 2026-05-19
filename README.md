# Quantity Measurement Application - Frontend

This repository houses the frontend client applications developed for the **Quantity Measurement Application (QMA)**. The application enables users to select units under different categories (Length, Weight, Volume, Temperature), enter numeric values, convert between them, and view their conversion history.

## Branches and Project Implementations

The project has been implemented using two different frontend methodologies, each in its own dedicated branch:

---

### 1. UC19-HTMLCSSJSFrontend
*   **Branch:** `UC19-HTMLCSSJSFrontend`
*   **Stack:** Vanilla HTML5, CSS3, ES6 JavaScript, Fetch API (AJAX)
*   **Key Features:**
    *   Responsive, card-based layout styled with Vanilla CSS.
    *   Dynamic dropdown options populated for Length, Weight, Volume, and Temperature units.
    *   Client-side conversion validation.
    *   Asynchronous network requests to backend microservices for performing conversions.
    *   Local history logging of previous conversions with a clear function.
    *   Saved Measurements explorer that pulls data asynchronously from backend APIs.
*   **How to Run Locally:**
    1. Checkout the branch: `git checkout UC19-HTMLCSSJSFrontend`
    2. Open `index.html` directly in any web browser, or serve it using a lightweight local web server (e.g., Live Server in VS Code).
    3. Ensure your QMA backend services are running locally on port `8080` to fetch and save measurements.

---

### 2. UC20-ReactFrontend
*   **Branch:** `UC20-ReactFrontend`
*   **Stack:** React 18, React Router DOM, Axios, Material UI (MUI), Emotion CSS
*   **Key Features:**
    *   Modern Single Page Application (SPA) architecture with React component lifecycle.
    *   Component-driven design utilizing Material UI for rich, polished, and responsive controls.
    *   Authentication routing protection.
    *   Axios-based HTTP client layer with proxy configuration for local development integration.
    *   Global state management using React Context API.
    *   Dynamic micro-animations and validation feedback.
*   **How to Run Locally:**
    1. Checkout the branch: `git checkout UC20-ReactFrontend`
    2. Install dependencies: `npm install`
    3. Start the development server: `npm start`
    4. Access the web app in your browser at: `http://localhost:3000`
    5. *(Note: Make sure your API backend service is running locally on port `8080` to satisfy local API proxy routing)*

---

## Authors & Contribution
- Developed as part of the BridgeLabz training curriculum.
- Developer: Kiran Kurhade (<kiran.kurhade@bridgelabz.com>)
