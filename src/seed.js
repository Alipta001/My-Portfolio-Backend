const connectDatabase = require("./config/db");

const Project = require("./models/Project");
const Skill = require("./models/Skill");
const Service = require("./models/Service");

// ======================================================
// PROJECTS
// ======================================================

const projects = [
  {
    title: "GolpoKotha",
    slug: "golpokotha",
    category: "Blog Platform",
    desc: "A modern blog platform focused on creating, managing, and exploring engaging content with a clean and responsive user experience.",
    tech: [
      "React",
      "Node.js",
      "Express.js",
      "MongoDB",
      "Redux",
      "REST API",
    ],
    image:
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=1200&auto=format&fit=crop",
    gradient: "from-[#FF4E50] to-[#F9D423]",
    size: "lg:col-span-8",
    link: "https://golpokotha.vercel.app",
    githubUrl: "",
  },

  {
    title: "DocReserve",
    slug: "docreserve",
    category: "Healthcare Platform",
    desc: "A doctor appointment and booking platform designed to provide a seamless healthcare booking experience with an intuitive and responsive interface.",
    tech: [
      "React",
      "Node.js",
      "Express.js",
      "MongoDB",
      "TanStack Query",
      "REST API",
    ],
    image:
      "https://images.unsplash.com/photo-1638202993928-7267aad84c31",
    gradient: "from-[#11998e] to-[#38ef7d]",
    size: "lg:col-span-4",
    link: "https://v0-doctor-appointment-platform-steel.vercel.app/",
    githubUrl: "",
  },

  {
    title: "Zingo",
    slug: "zingo",
    category: "Food Delivery Platform",
    desc: "A modern food delivery application with an attractive user interface designed for smooth food browsing and ordering experiences.",
    tech: [
      "React",
      "JavaScript",
      "REST API",
      "CSS",
      "Responsive Design",
    ],
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800",
    gradient: "from-[#FF512F] to-[#DD2476]",
    size: "lg:col-span-4",
    link: "https://zingo-one.vercel.app/",
    githubUrl: "",
  },

  {
    title: "Blog Management System",
    slug: "blog-management-system",
    category: "Full-Stack Web Application",
    desc: "A role-based blog management system with authentication, authorization, blog management, categories, tags, comments, likes, notifications, and reading history.",
    tech: [
      "Next.js",
      "Node.js",
      "Express.js",
      "MongoDB",
      "Redux Toolkit",
      "REST API",
      "JWT",
    ],
    image:
      "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=800",
    gradient: "from-[#8E2DE2] to-[#4A00E0]",
    size: "lg:col-span-8",
    link: "",
    githubUrl: "",
  },

  {
    title: "Student Management System",
    slug: "student-management-system",
    category: "Education Platform",
    desc: "A smart student management application designed to help manage student information and educational workflows efficiently.",
    tech: [
      "MERN Stack",
      "Firebase",
      "OAuth",
      "MongoDB",
    ],
    image:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644",
    gradient: "from-[#8E2DE2] to-[#4A00E0]",
    size: "lg:col-span-4",
    link: "https://remember-me-i9kt.vercel.app/",
    githubUrl: "",
  },

  {
    title: "LuxeStay",
    slug: "luxestay",
    category: "Hotel Booking Platform",
    desc: "An immersive hotel booking platform designed to provide a smooth experience for discovering and booking accommodations.",
    tech: [
      "Next.js",
      "Node.js",
      "Stripe",
      "REST API",
    ],
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945",
    gradient: "from-[#00c6ff] to-[#0072ff]",
    size: "lg:col-span-8",
    link: "https://hotel-booking-frontend-orcin.vercel.app",
    githubUrl: "",
  },
];

// ======================================================
// SKILLS
// ======================================================

const skills = [
  {
    category: "Frontend Development",
    tools: [
      "HTML5",
      "CSS3",
      "JavaScript",
      "React",
      "Next.js",
      "Tailwind CSS",
      "Bootstrap",
      "Redux Toolkit",
      "TanStack Query",
    ],
    icon: "✦",
    order: 1,
  },

  {
    category: "Backend Development",
    tools: [
      "Node.js",
      "Express.js",
      "REST API",
      "JWT Authentication",
      "Role-Based Access Control",
      "Cookies",
      "Session Management",
    ],
    icon: "⚡",
    order: 2,
  },

  {
    category: "Database",
    tools: [
      "MongoDB",
      "Mongoose",
      "MongoDB Atlas",
    ],
    icon: "◈",
    order: 3,
  },

  {
    category: "Tools & Deployment",
    tools: [
      "Git",
      "GitHub",
      "VS Code",
      "Postman",
      "Vercel",
      "Render",
      "npm",
    ],
    icon: "🚀",
    order: 4,
  },

  {
    category: "UI & Design",
    tools: [
      "Figma",
      "Responsive Design",
      "Glassmorphism",
      "Framer Motion",
      "AOS",
      "Modern UI",
    ],
    icon: "🎨",
    order: 5,
  },
];

// ======================================================
// SERVICES
// ======================================================

const services = [
  {
    title: "Full-Stack Web Development",
    icon: "Code",
    image:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800",
    description:
      "I build modern, scalable full-stack web applications using React, Next.js, Node.js, Express, and MongoDB with clean architecture and RESTful APIs.",
    tags: [
      "React",
      "Node.js",
      "MongoDB",
      "REST API",
    ],
    color: "from-blue-600/20 to-cyan-400/20",
    order: 1,
  },

  {
    title: "Frontend Development",
    icon: "Layout",
    image:
      "https://images.unsplash.com/photo-1545235617-9465d2a55698?fm=jpg&q=80&w=800&auto=format&fit=crop",
    description:
      "I create responsive, modern, and user-friendly interfaces with React, Next.js, Tailwind CSS, and modern frontend development practices.",
    tags: [
      "React",
      "Next.js",
      "Tailwind",
      "Redux",
    ],
    color: "from-purple-600/20 to-pink-500/20",
    order: 2,
  },

  {
    title: "Backend & API Development",
    icon: "Server",
    image:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=800",
    description:
      "I develop secure and structured backend applications using Node.js, Express.js, MongoDB, authentication, authorization, and REST APIs.",
    tags: [
      "Node.js",
      "Express",
      "MongoDB",
      "JWT",
    ],
    color: "from-green-600/20 to-emerald-500/20",
    order: 3,
  },

  {
    title: "Responsive UI Development",
    icon: "Smartphone",
    image:
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=800",
    description:
      "I build responsive web experiences that work smoothly across desktop, tablet, and mobile devices.",
    tags: [
      "Responsive",
      "Mobile-First",
      "Tailwind",
      "React",
    ],
    color: "from-orange-600/20 to-yellow-500/20",
    order: 4,
  },

  {
    title: "Performance & Deployment",
    icon: "Zap",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800",
    description:
      "I help optimize modern web applications and deploy projects using platforms such as Vercel and Render with proper production configuration.",
    tags: [
      "Performance",
      "Vercel",
      "Render",
      "SEO",
    ],
    color: "from-cyan-600/20 to-blue-500/20",
    order: 5,
  },
];

// ======================================================
// SEED FUNCTION
// ======================================================

async function seed() {
  try {
    // Connect to MongoDB
    await connectDatabase();

    console.log("🌱 Starting portfolio database seeding...");

    await Promise.all([
      // Seed Projects
      ...projects.map((item) =>
        Project.findOneAndUpdate(
          { slug: item.slug },
          item,
          {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true,
          }
        )
      ),

      // Seed Skills
      ...skills.map((item) =>
        Skill.findOneAndUpdate(
          { category: item.category },
          item,
          {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true,
          }
        )
      ),

      // Seed Services
      ...services.map((item) =>
        Service.findOneAndUpdate(
          { title: item.title },
          item,
          {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true,
          }
        )
      ),
    ]);

    console.log("✅ Portfolio content seeded successfully!");
    console.log(`📁 Projects: ${projects.length}`);
    console.log(`🛠️ Skills Categories: ${skills.length}`);
    console.log(`💼 Services: ${services.length}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Portfolio seeding failed:");
    console.error(error);

    process.exit(1);
  }
}

seed();
