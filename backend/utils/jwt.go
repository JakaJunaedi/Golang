package utils

import (
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var jwtSecret []byte

func init() {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "your-default-secret-key" // Change this in production
	}
	jwtSecret = []byte(secret)
}

type Claims struct {
	UserID uint   `json:"user_id"`
	Email  string `json:"email"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

// GenerateJWT - Generate access token with 24 hour expiry
func GenerateJWT(userID uint, email, role string) (string, error) {
	claims := Claims{
		UserID: userID,
		Email:  email,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Subject:   "access",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}

// GenerateRefreshToken - Generate refresh token with 7 days expiry
func GenerateRefreshToken(userID uint, email, role string) (string, error) {
	claims := Claims{
		UserID: userID,
		Email:  email,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(7 * 24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Subject:   "refresh",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}

// GenerateResetToken - Generate password reset token with 1 hour expiry
func GenerateResetToken(userID uint, email string) (string, error) {
	claims := Claims{
		UserID: userID,
		Email:  email,
		Role:   "reset",
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(1 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Subject:   "reset",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}

// ValidateJWT - Validate any JWT token
func ValidateJWT(tokenString string) (*Claims, error) {
	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return jwtSecret, nil
	})

	if err != nil || !token.Valid {
		return nil, err
	}

	return claims, nil
}

// ValidateAccessToken - Specifically validate access tokens
func ValidateAccessToken(tokenString string) (*Claims, error) {
	claims, err := ValidateJWT(tokenString)
	if err != nil {
		return nil, err
	}

	if claims.Subject != "access" {
		return nil, jwt.ErrTokenInvalidClaims
	}

	return claims, nil
}

// ValidateRefreshToken - Specifically validate refresh tokens
func ValidateRefreshToken(tokenString string) (*Claims, error) {
	claims, err := ValidateJWT(tokenString)
	if err != nil {
		return nil, err
	}

	if claims.Subject != "refresh" {
		return nil, jwt.ErrTokenInvalidClaims
	}

	return claims, nil
}

// ValidateResetToken - Specifically validate reset tokens
func ValidateResetToken(tokenString string) (*Claims, error) {
	claims, err := ValidateJWT(tokenString)
	if err != nil {
		return nil, err
	}

	if claims.Subject != "reset" {
		return nil, jwt.ErrTokenInvalidClaims
	}

	return claims, nil
}
