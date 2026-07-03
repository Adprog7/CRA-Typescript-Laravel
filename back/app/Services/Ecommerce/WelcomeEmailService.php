<?php

namespace App\Services\Ecommerce;

use Illuminate\Support\Facades\Mail;
use Illuminate\Mail\Message;

/**
 * Service d'envoi d'email de bienvenue.
 *
 * Règles métier :
 *  - L'email de bienvenue doit être envoyé à l'adresse de l'utilisateur
 *  - Il contient le prénom de l'utilisateur
 *  - On ne peut pas envoyer à une adresse vide ou invalide
 *  - Le sujet est fixe : "Bienvenue sur notre boutique !"
 */
class WelcomeEmailService
{
    public const EMAIL_SUBJECT = "Bienvenue sur notre boutique !";

    /**
     * Envoie un email de bienvenue.
     *
     * @param  string $email    Adresse email du destinataire
     * @param  string $username Prénom / nom d'utilisateur
     * @return array{to: string, subject: string, body: string}
     *         Représentation du message envoyé (utile pour les tests)
     * @throws \InvalidArgumentException si l'email est invalide ou le username vide
     */
    public function send(string $email, string $username): array
    {
        $email    = trim($email);
        $username = trim($username);

        if ($email === '' || filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
            throw new \InvalidArgumentException("Adresse email invalide : $email");
        }

        if ($username === '') {
            throw new \InvalidArgumentException("Le nom d'utilisateur ne peut pas être vide.");
        }

        $body = $this->buildBody($username);

        // En environnement de test (APP_ENV=testing) Laravel utilise le driver
        // "array" → pas de vrai envoi réseau.
        Mail::raw($body, function (Message $message) use ($email): void {
            $message->to($email)->subject(self::EMAIL_SUBJECT);
        });

        return [
            'to'      => $email,
            'subject' => self::EMAIL_SUBJECT,
            'body'    => $body,
        ];
    }

    /**
     * Construit le corps de l'email de bienvenue.
     */
    public function buildBody(string $username): string
    {
        return "Bonjour $username,\n\n"
            . "Bienvenue sur notre boutique en ligne ! Nous sommes ravis de vous accueillir.\n"
            . "Profitez de nos offres exclusives et bonne navigation !\n\n"
            . "L'équipe boutique";
    }
}
