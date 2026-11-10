import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { MainLayoutComponent } from './shared/components/main-layout/main-layout.component';

const routes: Routes = [
  // Redirigir raíz a pasos
  { path: '', redirectTo: 'pasos', pathMatch: 'full' },

  // Layout principal con sidebar
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: 'pasos',
        loadComponent: () => import('./features/pasos/pages/lista-pasos/lista-pasos.page').then(m => m.ListaPasosPage),
      },
      {
        path: 'pasos/nuevo',
        loadComponent: () => import('./features/pasos/pages/nuevo-paso/nuevo-paso.page').then(m => m.NuevoPasoPage),
      },
      {
        path: 'pasos/:id',
        loadComponent: () => import('./features/pasos/pages/detalle-paso/detalle-paso.page').then(m => m.DetallePasoPage),
      },
      {
        path: 'pasos/:id/editar',
        loadComponent: () => import('./features/pasos/pages/editar-paso/editar-paso.page').then(m => m.EditarPasoPage),
      },
      {
        path: 'pasos/:pasoId/relevos/:id',
        loadComponent: () => import('./features/relevos/pages/editor-relevo/editor-relevo.page').then(m => m.EditorRelevoPage),
      },
      {
        path: 'pasos/:pasoId/ensayos/nuevo',
        loadComponent: () => import('./features/ensayos/pages/formulario-ensayo/formulario-ensayo.page').then(m => m.FormularioEnsayoPage),
      },
      {
        path: 'pasos/:pasoId/ensayos/:id/editar',
        loadComponent: () => import('./features/ensayos/pages/formulario-ensayo/formulario-ensayo.page').then(m => m.FormularioEnsayoPage),
      },
      {
        path: 'ensayos',
        loadComponent: () => import('./features/ensayos/pages/lista-ensayos/lista-ensayos.page').then(m => m.ListaEnsayosPage),
      },
      {
        path: 'ensayos/:id/lista',
        loadComponent: () => import('./features/ensayos/pages/pase-lista/pase-lista.page').then(m => m.PaseListaPage),
      },
      {
        path: 'costaleros',
        loadComponent: () => import('./features/costaleros/pages/lista-costaleros/lista-costaleros.page').then(m => m.ListaCostalerosPage),
      },
      {
        path: 'costaleros/:id/editar',
        loadComponent: () => import('./features/costaleros/pages/editar-costalero/editar-costalero.page').then(m => m.EditarCostaleroPage),
      },
      {
        path: 'pasos/:pasoId/costaleros/nuevo',
        loadComponent: () => import('./features/costaleros/pages/nuevo-costalero/nuevo-costalero.page').then(m => m.NuevoCostaleroPage),
      },
      {
        path: 'pasos/:pasoId/costaleros/:id',
        loadComponent: () => import('./features/costaleros/pages/detalle-costalero/detalle-costalero.page').then(m => m.DetalleCostaleroPage),
      },
      { path: 'auxiliares',   redirectTo: 'pasos', pathMatch: 'full' },
    ],
  },

  // Fallback
  { path: '**', redirectTo: 'pasos' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
