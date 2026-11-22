package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type HealthHandler struct {
	ServiceName string
}

func NewHealthHandler() *HealthHandler {
	return &HealthHandler{
		ServiceName: "inventory-service",
	}
}

func (h *HealthHandler) Check(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"service": h.ServiceName,
		"status":  "ok",
	})
}
