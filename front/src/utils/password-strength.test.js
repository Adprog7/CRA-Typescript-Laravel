/**
 * password-strength.test.js
 *
 * TDD — Cycle Rouge → Vert → Refactoring
 *
 * On écrit d'abord tous les tests (ils échouent car le module n'existe pas).
 * Puis on implémente le minimum de code pour les faire passer.
 *
 * Règles métier à couvrir :
 *  weak   : < 8 caractères OU un seul type de caractère
 *  medium : >= 8 caractères + 2 ou 3 types parmi {minuscule, majuscule, chiffre, spécial}
 *  strong : >= 8 caractères + les 4 types présents
 *
 * Couverture :
 *  ✔ 1 test  — weak
 *  ✔ 2 tests — medium
 *  ✔ 2 tests — strong
 *  ✔ 1 test  — cas limite (chaîne vide)
 */

import { checkPasswordStrength } from './password-strength';

// =============================================================================
// CYCLE TDD — Rouge → Vert → Refactoring
// =============================================================================

describe('checkPasswordStrength', () => {

  // ---------------------------------------------------------------------------
  // 🔴 ROUGE — weak (1 test)
  // Ces tests échouent en premier : le module n'existe pas encore.
  // ---------------------------------------------------------------------------

  describe('weak — mot de passe faible', () => {

    test('[weak] un mot de passe trop court (< 8 caractères) est faible', () => {
      // Arrange — seulement 5 caractères, même avec majuscule et chiffre
      const password = 'Ab1!x';

      // Act
      const result = checkPasswordStrength(password);

      // Assert
      expect(result).toBe('weak');
    });

  });

  // ---------------------------------------------------------------------------
  // 🔴 ROUGE — medium (2 tests)
  // ---------------------------------------------------------------------------

  describe('medium — mot de passe moyen', () => {

    test('[medium] 8 caractères avec minuscules et chiffres uniquement', () => {
      // Arrange — longueur OK, mais seulement 2 types : {lower, digit}
      const password = 'abcdef12';

      // Act
      const result = checkPasswordStrength(password);

      // Assert
      expect(result).toBe('medium');
    });

    test('[medium] 8 caractères avec minuscules, majuscules et chiffres (sans spécial)', () => {
      // Arrange — 3 types présents : {lower, upper, digit} — pas de caractère spécial
      const password = 'Abcdef12';

      // Act
      const result = checkPasswordStrength(password);

      // Assert
      expect(result).toBe('medium');
    });

  });

  // ---------------------------------------------------------------------------
  // 🔴 ROUGE — strong (2 tests)
  // ---------------------------------------------------------------------------

  describe('strong — mot de passe fort', () => {

    test('[strong] 8 caractères avec les 4 types de caractères', () => {
      // Arrange — {lower, upper, digit, special} tous présents
      const password = 'Abcdef1!';

      // Act
      const result = checkPasswordStrength(password);

      // Assert
      expect(result).toBe('strong');
    });

    test('[strong] mot de passe long avec les 4 types de caractères', () => {
      // Arrange — longueur > 8 et 4 types présents
      const password = 'MyP@ssw0rd';

      // Act
      const result = checkPasswordStrength(password);

      // Assert
      expect(result).toBe('strong');
    });

  });

  // ---------------------------------------------------------------------------
  // 🔴 ROUGE — cas limite (1 test)
  // ---------------------------------------------------------------------------

  describe('cas limite', () => {

    test('[weak] une chaîne vide retourne weak', () => {
      // Arrange
      const password = '';

      // Act
      const result = checkPasswordStrength(password);

      // Assert
      expect(result).toBe('weak');
    });

  });

});
