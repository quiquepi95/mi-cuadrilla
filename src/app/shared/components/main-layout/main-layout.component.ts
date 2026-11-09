import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular/lazy';

import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterModule, IonicModule, SidebarComponent],
  template: `
    <div class="app-layout">
      <app-sidebar></app-sidebar>
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-layout {
      display: flex;
      height: 100vh;
      width: 100%;
      overflow: hidden;
      background: var(--mc-bg);
    }
    .main-content {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      background: var(--mc-bg);
    }
    @media (max-width: 768px) {
      .app-layout {
        flex-direction: column;
      }
      .main-content {
        padding-top: 64px;
      }
    }
  `],
})
export class MainLayoutComponent {}
