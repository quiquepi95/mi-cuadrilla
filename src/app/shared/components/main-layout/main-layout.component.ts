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
        /* barra superior fija (60 px) + barra de estado de Android; abajo, la barra de gestos */
        padding-top: calc(64px + env(safe-area-inset-top, 0px));
        padding-bottom: env(safe-area-inset-bottom, 0px);
      }
    }
  `],
})
export class MainLayoutComponent {}
