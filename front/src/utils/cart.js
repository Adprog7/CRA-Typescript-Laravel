/**
 * cart.js — Logique métier du panier (fonctions pures)
 *
 * Ce module expose des fonctions sans état qui manipulent
 * un tableau de produits { id, name, price, quantity }.
 *
 * Toutes les fonctions sont pures : elles ne modifient jamais
 * le tableau d'entrée et retournent toujours une nouvelle valeur.
 */

/**
 * Calcule le total du panier.
 *
 * @param {Array<{ price: number, quantity: number }>} items
 * @returns {number} Total arrondi à 2 décimales
 */
export function calculateTotal(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return 0;
  }

  const raw = items.reduce((sum, item) => {
    const price    = Number(item.price)    || 0;
    const quantity = Number(item.quantity) || 0;
    return sum + price * quantity;
  }, 0);

  // Arrondi à 2 décimales pour éviter les erreurs virgule flottante
  return Math.round(raw * 100) / 100;
}

/**
 * Retourne le nombre total d'articles (somme des quantités).
 *
 * @param {Array<{ quantity: number }>} items
 * @returns {number}
 */
export function getTotalQuantity(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return 0;
  }
  return items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
}

/**
 * Filtre les articles dont la quantité est > 0.
 *
 * @param {Array<{ quantity: number }>} items
 * @returns {Array}
 */
export function getActiveItems(items) {
  if (!Array.isArray(items)) return [];
  return items.filter((item) => Number(item.quantity) > 0);
}
