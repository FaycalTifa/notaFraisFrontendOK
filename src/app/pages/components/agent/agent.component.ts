import { Component, OnInit } from '@angular/core';
import {Agent, Section} from '../../models/entities/entities';
import {AgentService} from '../../services/agentService/agent.service';
import {SectionService} from '../../services/Section/section.service';
import {ConfirmationService, MessageService} from 'primeng/api';

@Component({
  selector: 'app-agent',
  templateUrl: './agent.component.html',
  styleUrls: ['./agent.component.scss']
})
export class AgentComponent implements OnInit {

    agents: Agent[] = [];
    sections: Section[] = [];
    displayDialog = false;
    displayEditDialog = false;
    selectedAgent: Agent = {};
    newAgent: Agent = {};

    constructor(
        private agentService: AgentService,
        private sectionService: SectionService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) { }

    ngOnInit(): void {
        this.loadAgents();
        this.loadSections();
    }

    loadAgents(): void {
        this.agentService.getAllAgents().subscribe(
            (agents) => {
                this.agents = agents;
                console.log('=== AGENTS CHARGÉS ===');
                console.log('Nombre d\'agents:', agents.length);

                // Analyse détaillée du premier agent
                if (agents.length > 0) {
                    const firstAgent = agents[0];
                    console.log('Premier agent:', firstAgent);
                    console.log('Section:', firstAgent.section);
                    console.log('Service:', firstAgent.section?.service);
                    console.log('Direction:', firstAgent.section?.service?.direction);

                    // Vérifiez si les libellés sont présents
                    if (firstAgent.section) {
                        console.log('Section libelle:', firstAgent.section.libelle);
                    }
                    if (firstAgent.section?.service) {
                        console.log('Service libelle:', firstAgent.section.service.libelle);
                    }
                    if (firstAgent.section?.service?.direction) {
                        console.log('Direction libelle:', firstAgent.section.service.direction.libelle);
                    }
                }
            },
            (error) => {
                console.error('Erreur:', error);
            }
        );
    }

    loadSections(): void {
        this.sectionService.getAllSections().subscribe(
            (sections) => {
                this.sections = sections;
                console.log('Sections chargées:', sections);
            },
            (error) => {
                console.error('Erreur chargement sections:', error);
            }
        );
    }

    // Méthodes utilitaires pour l'affichage
    getSectionLibelle(agent: Agent): string {
        if (agent.section && agent.section.libelle) {
            return agent.section.libelle;
        }
        return 'Non assigné';
    }

    getServiceLibelle(agent: Agent): string {
        if (agent.section && agent.section.service && agent.section.service.libelle) {
            return agent.section.service.libelle;
        }
        return 'Non assigné';
    }

    getDirectionLibelle(agent: Agent): string {
        if (agent.section && agent.section.service && agent.section.service.direction && agent.section.service.direction.libelle) {
            return agent.section.service.direction.libelle;
        }
        return 'NON assignée';
    }

    showAddDialog(): void {
        this.newAgent = {};
        this.displayDialog = true;
    }

    showEditDialog(agent: Agent): void {
        this.selectedAgent = { ...agent };
        this.displayEditDialog = true;
    }

    hideDialog(): void {
        this.displayDialog = false;
        this.displayEditDialog = false;
    }

    createAgent(): void {
        // CORRECTION : Log pour debug
        console.log('Création agent - Données:', this.newAgent);

        // Assurez-vous que sectionId est bien envoyé
        if (!this.newAgent.sectionId) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Attention',
                detail: 'Veuillez sélectionner une section'
            });
            return;
        }

        this.agentService.createAgent(this.newAgent).subscribe(
            (agent) => {
                console.log('Agent créé avec succès:', agent);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: 'Agent créé avec succès'
                });
                this.loadAgents();
                this.hideDialog();
            },
            (error) => {
                console.error('Erreur création agent:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Erreur lors de la création: ' + error.message
                });
            }
        );
    }

    updateAgent(): void {
        if (this.selectedAgent.id) {
            this.agentService.updateAgent(this.selectedAgent.id, this.selectedAgent).subscribe(
                (agent) => {
                    this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Agent modifié avec succès' });
                    this.loadAgents();
                    this.hideDialog();
                },
                (error) => {
                    this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Erreur lors de la modification' });
                }
            );
        }
    }

    confirmDelete(agent: Agent): void {
        this.confirmationService.confirm({
            message: `Êtes-vous sûr de vouloir supprimer l'agent ${agent.code} ${agent.libelle} ?`,
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                if (agent.id) {
                    this.deleteAgent(agent.id);
                }
            }
        });
    }

    deleteAgent(id: number): void {
        this.agentService.deleteAgent(id).subscribe(
            () => {
                this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Agent supprimé avec succès' });
                this.loadAgents();
            },
            (error) => {
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Erreur lors de la suppression' });
            }
        );
    }

}
