import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from './shared/services/auth.service';
import { ToastComponent } from './shared/components/common/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterModule,
    ToastComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'Playa Honda';

  constructor(private readonly authService: AuthService) {}

  ngOnInit(): void {
    const savedDir = localStorage.getItem('dir');
    if (savedDir === 'rtl') {
      document.documentElement.setAttribute('dir', 'rtl');
    }

    if (this.authService.getToken()) {
      this.authService.me().subscribe({
        error: () => this.authService.logout(),
      });
    }
  }
}
