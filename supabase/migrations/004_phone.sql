-- Ajouter le numéro de téléphone WhatsApp aux praticiens
alter table practitioners add column if not exists phone_whatsapp text;
