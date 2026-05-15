-- Executar APÓIS o SQL da migração inicial (`migrations/20260515080000_init/migration.sql`)
-- nos base de dados já vazia ou recém criada sem linhas na tabela `User`.
-- Senhas correspondem ao seed oficial: admin123, gustavo123, angel123, xavier123
-- Hashes bcrypt com custo 12 (iguais ao prisma/seed.ts).

INSERT INTO `User` (`id`, `name`, `email`, `passwordHash`, `role`, `avatarUrl`, `active`, `createdAt`, `updatedAt`)
VALUES
  ('cmhz001adminhoryzon', 'Admin Horyzonn', 'admin@horyzonn.com.br', '$2b$12$8da9np6DJ6IKgJyB4qM58e8EjLZo52gNluOuOk14SKFGPLJ15jHxS', 'ADMIN', NULL, 1, NOW(3), NOW(3)),
  ('cmhz002gustavohoriz', 'Gustavo', 'gustavo@horyzonn.com.br', '$2b$12$K29ClGHxyfTDMO4b8fmzJuqT1F41e9SulfPWCkV679POTuYPSczXi', 'GUSTAVO', NULL, 1, NOW(3), NOW(3)),
  ('cmhz003angelhorizon', 'Angel', 'angel@horyzonn.com.br', '$2b$12$1RiWYB.BtS.5cFs4e819hOYwVOkFwnLTnM1lYaIu3zJ2jh7ZqiYuy', 'ANGEL', NULL, 1, NOW(3), NOW(3)),
  ('cmhz004xavierhorzon', 'Xavier', 'xavier@horyzonn.com.br', '$2b$12$OamRVuFEg1225TiBjvR.HOnH4gfl7JaowP.sHxyXqVO.DixD5d/.S', 'XAVIER', NULL, 1, NOW(3), NOW(3));
