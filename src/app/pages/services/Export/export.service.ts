import { Injectable } from '@angular/core';
import { Evaluation } from '../../models/entities/evaluation';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // ✅ Import correct

@Injectable({
  providedIn: 'root'
})
export class ExportService {

    constructor() { }


    /**
     * Exporter une liste d'évaluations au format Excel
     */
    exportToExcel(evaluations: Evaluation[], fileName: string = 'evaluations'): void {
        try {
            // ✅ Remplacer 'eval' par 'item' (car 'eval' est un mot réservé)
            const data = evaluations.map(item => ({
                'Année': item.annee,
                'Collaborateur': item.collaborateurNom || '',
                'Évaluateur': item.evaluateurNom || '',
                'Date entretien': item.dateEntretien ? new Date(item.dateEntretien).toLocaleDateString('fr-FR') : '',
                'Note Objectifs': item.noteGlobaleObjectifs?.toFixed(1) || '-',
                'Note Tenue': item.noteGlobaleTenuePoste?.toFixed(1) || '-',
                'Note Finale': item.noteGlobaleFinale?.toFixed(1) || '-',
                'Statut': this.getStatutLabel(item.statut || ''),
                'Date création': item.dateCreation ? new Date(item.dateCreation).toLocaleDateString('fr-FR') : '',
                'Date validation': item.dateValidation ? new Date(item.dateValidation).toLocaleDateString('fr-FR') : ''
            }));

            // Créer le workbook et la worksheet
            const worksheet = XLSX.utils.json_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Évaluations');

            // Ajuster la largeur des colonnes
            const colWidths = [
                { wch: 10 }, // Année
                { wch: 30 }, // Collaborateur
                { wch: 30 }, // Évaluateur
                { wch: 15 }, // Date entretien
                { wch: 15 }, // Note Objectifs
                { wch: 15 }, // Note Tenue
                { wch: 15 }, // Note Finale
                { wch: 20 }, // Statut
                { wch: 15 }, // Date création
                { wch: 15 }  // Date validation
            ];
            worksheet['!cols'] = colWidths;

            // Générer le fichier Excel
            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            const dataBlob = new Blob([excelBuffer], { type: 'application/octet-stream' });
            const dateStr = new Date().toISOString().slice(0, 10);
            saveAs(dataBlob, `${fileName}_${dateStr}.xlsx`);

            console.log('✅ Export Excel réussi');
        } catch (error) {
            console.error('❌ Erreur export Excel:', error);
        }
    }

    /**
     * Exporter une évaluation individuelle au format PDF
     */
    async exportEvaluationToPDF(evaluation: any, collaborateur: any, evaluateur: any): Promise<void> {
        try {
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const margin = 15;
            let yPos = 20;

            // Titre
            pdf.setFontSize(18);
            pdf.setFont('helvetica', 'bold');
            pdf.text('FICHE D\'ÉVALUATION', pageWidth / 2, yPos, { align: 'center' });
            yPos += 10;

            // Sous-titre
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'normal');
            pdf.text(`Année ${evaluation.annee || ''}`, pageWidth / 2, yPos, { align: 'center' });
            yPos += 15;

            // Informations générales
            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'bold');
            pdf.text('INFORMATIONS GÉNÉRALES', margin, yPos);
            yPos += 7;

            // Ligne de séparation
            pdf.setLineWidth(0.5);
            pdf.line(margin, yPos, pageWidth - margin, yPos);
            yPos += 7;

            // Tableau des informations - ✅ Version corrigée sans columnStyles
            autoTable(pdf, {
                startY: yPos,
                head: [],
                body: [
                    ['Collaborateur', `${collaborateur.prenoms || ''} ${collaborateur.nom || ''} (${collaborateur.matricule || ''})`],
                    ['Poste actuel', collaborateur.posteActuel || '-'],
                    ['Évaluateur', `${evaluateur.prenoms || ''} ${evaluateur.nom || ''}`],
                    ['Date entretien', evaluation.dateEntretien ? new Date(evaluation.dateEntretien).toLocaleDateString('fr-FR') : '-'],
                    ['Statut', this.getStatutLabel(evaluation.statut || '')]
                ],
                theme: 'plain',
                styles: { fontSize: 10 },
                margin: { left: margin, right: margin }
            });

            // Récupérer la position Y après le tableau
            yPos = (pdf as any).lastAutoTable.finalY + 15;

            // Notes
            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'bold');
            pdf.text('NOTES DE L\'ÉVALUATION', margin, yPos);
            yPos += 7;
            pdf.line(margin, yPos, pageWidth - margin, yPos);
            yPos += 7;

            autoTable(pdf, {
                startY: yPos,
                head: [['Critère', 'Note']],
                body: [
                    ['Objectifs', evaluation.noteGlobaleObjectifs ? evaluation.noteGlobaleObjectifs.toFixed(1) + '/10' : '-'],
                    ['Tenue du poste', evaluation.noteGlobaleTenuePoste ? evaluation.noteGlobaleTenuePoste.toFixed(1) + '/10' : '-'],
                    ['NOTE FINALE', evaluation.noteGlobaleFinale ? evaluation.noteGlobaleFinale.toFixed(1) + '/10' : '-']
                ],
                theme: 'striped',
                headStyles: { fillColor: [52, 73, 94], textColor: 255 },
                styles: { fontSize: 10 },
                margin: { left: margin, right: margin }
            });

            yPos = (pdf as any).lastAutoTable.finalY + 15;

            // Objectifs
            if (evaluation.objectifs && evaluation.objectifs.length > 0) {
                pdf.setFontSize(11);
                pdf.setFont('helvetica', 'bold');
                pdf.text('OBJECTIFS', margin, yPos);
                yPos += 7;
                pdf.line(margin, yPos, pageWidth - margin, yPos);
                yPos += 7;

                const objectifsData = evaluation.objectifs.map((obj: any, index: number) => [
                    `Objectif ${index + 1}`,
                    obj.libelle || '-',
                    obj.tauxAtteinte ? obj.tauxAtteinte + '%' : '-',
                    obj.cotation ? obj.cotation + '/10' : '-'
                ]);

                autoTable(pdf, {
                    startY: yPos,
                    head: [['#', 'Libellé', 'Taux', 'Note']],
                    body: objectifsData,
                    theme: 'striped',
                    headStyles: { fillColor: [52, 73, 94], textColor: 255 },
                    styles: { fontSize: 9 },
                    margin: { left: margin, right: margin }
                });

                yPos = (pdf as any).lastAutoTable.finalY + 15;
            }

            // Commentaires
            if (evaluation.commentaireResponsable || evaluation.commentaireCollaborateur) {
                pdf.setFontSize(11);
                pdf.setFont('helvetica', 'bold');
                pdf.text('COMMENTAIRES', margin, yPos);
                yPos += 7;
                pdf.line(margin, yPos, pageWidth - margin, yPos);
                yPos += 7;

                const commentaires = [];
                if (evaluation.commentaireResponsable) {
                    commentaires.push(['Responsable', evaluation.commentaireResponsable]);
                }
                if (evaluation.commentaireCollaborateur) {
                    commentaires.push(['Collaborateur', evaluation.commentaireCollaborateur]);
                }

                if (commentaires.length > 0) {
                    autoTable(pdf, {
                        startY: yPos,
                        head: [['Auteur', 'Commentaire']],
                        body: commentaires,
                        theme: 'striped',
                        headStyles: { fillColor: [52, 73, 94], textColor: 255 },
                        styles: { fontSize: 9 },
                        margin: { left: margin, right: margin }
                    });

                    yPos = (pdf as any).lastAutoTable.finalY + 15;
                }
            }

            // Pied de page
            const pageCount = pdf.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                pdf.setPage(i);
                pdf.setFontSize(8);
                pdf.setTextColor(150);
                pdf.text(
                    `Document généré le ${new Date().toLocaleDateString('fr-FR')} - Page ${i} sur ${pageCount}`,
                    pageWidth / 2,
                    pdf.internal.pageSize.getHeight() - 10,
                    { align: 'center' }
                );
            }

            // Sauvegarder le PDF
            const fileName = `evaluation_${evaluation.collaborateurNom || 'collaborateur'}_${evaluation.annee || new Date().getFullYear()}.pdf`;
            pdf.save(fileName);

            console.log('✅ Export PDF réussi');
        } catch (error) {
            console.error('❌ Erreur export PDF:', error);
        }
    }

    /**
     * Générer un rapport annuel
     */
    async generateAnnualReport(evaluations: Evaluation[], annee: number): Promise<void> {
        console.log('--------------- SERVICE EXPORT ANNUAL -------------')
        try {
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const margin = 15;
            let yPos = 20;

            // Filtrer les évaluations de l'année
            const evaluationsAnnee = evaluations.filter(e => e.annee === annee);
            const evaluationsValidees = evaluationsAnnee.filter(e => e.statut === 'VALIDEE');

            // Calculer les statistiques
            const noteMoyenne = evaluationsValidees.reduce((sum, e) => sum + (e.noteGlobaleFinale || 0), 0) / (evaluationsValidees.length || 1);
            const meilleureNote = Math.max(...evaluationsValidees.map(e => e.noteGlobaleFinale || 0), 0);
            const moinsBonneNote = Math.min(...evaluationsValidees.map(e => e.noteGlobaleFinale || 10), 10);

            // Titre
            pdf.setFontSize(20);
            pdf.setFont('helvetica', 'bold');
            pdf.text(`RAPPORT ANNUEL ${annee}`, pageWidth / 2, yPos, { align: 'center' });
            yPos += 15;

            // Résumé
            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            pdf.text('RÉSUMÉ DES ÉVALUATIONS', margin, yPos);
            yPos += 7;
            pdf.line(margin, yPos, pageWidth - margin, yPos);
            yPos += 10;

            autoTable(pdf, {
                startY: yPos,
                head: [],
                body: [
                    ['Total évaluations', evaluationsAnnee.length.toString()],
                    ['Évaluations validées', evaluationsValidees.length.toString()],
                    ['Note moyenne', noteMoyenne.toFixed(1) + '/10'],
                    ['Meilleure note', meilleureNote.toFixed(1) + '/10'],
                    ['Note la plus faible', moinsBonneNote.toFixed(1) + '/10']
                ],
                theme: 'plain',
                styles: { fontSize: 11 },
                margin: { left: margin, right: margin }
            });

            yPos = (pdf as any).lastAutoTable.finalY + 15;

            // Liste des évaluations
            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            pdf.text('DÉTAIL DES ÉVALUATIONS', margin, yPos);
            yPos += 7;
            pdf.line(margin, yPos, pageWidth - margin, yPos);
            yPos += 7;

            const evaluationsData = evaluationsAnnee.map(e => [
                e.collaborateurNom || '-',
                e.noteGlobaleFinale?.toFixed(1) + '/10' || '-',
                this.getStatutLabel(e.statut || ''),
                e.dateValidation ? new Date(e.dateValidation).toLocaleDateString('fr-FR') : '-'
            ]);

            autoTable(pdf, {
                startY: yPos,
                head: [['Collaborateur', 'Note finale', 'Statut', 'Date validation']],
                body: evaluationsData,
                theme: 'striped',
                headStyles: { fillColor: [52, 73, 94], textColor: 255 },
                styles: { fontSize: 9 },
                margin: { left: margin, right: margin }
            });

            pdf.save(`rapport_annuel_${annee}.pdf`);

            console.log('✅ Rapport annuel généré');
        } catch (error) {
            console.error('❌ Erreur génération rapport:', error);
        }
    }

    /**
     * Obtenir le libellé du statut
     */
    private getStatutLabel(statut: string): string {
        const labels: { [key: string]: string } = {
            'BROUILLON': 'Brouillon',
            'A_APPROUVER': 'À approuver',
            'APPROUVEE': 'Approuvée',
            'A_VALIDER_SERVICE': 'À valider (Service)',
            'A_VALIDER_DIRECTEUR': 'À valider (Directeur)',
            'VALIDEE': 'Validée',
            'REFUSEE': 'Refusée',
            'ANNULEE': 'Annulée'
        };
        return labels[statut] || statut;
    }

    /**
     * Imprimer l'évaluation (version navigateur)
     */
    printEvaluation(evaluation: any, collaborateur: any, evaluateur: any): void {
        try {
            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                console.error('Impossible d\'ouvrir la fenêtre d\'impression');
                return;
            }

            const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Fiche d'évaluation</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 2cm; }
            h1 { text-align: center; color: #333; }
            h2 { color: #444; border-bottom: 2px solid #ddd; padding-bottom: 5px; margin-top: 30px; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th { background-color: #f2f2f2; text-align: left; padding: 8px; }
            td { padding: 8px; border-bottom: 1px solid #ddd; }
            .info-table td:first-child { font-weight: bold; width: 30%; }
            .signature-box { border: 1px solid #ccc; height: 80px; margin: 10px 0; padding: 10px; text-align: center; }
            .footer { margin-top: 50px; font-size: 0.8em; text-align: center; color: #777; }
          </style>
        </head>
        <body>
          <h1>FICHE D'ÉVALUATION</h1>
          <p style="text-align: center;">Année ${evaluation.annee || ''}</p>
          
          <h2>Informations générales</h2>
          <table class="info-table">
            <tr><td>Collaborateur</td><td>${collaborateur.prenoms || ''} ${collaborateur.nom || ''} (${collaborateur.matricule || ''})</td></tr>
            <tr><td>Poste actuel</td><td>${collaborateur.posteActuel || '-'}</td></tr>
            <tr><td>Évaluateur</td><td>${evaluateur.prenoms || ''} ${evaluateur.nom || ''}</td></tr>
            <tr><td>Date entretien</td><td>${evaluation.dateEntretien ? new Date(evaluation.dateEntretien).toLocaleDateString('fr-FR') : '-'}</td></tr>
            <tr><td>Statut</td><td>${this.getStatutLabel(evaluation.statut || '')}</td></tr>
          </table>

          <h2>Notes</h2>
          <table>
            <tr><th>Critère</th><th>Note</th></tr>
            <tr><td>Objectifs</td><td>${evaluation.noteGlobaleObjectifs ? evaluation.noteGlobaleObjectifs.toFixed(1) + '/10' : '-'}</td></tr>
            <tr><td>Tenue du poste</td><td>${evaluation.noteGlobaleTenuePoste ? evaluation.noteGlobaleTenuePoste.toFixed(1) + '/10' : '-'}</td></tr>
            <tr><td><strong>NOTE FINALE</strong></td><td><strong>${evaluation.noteGlobaleFinale ? evaluation.noteGlobaleFinale.toFixed(1) + '/10' : '-'}</strong></td></tr>
          </table>

          ${evaluation.objectifs && evaluation.objectifs.length > 0 ? `
            <h2>Objectifs</h2>
            <table>
              <tr><th>#</th><th>Libellé</th><th>Taux</th><th>Note</th></tr>
              ${evaluation.objectifs.map((obj: any, index: number) => `
                <tr>
                  <td>Objectif ${index + 1}</td>
                  <td>${obj.libelle || '-'}</td>
                  <td>${obj.tauxAtteinte ? obj.tauxAtteinte + '%' : '-'}</td>
                  <td>${obj.cotation ? obj.cotation + '/10' : '-'}</td>
                </tr>
              `).join('')}
            </table>
          ` : ''}

          <h2>Signatures</h2>
          <div style="display: flex; justify-content: space-between;">
            <div style="width: 45%;">
              <p><strong>Responsable</strong></p>
             
            </div>
            <div style="width: 45%;">
              <p><strong>Collaborateur</strong></p>
              
            </div>
          </div>

          <div class="footer">
            Document généré le ${new Date().toLocaleDateString('fr-FR')}
          </div>

          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
        </html>
      `;

            printWindow.document.write(html);
            printWindow.document.close();
        } catch (error) {
            console.error('❌ Erreur impression:', error);
        }
    }


    // Dans export.service.ts - Ajouter ces méthodes

    /**
     * Exporter les évaluations de l'utilisateur connecté par année
     */
    exportUserEvaluationsByYear(evaluations: Evaluation[], userId: number, annee: number): void {
        try {
            // Filtrer les évaluations où l'utilisateur est soit évaluateur soit collaborateur
            const userEvaluations = evaluations.filter(e =>
                (e.evaluateurId === userId || e.collaborateurId === userId) &&
                e.annee === annee
            );

            if (userEvaluations.length === 0) {
                console.log('Aucune évaluation trouvée pour cette année');
                return;
            }

            // Préparer les données pour Excel
            const data = userEvaluations.map(item => ({
                'Année': item.annee,
                'Collaborateur': item.collaborateurNom || '',
                'Évaluateur': item.evaluateurNom || '',
                'Rôle': item.evaluateurId === userId ? 'Évaluateur' : 'Évalué',
                'Date entretien': item.dateEntretien ? new Date(item.dateEntretien).toLocaleDateString('fr-FR') : '',
                'Note Objectifs': item.noteGlobaleObjectifs?.toFixed(1) || '-',
                'Note Tenue': item.noteGlobaleTenuePoste?.toFixed(1) || '-',
                'Note Finale': item.noteGlobaleFinale?.toFixed(1) || '-',
                'Statut': this.getStatutLabel(item.statut || ''),
                'Date validation': item.dateValidation ? new Date(item.dateValidation).toLocaleDateString('fr-FR') : ''
            }));

            // Créer le fichier Excel
            const worksheet = XLSX.utils.json_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Mes évaluations');

            // Ajuster la largeur des colonnes
            const colWidths = [
                { wch: 10 }, { wch: 30 }, { wch: 30 }, { wch: 15 },
                { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
                { wch: 20 }, { wch: 15 }
            ];
            worksheet['!cols'] = colWidths;

            // Générer le fichier
            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            const dataBlob = new Blob([excelBuffer], { type: 'application/octet-stream' });
            const dateStr = new Date().toISOString().slice(0, 10);
            saveAs(dataBlob, `mes_evaluations_${annee}_${dateStr}.xlsx`);

            console.log(`✅ Export de ${userEvaluations.length} évaluations pour ${annee}`);
        } catch (error) {
            console.error('❌ Erreur export:', error);
        }
    }

    /**
     * Générer un PDF récapitulatif des évaluations de l'utilisateur par année
     */
    async generateUserAnnualReport(evaluations: Evaluation[], userId: number, annee: number): Promise<void> {
        try {
            // Filtrer les évaluations de l'utilisateur pour l'année
            const userEvaluations = evaluations.filter(e =>
                (e.evaluateurId === userId || e.collaborateurId === userId) &&
                e.annee === annee
            );

            if (userEvaluations.length === 0) {
                console.log('Aucune évaluation trouvée pour cette année');
                return;
            }

            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const margin = 15;
            let yPos = 20;

            // Titre
            pdf.setFontSize(18);
            pdf.setFont('helvetica', 'bold');
            pdf.text('MON RAPPORT ANNUEL', pageWidth / 2, yPos, { align: 'center' });
            yPos += 10;

            // Année
            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'normal');
            pdf.text(`Année ${annee}`, pageWidth / 2, yPos, { align: 'center' });
            yPos += 15;

            // Informations utilisateur
            const userName = evaluations.find(e => e.evaluateurId === userId)?.evaluateurNom ||
                evaluations.find(e => e.collaborateurId === userId)?.collaborateurNom ||
                'Utilisateur';

            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'bold');
            pdf.text('INFORMATIONS', margin, yPos);
            yPos += 7;
            pdf.line(margin, yPos, pageWidth - margin, yPos);
            yPos += 7;

            autoTable(pdf, {
                startY: yPos,
                head: [],
                body: [
                    ['Utilisateur', userName],
                    ['Total évaluations', userEvaluations.length.toString()],
                    ['Comme évaluateur', userEvaluations.filter(e => e.evaluateurId === userId).length.toString()],
                    ['Comme évalué', userEvaluations.filter(e => e.collaborateurId === userId).length.toString()]
                ],
                theme: 'plain',
                styles: { fontSize: 10 },
                margin: { left: margin, right: margin }
            });

            yPos = (pdf as any).lastAutoTable.finalY + 15;

            // Statistiques
            const evalValidees = userEvaluations.filter(e => e.statut === 'VALIDEE');
            const noteMoyenne = evalValidees.reduce((sum, e) => sum + (e.noteGlobaleFinale || 0), 0) / (evalValidees.length || 1);

            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'bold');
            pdf.text('STATISTIQUES', margin, yPos);
            yPos += 7;
            pdf.line(margin, yPos, pageWidth - margin, yPos);
            yPos += 7;

            autoTable(pdf, {
                startY: yPos,
                head: [],
                body: [
                    ['Évaluations validées', evalValidees.length.toString()],
                    ['Note moyenne', noteMoyenne.toFixed(1) + '/10'],
                    ['Meilleure note', Math.max(...evalValidees.map(e => e.noteGlobaleFinale || 0)).toFixed(1) + '/10'],
                    ['Note la plus faible', Math.min(...evalValidees.map(e => e.noteGlobaleFinale || 10)).toFixed(1) + '/10']
                ],
                theme: 'plain',
                styles: { fontSize: 10 },
                margin: { left: margin, right: margin }
            });

            yPos = (pdf as any).lastAutoTable.finalY + 15;

            // Liste des évaluations
            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'bold');
            pdf.text('DÉTAIL DES ÉVALUATIONS', margin, yPos);
            yPos += 7;
            pdf.line(margin, yPos, pageWidth - margin, yPos);
            yPos += 7;

            const evaluationsData = userEvaluations.map(e => [
                e.collaborateurNom || '-',
                e.evaluateurNom || '-',
                e.noteGlobaleFinale?.toFixed(1) + '/10' || '-',
                this.getStatutLabel(e.statut || ''),
                e.dateValidation ? new Date(e.dateValidation).toLocaleDateString('fr-FR') : '-'
            ]);

            autoTable(pdf, {
                startY: yPos,
                head: [['Collaborateur', 'Évaluateur', 'Note', 'Statut', 'Date']],
                body: evaluationsData,
                theme: 'striped',
                headStyles: { fillColor: [52, 73, 94], textColor: 255 },
                styles: { fontSize: 8 },
                margin: { left: margin, right: margin }
            });

            // Sauvegarder
            pdf.save(`mon_rapport_${annee}.pdf`);

            console.log('✅ Rapport personnel généré');
        } catch (error) {
            console.error('❌ Erreur génération rapport:', error);
        }
    }



}
