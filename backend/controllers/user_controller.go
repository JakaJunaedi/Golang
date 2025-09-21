package controllers

import (
	"net/http"

	"backend/config"
	"backend/models"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

func GetUserProfile(c *gin.Context) {
	userID := c.GetUint("userID")

	var user models.User
	if err := config.DB.Preload("Role").First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"profile": gin.H{
			"id":         user.ID,
			"name":       user.Name,
			"email":      user.Email,
			"role":       user.Role.Name,
			"created_at": user.CreatedAt,
			"updated_at": user.UpdatedAt,
		},
	})
}

func UpdateUserProfile(c *gin.Context) {
	userID := c.GetUint("userID")

	var user models.User
	if err := config.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	var updateData map[string]interface{}
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Remove sensitive fields that users shouldn't be able to update
	delete(updateData, "role_id")
	delete(updateData, "email") // Email changes might need verification

	// Handle password update separately for security
	if password, exists := updateData["password"]; exists {
		if passwordStr, ok := password.(string); ok && passwordStr != "" {
			hashedPassword, err := bcrypt.GenerateFromPassword([]byte(passwordStr), bcrypt.DefaultCost)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
				return
			}
			updateData["password"] = string(hashedPassword)
		} else {
			delete(updateData, "password")
		}
	}

	if err := config.DB.Model(&user).Updates(updateData).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update profile"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Profile updated successfully"})
}

func GetUserDashboard(c *gin.Context) {
	userID := c.GetUint("userID")
	userEmail := c.GetString("userEmail")
	userRole := c.GetString("userRole")

	c.JSON(http.StatusOK, gin.H{
		"message": "User Dashboard",
		"data": gin.H{
			"user_id":         userID,
			"user_email":      userEmail,
			"user_role":       userRole,
			"welcome_message": "Welcome to your personal dashboard!",
		},
	})
}
