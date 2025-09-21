package controllers

import (
	"net/http"

	"backend/config"
	"backend/models"

	"github.com/gin-gonic/gin"
)

func GetReports(c *gin.Context) {
	// Example: Get users by role for reporting
	var users []models.User
	if err := config.DB.Preload("Role").Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch users"})
		return
	}

	// Group users by role
	usersByRole := make(map[string][]models.User)
	for _, user := range users {
		roleName := user.Role.Name
		usersByRole[roleName] = append(usersByRole[roleName], user)
	}

	c.JSON(http.StatusOK, gin.H{
		"reports": gin.H{
			"users_by_role": usersByRole,
			"total_users":   len(users),
		},
	})
}

func GetManagerDashboard(c *gin.Context) {
	// Get some stats for manager dashboard
	var userCount int64
	var recentUsers []models.User

	config.DB.Model(&models.User{}).Count(&userCount)
	config.DB.Preload("Role").Order("created_at desc").Limit(5).Find(&recentUsers)

	c.JSON(http.StatusOK, gin.H{
		"message": "Manager Dashboard",
		"data": gin.H{
			"total_users":  userCount,
			"recent_users": recentUsers,
		},
	})
}
