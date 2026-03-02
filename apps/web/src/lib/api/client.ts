/**
 * Simulated API Client for UtsukushiiAI
 * Provides fake async calls with console logging for development.
 */

const DELAY = 800;

const logger = (method: string, endpoint: string, data?: any) => {
  console.log(
    `%c[API ${method}] %c${endpoint}`,
    "color: #C8FF00; font-weight: bold",
    "color: white",
    data || "",
  );
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const api = {
  auth: {
    login: async (credentials: any) => {
      logger("POST", "/v1/auth/login", credentials);
      await sleep(DELAY);
      return {
        success: true,
        data: {
          user: { id: "u_001", name: "John_Doe", email: credentials.email },
          token: "fake_jwt_token_123",
        },
      };
    },
    register: async (userData: any) => {
      logger("POST", "/v1/auth/register", userData);
      await sleep(DELAY);
      return {
        success: true,
        data: {
          user: { id: "u_001", name: userData.name, email: userData.email },
          token: "fake_jwt_token_123",
        },
      };
    },
    logout: async () => {
      logger("POST", "/v1/auth/logout");
      await sleep(300);
      return { success: true };
    },
  },
  projects: {
    list: async () => {
      logger("GET", "/v1/projects");
      await sleep(DELAY);
      return {
        success: true,
        data: [
          {
            id: "prj_001",
            title: "Cyberpunk_Manga_Edit",
            status: "completed",
            lastUpdated: "2h ago",
            duration: "0:45",
            image: "/images/hero.png",
          },
          {
            id: "prj_002",
            title: "Samurai_Champloo_Vibe",
            status: "rendering",
            lastUpdated: "15m ago",
            duration: "1:20",
            image: "/images/hero.png",
          },
          {
            id: "prj_003",
            title: "Draft_Project_99",
            status: "idle",
            lastUpdated: "Yesterday",
            duration: "0:30",
          },
          {
            id: "prj_004",
            title: "Glitch_Experiment_X",
            status: "error",
            lastUpdated: "3d ago",
            duration: "0:15",
            image: "/images/hero.png",
          },
        ],
      };
    },
    get: async (id: string) => {
      logger("GET", `/v1/projects/${id}`);
      await sleep(DELAY);
      return {
        success: true,
        data: {
          id,
          title: "Cyberpunk_Manga_Edit",
          status: "completed",
          lastUpdated: "2h ago",
        },
      };
    },
    create: async (projectData: any) => {
      logger("POST", "/v1/projects", projectData);
      await sleep(DELAY * 2);
      return {
        success: true,
        data: {
          id: `prj_${Math.floor(Math.random() * 1000)}`,
          ...projectData,
          status: "idle",
        },
      };
    },
    update: async (id: string, updates: any) => {
      logger("PATCH", `/v1/projects/${id}`, updates);
      await sleep(500);
      return { success: true, data: { id, ...updates } };
    },
    delete: async (id: string) => {
      logger("DELETE", `/v1/projects/${id}`);
      await sleep(500);
      return { success: true };
    },
  },
  assets: {
    upload: async (
      file: File,
      type: "manga" | "audio",
      chapterInfo?: { number: number; title?: string },
    ) => {
      logger("UPLOAD", `/v1/assets/upload/${type}`, {
        name: file.name,
        size: file.size,
        ...chapterInfo,
      });
      // Simulate progress via console if we had a callback
      await sleep(DELAY * 1.5);
      return {
        success: true,
        data: {
          id: `ast_${Math.floor(Math.random() * 1000)}`,
          url: `/fake/url/${file.name}`,
          ...(chapterInfo && {
            chapterNumber: chapterInfo.number,
            chapterTitle: chapterInfo.title,
          }),
        },
      };
    },
  },
};
