# Apify Actor Runner Web Application

This project is a simple yet powerful web application built to fulfill the Integration Developer Assignment. It provides a clean user interface for a user to authenticate with their Apify API key, select one of their actors, provide the necessary inputs dynamically, and execute a single run to see the results immediately.

---

## ✨ Features

* **Secure Authentication**: Users authenticate by providing their Apify API key, which is securely handled by the backend and never stored on the frontend.
* **Dynamic Actor Loading**: Fetches and displays a list of the user's available actors in real-time.
* **Runtime Schema Generation**: Dynamically generates an input form based on the selected actor's input schema. If no schema exists, it provides a user-friendly, simplified input experience.
* **Single-Run Execution**: Performs exactly one actor execution per request and immediately presents the raw JSON result or any error details.
* **Clear Feedback & Error Handling**: Provides clear user feedback for loading states, successful runs, and any errors that occur (e.g., invalid API key, execution failure).
* **Minimalist Tech Stack**: Built with vanilla HTML, CSS, and JavaScript on the frontend and a lightweight Express.js backend to adhere to the "minimal dependencies" requirement.

---

## 🚀 Working Flow & Output

The application follows a simple and intuitive four-step process.

### **1. Authenticate with API Key**

The user starts by entering their Apify API key and clicking "Fetch Actors".

![Step 1: Authentication](./Screenshot%202025-07-30%20210135.png)

### **2. Select an Actor**

Upon successful authentication, a dropdown appears, populated with the user's actors.

![Step 2: Actor Selection](./Screenshot%202025-07-30%20210155.png)

### **3. Provide Inputs**

When an actor is selected, the application dynamically generates the appropriate input form. For the `web-scraper` actor, this is simplified to just a URL input field.

![Step 3: Dynamic Input Form](./Screenshot%202025-07-30%20210206.png)

### **4. View the Results**

After clicking "Run Actor," the application displays a loader and then presents the final JSON output from the actor's run in a formatted code block.

![Step 4: Results](./Screenshot%202025-07-30%20210228.png)

---

## 🛠️ Technical Details & Design Choices

* **Backend**: **Node.js** with **Express.js**. Chosen for its lightweight nature and simplicity, making it perfect for creating a minimal API backend. **Axios** is used for making requests to the Apify API.
* **Frontend**: **Vanilla HTML, CSS, and JavaScript**. This choice was made deliberately to meet the "minimal dependencies" and "no elaborate frameworks" requirement. It demonstrates the ability to build a functional and dynamic UI without relying on libraries like React or Vue.
* **Dynamic Schema Handling**: The application is robust enough to handle three different actor types:
    1.  A special-case UI for the common `apify/web-scraper`, simplifying its input to just a URL. The required `pageFunction` is handled automatically in the background.
    2.  An auto-generated form for any actor with a defined input schema.
    3.  A generic JSON textarea for any other actor that does not have a schema, ensuring universal compatibility.
* **API Security**: The user's API key is never stored on the frontend. It is sent with each request to the backend, which then securely communicates with the Apify API.

---

## 🧪 Chosen Actor for Testing

For this assignment, the primary actor used for testing was **`apify/web-scraper`**.

This actor was chosen because it is a common and powerful tool, and its lack of a formal input schema provided an excellent opportunity to demonstrate robust handling of different actor types. The application was designed to provide a simplified, user-friendly interface specifically for this actor, abstracting away complex inputs like the `pageFunction` to improve the user experience.

---

## ⚙️ Installation and Running Instructions

**Prerequisites:**
* [Node.js](https://nodejs.org/) and npm installed.

**1. Clone the Repository**
```bash
git clone <your_github_repository_url>
cd <your_project_folder_name>
```

**2. Install Backend Dependencies**
This will install Express, Axios, and other necessary packages for the server.
```bash
npm install
```

**3. Run the Application**
The application requires two separate terminal windows to run the backend server and the frontend client.

**Terminal 1: Start the Backend Server**
In your first terminal, from the project's root directory, run:
```bash
npm run dev
```
You should see the message: `✅ Server is listening on http://localhost:3001`. Keep this terminal running.

**Terminal 2: Start the Frontend Client**
Open a **new** terminal window. Navigate into the `public` folder:
```bash
cd public
```
Start the live server using `npx`:
```bash
npx live-server
```
This command will automatically open the application in your default web browser. You can now use the app.
