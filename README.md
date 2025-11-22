# The Consigliere

> *"Finance is a gun. Politics is knowing when to pull the trigger."*

**The Consigliere** is a premium, noir-themed CRM and Operations Dashboard designed for those who mean business. Built with modern web technologies but styled for the underworld, it manages your empire's operations, finances, and associates with ruthless efficiency.

![Dashboard Preview](https://github.com/MRRzkS/Consigliere/assets/placeholder/dashboard.png)

## 💼 Features

### 1. The Dashboard (Overview)
- **Executive Summary**: Real-time tracking of Profit, Active Operations, Success Rate, and Treasury.
- **Quote Carousel**: Daily wisdom from *The Godfather* to keep you sharp.
- **Recent Activity**: Live feed of financial movements.
- **Priority Targets**: Urgent deadlines and critical tasks.

### 2. Operations (Project Management)
- **Kanban Board**: Drag-and-drop interface to manage projects from "Negotiation" to "Deployed".
- **Status Tracking**: Visual indicators for every stage of the operation.

### 3. Clients (CRM)
- **The Pipeline**: Kanban view to move associates from "Prospect" to "Closed".
- **The Dossier**: Detailed client profiles including contact info and value.
- **Activity Log**: Record every call, meeting, and hush-hush conversation.
- **Task Force**: Assign and track tasks specific to each client.

### 4. The Books (Finances)
- **Transaction Tracking**: Record Income (Gold) and Expenses (Blood).
- **Visual Analytics**: Interactive charts to visualize your cash flow.

### 5. The Armory (Assets)
- **Inventory Management**: Track your physical and digital assets.
- **Status Monitoring**: Know what's "In Use", "Available", or in "Maintenance".

### 6. The Scribe (Notes)
- **Markdown Editor**: A distraction-free space for your plans and manifestos.

### 7. Hardcore Mode
- **Pomodoro Timer**: Focus blocks to get the job done.
- **Ambient Audio**: Built-in music widget for that noir atmosphere.

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) & [Lucide React](https://lucide.dev/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Charts**: [Recharts](https://recharts.org/)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A Supabase account

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/MRRzkS/Consigliere.git
    cd Consigliere
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env.local` file in the root directory:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Database Migration**
    Run the SQL scripts provided in `crm_logic.sql` and `supabase_schema.sql` in your Supabase SQL Editor to set up the tables and Row Level Security (RLS) policies.

5.  **Run the development server**
    ```bash
    npm run dev
    ```

6.  **Open the portal**
    Navigate to `http://localhost:3000` to enter your office.

## 🎨 Theme: "Noir Mafia Study"

The UI follows a strict design language:
- **Colors**: Deep Blacks (`#09090b`), Zinc Grays, and Antique Gold (`#c5a059`).
- **Typography**: *Playfair Display* (Serif) for headers, *Inter* (Sans) for UI elements.
- **Atmosphere**: Dark, moody, and expensive.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

*"It's not personal, Sonny. It's strictly business."*
