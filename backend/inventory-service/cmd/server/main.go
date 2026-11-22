package main

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.New()

	router.Use(
		gin.Logger(),
		gin.Recovery(),
	)

	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"service": "inventory-service",
			"status":  "ok",
		})
	})

	log.Println("Inventory HTTP server starting on :8081")

	if err := router.Run(":8080"); err != nil {
		log.Fatal(err)
	}
}
