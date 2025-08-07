import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { insertPoemSchema } from "@shared/schema";
import { analyzeImageAndGeneratePoem } from "./services/openai";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all poems
  app.get("/api/poems", async (req, res) => {
    try {
      const poems = await storage.getPoems();
      res.json(poems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch poems" });
    }
  });

  // Get single poem
  app.get("/api/poems/:id", async (req, res) => {
    try {
      const poem = await storage.getPoemById(req.params.id);
      if (!poem) {
        return res.status(404).json({ message: "Poem not found" });
      }
      res.json(poem);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch poem" });
    }
  });

  // Create poem from image
  app.post("/api/poems/analyze", upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      const { language = "en" } = req.body;
      const base64Image = req.file.buffer.toString('base64');
      
      // Convert buffer to data URL for storage
      const imageUrl = `data:${req.file.mimetype};base64,${base64Image}`;
      
      // Analyze image and generate poems
      const analysis = await analyzeImageAndGeneratePoem(base64Image);
      
      // Create poem record
      const poemData = {
        imageUrl,
        imageDescription: analysis.description,
        poemEnglish: analysis.poemEnglish,
        poemChinese: analysis.poemChinese,
        language,
        isFavorite: false
      };

      const validatedData = insertPoemSchema.parse(poemData);
      const poem = await storage.createPoem(validatedData);
      
      res.json(poem);
    } catch (error) {
      console.error("Error analyzing image:", error);
      res.status(500).json({ 
        message: "Failed to analyze image and generate poem",
        error: (error as Error).message 
      });
    }
  });

  // Update poem favorite status
  app.patch("/api/poems/:id/favorite", async (req, res) => {
    try {
      const { isFavorite } = req.body;
      if (typeof isFavorite !== 'boolean') {
        return res.status(400).json({ message: "isFavorite must be a boolean" });
      }

      const poem = await storage.updatePoemFavorite(req.params.id, isFavorite);
      if (!poem) {
        return res.status(404).json({ message: "Poem not found" });
      }
      
      res.json(poem);
    } catch (error) {
      res.status(500).json({ message: "Failed to update poem" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
