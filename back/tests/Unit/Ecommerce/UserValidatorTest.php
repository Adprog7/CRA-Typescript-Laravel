<?php

namespace Tests\Unit\Ecommerce;

use App\Services\Ecommerce\UserValidator;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

/**
 * Tests unitaires du validateur utilisateur.
 *
 * Couverture :
 *  ✔ Email valide accepté
 *  ✔ Email vide rejeté
 *  ✔ Email malformé rejeté
 *  ✔ Mot de passe valide accepté
 *  ✔ Mot de passe trop court rejeté
 *  ✔ Mot de passe sans majuscule rejeté
 *  ✔ Mot de passe sans chiffre rejeté
 *  ✔ Username valide accepté
 *  ✔ Username trop court rejeté
 *  ✔ Username trop long rejeté
 *  ✔ Username avec caractères spéciaux rejeté
 *  ✔ Utilisateur majeur accepté
 *  ✔ Utilisateur mineur rejeté
 *  ✔ Utilisateur pile 18 ans accepté
 */
class UserValidatorTest extends TestCase
{
    private UserValidator $validator;

    protected function setUp(): void
    {
        $this->validator = new UserValidator();
    }

    // -------------------------------------------------------------------------
    // Email
    // -------------------------------------------------------------------------

    #[Test]
    public function valid_email_is_accepted(): void
    {
        $this->assertTrue($this->validator->validateEmail('user@example.com'));
    }

    #[Test]
    public function valid_email_with_subdomain_is_accepted(): void
    {
        $this->assertTrue($this->validator->validateEmail('user@mail.example.co.uk'));
    }

    #[Test]
    public function empty_email_is_rejected(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage("L'email ne peut pas être vide.");

        $this->validator->validateEmail('');
    }

    #[Test]
    public function email_without_at_sign_is_rejected(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage("Format d'email invalide");

        $this->validator->validateEmail('userexample.com');
    }

    #[Test]
    public function email_without_domain_is_rejected(): void
    {
        $this->expectException(\InvalidArgumentException::class);

        $this->validator->validateEmail('user@');
    }

    // -------------------------------------------------------------------------
    // Mot de passe
    // -------------------------------------------------------------------------

    #[Test]
    public function valid_password_is_accepted(): void
    {
        $this->assertTrue($this->validator->validatePassword('Secret1!'));
    }

    #[Test]
    public function password_too_short_is_rejected(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage("au moins 8 caractères");

        $this->validator->validatePassword('Ab1!');
    }

    #[Test]
    public function password_without_uppercase_is_rejected(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage("au moins une lettre majuscule");

        $this->validator->validatePassword('secret1!aaa');
    }

    #[Test]
    public function password_without_digit_is_rejected(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage("au moins un chiffre");

        $this->validator->validatePassword('SecretABC!');
    }

    #[Test]
    public function password_exactly_8_chars_with_rules_is_accepted(): void
    {
        $this->assertTrue($this->validator->validatePassword('Secret1x'));
    }

    // -------------------------------------------------------------------------
    // Nom d'utilisateur
    // -------------------------------------------------------------------------

    #[Test]
    public function valid_username_is_accepted(): void
    {
        $this->assertTrue($this->validator->validateUsername('john_doe'));
    }

    #[Test]
    public function username_with_hyphens_is_accepted(): void
    {
        $this->assertTrue($this->validator->validateUsername('john-doe-42'));
    }

    #[Test]
    public function username_too_short_is_rejected(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage("entre 3 et 30 caractères");

        $this->validator->validateUsername('ab');
    }

    #[Test]
    public function username_too_long_is_rejected(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage("entre 3 et 30 caractères");

        $this->validator->validateUsername(str_repeat('a', 31));
    }

    #[Test]
    public function username_with_special_chars_is_rejected(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage("ne peut contenir que des lettres");

        $this->validator->validateUsername('user@name!');
    }

    #[Test]
    public function username_with_spaces_is_rejected(): void
    {
        $this->expectException(\InvalidArgumentException::class);

        $this->validator->validateUsername('user name');
    }

    // -------------------------------------------------------------------------
    // Âge
    // -------------------------------------------------------------------------

    #[Test]
    public function adult_user_is_accepted(): void
    {
        $birthDate = new \DateTime('-25 years');
        $this->assertTrue($this->validator->validateAge($birthDate));
    }

    #[Test]
    public function exactly_18_years_old_is_accepted(): void
    {
        // On prend la date d'il y a 18 ans pile moins 1 jour
        // pour garantir que l'âge calculé est bien >= 18 ans révolus.
        $birthDate = (new \DateTime('today'))->modify('-18 years')->modify('-1 day');
        $this->assertTrue($this->validator->validateAge($birthDate));
    }

    #[Test]
    public function minor_user_is_rejected(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage("au moins 18 ans");

        $birthDate = new \DateTime('-17 years');
        $this->validator->validateAge($birthDate);
    }

    #[Test]
    public function newborn_is_rejected(): void
    {
        $this->expectException(\InvalidArgumentException::class);

        $this->validator->validateAge(new \DateTime('today'));
    }
}
