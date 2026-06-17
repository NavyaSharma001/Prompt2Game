# P2G — Prompt to Game Engine

A full-stack web application that translates natural language input into dynamic, playable 2D game environments. The system utilizes an Express backend to parse prompt strings and serves a real-time rendering loop via the Phaser 3 engine.

---

## ⚙️ Core Architecture & Logic
* **Dynamic State Generation:** The Node.js backend processes strings to dynamically configure physics environments, enemy quantities, movement velocities, and environmental assets based on detected parameters (e.g., matching keywords like "alien", "shooter", or "hard").
* **Asynchronous State Exchange:** The client sends user prompts asynchronously to custom REST API endpoints, receiving an algorithmic JSON payload containing full scene setup parameters.
* **Canvas Rendering & Physics:** Built using Phaser's Arcade Physics engine to handle dynamic movement velocities, platform collision maps, and overlapping bounds checking for entities.

---

## 🛠️ Tech Stack
* **Backend Framework:** Node.js, Express, CORS
* **Frontend Framework:** Phaser 3 (HTML5 Game Engine), JavaScript (ES6+), CSS3
* **Asset Integration:** DiceBear Procedural API & local graphic resources

---

## 📁 Repository Structure
* `/public` - Frontend client UI, core game canvas controller (`main.js`), and default assets.
* `/server` - Backend environment initialization router and prompt processing controller.
* `package.json` - Project metadata, scripts, and runtime package dependencies.

---

## 🚀 How to Run Locally

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/YOUR_USERNAME/Prompt2Game.git](https://github.com/YOUR_USERNAME/Prompt2Game.git)
