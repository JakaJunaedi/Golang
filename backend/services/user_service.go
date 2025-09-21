package services

import (
	"backend/config"
	"backend/models"
)

type UserService struct{}

func NewUserService() *UserService {
	return &UserService{}
}

func (s *UserService) GetUserByID(id uint) (*models.User, error) {
	var user models.User
	err := config.DB.Preload("Role").First(&user, id).Error
	return &user, err
}

func (s *UserService) GetAllUsers(page, limit int) ([]models.User, int64, error) {
	var users []models.User
	var total int64

	offset := (page - 1) * limit

	err := config.DB.Preload("Role").
		Offset(offset).
		Limit(limit).
		Find(&users).Error

	config.DB.Model(&models.User{}).Count(&total)

	return users, total, err
}
