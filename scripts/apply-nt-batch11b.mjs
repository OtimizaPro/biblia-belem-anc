#!/usr/bin/env node
/**
 * Batch NT Translation - Lote 11b
 * Aplica traduções literais para palavras gregas freq 1 no NT (parte 2/44)
 * Usa abordagem baseada em arquivo SQL para evitar problemas de encoding no shell
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `batch11b-${Date.now()}.sql`);

const translations = [
  // === Índices 248-495 de freq1-words.json (248 palavras) ===

  // --- Κο- palavras (continuação de Κ-) ---
  ["Κοινωνείτω", "Compartilhe"],
  ["Κολοσσαῖς", "Colossos"],
  ["Κορίνθιοι", "Coríntios"],
  ["Κορβᾶν", "Corbã"],
  ["Κορινθίων", "Coríntios"],
  ["Κορνηλίου", "Cornélio"],
  ["Κούαρτος", "Quarto"],
  ["Κρήσκης", "Crescente"],
  ["Κρήτῃ", "Creta"],
  ["Κρίσπον", "Crispo"],
  ["Κρίσπος", "Crispo"],
  ["Κρανίον", "Crânio"],
  ["Κρατοῦντος", "Segurando"],
  ["Κρινεῖ", "Julgará"],
  ["Κριτής", "Juiz"],
  ["Κριτὴς", "Juiz"],
  ["Κριτῇ", "Juiz"],
  ["Κτίσαντα", "Tendo-criado"],
  ["Κτίστῃ", "Criador"],
  ["Κυπρίῳ", "Cipriota"],
  ["Κυρήνην", "Cirene"],
  ["Κυρηνίου", "Quirínio"],
  ["Κυρηναίων", "Cireneus"],
  ["Κυρηναῖοι", "Cireneus"],
  ["Κυρηναῖος", "Cireneu"],
  ["Κωσὰμ", "Cosã"],
  ["Κόρε", "Coré"],
  ["Κύπριοι", "Cipriotas"],
  ["Κύπριος", "Cipriota"],
  ["Κύπρου", "Chipre"],
  ["Κύριοι", "Senhores"],
  ["Κύριόν", "Senhor"],
  ["Κύων", "Cão"],
  ["Κἀκεῖ", "E-ali"],
  ["Κἀμὲ", "E-a-mim"],
  ["Κῶ", "Cós"],

  // --- Λ- palavras ---
  ["Λάζαρε", "Lázaro"],
  ["Λάμεχ", "Lameque"],
  ["Λέγε", "Dize"],
  ["Λέγετέ", "Dizeis"],
  ["Λέγουσιν", "Dizem"],
  ["Λίνος", "Lino"],
  ["Λαλούντων", "Falando"],
  ["Λαοδικέων", "Laodicenses"],
  ["Λαοδικίας", "Laodiceia"],
  ["Λασαία", "Laseia"],
  ["Λεγιών", "Legião"],
  ["Λεγιὼν", "Legião"],
  ["Λειτουργούντων", "Ministrando"],
  ["Λευείτας", "Levitas"],
  ["Λευειτικῆς", "Levítica"],
  ["Λευεὶ", "Levi"],
  ["Λιβερτίνων", "Libertos"],
  ["Λιβύης", "Líbia"],
  ["Λιθόστρωτον", "Litóstrotos"],
  ["Λιμένας", "Portos"],
  ["Λογίζομαι", "Considero"],
  ["Λοιπόν", "Quanto-ao-resto"],
  ["Λοιπὸν", "Quanto-ao-resto"],
  ["Λυδία", "Lídia"],
  ["Λυδίαν", "Lídia"],
  ["Λυκίας", "Lícia"],
  ["Λυκαονίας", "Licaônia"],
  ["Λυκαονιστὶ", "Em-licaônico"],
  ["Λυσανίου", "Lisânias"],
  ["Λωΐδι", "Loide"],
  ["Λύδδας", "Lida"],

  // --- Μ- palavras ---
  ["Μάλχος", "Malco"],
  ["Μάρθας", "Marta"],
  ["Μάρκος", "Marcos"],
  ["Μάρκου", "Marcos"],
  ["Μή", "Não"],
  ["Μήτηρ", "Mãe"],
  ["Μίλητον", "Mileto"],
  ["Μαγαδάν", "Magadã"],
  ["Μαγδαληνῇ", "Madalena"],
  ["Μαδιάμ", "Midiã"],
  ["Μαθθάν", "Matã"],
  ["Μαθθὰν", "Matã"],
  ["Μαθθὰτ", "Matat"],
  ["Μαθουσαλὰ", "Matusalém"],
  ["Μακάριαι", "Bem-aventuradas"],
  ["Μακάριος", "Bem-aventurado"],
  ["Μακάριόν", "Bem-aventurado"],
  ["Μακαρία", "Bem-aventurada"],
  ["Μακεδονία", "Macedônia"],
  ["Μακεδόνας", "Macedônios"],
  ["Μακεδόνες", "Macedônios"],
  ["Μακεδόνος", "Macedônio"],
  ["Μακεδόσιν", "Macedônios"],
  ["Μακεδών", "Macedônio"],
  ["Μακροθυμήσατε", "Sede-pacientes"],
  ["Μαλελεὴλ", "Maalaleel"],
  ["Μαναήν", "Manaém"],
  ["Μανασσῆς", "Manassés"],
  ["Μαρίαν", "Maria"],
  ["Μαρίᾳ", "Maria"],
  ["Μαριάν", "Maria"],
  ["Μαρτυρεῖ", "Testifica"],
  ["Ματθὰτ", "Matat"],
  ["Ματταθὰ", "Matata"],
  ["Μαὰθ", "Maate"],
  ["Μεγαλύνει", "Engrandece"],
  ["Μεθ'", "Com"],
  ["Μελίτη", "Malta"],
  ["Μελεὰ", "Meleia"],
  ["Μεννὰ", "Mená"],
  ["Μενοῦν", "Antes-pelo-contrário"],
  ["Μεσοποταμίαν", "Mesopotâmia"],
  ["Μεσοποταμίᾳ", "Mesopotâmia"],
  ["Μεσσίαν", "Messias"],
  ["Μεσσίας", "Messias"],
  ["Μετάβα", "Passa-daqui"],
  ["Μετάβηθι", "Passa-daqui"],
  ["Μετανοήσατε", "Arrependei-vos"],
  ["Μετανοῶ", "Arrependo-me"],
  ["Μεῖνον", "Permanece"],
  ["Μηδένα", "Ninguém"],
  ["Μιλήτου", "Mileto"],
  ["Μιλήτῳ", "Mileto"],
  ["Μιτυλήνην", "Mitilene"],
  ["Μιχαὴλ", "Miguel"],
  ["Μνάσωνί", "Mnáson"],
  ["Μνημονεύετε", "Lembrai-vos"],
  ["Μολὸχ", "Moloque"],
  ["Μωρέ", "Tolo"],
  ["Μωσῆς", "Moisés"],
  ["Μωϋσέα", "Moisés"],
  ["Μωϋσῇ", "Moisés"],
  ["Μύρρα", "Mirra"],
  ["Μᾶρκον", "Marcos"],
  ["Μῆδοι", "Medos"],

  // --- Ν- palavras ---
  ["ΝΑΖΩΡΑΙΟΣ", "NAZARENO"],
  ["Νέαν", "Nova"],
  ["Νήψατε", "Sede-sóbrios"],
  ["Νίγερ", "Níger"],
  ["Ναΐν", "Naim"],
  ["Ναασσών", "Naassom"],
  ["Ναγγαὶ", "Nagai"],
  ["Ναζαρά", "Nazaré"],
  ["Ναζαρηνός", "Nazareno"],
  ["Ναζαρηνὸν", "Nazareno"],
  ["Ναζαρὰ", "Nazaré"],
  ["Ναζωραίων", "Nazarenos"],
  ["Ναθὰμ", "Natã"],
  ["Ναιμὰν", "Naamã"],
  ["Ναοὺμ", "Naum"],
  ["Ναρκίσσου", "Narciso"],
  ["Ναχὼρ", "Nacor"],
  ["Ναὶ", "Sim"],
  ["Νεανίσκε", "Jovem"],
  ["Νεκρώσατε", "Mortificai"],
  ["Νηρέα", "Nereu"],
  ["Νηρεὶ", "Neri"],
  ["Νηστείαν", "Jejum"],
  ["Νικάνορα", "Nicanor"],
  ["Νικόλαον", "Nicolau"],
  ["Νικόπολιν", "Nicópolis"],
  ["Νινευείταις", "Ninivitas"],
  ["Νομίζω", "Penso"],
  ["Νύμφαν", "Ninfa"],
  ["Νῦν", "Agora"],

  // --- Ξ- palavras ---
  ["Ξένων", "Estrangeiros"],

  // --- Ο- palavras ---
  ["Οὐδὲν", "Nada"],
  ["Οὐθενός", "Nenhum"],
  ["Οὐκοῦν", "Portanto"],
  ["Οὐρίου", "Urias"],
  ["Οὐρβανὸν", "Urbano"],
  ["Οὐχί", "Não"],
  ["Οὐὰ", "Ah"],
  ["Οὒ", "Não"],
  ["Οὔσης", "Sendo"],
  ["Οὗτοι", "Estes"],

  // --- Π- palavras (Πά-Πέ) ---
  ["Πάγου", "Areópago"],
  ["Πάλαι", "Desde-há-muito"],
  ["Πάντοτε", "Sempre"],
  ["Πάρθοι", "Partos"],
  ["Πάσχα", "Páscoa"],
  ["Πάταρα", "Pátara"],
  ["Πέπεισμαι", "Tenho-sido-persuadido"],
  ["Πέργην", "Perge"],
  ["Πέργης", "Perge"],
  ["Πέργῃ", "Perge"],
  ["Πέσατε", "Caí"],
  ["Πίετε", "Bebei"],
  ["Πίστευέ", "Crê"],
  ["Πίστευσον", "Crê"],

  // --- Π- palavras (Πα-) ---
  ["Παιδός", "Servo"],
  ["Παράγγελλε", "Ordena"],
  ["Παράδεισον", "Paraíso"],
  ["Παρέλαβον", "Recebi"],
  ["Παραγγέλλομεν", "Ordenamos"],
  ["Παραγγέλλω", "Ordeno"],
  ["Παραγγελίᾳ", "Ordem"],
  ["Παραγενόμενοι", "Tendo-chegado"],
  ["Παραδείσῳ", "Paraíso"],
  ["Παραλαβὼν", "Tendo-tomado-consigo"],
  ["Παρασκευή", "Preparação"],
  ["Παρασκευήν", "Preparação"],
  ["Παρασκευὴν", "Preparação"],
  ["Παρασκευῆς", "Preparação"],
  ["Παρεγένετο", "Chegou"],
  ["Παρμενᾶν", "Pármenas"],
  ["Παρῆσαν", "Estavam-presentes"],
  ["Πατρόβαν", "Pátrobas"],
  ["Παῖδά", "Servo"],

  // --- Π- palavras (Πε-) ---
  ["Πείθεσθε", "Obedecei"],
  ["Πειθαρχεῖν", "Obedecer"],
  ["Πεντήκοντα", "Cinquenta"],
  ["Πεπείσμεθα", "Temos-sido-persuadidos"],
  ["Πεπλήρωται", "Tem-sido-cumprido"],
  ["Πεποίθησιν", "Confiança"],
  ["Πεποιθὼς", "Tendo-confiado"],
  ["Περιβαλοῦ", "Veste-te"],
  ["Περιπατῶν", "Andando"],
  ["Περσίδα", "Pérside"],
  ["Πηλὸν", "Lodo"],
  ["Πιστεύετε", "Crede"],
  ["Πλανᾶσθε", "Errais"],

  // --- Π- palavras (Πο-) ---
  ["Ποία", "Qual"],
  ["Ποίας", "Qual"],
  ["Ποίμαινε", "Apascenta"],
  ["Ποιήσατε", "Fazei"],
  ["Ποιήσωμεν", "Façamos"],
  ["Ποιμένα", "Pastor"],
  ["Πολλὰ", "Muitas-coisas"],
  ["Πολυμερῶς", "Em-muitas-partes"],
  ["Πονηρὲ", "Mau"],
  ["Ποντικὸν", "Pôntico"],
  ["Ποπλίου", "Públio"],
  ["Ποπλίῳ", "Públio"],
  ["Πορευομένων", "Indo"],
  ["Πορνεία", "Fornicação"],
  ["Ποταπός", "Que-tipo"],
  ["Ποτιόλους", "Putéolos"],
  ["Πούδης", "Pudente"],
  ["Ποῖα", "Qual"],

  // --- Π- palavras (Πρ-) ---
  ["Πρίσκα", "Prisca"],
  ["Πρίσκιλλαν", "Priscila"],
  ["Πραγματεύσασθε", "Negociai"],
  ["Πραιτώριον", "Pretório"],
  ["Πρεσβυτέρῳ", "Ancião"],
  ["Προάγει", "Precede"],
  ["Προορώμην", "Eu-via-diante-de-mim"],
  ["Προσέφερον", "Traziam"],
  ["Προσδοκῶντος", "Esperando"],
  ["Προσελθόντες", "Tendo-se-aproximado"],
  ["Προσευχόμενοι", "Orando"],
];

let success = 0;
let errors = 0;
let totalUpdated = 0;

console.log(`\n=== Tradução NT - Lote 11b (freq 1, parte 2/44) ===`);
console.log(`Palavras a traduzir: ${translations.length}`);
console.log(`Início: ${new Date().toLocaleString('pt-BR')}\n`);

for (const [word, translation] of translations) {
  try {
    const escapedWord = word.replace(/'/g, "''");
    const escapedTranslation = translation.replace(/'/g, "''");
    const sql = `UPDATE tokens SET pt_literal = '${escapedTranslation}' WHERE text_utf8 = '${escapedWord}' AND pt_literal LIKE '[%]';`;
    writeFileSync(tmpFile, sql, 'utf-8');
    const result = execSync(
      `npx wrangler d1 execute ${DB} --remote --file "${tmpFile}" --json`,
      { encoding: 'utf-8', timeout: 30000 }
    );
    const jsonStart = result.indexOf('[');
    const jsonStr = result.substring(jsonStart);
    const parsed = JSON.parse(jsonStr);
    const changes = parsed[0]?.meta?.changes || 0;
    totalUpdated += changes;
    if (changes > 0) {
      process.stdout.write(`✓ ${word} → ${translation} (${changes})\n`);
    } else {
      process.stdout.write(`· ${word} → ${translation} (0)\n`);
    }
    success++;
  } catch (err) {
    process.stdout.write(`✗ ${word} → ${translation} (ERRO)\n`);
    errors++;
  }
}

try { unlinkSync(tmpFile); } catch {}

console.log(`\n=== Resultado Lote 11b ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);
