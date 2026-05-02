import React from 'react'
import { Document, Page, Text, View, Image } from '@react-pdf/renderer'
import { styles } from './shared/styles'
import {
  formatCurrencyForPdf,
  formatDateForPdf,
  joinAddress,
  paymentMethodLabel,
  invoiceFrequencyLabel,
} from './shared/format'
import type { Contract, ContractMetadata, Profile } from '@/types/supabase'

interface GCDocumentProps {
  contract: Contract
  profile: Profile | null
  language: 'en' | 'fr'
  logoUrl?: string
}

// =============================================================================
// Bilingual content for the General Contractor / Subcontractor agreement.
// Sourced from data/Subcontracting contract.docx and
// data/Contrat de sous-traitance.docx. Section numbering follows the .docx.
// In our schema, the wizard places the GC in the client_* columns and the
// Subcontractor in the contractor_* columns of the contracts table.
// =============================================================================

const t = {
  en: {
    title: 'Subcontract Agreement',
    intro: (date: string) =>
      `This Subcontract Agreement is entered into on ${date} under the laws of the Province of Quebec by and between:`,
    gcHeading: 'General Contractor',
    subHeading: 'Subcontractor',
    rbq: 'RBQ Licence No.',
    purpose:
      'The purpose of this Agreement is to set forth the terms and conditions under which the Subcontractor will provide services to the General Contractor. This Agreement outlines the scope of services, the responsibilities of each Party, the compensation payable, and other terms pertinent to the contractual relationship established herein.',
    s1Title: '1. Definitions',
    s1Body: [
      '"Agreement" means this subcontract agreement, including all appendices and duly executed amendments.',
      '"CNESST" means the Commission des normes, de l\'équité, de la santé et de la sécurité du travail.',
      '"Contract Price" means the total amount payable by the General Contractor to the Subcontractor under this Agreement, namely the amount stated in the Payment Terms section below, plus applicable taxes.',
      '"Denunciation Notice" means the notice issued under article 2728 C.C.Q. for purposes of preserving a legal hypothec.',
      '"General Contractor" refers to the person or entity having entered into a primary agreement with the Owner to execute the overall construction project.',
      '"Holdback" is the portion of payment withheld under article 2111 of the Civil Code of Québec.',
      '"Owner" refers to the owner of the immovable on which the Work is being performed.',
      '"Project" means the construction project described in this Agreement.',
      '"RBQ" means the Régie du bâtiment du Québec.',
      '"Site" or "Project Site" means the location where the Work is to be performed, as identified in the Project section below.',
      '"Subcontractor" means the person or entity retained by the General Contractor to perform a portion of the construction work.',
      '"Work" refers to the labour, materials, and services to be provided by the Subcontractor as described in Section 4.',
    ],
    s2Title: '2. Independent Contractor Status',
    s2Body:
      'The Subcontractor is an independent contractor. Nothing in this Agreement shall be construed to create an employment relationship, joint venture, or partnership between the parties. The Subcontractor is solely responsible for its employees, taxes, permits, insurances, CNESST registration, RBQ licence, and all regulatory compliance.',
    s3Title: '3. Governing Law',
    s3Body:
      'This Agreement shall be governed by and construed in accordance with the laws of the Province of Quebec and the Civil Code of Québec ("C.C.Q."). The parties irrevocably attorn to the jurisdiction of the courts in the judicial district where the Project Site is located.',
    s4Title: '4. Scope of Work',
    s4Body: (provider: string, scope: string) =>
      `${provider} The Subcontractor shall perform the Work at the Project Site in accordance with applicable laws, codes, and best industry practices. Scope of the Work: ${scope}`,
    s4ProviderContractor:
      'The Subcontractor shall provide all labour, materials, and equipment required to complete the Work.',
    s4ProviderClient:
      'The General Contractor shall provide all materials and equipment related to the Work, and the Subcontractor shall provide all labour required to complete the Work.',
    s4ProviderShared:
      'The General Contractor and the Subcontractor shall share responsibility for materials and equipment, as detailed in Schedule A or as agreed in writing.',
    s5Title: '5. Flow-Down Obligation',
    s5Body:
      'The Subcontractor acknowledges that the General Contractor has entered into a prime contract (the "Prime Contract") with the Owner for the Project. To the extent applicable to the Work, the Subcontractor agrees: (a) to comply with the provisions of the Prime Contract that relate to the Work, as communicated or made available to the Subcontractor; (b) to assume toward the General Contractor, with respect to the Work, the obligations that the General Contractor assumes toward the Owner, to the extent reasonably within the Subcontractor\'s control; and (c) to perform the Work consistent with the schedule, plans, specifications, and general conditions of the Prime Contract that relate to the Work. In the event of any inconsistency between this Agreement and the Prime Contract, this Agreement shall prevail as between the General Contractor and the Subcontractor, unless the parties expressly agree in writing to apply a specific provision of the Prime Contract. The General Contractor shall, on request, provide the relevant portions of the Prime Contract.',
    s6Title: '6. Plans and Specifications',
    s6Body:
      'The Subcontractor shall perform the Work in strict compliance with all project plans and specifications provided by the General Contractor. Any deviation must be approved in writing by the General Contractor pursuant to Section 12 (Change Orders).',
    s7Title: '7. Permits and Compliance',
    s7Body:
      'The Subcontractor shall obtain all permits, approvals, licences, and certificates required to perform the Work. The Subcontractor shall comply with all applicable laws, codes, regulations, and safety standards, including CNESST and RBQ requirements.',
    s8Title: '8. Commencement and Completion',
    s8Body:
      'The Subcontractor shall begin the Work on the Commencement Date and complete the Work by the Completion Date set out below. Delays must be communicated to the General Contractor in writing at least fifteen (15) days in advance. Time is of the essence. If the Subcontractor is delayed by circumstances beyond its reasonable control (including delays attributable to the Owner, other trades, or coordination issues), it shall be entitled to a reasonable extension of time, provided it gives written notice as soon as reasonably possible.',
    s9Title: '9. Payment Terms',
    s9Body: (method: string) =>
      `The General Contractor shall pay the Subcontractor the Contract Price set out below by ${method || 'the agreed method'}, plus applicable taxes. Unless otherwise agreed in writing, invoices are due within five (5) days of receipt. Late payments shall bear interest at the rate set out below, calculated monthly in arrears, until full payment is received.`,
    s9Holdback: (pct: number) =>
      `Each payment is subject to a ${pct}% statutory holdback retained under article 2111 C.C.Q. The holdback shall be released thirty (30) days after substantial completion of the Work, provided no deficiencies have been reported by the General Contractor.`,
    s10Title: '10. Price Escalation',
    s10Body: (pct: number) =>
      `If, after the execution of this Agreement, the market price of materials required to perform the Work increases by more than ${pct}% compared to the quoted price on the date of this Agreement, the Subcontractor may request a price adjustment supported by documentary evidence. The parties shall negotiate in good faith an equitable adjustment to the Contract Price within fifteen (15) days. No adjustment shall apply to changes in scope, which are governed by Section 12.`,
    s11Title: '11. Recovery Costs and Penalty',
    s11Body:
      'In the event any amount payable by the General Contractor remains unpaid after its due date, and the Subcontractor is required to retain legal counsel or a collection agency, the General Contractor shall pay, as a penalty clause within the meaning of the Civil Code of Québec, an amount equal to twenty-five percent (25%) of the unpaid principal and accrued interest. This penalty is in addition to interest provided under this Agreement and any legal costs awarded.',
    s12Title: '12. Change Orders',
    s12Body:
      'Any modification to the Work or its scope shall be documented through a written Change Order signed by both parties, with clear cost and timeline implications. The receiving party shall have five (5) business days to accept, reject or amend the request, failing which it shall be deemed rejected. No change shall commence until a fully executed Change Order is in place.',
    s13Title: '13. Warranty',
    s13Body: (months: number) =>
      `The Subcontractor warrants the Work for a period of ${months} months from the date of completion against defects in materials and workmanship. The warranty does not cover damage caused by misuse, neglect, or external forces. The General Contractor shall notify the Subcontractor in writing of any deficiency, and the Subcontractor shall begin corrective measures within ten (10) business days. This warranty is in addition to and does not limit any legal warranty obligations under the C.C.Q.`,
    s14Title: '14. Insurance and Performance Bond',
    s14Insurance: (amount: number) =>
      `The Subcontractor shall maintain, at its own expense, commercial general liability insurance with a minimum coverage of $${amount.toLocaleString('en-CA')} CAD, workers' compensation insurance with the CNESST, and any other coverage required by law. The General Contractor (and, if requested, the Owner) shall be named as additional insured with respect to liability arising out of the Work. Coverage for completed operations shall extend not less than twenty-four (24) months following completion. Certificates shall be provided on request prior to commencement.`,
    s14Bond: (pct: number) =>
      `The Subcontractor shall, on request, provide a performance bond in favour of the General Contractor equal to ${pct}% of the Contract Price, issued by a surety licensed to operate in Quebec, in a form acceptable to the General Contractor. The cost of the bond shall be borne by the Subcontractor unless otherwise agreed in writing.`,
    s15Title: '15. Site Security',
    s15Body:
      'Unless otherwise agreed in writing, the General Contractor is responsible for general site security, including fencing, locks, and surveillance. The Subcontractor remains responsible for safeguarding its tools, equipment, and materials but not for losses caused by the General Contractor\'s failure to secure the site.',
    s16Title: '16. Denunciation Notice (Legal Hypothec)',
    s16Body:
      'If the Subcontractor wishes to preserve the right to a legal hypothec on the immovable, it must send a Denunciation Notice to the Owner in accordance with article 2728 C.C.Q. The General Contractor shall, upon request, provide a copy of the Prime Contract for this purpose.',
    s17Title: '17. Force Majeure',
    s17Body:
      'Delays due to superior force (force majeure) as defined in article 1470 C.C.Q., including acts of God, labour strikes, natural disasters, public health emergencies, pandemics, or government orders, shall excuse performance during the period of delay. The affected party must notify the other within forty-eight (48) hours. The parties shall act in good faith to revise the schedule, scope, or pricing.',
    s18Title: '18. Termination',
    s18Body:
      'Either party may terminate this Agreement upon written notice in the event of a material breach that remains uncured for ten (10) business days, except in cases of fraud or insolvency, in which case termination takes effect immediately. Upon termination, the Subcontractor shall be paid for all Work completed to date.',
    s18StepIn:
      'Step-in rights: If the Subcontractor fails to supply qualified labour, fails to maintain reasonable progress, fails to correct defective Work within the cure period, or fails to comply with health and safety obligations, and such default is not remedied within five (5) Business Days following written notice, the General Contractor may supplement the workforce, procure materials directly, or engage third parties to complete the affected Work, with all reasonable documented costs deductible from amounts otherwise payable.',
    s18Convenience:
      'Termination for convenience: Either party may terminate for convenience by providing thirty (30) days written notice. The Subcontractor shall be compensated for all Work performed up to the termination date.',
    s19Title: '19. Confidentiality and Data Protection',
    s19Body:
      'The parties agree to maintain in confidence any proprietary, sensitive, or personal information obtained from each other and shall implement appropriate technical and organizational measures to protect such information. The parties shall comply with applicable data protection laws. In the event of a data breach, the affected party shall notify the other within forty-eight (48) hours. Upon termination, each party shall return or securely destroy all confidential information received.',
    s20Title: '20. Dispute Resolution',
    s20Body:
      'In the event of a dispute, the parties shall first attempt resolution through direct negotiation within thirty (30) days. If unresolved, the parties shall submit to mediation by an accredited Quebec mediator selected by mutual agreement within fifteen (15) days. Mediation shall conclude within sixty (60) days, with costs shared equally. Should mediation fail, either party may proceed to litigation in the judicial district where the Project Site is located.',
    s21Title: '21. Health and Safety',
    s21Body:
      'The Subcontractor shall comply with all health and safety regulations applicable under Quebec law and CNESST standards, ensure a safe working environment, and report any incident within twenty-four (24) hours. The Subcontractor may suspend the affected portion of the Work where the General Contractor fails to address an immediate safety risk within forty-eight (48) hours of written notice.',
    s22Title: '22. Indemnification',
    s22Body:
      'Each party agrees to indemnify and hold harmless the other party against claims, damages, losses, and expenses directly resulting from the indemnifying party\'s fault or negligence in performing its obligations under this Agreement, including bodily injury, sickness, death, or property damage, except to the extent covered by a government-administered insurance scheme such as the CNESST. This indemnity is subject to articles 1474 and 1475 C.C.Q. The Subcontractor\'s liability shall not exceed the Contract Price, except in cases of gross negligence or willful misconduct. The indemnification obligations survive termination.',
    s23Title: '23. Sub-Subcontracting',
    s23Body:
      'The Subcontractor may not further subcontract any portion of the Work without the prior written consent of the General Contractor, which shall not be unreasonably withheld. The Subcontractor shall remain fully responsible for all Work, including portions performed by sub-subcontractors. The Subcontractor shall ensure all suppliers and lower-tier subcontractors are paid in full and on time, and shall discharge any legal hypothec registered against the Owner\'s property within ten (10) business days.',
    s24Title: '24. Acceptance and Deficiency Correction',
    s24Body: (inspectionDays: number) =>
      `The Work shall be considered accepted upon inspection by the General Contractor and written confirmation of acceptance, or upon the absence of any deficiency report within ${inspectionDays} days of completion provided the Subcontractor has given written notice of completion. If deficiencies are discovered, the Subcontractor shall correct them within ten (10) business days at no additional cost. Failure to do so permits the General Contractor to rectify the issue and deduct reasonable costs from amounts owed.`,
    s24BodySuspension: (
      adjustDays: number,
      terminateDays: number,
      resumeDays: number
    ) =>
      `In the event of work suspension: the Subcontractor may request an adjustment to the schedule or contract price after ${adjustDays} day(s) of suspension; may terminate this Agreement after ${terminateDays} day(s) of continuous suspension; and shall submit any retroactive adjustment claim within ${resumeDays} day(s) of work resumption.`,
    s25Title: '25. Intellectual Property',
    s25Body:
      'All intellectual property rights in designs, plans, drawings, and other materials created by the Subcontractor (the "Work Product") shall be assigned to the General Contractor (and, where applicable under the Prime Contract, to the Owner) upon payment in full, subject to moral rights which cannot be assigned under Quebec law. Until full payment, the Subcontractor grants a non-exclusive, perpetual, royalty-free licence to use the Work Product for any purpose related to the Project. The Subcontractor warrants that the Work Product does not infringe any third-party rights.',
    s26Title: '26. Notices',
    s26Body:
      'All notices shall be given in writing and delivered by personal delivery, email, or registered mail to the addresses indicated above. Notices delivered by hand or email are deemed received on the date of transmission (or the next Business Day if after 4:30 PM). Notices delivered by registered mail are deemed received on the next Business Day following delivery.',
    s27Title: '27. General Provisions',
    s27Body:
      'No waiver of any breach shall constitute a waiver of any other breach; all waivers must be in writing. If any provision is held invalid, the remainder shall remain in full force. This Agreement may be executed in counterparts and signed electronically, with electronic signatures having the same force as original signatures. This Agreement, including its appendices, represents the entire agreement and supersedes all prior discussions. Provisions relating to indemnification, confidentiality, payment obligations, dispute resolution, warranty, insurance, and intellectual property shall survive termination.',
    s28Title: '28. Additional Provisions',
    s28Default: 'N/A',
    signatureTitle: 'Signatures',
    gcSig: 'General Contractor',
    subSig: 'Subcontractor',
    perLabel: 'Per:',
    nameLabel: 'Printed Name',
    titleLabel: 'Title',
    dateLabel: 'Date',
    acknowledgment:
      'Each Party acknowledges having read and understood the terms and obligations set out in this Agreement and agrees to be legally bound thereby.',
    footerCreated: 'Created by ConstrAction Inc.',
    disclaimer:
      'ConstrAction Inc. provides automated document generation tools and does not offer legal advice, legal opinions, or legal representation.',
    parties: 'Parties',
    project: 'Project',
    projectSite: 'Project Site',
    scopeOfWork: 'Scope of Work',
    dates: 'Dates',
    commencementDate: 'Commencement Date',
    completionDate: 'Estimated Completion Date',
    signingDate: 'Date of Signing',
    paymentTerms: 'Payment Terms',
    paymentMethod: 'Payment Method',
    lateInterest: 'Late Payment Interest Rate',
    lateInterestSuffix: '% per annum',
    materialProvider: 'Material Provider',
    materialProviderValues: {
      contractor: 'Subcontractor',
      client: 'General Contractor',
      shared: 'Shared between parties',
    },
    gstLabel: 'GST (TPS) 5%',
    qstLabel: 'QST (TVQ) 9.975%',
    totalLabel: 'Total (incl. taxes)',
    subtotalLabel: 'Subtotal',
  },
  fr: {
    title: 'Contrat de sous-traitance',
    intro: (date: string) =>
      `Le présent contrat de sous-traitance est conclu le ${date} en vertu des lois de la province de Québec par et entre :`,
    gcHeading: 'Entrepreneur général',
    subHeading: 'Sous-traitant',
    rbq: 'No. de licence RBQ',
    purpose:
      "Le présent Contrat a pour objet de définir les conditions dans lesquelles le Sous-traitant fournira des services à l'Entrepreneur général. Le présent Contrat décrit l'étendue des services à fournir, les responsabilités de chaque partie, la rémunération à verser et les autres conditions relatives à la relation contractuelle établie par le présent Contrat.",
    s1Title: '1. Définitions',
    s1Body: [
      "« Contrat » désigne le présent contrat de sous-traitance, y compris toutes les annexes et tous les amendements dûment signés.",
      "« CNESST » désigne la Commission des normes, de l'équité, de la santé et de la sécurité du travail.",
      "« Prix du contrat » désigne le montant total payable par l'Entrepreneur général au Sous-traitant en vertu du présent Contrat, soit le montant indiqué dans la section Modalités de paiement, plus les taxes applicables.",
      "« Avis de dénonciation » désigne l'avis émis en vertu de l'article 2728 C.c.Q. aux fins de conservation d'une hypothèque légale.",
      "« Entrepreneur général » désigne la personne ou l'entité ayant conclu un contrat principal avec le Propriétaire pour exécuter l'ensemble du projet de construction.",
      "« Retenue » désigne la partie du paiement retenue en vertu de l'article 2111 du Code civil du Québec.",
      "« Propriétaire » désigne le propriétaire de l'immeuble sur lequel les Travaux sont exécutés.",
      "« Projet » désigne le projet de construction décrit dans le présent Contrat.",
      "« RBQ » désigne la Régie du bâtiment du Québec.",
      "« Site » ou « Site du Projet » désigne l'endroit où les Travaux doivent être exécutés, identifié à la section Projet ci-dessous.",
      "« Sous-traitant » désigne la personne ou l'entité retenue par l'Entrepreneur général pour exécuter une partie des travaux de construction.",
      "« Travaux » désignent la main-d'œuvre, les matériaux et les services devant être fournis par le Sous-traitant, tels que décrits à l'article 4.",
    ],
    s2Title: "2. Statut d'entrepreneur indépendant",
    s2Body:
      "Le Sous-traitant est un entrepreneur indépendant. Aucune disposition du présent Contrat ne doit être interprétée comme créant une relation d'emploi, une coentreprise ou un partenariat entre les parties. Le Sous-traitant est seul responsable de ses employés, de ses taxes, de ses permis, de ses assurances, de son inscription à la CNESST, de sa licence de la RBQ et de toute conformité réglementaire.",
    s3Title: '3. Droit applicable',
    s3Body:
      "Le présent Contrat est régi et interprété conformément aux lois de la province de Québec et au Code civil du Québec (« C.c.Q. »). Les parties reconnaissent irrévocablement la compétence des tribunaux du district judiciaire où se trouve le Site du Projet.",
    s4Title: '4. Étendue des Travaux',
    s4Body: (provider: string, scope: string) =>
      `${provider} Le Sous-traitant exécutera les Travaux sur le Site du Projet conformément aux lois, aux codes et aux meilleures pratiques de l'industrie. Description des Travaux : ${scope}`,
    s4ProviderContractor:
      "Le Sous-traitant fournira la main-d'œuvre, les matériaux et l'équipement nécessaires à l'exécution des Travaux.",
    s4ProviderClient:
      "L'Entrepreneur général fournira tous les matériaux et l'équipement nécessaires aux Travaux, et le Sous-traitant fournira la main-d'œuvre nécessaire à l'exécution des Travaux.",
    s4ProviderShared:
      "L'Entrepreneur général et le Sous-traitant partageront la responsabilité des matériaux et de l'équipement, tel que détaillé à l'Annexe A ou tel que convenu par écrit.",
    s5Title: '5. Obligations transmises (Flow-Down)',
    s5Body:
      "Le Sous-traitant reconnaît que l'Entrepreneur général a conclu un contrat principal (le « Contrat principal ») avec le Propriétaire pour le Projet. Dans la mesure applicable aux Travaux, le Sous-traitant convient : (a) de se conformer aux dispositions du Contrat principal qui se rapportent aux Travaux, telles que communiquées ou mises à sa disposition; (b) d'assumer envers l'Entrepreneur général, à l'égard des Travaux, les obligations que l'Entrepreneur général assume envers le Propriétaire, dans la mesure où elles sont raisonnablement sous le contrôle du Sous-traitant; et (c) d'exécuter les Travaux de manière conforme au calendrier, aux plans, aux spécifications et aux conditions générales du Contrat principal qui se rapportent aux Travaux. En cas d'incompatibilité entre le présent Contrat et le Contrat principal, le présent Contrat prévaut entre l'Entrepreneur général et le Sous-traitant, sauf entente écrite contraire. L'Entrepreneur général fournira, sur demande, les portions pertinentes du Contrat principal.",
    s6Title: '6. Plans et spécifications',
    s6Body:
      "Le Sous-traitant exécutera les Travaux en se conformant strictement à tous les plans et spécifications fournis par l'Entrepreneur général. Toute dérogation doit être approuvée par écrit par l'Entrepreneur général conformément à l'article 12 (Ordres de modification).",
    s7Title: '7. Permis et conformité',
    s7Body:
      "Le Sous-traitant doit obtenir tous les permis, approbations, licences et certificats nécessaires à l'exécution des Travaux. Le Sous-traitant doit se conformer à toutes les lois, à tous les codes, règlements et normes de sécurité applicables, y compris les exigences de la CNESST et de la RBQ.",
    s8Title: '8. Début et achèvement des Travaux',
    s8Body:
      "Le Sous-traitant commencera les Travaux à la Date de début et les terminera au plus tard à la Date d'achèvement indiquée ci-dessous. Les retards doivent être communiqués par écrit à l'Entrepreneur général au moins quinze (15) jours à l'avance. Le temps est un facteur essentiel. Si le Sous-traitant est retardé par des circonstances indépendantes de sa volonté (y compris les retards attribuables au Propriétaire, à d'autres corps de métier ou à des problèmes de coordination), il a droit à une prolongation raisonnable du délai, à condition de donner un avis écrit dès que raisonnablement possible.",
    s9Title: '9. Conditions de paiement',
    s9Body: (method: string) =>
      `L'Entrepreneur général paiera au Sous-traitant le Prix du contrat indiqué ci-dessous par ${method || 'le mode convenu'}, plus les taxes applicables. Sauf entente écrite contraire, les factures sont payables dans les cinq (5) jours suivant leur réception. Les paiements en retard porteront intérêt au taux indiqué ci-dessous, calculé mensuellement, jusqu'au paiement intégral.`,
    s9Holdback: (pct: number) =>
      `Chaque paiement est sous réserve d'une retenue statutaire de ${pct} % conservée en vertu de l'article 2111 C.c.Q. La retenue sera libérée trente (30) jours après la réception substantielle des Travaux, à condition qu'aucune déficience n'ait été signalée par l'Entrepreneur général.`,
    s10Title: '10. Escalade des prix',
    s10Body: (pct: number) =>
      `Si, après la signature du présent Contrat, le prix du marché des matériaux nécessaires à l'exécution des Travaux augmente de plus de ${pct} % par rapport au prix indiqué à la date du présent Contrat, le Sous-traitant peut demander un ajustement de prix appuyé par des preuves documentaires. Les parties négocieront de bonne foi un ajustement équitable au Prix du contrat dans les quinze (15) jours. Aucun ajustement ne s'applique aux changements de portée, qui sont régis par l'article 12.`,
    s11Title: '11. Frais de recouvrement et pénalité',
    s11Body:
      "Si un montant payable par l'Entrepreneur général demeure impayé après son échéance et que le Sous-traitant doit retenir un avocat ou une agence de recouvrement, l'Entrepreneur général paiera, à titre de clause pénale au sens du Code civil du Québec, un montant équivalant à vingt-cinq pour cent (25 %) du capital impayé et des intérêts accumulés. Cette pénalité s'ajoute aux intérêts prévus au présent Contrat et à tous les frais de justice accordés.",
    s12Title: '12. Ordres de modification',
    s12Body:
      "Toute modification aux Travaux ou à leur portée doit être documentée par un Ordre de modification écrit signé par les deux parties, indiquant clairement les implications sur les coûts et le calendrier. La partie réceptrice dispose de cinq (5) jours ouvrables pour accepter, refuser ou modifier la demande, à défaut de quoi elle est réputée refusée. Aucun changement ne commence avant qu'un Ordre de modification dûment signé ne soit en place.",
    s13Title: '13. Garantie',
    s13Body: (months: number) =>
      `Le Sous-traitant garantit les Travaux pour une période de ${months} mois à compter de la date de réception substantielle, contre les défauts de matériaux et de main-d'œuvre. La garantie ne couvre pas les dommages causés par une mauvaise utilisation, la négligence ou des forces externes. L'Entrepreneur général doit aviser le Sous-traitant par écrit de toute déficience, et le Sous-traitant doit commencer les mesures correctives dans les dix (10) jours ouvrables. Cette garantie s'ajoute aux obligations légales de garantie prévues par le C.c.Q. et ne les limite pas.`,
    s14Title: '14. Assurances et cautionnement',
    s14Insurance: (amount: number) =>
      `Le Sous-traitant maintiendra, à ses frais, une assurance responsabilité civile commerciale avec une couverture minimale de ${amount.toLocaleString('fr-CA')} $ CA, une assurance contre les accidents du travail auprès de la CNESST, et toute autre couverture exigée par la loi. L'Entrepreneur général (et, sur demande, le Propriétaire) sera désigné comme assuré additionnel à l'égard de la responsabilité découlant des Travaux. La couverture pour les opérations terminées s'étendra sur au moins vingt-quatre (24) mois suivant l'achèvement. Les certificats seront fournis sur demande avant le début.`,
    s14Bond: (pct: number) =>
      `Le Sous-traitant fournira, sur demande, un cautionnement d'exécution en faveur de l'Entrepreneur général équivalant à ${pct} % du Prix du contrat, émis par une caution autorisée à exercer au Québec, sous une forme acceptable à l'Entrepreneur général. Le coût du cautionnement sera assumé par le Sous-traitant sauf entente écrite contraire.`,
    s15Title: '15. Sécurité du chantier',
    s15Body:
      "Sauf entente écrite contraire, l'Entrepreneur général est responsable de la sécurité générale du chantier, y compris les clôtures, les serrures et la surveillance. Le Sous-traitant demeure responsable de la protection de ses outils, de son équipement et de ses matériaux, mais non des pertes causées par le défaut de l'Entrepreneur général de sécuriser le chantier.",
    s16Title: '16. Avis de dénonciation (hypothèque légale)',
    s16Body:
      "Si le Sous-traitant souhaite préserver le droit à une hypothèque légale sur l'immeuble, il doit envoyer un Avis de dénonciation au Propriétaire conformément à l'article 2728 C.c.Q. L'Entrepreneur général fournira, sur demande, une copie du Contrat principal à cette fin.",
    s17Title: '17. Force majeure',
    s17Body:
      "Les retards dus à un cas de force majeure tel que défini à l'article 1470 C.c.Q., y compris les catastrophes naturelles, les grèves, les urgences sanitaires, les pandémies ou les ordres gouvernementaux, excusent l'exécution pendant la période de retard. La partie touchée doit aviser l'autre dans les quarante-huit (48) heures. Les parties agiront de bonne foi pour réviser le calendrier, la portée ou le prix.",
    s18Title: '18. Résiliation',
    s18Body:
      "L'une ou l'autre des parties peut résilier le présent Contrat sur préavis écrit en cas de manquement substantiel non corrigé dans les dix (10) jours ouvrables, sauf en cas de fraude ou d'insolvabilité, auquel cas la résiliation prend effet immédiatement. À la résiliation, le Sous-traitant sera payé pour tous les Travaux exécutés à ce jour.",
    s18StepIn:
      "Droits d'intervention : Si le Sous-traitant ne fournit pas une main-d'œuvre qualifiée, ne maintient pas un progrès raisonnable, ne corrige pas les Travaux défectueux dans le délai de remédiation, ou ne respecte pas les obligations de santé et sécurité, et que ce manquement n'est pas corrigé dans les cinq (5) jours ouvrables suivant l'avis écrit, l'Entrepreneur général peut compléter la main-d'œuvre, se procurer des matériaux directement, ou retenir des tiers pour terminer les Travaux affectés, tous les coûts raisonnables documentés étant déductibles des montants autrement payables.",
    s18Convenience:
      "Résiliation pour convenance : L'une ou l'autre des parties peut résilier pour convenance moyennant un préavis écrit de trente (30) jours. Le Sous-traitant sera rémunéré pour tous les Travaux exécutés jusqu'à la date de résiliation.",
    s19Title: '19. Confidentialité et protection des données',
    s19Body:
      "Les parties conviennent de garder confidentielle toute information exclusive, sensible ou personnelle obtenue l'une de l'autre et mettront en œuvre des mesures techniques et organisationnelles appropriées pour protéger ces informations. Les parties se conformeront aux lois applicables sur la protection des données. En cas de violation de données, la partie touchée avisera l'autre dans les quarante-huit (48) heures. À la résiliation, chaque partie retournera ou détruira de manière sécurisée toutes les informations confidentielles reçues.",
    s20Title: '20. Résolution des différends',
    s20Body:
      "En cas de différend, les parties tenteront d'abord une résolution par négociation directe dans les trente (30) jours. Si non résolu, les parties soumettront le différend à la médiation par un médiateur québécois accrédité choisi par accord mutuel dans les quinze (15) jours. La médiation se conclura dans les soixante (60) jours, les coûts étant partagés également. Si la médiation échoue, l'une ou l'autre des parties peut entamer une procédure judiciaire dans le district où se trouve le Site du Projet.",
    s21Title: '21. Santé et sécurité',
    s21Body:
      "Le Sous-traitant se conformera à toutes les réglementations en matière de santé et de sécurité applicables en vertu du droit québécois et des normes de la CNESST, assurera un environnement de travail sécuritaire et signalera tout incident dans les vingt-quatre (24) heures. Le Sous-traitant peut suspendre la portion affectée des Travaux si l'Entrepreneur général ne corrige pas un risque de sécurité immédiat dans les quarante-huit (48) heures suivant l'avis écrit.",
    s22Title: '22. Indemnisation',
    s22Body:
      "Chaque partie s'engage à indemniser et à dégager de toute responsabilité l'autre partie contre les réclamations, dommages, pertes et dépenses résultant directement de la faute ou de la négligence de la partie indemnisante dans l'exécution de ses obligations en vertu du présent Contrat, y compris les blessures corporelles, la maladie, le décès ou les dommages matériels, sauf dans la mesure couverte par un régime d'assurance gouvernemental tel que la CNESST. Cette indemnité est sujette aux articles 1474 et 1475 C.c.Q. La responsabilité du Sous-traitant ne dépassera pas le Prix du contrat, sauf en cas de négligence grave ou de faute lourde. Les obligations d'indemnisation survivent à la résiliation.",
    s23Title: '23. Sous-sous-traitance',
    s23Body:
      "Le Sous-traitant ne peut sous-traiter davantage aucune partie des Travaux sans le consentement écrit préalable de l'Entrepreneur général, lequel ne sera pas refusé sans motif raisonnable. Le Sous-traitant demeure entièrement responsable de tous les Travaux, y compris ceux exécutés par les sous-sous-traitants. Le Sous-traitant s'assurera que tous les fournisseurs et sous-traitants de niveau inférieur sont payés intégralement et à temps, et fera radier toute hypothèque légale inscrite contre la propriété du Propriétaire dans les dix (10) jours ouvrables.",
    s24Title: '24. Acceptation et correction des déficiences',
    s24BodySuspension: (
      adjustDays: number,
      terminateDays: number,
      resumeDays: number
    ) =>
      `En cas de suspension des travaux : le Sous-traitant peut demander un ajustement du calendrier ou du prix du contrat après ${adjustDays} jour(s) de suspension ; peut résilier le présent Contrat après ${terminateDays} jour(s) de suspension continue ; et doit soumettre toute demande d'ajustement rétroactif dans les ${resumeDays} jour(s) suivant la reprise des travaux.`,
    s24Body: (inspectionDays: number) =>
      `Les Travaux seront considérés comme acceptés sur inspection par l'Entrepreneur général et confirmation écrite, ou en l'absence de tout rapport de déficience dans les ${inspectionDays} jours suivant l'achèvement, à condition que le Sous-traitant ait donné un avis écrit d'achèvement. Si des déficiences sont découvertes, le Sous-traitant les corrigera dans les dix (10) jours ouvrables sans coût supplémentaire. À défaut, l'Entrepreneur général peut rectifier le problème et déduire les coûts raisonnables des montants dus.`,
    s25Title: '25. Propriété intellectuelle',
    s25Body:
      "Tous les droits de propriété intellectuelle dans les conceptions, plans, dessins et autres documents créés par le Sous-traitant (le « Produit du travail ») seront cédés à l'Entrepreneur général (et, le cas échéant en vertu du Contrat principal, au Propriétaire) lors du paiement intégral, sous réserve des droits moraux qui ne peuvent être cédés en vertu du droit québécois. Jusqu'au paiement intégral, le Sous-traitant accorde une licence non exclusive, perpétuelle et libre de redevances pour utiliser le Produit du travail à toute fin liée au Projet. Le Sous-traitant garantit que le Produit du travail ne porte pas atteinte aux droits de tiers.",
    s26Title: '26. Avis',
    s26Body:
      "Tous les avis seront donnés par écrit et livrés en personne, par courriel ou par courrier recommandé aux adresses indiquées ci-dessus. Les avis livrés en mains propres ou par courriel sont réputés reçus à la date de transmission (ou le jour ouvrable suivant si après 16 h 30). Les avis livrés par courrier recommandé sont réputés reçus le jour ouvrable suivant la livraison.",
    s27Title: '27. Dispositions générales',
    s27Body:
      "Aucune renonciation à un manquement ne constitue une renonciation à un autre manquement; toutes les renonciations doivent être écrites. Si une disposition est jugée invalide, le reste demeure en vigueur. Le présent Contrat peut être signé en exemplaires et électroniquement, les signatures électroniques ayant la même force que les signatures originales. Le présent Contrat, y compris ses annexes, représente l'entente complète et remplace toutes les discussions antérieures. Les dispositions relatives à l'indemnisation, à la confidentialité, aux obligations de paiement, à la résolution des différends, à la garantie, aux assurances et à la propriété intellectuelle survivent à la résiliation.",
    s28Title: '28. Dispositions additionnelles',
    s28Default: 'S/O',
    signatureTitle: 'Signatures',
    gcSig: 'Entrepreneur général',
    subSig: 'Sous-traitant',
    perLabel: 'Par :',
    nameLabel: 'Nom en lettres moulées',
    titleLabel: 'Titre',
    dateLabel: 'Date',
    acknowledgment:
      "Chaque Partie reconnaît avoir lu et compris les modalités et obligations énoncées dans le présent Contrat et accepte d'être légalement liée par celles-ci.",
    footerCreated: 'Créé par ConstrAction Inc.',
    disclaimer:
      "ConstrAction inc. fournit des outils de génération automatisée de documents et n'offre pas de conseils juridiques, d'opinions juridiques ni de représentation légale.",
    parties: 'Parties',
    project: 'Projet',
    projectSite: 'Lieu des travaux',
    scopeOfWork: 'Description des travaux',
    dates: 'Dates',
    commencementDate: 'Date de début',
    completionDate: "Date d'achèvement estimée",
    signingDate: 'Date de signature',
    paymentTerms: 'Modalités de paiement',
    paymentMethod: 'Mode de paiement',
    lateInterest: "Taux d'intérêt en cas de retard",
    lateInterestSuffix: '% par année',
    materialProvider: 'Fournisseur de matériaux',
    materialProviderValues: {
      contractor: 'Sous-traitant',
      client: 'Entrepreneur général',
      shared: 'Partagé entre les parties',
    },
    gstLabel: 'TPS (GST) 5 %',
    qstLabel: 'TVQ (QST) 9,975 %',
    totalLabel: 'Total (taxes incluses)',
    subtotalLabel: 'Sous-total',
  },
} as const

export function GCDocument({
  contract,
  profile: _profile,
  language,
  logoUrl,
}: GCDocumentProps) {
  const tr = t[language]
  const meta =
    (contract.metadata as ContractMetadata | null) ?? ({} as ContractMetadata)

  // Wizard places the General Contractor in the client_* columns and the
  // Subcontractor in the contractor_* columns of the contracts table.
  const gcAddress = joinAddress([
    contract.client_address,
    contract.client_city,
    contract.client_postal,
  ])
  const subAddress = joinAddress([
    contract.contractor_address,
    contract.contractor_city,
    contract.contractor_postal,
  ])
  const projectAddress = joinAddress([
    contract.project_site,
    contract.project_city,
    contract.project_postal,
  ])

  const price = Number(contract.contract_price ?? 0)
  const gst = Math.round(price * 0.05 * 100) / 100
  const qst = Math.round(price * 0.09975 * 100) / 100
  const total = Math.round((price + gst + qst) * 100) / 100

  const providerLine =
    meta.material_provider === 'client'
      ? tr.s4ProviderClient
      : meta.material_provider === 'shared'
        ? tr.s4ProviderShared
        : tr.s4ProviderContractor

  return (
    <Document
      title={tr.title}
      author="ConstrAction Inc."
      creator="ConstrAction Inc."
      producer="ConstrAction Inc."
    >
      <Page size="LETTER" style={styles.page} wrap>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        {logoUrl ? <Image src={logoUrl} style={styles.logo} /> : null}

        <Text style={styles.title}>{tr.title}</Text>
        {meta.project_name ? (
          <Text
            style={[
              styles.paragraph,
              { textAlign: 'center', fontFamily: 'Times-Italic' },
            ]}
          >
            {language === 'fr' ? 'Projet : ' : 'Project: '}
            {meta.project_name}
          </Text>
        ) : null}
        <Text style={styles.paragraph}>
          {tr.intro(formatDateForPdf(meta.sign_date, language))}
        </Text>

        {/* Parties */}
        <Text style={styles.sectionHeading}>{tr.parties}</Text>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>{tr.gcHeading}: </Text>
          {contract.client_name ?? ''}
          {gcAddress ? `\n${gcAddress}` : ''}
          {contract.client_email ? `\n${contract.client_email}` : ''}
          {contract.client_phone ? `\n${contract.client_phone}` : ''}
        </Text>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>{tr.subHeading}: </Text>
          {contract.contractor_name ?? ''}
          {subAddress ? `\n${subAddress}` : ''}
          {contract.contractor_rbq
            ? `\n${tr.rbq}: ${contract.contractor_rbq}`
            : ''}
          {contract.contractor_email ? `\n${contract.contractor_email}` : ''}
          {contract.contractor_phone ? `\n${contract.contractor_phone}` : ''}
        </Text>

        <Text style={styles.paragraph}>{tr.purpose}</Text>

        {/* Project + Dates + Payment summary block */}
        <Text style={styles.sectionHeading}>{tr.project}</Text>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>{tr.projectSite}: </Text>
          {projectAddress}
        </Text>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>{tr.scopeOfWork}: </Text>
          {contract.project_description ?? ''}
        </Text>

        <Text style={styles.sectionHeading}>{tr.dates}</Text>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>{tr.commencementDate}: </Text>
          {formatDateForPdf(meta.start_date, language)}
          {'\n'}
          <Text style={styles.bold}>{tr.completionDate}: </Text>
          {formatDateForPdf(meta.end_date, language)}
          {'\n'}
          <Text style={styles.bold}>{tr.signingDate}: </Text>
          {formatDateForPdf(meta.sign_date, language)}
        </Text>

        <Text style={styles.sectionHeading}>{tr.paymentTerms}</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>{tr.subtotalLabel}</Text>
            <Text style={styles.tableCellRight}>
              {formatCurrencyForPdf(price, language)}
            </Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>{tr.gstLabel}</Text>
            <Text style={styles.tableCellRight}>
              {formatCurrencyForPdf(gst, language)}
            </Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>{tr.qstLabel}</Text>
            <Text style={styles.tableCellRight}>
              {formatCurrencyForPdf(qst, language)}
            </Text>
          </View>
          <View style={styles.tableRowLast}>
            <Text style={styles.tableHeaderCell}>{tr.totalLabel}</Text>
            <Text style={[styles.tableHeaderCell, { textAlign: 'right' }]}>
              {formatCurrencyForPdf(total, language)}
            </Text>
          </View>
        </View>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>{tr.paymentMethod}: </Text>
          {paymentMethodLabel(meta.payment_method, language)}
          {meta.invoice_frequency
            ? ` (${invoiceFrequencyLabel(meta.invoice_frequency, language)})`
            : ''}
          {meta.payment_due_days != null
            ? language === 'fr'
              ? `, payable dans les ${meta.payment_due_days} jour(s) suivant la facturation`
              : `, due ${meta.payment_due_days} day(s) after invoice`
            : ''}
          {'\n'}
          {meta.advance_payment && meta.advance_payment_amount ? (
            <>
              <Text style={styles.bold}>
                {language === 'fr' ? 'Acompte : ' : 'Advance payment: '}
              </Text>
              {formatCurrencyForPdf(meta.advance_payment_amount, language)}
              {language === 'fr'
                ? ' (déduit de la facture finale)'
                : ' (deducted from final invoice)'}
              {'\n'}
            </>
          ) : null}
          <Text style={styles.bold}>{tr.lateInterest}: </Text>
          {meta.late_interest ?? 0}
          {tr.lateInterestSuffix}
          {'\n'}
          <Text style={styles.bold}>{tr.materialProvider}: </Text>
          {tr.materialProviderValues[
            (meta.material_provider as keyof typeof tr.materialProviderValues) ??
              'contractor'
          ]}
        </Text>

        {/* === Numbered clauses === */}
        <Text style={styles.sectionHeading}>{tr.s1Title}</Text>
        {tr.s1Body.map((entry, idx) => (
          <Text key={idx} style={styles.paragraph}>
            {entry}
          </Text>
        ))}

        <Text style={styles.sectionHeading}>{tr.s2Title}</Text>
        <Text style={styles.paragraph}>{tr.s2Body}</Text>

        <Text style={styles.sectionHeading}>{tr.s3Title}</Text>
        <Text style={styles.paragraph}>{tr.s3Body}</Text>

        <Text style={styles.sectionHeading}>{tr.s4Title}</Text>
        <Text style={styles.paragraph}>
          {tr.s4Body(providerLine, contract.project_description ?? '')}
        </Text>

        <Text style={styles.sectionHeading}>{tr.s5Title}</Text>
        <Text style={styles.paragraph}>{tr.s5Body}</Text>

        <Text style={styles.sectionHeading}>{tr.s6Title}</Text>
        <Text style={styles.paragraph}>{tr.s6Body}</Text>

        <Text style={styles.sectionHeading}>{tr.s7Title}</Text>
        <Text style={styles.paragraph}>{tr.s7Body}</Text>

        <Text style={styles.sectionHeading}>{tr.s8Title}</Text>
        <Text style={styles.paragraph}>{tr.s8Body}</Text>

        <Text style={styles.sectionHeading}>{tr.s9Title}</Text>
        <Text style={styles.paragraph}>
          {tr.s9Body(paymentMethodLabel(meta.payment_method, language))}
        </Text>
        {meta.time_materials_description ? (
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>
              {language === 'fr'
                ? 'Taux temps et matériaux : '
                : 'Time & materials rates: '}
            </Text>
            {meta.time_materials_description}
          </Text>
        ) : null}
        {meta.holdback ? (
          <Text style={styles.paragraph}>
            {tr.s9Holdback(meta.holdback_pct ?? 10)}
          </Text>
        ) : null}

        {meta.escalation ? (
          <View>
            <Text style={styles.sectionHeading}>{tr.s10Title}</Text>
            <Text style={styles.paragraph}>
              {tr.s10Body(meta.escalation_pct ?? 10)}
            </Text>
          </View>
        ) : null}

        {meta.recovery_penalty ? (
          <View>
            <Text style={styles.sectionHeading}>{tr.s11Title}</Text>
            <Text style={styles.paragraph}>{tr.s11Body}</Text>
          </View>
        ) : null}

        <Text style={styles.sectionHeading}>{tr.s12Title}</Text>
        <Text style={styles.paragraph}>{tr.s12Body}</Text>

        <Text style={styles.sectionHeading}>{tr.s13Title}</Text>
        <Text style={styles.paragraph}>
          {tr.s13Body(meta.warranty_months ?? 12)}
        </Text>

        <Text style={styles.sectionHeading}>{tr.s14Title}</Text>
        <Text style={styles.paragraph}>
          {tr.s14Insurance(meta.insurance_amount ?? 2000000)}
        </Text>
        {meta.bond ? (
          <Text style={styles.paragraph}>
            {tr.s14Bond(meta.bond_pct ?? 50)}
          </Text>
        ) : null}

        <Text style={styles.sectionHeading}>{tr.s15Title}</Text>
        <Text style={styles.paragraph}>{tr.s15Body}</Text>

        <Text style={styles.sectionHeading}>{tr.s16Title}</Text>
        <Text style={styles.paragraph}>{tr.s16Body}</Text>

        <Text style={styles.sectionHeading}>{tr.s17Title}</Text>
        <Text style={styles.paragraph}>{tr.s17Body}</Text>

        <Text style={styles.sectionHeading}>{tr.s18Title}</Text>
        <Text style={styles.paragraph}>{tr.s18Body}</Text>
        <Text style={styles.paragraph}>{tr.s18StepIn}</Text>
        <Text style={styles.paragraph}>{tr.s18Convenience}</Text>

        <Text style={styles.sectionHeading}>{tr.s19Title}</Text>
        <Text style={styles.paragraph}>{tr.s19Body}</Text>

        <Text style={styles.sectionHeading}>{tr.s20Title}</Text>
        <Text style={styles.paragraph}>{tr.s20Body}</Text>

        <Text style={styles.sectionHeading}>{tr.s21Title}</Text>
        <Text style={styles.paragraph}>{tr.s21Body}</Text>

        <Text style={styles.sectionHeading}>{tr.s22Title}</Text>
        <Text style={styles.paragraph}>{tr.s22Body}</Text>

        <Text style={styles.sectionHeading}>{tr.s23Title}</Text>
        <Text style={styles.paragraph}>{tr.s23Body}</Text>

        <Text style={styles.sectionHeading}>{tr.s24Title}</Text>
        <Text style={styles.paragraph}>
          {tr.s24Body(meta.inspection_period_days ?? 30)}
        </Text>
        <Text style={styles.paragraph}>
          {tr.s24BodySuspension(
            meta.suspension_request_adjustment_days ?? 30,
            meta.suspension_terminate_days ?? 60,
            meta.suspension_resume_claim_days ?? 15
          )}
        </Text>

        <Text style={styles.sectionHeading}>{tr.s25Title}</Text>
        <Text style={styles.paragraph}>{tr.s25Body}</Text>

        <Text style={styles.sectionHeading}>{tr.s26Title}</Text>
        <Text style={styles.paragraph}>{tr.s26Body}</Text>

        <Text style={styles.sectionHeading}>{tr.s27Title}</Text>
        <Text style={styles.paragraph}>{tr.s27Body}</Text>

        <Text style={styles.sectionHeading}>{tr.s28Title}</Text>
        <Text style={styles.paragraph}>
          {meta.extra_clauses && meta.extra_clauses.trim().length > 0
            ? meta.extra_clauses
            : tr.s28Default}
        </Text>

        {/* Acknowledgement + Signatures */}
        <Text style={[styles.paragraph, { marginTop: 14 }]}>
          {tr.acknowledgment}
        </Text>

        <Text style={[styles.sectionHeading, { marginTop: 18 }]}>
          {tr.signatureTitle}
        </Text>
        <View style={styles.signatureRow}>
          <View style={styles.signatureBlock}>
            <Text style={styles.bold}>{tr.gcSig}</Text>
            <Text style={styles.signatureLabel}>{tr.perLabel}</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>{tr.nameLabel}</Text>
            <View style={[styles.signatureLine, { marginTop: 12 }]} />
            <Text style={styles.signatureLabel}>{tr.titleLabel}</Text>
            <View style={[styles.signatureLine, { marginTop: 12 }]} />
            <Text style={styles.signatureLabel}>{tr.dateLabel}</Text>
          </View>
          <View style={styles.signatureBlock}>
            <Text style={styles.bold}>{tr.subSig}</Text>
            <Text style={styles.signatureLabel}>{tr.perLabel}</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>{tr.nameLabel}</Text>
            <View style={[styles.signatureLine, { marginTop: 12 }]} />
            <Text style={styles.signatureLabel}>{tr.titleLabel}</Text>
            <View style={[styles.signatureLine, { marginTop: 12 }]} />
            <Text style={styles.signatureLabel}>{tr.dateLabel}</Text>
          </View>
        </View>

        <Text style={styles.disclaimer}>{tr.disclaimer}</Text>
        <Text style={styles.footer} fixed>
          {tr.footerCreated}
        </Text>
      </Page>
    </Document>
  )
}
