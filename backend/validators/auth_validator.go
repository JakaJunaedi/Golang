package validators

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// Register request struct
type RegisterRequest struct {
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
	RoleID   uint   `json:"role_id"` // opsional
}

// Login request struct
type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// Validasi Register
func ValidateRegisterRequest(c *gin.Context) (RegisterRequest, bool) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid register request", "details": err.Error()})
		return req, false
	}
	return req, true
}

// Validasi Login
func ValidateLoginRequest(c *gin.Context) (LoginRequest, bool) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid login request", "details": err.Error()})
		return req, false
	}
	return req, true
}

// Tambahan validasi password (opsional, dipakai di ResetPassword)
func ValidatePassword(password string) bool {
	var (
		hasMinLen = false
		hasUpper  = false
		hasLower  = false
		hasNumber = false
	)

	if len(password) >= 8 {
		hasMinLen = true
	}

	for _, c := range password {
		switch {
		case 'a' <= c && c <= 'z':
			hasLower = true
		case 'A' <= c && c <= 'Z':
			hasUpper = true
		case '0' <= c && c <= '9':
			hasNumber = true
		}
	}

	return hasMinLen && hasUpper && hasLower && hasNumber
}
