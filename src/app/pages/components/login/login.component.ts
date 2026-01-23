import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import {LoginService} from '../../services/login/login.service';
import {Utilisateur} from '../../models/entities/entities';
import {MessageService} from 'primeng/api';
import {BehaviorSubject} from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {


    loading = false;
    currentUserName = '';
    private _user = new BehaviorSubject<any>(null);
    user$ = this._user.asObservable();
    utilisateur?: Utilisateur = {};
    constructor(
        private authService: LoginService,
        private messageService: MessageService,
        private router: Router) {}
  ngOnInit(): void {

  }

    successAlert(): void {
        this.messageService.add({severity: 'success', summary: 'Opération réussie!'});
    }
    login() {
        this.authService.login(this.utilisateur.username, this.utilisateur.password)
            .subscribe({
                next: (res) => {
                    console.log('✅ Login réussi', res);
                    localStorage.setItem('username', res.user.username);
                    this.currentUserName = res.user.username; // ou prenom, selon ce que tu veux
                    // Si tu veux, mettre à jour les variables globales
                    this.authService.setUser(res.user);
                    this.successAlert();
                    this.router.navigate(['/parametre/services']);
                },
                error: (err) => {
                    console.error('Erreur login', err);
                    alert('Identifiants incorrects');
                }
            });
    }
}
