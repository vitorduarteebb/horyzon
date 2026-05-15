-- um único admin: vitor@horyzon.com / Blade1411@200721
-- bcrypt custo 12 (compatível com a app). Executar na base u494944867_horyzonn.

INSERT INTO `User` (`id`, `name`, `email`, `passwordHash`, `role`, `avatarUrl`, `active`, `createdAt`, `updatedAt`)
VALUES (
  'cmhzadminvitor001',
  'Vitor',
  'vitor@horyzon.com',
  '$2b$12$sTM/CgSUJnIi9RTIkwQAHu4ShqJtI6sEHyu6OlEeHHO5FP9vGxLG.',
  'ADMIN',
  NULL,
  1,
  NOW(3),
  NOW(3)
);
