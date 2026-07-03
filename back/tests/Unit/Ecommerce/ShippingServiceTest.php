<?php

namespace Tests\Unit\Ecommerce;

use App\Services\Ecommerce\ShippingService;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

/**
 * Tests unitaires du service de livraison.
 *
 * Couverture :
 *  ✔ Livraison standard de base
 *  ✔ Livraison express de base
 *  ✔ Livraison gratuite si total >= 50 € (standard)
 *  ✔ Pas de livraison gratuite si total < 50 €
 *  ✔ Livraison express jamais gratuite même > 50 €
 *  ✔ Supplément international (standard)
 *  ✔ Supplément international (express)
 *  ✔ Livraison internationale sans gratuité même > 50 €
 *  ✔ Panier vide → 0 €
 *  ✔ Erreur : méthode inconnue
 *  ✔ Erreur : total négatif
 *  ✔ Méthodes disponibles retournées
 *  ✔ Seuil de gratuité retourné
 */
class ShippingServiceTest extends TestCase
{
    private ShippingService $service;

    protected function setUp(): void
    {
        $this->service = new ShippingService();
    }

    // -------------------------------------------------------------------------
    // Cas de base
    // -------------------------------------------------------------------------

    #[Test]
    public function standard_shipping_costs_4_99_below_threshold(): void
    {
        $cost = $this->service->calculate(30.0, ShippingService::METHOD_STANDARD);

        $this->assertSame(4.99, $cost);
    }

    #[Test]
    public function express_shipping_costs_9_99(): void
    {
        $cost = $this->service->calculate(30.0, ShippingService::METHOD_EXPRESS);

        $this->assertSame(9.99, $cost);
    }

    // -------------------------------------------------------------------------
    // Livraison gratuite
    // -------------------------------------------------------------------------

    #[Test]
    public function standard_shipping_is_free_at_threshold(): void
    {
        $cost = $this->service->calculate(50.0, ShippingService::METHOD_STANDARD);

        $this->assertSame(0.0, $cost);
    }

    #[Test]
    public function standard_shipping_is_free_above_threshold(): void
    {
        $cost = $this->service->calculate(120.0, ShippingService::METHOD_STANDARD);

        $this->assertSame(0.0, $cost);
    }

    #[Test]
    public function standard_shipping_is_not_free_just_below_threshold(): void
    {
        $cost = $this->service->calculate(49.99, ShippingService::METHOD_STANDARD);

        $this->assertSame(4.99, $cost);
    }

    #[Test]
    public function express_shipping_is_never_free(): void
    {
        $cost = $this->service->calculate(200.0, ShippingService::METHOD_EXPRESS);

        $this->assertSame(9.99, $cost);
    }

    // -------------------------------------------------------------------------
    // International
    // -------------------------------------------------------------------------

    #[Test]
    public function international_standard_shipping_adds_surcharge(): void
    {
        // 4,99 + 15 = 19,99
        $cost = $this->service->calculate(30.0, ShippingService::METHOD_STANDARD, true);

        $this->assertSame(19.99, $cost);
    }

    #[Test]
    public function international_express_shipping_adds_surcharge(): void
    {
        // 9,99 + 15 = 24,99
        $cost = $this->service->calculate(30.0, ShippingService::METHOD_EXPRESS, true);

        $this->assertSame(24.99, $cost);
    }

    #[Test]
    public function international_shipping_is_not_free_even_above_threshold(): void
    {
        // Panier 100 €, standard international → pas de gratuité + surcharge
        $cost = $this->service->calculate(100.0, ShippingService::METHOD_STANDARD, true);

        $this->assertSame(19.99, $cost); // 4,99 + 15
    }

    // -------------------------------------------------------------------------
    // Panier vide
    // -------------------------------------------------------------------------

    #[Test]
    public function empty_cart_has_no_shipping_cost(): void
    {
        $cost = $this->service->calculate(0.0);

        $this->assertSame(0.0, $cost);
    }

    // -------------------------------------------------------------------------
    // Erreurs
    // -------------------------------------------------------------------------

    #[Test]
    public function it_throws_on_unknown_shipping_method(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage("Méthode de livraison inconnue");

        $this->service->calculate(50.0, 'drone');
    }

    #[Test]
    public function it_throws_on_negative_cart_total(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage("Le total du panier ne peut pas être négatif.");

        $this->service->calculate(-10.0);
    }

    // -------------------------------------------------------------------------
    // Métadonnées
    // -------------------------------------------------------------------------

    #[Test]
    public function it_returns_available_methods(): void
    {
        $methods = $this->service->getAvailableMethods();

        $this->assertArrayHasKey(ShippingService::METHOD_STANDARD, $methods);
        $this->assertArrayHasKey(ShippingService::METHOD_EXPRESS, $methods);
    }

    #[Test]
    public function it_returns_free_shipping_threshold(): void
    {
        $threshold = $this->service->getFreeShippingThreshold();

        $this->assertSame(50.0, $threshold);
    }
}
