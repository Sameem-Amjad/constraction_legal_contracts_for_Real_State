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

interface CCDocumentProps {
  contract: Contract
  profile: Profile | null
  language: 'en' | 'fr'
  logoUrl?: string
}

// =============================================================================
// Bilingual content for the Client / Contractor agreement.
// Sourced from data/CONSTRUCTION AGREEMENT Client-Contractor.docx and
// data/Contrat de Construction Client - Entrepreneur.docx.
// Section numbering follows the .docx ordering.
// =============================================================================

const t = {
  en: {
    title: 'Services (Construction) Agreement',
    intro: (date: string) =>
      `This Construction Agreement is entered into on ${date} under the laws of the Province of Quebec by and between:`,
    clientHeading: 'Client / Property Owner',
    contractorHeading: 'Contractor',
    rbq: 'RBQ Licence No.',
    purpose:
      'The purpose of this Agreement is to set forth the terms and conditions under which the Contractor will perform services for the Client. This Agreement outlines the scope of services, the responsibilities of each Party, the compensation payable, and other terms pertinent to the contractual relationship established herein.',
    s1Title: '1. Definitions',
    s1Body: [
      '"Agreement" means this services (construction) agreement, including all appendices and duly executed amendments.',
      '"CNESST" means the Commission des normes, de l\'équité, de la santé et de la sécurité du travail.',
      '"Contract Price" means the total amount payable by the Client to the Contractor under this Agreement, namely the amount stated in the Payment Terms section below, plus applicable taxes.',
      '"Denunciation Notice" means the formal notice issued by a subcontractor under article 2728 C.C.Q. for purposes of preserving a legal hypothec.',
      '"Holdback" is the portion of payment withheld under article 2111 of the Civil Code of Québec.',
      '"Project" means the construction project described in this Agreement.',
      '"RBQ" is the Régie du bâtiment du Québec.',
      '"Site" or "Project Site" means the location where the Work is to be performed, as identified in the Project section below.',
      '"Work" refers to the labour, materials, and services to be provided by the Contractor as described in Section 4.',
    ],
    s2Title: '2. Independent Contractor Status',
    s2Body:
      'The Contractor is an independent contractor. Nothing in this Agreement shall be construed to create an employment relationship, joint venture, or partnership between the parties. The Contractor is solely responsible for its employees, taxes, permits, insurances, CNESST registration, RBQ licence, and all regulatory compliance.',
    s3Title: '3. Governing Law',
    s3Body:
      'This Agreement shall be governed by and construed in accordance with the laws of the Province of Quebec and the Civil Code of Québec. The parties irrevocably attorn to the jurisdiction of the courts in the judicial district where the Project Site is located.',
    s4Title: '4. Scope of Work',
    s4Body: (provider: string, scope: string) =>
      `${provider} The Contractor shall perform the Work at the Project Site in accordance with applicable laws, codes, and best industry practices. Scope of the Work: ${scope}`,
    s4ProviderContractor:
      'The Contractor shall provide all labour, materials, and equipment required to complete the Work.',
    s4ProviderClient:
      'The Client shall provide all materials and equipment related to the Work, and the Contractor shall provide all labour required to complete the Work.',
    s4ProviderShared:
      'The Client and the Contractor shall share responsibility for materials and equipment, as detailed in Schedule A or as agreed in writing.',
    s5Title: '5. Plans and Specifications',
    s5Body:
      'The Contractor shall perform the Work in strict compliance with all plans and specifications provided or approved by the Client. Any deviation must be approved in writing by the Client pursuant to Section 10 (Change Orders).',
    s6Title: '6. Permits and Compliance',
    s6Body:
      'The Contractor shall obtain all permits, approvals, licences, and certificates required to perform the Work. The Contractor shall comply with all applicable laws, codes, and safety standards, including CNESST and RBQ requirements.',
    s7Title: '7. Commencement and Completion',
    s7Body:
      'The Contractor shall begin the Work on the Commencement Date and complete the Work by the Completion Date set out below. Delays must be communicated to the Client in writing at least fifteen (15) days in advance. Time is of the essence.',
    s8Title: '8. Payment Terms',
    s8Body: (method: string) =>
      `The Client shall pay the Contractor the Contract Price set out below by ${method || 'the agreed method'}. Unless otherwise agreed in writing, invoices are due within five (5) days of receipt. Late payments shall bear interest at the rate set out below, calculated monthly in arrears, until full payment is received.`,
    s8Holdback: (pct: number) =>
      `Each payment is subject to a ${pct}% statutory holdback retained under article 2111 C.C.Q. The holdback shall be released thirty (30) days after substantial completion of the Work, provided no legal hypothec has been registered and no deficiencies have been reported by the Client.`,
    s9Title: '9. Price Escalation',
    s9Body: (pct: number) =>
      `If, after the execution of this Agreement, the market price of materials required to perform the Work increases by more than ${pct}% compared to the quoted price on the date of this Agreement, the Contractor may request a price adjustment supported by documentary evidence. The parties shall negotiate in good faith an equitable adjustment to the Contract Price within fifteen (15) days. No adjustment shall apply to changes in scope, which are governed by Section 10.`,
    s10Title: '10. Change Orders',
    s10Body:
      'Any modification to the Work or its scope shall be documented through a written Change Order signed by both parties, with clear cost and timeline implications. The receiving party shall have five (5) business days to accept, reject or amend the request, failing which it shall be deemed rejected. No change shall commence until a fully executed Change Order is in place.',
    s11Title: '11. Recovery Costs and Penalty',
    s11Body:
      'In the event any amount payable by the Client remains unpaid after its due date, and the Contractor is required to retain legal counsel or a collection agency, the Client shall pay, as a penalty clause within the meaning of the Civil Code of Québec, an amount equal to twenty-five percent (25%) of the unpaid principal and accrued interest. This penalty is in addition to interest provided under this Agreement and any legal costs awarded.',
    s12Title: '12. Warranty',
    s12Body: (months: number) =>
      `The Contractor warrants the Work for a period of ${months} months from the date of substantial completion against defects in materials and workmanship. The warranty does not cover damage caused by misuse, neglect, or external forces. The Client shall notify the Contractor in writing of any deficiency, and the Contractor shall begin corrective measures within ten (10) business days. This warranty is in addition to and does not limit any legal warranty obligations under the C.C.Q.`,
    s13Title: '13. Insurance and Performance Bond',
    s13Insurance: (amount: number) =>
      `The Contractor shall maintain, at its own expense, commercial general liability insurance with a minimum coverage of $${amount.toLocaleString('en-CA')} CAD covering bodily injury, property damage, and personal injury, plus workers' compensation insurance with the CNESST. The Client shall be named as additional insured with respect to liability arising out of the Work. Certificates shall be provided on request prior to commencement of the Work.`,
    s13Bond: (pct: number) =>
      `The Contractor shall, upon request, provide a performance bond in favour of the Client in an amount equal to ${pct}% of the Contract Price, issued by a surety legally authorized to operate in Quebec, in a form reasonably acceptable to the Client. The cost of the bond shall be borne by the Contractor unless otherwise agreed in writing.`,
    s14Title: '14. Site Security',
    s14Body:
      'The Contractor shall ensure appropriate site security and is responsible for safeguarding tools, equipment, and materials at the Project Site.',
    s15Title: '15. Denunciation Notice',
    s15Body:
      'The Contractor agrees to disclose any subcontractors when required by the Client and to provide appropriate Denunciation Notices where applicable under article 2728 C.C.Q.',
    s16Title: '16. Assignment',
    s16Body:
      'Neither party may assign this Agreement or any portion thereof without the prior written consent of the other party, which shall not be unreasonably withheld.',
    s17Title: '17. Force Majeure',
    s17Body:
      'Delays due to superior force (force majeure) as defined in article 1470 C.C.Q., including acts of God, labour strikes, natural disasters, public health emergencies, pandemics, or government orders, shall excuse performance during the period of delay. The affected party must notify the other party within forty-eight (48) hours of the occurrence. The parties shall act in good faith to revise the schedule, scope, or pricing to reflect the impact.',
    s18Title: '18. Termination',
    s18Body:
      'Either party may terminate this Agreement upon written notice in the event of a material breach that remains uncured for ten (10) business days after written notice, except in cases of fraud or insolvency, in which case termination takes effect immediately. Upon termination, the Contractor shall be paid for all Work completed to date.',
    s18StepIn:
      'Step-in rights: If the Contractor fails to supply qualified labour, fails to maintain reasonable progress, fails to correct defective Work within the cure period, or fails to comply with health and safety obligations, and such default is not remedied within five (5) Business Days following written notice, the Client may supplement the workforce, procure materials directly, or engage third parties to complete the affected Work, with all reasonable documented costs deductible from amounts otherwise payable to the Contractor.',
    s19Title: '19. Termination for Convenience',
    s19Body:
      'Either party may terminate this Agreement for convenience by providing thirty (30) days written notice. Upon termination for convenience, neither party shall have any further liability to the other, except for obligations that have accrued prior to the termination date. The Contractor shall be compensated for all Work performed up to the date of termination.',
    s20Title: '20. Confidentiality and Data Protection',
    s20Body:
      'The parties agree to maintain in confidence any proprietary, sensitive, or personal information obtained from each other in connection with this Agreement, and shall implement appropriate technical and organizational measures to protect such information. The parties shall comply with applicable data protection laws. In the event of a data breach, the affected party shall notify the other within forty-eight (48) hours. Upon termination, each party shall return or securely destroy all confidential information received.',
    s21Title: '21. Dispute Resolution',
    s21Body:
      'In the event of a dispute, the parties shall first attempt resolution through direct negotiation within thirty (30) days. If unresolved, the parties shall submit to mediation by an accredited Quebec mediator selected by mutual agreement within fifteen (15) days. Mediation shall conclude within sixty (60) days, with costs shared equally. Should mediation fail, either party may proceed to litigation in the judicial district where the Project Site is located.',
    s22Title: '22. Contractor Personnel',
    s22Body:
      'The Contractor shall provide qualified and properly trained personnel to carry out the Work. The Contractor remains solely responsible for its employees, subcontractors, and agents, including all applicable payroll, employment insurance, and income tax withholdings.',
    s23Title: '23. Health and Safety',
    s23Body:
      'The Contractor shall comply with all health and safety regulations applicable under Quebec law and CNESST standards, ensure a safe working environment, and report any incident within twenty-four (24) hours. In the event the Contractor identifies a condition at the Worksite that presents an immediate or serious risk, the Contractor shall notify the Client in writing without delay. If the Client fails to respond or implement corrective measures within forty-eight (48) hours, the Contractor may suspend the affected portion of the Work without penalty until the condition is remedied.',
    s24Title: '24. Environmental Compliance',
    s24Body:
      'The Contractor shall perform the Work in compliance with all applicable environmental laws and regulations. Any environmental damage caused by the Contractor shall be promptly remediated at the Contractor\'s sole cost.',
    s25Title: '25. Indemnification',
    s25Body:
      'Each party agrees to indemnify and hold harmless the other party against claims, damages, losses, and expenses directly resulting from the indemnifying party\'s fault or negligence in performing its obligations under this Agreement, including bodily injury, sickness, death, or property damage, except to the extent covered by a government-administered insurance scheme such as the CNESST. This indemnity is subject to articles 1474 and 1475 C.C.Q. The Contractor\'s liability shall not exceed the Contract Price, except in cases of gross negligence or willful misconduct. The indemnification obligations survive termination.',
    s26Title: '26. Notices',
    s26Body:
      'All notices shall be given in writing and delivered by personal delivery, email, or registered mail to the addresses indicated above. Notices delivered by hand or email are deemed received on the date of transmission (or the next Business Day if after 4:30 PM). Notices delivered by registered mail are deemed received on the next Business Day following delivery.',
    s27Title: '27. Subcontracting and Responsibility for Payments',
    s27Body:
      'The Contractor may subcontract any portion of the Work, provided that any subcontractor is duly licensed, carries adequate insurance and CNESST registration, and has demonstrated the experience required. The Contractor remains fully responsible to the Client for all Work, including portions performed by subcontractors. The Contractor shall ensure all subcontractors and suppliers are paid in full and on time, and shall discharge any legal hypothec registered against the Client\'s property within ten (10) business days, failing which the Client may apply the Holdback to pay the unpaid party.',
    s28Title: '28. Cleanup',
    s28Body:
      'The Contractor shall maintain a clean and orderly job site and shall remove all debris, waste materials, and tools upon completion of the Work or as directed by the Client.',
    s29Title: '29. Acceptance of Work',
    s29Body: (inspectionDays: number) =>
      `The Work shall be considered accepted upon: inspection by the Client and written confirmation of acceptance; or absence of any deficiency report within ${inspectionDays} days of completion, provided the Contractor has given written notice of completion.`,
    s30Title: '30. Deficiency Correction',
    s30Body:
      'If deficiencies are discovered, the Contractor shall correct them within ten (10) business days at no additional cost. Failure to do so permits the Client to rectify the issue and deduct reasonable costs from amounts owed.',
    s31Title: '31. Intellectual Property',
    s31Body:
      'All intellectual property rights in designs, plans, drawings, and other materials created by the Contractor (the "Work Product") shall be assigned to the Client upon payment in full, subject to moral rights which cannot be assigned under Quebec law. Until full payment, the Contractor grants the Client a non-exclusive, perpetual, royalty-free licence to use the Work Product for any purpose related to the Project. The Contractor warrants that the Work Product does not infringe any third-party rights and shall indemnify the Client against any direct claims arising from a breach of this warranty.',
    s32Title: '32. Work Suspension',
    s32Body: (adjustDays: number, terminateDays: number, resumeDays: number) =>
      `The Client may suspend the Work in whole or in part. If the suspension exceeds ${adjustDays} calendar days, the Contractor may request an adjustment to the schedule or contract price, or if suspension exceeds ${terminateDays} calendar days without resumption, terminate the Agreement without penalty. Any claim must be submitted within ${resumeDays} days of resumption or termination.`,
    s33Title: '33. Waiver',
    s33Body:
      'No waiver by either party of any breach shall constitute a waiver of any other breach. All waivers must be in writing.',
    s34Title: '34. Severability',
    s34Body:
      'If any provision of this Agreement is found to be invalid or unenforceable, such provision shall be severed, and the remainder of the Agreement shall remain in full force and effect.',
    s35Title: '35. Counterparts',
    s35Body:
      'This Agreement may be executed in counterparts, each of which shall be deemed an original, and all of which shall constitute the same instrument.',
    s36Title: '36. Electronic Signature',
    s36Body:
      'The parties agree that this Agreement may be signed electronically and that such electronic signatures shall have the same force and effect as original signatures.',
    s37Title: '37. No Exclusivity',
    s37Body:
      'This Agreement is non-exclusive. The Contractor may enter into agreements with other parties for similar work, provided such work does not conflict with obligations under this Agreement.',
    s38Title: '38. Order of Precedence',
    s38Body:
      'In the event of any inconsistency between the documents forming part of this Agreement, the following order of precedence shall apply: (a) duly executed Change Orders; (b) this Agreement including its appendices; (c) the plans and specifications related to the Work; (d) any other documents identified by the parties.',
    s39Title: '39. Entire Agreement',
    s39Body:
      'This document, including its appendices, represents the entire agreement between the parties and supersedes all prior discussions, representations, or agreements, whether written or oral.',
    s40Title: '40. Survival',
    s40Body:
      'The following provisions shall survive termination: (a) Indemnification; (b) Confidentiality; (c) Payment obligations accrued prior to termination; (d) Dispute Resolution; (e) Warranty; (f) Insurance; (g) Intellectual Property.',
    s41Title: '41. Language',
    s41Body:
      'The parties expressly agree that this Agreement be drawn up in English. Les parties conviennent expressément que le présent contrat soit rédigé en anglais. Une version française sera également disponible.',
    s42Title: '42. Additional Provisions',
    s42Default: 'N/A',
    signatureTitle: 'Signatures',
    clientSig: 'Client (Property Owner)',
    contractorSig: 'Contractor',
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
      contractor: 'Contractor',
      client: 'Client (Property Owner)',
      shared: 'Shared between parties',
    },
    gstLabel: 'GST (TPS) 5%',
    qstLabel: 'QST (TVQ) 9.975%',
    totalLabel: 'Total (incl. taxes)',
    subtotalLabel: 'Subtotal',
  },
  fr: {
    title: 'Contrat de services (construction)',
    intro: (date: string) =>
      `Le présent contrat de construction est conclu le ${date} en vertu des lois de la province de Québec par et entre :`,
    clientHeading: 'Client / Propriétaire',
    contractorHeading: 'Entrepreneur',
    rbq: 'No. de licence RBQ',
    purpose:
      "Le présent Contrat a pour objet de définir les conditions dans lesquelles l'Entrepreneur fournira des services au Client. Le présent Contrat décrit l'étendue des services à fournir, les responsabilités de chaque partie, la rémunération à verser et les autres conditions relatives à la relation contractuelle établie par le présent Contrat.",
    s1Title: '1. Définitions',
    s1Body: [
      "« Contrat » désigne le présent contrat de services (construction), y compris toutes les annexes et tous les amendements dûment signés.",
      "« CNESST » désigne la Commission des normes, de l'équité, de la santé et de la sécurité du travail.",
      "« Prix du contrat » désigne le montant total payable par le Client à l'Entrepreneur en vertu du présent Contrat, soit le montant indiqué dans la section Modalités de paiement ci-dessous, plus les taxes applicables.",
      "« Avis de dénonciation » désigne l'avis formel émis par un sous-traitant en vertu de l'article 2728 C.c.Q. aux fins de conservation d'une hypothèque légale.",
      "« Retenue » désigne la partie du paiement retenue en vertu de l'article 2111 du Code civil du Québec.",
      "« Projet » désigne le projet de construction décrit dans le présent Contrat.",
      "« RBQ » désigne la Régie du bâtiment du Québec.",
      "« Site » ou « Site du Projet » désigne l'endroit où les Travaux doivent être exécutés, identifié à la section Projet ci-dessous.",
      "« Travaux » désignent la main-d'œuvre, les matériaux et les services devant être fournis par l'Entrepreneur, tels que décrits à l'article 4.",
    ],
    s2Title: "2. Statut d'entrepreneur indépendant",
    s2Body:
      "L'Entrepreneur est un entrepreneur indépendant. Aucune disposition du présent Contrat ne doit être interprétée comme créant une relation d'emploi, une coentreprise ou un partenariat entre les parties. L'Entrepreneur est seul responsable de ses employés, de ses taxes, de ses permis, de ses assurances, de son inscription à la CNESST, de sa licence de la RBQ et de toute conformité réglementaire.",
    s3Title: '3. Droit applicable',
    s3Body:
      'Le présent Contrat est régi et interprété conformément aux lois de la province de Québec et au Code civil du Québec. Les parties reconnaissent irrévocablement la compétence des tribunaux du district judiciaire où se trouve le Site du Projet.',
    s4Title: '4. Étendue des Travaux',
    s4Body: (provider: string, scope: string) =>
      `${provider} L'Entrepreneur exécutera les Travaux sur le Site du Projet conformément aux lois, aux codes et aux meilleures pratiques de l'industrie. Description des Travaux : ${scope}`,
    s4ProviderContractor:
      "L'Entrepreneur fournira la main-d'œuvre, les matériaux et l'équipement nécessaires à l'exécution des Travaux.",
    s4ProviderClient:
      "Le Client fournira tous les matériaux et l'équipement nécessaires aux Travaux, et l'Entrepreneur fournira la main-d'œuvre nécessaire à l'exécution des Travaux.",
    s4ProviderShared:
      "Le Client et l'Entrepreneur partageront la responsabilité des matériaux et de l'équipement, tel que détaillé à l'Annexe A ou tel que convenu par écrit.",
    s5Title: '5. Plans et spécifications',
    s5Body:
      "L'Entrepreneur exécutera les Travaux en se conformant strictement à tous les plans et spécifications fournis ou approuvés par le Client. Toute dérogation doit être approuvée par écrit par le Client conformément à l'article 10 (Ordres de modification).",
    s6Title: '6. Permis et conformité',
    s6Body:
      "L'Entrepreneur doit obtenir tous les permis, approbations, licences et certificats nécessaires à l'exécution des Travaux. L'Entrepreneur doit se conformer à toutes les lois, à tous les codes et à toutes les normes de sécurité applicables, y compris les exigences de la CNESST et de la RBQ.",
    s7Title: '7. Début et achèvement des Travaux',
    s7Body:
      "L'Entrepreneur commencera les Travaux à la Date de début et les terminera au plus tard à la Date d'achèvement indiquée ci-dessous. Les retards doivent être communiqués par écrit au Client au moins quinze (15) jours à l'avance. Le temps est un facteur essentiel.",
    s8Title: '8. Conditions de paiement',
    s8Body: (method: string) =>
      `Le Client paiera à l'Entrepreneur le Prix du contrat indiqué ci-dessous par ${method || 'le mode convenu'}. Sauf entente écrite contraire, les factures sont payables dans les cinq (5) jours suivant leur réception. Les paiements en retard porteront intérêt au taux indiqué ci-dessous, calculé mensuellement, jusqu'au paiement intégral.`,
    s8Holdback: (pct: number) =>
      `Chaque paiement est sous réserve d'une retenue statutaire de ${pct} % conservée en vertu de l'article 2111 C.c.Q. La retenue sera libérée trente (30) jours après la réception substantielle des Travaux, à condition qu'aucune hypothèque légale n'ait été inscrite et qu'aucune déficience n'ait été signalée par le Client.`,
    s9Title: '9. Escalade des prix',
    s9Body: (pct: number) =>
      `Si, après la signature du présent Contrat, le prix du marché des matériaux nécessaires à l'exécution des Travaux augmente de plus de ${pct} % par rapport au prix indiqué à la date du présent Contrat, l'Entrepreneur peut demander un ajustement de prix appuyé par des preuves documentaires. Les parties négocieront de bonne foi un ajustement équitable au Prix du contrat dans les quinze (15) jours. Aucun ajustement ne s'applique aux changements de portée, qui sont régis par l'article 10.`,
    s10Title: '10. Ordres de modification',
    s10Body:
      "Toute modification aux Travaux ou à leur portée doit être documentée par un Ordre de modification écrit signé par les deux parties, indiquant clairement les implications sur les coûts et le calendrier. La partie réceptrice dispose de cinq (5) jours ouvrables pour accepter, refuser ou modifier la demande, à défaut de quoi elle est réputée refusée. Aucun changement ne commence avant qu'un Ordre de modification dûment signé ne soit en place.",
    s11Title: '11. Frais de recouvrement et pénalité',
    s11Body:
      "Si un montant payable par le Client demeure impayé après son échéance et que l'Entrepreneur doit retenir un avocat ou une agence de recouvrement, le Client paiera, à titre de clause pénale au sens du Code civil du Québec, un montant équivalant à vingt-cinq pour cent (25 %) du capital impayé et des intérêts accumulés. Cette pénalité s'ajoute aux intérêts prévus au présent Contrat et à tous les frais de justice accordés.",
    s12Title: '12. Garantie',
    s12Body: (months: number) =>
      `L'Entrepreneur garantit les Travaux pour une période de ${months} mois à compter de la date de réception substantielle, contre les défauts de matériaux et de main-d'œuvre. La garantie ne couvre pas les dommages causés par une mauvaise utilisation, la négligence ou des forces externes. Le Client doit aviser l'Entrepreneur par écrit de toute déficience, et l'Entrepreneur doit commencer les mesures correctives dans les dix (10) jours ouvrables. Cette garantie s'ajoute aux obligations légales de garantie prévues par le C.c.Q. et ne les limite pas.`,
    s13Title: '13. Assurances et cautionnement',
    s13Insurance: (amount: number) =>
      `L'Entrepreneur maintiendra, à ses frais, une assurance responsabilité civile commerciale avec une couverture minimale de ${amount.toLocaleString('fr-CA')} $ CA couvrant les blessures corporelles, les dommages matériels et les préjudices personnels, ainsi qu'une assurance contre les accidents du travail auprès de la CNESST. Le Client sera désigné comme assuré additionnel à l'égard de la responsabilité découlant des Travaux. Les certificats seront fournis sur demande avant le début des Travaux.`,
    s13Bond: (pct: number) =>
      `L'Entrepreneur fournira, sur demande, un cautionnement d'exécution en faveur du Client d'un montant équivalant à ${pct} % du Prix du contrat, émis par une caution légalement autorisée à exercer au Québec, sous une forme raisonnablement acceptable au Client. Le coût du cautionnement sera assumé par l'Entrepreneur sauf entente écrite contraire.`,
    s14Title: '14. Sécurité du chantier',
    s14Body:
      "L'Entrepreneur assurera une sécurité adéquate du chantier et est responsable de la protection des outils, de l'équipement et des matériaux sur le Site du Projet.",
    s15Title: '15. Avis de dénonciation',
    s15Body:
      "L'Entrepreneur s'engage à divulguer tout sous-traitant lorsque le Client le demande et à fournir les Avis de dénonciation appropriés en vertu de l'article 2728 C.c.Q. lorsqu'applicable.",
    s16Title: '16. Cession',
    s16Body:
      "Aucune des parties ne peut céder tout ou partie du présent Contrat sans le consentement écrit préalable de l'autre partie, lequel ne peut être refusé sans motif valable.",
    s17Title: '17. Force majeure',
    s17Body:
      "Les retards dus à un cas de force majeure tel que défini à l'article 1470 C.c.Q., y compris les catastrophes naturelles, les grèves, les urgences sanitaires, les pandémies ou les ordres gouvernementaux, excusent l'exécution pendant la période de retard. La partie touchée doit aviser l'autre partie dans les quarante-huit (48) heures de l'événement. Les parties agiront de bonne foi pour réviser le calendrier, la portée ou le prix afin de refléter l'impact.",
    s18Title: '18. Résiliation',
    s18Body:
      "L'une ou l'autre des parties peut résilier le présent Contrat sur préavis écrit en cas de manquement substantiel non corrigé dans les dix (10) jours ouvrables suivant la mise en demeure, sauf en cas de fraude ou d'insolvabilité, auquel cas la résiliation prend effet immédiatement. À la résiliation, l'Entrepreneur sera payé pour tous les Travaux exécutés à ce jour.",
    s18StepIn:
      "Droits d'intervention : Si l'Entrepreneur ne fournit pas une main-d'œuvre qualifiée, ne maintient pas un progrès raisonnable, ne corrige pas les Travaux défectueux dans le délai de remédiation, ou ne respecte pas les obligations de santé et sécurité, et que ce manquement n'est pas corrigé dans les cinq (5) jours ouvrables suivant l'avis écrit, le Client peut compléter la main-d'œuvre, se procurer des matériaux directement, ou retenir des tiers pour terminer les Travaux affectés, tous les coûts raisonnables documentés étant déductibles des montants autrement payables à l'Entrepreneur.",
    s19Title: '19. Résiliation pour des raisons de commodité',
    s19Body:
      "Chaque partie peut résilier le présent Contrat pour des raisons de commodité en adressant un préavis écrit d'au moins trente (30) jours. En cas de résiliation, l'Entrepreneur sera rémunéré pour tous les Travaux exécutés jusqu'à la date de résiliation.",
    s20Title: '20. Confidentialité et protection des données',
    s20Body:
      "Les parties conviennent de garder confidentielle toute information exclusive, sensible ou personnelle obtenue l'une de l'autre dans le cadre du présent Contrat, et mettront en œuvre des mesures techniques et organisationnelles appropriées pour protéger ces informations. Les parties se conformeront aux lois applicables sur la protection des données. En cas de violation de données, la partie touchée avisera l'autre dans les quarante-huit (48) heures. À la résiliation, chaque partie retournera ou détruira de manière sécurisée toutes les informations confidentielles reçues.",
    s21Title: '21. Résolution des différends',
    s21Body:
      "En cas de différend, les parties tenteront d'abord une résolution par négociation directe dans les trente (30) jours. Si non résolu, les parties soumettront le différend à la médiation par un médiateur québécois accrédité choisi par accord mutuel dans les quinze (15) jours. La médiation se conclura dans les soixante (60) jours, les coûts étant partagés également. Si la médiation échoue, l'une ou l'autre des parties peut entamer une procédure judiciaire dans le district où se trouve le Site du Projet.",
    s22Title: "22. Personnel de l'entrepreneur",
    s22Body:
      "L'Entrepreneur doit fournir un personnel qualifié et correctement formé pour l'exécution des Travaux. L'Entrepreneur reste seul responsable de ses employés, sous-traitants et agents, y compris de toutes les retenues salariales et cotisations applicables.",
    s23Title: '23. Santé et sécurité',
    s23Body:
      "L'Entrepreneur se conformera à toutes les réglementations en matière de santé et de sécurité applicables en vertu du droit québécois et des normes de la CNESST, assurera un environnement de travail sécuritaire et signalera tout incident dans les vingt-quatre (24) heures. Dans l'éventualité où l'Entrepreneur identifie une condition sur le chantier présentant un risque immédiat ou grave, l'Entrepreneur avisera le Client par écrit sans délai. Si le Client ne répond pas ou ne met pas en œuvre les mesures correctives dans les quarante-huit (48) heures, l'Entrepreneur peut suspendre la portion affectée des Travaux sans pénalité jusqu'à ce que la condition soit remédiée.",
    s24Title: '24. Conformité environnementale',
    s24Body:
      "L'Entrepreneur exécutera les Travaux en conformité avec toutes les lois et réglementations environnementales applicables. Tout dommage environnemental causé par l'Entrepreneur devra être promptement remédié à ses seuls frais.",
    s25Title: '25. Indemnisation',
    s25Body:
      "Chaque partie s'engage à indemniser et à dégager de toute responsabilité l'autre partie contre les réclamations, dommages, pertes et dépenses résultant directement de la faute ou de la négligence de la partie indemnisante dans l'exécution de ses obligations en vertu du présent Contrat, y compris les blessures corporelles, la maladie, le décès ou les dommages matériels, sauf dans la mesure couverte par un régime d'assurance gouvernemental tel que la CNESST. Cette indemnité est sujette aux articles 1474 et 1475 C.c.Q. La responsabilité de l'Entrepreneur ne dépassera pas le Prix du contrat, sauf en cas de négligence grave ou de faute lourde. Les obligations d'indemnisation survivent à la résiliation.",
    s26Title: '26. Avis',
    s26Body:
      "Tous les avis seront donnés par écrit et livrés en personne, par courriel ou par courrier recommandé aux adresses indiquées ci-dessus. Les avis livrés en mains propres ou par courriel sont réputés reçus à la date de transmission (ou le jour ouvrable suivant si après 16 h 30). Les avis livrés par courrier recommandé sont réputés reçus le jour ouvrable suivant la livraison.",
    s27Title: '27. Sous-traitance et responsabilité des paiements',
    s27Body:
      "L'Entrepreneur peut sous-traiter toute partie des Travaux, à condition que le sous-traitant soit dûment licencié, dispose d'une assurance et d'une inscription CNESST adéquates, et démontre l'expérience requise. L'Entrepreneur demeure entièrement responsable envers le Client de tous les Travaux, y compris ceux exécutés par les sous-traitants. L'Entrepreneur s'assurera que tous les sous-traitants et fournisseurs sont payés intégralement et à temps, et fera radier toute hypothèque légale inscrite contre la propriété du Client dans les dix (10) jours ouvrables, à défaut de quoi le Client peut appliquer la Retenue pour payer la partie impayée.",
    s28Title: '28. Nettoyage',
    s28Body:
      "L'Entrepreneur maintiendra un chantier propre et ordonné et enlèvera tous les débris, matériaux de déchets et outils à l'achèvement des Travaux ou selon les directives du Client.",
    s29Title: '29. Acceptation des travaux',
    s29Body: (inspectionDays: number) =>
      `Les Travaux seront considérés comme acceptés sur inspection par le Client et confirmation écrite, ou en l'absence de tout rapport de déficience dans les ${inspectionDays} jours suivant l'achèvement, à condition que l'Entrepreneur ait donné un avis écrit d'achèvement.`,
    s30Title: '30. Correction des déficiences',
    s30Body:
      "Si des déficiences sont découvertes, l'Entrepreneur les corrigera dans les dix (10) jours ouvrables sans coût supplémentaire. À défaut, le Client peut rectifier le problème et déduire les coûts raisonnables des montants dus.",
    s31Title: '31. Propriété intellectuelle',
    s31Body:
      "Tous les droits de propriété intellectuelle dans les conceptions, plans, dessins et autres documents créés par l'Entrepreneur (le « Produit du travail ») seront cédés au Client lors du paiement intégral, sous réserve des droits moraux qui ne peuvent être cédés en vertu du droit québécois. Jusqu'au paiement intégral, l'Entrepreneur accorde au Client une licence non exclusive, perpétuelle et libre de redevances pour utiliser le Produit du travail à toute fin liée au Projet. L'Entrepreneur garantit que le Produit du travail ne porte pas atteinte aux droits de tiers et indemnisera le Client contre toute réclamation directe résultant d'une violation de cette garantie.",
    s32Title: '32. Suspension des travaux',
    s32Body: (adjustDays: number, terminateDays: number, resumeDays: number) =>
      `Le Client peut suspendre les Travaux en tout ou en partie. Si la suspension dépasse ${adjustDays} jours civils, l'Entrepreneur peut demander un ajustement du calendrier ou du prix du contrat, ou si elle dépasse ${terminateDays} jours sans reprise, résilier le Contrat sans pénalité. Toute réclamation doit être soumise dans les ${resumeDays} jours suivant la reprise ou la résiliation.`,
    s33Title: '33. Renonciation',
    s33Body:
      "Aucune renonciation à un manquement ne constitue une renonciation à un autre; toutes les renonciations doivent être écrites.",
    s34Title: '34. Divisibilité',
    s34Body:
      "Si une disposition est jugée invalide ou inapplicable, elle sera dissociée et le reste du Contrat demeurera en vigueur.",
    s35Title: '35. Exemplaires',
    s35Body:
      "Le présent Contrat peut être signé en exemplaires, chacun étant réputé original et constituant ensemble le même instrument.",
    s36Title: '36. Signature électronique',
    s36Body:
      "Les parties conviennent que le présent Contrat peut être signé électroniquement et que de telles signatures électroniques auront la même force et le même effet que les signatures originales.",
    s37Title: '37. Non-exclusivité',
    s37Body:
      "Le présent Contrat est non exclusif. L'Entrepreneur peut conclure des ententes avec d'autres parties pour des travaux similaires, sous réserve qu'ils ne soient pas en conflit avec ses obligations au titre du présent Contrat.",
    s38Title: "38. Ordre de préséance",
    s38Body:
      "En cas d'incompatibilité entre les documents faisant partie du présent Contrat, l'ordre de préséance suivant s'applique : (a) les Ordres de modification dûment signés; (b) le présent Contrat et ses annexes; (c) les plans et devis relatifs aux Travaux; (d) tout autre document identifié par les parties.",
    s39Title: "39. Intégralité de l'entente",
    s39Body:
      "Le présent document, y compris ses annexes, représente l'entente complète entre les parties et remplace toutes discussions, représentations ou ententes antérieures, qu'elles soient écrites ou verbales.",
    s40Title: '40. Survie',
    s40Body:
      "Les dispositions suivantes survivent à la résiliation : (a) Indemnisation; (b) Confidentialité; (c) Obligations de paiement accumulées avant la résiliation; (d) Résolution des différends; (e) Garantie; (f) Assurances; (g) Propriété intellectuelle.",
    s41Title: '41. Langue',
    s41Body:
      "Les parties conviennent expressément que le présent contrat soit rédigé en français. The parties expressly agree that this Agreement be drawn up in French. An English version will also be available.",
    s42Title: '42. Dispositions additionnelles',
    s42Default: 'S/O',
    signatureTitle: 'Signatures',
    clientSig: 'Client (Propriétaire)',
    contractorSig: 'Entrepreneur',
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
      contractor: 'Entrepreneur',
      client: 'Client (Propriétaire)',
      shared: 'Partagé entre les parties',
    },
    gstLabel: 'TPS (GST) 5 %',
    qstLabel: 'TVQ (QST) 9,975 %',
    totalLabel: 'Total (taxes incluses)',
    subtotalLabel: 'Sous-total',
  },
} as const

export function CCDocument({
  contract,
  profile: _profile,
  language,
  logoUrl,
}: CCDocumentProps) {
  const tr = t[language]
  const meta = (contract.metadata as ContractMetadata | null) ?? ({} as ContractMetadata)

  const clientAddress = joinAddress([
    contract.client_address,
    contract.client_city,
    contract.client_postal,
  ])
  const contractorAddress = joinAddress([
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
          <Text style={styles.bold}>{tr.clientHeading}: </Text>
          {contract.client_name ?? ''}
          {clientAddress ? `\n${clientAddress}` : ''}
          {contract.client_email ? `\n${contract.client_email}` : ''}
          {contract.client_phone ? `\n${contract.client_phone}` : ''}
        </Text>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>{tr.contractorHeading}: </Text>
          {contract.contractor_name ?? ''}
          {contractorAddress ? `\n${contractorAddress}` : ''}
          {contract.contractor_rbq ? `\n${tr.rbq}: ${contract.contractor_rbq}` : ''}
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
              {meta.advance_payment_type === '%'
                ? `${meta.advance_payment_amount}%`
                : formatCurrencyForPdf(meta.advance_payment_amount, language)}
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
        <Text style={styles.paragraph}>
          {tr.s8Body(paymentMethodLabel(meta.payment_method, language))}
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
            {tr.s8Holdback(meta.holdback_pct ?? 10)}
          </Text>
        ) : null}

        {meta.escalation ? (
          <View>
            <Text style={styles.sectionHeading}>{tr.s9Title}</Text>
            <Text style={styles.paragraph}>
              {tr.s9Body(meta.escalation_pct ?? 10)}
            </Text>
          </View>
        ) : null}

        <Text style={styles.sectionHeading}>{tr.s10Title}</Text>
        <Text style={styles.paragraph}>{tr.s10Body}</Text>

        {meta.recovery_penalty ? (
          <View>
            <Text style={styles.sectionHeading}>{tr.s11Title}</Text>
            <Text style={styles.paragraph}>{tr.s11Body}</Text>
          </View>
        ) : null}

        <Text style={styles.sectionHeading}>{tr.s12Title}</Text>
        <Text style={styles.paragraph}>
          {tr.s12Body(meta.warranty_months ?? 12)}
        </Text>

        <Text style={styles.sectionHeading}>{tr.s13Title}</Text>
        <Text style={styles.paragraph}>
          {tr.s13Insurance(meta.insurance_amount ?? 2000000)}
        </Text>
        {meta.bond ? (
          <Text style={styles.paragraph}>
            {tr.s13Bond(meta.bond_pct ?? 50)}
          </Text>
        ) : null}

        <Text style={styles.sectionHeading}>{tr.s14Title}</Text>
        <Text style={styles.paragraph}>{tr.s14Body}</Text>

        <Text style={styles.sectionHeading}>{tr.s15Title}</Text>
        <Text style={styles.paragraph}>{tr.s15Body}</Text>

        <Text style={styles.sectionHeading}>{tr.s16Title}</Text>
        <Text style={styles.paragraph}>{tr.s16Body}</Text>

        <Text style={styles.sectionHeading}>{tr.s17Title}</Text>
        <Text style={styles.paragraph}>{tr.s17Body}</Text>

        <Text style={styles.sectionHeading}>{tr.s18Title}</Text>
        <Text style={styles.paragraph}>{tr.s18Body}</Text>
        <Text style={styles.paragraph}>{tr.s18StepIn}</Text>

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
        <Text style={styles.paragraph}>{tr.s24Body}</Text>

        <Text style={styles.sectionHeading}>{tr.s25Title}</Text>
        <Text style={styles.paragraph}>{tr.s25Body}</Text>

        <Text style={styles.sectionHeading}>{tr.s26Title}</Text>
        <Text style={styles.paragraph}>{tr.s26Body}</Text>

        <Text style={styles.sectionHeading}>{tr.s27Title}</Text>
        <Text style={styles.paragraph}>{tr.s27Body}</Text>

        <Text style={styles.sectionHeading}>{tr.s28Title}</Text>
        <Text style={styles.paragraph}>{tr.s28Body}</Text>

        <Text style={styles.sectionHeading}>{tr.s29Title}</Text>
        <Text style={styles.paragraph}>
          {tr.s29Body(meta.inspection_period_days ?? 30)}
        </Text>

        <Text style={styles.sectionHeading}>{tr.s30Title}</Text>
        <Text style={styles.paragraph}>{tr.s30Body}</Text>

        <Text style={styles.sectionHeading}>{tr.s31Title}</Text>
        <Text style={styles.paragraph}>{tr.s31Body}</Text>

        <Text style={styles.sectionHeading}>{tr.s32Title}</Text>
        <Text style={styles.paragraph}>
          {tr.s32Body(
            meta.suspension_request_adjustment_days ?? 30,
            meta.suspension_terminate_days ?? 60,
            meta.suspension_resume_claim_days ?? 15
          )}
        </Text>

        <Text style={styles.sectionHeading}>{tr.s33Title}</Text>
        <Text style={styles.paragraph}>{tr.s33Body}</Text>

        <Text style={styles.sectionHeading}>{tr.s34Title}</Text>
        <Text style={styles.paragraph}>{tr.s34Body}</Text>

        <Text style={styles.sectionHeading}>{tr.s35Title}</Text>
        <Text style={styles.paragraph}>{tr.s35Body}</Text>

        <Text style={styles.sectionHeading}>{tr.s36Title}</Text>
        <Text style={styles.paragraph}>{tr.s36Body}</Text>

        <Text style={styles.sectionHeading}>{tr.s37Title}</Text>
        <Text style={styles.paragraph}>{tr.s37Body}</Text>

        <Text style={styles.sectionHeading}>{tr.s38Title}</Text>
        <Text style={styles.paragraph}>{tr.s38Body}</Text>

        <Text style={styles.sectionHeading}>{tr.s39Title}</Text>
        <Text style={styles.paragraph}>{tr.s39Body}</Text>

        <Text style={styles.sectionHeading}>{tr.s40Title}</Text>
        <Text style={styles.paragraph}>{tr.s40Body}</Text>

        <Text style={styles.sectionHeading}>{tr.s41Title}</Text>
        <Text style={styles.paragraph}>{tr.s41Body}</Text>

        <Text style={styles.sectionHeading}>{tr.s42Title}</Text>
        <Text style={styles.paragraph}>
          {meta.extra_clauses && meta.extra_clauses.trim().length > 0
            ? meta.extra_clauses
            : tr.s42Default}
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
            <Text style={styles.bold}>{tr.clientSig}</Text>
            <Text style={styles.signatureLabel}>{tr.perLabel}</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>{tr.nameLabel}</Text>
            <View style={[styles.signatureLine, { marginTop: 12 }]} />
            <Text style={styles.signatureLabel}>{tr.titleLabel}</Text>
            <View style={[styles.signatureLine, { marginTop: 12 }]} />
            <Text style={styles.signatureLabel}>{tr.dateLabel}</Text>
          </View>
          <View style={styles.signatureBlock}>
            <Text style={styles.bold}>{tr.contractorSig}</Text>
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
