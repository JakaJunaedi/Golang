package config

import (
	"log"
	"os"
	"time"

	"backend/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDatabase() {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "host=localhost user=postgres password=postgres dbname=golang_nextjs port=5432 sslmode=disable"
	}

	var err error
	DB, err = gorm.Open(postgres.Open(dbURL), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// 🚀 Matikan AutoMigrate di production!
	// Jalankan migrate sekali pakai tool (golang-migrate/dbmate).

	// #### Auto migrate tables (hapus comment jika belum genarate/ buat database baru) ####
	// err = DB.AutoMigrate(
	//	&models.User{},
	//	&models.Role{},
	//	&models.Permission{},
	//	&models.RolePermission{},
	// )

	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	// Seed initial data
	seedData()
	log.Println("Database initialized successfully")

	// Pooling setup (jangan terlalu tinggi karena Neon pakai PgBouncer)
	sqlDB, _ := DB.DB()
	sqlDB.SetMaxIdleConns(5)
	sqlDB.SetMaxOpenConns(10)
	sqlDB.SetConnMaxLifetime(time.Hour)

	log.Println("Database initialized successfully")
}

func seedData() {
	roles := []string{"admin", "manager", "user"}
	for _, roleName := range roles {
		var role models.Role
		if err := DB.Where("name = ?", roleName).First(&role).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				DB.Create(&models.Role{Name: roleName})
				log.Printf("Created role: %s", roleName)
			}
		}
	}
}
