# 🧪 Active Matter & Diffusion Laboratory
### Developed by: Malladi Karthika  
**B.Tech Computer Science & Engineering**

---

## 📖 Research Abstract
This interactive laboratory simulates **Brownian Motion** and **Active Matter Dynamics** using high-performance web technologies. By implementing stochastic differential equations, the simulation explores how thermal fluctuations, fluid viscosity, and external potentials affect particle transport at the microscopic scale.

I developed this as a research-readiness project for the **NIUS (Physics) 2026 Program** at HBCSE-TIFR to demonstrate the application of **Numerical Integration** in Statistical Mechanics.

## 🚀 Live Research Tool
https://v0-active-matter-simulation.vercel.app

---

## 🔬 Scientific Core
- **Stochastic Integration:** Uses the **Euler-Maruyama method** to solve the Langevin equation: $dx = \sqrt{2Dt} \cdot dW$, modeling the 'Random Walk' of particles.
- **Mean Squared Displacement (MSD):** Includes a real-time analytics dashboard that calculates MSD to derive the **Diffusion Coefficient ($D$)**.
- **Non-Equilibrium Dynamics:** Interactive 'Heat Drop' feature allows for the study of thermal gradients and local kinetic energy spikes.
- **Potential Fields:** Mouse-based 'Repulsive Potential' simulates **Optical Tweezers**, allowing the researcher to physically perturb the system.

## 💻 Technical Implementation 
- **Framework:** Next.js 14 with React Server Components for a robust architecture.
- **Real-time Engine:** HTML5 Canvas API for high-frequency (60fps) particle updates.
- **Analytics:** Integrated **ComposedCharts** for live velocity distribution histograms and Maxwell-Boltzmann overlays.
- **State Management:** Custom React hooks for handling complex stochastic state-changes across 200+ independent entities.

---

## 👩‍🔬 About the Author
I am **Malladi Karthika**, a 1st-year CSE student. My goal is to specialize in **Computational Physics**, using my engineering background to build tools that simulate and analyze complex physical systems. This lab represents my interest in **Statistical Mechanics** and **Active Matter** for the **NIUS 2026** application.

---
*Created for the NIUS 2026 Physics Application portfolio.*
