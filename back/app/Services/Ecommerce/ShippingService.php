<?php

namespace App\Services\Ecommerce;

/**
 * Calcul des frais de livraison.
 *
 * Règles métier :
 *  - Livraison STANDARD  : 4,99 €  (délai 3–5 j)
 *  - Livraison EXPRESS   : 9,99 €  (délai 24 h)
 *  - Livraison GRATUITE  : si le total panier >= 50 €  (standard uniquement)
 *  - Zones hors-France   : supplément de 15 €
 *  - Panier vide         : aucun frais
 */
class ShippingService
{
    public const METHOD_STANDARD = 'standard';
    public const METHOD_EXPRESS  = 'express';

    private const BASE_COST = [
        self::METHOD_STANDARD => 4.99,
        self::METHOD_EXPRESS  => 9.99,
    ];

    private const FREE_SHIPPING_THRESHOLD    = 50.0;
    private const INTERNATIONAL_SURCHARGE    = 15.0;

    /**
     * Calcule les frais de livraison.
     *
     * @param  float  $cartTotal       Total brut du panier (€)
     * @param  string $method          'standard' | 'express'
     * @param  bool   $isInternational Livraison internationale ?
     * @return float  Frais de livraison (€), arrondis à 2 décimales
     * @throws \InvalidArgumentException si la méthode est inconnue ou le total négatif
     */
    public function calculate(
        float $cartTotal,
        string $method = self::METHOD_STANDARD,
        bool $isInternational = false
    ): float {
        if ($cartTotal < 0) {
            throw new \InvalidArgumentException("Le total du panier ne peut pas être négatif.");
        }

        if (! array_key_exists($method, self::BASE_COST)) {
            throw new \InvalidArgumentException(
                "Méthode de livraison inconnue : $method. Valeurs acceptées : standard, express."
            );
        }

        // Panier vide → pas de frais
        if ($cartTotal === 0.0) {
            return 0.0;
        }

        // Livraison gratuite (standard uniquement, commande >= seuil)
        $isFree = ($method === self::METHOD_STANDARD)
            && ($cartTotal >= self::FREE_SHIPPING_THRESHOLD)
            && (! $isInternational);

        $cost = $isFree ? 0.0 : self::BASE_COST[$method];

        if ($isInternational) {
            $cost += self::INTERNATIONAL_SURCHARGE;
        }

        return round($cost, 2);
    }

    /**
     * Retourne le seuil à partir duquel la livraison standard devient gratuite.
     */
    public function getFreeShippingThreshold(): float
    {
        return self::FREE_SHIPPING_THRESHOLD;
    }

    /**
     * Retourne les méthodes disponibles avec leur coût de base.
     *
     * @return array<string, float>
     */
    public function getAvailableMethods(): array
    {
        return self::BASE_COST;
    }
}
