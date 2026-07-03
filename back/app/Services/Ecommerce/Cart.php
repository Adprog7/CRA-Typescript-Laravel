<?php

namespace App\Services\Ecommerce;

/**
 * Gestion du panier e-commerce.
 *
 * Responsabilités :
 *  - Ajouter / retirer des articles
 *  - Calculer le total brut
 *  - Vider le panier
 */
class Cart
{
    /** @var array<int, array{name: string, price: float, quantity: int}> */
    private array $items = [];

    // -------------------------------------------------------------------------
    // Mutations
    // -------------------------------------------------------------------------

    /**
     * Ajoute un article au panier.
     * Si l'article existe déjà, incrémente la quantité.
     *
     * @throws \InvalidArgumentException si le prix ou la quantité est négatif
     */
    public function addItem(int $productId, string $name, float $price, int $quantity = 1): void
    {
        if ($price < 0) {
            throw new \InvalidArgumentException("Le prix ne peut pas être négatif.");
        }
        if ($quantity <= 0) {
            throw new \InvalidArgumentException("La quantité doit être supérieure à zéro.");
        }

        if (isset($this->items[$productId])) {
            $this->items[$productId]['quantity'] += $quantity;
        } else {
            $this->items[$productId] = [
                'name'     => $name,
                'price'    => $price,
                'quantity' => $quantity,
            ];
        }
    }

    /**
     * Retire un article du panier (ou décrémente sa quantité).
     *
     * @throws \InvalidArgumentException si l'article n'existe pas
     */
    public function removeItem(int $productId, int $quantity = 1): void
    {
        if (! isset($this->items[$productId])) {
            throw new \InvalidArgumentException("Produit introuvable dans le panier.");
        }

        $this->items[$productId]['quantity'] -= $quantity;

        if ($this->items[$productId]['quantity'] <= 0) {
            unset($this->items[$productId]);
        }
    }

    /** Vide complètement le panier. */
    public function clear(): void
    {
        $this->items = [];
    }

    // -------------------------------------------------------------------------
    // Requêtes
    // -------------------------------------------------------------------------

    /** Retourne le total brut (sans remise ni livraison). */
    public function getTotal(): float
    {
        $total = 0.0;
        foreach ($this->items as $item) {
            $total += $item['price'] * $item['quantity'];
        }
        return round($total, 2);
    }

    /** Retourne le nombre total d'articles (somme des quantités). */
    public function getItemCount(): int
    {
        return array_sum(array_column($this->items, 'quantity'));
    }

    /** Indique si le panier est vide. */
    public function isEmpty(): bool
    {
        return empty($this->items);
    }

    /** Retourne tous les articles. */
    public function getItems(): array
    {
        return $this->items;
    }
}
