<?php

namespace Tests\Unit\Ecommerce;

use App\Services\Ecommerce\DiscountService;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

/**
 * Tests unitaires du service de remises.
 *
 * Couverture :
 *  ✔ Aucune remise sans code et total < 100 €
 *  ✔ Code BIENVENUE → 10 %
 *  ✔ Code ETE2024   → 20 %
 *  ✔ Code invalide  → aucune remise
 *  ✔ Remise automatique 5 % si total >= 100 €
 *  ✔ On garde la plus avantageuse (promo vs auto)
 *  ✔ Code en minuscules → normalisé
 *  ✔ Total après remise = total − remise
 *  ✔ Remise ne peut pas rendre le total négatif
 *  ✔ Erreur : total négatif
 *  ✔ Vérification isValidPromoCode
 */
class DiscountServiceTest extends TestCase
{
    private DiscountService $service;

    protected function setUp(): void
    {
        $this->service = new DiscountService();
    }

    // -------------------------------------------------------------------------
    // Aucune remise
    // -------------------------------------------------------------------------

    #[Test]
    public function no_discount_when_no_code_and_below_threshold(): void
    {
        $discount = $this->service->calculateDiscount(80.0);

        $this->assertSame(0.0, $discount);
    }

    // -------------------------------------------------------------------------
    // Codes promo
    // -------------------------------------------------------------------------

    #[Test]
    public function promo_code_bienvenue_gives_10_percent(): void
    {
        $discount = $this->service->calculateDiscount(100.0, 'BIENVENUE');

        // 10 % de 100 = 10 €, mais remise auto (5 %) < promo (10 %)
        $this->assertSame(10.0, $discount);
    }

    #[Test]
    public function promo_code_ete2024_gives_20_percent(): void
    {
        $discount = $this->service->calculateDiscount(50.0, 'ETE2024');

        $this->assertSame(10.0, $discount); // 20 % de 50
    }

    #[Test]
    public function invalid_promo_code_gives_no_discount(): void
    {
        $discount = $this->service->calculateDiscount(80.0, 'INVALID123');

        $this->assertSame(0.0, $discount);
    }

    #[Test]
    public function promo_code_is_case_insensitive(): void
    {
        $discountLower = $this->service->calculateDiscount(50.0, 'bienvenue');
        $discountUpper = $this->service->calculateDiscount(50.0, 'BIENVENUE');

        $this->assertSame($discountLower, $discountUpper);
    }

    // -------------------------------------------------------------------------
    // Remise automatique
    // -------------------------------------------------------------------------

    #[Test]
    public function auto_discount_applied_when_total_equals_threshold(): void
    {
        $discount = $this->service->calculateDiscount(100.0);

        $this->assertSame(5.0, $discount); // 5 % de 100
    }

    #[Test]
    public function auto_discount_applied_when_total_above_threshold(): void
    {
        $discount = $this->service->calculateDiscount(200.0);

        $this->assertSame(10.0, $discount); // 5 % de 200
    }

    #[Test]
    public function no_auto_discount_just_below_threshold(): void
    {
        $discount = $this->service->calculateDiscount(99.99);

        $this->assertSame(0.0, $discount);
    }

    // -------------------------------------------------------------------------
    // Cumul : on prend la meilleure remise
    // -------------------------------------------------------------------------

    #[Test]
    public function best_discount_wins_over_auto(): void
    {
        // Panier 200 €, code ETE2024 (20 %) > auto (5 %)
        $discount = $this->service->calculateDiscount(200.0, 'ETE2024');

        $this->assertSame(40.0, $discount); // 20 % de 200, pas 5 %
    }

    #[Test]
    public function auto_discount_wins_when_promo_is_lower(): void
    {
        // Code invalide → promoRate=0 ; autoRate=5 %
        $discount = $this->service->calculateDiscount(150.0, 'INVALID');

        $this->assertSame(7.5, $discount); // 5 % de 150
    }

    // -------------------------------------------------------------------------
    // Application de la remise
    // -------------------------------------------------------------------------

    #[Test]
    public function apply_discount_returns_correct_net_total(): void
    {
        $net = $this->service->applyDiscount(100.0, 'BIENVENUE');

        $this->assertSame(90.0, $net); // 100 - 10 %
    }

    #[Test]
    public function apply_discount_never_returns_negative_total(): void
    {
        $net = $this->service->applyDiscount(1.0, 'ETE2024');

        $this->assertGreaterThanOrEqual(0.0, $net);
    }

    // -------------------------------------------------------------------------
    // Validation de code promo
    // -------------------------------------------------------------------------

    #[Test]
    public function valid_promo_codes_are_recognized(): void
    {
        $this->assertTrue($this->service->isValidPromoCode('BIENVENUE'));
        $this->assertTrue($this->service->isValidPromoCode('ETE2024'));
    }

    #[Test]
    public function invalid_promo_code_is_rejected(): void
    {
        $this->assertFalse($this->service->isValidPromoCode('FAKECODE'));
    }

    // -------------------------------------------------------------------------
    // Erreur : total négatif
    // -------------------------------------------------------------------------

    #[Test]
    public function it_throws_on_negative_total(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage("Le total ne peut pas être négatif.");

        $this->service->calculateDiscount(-10.0);
    }
}
