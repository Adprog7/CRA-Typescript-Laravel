/**
 * cart.test.js — Tests unitaires du module cart.js
 *
 * Structure de chaque test : Arrange / Act / Assert
 *
 * Couverture :
 *  ✔ Le total est correctement calculé avec plusieurs produits
 *  ✔ Le total est 0 si le panier est vide
 *  ✔ Les quantités sont bien prises en compte
 *  ✔ Les prix décimaux sont correctement gérés
 *  ✔ Un produit avec une quantité à 0 n'augmente pas le total
 *  ✔ Un produit avec quantité négative n'augmente pas le total
 *  ✔ Un seul produit avec quantité = 1
 *  ✔ getTotalQuantity retourne la somme des quantités
 *  ✔ getActiveItems filtre les articles à quantité nulle
 */

import { calculateTotal, getActiveItems, getTotalQuantity } from './cart';

// =============================================================================
// calculateTotal
// =============================================================================

describe('calculateTotal', () => {

  // ---------------------------------------------------------------------------
  // Panier vide
  // ---------------------------------------------------------------------------

  test('retourne 0 pour un panier vide (tableau vide)', () => {
    // Arrange
    const items = [];

    // Act
    const total = calculateTotal(items);

    // Assert
    expect(total).toBe(0);
  });

  test('retourne 0 si items est null ou undefined', () => {
    // Arrange / Act / Assert
    expect(calculateTotal(null)).toBe(0);
    expect(calculateTotal(undefined)).toBe(0);
  });

  // ---------------------------------------------------------------------------
  // Un seul produit
  // ---------------------------------------------------------------------------

  test('calcule le total pour un seul produit avec quantité = 1', () => {
    // Arrange
    const items = [{ id: 1, name: 'T-shirt', price: 19.99, quantity: 1 }];

    // Act
    const total = calculateTotal(items);

    // Assert
    expect(total).toBe(19.99);
  });

  // ---------------------------------------------------------------------------
  // Plusieurs produits
  // ---------------------------------------------------------------------------

  test('calcule correctement le total avec plusieurs produits différents', () => {
    // Arrange
    const items = [
      { id: 1, name: 'T-shirt',  price: 19.99, quantity: 1 },
      { id: 2, name: 'Pantalon', price: 49.99, quantity: 1 },
      { id: 3, name: 'Casquette', price: 12.50, quantity: 1 },
    ];

    // Act
    const total = calculateTotal(items);

    // Assert — 19.99 + 49.99 + 12.50 = 82.48
    expect(total).toBe(82.48);
  });

  // ---------------------------------------------------------------------------
  // Quantités > 1
  // ---------------------------------------------------------------------------

  test('multiplie correctement le prix par la quantité', () => {
    // Arrange
    const items = [{ id: 1, name: 'Chaussette', price: 3.50, quantity: 4 }];

    // Act
    const total = calculateTotal(items);

    // Assert — 3.50 × 4 = 14.00
    expect(total).toBe(14.00);
  });

  test('prend en compte les quantités différentes pour chaque produit', () => {
    // Arrange
    const items = [
      { id: 1, name: 'T-shirt',  price: 20.00, quantity: 3 }, // 60
      { id: 2, name: 'Pantalon', price: 50.00, quantity: 2 }, // 100
    ];

    // Act
    const total = calculateTotal(items);

    // Assert — 60 + 100 = 160
    expect(total).toBe(160.00);
  });

  // ---------------------------------------------------------------------------
  // Quantité à 0 — ne doit pas augmenter le total
  // ---------------------------------------------------------------------------

  test('un produit avec quantité 0 n\'augmente pas le total', () => {
    // Arrange
    const items = [
      { id: 1, name: 'T-shirt',  price: 20.00, quantity: 1 }, // contribue
      { id: 2, name: 'Pantalon', price: 99.99, quantity: 0 }, // quantité = 0
    ];

    // Act
    const total = calculateTotal(items);

    // Assert — seul le T-shirt compte
    expect(total).toBe(20.00);
  });

  test('retourne 0 si tous les produits ont une quantité à 0', () => {
    // Arrange
    const items = [
      { id: 1, name: 'T-shirt',  price: 20.00, quantity: 0 },
      { id: 2, name: 'Pantalon', price: 50.00, quantity: 0 },
    ];

    // Act
    const total = calculateTotal(items);

    // Assert
    expect(total).toBe(0);
  });

  // ---------------------------------------------------------------------------
  // Prix décimaux
  // ---------------------------------------------------------------------------

  test('gère correctement les prix décimaux (arrondi à 2 décimales)', () => {
    // Arrange — 0.1 + 0.2 = 0.30000000000000004 en JS natif
    const items = [
      { id: 1, name: 'Article A', price: 0.10, quantity: 1 },
      { id: 2, name: 'Article B', price: 0.20, quantity: 1 },
    ];

    // Act
    const total = calculateTotal(items);

    // Assert — doit valoir exactement 0.30, pas 0.30000000000000004
    expect(total).toBe(0.30);
  });

  test('gère les prix avec 2 décimales sur plusieurs quantités', () => {
    // Arrange
    const items = [{ id: 1, name: 'Stylo', price: 1.99, quantity: 3 }];

    // Act
    const total = calculateTotal(items);

    // Assert — 1.99 × 3 = 5.97
    expect(total).toBe(5.97);
  });

  test('gère un prix de 0 (produit gratuit)', () => {
    // Arrange
    const items = [
      { id: 1, name: 'Échantillon', price: 0.00, quantity: 5 },
      { id: 2, name: 'T-shirt',     price: 15.00, quantity: 1 },
    ];

    // Act
    const total = calculateTotal(items);

    // Assert — seul le T-shirt compte
    expect(total).toBe(15.00);
  });

  // ---------------------------------------------------------------------------
  // Quantité négative (cas limite)
  // ---------------------------------------------------------------------------

  test('un produit avec quantité négative ne diminue pas le total des autres', () => {
    // Arrange
    const items = [
      { id: 1, name: 'T-shirt',  price: 20.00, quantity: 2  }, //  40
      { id: 2, name: 'Retour',   price: 10.00, quantity: -1 }, // -10 → ignoré par getActiveItems
    ];

    // Act — calculateTotal calcule le brut (y compris négatif)
    const rawTotal = calculateTotal(items);

    // Si on filtre d'abord avec getActiveItems puis on calcule
    const safeTotal = calculateTotal(getActiveItems(items));

    // Assert
    expect(rawTotal).toBe(30.00);   // comportement brut
    expect(safeTotal).toBe(40.00);  // comportement sécurisé
  });
});

// =============================================================================
// getTotalQuantity
// =============================================================================

describe('getTotalQuantity', () => {

  test('retourne 0 pour un panier vide', () => {
    // Arrange / Act / Assert
    expect(getTotalQuantity([])).toBe(0);
  });

  test('retourne la somme des quantités de tous les articles', () => {
    // Arrange
    const items = [
      { id: 1, quantity: 2 },
      { id: 2, quantity: 3 },
      { id: 3, quantity: 1 },
    ];

    // Act
    const count = getTotalQuantity(items);

    // Assert
    expect(count).toBe(6);
  });

  test('ignore les articles à quantité 0 dans le décompte', () => {
    // Arrange
    const items = [
      { id: 1, quantity: 2 },
      { id: 2, quantity: 0 },
    ];

    // Act
    const count = getTotalQuantity(items);

    // Assert
    expect(count).toBe(2);
  });
});

// =============================================================================
// getActiveItems
// =============================================================================

describe('getActiveItems', () => {

  test('filtre les articles dont la quantité est à 0', () => {
    // Arrange
    const items = [
      { id: 1, name: 'T-shirt',  price: 20, quantity: 1 },
      { id: 2, name: 'Pantalon', price: 50, quantity: 0 },
      { id: 3, name: 'Casquette', price: 12, quantity: 2 },
    ];

    // Act
    const active = getActiveItems(items);

    // Assert
    expect(active).toHaveLength(2);
    expect(active.map((i) => i.id)).toEqual([1, 3]);
  });

  test('retourne un tableau vide si tous les articles sont à quantité 0', () => {
    // Arrange
    const items = [
      { id: 1, quantity: 0 },
      { id: 2, quantity: 0 },
    ];

    // Act / Assert
    expect(getActiveItems(items)).toHaveLength(0);
  });

  test('retourne tous les articles si tous ont une quantité > 0', () => {
    // Arrange
    const items = [
      { id: 1, quantity: 1 },
      { id: 2, quantity: 3 },
    ];

    // Act / Assert
    expect(getActiveItems(items)).toHaveLength(2);
  });
});
