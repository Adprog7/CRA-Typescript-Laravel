/**
 * discount.test.js — Tests unitaires du module discount.js
 *
 * Structure de chaque test : Arrange / Act / Assert
 *
 * Couverture :
 *  ✔ Une remise de 10 % sur 100 retourne 90
 *  ✔ Une remise de 0 % retourne le total inchangé
 *  ✔ Une remise de 100 % retourne 0
 *  ✔ Une remise négative déclenche une erreur
 *  ✔ Une remise supérieure à 100 déclenche une erreur
 *  ✔ Remise sur un prix décimal
 *  ✔ Remise sur un total de 0
 *  ✔ calculateDiscountAmount retourne le bon montant
 */

import { applyDiscount, calculateDiscountAmount } from './discount';

// =============================================================================
// applyDiscount
// =============================================================================

describe('applyDiscount', () => {

  // ---------------------------------------------------------------------------
  // Cas nominaux (les 5 cas demandés)
  // ---------------------------------------------------------------------------

  test('une remise de 10 % sur 100 retourne 90', () => {
    // Arrange
    const total    = 100;
    const discount = 10;

    // Act
    const result = applyDiscount(total, discount);

    // Assert
    expect(result).toBe(90);
  });

  test('une remise de 0 % retourne le total inchangé', () => {
    // Arrange
    const total    = 150;
    const discount = 0;

    // Act
    const result = applyDiscount(total, discount);

    // Assert
    expect(result).toBe(150);
  });

  test('une remise de 100 % retourne 0', () => {
    // Arrange
    const total    = 200;
    const discount = 100;

    // Act
    const result = applyDiscount(total, discount);

    // Assert
    expect(result).toBe(0);
  });

  test('une remise négative déclenche une erreur', () => {
    // Arrange
    const total    = 100;
    const discount = -5;

    // Act & Assert
    expect(() => applyDiscount(total, discount)).toThrow(
      'La remise ne peut pas être négative.'
    );
  });

  test('une remise supérieure à 100 déclenche une erreur', () => {
    // Arrange
    const total    = 100;
    const discount = 110;

    // Act & Assert
    expect(() => applyDiscount(total, discount)).toThrow(
      'La remise ne peut pas dépasser 100 %.'
    );
  });

  // ---------------------------------------------------------------------------
  // Cas complémentaires
  // ---------------------------------------------------------------------------

  test('une remise de 20 % sur 50 retourne 40', () => {
    // Arrange
    const total    = 50;
    const discount = 20;

    // Act
    const result = applyDiscount(total, discount);

    // Assert
    expect(result).toBe(40);
  });

  test('gère correctement les prix décimaux (arrondi à 2 décimales)', () => {
    // Arrange — 15 % de 29.99 = 4.4985 → net = 25.4915 → arrondi 25.49
    const total    = 29.99;
    const discount = 15;

    // Act
    const result = applyDiscount(total, discount);

    // Assert
    expect(result).toBe(25.49);
  });

  test('une remise sur un total de 0 retourne toujours 0', () => {
    // Arrange
    const total    = 0;
    const discount = 50;

    // Act
    const result = applyDiscount(total, discount);

    // Assert
    expect(result).toBe(0);
  });

  test('une remise exactement à 100 est acceptée (limite haute)', () => {
    // Arrange / Act / Assert — ne doit pas lever d'erreur
    expect(() => applyDiscount(100, 100)).not.toThrow();
    expect(applyDiscount(100, 100)).toBe(0);
  });

  test('une remise exactement à 0 est acceptée (limite basse)', () => {
    // Arrange / Act / Assert — ne doit pas lever d'erreur
    expect(() => applyDiscount(100, 0)).not.toThrow();
    expect(applyDiscount(100, 0)).toBe(100);
  });
});

// =============================================================================
// calculateDiscountAmount
// =============================================================================

describe('calculateDiscountAmount', () => {

  test('retourne le montant de la remise (10 % de 100 = 10)', () => {
    // Arrange
    const total    = 100;
    const discount = 10;

    // Act
    const amount = calculateDiscountAmount(total, discount);

    // Assert
    expect(amount).toBe(10);
  });

  test('retourne 0 si le taux de remise est 0 %', () => {
    // Arrange / Act / Assert
    expect(calculateDiscountAmount(200, 0)).toBe(0);
  });

  test('retourne le total entier si la remise est de 100 %', () => {
    // Arrange / Act / Assert
    expect(calculateDiscountAmount(80, 100)).toBe(80);
  });

  test('retourne 0 si le total est 0', () => {
    // Arrange / Act / Assert
    expect(calculateDiscountAmount(0, 50)).toBe(0);
  });

  test('une remise négative déclenche une erreur', () => {
    // Arrange / Act & Assert
    expect(() => calculateDiscountAmount(100, -1)).toThrow(
      'La remise ne peut pas être négative.'
    );
  });

  test('une remise supérieure à 100 déclenche une erreur', () => {
    // Arrange / Act & Assert
    expect(() => calculateDiscountAmount(100, 101)).toThrow(
      'La remise ne peut pas dépasser 100 %.'
    );
  });
});
