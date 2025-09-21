package routes

import (
	"backend/controllers"
	"backend/middleware"

	"github.com/gin-gonic/gin"
)

func SetupAuthRoutes(api *gin.RouterGroup) {
	auth := api.Group("/auth")
	{
		auth.POST("/register", controllers.Register)
		auth.POST("/login", controllers.Login)
		auth.POST("/logout", controllers.Logout)
		auth.POST("/refresh", controllers.RefreshToken)
		auth.POST("/forgot-password", controllers.ForgotPassword)
		auth.POST("/reset-password", controllers.ResetPassword)
	}
}

func SetupUserRoutes(api *gin.RouterGroup) {
	user := api.Group("/user")
	user.Use(middleware.AuthMiddleware())
	{
		user.GET("/me", controllers.GetCurrentUser)
		user.GET("/profile", controllers.GetUserProfile)
		user.PUT("/profile", controllers.UpdateUserProfile)
		user.GET("/dashboard", controllers.GetUserDashboard)
	}
}

func SetupAdminRoutes(api *gin.RouterGroup) {
	admin := api.Group("/admin")
	admin.Use(middleware.AuthMiddleware(), middleware.RoleMiddleware("admin"))
	{
		admin.GET("/users", controllers.GetUsers)
		admin.POST("/users", controllers.CreateUser)
		admin.PUT("/users/:id", controllers.UpdateUser)
		admin.DELETE("/users/:id", controllers.DeleteUser)
		admin.GET("/dashboard", controllers.GetAdminDashboard)
	}
}

func SetupManagerRoutes(api *gin.RouterGroup) {
	manager := api.Group("/manager")
	manager.Use(middleware.AuthMiddleware(), middleware.RoleMiddleware("admin", "manager"))
	{
		manager.GET("/reports", controllers.GetReports)
		manager.GET("/dashboard", controllers.GetManagerDashboard)
	}
}

// SetupAllRoutes - Setup semua routes sekaligus
func SetupAllRoutes(r *gin.Engine) {
	api := r.Group("/api")
	{
		// Health check endpoint
		api.GET("/health", func(c *gin.Context) {
			c.JSON(200, gin.H{
				"status":  "OK",
				"message": "Server is running",
			})
		})

		// Setup all route groups
		SetupAuthRoutes(api)
		SetupUserRoutes(api)
		SetupAdminRoutes(api)
		SetupManagerRoutes(api)
	}
}
