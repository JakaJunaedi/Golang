package models

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	ID        uint           `json:"id" gorm:"primarykey"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
	Name      string         `json:"name" gorm:"not null"`
	Email     string         `json:"email" gorm:"uniqueIndex;not null"`
	Password  string         `json:"-" gorm:"not null"`
	RoleID    uint           `json:"role_id"`
	Role      Role           `json:"role" gorm:"foreignKey:RoleID"`
}

type Role struct {
	ID          uint             `json:"id" gorm:"primarykey"`
	CreatedAt   time.Time        `json:"created_at"`
	UpdatedAt   time.Time        `json:"updated_at"`
	DeletedAt   gorm.DeletedAt   `json:"-" gorm:"index"`
	Name        string           `json:"name" gorm:"uniqueIndex;not null"`
	Users       []User           `json:"-" gorm:"foreignKey:RoleID"`
	Permissions []RolePermission `json:"permissions" gorm:"foreignKey:RoleID"`
}

type Permission struct {
	ID          uint             `json:"id" gorm:"primarykey"`
	CreatedAt   time.Time        `json:"created_at"`
	UpdatedAt   time.Time        `json:"updated_at"`
	DeletedAt   gorm.DeletedAt   `json:"-" gorm:"index"`
	Name        string           `json:"name" gorm:"uniqueIndex;not null"`
	Description string           `json:"description"`
	Roles       []RolePermission `json:"-" gorm:"foreignKey:PermissionID"`
}

type RolePermission struct {
	ID           uint       `json:"id" gorm:"primarykey"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
	RoleID       uint       `json:"role_id"`
	PermissionID uint       `json:"permission_id"`
	Role         Role       `json:"role" gorm:"foreignKey:RoleID"`
	Permission   Permission `json:"permission" gorm:"foreignKey:PermissionID"`
}

// Request/Response structs
type LoginRequest struct {
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type RegisterRequest struct {
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	RoleID   uint   `json:"role_id"`
}
