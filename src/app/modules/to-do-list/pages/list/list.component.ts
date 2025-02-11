import { Component, signal } from '@angular/core';
import { InputAddItemComponent } from '../../../components/input-add-item/input-add-item.component';
import { IListItem } from '../../../interfaces/IListItem.interface';
import { InputListItemComponent } from '../../../components/input-list-item/input-list-item.component';
import { ELocalStorage } from '../../../enum/ELocalStorage.enum';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [InputAddItemComponent, InputListItemComponent],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
})
export class ListComponent {
  public addItem = signal(true);

  #setListItens = signal<IListItem[]>(this.#parseItens());
  public getListItens = this.#setListItens.asReadonly();

  #parseItens() {
    return JSON.parse(localStorage.getItem(ELocalStorage.MY_LIST) || '[]');
  }

  #updateLocalStorage() {
    localStorage.setItem(
      ELocalStorage.MY_LIST,
      JSON.stringify(this.#setListItens())
    );
  }

  public getInputAndAddItem(value: IListItem) {
    localStorage.setItem(
      ELocalStorage.MY_LIST,
      JSON.stringify([...this.#setListItens(), value])
    );

    return this.#setListItens.set(this.#parseItens());
  }

  public listItensStage(value: 'pending' | 'completed') {
    return this.getListItens().filter((res: IListItem) => {
      if (value === 'pending') {
        return !res.checked;
      }

      if (value === 'completed') {
        return res.checked;
      }

      return res;
    });
  }

  public updateItemCheckbox(newItem: { id: string; checked: boolean }) {
    this.#setListItens.update((oldvalue: IListItem[]) => {
      return oldvalue.map((res) => {
        if (res.id === newItem.id) {
          return { ...res, checked: newItem.checked };
        }
        return res;
      });
    });

    this.#updateLocalStorage();
  }

  public updateItemText(newItem: { id: string; value: string }) {
    this.#setListItens.update((oldvalue: IListItem[]) => {
      return oldvalue.map((res) => {
        if (res.id === newItem.id) {
          return { ...res, value: newItem.value };
        }
        return res;
      });
    });

    this.#updateLocalStorage();
  }

  public deleteItem(id: string) {
    Swal.fire({
      title: 'Tem certeza?',
      text: 'Você não poderá reverter a exclusão!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, delete o item',
    }).then((result) => {
      if (result.isConfirmed) {
        this.#setListItens.update((oldValue: IListItem[]) => {
          return oldValue.filter((res) => res.id !== id);
        });

        this.#updateLocalStorage();
      }
    });
  }

  public deleteAllItens() {
    Swal.fire({
      title: 'Tem certeza?',
      text: 'Você não poderá reverter a exclusão!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, deletar tudo',
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem(ELocalStorage.MY_LIST);
        return this.#setListItens.set(this.#parseItens());
      }
    });
  }
}
