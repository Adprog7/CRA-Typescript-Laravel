<?php

namespace App\Services\Ecommerce;

/**
 * Calcul des remises e-commerce.
 *
 * Règles métier :
 *  - Code promo BIENVENUE  → 10 % de réduction
 *  - Code promo ETE2024    → 20 % de réduction
 *  - Commande > 100 €      → 5 % de réduction automatique
 *  - Les remises ne se cumulent pas (on applique la plus avantageuse)
 *  - Le total après remise ne peut jamais être négatif
 */
class DiscountService
{
    /** @var array<string, float> Code => taux (0.0–1.0) */
    private const PROMO_CODES = [
        'BIENVENUE' => 0.10,
        'ETE2024'   => 0.20,
    ];

    private const AUTO_DISCOUNT_THRESHOLD = 100.0;
    private const AUTO_DISCOUNT_RATE      = 0.05;

    /**
     * Calcule le montant de la remise à appliquer sur $total.
     *
     * @param  float       $total     Total brut du panier (€)
     * @param  string|null $promoCode Code promotionnel éventuel
     * @return float Montant de la remise (toujours >= 0)
     * @throws \InvalidArgumentException si le total est négatif
     */
    public function calculateDiscount(float $total, ?string $promoCode = null): float
    {
        if ($total < 0) {
            throw new \InvalidArgumentException("Le total ne peut pas être négatif.");
        }

        $promoRate = 0.0;
        if ($promoCode !== null) {
            $normalized = strtoupper(trim($promoCode));
            $promoRate  = self::PROMO_CODES[$normalized] ?? 0.0;
        }

        $autoRate = ($total >= self::AUTO_DISCOUNT_THRESHOLD)
            ? self::AUTO_DISCOUNT_RATE
            : 0.0;

        // On applique uniquement la remise la plus avantageuse
        $bestRate = max($promoRate, $autoRate);

        return round($total * $bestRate, 2);
    }

    /**
     * Retourne le total après application de la remise.
     */
    public function applyDiscount(float $total, ?string $promoCode = null): float
    {
        $discount = $this->calculateDiscount($total, $promoCode);
        return round(max(0.0, $total - $discount), 2);
    }

    /**
     * Indique si un code promo est valide.
     */
    public function isValidPromoCode(string $promoCode): bool
    {
        return array_key_exists(strtoupper(trim($promoCode)), self::PROMO_CODES);
    }
}
