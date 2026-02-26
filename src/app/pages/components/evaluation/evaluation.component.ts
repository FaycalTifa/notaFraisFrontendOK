import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { Evaluation } from '../../models/entities/evaluation';

@Component({
  selector: 'app-evaluation',
  templateUrl: './evaluation.component.html',
  styleUrls: ['./evaluation.component.scss']
})
export class EvaluationComponent implements OnInit {

    loading = false;
    @ViewChild('dt') table: Table;
    @ViewChild('filter') filter: ElementRef;
    evaluation: Evaluation[] = [];
    displayDialogue = false;
    displayDialogueModification = false;
    displayDialogueDetail = false;
  constructor() { }

  ngOnInit(): void {
  }

}
