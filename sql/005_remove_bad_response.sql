-- Remove a resposta específica solicitada pelo usuário
-- "Olá! Obrigado pela pergunta. Sobre institucional: podemos ajudar — visite https://viraweb.online ou solicite um orçamento."

DELETE FROM perguntas_respostas 
WHERE resposta LIKE '%Obrigado pela pergunta%Sobre institucional%podemos ajudar%';
