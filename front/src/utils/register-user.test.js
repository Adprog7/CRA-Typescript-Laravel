/**
 * register-user.test.js — Tests unitaires avec mocks
 *
 * Stratégie : injection de mocks Jest (jest.fn()) pour isoler
 * complètement registerUser de ses dépendances réelles.
 *
 * Structure de chaque test : Arrange / Act / Assert
 *
 * Couverture :
 *  ✔ L'utilisateur est bien créé (userRepository.save appelé)
 *  ✔ L'email de bienvenue est bien envoyé (emailService.sendWelcome appelé)
 *  ✔ L'email de bienvenue est envoyé à la bonne adresse
 *  ✔ La fonction retourne l'utilisateur créé
 *  ✔ L'email est envoyé APRÈS la création (ordre des appels)
 *  ✔ Erreur si email manquant
 *  ✔ Erreur si username manquant
 *  ✔ sendWelcome reçoit aussi le bon username
 */

import { registerUser } from './register-user';

// =============================================================================
// Helpers — construction des mocks réutilisables
// =============================================================================

/**
 * Crée un mock de userRepository.
 * Par défaut, save() résout avec un utilisateur fictif.
 */
function makeUserRepository(overrides = {}) {
  return {
    save: jest.fn().mockResolvedValue({
      id:       1,
      email:    'alice@example.com',
      username: 'Alice',
    }),
    ...overrides,
  };
}

/**
 * Crée un mock de emailService.
 * Par défaut, sendWelcome() résout sans valeur (void).
 */
function makeEmailService(overrides = {}) {
  return {
    sendWelcome: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

// Données utilisateur valides réutilisées dans tous les tests
const VALID_USER_DATA = {
  email:    'alice@example.com',
  username: 'Alice',
  password: 'Secret1!',
};

// =============================================================================
// Tests principaux
// =============================================================================

describe('registerUser', () => {

  // Réinitialise les mocks entre chaque test
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // 1. L'utilisateur est bien créé
  // ---------------------------------------------------------------------------

  test("appelle userRepository.save avec les données de l'utilisateur", async () => {
    // Arrange
    const userRepository = makeUserRepository();
    const emailService   = makeEmailService();

    // Act
    await registerUser(VALID_USER_DATA, userRepository, emailService);

    // Assert — save doit avoir été appelé exactement une fois avec les bonnes données
    expect(userRepository.save).toHaveBeenCalledTimes(1);
    expect(userRepository.save).toHaveBeenCalledWith(VALID_USER_DATA);
  });

  // ---------------------------------------------------------------------------
  // 2. L'email de bienvenue est bien envoyé
  // ---------------------------------------------------------------------------

  test("appelle emailService.sendWelcome exactement une fois", async () => {
    // Arrange
    const userRepository = makeUserRepository();
    const emailService   = makeEmailService();

    // Act
    await registerUser(VALID_USER_DATA, userRepository, emailService);

    // Assert
    expect(emailService.sendWelcome).toHaveBeenCalledTimes(1);
  });

  // ---------------------------------------------------------------------------
  // 3. L'email de bienvenue est envoyé à la bonne adresse
  // ---------------------------------------------------------------------------

  test("envoie l'email de bienvenue à l'adresse de l'utilisateur créé", async () => {
    // Arrange — le repository retourne un utilisateur avec une adresse précise
    const createdUser = { id: 42, email: 'bob@example.com', username: 'Bob' };
    const userRepository = makeUserRepository({
      save: jest.fn().mockResolvedValue(createdUser),
    });
    const emailService = makeEmailService();

    // Act
    await registerUser(
      { email: 'bob@example.com', username: 'Bob', password: 'Pwd1!' },
      userRepository,
      emailService
    );

    // Assert — premier argument de sendWelcome = email de l'utilisateur créé
    expect(emailService.sendWelcome).toHaveBeenCalledWith(
      'bob@example.com',
      'Bob'
    );
  });

  // ---------------------------------------------------------------------------
  // 4. La fonction retourne l'utilisateur créé
  // ---------------------------------------------------------------------------

  test("retourne l'objet utilisateur renvoyé par userRepository.save", async () => {
    // Arrange
    const createdUser = { id: 1, email: 'alice@example.com', username: 'Alice' };
    const userRepository = makeUserRepository({
      save: jest.fn().mockResolvedValue(createdUser),
    });
    const emailService = makeEmailService();

    // Act
    const result = await registerUser(VALID_USER_DATA, userRepository, emailService);

    // Assert
    expect(result).toEqual(createdUser);
  });

  // ---------------------------------------------------------------------------
  // 5. Ordre des opérations : save AVANT sendWelcome
  // ---------------------------------------------------------------------------

  test("appelle save avant sendWelcome (ordre des dépendances)", async () => {
    // Arrange
    const callOrder      = [];
    const userRepository = makeUserRepository({
      save: jest.fn().mockImplementation(async () => {
        callOrder.push('save');
        return { id: 1, email: 'alice@example.com', username: 'Alice' };
      }),
    });
    const emailService = makeEmailService({
      sendWelcome: jest.fn().mockImplementation(async () => {
        callOrder.push('sendWelcome');
      }),
    });

    // Act
    await registerUser(VALID_USER_DATA, userRepository, emailService);

    // Assert — la persistance doit précéder l'envoi de l'email
    expect(callOrder).toEqual(['save', 'sendWelcome']);
  });

  // ---------------------------------------------------------------------------
  // 6. sendWelcome reçoit également le bon username
  // ---------------------------------------------------------------------------

  test("sendWelcome reçoit le username de l'utilisateur créé", async () => {
    // Arrange
    const createdUser    = { id: 5, email: 'carol@example.com', username: 'Carol' };
    const userRepository = makeUserRepository({
      save: jest.fn().mockResolvedValue(createdUser),
    });
    const emailService = makeEmailService();

    // Act
    await registerUser(
      { email: 'carol@example.com', username: 'Carol', password: 'Pwd1!' },
      userRepository,
      emailService
    );

    // Assert — deuxième argument = username
    const [, usernameArg] = emailService.sendWelcome.mock.calls[0];
    expect(usernameArg).toBe('Carol');
  });

  // ---------------------------------------------------------------------------
  // 7. Erreurs de validation — email manquant
  // ---------------------------------------------------------------------------

  test("lève une erreur si l'email est absent", async () => {
    // Arrange
    const userRepository = makeUserRepository();
    const emailService   = makeEmailService();
    const badData        = { email: '', username: 'Alice', password: 'Pwd1!' };

    // Act & Assert
    await expect(
      registerUser(badData, userRepository, emailService)
    ).rejects.toThrow("L'email est obligatoire.");

    // Aucune dépendance ne doit avoir été appelée
    expect(userRepository.save).not.toHaveBeenCalled();
    expect(emailService.sendWelcome).not.toHaveBeenCalled();
  });

  // ---------------------------------------------------------------------------
  // 8. Erreurs de validation — username manquant
  // ---------------------------------------------------------------------------

  test("lève une erreur si le username est absent", async () => {
    // Arrange
    const userRepository = makeUserRepository();
    const emailService   = makeEmailService();
    const badData        = { email: 'alice@example.com', username: '', password: 'Pwd1!' };

    // Act & Assert
    await expect(
      registerUser(badData, userRepository, emailService)
    ).rejects.toThrow("Le nom d'utilisateur est obligatoire.");

    // Aucune dépendance ne doit avoir été appelée
    expect(userRepository.save).not.toHaveBeenCalled();
    expect(emailService.sendWelcome).not.toHaveBeenCalled();
  });
});
