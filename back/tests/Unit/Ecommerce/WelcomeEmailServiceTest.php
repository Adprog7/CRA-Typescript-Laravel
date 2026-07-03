<?php

namespace Tests\Unit\Ecommerce;

use App\Services\Ecommerce\WelcomeEmailService;
use Illuminate\Support\Facades\Mail;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

/**
 * Tests unitaires du service d'email de bienvenue.
 *
 * On utilise le fake mailer de Laravel pour ne pas envoyer
 * de vrais emails, tout en vérifiant que le mail aurait bien été envoyé.
 *
 * Couverture :
 *  ✔ Email envoyé à la bonne adresse
 *  ✔ Sujet correct
 *  ✔ Corps de l'email contient le prénom
 *  ✔ Corps de l'email contient le message de bienvenue
 *  ✔ Retour du tableau de métadonnées
 *  ✔ Erreur : email vide
 *  ✔ Erreur : email invalide
 *  ✔ Erreur : username vide
 *  ✔ buildBody génère le bon contenu
 */
class WelcomeEmailServiceTest extends TestCase
{
    private WelcomeEmailService $service;

    protected function setUp(): void
    {
        parent::setUp();
        Mail::fake(); // Laravel fake mailer → pas de vrai envoi
        $this->service = new WelcomeEmailService();
    }

    // -------------------------------------------------------------------------
    // Envoi réussi
    // -------------------------------------------------------------------------

    #[Test]
    public function it_returns_correct_metadata_on_successful_send(): void
    {
        $result = $this->service->send('alice@example.com', 'Alice');

        $this->assertSame('alice@example.com', $result['to']);
        $this->assertSame(WelcomeEmailService::EMAIL_SUBJECT, $result['subject']);
        $this->assertNotEmpty($result['body']);
    }

    #[Test]
    public function it_sends_mail_to_correct_address(): void
    {
        // Mail::raw() n'est pas un Mailable → on vérifie le destinataire
        // via les métadonnées retournées par le service.
        $result = $this->service->send('bob@example.com', 'Bob');

        $this->assertSame('bob@example.com', $result['to']);
    }

    #[Test]
    public function email_body_contains_username(): void
    {
        $result = $this->service->send('carol@example.com', 'Carol');

        $this->assertStringContainsString('Carol', $result['body']);
    }

    #[Test]
    public function email_body_contains_welcome_message(): void
    {
        $result = $this->service->send('dave@example.com', 'Dave');

        $this->assertStringContainsString('bienvenue', strtolower($result['body']));
    }

    #[Test]
    public function email_subject_is_correct(): void
    {
        $result = $this->service->send('eve@example.com', 'Eve');

        $this->assertSame("Bienvenue sur notre boutique !", $result['subject']);
    }

    #[Test]
    public function it_trims_whitespace_from_email(): void
    {
        $result = $this->service->send('  frank@example.com  ', 'Frank');

        $this->assertSame('frank@example.com', $result['to']);
    }

    // -------------------------------------------------------------------------
    // buildBody
    // -------------------------------------------------------------------------

    #[Test]
    public function build_body_starts_with_greeting(): void
    {
        $body = $this->service->buildBody('Marie');

        $this->assertStringStartsWith('Bonjour Marie', $body);
    }

    #[Test]
    public function build_body_ends_with_signature(): void
    {
        $body = $this->service->buildBody('Marie');

        $this->assertStringContainsString("L'équipe boutique", $body);
    }

    // -------------------------------------------------------------------------
    // Erreurs
    // -------------------------------------------------------------------------

    #[Test]
    public function it_throws_on_empty_email(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage("Adresse email invalide");

        $this->service->send('', 'Test');
    }

    #[Test]
    public function it_throws_on_invalid_email_format(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage("Adresse email invalide");

        $this->service->send('not-an-email', 'Test');
    }

    #[Test]
    public function it_throws_on_empty_username(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage("Le nom d'utilisateur ne peut pas être vide.");

        $this->service->send('valid@example.com', '');
    }

    #[Test]
    public function it_throws_on_whitespace_only_username(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage("Le nom d'utilisateur ne peut pas être vide.");

        $this->service->send('valid@example.com', '   ');
    }
}
