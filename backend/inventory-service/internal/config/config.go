package config

import (
	"fmt"
	"os"
)

type Config struct {
	AppEnv      string
	HTTPPort    string
	GRPCPort    string
	DatabaseURL string
}

func Load() (*Config, error) {
	cfg := &Config{
		AppEnv:      getEnv("APP_ENV", "development"),
		HTTPPort:    getEnv("HTTP_PORT", "8081"),
		GRPCPort:    getEnv("GRPC_PORT", "50053"),
		DatabaseURL: os.Getenv("DATABASE_URL"),
	}

	if cfg.DatabaseURL == "" {
		return nil, fmt.Errorf(
			"DATABASE_URL environment variable is required",
		)
	}

	return cfg, nil
}

func getEnv(key, fallback string) string {
	value := os.Getenv(key)

	if value == "" {
		return fallback
	}

	return value
}
