package main

import (
	"log"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"github.com/mhmd-aashik/commerceos/inventory-service/internal/config"
	"github.com/mhmd-aashik/commerceos/inventory-service/internal/handler"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found; using process environment")
	}

	cfg, err := config.Load()
	if err != nil {
		log.Fatal("Configuration error: ", err)
	}

	if cfg.AppEnv == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.New()

	router.Use(
		gin.Logger(),
		gin.Recovery(),
	)

	healthHandler := handler.NewHealthHandler()

	router.GET("/health", healthHandler.Check)

	log.Printf(
		"Inventory HTTP server starting on port %s",
		cfg.HTTPPort,
	)

	if err := router.Run(":" + cfg.HTTPPort); err != nil {
		log.Fatal("HTTP server failed: ", err)
	}
}
