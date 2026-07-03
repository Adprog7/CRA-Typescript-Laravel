<?php

namespace Tests\Unit\Ecommerce;

use App\Services\Ecommerce\Cart;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

/**
 * Tests unitaires du panier e-commerce.
 *
 * Couverture :
 *  ✔ Ajout d'un article
 *  ✔ Ajout d'un même article deux fois → cumul de quantité
 *  ✔ Calcul du total
 *  ✔ Retrait partiel d'un article
 *  ✔ Retrait total d'un article → suppression de la ligne
 *  ✔ Vidage du panier
 *  ✔ Panier vide → total = 0
 *  ✔ Erreur : prix négatif
 *  ✔ Erreur : quantité nulle ou négative
 *  ✔ Erreur : retrait d'un article inexistant
 */
class CartTest extends TestCase
{
    private Cart $cart;

    protected function setUp(): void
    {
        $this->cart = new Cart();
    }

    // -------------------------------------------------------------------------
    // Ajout d'articles
    // -------------------------------------------------------------------------

    #[Test]
    public function it_starts_empty(): void
    {
        $this->assertTrue($this->cart->isEmpty());
        $this->assertSame(0.0, $this->cart->getTotal());
        $this->assertSame(0, $this->cart->getItemCount());
    }

    #[Test]
    public function it_adds_a_single_item(): void
    {
        $this->cart->addItem(1, 'T-shirt', 19.99);

        $this->assertFalse($this->cart->isEmpty());
        $this->assertSame(1, $this->cart->getItemCount());
        $this->assertSame(19.99, $this->cart->getTotal());
    }

    #[Test]
    public function it_adds_multiple_different_items(): void
    {
        $this->cart->addItem(1, 'T-shirt', 19.99);
        $this->cart->addItem(2, 'Pantalon', 49.99);

        $this->assertSame(2, $this->cart->getItemCount());
        $this->assertSame(69.98, $this->cart->getTotal());
    }

    #[Test]
    public function it_cumulates_quantity_for_the_same_product(): void
    {
        $this->cart->addItem(1, 'T-shirt', 19.99, 1);
        $this->cart->addItem(1, 'T-shirt', 19.99, 2);

        $this->assertSame(3, $this->cart->getItemCount());
        $this->assertSame(59.97, $this->cart->getTotal());
    }

    #[Test]
    public function it_adds_item_with_specific_quantity(): void
    {
        $this->cart->addItem(5, 'Chaussette', 3.50, 4);

        $this->assertSame(4, $this->cart->getItemCount());
        $this->assertSame(14.0, $this->cart->getTotal());
    }

    // -------------------------------------------------------------------------
    // Retrait d'articles
    // -------------------------------------------------------------------------

    #[Test]
    public function it_removes_one_unit_of_an_item(): void
    {
        $this->cart->addItem(1, 'T-shirt', 19.99, 3);
        $this->cart->removeItem(1, 1);

        $this->assertSame(2, $this->cart->getItemCount());
        $this->assertSame(39.98, $this->cart->getTotal());
    }

    #[Test]
    public function it_removes_item_completely_when_quantity_reaches_zero(): void
    {
        $this->cart->addItem(1, 'T-shirt', 19.99, 2);
        $this->cart->removeItem(1, 2);

        $this->assertTrue($this->cart->isEmpty());
    }

    #[Test]
    public function it_throws_when_removing_nonexistent_item(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage("Produit introuvable dans le panier.");

        $this->cart->removeItem(999);
    }

    // -------------------------------------------------------------------------
    // Vidage
    // -------------------------------------------------------------------------

    #[Test]
    public function it_clears_the_cart(): void
    {
        $this->cart->addItem(1, 'T-shirt', 19.99);
        $this->cart->addItem(2, 'Pantalon', 49.99);
        $this->cart->clear();

        $this->assertTrue($this->cart->isEmpty());
        $this->assertSame(0.0, $this->cart->getTotal());
    }

    // -------------------------------------------------------------------------
    // Validations des entrées
    // -------------------------------------------------------------------------

    #[Test]
    public function it_throws_on_negative_price(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage("Le prix ne peut pas être négatif.");

        $this->cart->addItem(1, 'Produit', -5.0);
    }

    #[Test]
    public function it_throws_on_zero_quantity(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage("La quantité doit être supérieure à zéro.");

        $this->cart->addItem(1, 'Produit', 10.0, 0);
    }

    #[Test]
    public function it_throws_on_negative_quantity(): void
    {
        $this->expectException(\InvalidArgumentException::class);

        $this->cart->addItem(1, 'Produit', 10.0, -3);
    }

    // -------------------------------------------------------------------------
    // Calcul du total avec article à 0 €
    // -------------------------------------------------------------------------

    #[Test]
    public function it_accepts_free_items(): void
    {
        $this->cart->addItem(99, 'Échantillon gratuit', 0.0, 1);

        $this->assertSame(0.0, $this->cart->getTotal());
        $this->assertFalse($this->cart->isEmpty());
    }
}
