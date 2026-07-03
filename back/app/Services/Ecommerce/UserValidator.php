<?php

namespace App\Services\Ecommerce;

/**
 * Validation des données utilisateur lors de l'inscription / commande.
 *
 * Règles métier :
 *  - Email : format valide, non vide
 *  - Mot de passe : min. 8 caractères, au moins 1 majuscule, 1 chiffre
 *  - Nom d'utilisateur : 3–30 caractères alphanumériques (tirets/underscores autorisés)
 *  - Âge minimum : 18 ans
 */
class UserValidator
{
    private const MIN_PASSWORD_LENGTH   = 8;
    private const MIN_USERNAME_LENGTH   = 3;
    private const MAX_USERNAME_LENGTH   = 30;
    private const MINIMUM_AGE           = 18;

    // -------------------------------------------------------------------------
    // Email
    // -------------------------------------------------------------------------

    /**
     * Valide un email.
     *
     * @return true si valide
     * @throws \InvalidArgumentException sinon
     */
    public function validateEmail(string $email): bool
    {
        $email = trim($email);

        if ($email === '') {
            throw new \InvalidArgumentException("L'email ne peut pas être vide.");
        }

        if (filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
            throw new \InvalidArgumentException("Format d'email invalide : $email");
        }

        return true;
    }

    // -------------------------------------------------------------------------
    // Mot de passe
    // -------------------------------------------------------------------------

    /**
     * Valide un mot de passe.
     *
     * @return true si valide
     * @throws \InvalidArgumentException sinon
     */
    public function validatePassword(string $password): bool
    {
        if (strlen($password) < self::MIN_PASSWORD_LENGTH) {
            throw new \InvalidArgumentException(
                "Le mot de passe doit contenir au moins " . self::MIN_PASSWORD_LENGTH . " caractères."
            );
        }

        if (! preg_match('/[A-Z]/', $password)) {
            throw new \InvalidArgumentException(
                "Le mot de passe doit contenir au moins une lettre majuscule."
            );
        }

        if (! preg_match('/[0-9]/', $password)) {
            throw new \InvalidArgumentException(
                "Le mot de passe doit contenir au moins un chiffre."
            );
        }

        return true;
    }

    // -------------------------------------------------------------------------
    // Nom d'utilisateur
    // -------------------------------------------------------------------------

    /**
     * Valide un nom d'utilisateur.
     *
     * @return true si valide
     * @throws \InvalidArgumentException sinon
     */
    public function validateUsername(string $username): bool
    {
        $len = strlen($username);

        if ($len < self::MIN_USERNAME_LENGTH || $len > self::MAX_USERNAME_LENGTH) {
            throw new \InvalidArgumentException(
                "Le nom d'utilisateur doit contenir entre "
                . self::MIN_USERNAME_LENGTH . " et " . self::MAX_USERNAME_LENGTH . " caractères."
            );
        }

        if (! preg_match('/^[a-zA-Z0-9_\-]+$/', $username)) {
            throw new \InvalidArgumentException(
                "Le nom d'utilisateur ne peut contenir que des lettres, chiffres, tirets et underscores."
            );
        }

        return true;
    }

    // -------------------------------------------------------------------------
    // Âge
    // -------------------------------------------------------------------------

    /**
     * Valide qu'un utilisateur est majeur à partir de sa date de naissance.
     *
     * @param  \DateTimeInterface $birthDate Date de naissance
     * @return true si l'utilisateur a au moins 18 ans
     * @throws \InvalidArgumentException sinon
     */
    public function validateAge(\DateTimeInterface $birthDate): bool
    {
        $today = new \DateTime('today');
        $age   = $today->diff($birthDate)->y;

        if ($age < self::MINIMUM_AGE) {
            throw new \InvalidArgumentException(
                "L'utilisateur doit avoir au moins " . self::MINIMUM_AGE . " ans."
            );
        }

        return true;
    }
}
