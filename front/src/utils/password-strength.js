/**
 * password-strength.js
 *
 * TDD — Phase VERTE : implémentation minimale pour faire passer les tests.
 *
 * Système de score :
 *  +1  si contient au moins une minuscule   [a-z]
 *  +1  si contient au moins une majuscule   [A-Z]
 *  +1  si contient au moins un chiffre      [0-9]
 *  +1  si contient au moins un caractère spécial [!@#$%^&*…]
 *
 * Résultat :
 *  weak   → longueur < 8  OU score <= 1
 *  medium → longueur >= 8 ET score entre 2 et 3 inclus
 *  strong → longueur >= 8 ET score === 4
 */

/**
 * Évalue la force d'un mot de passe.
 *
 * @param {string} password
 * @returns {'weak' | 'medium' | 'strong'}
 */
export function checkPasswordStrength(password) {
  // Cas limite : chaîne vide ou non-string
  if (!password || password.length < 8) {
    return 'weak';
  }

  let score = 0;

  if (/[a-z]/.test(password)) score++;   // minuscule
  if (/[A-Z]/.test(password)) score++;   // majuscule
  if (/[0-9]/.test(password)) score++;   // chiffre
  if (/[^a-zA-Z0-9]/.test(password)) score++; // caractère spécial

  if (score <= 1) return 'weak';
  if (score <= 3) return 'medium';
  return 'strong';
}
