---
featured: true
layout: layouts/post.njk
title: "Trackur.app – A Job Search Pipeline Tracker"
period: "2026"
order: 0
blurb: "Designing and developing a free, open-source Kanban-style job search tracker as a React SPA, from brand identity to production deployment."
tags:
  - React
  - Supabase
  - Tailwind CSS
  - Vercel
  - Web Development
  - Product Design
links:
  preview: 
    url: "https://trackur.app/"
    nofollow: false
  repo: "https://github.com/emanuel-gold/trackur.app"
thumbnail: "/img/Trackur home page.webp"
header_image: "/img/Trackur home page.webp"
---

## Trackur.app – A New Approach to Organizing Your Job Hunt

<a href="https://trackur.app/" target="_blank">Trackur.app</a> is a free, Kanban-style web application that lets job seekers track applications through every stage of the process, from initial interest to offer. It was intentionally built as an open-source replacement for the finnicky spreadsheets and over-engineered SaaS tools that most people default to during a job search.

The project started from a straightforward observation: spreadsheets aren't doing what I want. I found myself staring at a list of places I applied in rows and columns, but still struggling to visualize what was in process, what I had to do next, and what already happened. 

The pitfall of row data is that it lacks the concept of state. Dedicated job tracking apps exist, but they bundle in AI features, gamification, and subscription tiers that have nothing to do with the core task of organizing where you stand while trying to get hired. For those apps, organization is a bonus on top of pricey, complicated features. Trackur was built to do one thing well: give the user a drag-and-drop pipeline view of their applications.

## The Problem

While spreadsheets are an incredibly common method for tracking data, their shortcomings become evident when data is constantly changing. Adding something like a to-do list in Excel is certainly possible, but the time it would take to configure, customize, and refine just distracts from the work to be done. If a user is color-coding spreadsheet tabs, fighting Excel's number formatting, or resizing columns to check notes, they're not **applying.**

The market has tools like <a href="https://www.tealhq.com" target="_blank">Teal</a>, a robust resume tailoring tool, and <a href="https://simplify.jobs/" target="_blank">Simplify</a>, which positions itself as an all-in-one job application tool. The main issue with both tools' value proposition is they offer a high feature count for a high cost. 

The market presented a gap for a simple, no/low-cost, organization-focused tool that didn't attempt to do everything for everyone.

I decided to apply some tried-and-true <a href="https://agilemanifesto.org/principles.html" target="_blank">Agile principles</a> to fixing this problem:
- Simplicity—the art of maximizing the amount of work not done—is essential.
- Satisfy the customer through early and continuous delivery of valuable software.
- Working software is the primary measure of progress.

## The Idea

To those who have used a Kanban-style board to track tasks, Trackur will seem familiar. The core functionality of the single page app (SPA) centers around using stages to visually depict each job application's status. While an Excel row with a cell that changes from "Applied" to "Interviewing" looks exactly the same, Trackur gives the user a visual representation of the state change. The inspiration came from managing CRM deal pipelines: providing real-time visibility and a streamlined interface allows the user to gain momentum from their data, not fight with it. 

<!-- TODO add screenshots of the stage columns -->
{% postImage "./trackur-dashboard.webp", "Intuitive and streamlined stage columns allow users to drag cards through their pipeline", { caption: "A no-frills SaaS marketing site" } %}


## My Approach

The product scope was intentionally kept minimal. No AI-generated resumes, no social features, no robotic motivational nudges. Every feature decision was filtered through two questions related to those Agile principles: "does this help someone track a job application?" and "would I actually use this feature?" If the answer to either was no, it didn't ship. 

### Architecture 

Trackur runs as a Vite + React single-page application deployed on Vercel, with Supabase handling authentication and data persistence.

### Marketing 

The app needed a marketing site to stand on its own. Using a custom-built template theme, a simple SaaS site was developed and deployed to Cloudflare Pages. The <a href="https://trackur.app/" target="_blank">marketing site</a> lives in its own repository, keeping concerns separated and deployments independent. The website prioritizes simplicity: bright CTAs and a simple conversion flow invite users to sign up, at which point they are directed to the SPA.  

{% postImage "/img/Trackur home page.webp", "A no-frills SaaS marketing site", { caption: "A no-frills SaaS marketing site" } %}
<!-- TODO: once Canopy post is ready, link to that article. -->

### Drag-and-Drop Pipeline

The core interaction—dragging a job card between Kanban columns—was built using the native HTML5 Drag and Drop API in an effort to keep dependencies small. Each card supports next steps and follow-up items so users can track post-application tasks without leaving the board.

### Brand Identity

The visual identity was built to reject the high-energy, hustle-culture tone common in career tools. The palette (mauve, mist, olive) and typography (Instrument Serif, Outfit, IBM Plex Mono) were chosen to feel calm and functional rather than performative.

### Scalability Without Cost Creep

The free tier is permanent. Hosting costs are minimal at the current scale, and the architecture was chosen specifically to keep them that way. If paid features are added later, the core tracking functionality was designed from MVP to stay completely free.

## Development Process

The driving principle behind Trackur's development was reducing friction between the user and their data. Every technical decision was made in service of that goal.

- **Inline Editing –** Early builds used a traditional edit flow: click a card, open a modal, make changes, save. In practice, this felt clunky. Having to open a separate view to change a single field added unnecessary steps, and the context switch was enough to lose a thought mid-edit. The solution was inline editing: clicking a field on a card or in the edit panel makes it editable, and changes immediately save on blur. The `InlineEditableField` component handles text, date, select, and textarea inputs, and a shared `useInlineEdit` hook manages the editing state across both the Kanban cards and the edit panel.
- **Repository Pattern –** Components never interact with the database directly. The data layer follows a repository pattern: components call the `useJobs` hook, which delegates to `jobRepository`, which delegates to an adapter. The app originally used a localStorage adapter during early development. When Supabase was introduced, the swap required changing a single import in `jobRepository.js` — no component code was touched. This also meant the camelCase-to-snake_case mapping between the React app and PostgreSQL lives in one place (`supabaseAdapter.js`), not scattered across components.
- **Auth and Data Isolation –** Supabase handles both authentication (email/password and Google OAuth) and data storage. Row-Level Security policies on the `jobs` table scope all queries to the authenticated user's ID, which is set by the database via `auth.uid()` — never sent from the client. The auth flow in `App.jsx` gates everything: loading state shows a spinner, no session shows the login screen, valid session renders the app.
- **Mobile-First Responsive Design –** Using <a href="https://tailwindcss.com/" target="_blank">Tailwind CSS</a> makes mobile-first design simple and maintainable. The default styles target mobile, then desktop overrides are applied at Tailwind's `md:` breakpoint. On mobile, the Kanban board stacks stages vertically with horizontally scrolling cards within each stage. The desktop board uses fixed-width, interactive columns. A floating action button replaces the toolbar's add button on small screens to keep the header tidy.
- **Adapted Component Library –** The UI is built on multiple existing UI kits, but every component has been modified to use Trackur's branding, styles, and colors. Focus rings, active states, button variants, and badge colors all run through the main palette. This gives the app a consistent visual identity without building a component library from scratch.
- **No Router, No State Library –** The app has no client-side routing and no external state management. Navigation is handled through modals and view toggles. All application state lives in `App.jsx` and is passed down via props. For a single-purpose tool with one main view, this keeps the dependency footprint small and the mental model simple.

## A Focused Tool for Job Seekers

Trackur is a purpose-built, open-source application that treats job tracking as a workflow problem, not a content or coaching problem. The result is a fast, distraction-free tool that stays out of the user's way and lets them focus on the search itself.
