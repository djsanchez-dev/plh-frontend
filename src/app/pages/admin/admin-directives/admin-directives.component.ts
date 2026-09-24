import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AdminUsersService } from '../../../shared/services/admin-users.service';
import { AdminPerson, BOARD_POSITION_LABELS, BoardPosition } from '../../../shared/models/admin.models';

@Component({
  selector: 'app-admin-directives',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-directives.component.html',
})
export class AdminDirectivesComponent implements OnInit {
  directives: AdminPerson[] = [];
  loading = false;
  errorMessage = '';

  constructor(
    private readonly adminUsersService: AdminUsersService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadDirectives();
  }

  loadDirectives(): void {
    this.loading = true;
    this.errorMessage = '';
    this.adminUsersService.listDirectives().subscribe({
      next: (directives) => {
        this.directives = [...directives];
        this.loading = false;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'No se pudo cargar la lista de directiva.';
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
    });
  }

  positionLabel(position?: BoardPosition | null): string {
    return position ? BOARD_POSITION_LABELS[position] : '—';
  }
}
