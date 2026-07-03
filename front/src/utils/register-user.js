/**
 * register-user.js — Cas d'usage : inscription d'un utilisateur
 *
 * Dépendances injectées (injection de dépendances = testabilité maximale) :
 *  - userRepository  : { save(userData) → Promise<User> }
 *  - emailService    : { sendWelcome(email, username) → Promise<void> }
 *
 * Règles métier :
 *  - L'email et le username sont obligatoires
 *  - L'utilisateur est persisté avant l'envoi de l'email
 *  - La fonction retourne l'utilisateur créé
 */

/**
 * Inscrit un nouvel utilisateur et lui envoie un email de bienvenue.
 *
 * @param {{ email: string, username: string, password: string }} userData
 * @param {{ save: Function }}  userRepository
 * @param {{ sendWelcome: Function }} emailService
 * @returns {Promise<Object>} L'utilisateur créé
 * @throws {Error} Si email ou username est manquant
 */
export async function registerUser(userData, userRepository, emailService) {
  const { email, username } = userData ?? {};

  if (!email || email.trim() === '') {
    throw new Error("L'email est obligatoire.");
  }
  if (!username || username.trim() === '') {
    throw new Error("Le nom d'utilisateur est obligatoire.");
  }

  // 1. Persister l'utilisateur
  const createdUser = await userRepository.save(userData);

  // 2. Envoyer l'email de bienvenue à l'adresse de l'utilisateur créé
  await emailService.sendWelcome(createdUser.email, createdUser.username);

  // 3. Retourner l'utilisateur créé
  return createdUser;
}
