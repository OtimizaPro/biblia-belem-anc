-- Migration 003: Add morphological columns to tokens table
-- Required for N3 syntactic reordering layer (rule-based VSO→SVO)
--
-- POS values: V=verb, N=noun, NP=proper noun, A=adjective, P=preposition,
--             C=conjunction, DET=article, R=pronoun, ADV=adverb, NEG=negation,
--             I=interjection, X=particle

ALTER TABLE tokens ADD COLUMN morph_code TEXT;
ALTER TABLE tokens ADD COLUMN lemma TEXT;
ALTER TABLE tokens ADD COLUMN pos TEXT;

CREATE INDEX IF NOT EXISTS idx_tokens_pos ON tokens(pos);
CREATE INDEX IF NOT EXISTS idx_tokens_verse_pos ON tokens(verse_id, position);
