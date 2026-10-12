import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import {
  AlertController,
  IonButton,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { SavedCounter } from '../models/saved-counter';
import { CounterService } from '../services/counter.service';
import { NotificationService } from '../services/notification.service';

type SortMode = 'newest' | 'name' | 'value';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [
    DatePipe,
    IonButton,
    IonContent,
    IonHeader,
    IonItem,
    IonLabel,
    IonList,
    IonNote,
    IonSearchbar,
    IonSelect,
    IonSelectOption,
    IonSpinner,
    IonTitle,
    IonToolbar,
  ],
})
export class Tab2Page implements OnInit {
  readonly counterService = inject(CounterService);
  private readonly alertController = inject(AlertController);
  private readonly notifications = inject(NotificationService);

  readonly searchTerm = signal('');
  readonly sortBy = signal<SortMode>('newest');

  /** Bonus: součet hodnot všech uložených počítadel. */
  readonly total = computed(() =>
    this.counterService.counters().reduce((sum, c) => sum + c.value, 0),
  );

  /** Varianta B: minimum a maximum uložených hodnot. */
  readonly minMax = computed(() => {
    const values = this.counterService.counters().map((c) => c.value);
    return values.length === 0
      ? null
      : { min: Math.min(...values), max: Math.max(...values) };
  });

  /** Bonus: vyhledávání podle názvu a řazení. */
  readonly visibleCounters = computed(() => {
    const term = this.searchTerm().trim().toLocaleLowerCase('cs');
    const list = this.counterService
      .counters()
      .filter((c) => c.name.toLocaleLowerCase('cs').includes(term));

    switch (this.sortBy()) {
      case 'name':
        return [...list].sort((a, b) => a.name.localeCompare(b.name, 'cs'));
      case 'value':
        return [...list].sort((a, b) => b.value - a.value);
      default:
        return list;
    }
  });

  async ngOnInit(): Promise<void> {
    await this.counterService.initialize();
  }

  onSearch(event: CustomEvent): void {
    this.searchTerm.set(String(event.detail.value ?? ''));
  }

  onSort(event: CustomEvent): void {
    this.sortBy.set(event.detail.value as SortMode);
  }

  async remove(counter: SavedCounter): Promise<void> {
    await this.counterService.remove(counter.id);
    await this.notifications.show(`Záznam „${counter.name}“ byl odstraněn.`, 'medium');
  }

  /** Bonus: potvrzení před smazáním celé historie. */
  async confirmClear(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Vymazat historii?',
      message: 'Tím se odstraní všechny uložené záznamy.',
      buttons: [
        { text: 'Zrušit', role: 'cancel' },
        { text: 'Vymazat', role: 'confirm' },
      ],
    });
    await alert.present();

    const { role } = await alert.onDidDismiss();
    if (role === 'confirm') {
      await this.counterService.clear();
      await this.notifications.show('Historie byla vymazána.', 'medium');
    }
  }
}