INSERT INTO tipo_assinatura (nome, valor, maximo_acessos)
VALUES ('Plano premium', 29.90, 5)
RETURNING id_tipo_assinatura, nome, valor, maximo_acessos;
