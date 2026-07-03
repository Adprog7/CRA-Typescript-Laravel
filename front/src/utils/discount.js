/**
 * discount.js — Logique métier des remises (fonctions pures)
 *
 * Ce module expose des fonctions sans état qui calculent
 * les remises applicables sur un total de commande.
 *
 * @throws {Error} Si le taux de remise est négatif ou supérieur à 100
 */

/**
 * Applique un pourcentage de remise sur un total.
 *
 * @param {number} total    - Montant brut (>= 0)
 * @param {number} discount - Taux de remise en % (0 – 100)
 * @returns {number} Montant net arrondi à 2 décimales
 * @throws {Error} Si discount < 0 ou discount > 100
 */
export function applyDiscount(total, discount) {
  if (discount < 0) {
    throw new Error('La remise ne peut pas être négative.');
  }
  if (discount > 100) {
    throw new Error('La remise ne peut pas dépasser 100 %.');
  }

  const net = total - (total * discount) / 100;
  return Math.round(net * 100) / 100;
}

/**
 * Calcule uniquement le montant de la remise (sans l'appliquer).
 *
 * @param {number} total    - Montant brut (>= 0)
 * @param {number} discount - Taux de remise en % (0 – 100)
 * @returns {number} Montant de la remise arrondi à 2 décimales
 * @throws {Error} Si discount < 0 ou discount > 100
 */
export function calculateDiscountAmount(total, discount) {
  if (discount < 0) {
    throw new Error('La remise ne peut pas être négative.');
  }
  if (discount > 100) {
    throw new Error('La remise ne peut pas dépasser 100 %.');
  }

  return Math.round((total * discount) / 100 * 100) / 100;
}
