import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { highScoreSchema, type HighScore } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

// In-memory storage for high scores (in a real app, would be in database)
let highScores: HighScore[] = [
  { id: 1, name: "ACE", score: 15000, date: "2023-07-15" },
  { id: 2, name: "NOVA", score: 12500, date: "2023-07-14" },
  { id: 3, name: "VIPER", score: 10000, date: "2023-07-13" },
  { id: 4, name: "ECHO", score: 8500, date: "2023-07-12" },
  { id: 5, name: "PHANTOM", score: 7000, date: "2023-07-11" }
];

export async function registerRoutes(app: Express): Promise<Server> {
  // Prefix all routes with /api
  
  // Get high scores
  app.get("/api/leaderboard", async (req, res) => {
    try {
      // In a real app, this would fetch from database
      // Return only top 10 scores
      res.json(highScores.slice(0, 10));
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });
  
  // Submit a new high score
  app.post("/api/leaderboard", async (req, res) => {
    try {
      // Validate request body
      const { name, score } = highScoreSchema.parse(req.body);
      
      // Create new high score entry
      const newScore: HighScore = {
        id: Date.now(), // Use timestamp as ID
        name,
        score,
        date: new Date().toISOString().split('T')[0] // YYYY-MM-DD format
      };
      
      // Insert score in the correct position
      let inserted = false;
      const updatedScores = [...highScores];
      
      for (let i = 0; i < updatedScores.length; i++) {
        if (score > updatedScores[i].score) {
          updatedScores.splice(i, 0, newScore);
          inserted = true;
          break;
        }
      }
      
      // If not inserted and there's room (less than 10 entries)
      if (!inserted && updatedScores.length < 10) {
        updatedScores.push(newScore);
      }
      
      // Keep only top 10
      highScores = updatedScores.slice(0, 10);
      
      res.status(201).json({ message: "Score submitted successfully", highScore: newScore });
    } catch (error) {
      console.error("Error submitting score:", error);
      
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      res.status(500).json({ message: "Failed to submit score" });
    }
  });
  
  // Example route for user authentication
  app.post("/api/users/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      // Validate credentials
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      // Attempt to find user in storage
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Authentication successful
      // In a real app, would create a session or JWT token here
      
      res.json({ 
        message: "Authentication successful",
        user: {
          id: user.id,
          username: user.username
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Authentication failed" });
    }
  });
  
  // Create a new user
  app.post("/api/users/register", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      // Validate input
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }
      
      // Create new user
      const newUser = await storage.createUser({ username, password });
      
      res.status(201).json({ 
        message: "User registered successfully",
        user: {
          id: newUser.id,
          username: newUser.username
        }
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });
  
  const httpServer = createServer(app);
  return httpServer;
}
