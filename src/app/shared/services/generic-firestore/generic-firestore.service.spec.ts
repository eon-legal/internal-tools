import { TestBed } from '@angular/core/testing';
import { Firestore } from '@angular/fire/firestore';
import {
  addDoc,
  collection,
  collectionData,
  updateDoc,
  deleteDoc,
  doc,
} from '@angular/fire/firestore';
import { of } from 'rxjs';
import { SecondForm } from '../../../modules/invoices/interfaces/second-form';
import { GenericFirestoreService } from './generic-firestore.service';

jest.mock('@angular/fire/firestore');

describe('GenericFirestoreService', () => {
  let service: GenericFirestoreService<SecondForm>;
  let firestore: Firestore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        GenericFirestoreService,
        { provide: Firestore, useValue: {} },
      ],
    });

    service = TestBed.inject(GenericFirestoreService);
    firestore = TestBed.inject(Firestore);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('addItem', () => {
    it('should call addDoc with the correct arguments', async () => {
      const item: SecondForm = {
        nameDestination: '1',
        accountDestination: '1',
        addressDestination: '1',
        nameBank: '1',
        addressBank: '1',
        nif: '1',
      };
      const itemsRefMock = collection(firestore, 'addressee');

      (addDoc as jest.Mock).mockResolvedValue(Promise.resolve());

      await service.add('addressee', item);
      expect(addDoc).toHaveBeenCalledWith(itemsRefMock, item);
    });
  });

  describe('getItems', () => {
    it('should return an observable of addressee', () => {
      const itemsRefMock = collection(firestore, 'addressee');
      const mockItems = [
        {
          id: '1',
          nameDestination: '1',
          accountDestination: '1',
          addressDestination: '1',
          nameBank: '1',
          addressBank: '1',
          nif: '1',
        },
      ];

      (collectionData as jest.Mock).mockReturnValue(of(mockItems));

      service.getAll('addressee').subscribe((addressee) => {
        expect(addressee).toEqual(mockItems);
      });
      expect(collectionData).toHaveBeenCalledWith(itemsRefMock, {
        idField: 'id',
      });
    });
  });

  describe('updateItem', () => {
    it('should call updateDoc with the correct arguments', async () => {
      const item: SecondForm = {
        id: '1',
        nameDestination: '1',
        accountDestination: '1',
        addressDestination: '1',
        nameBank: '1',
        addressBank: '1',
        nif: '1',
      };
      const itemDocRefMock = doc(firestore, `addressee/${item.id}`); // Usar backticks aquí

      (updateDoc as jest.Mock).mockResolvedValue(Promise.resolve());

      await service.update('addressee', item);
      expect(updateDoc).toHaveBeenCalledWith(itemDocRefMock, {
        nameDestination: item.nameDestination,
        accountDestination: item.accountDestination,

        addressDestination: item.addressDestination,
        nameBank: item.nameBank,
        addressBank: item.addressBank,
        nif: item.nif,
      });
    });
  });

  describe('deleteItem', () => {
    it('should call deleteDoc with the correct arguments', async () => {
      const item = {
        id: '1',
        nameDestination: '1',
        accountDestination: '1',
        addressDestination: '1',
        nameBank: '1',
        addressBank: '1',
        nif: '1',
      };
      const itemDocRefMock = doc(firestore, `addressee/${item.id}`); // Usar backticks aquí

      (deleteDoc as jest.Mock).mockResolvedValue(Promise.resolve());

      await service.delete('addressee', item.id);
      expect(deleteDoc).toHaveBeenCalledWith(itemDocRefMock);
    });
  });
});
