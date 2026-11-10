import { Component, OnInit, signal, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular/lazy';

import { ThemeService } from '../../../core/services/theme.service';
import { APP_VERSION } from '../../../core/constants/version';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, IonicModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
  themeService = inject(ThemeService);
  router = inject(Router);

  collapsed = signal(false);
  version = APP_VERSION;

  navItems: NavItem[] = [
    { label: 'Mis Pasos',    icon: 'flame-outline',       route: '/pasos'       },
    { label: 'Costaleros',   icon: 'people-outline',      route: '/costaleros'  },
    { label: 'Ensayos',      icon: 'calendar-outline',    route: '/ensayos'     },
    { label: 'Auxiliares',   icon: 'person-add-outline',  route: '/auxiliares'  },
  ];

  ngOnInit() {
    this.themeService.init();
  }

  toggle() {
    this.collapsed.update(v => !v);
  }

  isActive(route: string): boolean {
    return this.router.isActive(route, {
      paths: 'subset',
      queryParams: 'ignored',
      fragment: 'ignored',
      matrixParams: 'ignored',
    });
  }
}
