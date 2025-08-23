-- Fase 1: Añadir permisos a los grupos
ALTER TABLE group_chat 
ADD COLUMN add_user_permission ENUM('admin', 'all') DEFAULT 'all';

-- Añadir roles a los miembros
ALTER TABLE group_members 
ADD COLUMN role ENUM('member', 'admin', 'owner') DEFAULT 'member';

-- Migrar a los creadores originales para que sean 'owner'
UPDATE group_members gm 
JOIN group_chat gc ON gm.group_chat_id = gc.id 
SET gm.role = 'owner' 
WHERE gm.member_id = gc.create_by;
